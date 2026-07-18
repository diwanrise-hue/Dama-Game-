// ========================================== //
//  radio.js - النسخة المطورة بالتصميم والترتيب الجديد
// ========================================== //

// 1. روابط البث وأسماء القنوات
const RADIO_STATIONS = {
    kurdish: "https://stream-156.zeno.fm/x0xhw6c6g2zuv?zs=AfL9IRdsQ_qHIebZBo-9GA",  
    arabic: "https://tatar.net.ua/radio/8000/radio.mp3",
    english: "https://icecast.walmradio.com:8443/classical"
};

const STATION_NAMES = {
    kurdish: "الإذاعة الكردية 📻",
    arabic: "الإذاعة العربية 📻",
    english: "الإذاعة الإنجليزية 📻"
};

let audioInstance = null;
let isMusicPlaying = false;
let selectedRadioStation = localStorage.getItem('hub_radio_id') || 'kurdish';

// 2. حقن التصميم والواجهة برمجياً
function injectRadioUI() {
    if (document.getElementById('radio-modal')) return;

    const style = document.createElement('style');
    style.innerHTML = `
        /* زر الراديو العائم */
        .radio-floating-btn {
            position: fixed; bottom: 20px; left: 20px;
            background: #1c1c1e; border: 2px solid #333; color: white;
            font-size: 28px; width: 60px; height: 60px; border-radius: 50%;
            cursor: pointer; z-index: 9999; display: flex; justify-content: center; align-items: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5); transition: 0.3s;
        }
        .radio-floating-btn.playing { border-color: #30d158; box-shadow: 0 0 15px rgba(48, 209, 88, 0.4); }

        /* خلفية النافذة */
        .radio-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.8); display: none; justify-content: center; align-items: center;
            z-index: 10000; dir: rtl; font-family: 'Tajawal', sans-serif;
        }

        /* صندوق النافذة الرئيسي */
        .radio-modal-content {
            background: #1c1c1e; padding: 25px; border-radius: 20px; text-align: center;
            color: white; width: 90%; max-width: 380px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);
            position: relative;
        }

        .radio-header { display: flex; justify-content: center; align-items: center; margin-bottom: 25px; position: relative; }
        .radio-header h3 { margin: 0; font-size: 20px; font-weight: 700; color: #fff; }
        .close-btn { 
            position: absolute; left: 0; top: 50%; transform: translateY(-50%);
            background: none; border: none; color: #888; font-size: 20px; cursor: pointer; padding: 5px;
        }

        /* قائمة المحطات */
        .stations-list { display: flex; gap: 10px; margin-bottom: 25px; }
        .station-btn {
            flex: 1; padding: 12px 5px; background: #2c2c2e; color: #8e8e93;
            border: 2px solid transparent; border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 600;
            transition: all 0.3s ease; font-family: inherit;
        }
        
        /* تباين وإضاءة إطار القناة المختارة (Glowing Neon Effect) */
        .station-btn.active { 
            background: #1c1c1e; 
            color: #fff; 
            border-color: #30d158; 
            box-shadow: 0 0 15px rgba(48, 209, 88, 0.6);
            font-weight: 700;
        }

        /* المؤشر النبضي البصري */
        .visualizer-box {
            background: #111112; border-radius: 12px; height: 70px; display: flex;
            justify-content: center; align-items: center; gap: 3px; overflow: hidden; margin-bottom: 15px;
        }
        .visualizer-box .bar {
            width: 3px; height: 10px; background: #3a3a3c; border-radius: 2px; transition: height 0.1s ease;
        }
        .visualizer-box.playing .bar { background: #30d158; animation: equalizer 0.8s infinite alternate ease-in-out; }
        
        @keyframes equalizer {
            0% { height: 10px; }
            100% { height: 45px; }
        }

        /* صندوق اسم القناة أسفل المؤشر النبضي */
        .channel-info-box {
            margin-bottom: 25px;
            min-height: 50px;
        }
        .channel-name-text {
            font-size: 18px;
            font-weight: 700;
            color: #ffffff;
            display: block;
            margin-bottom: 4px;
        }
        .radio-status-text {
            font-size: 13px;
            font-weight: 600;
            min-height: 18px;
            transition: 0.3s;
        }

        /* أزرار التحكم في الأسفل تماماً */
        .radio-actions { display: flex; gap: 15px; }
        .action-btn {
            flex: 1; padding: 14px 10px; border: none; border-radius: 12px;
            cursor: pointer; font-size: 16px; font-weight: bold; display: flex; justify-content: center; align-items: center; gap: 8px; font-family: inherit;
        }
        .play-btn { background: #30d158; color: white; box-shadow: 0 4px 10px rgba(48, 209, 88, 0.3); }
        .stop-btn { background: #3a1c1e; color: #ff453a; }
    `;
    document.head.appendChild(style);

    let barsHTML = '';
    for(let i = 0; i < 30; i++) {
        barsHTML += '<div class="bar"></div>';
    }

    // --- بناء الهيكل بالترتيب المطلوب الجديد ---
    const uiHTML = `
        <!-- الزر العائم -->
        <button id="music-toggle-btn" class="radio-floating-btn" onclick="openRadioModal()">📻</button>

        <!-- النافذة المنبثقة -->
        <div id="radio-modal" class="radio-modal-overlay" dir="rtl">
            <div class="radio-modal-content">
                <div class="radio-header">
                    <button class="close-btn" onclick="closeRadioModal()">✕</button>
                    <h3>الراديو والموسيقى</h3>
                </div>
                
                <!-- 1. أزرار القنوات في الأعلى -->
                <div class="stations-list">
                    <button id="btn-station-english" class="station-btn" onclick="selectRadioStation('english')">الإنجليزية</button>
                    <button id="btn-station-arabic" class="station-btn" onclick="selectRadioStation('arabic')">العربية</button>
                    <button id="btn-station-kurdish" class="station-btn" onclick="selectRadioStation('kurdish')">الكردية</button>
                </div>

                <!-- 2. المؤشر النبضي في المنتصف -->
                <div id="visualizer" class="visualizer-box">
                    ` + barsHTML + `
                </div>

                <!-- 3. اسم القناة والحالة يظهر هنا (تحت المؤشر النبضي مباشرة) -->
                <div class="channel-info-box">
                    <span id="channel-display-name" class="channel-name-text">---</span>
                    <div id="radio-status" class="radio-status-text"></div>
                </div>

                <!-- 4. أزرار التشغيل والإيقاف في الأسفل تماماً -->
                <div class="radio-actions">
                    <button class="action-btn stop-btn" onclick="triggerStopRadio()">إيقاف الراديو 🔴</button>
                    <button class="action-btn play-btn" onclick="triggerPlayRadio()">تشغيل ▶</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', uiHTML);
    updateRadioButtonsUI();
}

// 3. دوال التحكم بالواجهة
function openRadioModal() {
    document.getElementById('radio-modal').style.display = 'flex';
}

function closeRadioModal() {
    document.getElementById('radio-modal').style.display = 'none';
}

function selectRadioStation(stationId) {
    if (RADIO_STATIONS[stationId]) {
        selectedRadioStation = stationId;
        updateRadioButtonsUI();
        
        // إذا كان الراديو يعمل بالفعل، قم بتشغيل القناة الجديدة فوراً عند النقر عليها
        if (isMusicPlaying) {
            triggerPlayRadio();
        }
    }
}

function updateRadioButtonsUI() {
    // تحديث إضاءة أزرار المحطات والمطابقة
    ['kurdish', 'arabic', 'english'].forEach(id => {
        const btn = document.getElementById('btn-station-' + id);
        if (btn) {
            id === selectedRadioStation ? btn.classList.add('active') : btn.classList.remove('active');
        }
    });

    // تحديث اسم القناة تحت المؤشر
    const nameDisplay = document.getElementById('channel-display-name');
    if (nameDisplay) {
        nameDisplay.innerText = STATION_NAMES[selectedRadioStation];
    }

    const visualizer = document.getElementById('visualizer');
    const toggleBtn = document.getElementById('music-toggle-btn');
    const statusText = document.getElementById('radio-status');
    
    if (isMusicPlaying) {
        if(visualizer) visualizer.classList.add('playing');
        if(toggleBtn) toggleBtn.classList.add('playing');
        if(statusText) {
            statusText.innerText = "( تعمل الآن 🟢 )";
            statusText.style.color = "#30d158";
        }
        
        document.querySelectorAll('.visualizer-box .bar').forEach(bar => {
            bar.style.animationDelay = (Math.random() * 0.5) + "s";
            bar.style.animationDuration = (0.5 + Math.random() * 0.5) + "s";
        });
    } else {
        if(visualizer) visualizer.classList.remove('playing');
        if(toggleBtn) toggleBtn.classList.remove('playing');
    }
}

// 4. دوال التحكم بالصوت
function triggerPlayRadio() {
    const url = RADIO_STATIONS[selectedRadioStation];
    if (url) playRadio(url, selectedRadioStation);
}

function triggerStopRadio() {
    stopRadio();
}

function playRadio(url, id) {
    const statusText = document.getElementById('radio-status');

    if (statusText) {
        statusText.innerText = "( جاري تشغيل )";
        statusText.style.color = "#ff9500"; // لون برتقالي أثناء التحميل الانتظار
    }

    if (audioInstance) {
        audioInstance.pause();
        audioInstance.removeAttribute('src'); 
        audioInstance = null;
    }

    audioInstance = new Audio(url);
    audioInstance.crossOrigin = "anonymous";
    audioInstance.preload = "auto";

    const playPromise = audioInstance.play();

    if (playPromise !== undefined) {
        playPromise.then(() => {
            isMusicPlaying = true;
            localStorage.setItem('hub_radio_url', url);
            localStorage.setItem('hub_radio_id', id);
            localStorage.setItem('hub_music_enabled', 'true');
            updateRadioButtonsUI();
        }).catch(e => {
            if (e.name === 'AbortError' || e.message.includes('interrupted')) {
                console.log("تنقل سريع بين المحطات.");
            } else {
                if (statusText) {
                    statusText.innerText = "( فشل الاتصال )";
                    statusText.style.color = "#ff453a";
                }
                isMusicPlaying = false;
                updateRadioButtonsUI();
            }
        });
    }
}

function stopRadio() {
    const statusText = document.getElementById('radio-status');
    if (statusText) statusText.innerText = ""; 

    if (audioInstance) {
        audioInstance.pause();
        audioInstance.removeAttribute('src'); 
        audioInstance = null;
    }
    isMusicPlaying = false;
    localStorage.setItem('hub_music_enabled', 'false');
    updateRadioButtonsUI();
}

// 5. تهيئة السكربت عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    injectRadioUI(); 

    const handleFirstClick = () => {
        const savedMusicState = localStorage.getItem('hub_music_enabled');
        const savedRadioId = localStorage.getItem('hub_radio_id') || 'kurdish';
        const savedRadioUrl = RADIO_STATIONS[savedRadioId];
        
        if (savedMusicState === 'true' && savedRadioUrl && !isMusicPlaying) {
            selectedRadioStation = savedRadioId;
            playRadio(savedRadioUrl, savedRadioId);
        }
        window.removeEventListener('click', handleFirstClick);
    };

    window.addEventListener('click', handleFirstClick);
});

// تصدير الدوال للنطاق العالمي
window.openRadioModal = openRadioModal;
window.closeRadioModal = closeRadioModal;
window.selectRadioStation = selectRadioStation;
window.triggerPlayRadio = triggerPlayRadio;
window.triggerStopRadio = triggerStopRadio;
