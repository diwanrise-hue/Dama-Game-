// radio.js - نظام إدارة بث الراديو والموسيقى للـ Hub

// 1. قاعدة بيانات القنوات (مصفوفة قابلة للتوسع)
window.RADIO_STATIONS = [
    { id: 'kurdish', url: 'https://stream.zeno.fm/x5v824cc10etv', title: 'فۆلکلۆری کوردی', labelAr: 'الكردية', labelEn: 'Kurdish' },
    { id: 'arabic', url: 'https://stream.zeno.fm/67v6u6cc10etv', title: 'إذاعة عربية (طرب)', labelAr: 'العربية', labelEn: 'Arabic' },
    { id: 'english', url: 'https://stream.zeno.fm/f3wvbbv8ca0uv', title: 'إذاعة أجنبية (Lofi)', labelAr: 'الإنجليزية', labelEn: 'English' }
];

// 2. دالة لفتح نافذة الراديو
function openRadioModal() {
    const radioModal = document.getElementById('radio-modal');
    if (radioModal) {
        radioModal.style.display = 'flex';
        updateRadioButtonsUI();
        if (typeof history !== 'undefined' && history.pushState) {
            history.pushState({ view: 'radio' }, '');
        }
    }
}

// 3. دالة لإغلاق النافذة
function closeRadioModal() {
    const radioModal = document.getElementById('radio-modal');
    if (radioModal) radioModal.style.display = 'none';
}

// 4. دالة تشغيل البث
function playRadio(url, id) {
    const audioEl = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-toggle-btn');
    
    if (!audioEl) return;
    
    audioEl.pause();
    audioEl.src = url;
    audioEl.load();

    audioEl.play().then(() => {
        isMusicPlaying = true;
        currentRadioId = id;
        if (musicBtn) musicBtn.classList.add('music-playing');
        
        localStorage.setItem('hub_radio_url', url);
        localStorage.setItem('hub_radio_id', id);
        localStorage.setItem('hub_music_enabled', 'true');
        
        updateRadioButtonsUI();
    }).catch(e => {
        console.error("خطأ في تشغيل الراديو:", e);
    });
}

// 5. دالة إيقاف الراديو
function stopRadio() {
    const audioEl = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-toggle-btn');
    
    if (audioEl) {
        audioEl.pause();
        audioEl.src = '';
    }
    
    isMusicPlaying = false;
    currentRadioId = '';
    if (musicBtn) musicBtn.classList.remove('music-playing');
    
    localStorage.setItem('hub_music_enabled', 'false');
    updateRadioButtonsUI();
}

// 6. دالة تحديث الأزرار ديناميكياً بناءً على المصفوفة
function updateRadioButtonsUI() {
    window.RADIO_STATIONS.forEach(station => {
        const btn = document.getElementById('btn-radio-' + station.id);
        if (btn) {
            btn.classList.remove('radio-active', 'btn-primary');
            btn.classList.add('btn-secondary');
        }
    });

    if (currentRadioId && isMusicPlaying) {
        const activeBtn = document.getElementById('btn-radio-' + currentRadioId);
        if (activeBtn) {
            activeBtn.classList.remove('btn-secondary');
            activeBtn.classList.add('btn-primary', 'radio-active');
        }
    }
}

// 7. نظام التشغيل التلقائي
window.addEventListener('click', () => {
    const savedMusicState = localStorage.getItem('hub_music_enabled');
    const savedRadioUrl = localStorage.getItem('hub_radio_url');
    const savedRadioId = localStorage.getItem('hub_radio_id');
    
    if (savedMusicState === 'true' && savedRadioUrl && !isMusicPlaying) {
        setTimeout(() => {
            currentRadioId = savedRadioId;
            playRadio(savedRadioUrl, savedRadioId);
        }, 300);
    }
}, { once: true });
