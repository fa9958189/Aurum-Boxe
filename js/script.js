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

  const hero = document.getElementById('inicio');

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
  const storySticky = story?.querySelector('.story-sticky');
  const storyFrames = [...document.querySelectorAll('[data-story-frame]')];
  const storyScenes = [...document.querySelectorAll('[data-story-scene]')];
  const storySteps = [...document.querySelectorAll('.story-progress li')];
  const impactRings = story?.querySelector('.story-impact-rings');
  const storyVignetteGlow = story?.querySelector('.story-vignette');
  let currentScene = -1;
  let scrollTicking = false;

  const setActiveScene = (index) => {
    if (index === currentScene) return;
    currentScene = index;
    storyScenes.forEach((scene, sceneIndex) => scene.classList.toggle('active', sceneIndex === index));
    storySteps.forEach((step, stepIndex) => step.classList.toggle('active', stepIndex === index));
  };

  const setFallbackFrame = (index) => {
    storyFrames.forEach((frame, frameIndex) => frame.classList.toggle('active', frameIndex === index));
  };

  const updateHeaderAndHero = () => {
    const scrollY = window.scrollY;
    siteHeader?.classList.toggle('is-scrolled', scrollY > 24);

    if (hero && !reducedMotion) {
      hero.style.setProperty('--hero-scene-y', `${Math.min(scrollY * 0.035, 30)}px`);
    }

    if (story?.classList.contains('story-fallback') && !reducedMotion) {
      const rect = story.getBoundingClientRect();
      const scrollable = Math.max(story.offsetHeight - window.innerHeight, 1);
      const progress = clamp(-rect.top / scrollable);
      const sceneIndex = Math.min(storyScenes.length - 1, Math.floor(progress * storyScenes.length));
      setActiveScene(Math.max(0, sceneIndex));
      setFallbackFrame(Math.max(0, sceneIndex));

      if (impactRings) {
        const impactProgress = clamp((progress - 0.78) / 0.22);
        impactRings.style.opacity = String(impactProgress * 0.72);
        impactRings.style.transform = `scale(${0.35 + impactProgress * 0.9})`;
      }
    }

    scrollTicking = false;
  };

  const requestScrollUpdate = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateHeaderAndHero);
  };

  setActiveScene(0);
  setFallbackFrame(reducedMotion ? 2 : 0);

  if (story && storySticky && storyFrames.length === 4 && !reducedMotion && window.gsap && window.ScrollTrigger) {
    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);
    root.classList.add('gsap-story');

    gsap.set(storyFrames, { autoAlpha: 0, scale: 1.015 });
    gsap.set(storyFrames[0], { autoAlpha: 1 });
    gsap.set(impactRings, { autoAlpha: 0, scale: 0.35, transformOrigin: '50% 50%' });

    const storyTimeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: story,
        start: 'top top',
        end: () => `+=${window.innerHeight * (window.innerWidth <= 600 ? 3.2 : 4.2)}`,
        pin: storySticky,
        scrub: window.innerWidth <= 600 ? 0.35 : 0.75,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: ({ progress }) => {
          const sceneIndex = Math.min(3, Math.floor(progress * 4));
          setActiveScene(sceneIndex);
        }
      }
    });

    storyTimeline
      .addLabel('guard', 0)
      .to(storyFrames[0], { scale: 1.025, duration: 0.7 }, 0)
      .addLabel('punch', 0.72)
      .to(storyFrames[0], { autoAlpha: 0, duration: 0.28 }, 0.72)
      .fromTo(storyFrames[1], { autoAlpha: 0, scale: 1.015 }, { autoAlpha: 1, scale: 1.028, duration: 0.42 }, 0.72)
      .to(storyFrames[1], { xPercent: -0.35, duration: 0.58 }, 0.95)
      .addLabel('dodge', 1.55)
      .to(storyFrames[1], { autoAlpha: 0, duration: 0.3 }, 1.55)
      .fromTo(storyFrames[2], { autoAlpha: 0, scale: 1.02 }, { autoAlpha: 1, scale: 1.035, duration: 0.44 }, 1.55)
      .to(storyFrames[2], { xPercent: -0.45, duration: 0.58 }, 1.82)
      .addLabel('impact', 2.45)
      .to(storyFrames[2], { autoAlpha: 0, duration: 0.32 }, 2.45)
      .fromTo(storyFrames[3], { autoAlpha: 0, scale: 1.025 }, { autoAlpha: 1, scale: window.innerWidth <= 600 ? 1.045 : 1.075, duration: 0.72 }, 2.45)
      .to(impactRings, { autoAlpha: 0.62, scale: 1.18, duration: 0.6 }, 2.56)
      .to(storyVignetteGlow, { '--impact-glow': 0.42, duration: 0.55 }, 2.6)
      .to({}, { duration: 0.3 });
  } else if (story && !reducedMotion) {
    story.classList.add('story-fallback');
  }

  updateHeaderAndHero();
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
