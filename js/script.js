/* =============================================
   PROPUESTA ROMÁNTICA — LÓGICA E INTERACTIVIDAD
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  // ---- REFERENCIAS DEL DOM ----
  const introScreen = document.getElementById('intro');
  const btnStart = document.getElementById('btn-start');
  const mainContent = document.getElementById('main-content');
  const btnSi = document.getElementById('btn-si');
  const btnNo = document.getElementById('btn-no');
  const buttonsBox = document.getElementById('propuesta-buttons');
  const exitoSection = document.getElementById('exito');
  const musicToggle = document.getElementById('music-toggle');
  const bgMusic = document.getElementById('bg-music');

  let siScale = 1;     // Escala progresiva del botón SÍ
  let noAttempts = 0;   // Contador de intentos del NO

  // =============================================
  // 1. FLOATING HEARTS (Pantalla de inicio)
  // =============================================
  function createFloatingHearts() {
    const container = document.querySelector('.floating-hearts');
    if (!container) return;
    const hearts = ['💕', '💖', '💗', '💓', '❤️', '🩷', '🤍'];

    for (let i = 0; i < 25; i++) {
      const heart = document.createElement('span');
      heart.classList.add('floating-heart');
      heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      heart.style.left = Math.random() * 100 + '%';
      heart.style.fontSize = (Math.random() * 1.2 + 0.8) + 'rem';
      heart.style.animationDuration = (Math.random() * 6 + 5) + 's';
      heart.style.animationDelay = (Math.random() * 8) + 's';
      container.appendChild(heart);
    }
  }
  createFloatingHearts();

  // =============================================
  // 2. PANTALLA DE INICIO → MAIN CONTENT
  // =============================================
  btnStart.addEventListener('click', () => {
    introScreen.classList.add('fade-out');
    mainContent.classList.remove('hidden');

    // La música ya no empieza automáticamente 

    // Iniciar observadores después de mostrar contenido
    setTimeout(() => {
      initScrollObservers();
      // Duplicar cards del carrusel para scroll infinito
      initCineCarousel();
    }, 100);
  });

  // =============================================
  // 3. INTERSECTION OBSERVER — FADE IN ON SCROLL
  // =============================================
  function initScrollObservers() {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };

    // --- Razones ---
    const razones = document.querySelectorAll('.razon-item');
    const razonesObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay) || 0;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);
          razonesObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);
    razones.forEach(r => razonesObserver.observe(r));

    // --- Cine "Y muchas más..." ---
    const cineMore = document.querySelector('.cine-more');
    if (cineMore) {
      const cineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            cineObserver.unobserve(entry.target);
          }
        });
      }, observerOptions);
      cineObserver.observe(cineMore);
    }

    // --- Polaroids ---
    const polaroids = document.querySelectorAll('.polaroid');
    const polaroidObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = Array.from(polaroids).indexOf(entry.target);
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, idx * 120);
          polaroidObserver.unobserve(entry.target);
        }
      });
    }, { ...observerOptions, threshold: 0.1 });
    polaroids.forEach(p => polaroidObserver.observe(p));

    // --- Galería "Nos faltan mil fotos..." ---
    const galeriaMore = document.querySelector('.galeria-more');
    if (galeriaMore) {
      const galeriaObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            galeriaObserver.unobserve(entry.target);
          }
        });
      }, observerOptions);
      galeriaObserver.observe(galeriaMore);
    }

    // --- Propuesta Box ---
    const propuestaBox = document.querySelector('.propuesta-box');
    if (propuestaBox) {
      const propuestaObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            propuestaObserver.unobserve(entry.target);
          }
        });
      }, { ...observerOptions, threshold: 0.2 });
      propuestaObserver.observe(propuestaBox);
    }

    // --- Music Tip (Cine Section) ---
    const cineSection = document.getElementById('cine');
    if (cineSection) {
      const musicTipObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !isPlaying) {
            showMusicTip();
            musicTipObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      musicTipObserver.observe(cineSection);
    }
  }

  function showMusicTip() {
    const tip = document.createElement('div');
    tip.className = 'music-tip';
    tip.innerHTML = `
      <div class="music-tip-content">
        <span>Mira esta sección con música... 🎵</span>
        <button id="btn-play-now">Dale play aquí ✨</button>
      </div>
    `;
    document.body.appendChild(tip);

    // Animación de entrada
    setTimeout(() => tip.classList.add('visible'), 100);

    const btnPlayNow = tip.querySelector('#btn-play-now');
    btnPlayNow.addEventListener('click', () => {
      bgMusic.play().then(() => {
        isPlaying = true;
        musicToggle.classList.add('playing');
        musicToggle.textContent = '🎵';
        tip.classList.remove('visible');
        setTimeout(() => tip.remove(), 500);
      });
    });

    // Auto-cerrar después de 8 segundos si no hacen nada
    setTimeout(() => {
      if (tip.parentNode) {
        tip.classList.remove('visible');
        setTimeout(() => tip.remove(), 500);
      }
    }, 8000);
  }

  // =============================================
  // 4. CARRUSEL DE CINE — LOOP + DRAG PARA SCROLL
  // =============================================
  function initCineCarousel() {
    const track = document.querySelector('.cine-track');
    const carousel = document.getElementById('cine-carousel');
    if (!track || !carousel) return;

    // Duplicar las tarjetas para crear efecto de loop continuo
    const cards = track.innerHTML;
    track.innerHTML = cards + cards;

    // Funcionalidad DRAG para scroll manual
    let isDown = false;
    let startX;
    let scrollLeft;

    carousel.addEventListener('mousedown', (e) => {
      isDown = true;
      carousel.style.cursor = 'grabbing';
      startX = e.pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
      // Pausar animación al interactuar
      track.style.animationPlayState = 'paused';
    });

    carousel.addEventListener('mouseleave', () => {
      isDown = false;
      carousel.style.cursor = 'grab';
      // Reanudar animación
      track.style.animationPlayState = 'running';
    });

    carousel.addEventListener('mouseup', () => {
      isDown = false;
      carousel.style.cursor = 'grab';
      // Reanudar animación
      track.style.animationPlayState = 'running';
    });

    carousel.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - startX) * 2; // Velocidad de scroll
      carousel.scrollLeft = scrollLeft - walk;
    });
  }

  // =============================================
  // 5. BOTÓN "NO" — ESCAPE DEL CURSOR
  // =============================================
  function moveNoButton() {
    const container = buttonsBox.getBoundingClientRect();
    const btnRect = btnNo.getBoundingClientRect();

    // Calcular límites dentro de la ventana visible
    const maxX = window.innerWidth - btnRect.width - 20;
    const maxY = window.innerHeight - btnRect.height - 20;

    let newX = Math.random() * maxX;
    let newY = Math.random() * maxY;

    // Asegurar que no se salga de la pantalla
    newX = Math.max(10, Math.min(newX, maxX));
    newY = Math.max(10, Math.min(newY, maxY));

    btnNo.style.position = 'fixed';
    btnNo.style.left = newX + 'px';
    btnNo.style.top = newY + 'px';
    btnNo.style.zIndex = '1000';
    btnNo.style.transition = 'left 0.2s ease, top 0.2s ease';

    // Incrementar el tamaño del SÍ (con límite)
    noAttempts++;
    siScale = Math.min(1 + (noAttempts * 0.15), 3.5); // Máximo 3.5x
    btnSi.style.setProperty('--si-scale', siScale);

    // Ajustar fuente y padding proporcionalmente pero con límites
    const newFontSize = Math.min(1.2 + noAttempts * 0.1, 2.5);
    const newPaddingV = Math.min(16 + noAttempts * 4, 40);
    const newPaddingH = Math.min(44 + noAttempts * 8, 100);

    btnSi.style.fontSize = newFontSize + 'rem';
    btnSi.style.padding = `${newPaddingV}px ${newPaddingH}px`;
  }

  // En escritorio: al acercar el mouse
  btnNo.addEventListener('mouseenter', (e) => {
    e.preventDefault();
    moveNoButton();
  });

  // En móvil: al intentar tocar
  btnNo.addEventListener('touchstart', (e) => {
    e.preventDefault();
    moveNoButton();
  });

  // También al hacer clic directo
  btnNo.addEventListener('click', (e) => {
    e.preventDefault();
    moveNoButton();
  });

  // =============================================
  // 6. BOTÓN "SÍ" — CONFETTI + ÉXITO
  // =============================================
  btnSi.addEventListener('click', () => {
    // Disparar confetti 🎉
    fireConfetti();

    // Ocultar propuesta, mostrar éxito
    const propuestaSection = document.getElementById('propuesta');
    propuestaSection.classList.add('hidden');

    // Esconder el botón NO si está flotando
    btnNo.style.display = 'none';

    exitoSection.classList.remove('hidden');

    // Scroll suave al éxito
    exitoSection.scrollIntoView({ behavior: 'smooth' });

    // Confetti continuo por unos segundos
    let confettiCount = 0;
    const confettiInterval = setInterval(() => {
      fireConfetti();
      confettiCount++;
      if (confettiCount >= 8) clearInterval(confettiInterval);
    }, 600);
  });

  function fireConfetti() {
    // Explosión central
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6, x: 0.5 },
      colors: ['#ff6b8a', '#ff9a9e', '#fecfef', '#ff4971', '#fbc2eb', '#fff', '#ffd1dc'],
      scalar: 1.2
    });

    // Laterales
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#ff6b8a', '#fecfef', '#ff9a9e']
    });

    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#ff4971', '#fbc2eb', '#ffd1dc']
    });
  }

  // =============================================
  // 7. CONTROL DE MÚSICA
  // =============================================
  let isPlaying = false;

  musicToggle.addEventListener('click', () => {
    if (isPlaying) {
      bgMusic.pause();
      musicToggle.classList.remove('playing');
      musicToggle.textContent = '🔇';
    } else {
      bgMusic.play().then(() => {
        musicToggle.classList.add('playing');
        musicToggle.textContent = '🎵';
      }).catch(() => { });
    }
    isPlaying = !isPlaying;
  });

  // Sincronizar estado de reproducción
  bgMusic.addEventListener('play', () => {
    isPlaying = true;
    musicToggle.classList.add('playing');
    musicToggle.textContent = '🎵';
  });

  bgMusic.addEventListener('pause', () => {
    isPlaying = false;
    musicToggle.classList.remove('playing');
    musicToggle.textContent = '🔇';
  });
});
