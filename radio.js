// radio.js - نظام إدارة بث الراديو والموسيقى للـ Hub

// 1. تعريف مصفوفة الإذاعات المتوفرة بروابطها الآمنة HTTPS
const RADIO_STATIONS = {
    kurdish: {
        name: "فۆلکلۆری کوردی",
        url: "https://dengeqamishlo.stream.laut.fm/dengeqamishlo"
    },
    arabic: {
        name: "إذاعة عربية (طرب)",
        url: ""
    },
    english: {
        name: "إذاعة أجنبية (Lofi)",
        url: ""
    }
};

// 2. دالة لفتح نافذة الراديو المنبثقة وتحديث الأزرار
function openRadioModal() {
    const radioModal = document.getElementById('radio-modal');
    if (radioModal) {
        radioModal.style.display = 'flex';
        updateRadioButtonsUI();
        // دفع حالة إلى التاريخ لدعم أزرار الرجوع في المتصفحات والهواتف
        if (typeof history !== 'undefined' && history.pushState) {
            history.pushState({ view: 'radio' }, '');
        }
    }
}

// 3. دالة لإغلاق نافذة الراديو
function closeRadioModal() {
    const radioModal = document.getElementById('radio-modal');
    if (radioModal) {
        radioModal.style.display = 'none';
    }
}

// 4. دالة تشغيل البث المباشر للإذاعة المختارة
function playRadio(url, id) {
    const audioEl = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-toggle-btn');
    
    if (!audioEl) return;
    if (!url) {
        console.warn("⚠️ لم يتم تحديد رابط لهذه الإذاعة بعد.");
        return;
    }

    // تصفير المصدر الحالي قبل شحن الرابط الجديد لضمان سلاسة التبديل
    audioEl.pause();
    audioEl.src = url;
    audioEl.load();

    audioEl.play().then(() => {
        isMusicPlaying = true;
        currentRadioId = id;

        // إضافة تأثير النبض والتوهج الملوكي على زر الـ SVG الخارجي
        if (musicBtn) {
            musicBtn.classList.add('music-playing');
        }
        
        // حفظ الإعدادات محلياً في جهاز اللاعب لضمان التشغيل التلقائي عند التحديث أو التغليف
        localStorage.setItem('hub_radio_url', url);
        localStorage.setItem('hub_radio_id', id);
        localStorage.setItem('hub_music_enabled', 'true');
        
        updateRadioButtonsUI();
    }).catch(e => {
        console.error("فشل تشغيل بث الراديو الحيي:", e);
        // استخدام نظام التنبيهات المخصص المدمج في واجهتك لحفظ جمالية التصميم
        if (typeof showCustomPopup === 'function') {
            showCustomPopup(currentLang === 'ar' 
                ? "عذراً، فشل الاتصال بالإذاعة حالياً. تأكد من جودة الإنترنت لديك." 
                : "Failed to connect to the radio stream. Please check your connection.");
        }
    });
}

// 5. دالة إيقاف الراديو وقطع الاتصال بالبث كلياً لمنع استهلاك الإنترنت
function stopRadio() {
    const audioEl = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-toggle-btn');
    
    if (audioEl) {
        audioEl.pause();
        audioEl.src = ''; // قطع الرابط تماماً لإيقاف البث في الخلفية فوراً
    }
    
    isMusicPlaying = false;
    currentRadioId = '';
    
    if (musicBtn) {
        musicBtn.classList.remove('music-playing');
    }
    
    localStorage.setItem('hub_music_enabled', 'false');
    updateRadioButtonsUI();
}

// 6. دالة لتحديث المظهر البصري للأزرار داخل النافذة (الزر النشط يصبح بارزاً باللون الذهبي)
function updateRadioButtonsUI() {
    ['kurdish', 'arabic', 'english'].forEach(id => {
        const btn = document.getElementById('btn-radio-' + id);
        if (btn) {
            // إعادة تعيين إلى التصميم الزجاجي الافتراضي النظيف
            btn.classList.remove('radio-active', 'btn-primary');
            btn.classList.add('btn-secondary');
        }
    });

    // إذا كانت هناك إذاعة تعمل حالياً، نبرز زرها
    if (currentRadioId && isMusicPlaying) {
        const activeBtn = document.getElementById('btn-radio-' + currentRadioId);
        if (activeBtn) {
            activeBtn.classList.remove('btn-secondary');
            activeBtn.classList.add('btn-primary', 'radio-active');
        }
    }
}

// 7. نظام الاسترجاع والتشغيل التلقائي الذكي بمجرد تفاعل المستخدم (تخطي قيود المتصفحات والأجهزة)
window.addEventListener('click', () => {
    const savedMusicState = localStorage.getItem('hub_music_enabled');
    const savedRadioUrl = localStorage.getItem('hub_radio_url');
    const savedRadioId = localStorage.getItem('hub_radio_id');
    
    if (savedMusicState === 'true' && savedRadioUrl && !isMusicPlaying) {
        // تأخير بسيط للتأكد من استقرار تهيئة واجهة التطبيق
        setTimeout(() => {
            currentRadioId = savedRadioId;
            playRadio(savedRadioUrl, savedRadioId);
        }, 300);
    }
}, { once: true }); // تعمل هذه الحاضنة لمرة واحدة فقط عند أول لمسة أو نقرة على الشاشة
