    const menuToggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');
    menuToggle.addEventListener('click', () => {
      mobileNav.style.display = mobileNav.style.display === 'flex' ? 'none' : 'flex';
    });

    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav a');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (!href || !href.startsWith('#')) return;
            link.classList.toggle('active', href === `#${entry.target.id}`);
          });
        }
      });
    }, { threshold: 0.55 });
    sections.forEach(section => observer.observe(section));

    const reveals = document.querySelectorAll('[data-reveal]');
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    reveals.forEach(el => {
      el.classList.add('reveal');
      revealObserver.observe(el);
    });

    const counters = document.querySelectorAll('[data-counter]');
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.counter, 10);
          let current = 0;
          const step = Math.ceil(target / 70);
          const interval = setInterval(() => {
            current += step;
            if (current >= target) {
              el.textContent = target;
              clearInterval(interval);
            } else {
              el.textContent = current;
            }
          }, 20);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(counter => counterObserver.observe(counter));

    const typingPhrases = [
      'Disciplina. Técnica. Respeito.',
      'Treine como atleta olímpico.',
      'Força, estratégia e foco em cada round.'
    ];
    const typingEl = document.getElementById('typingText');
    let phraseIndex = 0;
    let letterIndex = 0;
    let isDeleting = false;

    function typeLoop() {
      const current = typingPhrases[phraseIndex];
      if (!isDeleting) {
        letterIndex++;
        typingEl.textContent = current.slice(0, letterIndex);
        if (letterIndex === current.length) {
          isDeleting = true;
          setTimeout(typeLoop, 1500);
          return;
        }
      } else {
        letterIndex--;
        typingEl.textContent = current.slice(0, letterIndex);
        if (letterIndex === 0) {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % typingPhrases.length;
        }
      }
      setTimeout(typeLoop, isDeleting ? 55 : 90);
    }
    typeLoop();

    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mousedown', () => {
        btn.classList.add('btn-impact');
      });
      btn.addEventListener('mouseup', () => {
        btn.classList.remove('btn-impact');
      });
      btn.addEventListener('mouseleave', () => {
        btn.classList.remove('btn-impact');
      });
    });

    const heroCanvas = document.getElementById('heroParticles');
    const ctx = heroCanvas.getContext('2d');
    let particles = [];

    function resizeCanvas() {
      const scale = window.devicePixelRatio || 1;
      heroCanvas.width = heroCanvas.offsetWidth * scale;
      heroCanvas.height = heroCanvas.offsetHeight * scale;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
    }

    function createParticles() {
      const count = 35;
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * heroCanvas.offsetWidth,
        y: Math.random() * heroCanvas.offsetHeight,
        radius: Math.random() * 2 + 1,
        speed: Math.random() * 0.5 + 0.2,
        alpha: Math.random() * 0.5 + 0.3
      }));
    }

    function animateParticles() {
      ctx.clearRect(0, 0, heroCanvas.offsetWidth, heroCanvas.offsetHeight);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.fillStyle = `rgba(214, 179, 94, ${p.alpha})`;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        p.y -= p.speed;
        if (p.y < 0) {
          p.y = heroCanvas.offsetHeight;
          p.x = Math.random() * heroCanvas.offsetWidth;
        }
      });
      requestAnimationFrame(animateParticles);
    }

    resizeCanvas();
    createParticles();
    animateParticles();

    window.addEventListener('resize', () => {
      resizeCanvas();
      createParticles();
    });

    const hero = document.querySelector('.hero');
    const heroVideo = document.getElementById('heroVideo');
    if (heroVideo && hero) {
      heroVideo.addEventListener('error', () => {
        hero.classList.add('fallback');
        heroVideo.style.display = 'none';
      });

      heroVideo.addEventListener('loadeddata', () => {
        heroVideo.play().catch(() => {
          hero.classList.add('fallback');
          heroVideo.style.display = 'none';
        });
      });
    }

    const timerDisplay = document.getElementById('timerDisplay');
    const timerStatus = document.getElementById('timerStatus');
    const timerStart = document.getElementById('timerStart');
    const timerPause = document.getElementById('timerPause');
    const timerReset = document.getElementById('timerReset');
    const timerPills = document.querySelectorAll('.timer-pill');

    const rounds = [
      { label: 'Round 1', seconds: 120 },
      { label: 'Descanso', seconds: 60 },
      { label: 'Round 2', seconds: 120 },
      { label: 'Descanso', seconds: 60 },
      { label: 'Round 3', seconds: 120 }
    ];

    let currentStage = 0;
    let remaining = rounds[currentStage].seconds;
    let timerInterval = null;

    function updateTimerDisplay() {
      const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
      const seconds = String(remaining % 60).padStart(2, '0');
      const label = rounds[currentStage].label;
      timerDisplay.textContent = `${minutes}:${seconds}`;
      timerStatus.textContent = label.includes('Round') ? `${label} / 3` : label;
      timerPills.forEach(pill => pill.classList.remove('active'));
      if (label.includes('Round')) {
        const roundNumber = label.split(' ')[1];
        const activePill = document.querySelector(`.timer-pill[data-round="${roundNumber}"]`);
        if (activePill) activePill.classList.add('active');
      } else {
        const restPill = document.querySelector('.timer-pill[data-round="rest"]');
        if (restPill) restPill.classList.add('active');
      }
    }

    function nextStage() {
      if (currentStage < rounds.length - 1) {
        currentStage += 1;
        remaining = rounds[currentStage].seconds;
      } else {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      updateTimerDisplay();
    }

    function tick() {
      if (remaining > 0) {
        remaining -= 1;
      } else {
        nextStage();
      }
      updateTimerDisplay();
    }

    timerStart.addEventListener('click', () => {
      if (!timerInterval) {
        timerInterval = setInterval(tick, 1000);
      }
    });

    timerPause.addEventListener('click', () => {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    });

    timerReset.addEventListener('click', () => {
      clearInterval(timerInterval);
      timerInterval = null;
      currentStage = 0;
      remaining = rounds[currentStage].seconds;
      updateTimerDisplay();
    });

    updateTimerDisplay();

    const carouselTrack = document.querySelector('.carousel-track');
    const carouselCards = document.querySelectorAll('.carousel-card');
    const prevTestimonialBtn = document.getElementById('prevTestimonial');
    const nextTestimonialBtn = document.getElementById('nextTestimonial');
    let carouselIndex = 0;

    function updateCarousel() {
      if (!carouselTrack) return;
      carouselTrack.style.transform = `translateX(-${carouselIndex * 100}%)`;
    }

    if (carouselTrack && carouselCards.length && prevTestimonialBtn && nextTestimonialBtn) {
      prevTestimonialBtn.addEventListener('click', () => {
        carouselIndex = (carouselIndex - 1 + carouselCards.length) % carouselCards.length;
        updateCarousel();
      });

      nextTestimonialBtn.addEventListener('click', () => {
        carouselIndex = (carouselIndex + 1) % carouselCards.length;
        updateCarousel();
      });

      setInterval(() => {
        carouselIndex = (carouselIndex + 1) % carouselCards.length;
        updateCarousel();
      }, 6500);
    }

    const photoCarousel = document.getElementById('photoCarousel');
    if (photoCarousel) {
      let isDragging = false;
      let startX = 0;
      let scrollLeft = 0;

      const startDrag = (pageX) => {
        isDragging = true;
        photoCarousel.classList.add('dragging');
        startX = pageX - photoCarousel.offsetLeft;
        scrollLeft = photoCarousel.scrollLeft;
      };

      const stopDrag = () => {
        isDragging = false;
        photoCarousel.classList.remove('dragging');
      };

      const moveDrag = (pageX) => {
        if (!isDragging) return;
        const x = pageX - photoCarousel.offsetLeft;
        const walk = (x - startX) * 1.6;
        photoCarousel.scrollLeft = scrollLeft - walk;
      };

      photoCarousel.addEventListener('mousedown', (event) => startDrag(event.pageX));
      photoCarousel.addEventListener('mouseleave', stopDrag);
      photoCarousel.addEventListener('mouseup', stopDrag);
      photoCarousel.addEventListener('mousemove', (event) => {
        if (!isDragging) return;
        event.preventDefault();
        moveDrag(event.pageX);
      });

      photoCarousel.addEventListener('touchstart', (event) => {
        startDrag(event.touches[0].pageX);
      }, { passive: true });
      photoCarousel.addEventListener('touchend', stopDrag);
      photoCarousel.addEventListener('touchmove', (event) => {
        moveDrag(event.touches[0].pageX);
      }, { passive: true });
    }

    const photoModal = document.getElementById('photoModal');
    const photoModalImage = document.getElementById('photoModalImage');
    const photoModalClose = document.getElementById('photoModalClose');
    const photoModalPrev = document.getElementById('photoModalPrev');
    const photoModalNext = document.getElementById('photoModalNext');
    const photoCards = Array.from(document.querySelectorAll('.media-card'));
    let photoModalIndex = 0;

    function openPhotoModal(index) {
      photoModalIndex = index;
      photoModalImage.src = photoCards[photoModalIndex].querySelector('img').src;
      photoModal.classList.add('open');
      photoModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closePhotoModal() {
      photoModal.classList.remove('open');
      photoModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function showPhotoPrev() {
      photoModalIndex = (photoModalIndex - 1 + photoCards.length) % photoCards.length;
      openPhotoModal(photoModalIndex);
    }

    function showPhotoNext() {
      photoModalIndex = (photoModalIndex + 1) % photoCards.length;
      openPhotoModal(photoModalIndex);
    }

    photoCards.forEach((card, index) => {
      card.addEventListener('click', () => openPhotoModal(index));
    });

    photoModalClose.addEventListener('click', closePhotoModal);
    photoModalPrev.addEventListener('click', showPhotoPrev);
    photoModalNext.addEventListener('click', showPhotoNext);
    photoModal.addEventListener('click', (event) => {
      if (event.target === photoModal) closePhotoModal();
    });

    const videoModal = document.getElementById('videoModal');
    const videoModalClose = document.getElementById('videoModalClose');
    const arenaVideo = document.getElementById('arenaVideo');
    const videoFallback = document.getElementById('videoFallback');
    const videoCards = document.querySelectorAll('.video-card');

    function openVideoModal(src, poster) {
      videoModal.classList.add('open');
      videoModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      videoFallback.classList.remove('active');
      arenaVideo.style.display = 'block';

      arenaVideo.pause();
      arenaVideo.currentTime = 0;
      arenaVideo.setAttribute('poster', poster || '');
      arenaVideo.src = src;
      arenaVideo.load();

      arenaVideo.muted = true;
      const p = arenaVideo.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          // se autoplay bloquear, tudo bem: controls já deixam o usuário dar play
        });
      }
    }

    arenaVideo.addEventListener('error', () => {
      videoFallback.classList.add('active');
      arenaVideo.style.display = 'none';
    });

    arenaVideo.addEventListener('loadeddata', () => {
      videoFallback.classList.remove('active');
      arenaVideo.style.display = 'block';
    });

    function closeVideoModal() {
      videoModal.classList.remove('open');
      videoModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      arenaVideo.pause();
      arenaVideo.currentTime = 0;
      arenaVideo.removeAttribute('src');
      arenaVideo.load();
    }

    videoCards.forEach(card => {
      card.addEventListener('click', () => {
        openVideoModal(card.dataset.videoSrc, card.dataset.videoPoster);
      });
    });

    videoModalClose.addEventListener('click', closeVideoModal);
    videoModal.addEventListener('click', (event) => {
      if (event.target === videoModal) closeVideoModal();
    });

    window.addEventListener('keydown', (event) => {
      if (photoModal.classList.contains('open')) {
        if (event.key === 'Escape') closePhotoModal();
        if (event.key === 'ArrowLeft') showPhotoPrev();
        if (event.key === 'ArrowRight') showPhotoNext();
      }
      if (videoModal.classList.contains('open') && event.key === 'Escape') {
        closeVideoModal();
      }
    });

    document.querySelectorAll('[data-video-wrapper]').forEach(wrapper => {
      const video = wrapper.querySelector('video');
      if (!video) return;
      video.addEventListener('error', () => {
        wrapper.classList.add('fallback');
      });
      video.addEventListener('loadeddata', () => {
        wrapper.classList.remove('fallback');
      });
    });

    const backToTop = document.getElementById('backToTop');
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

document.addEventListener('DOMContentLoaded', () => {
  (function initFAQ(){
    const items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach((item) => {
      const btn = item.querySelector('.faq-question');
      const ans = item.querySelector('.faq-answer');
      const icon = item.querySelector('.faq-icon');

      if (!btn || !ans) return;

      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // fecha todos
        items.forEach(i => {
          i.classList.remove('open');
          const a = i.querySelector('.faq-answer');
          const ic = i.querySelector('.faq-icon');
          if (a) a.style.maxHeight = '0px';
          if (ic) ic.textContent = '+';
        });

        // abre o clicado
        if (!isOpen) {
          item.classList.add('open');
          ans.style.maxHeight = ans.scrollHeight + 'px';
          if (icon) icon.textContent = '−';
        }
      });
    });
  })();
});

(() => {
  let isPlaying = false;
  let ytPlayer = null;
  let ytReady = false;
  let ytPendingToggle = false;

  function setButton(btn) {
    if (!btn) return;
    btn.textContent = isPlaying ? '🎵 Desativar música' : '🎵 Ativar música';
    btn.setAttribute('aria-label', isPlaying ? 'Desativar música' : 'Ativar música');
  }

  function playYouTube() {
    if (!ytPlayer) return;
    ytPlayer.setVolume(60);
    ytPlayer.playVideo();
  }

  function pauseYouTube() {
    if (!ytPlayer) return;
    ytPlayer.pauseVideo();
  }

  function ensurePlayer(videoId) {
    if (ytPlayer || !ytReady || !videoId || !window.YT || !window.YT.Player) return;

    let wrapper = document.getElementById('ytMusicWrapper');
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.id = 'ytMusicWrapper';
      wrapper.style.position = 'fixed';
      wrapper.style.right = '0px';
      wrapper.style.bottom = '0px';
      wrapper.style.width = '1px';
      wrapper.style.height = '1px';
      wrapper.style.opacity = '0.01';
      wrapper.style.pointerEvents = 'none';
      wrapper.style.overflow = 'hidden';
      const playerDiv = document.createElement('div');
      playerDiv.id = 'ytMusicPlayer';
      wrapper.appendChild(playerDiv);
      document.body.appendChild(wrapper);
    }

    ytPlayer = new YT.Player('ytMusicPlayer', {
      videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        loop: 1,
        modestbranding: 1,
        playsinline: 1,
        playlist: videoId,
        origin: window.location.origin
      },
      events: {
        onReady: () => {
          if (ytPendingToggle) {
            ytPendingToggle = false;
            playYouTube();
          }
        }
      }
    });
  }

  function initYouTubeMusic(videoId) {
    if (!videoId) return;
    if (window.YT && window.YT.Player) {
      ytReady = true;
      ensurePlayer(videoId);
      return;
    }
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousReady === 'function') previousReady();
      ytReady = true;
      ensurePlayer(videoId);
      if (ytPendingToggle) {
        ytPendingToggle = false;
        playYouTube();
      }
    };
  }

  document.addEventListener('DOMContentLoaded', () => {
    let btn = document.getElementById('musicToggleBtn');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'musicToggleBtn';
      btn.className = 'floating-btn';
      btn.style.borderRadius = '999px';
      btn.style.width = 'auto';
      btn.style.padding = '0 16px';
      btn.style.fontWeight = '700';
      document.body.appendChild(btn);
    }

    setButton(btn);

    const youtubeId = btn.dataset.youtubeId;
    let bgMusic = null;

    if (youtubeId) {
      initYouTubeMusic(youtubeId);
    }

    btn.addEventListener('click', () => {
      if (youtubeId) {
        if (!ytReady || !ytPlayer) {
          ytPendingToggle = true;
          initYouTubeMusic(youtubeId);
          return;
        }

        if (isPlaying) {
          pauseYouTube();
          isPlaying = false;
          setButton(btn);
          return;
        }

        playYouTube();
        isPlaying = true;
        setButton(btn);
        return;
      }

      if (!bgMusic) {
        bgMusic = new Audio('Videos/VideoPrincipal.mp4');
        bgMusic.loop = true;
        bgMusic.volume = 0.6;
      }

      if (bgMusic.paused) {
        bgMusic.play().then(() => {
          isPlaying = true;
          setButton(btn);
        }).catch(() => {});
      } else {
        bgMusic.pause();
        isPlaying = false;
        setButton(btn);
      }
    });
  });
})();
