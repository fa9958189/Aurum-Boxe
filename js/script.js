(() => {
  'use strict';

  const body = document.body;
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);

  body.classList.add('js-ready');

  // Header e navegação mobile
  const siteHeader = document.getElementById('siteHeader');
  const menuButton = document.getElementById('menuButton');
  const mobileMenu = document.getElementById('mobileMenu');

  const setMenuState = (open) => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    mobileMenu.setAttribute('aria-hidden', String(!open));
    mobileMenu.classList.toggle('open', open);
    body.classList.toggle('menu-open', open);
  };

  menuButton?.addEventListener('click', () => {
    setMenuState(menuButton.getAttribute('aria-expanded') !== 'true');
  });

  mobileMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuState(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
      setMenuState(false);
      menuButton.focus();
    }
  });

  // Animações de entrada progressivas
  const revealElements = document.querySelectorAll('[data-reveal]');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((element) => element.classList.add('visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    revealElements.forEach((element) => revealObserver.observe(element));
  }

  // Estado ativo da navegação
  const navigationLinks = [...document.querySelectorAll('.desktop-nav a')];
  const navigationTargets = navigationLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && navigationTargets.length) {
    const navigationObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navigationLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: '-36% 0px -52% 0px', threshold: 0.01 });

    navigationTargets.forEach((section) => navigationObserver.observe(section));
  }

  // Vídeo principal com fallback estático
  const hero = document.getElementById('inicio');
  const heroVideo = document.getElementById('heroVideo');

  if (heroVideo && hero) {
    const usePoster = () => hero.classList.add('video-failed');
    heroVideo.addEventListener('error', usePoster);
    heroVideo.addEventListener('loadeddata', () => {
      hero.classList.remove('video-failed');
      heroVideo.play().catch(usePoster);
    }, { once: true });
  }

  // Partículas leves da arena
  const particleCanvas = document.getElementById('particleCanvas');
  let particleFrame = 0;

  if (particleCanvas && !reducedMotion) {
    const context = particleCanvas.getContext('2d');
    let particles = [];
    let canvasWidth = 0;
    let canvasHeight = 0;
    let heroVisible = true;

    const makeParticles = () => {
      const count = Math.max(18, Math.min(42, Math.floor(canvasWidth / 38)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        size: Math.random() * 1.3 + 0.35,
        speed: Math.random() * 0.18 + 0.05,
        drift: (Math.random() - 0.5) * 0.09,
        alpha: Math.random() * 0.34 + 0.08
      }));
    };

    const resizeParticles = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvasWidth = particleCanvas.clientWidth;
      canvasHeight = particleCanvas.clientHeight;
      particleCanvas.width = Math.floor(canvasWidth * ratio);
      particleCanvas.height = Math.floor(canvasHeight * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      makeParticles();
    };

    const renderParticles = () => {
      if (!heroVisible) {
        particleFrame = 0;
        return;
      }

      context.clearRect(0, 0, canvasWidth, canvasHeight);
      particles.forEach((particle) => {
        context.beginPath();
        context.fillStyle = `rgba(238, 201, 118, ${particle.alpha})`;
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();

        particle.y -= particle.speed;
        particle.x += particle.drift;
        if (particle.y < -4) {
          particle.y = canvasHeight + 4;
          particle.x = Math.random() * canvasWidth;
        }
      });

      particleFrame = window.requestAnimationFrame(renderParticles);
    };

    resizeParticles();
    particleFrame = window.requestAnimationFrame(renderParticles);
    window.addEventListener('resize', resizeParticles, { passive: true });

    if ('IntersectionObserver' in window && hero) {
      const heroObserver = new IntersectionObserver(([entry]) => {
        heroVisible = entry.isIntersecting;
        if (heroVisible && !particleFrame) particleFrame = window.requestAnimationFrame(renderParticles);
      }, { threshold: 0.02 });
      heroObserver.observe(hero);
    }
  }

  // Narrativa cinematográfica controlada pelo scroll
  const story = document.querySelector('.scroll-story');
  const storyScenes = [...document.querySelectorAll('[data-story-scene]')];
  const storySteps = [...document.querySelectorAll('.story-progress li')];
  const heroGlove = document.getElementById('heroGlove');
  let currentScene = -1;
  let scrollTicking = false;

  const setActiveScene = (index) => {
    if (index === currentScene) return;
    currentScene = index;
    storyScenes.forEach((scene, sceneIndex) => scene.classList.toggle('active', sceneIndex === index));
    storySteps.forEach((step, stepIndex) => step.classList.toggle('active', stepIndex === index));
  };

  const updateScrollExperience = () => {
    const scrollY = window.scrollY;
    siteHeader?.classList.toggle('is-scrolled', scrollY > 24);

    if (heroGlove && !reducedMotion) {
      heroGlove.style.setProperty('--hero-glove-y', `${Math.min(scrollY * 0.12, 110)}px`);
    }

    if (story && !reducedMotion) {
      const rect = story.getBoundingClientRect();
      const scrollable = Math.max(story.offsetHeight - window.innerHeight, 1);
      const progress = clamp(-rect.top / scrollable);
      const impactProgress = clamp((progress - 0.73) / 0.27);
      const sceneIndex = Math.min(storyScenes.length - 1, Math.floor(progress * storyScenes.length));

      story.style.setProperty('--story-progress', progress.toFixed(4));
      story.style.setProperty('--impact-progress', impactProgress.toFixed(4));
      setActiveScene(Math.max(0, sceneIndex));
    }

    scrollTicking = false;
  };

  const requestScrollUpdate = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateScrollExperience);
  };

  setActiveScene(0);
  updateScrollExperience();
  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate, { passive: true });

  // FAQ acessível
  const faqItems = [...document.querySelectorAll('.faq-item')];
  faqItems.forEach((item) => {
    const button = item.querySelector('button');
    if (!button) return;

    button.addEventListener('click', () => {
      const willOpen = !item.classList.contains('open');
      faqItems.forEach((otherItem) => {
        otherItem.classList.remove('open');
        otherItem.querySelector('button')?.setAttribute('aria-expanded', 'false');
      });

      if (willOpen) {
        item.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Vídeo da estrutura em modal nativo
  const videoDialog = document.getElementById('videoDialog');
  const arenaVideo = document.getElementById('arenaVideo');
  const videoOpenButton = document.querySelector('[data-video-open]');
  const videoCloseButton = document.querySelector('[data-video-close]');

  const stopArenaVideo = () => {
    if (!arenaVideo) return;
    arenaVideo.pause();
    arenaVideo.currentTime = 0;
  };

  videoOpenButton?.addEventListener('click', () => {
    if (!videoDialog || !arenaVideo) return;
    const source = arenaVideo.querySelector('source[data-src]');
    if (source && !source.src) {
      source.src = source.dataset.src;
      arenaVideo.load();
    }
    videoDialog.showModal();
    arenaVideo.play().catch(() => {});
  });

  videoCloseButton?.addEventListener('click', () => videoDialog?.close());
  videoDialog?.addEventListener('close', stopArenaVideo);
  videoDialog?.addEventListener('click', (event) => {
    if (event.target === videoDialog) videoDialog.close();
  });

  const currentYear = document.getElementById('currentYear');
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());

  window.addEventListener('beforeunload', () => {
    if (particleFrame) window.cancelAnimationFrame(particleFrame);
  });
})();
