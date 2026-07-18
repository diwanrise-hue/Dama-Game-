/**
 * 📻 Dama Challenge - Dedicated Radio Module
 * كود مستقل بالكامل لإدارة وتشغيل قنوات البث الحي والموسيقى في الخلفية
 */

// 🌐 قاعدة بيانات قنوات البث الحي للراديو (تستدعى ذاتياً بناءً على المعرف المرسل)
const RADIO_CHANNELS = {
    kurdish: "https://yayin6.radyohizmeti.com:7050/;stream",
    arabic: "https://stream.zeno.fm/67v6u6cc10etv",
    english: "https://stream.zeno.fm/f3wvbbv8ca0uv"
};

// المتغيرات التشغيلية الداخلية ونظام الذاكرة المحلية
let isMusicPlaying = false;
let currentRadioId = localStorage.getItem('hub_radio_id') || '';

/**
 * فتح النافذة المنبثقة للراديو وتحديث الواجهة
 */
function openRadioModal() {
    document.getElementById('radio-modal').style.display = 'flex';
    updateRadioButtonsUI();
}

/**
 * إغلاق نافذة الراديو
 */
function closeRadioModal() {
    document.getElementById('radio-modal').style.display = 'none';
}

/**
 * تشغيل الإذاعة المطلوبة بناءً على المعرّف
 * @param {string} id - معرف الإذاعة (kurdish, arabic, english)
 */
function playRadio(id) {
    const url = RADIO_CHANNELS[id];
    if (!url) {
        console.error(`⚠️ الإذاعة ذات المعرف "${id}" غير مسجلة في النظام.`);
        return;
    }

    const audioEl = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-toggle-btn');
    
    audioEl.src = url;
    audioEl.play().then(() => {
        isMusicPlaying = true;
        musicBtn.classList.add('music-playing');
        musicBtn.innerText = '🎵';
        
        // حفظ تفضيلات التشغيل الحالية للمستخدم
        localStorage.setItem('hub_radio_url', url);
        localStorage.setItem('hub_radio_id', id);
        localStorage.setItem('hub_music_enabled', 'true');
        
        currentRadioId = id;
        updateRadioButtonsUI();
    }).catch(e => {
        console.error("Radio Playback failed", e);
        // التحقق من لغة المنصة وعرض التنبيه المناسب
        const lang = window.currentLang || 'ar';
        const errorMsg = lang === 'ar' 
            ? "عذراً، فشل الاتصال بالإذاعة. تأكد من اتصالك بالإنترنت وصلاحية رابط البث." 
            : "Failed to connect to the radio stream. Check your internet connection.";
        
        if (typeof window.showCustomPopup === 'function') {
            window.showCustomPopup(errorMsg);
        } else {
            alert(errorMsg);
        }
    });
}

/**
 * إيقاف الراديو تماماً وتصفية الكاش لتوفير بيانات الإنترنت
 */
function stopRadio() {
    const audioEl = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-toggle-btn');
    
    audioEl.pause();
    audioEl.src = ''; // مسح المصدر لمنع التحميل اللانهائي بالخلفية
    isMusicPlaying = false;
    
    musicBtn.classList.remove('music-playing');
    musicBtn.innerText = '🔇';
    
    localStorage.setItem('hub_music_enabled', 'false');
    currentRadioId = '';
    updateRadioButtonsUI();
}

/**
 * تحديث الحالة الرسومية والألوان للأزرار داخل نافذة الراديو
 */
function updateRadioButtonsUI() {
    // إزالة ألوان التنشيط النشطة من جميع الأزرار كخطوة أولى
    ['kurdish', 'arabic', 'english'].forEach(id => {
        const btn = document.getElementById('btn-radio-' + id);
        if (btn) {
            btn.classList.remove('radio-active', 'btn-primary');
            btn.classList.add('btn-secondary');
        }
    });

    // إضاءة وتفعيل الزر المخصص للإذاعة التي تعمل حالياً
    if (currentRadioId && isMusicPlaying) {
        const activeBtn = document.getElementById('btn-radio-' + currentRadioId);
        if (activeBtn) {
            activeBtn.classList.remove('btn-secondary');
            activeBtn.classList.add('btn-primary', 'radio-active');
        }
    }
}

/**
 * التشغيل التلقائي الذكي: يتم استدعاؤه بعد أول تفاعل حقيقي للمستخدم بالصفحة
 * لتخطي شروط المتصفحات الصارمة التي تحظر التشغيل التلقائي للصوت (Autoplay Policy)
 */
window.addEventListener('click', () => {
    const savedMusicState = localStorage.getItem('hub_music_enabled');
    const savedRadioId = localStorage.getItem('hub_radio_id');
    
    if (savedMusicState === 'true' && savedRadioId && !isMusicPlaying) {
        currentRadioId = savedRadioId;
        playRadio(savedRadioId);
    }
}, { once: true });

// 🚀 تصدير وإتاحة الدوال برؤية عالمية (Global Window Scope) لتتطابق بسلاسة مع الـ HTML
window.openRadioModal = openRadioModal;
window.closeRadioModal = closeRadioModal;
window.playRadio = playRadio;
window.stopRadio = stopRadio;
window.updateRadioButtonsUI = updateRadioButtonsUI;
