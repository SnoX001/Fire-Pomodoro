document.addEventListener('DOMContentLoaded', function () {
    let isRunning = false;
    let isPaused = false;
    let anisPaused = false;
    let longplaying = false;
    let shortplaying = false;
    let focusplaying = true;
    let banisPaused = false;
    let interval;
    let waveinterval;
    let totalSeconds;
    let completedPomodoros = 0;
    let clickfocus = false;
    let clickshort = false;
    let clicklong = false;
    let animationFrameId;  // Animasyon kontrolü için ID
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    const startButton = document.getElementById('start-pause-id');
    const focusInput = document.getElementById('focus-value');
    const shortBreakInput = document.getElementById('short-break-value');
    const longBreakInput = document.getElementById('long-break-value');
    const focus_timer = document.getElementById('focus-timer');

    const fminutestext = document.getElementById('f-minutes-text');
    const sminutestext = document.getElementById('s-minutes-text');
    const lminutestext = document.getElementById('l-minutes-text');

    const fcontainername = document.getElementById('f-container-name');
    const scontainername = document.getElementById('s-container-name');
    const lcontainername = document.getElementById('l-container-name');

    const dropdown_options = document.getElementsByClassName('.dropdown-options');

    const focuslogo = document.getElementById('focus-logo').querySelector('path');
    const shortlogo = document.getElementById('short-logo').querySelector('path');
    const longlogo = document.getElementById('long-logo').querySelector('path');

    const s1 = document.getElementById('pomodoro-counter-logo').querySelector('path');
    const pomodorocounter = document.getElementById('pomodoro-counter');

    const focusButton = document.getElementById('focus');
    const shortBreakButton = document.getElementById('short-break');
    const longBreakButton = document.getElementById('long-break');

    const canvas = document.getElementById('waterCanvas');
    const ctx = canvas.getContext('2d');
    const themeSelector = document.getElementById('theme-selector');
    const saveButton = document.getElementById('save-theme');

    // Cihaz pikselleri oranını dikkate alarak canvas boyutlarını ayarlayın
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.opacity = 0.85;

    let lastTimestamp = 0; // Son frame'in zamanını tutmak için
    let remainingTime = 0; // Kalan süre

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    let specialvalue = 1.1;
    let defaultanimation = requestAnimationFrame(drawSmoothWave1);
    let amplitude = 10;  // Amplitüd
    let frequency = 0.006;  // Frekans
    let phaseSpeed = 0.0014; // Faz hızı
    let transitioning = false;
    let transitionDuration = 1; // Duration in milliseconds for the transition
    let firstvalue ;
    let secondvalue ;
    let currentMode = ''; // Focus, Short, Long gibi modları izlemek için
    let currentheight = canvas.height / specialvalue;
    let transitionStartTime = null;
    let boxthemef = '#fd4e4e';
    let boxthemes = '#0a5fdd';
    let boxthemel = '#494a4d';
    let buttonactivity = false;
    let fillcolor = boxthemef;
    // Modal açma-kapama işlemleri
    let selectedTheme = 'default';  // Başlangıçta default tema seçili
    let tempSelectedTheme = selectedTheme;  // Geçici seçim için değişken
    const modal = document.getElementById('modal');
    const timerOption = document.getElementById('timer-option');
    const closeButton = document.getElementsByClassName('close')[0]
    let count_s = 4;
    const numberInput = document.getElementById('number-input');
    applyTheme('default')
    


// Dropdown menüsünü açma/kapatma işlevi
document.querySelector('#theme-selector').addEventListener('click', function (event) {
    document.querySelector('.dropdown-options').classList.toggle('open'); // Menü aç/kapa
    event.stopPropagation(); // Menü açıldığında, bu tıklama sayfanın geri kalanına yayılmasın
    
});

// Sayfa genelinde tıklamayı dinle
document.addEventListener('click', function (event) {
    const dropdownMenu = document.querySelector('.dropdown-options');
    dropdownMenu.style.textContent = 'not-allowed';
    

    // Eğer tıklanan öğe dropdown'un dışında bir şeyse ve menü açık ise, menüyü kapat
    if (!event.target.closest('.custom-dropdown') && dropdownMenu.classList.contains('open')) {
        dropdownMenu.classList.remove('open'); // Menü kapatılır
    }
});

// 'blur' olayı: input alanı odak dışı olduğunda tetiklenir
numberInput.addEventListener('blur', function() {
    let value = parseInt(numberInput.value);

    // Eğer girilen değer 10'dan büyükse, 10 kabul edilir
    if (value > 10) {
        numberInput.value = 10;
    }
    // Eğer girilen değer 1'den küçükse, 1 kabul edilir
    else if (value < 4 || isNaN(value)) {
        numberInput.value = 4;
    }
});

// Dropdown seçeneklerinden birini seçince (görünümde geçici olarak değiştir)
document.querySelectorAll('.dropdown-item').forEach(function (item) {
    item.addEventListener('click', function () {
        tempSelectedTheme = this.getAttribute('data-value');  // Geçici tema depola
        themeSelector.textContent = getThemeLabel(tempSelectedTheme);  // Görünümü geçici olarak değiştir
        console.log('Geçici olarak seçilen tema:', tempSelectedTheme);
        document.querySelector('.dropdown-options').classList.toggle('open');
    });
});

// Save butonuna tıklanınca hem temayı uygula hem de dropdown'da güncelle
saveButton.addEventListener('click', function () {
    buttonactivity = true;
    selectedTheme = tempSelectedTheme;  // Geçici tema artık kalıcı olur
    applyTheme(selectedTheme);  // Seçilen temayı uygula
    modal.style.display = 'none';
    isRunning = false;
    minusPomodoroCounter();
    if (focusplaying){
        fillcolor = boxthemef;
        focusButton.click();
        isPaused = true;
        
    }
    if (shortplaying){
        fillcolor = boxthemes;
        shortBreakButton.click();
        isPaused = true;
    }
    if (longplaying){
        fillcolor = boxthemel;
        longBreakButton.click();
        isPaused = true;
    }
   // Pomodoro logosunu güncelleme işlemi
    // Kaç adet pomodoro logosu istendiğini belirliyoruz

   // İlk olarak, orijinal logoyu DOM'dan temizlemeden önce klonlamamız gerekiyor
   const originalLogo = document.getElementById('pomodoro-counter-logo');
   count_s = numberInput.value;
   if (originalLogo) {
       // Önce mevcut logoları temizle
       pomodorocounter.innerHTML = '';

       // Genişliği hesapla: Her logo için sabit bir genişlik ve aralarındaki boşluk (örneğin, 35px)
       const logoWidth = 30; // Her logo için genişlik (25px logo + 10px margin)
       const totalWidth = count_s * logoWidth;

       // `pomodoro-counter` genişliğini ayarla
       pomodorocounter.style.width = `${totalWidth}px`;

       // Belirtilen sayıda logo ekle
       for (let i = 0; i < count_s; i++) {
           const newLogo = originalLogo.cloneNode(true); // Logoyu tekrar klonla
           pomodorocounter.appendChild(newLogo); // Yeni klonlanmış logoyu ekle
       }
   }

   
});



// Sayfa yeniden yüklendiğinde veya modal kapandığında, Kaydet'e basılmazsa eski temaya geri dön
document.addEventListener('click', function (e) {
    if (!e.target.closest('.custom-dropdown') && !e.target.closest('#save-theme')) {
        // Dropdown dışında bir yere tıklanınca eski seçili temaya geri dön
    }
});

// Temayı uygulama fonksiyonu
function applyTheme(theme) {
    switch (theme) {
        case 'fire':
            boxthemef = '#FF5733';
            boxthemes = '#C70039';
            boxthemel = '#FFC300';

            break;
        case 'space':
            boxthemef = '#1A1A40';
            boxthemes = '#6A1B9A';
            boxthemel = '#FDD835';

            break;
        case 'nature':
            boxthemef = '#4CAF50';
            boxthemes = '#64B5F6';
            boxthemel = '#8D6E63';
            break;
        default:
            document.body.style.backgroundColor = '#FFF3E2';
            boxthemef = '#fd4e4e';
            boxthemes = '#0a5fdd';
            boxthemel = '#494a4d';
            break;
    }
}

// Seçilen tema etiketini gösterme fonksiyonu (dropdown için)
function getThemeLabel(theme) {
    switch (theme) {
        case 'fire':
            return '🔥  FIRE' ;
        case 'space':
            return '🌌  SPACE';
        case 'nature':
            return '🌿  NATURE';
        default:
            return 'DEFAULT';
    }
    
}

// Sayfa yüklendiğinde default temayı ayarla
document.addEventListener('DOMContentLoaded', function() {
    themeSelector.textContent = getThemeLabel(selectedTheme);

});



    
    // Timer Option'a tıklanınca modalı göster
    timerOption.onclick = function() {
        modal.style.display = 'block';
    }

    // Kapatma düğmesine tıklayınca modalı gizle
    closeButton.onclick = function() {
        modal.style.display = 'none';
        themeSelector.textContent = getThemeLabel(selectedTheme);  // Eski temayı geri yükle
    }

    // Pencere dışında bir yere tıklanınca modalı kapat
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            themeSelector.textContent = getThemeLabel(selectedTheme);  // Eski temayı geri yükle
        }
    }

    function lerpColor(color1, color2, t) {
        const c1 = hexToRgb(color1);
        const c2 = hexToRgb(color2);
        const r = Math.round(c1.r + (c2.r - c1.r) * t);
        const g = Math.round(c1.g + (c2.g - c1.g) * t);
        const b = Math.round(c1.b + (c2.b - c1.b) * t);
        return `rgb(${r},${g},${b})`;
    }

    function hexToRgb(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return { r, g, b };
    }

    function transitionFillColor(startColor, endColor, duration) {
        let startTime = null;
    
        function animate(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = (timestamp - startTime) / duration;
            const t = Math.min(progress, 1); // 0 ile 1 arasında tutuyoruz
            fillcolor = lerpColor(startColor, endColor, t); // Yeni rengi hesapla
    
            if (progress < 1) {
                requestAnimationFrame(animate); // Animasyonu devam ettir
            }
        }
    
        requestAnimationFrame(animate);
    }
    



    defaultanimation;

    function timeplanner(){
        if (clickfocus || clickshort || clicklong){
            transitionDuration = 6;
        } else {
            transitionDuration = totalSeconds ;
        }
    }




    function easeOutQuad(t) {
        return t * (2 - t);  // Geçişi smooth yapar (hızlı başlayıp yavaşlar)
    }
    

    function smoothWaveFunction(x, amplitude, frequency, phase) {
        return amplitude * Math.sin(frequency * x + phase);
         
    }

    function drawSmoothWaveTransition(timestamp) {
        if (!transitioning) return;
        if (!transitionStartTime) transitionStartTime = timestamp;
        const elapsed = timestamp - transitionStartTime;
        const linearProgress = Math.min(elapsed / (transitionDuration * 1000), 10);
        const easedProgress = easeOutQuad(linearProgress); 

        ctx.clearRect(0, 0, canvas.width, canvas.height); 
        ctx.beginPath();
        ctx.moveTo(0, canvas.height); 
        let phase = Date.now() * phaseSpeed; 

        for (let x = 0; x < canvas.width; x++) {
            const y1 = canvas.height / firstvalue + smoothWaveFunction(x, amplitude, frequency, phase);
            const y2 = canvas.height / secondvalue + smoothWaveFunction(x, amplitude, frequency, phase);
            const y = y1 * (1 - easedProgress) + y2 * easedProgress; 
            ctx.lineTo(x, y);

            if (x === 0) {
                currentheight = y; // Mevcut yüksekliği her geçişte güncelle
            }
        }

        ctx.lineTo(canvas.width, canvas.height);  
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        ctx.fillStyle = fillcolor;
        ctx.fill();

        if (linearProgress < 1) {
            animationFrameId = requestAnimationFrame(drawSmoothWaveTransition);  // Animasyonu kontrol etmek için ID saklanıyor
        } else {
            transitioning = false;
        }
    }


    function startWaveTransition() {
        animationFrameId = requestAnimationFrame(drawSmoothWaveTransition);
        transitionStartTime = null;
        transitioning = true;
    }
    

    function drawSmoothWave1() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);  
        ctx.beginPath();
        ctx.moveTo(0, 100);

        let phase = Date.now() * phaseSpeed;  
        for (let x = 0; x < canvas.width; x++) {
            const y = canvas.height / specialvalue  + smoothWaveFunction(x, amplitude, frequency, phase);
            ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);  
        ctx.lineTo(0, canvas.height); 
        ctx.closePath();
        ctx.fillStyle = fillcolor;  
        ctx.fill();
        
        requestAnimationFrame(drawSmoothWave1);
    }


    

    function displayTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        minutesElement.textContent = minutes.toString().padStart(2, '0');
        secondsElement.textContent = remainingSeconds.toString().padStart(2, '0');
    }
    
    

    function updatePomodoroCounter() {
        completedPomodoros += 1;
        updateCounterDisplay(completedPomodoros);
    }
    
    function minusPomodoroCounter() {
        completedPomodoros = 0;
        minusCounterDisplay(completedPomodoros);
    }
    
    function updateCounterDisplay(count) {
        // Pomodoro sayaç ikonlarının 'path' elemanlarını seç
        const pomodoroIcons = pomodorocounter.querySelectorAll('path');
        
        // Her bir pomodoro ikonunun rengini güncelle
        pomodoroIcons.forEach((icon, index) => {
            if (index < count) {
                icon.style.fill = '#fa0000d8'; // Tamamlanan pomodoroların rengini siyah yap
            } else {
                icon.style.fill = '#fff'; // Tamamlanmamış pomodoroları beyaz yap
            }
        });
    }
    
    function minusCounterDisplay() {
        // Pomodoro sayaç ikonlarının çocuklarını al
        const pomodoroIcons = pomodorocounter.querySelectorAll('path');
        
        // Tüm pomodoro ikonlarını sıfırla (tamamlanmamış duruma getir)
        Array.from(pomodoroIcons).forEach(icon => {
            icon.style.fill = '#fff'; // İkonları beyaz yap
        });
    }





    function activateButton(button, color) {
        // Tüm butonları eski haline döndür
        focusInput.style.color = '#000';
        shortBreakInput.style.color = '#000';
        longBreakInput.style.color = '#000';

        fminutestext.style.color = '#000';
        sminutestext.style.color = '#000';
        lminutestext.style.color = '#000';

        fcontainername.style.color = boxthemef;
        scontainername.style.color = boxthemes;
        lcontainername.style.color = boxthemel;
        focuslogo.style.fill = boxthemef;

        focusButton.style.backgroundColor = '#ffff';
        shortBreakButton.style.backgroundColor = '#ffff'; 
        longBreakButton.style.backgroundColor = '#ffff';

        // Aktif olan butonun rengini değiştir
        button.style.backgroundColor = color;

        // Logoların rengini değiştirme
        if (button === focusButton) {
            focuslogo.style.fill = '#ffff'; // Focus için renk
            shortlogo.style.fill = boxthemes; // Diğer logoları varsayılan renkte bırak
            longlogo.style.fill = boxthemel;
        } else if (button === shortBreakButton) {
            focuslogo.style.fill = boxthemef; // Diğer logoları varsayılan renkte bırak
            shortlogo.style.fill = '#ffff'; // Short Break için renk
            longlogo.style.fill = boxthemel;
        } else if (button === longBreakButton) {
            focuslogo.style.fill = boxthemef; // Diğer logoları varsayılan renkte bırak
            shortlogo.style.fill = boxthemes;
            longlogo.style.fill = '#ffff'; // Long Break için renk
        }
    }


    



    focusButton.addEventListener('click', function(event) {
        currentMode = 'focus';
        if (longplaying){
            startWaveTransition();
            transitionDuration = 1;
            transitionFillColor( boxthemel,boxthemef , 400);
            firstvalue = canvas.height / currentheight;
        }
        if (shortplaying){
            startWaveTransition();
            transitionDuration = 1;
            transitionFillColor(boxthemes, boxthemef, 400);
            firstvalue = canvas.height / currentheight;
        }
        totalSeconds = parseInt(focusInput.value * 60);
        if (buttonactivity){
            startWaveTransition();
            if (!isRunning){
                specialvalue = 1.1;
                firstvalue = 1.1;  
            }
           
        }
        secondvalue = 1.1;
        enableBreakButtons();
        specialvalue = secondvalue;
        displayTime(totalSeconds);
        shortplaying = false ;
        longplaying = false ;
        focusplaying = true;
        isRunning = false;
        isPaused = false;
        enableBreakButtons();
        focus_timer.textContent = 'Focus Timer';
        activateButton(focusButton, boxthemef); // Focus için kendine özgü renk
        focusButton.style.transition = 'background-color 0.5s ease, color 0.5s ease';
        focusInput.style.color = '#ffff';
        fminutestext.style.color = '#ffff';
        fcontainername.style.color = '#ffff';
        buttonactivity = false;
    });

    shortBreakButton.addEventListener('click', function() {
        currentMode = 'short';
        
        if (focusplaying){
            startWaveTransition();
            firstvalue = canvas.height / currentheight;
            transitionDuration = 1;
            fillcolor = boxthemef;
            transitionFillColor( fillcolor, boxthemes, 400);
        }

        if (longplaying){
            transitionFillColor( boxthemel, boxthemes, 400);
            transitionDuration = 1;
            startWaveTransition();
            firstvalue = 6.1;
            if ((canvas.height / currentheight + 1) < 6.1){
                firstvalue = canvas.height / currentheight;
            }
        }
        totalSeconds = parseInt(shortBreakInput.value * 60);
        if (buttonactivity){
            startWaveTransition();
            if (isRunning === false){
            specialvalue = 6.1;
            firstvalue = 6.1;  
            }
           
        }
        secondvalue = 6.1;
        enableBreakButtons();
        specialvalue = secondvalue;
        displayTime(totalSeconds);
        shortplaying = true ;
        longplaying = false ;
        focusplaying = false;
        isRunning = false;
        isPaused = false;
        focus_timer.textContent = 'Short Timer';
        enableBreakButtons();
        activateButton(shortBreakButton, boxthemes); // Short Break için kendine özgü renk
        shortBreakButton.style.transition = 'background-color 0.5s ease, color 0.5s ease';
        shortBreakInput.style.color = '#ffff';
        sminutestext.style.color = '#ffff';
        scontainername.style.color = '#ffff';
        buttonactivity = false;
    });

    longBreakButton.addEventListener('click', function() {
        currentMode = 'long';
        
        if (focusplaying){
            startWaveTransition();
            firstvalue = canvas.height / currentheight;
            transitionDuration = 1;
            fillcolor = boxthemef;
            transitionFillColor( fillcolor, boxthemel, 400);
        }

        if (shortplaying){
            transitionFillColor( boxthemes, boxthemel, 400);
            transitionDuration = 1;
            startWaveTransition();
            firstvalue = 6.1;
            if ((canvas.height / currentheight + 1) < 6.1){
                firstvalue = canvas.height / currentheight;
            }
            
        }
        totalSeconds = parseInt(longBreakInput.value * 60);
        if (buttonactivity){
            startWaveTransition();
            if (isRunning === false){
            specialvalue = 6.1;
            firstvalue = 6.1;  
            }
           
        }
        secondvalue = 6.1;
        enableBreakButtons();
        specialvalue = secondvalue;
        displayTime(totalSeconds);
        shortplaying = false ;
        longplaying = true ;
        focusplaying = false;
        isRunning = false;
        isPaused = false;
        enableBreakButtons();
        focus_timer.textContent = 'Long Timer';
        activateButton(longBreakButton, boxthemel); // Long Break için kendine özgü renk
        longBreakInput.style.color = '#ffff';
        lminutestext.style.color = '#ffff';
        lcontainername.style.color = '#ffff';
        buttonactivity = false;
    });

    startButton.addEventListener('click', function () {
        if (!isRunning) {
            if (currentMode === 'focus') {
                startTimer(focusInput.value * 60);
                timeplanner();
                startWaveTransition();
                secondvalue = 6.1;
                specialvalue = secondvalue;
                clickfocus = true;
                clickshort = false;
                clicklong = false;
                firstvalue = canvas.height / currentheight;
            } else if (currentMode === 'short') {
                startTimer(shortBreakInput.value * 60);
                timeplanner();
                startWaveTransition();
                secondvalue = 1.1;
                specialvalue = secondvalue;
                clickfocus = false;
                clickshort = true;
                clicklong = false;
                firstvalue = canvas.height / currentheight;
            } else if (currentMode === 'long') {
                startTimer(longBreakInput.value * 60);
                timeplanner();
                startWaveTransition();
                secondvalue = 1.1;
                specialvalue = secondvalue;
                clickfocus = false;
                clickshort = false;
                clicklong = true;
                firstvalue = canvas.height / currentheight;
            }
            startButton.textContent = 'PAUSE';
            isRunning = true;
        } else if (!isPaused) {
            pauseTimer();
            specialvalue = canvas.height / currentheight;
            firstvalue = canvas.height / currentheight;
            startButton.textContent = 'START';
            transitioning = false;
        } else {
            specialvalue = canvas.height / currentheight;
            firstvalue = canvas.height / currentheight;
            resumeTimer();
            startWaveTransition();
            specialvalue = secondvalue;
            startButton.textContent = 'PAUSE';
        }
    });

    function disableBreakButtons() {
        if (focusplaying) {
            shortBreakButton.disabled = true;
            longBreakButton.disabled = true;
            shortBreakButton.style.opacity = '0.5';
            longBreakButton.style.opacity = '0.5';
            shortBreakButton.style.cursor = 'not-allowed';
            longBreakButton.style.cursor = 'not-allowed';
            shortBreakButton.style.pointerEvents = 'none'; // Tıklamayı engelle
            longBreakButton.style.pointerEvents = 'none';  // Tıklamayı engelle
            focusButton.style.opacity = '1';
            focusButton.disabled = true;
            focusButton.style.pointerEvents = 'none';  // Tıklamayı engelle
            focusButton.style.cursor = 'not-allowed';
            
        }
    
        if (shortplaying) {
            focusButton.disabled = true;
            longBreakButton.disabled = true;
            focusButton.style.opacity = '0.5';
            longBreakButton.style.opacity = '0.5';
            focusButton.style.cursor = 'not-allowed';
            longBreakButton.style.cursor = 'not-allowed';
            focusButton.style.pointerEvents = 'none';  // Tıklamayı engelle
            longBreakButton.style.pointerEvents = 'none';  // Tıklamayı engelle
            shortBreakButton.style.opacity = '1';
            shortBreakButton.disabled = true;
            shortBreakButton.style.cursor = 'not-allowed';
            shortBreakButton.style.pointerEvents = 'none';  // Tıklamayı aç
        }
        if (longplaying) {
            focusButton.disabled = true;
            shortBreakButton.disabled = true;
            focusButton.style.opacity = '0.5';
            shortBreakButton.style.opacity = '0.5';
            focusButton.style.cursor = 'not-allowed';
            shortBreakButton.style.cursor = 'not-allowed';
            focusButton.style.pointerEvents = 'none';  // Tıklamayı engelle
            shortBreakButton.style.pointerEvents = 'none';  // Tıklamayı engelle
            longBreakButton.style.opacity = '1';
            longBreakButton.disabled = true;
            longBreakButton.style.cursor = 'not-allowed';
            longBreakButton.style.pointerEvents = 'none';  // Tıklamayı aç
        }
    }

    function focusstop(){
        focusButton.disabled = true;
        focusButton.style.pointerEvents = 'none';  // Tıklamayı engelle
        focusButton.style.cursor = 'not-allowed';
    }

    function shortstop(){
        shortBreakButton.disabled = true;
        shortBreakButton.style.cursor = 'not-allowed';
        shortBreakButton.style.pointerEvents = 'none';  // Tıklamayı aç
    }

    function longstop(){
        longBreakButton.disabled = true;
        longBreakButton.style.cursor = 'not-allowed';
        longBreakButton.style.pointerEvents = 'none';  // Tıklamayı aç
    }

    function enableBreakButtons() {

        if (focusplaying){
            shortBreakButton.disabled = false;
            longBreakButton.disabled = false;
            shortBreakButton.style.opacity = '1';
            longBreakButton.style.opacity = '1';
            shortBreakButton.style.cursor = 'pointer';
            longBreakButton.style.cursor = 'pointer';
            shortBreakButton.style.pointerEvents = 'auto';
            longBreakButton.style.pointerEvents = 'auto';
            focusButton.style.opacity = '1'; 
        }

        if (shortplaying){
            longBreakButton.disabled = false;
            focusButton.disabled = false;
            longBreakButton.style.opacity = '1';
            focusButton.style.opacity = '1';
            longBreakButton.style.cursor = 'pointer';
            focusButton.style.cursor = 'pointer';
            longBreakButton.style.pointerEvents = 'auto';
            focusButton.style.pointerEvents = 'auto';
            shortBreakButton.style.opacity = '1';
        }

        if (longplaying){
           shortBreakButton.disabled = false;
           focusButton.disabled = false; 
           shortBreakButton.style.opacity = '1';
           focusButton.style.opacity = '1';
           shortBreakButton.style.cursor = 'pointer';
           focusButton.style.cursor = 'pointer';
           shortBreakButton.style.pointerEvents = 'auto';
           focusButton.style.pointerEvents = 'auto';
           longBreakButton.style.opacity = '1';
        }
    }

    function startTimer(duration) {
        totalSeconds = duration;
        remainingTime = totalSeconds; // Başlangıçta toplam süreyi kalan süreye atıyoruz
        isRunning = true;
        isPaused = false;
        lastTimestamp = performance.now(); // Zamanlayıcı başlıyor
        requestAnimationFrame(updateTimer); // Zamanlayıcıyı başlat
        disableBreakButtons();
    }
    
    function pauseTimer() {
        isPaused = true;
        cancelAnimationFrame(animationFrameId); // Animasyonu durdur
        enableBreakButtons();
    }
    
    function resumeTimer() {
        isPaused = false;
        lastTimestamp = performance.now(); // Kaldığı yerden devam için zamanı sıfırla
        requestAnimationFrame(updateTimer); // Zamanlayıcıyı yeniden başlat
        disableBreakButtons();
    }
    
    function updateTimer(timestamp) {
        if (!isPaused) {
            const delta = (timestamp - lastTimestamp) / 1000; // Geçen zamanı saniye cinsinden hesapla
            remainingTime -= delta; // Kalan süreyi düşür
            lastTimestamp = timestamp; // Şu anki zamanı kaydet
    
            if (remainingTime <= 0) {
                completeCycle(); // Zaman bittiyse döngüyü tamamla
                return;
            }
    
            displayTime(Math.floor(remainingTime)); // Kalan süreyi ekranda göster
            animationFrameId = requestAnimationFrame(updateTimer); // Bir sonraki frame'i çağır
        }
    }
    

    function completeCycle() {
        remainingTime = 0;
        displayTime(0);
        startButton.textContent = 'START';
        isRunning = false;
        isPaused = false;
    
        if (buttonactivity === false){
        // Modlar arası geçiş
        if (currentMode === 'focus') {
            updatePomodoroCounter(); // Pomodoro sayaç güncellemesi
            if (completedPomodoros === count_s ) {
            longBreakButton.click(); // 4 Pomodoro tamamlandıysa uzun mola
            } else {
                shortBreakButton.click(); // Diğer durumlarda kısa mola
            }
        } else if (currentMode === 'short') {
            focusButton.click(); // Kısa moladan sonra odaklanma moduna geç
        } else if (currentMode === 'long') {
            focusButton.click();  // Uzun moladan sonra odaklanma moduna geç
            minusPomodoroCounter(); // Sayaç sıfırla
        }    
        }
    }
    
    function displayTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        minutesElement.textContent = minutes.toString().padStart(2, '0');
        secondsElement.textContent = remainingSeconds.toString().padStart(2, '0');
    }
    
    focusButton.click();
    
});