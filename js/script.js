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

  // Ringue interativo da experiência Aurum
  const experiencePoints = [
    {
      id: 1,
      title: 'Metodologia Olímpica',
      description: 'Fundamentos consistentes, progressão técnica e leitura estratégica do boxe.',
      tag: 'Base · Técnica · Tática',
      symbol: '✦'
    },
    {
      id: 2,
      title: 'Treino técnico',
      description: 'Movimentos treinados com intenção, correção e qualidade em cada repetição.',
      tag: '',
      symbol: '◎'
    },
    {
      id: 3,
      title: 'Estratégia e disciplina',
      description: 'Foco para tomar decisões melhores dentro e fora do ringue.',
      tag: '',
      symbol: '◇'
    },
    {
      id: 4,
      title: 'Alto condicionamento',
      description: 'Resistência, coordenação e potência construídas com progressão segura.',
      tag: '',
      symbol: '↗'
    },
    {
      id: 5,
      title: 'Ambiente premium',
      description: 'Uma atmosfera que eleva o foco e transforma o treino em ritual.',
      tag: '',
      symbol: 'A'
    },
    {
      id: 6,
      title: 'Acompanhamento próximo',
      description: 'Orientação atenta para evoluir no seu ritmo e com segurança.',
      tag: '',
      symbol: '＋'
    }
  ];

  const experienceRing = document.querySelector('[data-experience-ring]');
  const interactiveRing = experienceRing?.querySelector('[data-interactive-ring]');
  const ringScene = experienceRing?.querySelector('[data-ring-scene]');
  const experiencePanel = experienceRing?.querySelector('.experience-panel');
  const experienceHotspots = [...(experienceRing?.querySelectorAll('[data-experience-point]') || [])];
  const experienceIndexButtons = [...(experienceRing?.querySelectorAll('[data-experience-index]') || [])];

  if (experienceRing && interactiveRing && ringScene && experiencePanel && experienceHotspots.length === experiencePoints.length) {
    const panelNumber = experiencePanel.querySelector('[data-panel-number]');
    const panelSymbol = experiencePanel.querySelector('[data-panel-symbol]');
    const panelTitle = experiencePanel.querySelector('[data-panel-title]');
    const panelDescription = experiencePanel.querySelector('[data-panel-description]');
    const panelTag = experiencePanel.querySelector('[data-panel-tag]');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let pinnedExperienceIndex = 0;
    let displayedExperienceIndex = -1;
    let panelTransitionTimer = 0;
    let ringPointerFrame = 0;

    const updateExperiencePanel = (index, animate = true) => {
      const point = experiencePoints[index];
      if (!point) return;

      experienceHotspots.forEach((hotspot, hotspotIndex) => {
        const selected = hotspotIndex === index;
        hotspot.classList.toggle('is-active', selected);
        hotspot.setAttribute('aria-selected', String(selected));
        hotspot.setAttribute('tabindex', selected ? '0' : '-1');
      });

      experienceIndexButtons.forEach((button, buttonIndex) => {
        const selected = buttonIndex === index;
        button.classList.toggle('is-active', selected);
        button.setAttribute('aria-selected', String(selected));
        button.setAttribute('tabindex', selected ? '0' : '-1');
      });

      if (index === displayedExperienceIndex) return;
      displayedExperienceIndex = index;
      window.clearTimeout(panelTransitionTimer);
      if (animate && !reducedMotion) experiencePanel.classList.add('is-changing');

      panelTransitionTimer = window.setTimeout(() => {
        if (panelNumber) panelNumber.textContent = String(point.id).padStart(2, '0');
        if (panelSymbol) panelSymbol.textContent = point.symbol;
        if (panelTitle) panelTitle.textContent = point.title;
        if (panelDescription) panelDescription.textContent = point.description;
        if (panelTag) panelTag.textContent = point.tag;
        experiencePanel.style.setProperty('--panel-progress', `${((index + 1) / experiencePoints.length) * 100}%`);
        experiencePanel.setAttribute('aria-label', `${String(point.id).padStart(2, '0')} — ${point.title}`);
        experiencePanel.classList.remove('is-changing');
      }, animate && !reducedMotion ? 120 : 0);
    };

    const pinExperiencePoint = (index, focusTarget = false) => {
      pinnedExperienceIndex = index;
      updateExperiencePanel(index);
      if (focusTarget) experienceHotspots[index]?.focus();
    };

    const handleExperienceKeys = (event, index) => {
      const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
      if (!keys.includes(event.key)) return;
      event.preventDefault();

      let nextIndex = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % experiencePoints.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + experiencePoints.length) % experiencePoints.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = experiencePoints.length - 1;
      pinExperiencePoint(nextIndex, true);
    };

    experienceHotspots.forEach((hotspot, index) => {
      const point = experiencePoints[index];
      hotspot.setAttribute('aria-label', `${String(point.id).padStart(2, '0')} — ${point.title}`);
      hotspot.addEventListener('mouseenter', () => updateExperiencePanel(index));
      hotspot.addEventListener('mouseleave', () => updateExperiencePanel(pinnedExperienceIndex));
      hotspot.addEventListener('focus', () => updateExperiencePanel(index));
      hotspot.addEventListener('blur', () => updateExperiencePanel(pinnedExperienceIndex));
      hotspot.addEventListener('click', () => pinExperiencePoint(index));
      hotspot.addEventListener('keydown', (event) => handleExperienceKeys(event, index));
    });

    experienceIndexButtons.forEach((button, index) => {
      const point = experiencePoints[index];
      button.setAttribute('aria-label', `${String(point.id).padStart(2, '0')} — ${point.title}`);
      button.setAttribute('aria-controls', 'experiencePanel');
      button.addEventListener('click', () => pinExperiencePoint(index));
      button.addEventListener('keydown', (event) => handleExperienceKeys(event, index));
    });

    updateExperiencePanel(0, false);

    const gsap = window.gsap;
    const rotateRingX = gsap ? gsap.quickTo(ringScene, 'rotationX', { duration: 0.75, ease: 'power3.out' }) : null;
    const rotateRingY = gsap ? gsap.quickTo(ringScene, 'rotationY', { duration: 0.75, ease: 'power3.out' }) : null;
    const moveRingX = gsap ? gsap.quickTo(ringScene, 'x', { duration: 0.8, ease: 'power3.out' }) : null;
    const moveRingY = gsap ? gsap.quickTo(ringScene, 'y', { duration: 0.8, ease: 'power3.out' }) : null;

    if (gsap) gsap.set(ringScene, { transformPerspective: 1100, transformOrigin: '50% 55%' });

    interactiveRing.addEventListener('pointermove', (event) => {
      if (reducedMotion || !finePointer.matches) return;
      if (ringPointerFrame) window.cancelAnimationFrame(ringPointerFrame);
      ringPointerFrame = window.requestAnimationFrame(() => {
        const rect = interactiveRing.getBoundingClientRect();
        const pointerX = clamp((event.clientX - rect.left) / rect.width);
        const pointerY = clamp((event.clientY - rect.top) / rect.height);
        const normalizedX = (pointerX - 0.5) * 2;
        const normalizedY = (pointerY - 0.5) * 2;

        interactiveRing.style.setProperty('--spotlight-x', `${(pointerX * 100).toFixed(2)}%`);
        interactiveRing.style.setProperty('--spotlight-y', `${(pointerY * 100).toFixed(2)}%`);

        if (rotateRingX && rotateRingY && moveRingX && moveRingY) {
          rotateRingX(normalizedY * -1.4);
          rotateRingY(normalizedX * 1.8);
          moveRingX(normalizedX * 4);
          moveRingY(normalizedY * 3);
        } else {
          ringScene.style.transform = `rotateX(${normalizedY * -1.4}deg) rotateY(${normalizedX * 1.8}deg) translate3d(${normalizedX * 4}px, ${normalizedY * 3}px, 0)`;
        }
      });
    });

    interactiveRing.addEventListener('pointerleave', () => {
      interactiveRing.style.setProperty('--spotlight-x', '50%');
      interactiveRing.style.setProperty('--spotlight-y', '42%');
      updateExperiencePanel(pinnedExperienceIndex);
      if (rotateRingX && rotateRingY && moveRingX && moveRingY) {
        rotateRingX(0);
        rotateRingY(0);
        moveRingX(0);
        moveRingY(0);
      } else {
        ringScene.style.transform = '';
      }
    });

    if (!reducedMotion && gsap && window.ScrollTrigger) {
      gsap.registerPlugin(window.ScrollTrigger);
      const experienceIntro = document.querySelector('[data-experience-intro]');
      const ringRopes = experienceRing.querySelectorAll('.ring-rope');
      const entranceTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: experienceRing,
          start: 'top 78%',
          once: true
        }
      });

      entranceTimeline
        .from(experienceIntro, { autoAlpha: 0, y: 32, duration: 0.55, ease: 'power3.out' })
        .from(interactiveRing, { autoAlpha: 0, y: 42, scale: 0.965, duration: 0.68, ease: 'power3.out' }, '-=0.2')
        .fromTo(ringRopes, { strokeDasharray: 900, strokeDashoffset: 900, autoAlpha: 0.12 }, { strokeDashoffset: 0, autoAlpha: 0.74, duration: 0.72, stagger: 0.08, ease: 'power2.out' }, '-=0.34')
        .from(experienceHotspots, { autoAlpha: 0, scale: 0.25, duration: 0.42, stagger: 0.07, ease: 'back.out(1.5)' }, '-=0.38')
        .from(experiencePanel, { autoAlpha: 0, x: 24, duration: 0.48, ease: 'power3.out' }, '-=0.25');
    }
  }

  // Os quatro rounds da transformação
  const transformationRounds = [
    {
      id: 1,
      slug: 'tecnica',
      title: 'Técnica',
      phrase: 'Precisão antes da força.',
      description: 'Cada movimento é construído para ser mais limpo, eficiente e consciente.',
      imageQuote: 'Antes do golpe, existe a decisão.'
    },
    {
      id: 2,
      slug: 'foco',
      title: 'Foco',
      phrase: 'Presença em cada decisão.',
      description: 'Aprender a ler, reagir e manter a mente presente mesmo quando a intensidade aumenta.',
      imageQuote: 'A luta começa antes do primeiro golpe.'
    },
    {
      id: 3,
      slug: 'constancia',
      title: 'Constância',
      phrase: 'Evolução construída no tempo.',
      description: 'A repetição certa transforma técnica em instinto e esforço em progresso real.',
      imageQuote: 'Campeões são construídos round após round.'
    },
    {
      id: 4,
      slug: 'performance',
      title: 'Performance',
      phrase: 'O resultado do processo.',
      description: 'Potência, resistência, velocidade e decisão aparecem quando toda a preparação trabalha em conjunto.',
      imageQuote: 'O resultado aparece quando o processo é respeitado.'
    }
  ];

  const transformationSection = document.querySelector('[data-transformation]');
  const transformationVisual = transformationSection?.querySelector('[data-transformation-visual]');
  const transformationImage = transformationSection?.querySelector('[data-transformation-image]');
  const transformationTabs = [...(transformationSection?.querySelectorAll('[data-transformation-round]') || [])];
  const transformationPanel = transformationSection?.querySelector('.transformation-panel');

  if (transformationSection && transformationVisual && transformationImage && transformationPanel && transformationTabs.length === transformationRounds.length) {
    const roundProgress = transformationPanel.querySelector('[data-round-progress]');
    const roundTitle = transformationPanel.querySelector('[data-round-title]');
    const roundPhrase = transformationPanel.querySelector('[data-round-phrase]');
    const roundDescription = transformationPanel.querySelector('[data-round-description]');
    const photoRound = transformationVisual.querySelector('[data-photo-round]');
    const photoLabel = transformationVisual.querySelector('[data-photo-label]');
    const photoQuote = transformationVisual.querySelector('[data-photo-quote]');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let pinnedRoundIndex = 0;
    let displayedRoundIndex = -1;
    let roundTransitionTimer = 0;
    let photoPointerFrame = 0;

    const updateTransformationRound = (index, animate = true) => {
      const round = transformationRounds[index];
      if (!round) return;

      transformationSection.dataset.activeRound = round.slug;
      transformationTabs.forEach((tab, tabIndex) => {
        const selected = tabIndex === index;
        tab.setAttribute('aria-selected', String(selected));
        tab.setAttribute('tabindex', selected ? '0' : '-1');
      });

      if (index === displayedRoundIndex) return;
      displayedRoundIndex = index;
      window.clearTimeout(roundTransitionTimer);
      if (animate && !reducedMotion) transformationPanel.classList.add('is-changing');

      roundTransitionTimer = window.setTimeout(() => {
        const number = String(round.id).padStart(2, '0');
        if (roundProgress) roundProgress.textContent = `${number} / 04`;
        if (roundTitle) roundTitle.textContent = round.title;
        if (roundPhrase) roundPhrase.textContent = round.phrase;
        if (roundDescription) roundDescription.textContent = round.description;
        if (photoRound) photoRound.textContent = `Round ${number}`;
        if (photoLabel) photoLabel.textContent = `${number} · ${round.title}`;
        if (photoQuote) photoQuote.textContent = round.imageQuote;
        transformationPanel.setAttribute('aria-labelledby', transformationTabs[index].id);
        transformationPanel.setAttribute('aria-label', `${number} de 04 — ${round.title}`);
        transformationPanel.classList.remove('is-changing');
      }, animate && !reducedMotion ? 120 : 0);
    };

    const pinTransformationRound = (index, focusTarget = false) => {
      pinnedRoundIndex = index;
      updateTransformationRound(index);
      if (focusTarget) transformationTabs[index]?.focus();
    };

    const handleTransformationKeys = (event, index) => {
      const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
      if (!keys.includes(event.key)) return;
      event.preventDefault();

      let nextIndex = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % transformationRounds.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + transformationRounds.length) % transformationRounds.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = transformationRounds.length - 1;
      pinTransformationRound(nextIndex, true);
    };

    transformationTabs.forEach((tab, index) => {
      const round = transformationRounds[index];
      tab.setAttribute('aria-label', `Round ${String(round.id).padStart(2, '0')} — ${round.title}`);
      tab.addEventListener('mouseenter', () => updateTransformationRound(index));
      tab.addEventListener('mouseleave', () => updateTransformationRound(pinnedRoundIndex));
      tab.addEventListener('focus', () => updateTransformationRound(index));
      tab.addEventListener('blur', () => updateTransformationRound(pinnedRoundIndex));
      tab.addEventListener('click', () => pinTransformationRound(index));
      tab.addEventListener('keydown', (event) => handleTransformationKeys(event, index));
    });

    updateTransformationRound(0, false);

    transformationVisual.addEventListener('pointermove', (event) => {
      if (reducedMotion || !finePointer.matches) return;
      if (photoPointerFrame) window.cancelAnimationFrame(photoPointerFrame);
      photoPointerFrame = window.requestAnimationFrame(() => {
        const rect = transformationVisual.getBoundingClientRect();
        const pointerX = clamp((event.clientX - rect.left) / rect.width);
        const pointerY = clamp((event.clientY - rect.top) / rect.height);
        const normalizedX = (pointerX - 0.5) * 2;
        const normalizedY = (pointerY - 0.5) * 2;

        transformationVisual.style.setProperty('--photo-x', `${(pointerX * 100).toFixed(2)}%`);
        transformationVisual.style.setProperty('--photo-y', `${(pointerY * 100).toFixed(2)}%`);
        transformationVisual.style.setProperty('--photo-shift-x', `${(normalizedX * -4).toFixed(2)}px`);
        transformationVisual.style.setProperty('--photo-shift-y', `${(normalizedY * -3).toFixed(2)}px`);
        transformationVisual.classList.add('is-pointer-active');
      });
    });

    transformationVisual.addEventListener('pointerleave', () => {
      transformationVisual.style.setProperty('--photo-x', '50%');
      transformationVisual.style.setProperty('--photo-y', '50%');
      transformationVisual.style.setProperty('--photo-shift-x', '0px');
      transformationVisual.style.setProperty('--photo-shift-y', '0px');
      transformationVisual.classList.remove('is-pointer-active');
    });

    if (!reducedMotion && window.gsap && window.ScrollTrigger) {
      const gsap = window.gsap;
      gsap.registerPlugin(window.ScrollTrigger);
      const transformationHeader = transformationSection.querySelector('.transformation-header');
      const transformationEntryTabs = transformationSection.querySelectorAll('.transformation-tabs button');

      gsap.timeline({
        scrollTrigger: {
          trigger: transformationSection,
          start: 'top 78%',
          once: true
        }
      })
        .from(transformationVisual, { autoAlpha: 0, x: -28, duration: 0.62, ease: 'power3.out' })
        .from(transformationHeader.children, { autoAlpha: 0, y: 22, duration: 0.46, stagger: 0.08, ease: 'power3.out' }, '-=0.32')
        .from(transformationEntryTabs, { autoAlpha: 0, y: 12, duration: 0.34, stagger: 0.06, ease: 'power2.out' }, '-=0.18')
        .from(transformationPanel, { autoAlpha: 0, x: 18, duration: 0.44, ease: 'power3.out' }, '-=0.2');
    }
  }

  // Campo de partículas reutilizável dos cards de Turmas
  const trainingCardConfigs = {
    foundation: {
      densityFactor: 1680,
      desktopRange: [136, 205],
      tabletRange: [96, 132],
      mobileRange: [58, 82],
      radius: 174,
      tabletRadius: 148,
      mobileRadius: 108,
      repulsion: 2.25,
      spring: 0.014,
      damping: 0.892,
      tangent: 0,
      trailAlpha: 0.23,
      trailLimit: 44,
      impact: 2.9,
      maxSpeed: 12
    },
    evolution: {
      densityFactor: 1500,
      desktopRange: [150, 218],
      tabletRange: [108, 142],
      mobileRange: [64, 90],
      radius: 190,
      tabletRadius: 158,
      mobileRadius: 116,
      repulsion: 2.48,
      spring: 0.012,
      damping: 0.915,
      tangent: 0.13,
      trailAlpha: 0.27,
      trailLimit: 52,
      impact: 3.05,
      maxSpeed: 13
    },
    performance: {
      densityFactor: 1580,
      desktopRange: [145, 212],
      tabletRange: [104, 138],
      mobileRange: [60, 86],
      radius: 178,
      tabletRadius: 152,
      mobileRadius: 110,
      repulsion: 3.2,
      spring: 0.027,
      damping: 0.847,
      tangent: 0.035,
      trailAlpha: 0.32,
      trailLimit: 58,
      impact: 3.6,
      maxSpeed: 15
    }
  };

  const trainingCards = [...document.querySelectorAll('[data-card-particles]')];
  const trainingCardFields = [];
  let trainingCardScrollFrame = 0;

  const releaseTrainingCardPointersOnScroll = () => {
    if (trainingCardScrollFrame) return;
    trainingCardScrollFrame = window.requestAnimationFrame(() => {
      trainingCardScrollFrame = 0;
      trainingCardFields.forEach((field) => field.releasePointer());
    });
  };

  if (trainingCards.length && !reducedMotion) {
    class CardParticleField {
      constructor(card, config, variant) {
        this.card = card;
        this.canvas = card.querySelector('.class-card-particle-canvas');
        this.context = this.canvas?.getContext('2d', { alpha: true });
        this.config = config;
        this.variant = variant;
        this.finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
        this.particles = [];
        this.trails = [];
        this.trailPool = [];
        this.width = 0;
        this.height = 0;
        this.pixelRatio = 1;
        this.frame = 0;
        this.visible = true;
        this.settledFrames = 0;
        this.lastTrailTime = 0;
        this.touchTimer = 0;
        this.impact = { x: 0, y: 0, radius: 0, life: 0 };
        this.pointer = { x: -999, y: -999, lastX: -999, lastY: -999, dx: 0, dy: 0, speed: 0, time: 0, active: false };

        this.animate = this.animate.bind(this);
        this.handlePointerEnter = this.handlePointerEnter.bind(this);
        this.handlePointerMove = this.handlePointerMove.bind(this);
        this.handlePointerLeave = this.handlePointerLeave.bind(this);
        this.handlePointerDown = this.handlePointerDown.bind(this);

        if (!this.canvas || !this.context) return;

        this.card.addEventListener('pointerenter', this.handlePointerEnter, { passive: true });
        this.card.addEventListener('pointermove', this.handlePointerMove, { passive: true });
        this.card.addEventListener('pointerleave', this.handlePointerLeave, { passive: true });
        this.card.addEventListener('pointerdown', this.handlePointerDown, { passive: true });

        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(this.card);

        this.visibilityObserver = new IntersectionObserver(([entry]) => {
          this.visible = entry.isIntersecting;
          if (!this.visible && this.frame) {
            window.cancelAnimationFrame(this.frame);
            this.frame = 0;
          }
          if (this.visible) {
            this.draw();
            this.start();
          }
        }, { rootMargin: '140px 0px', threshold: 0.01 });
        this.visibilityObserver.observe(this.card);

        this.resize();
      }

      viewportTier() {
        if (window.innerWidth <= 700) return 'mobile';
        if (window.innerWidth <= 1100) return 'tablet';
        return 'desktop';
      }

      particleCount() {
        const tier = this.viewportTier();
        const range = this.config[`${tier}Range`];
        const densityScale = tier === 'mobile' ? 1.65 : tier === 'tablet' ? 1.45 : 1;
        const areaCount = Math.round((this.width * this.height) / (this.config.densityFactor * densityScale));
        return clamp(areaCount, range[0], range[1]);
      }

      interactionRadius() {
        const tier = this.viewportTier();
        const baseRadius = tier === 'mobile'
          ? this.config.mobileRadius
          : tier === 'tablet'
            ? this.config.tabletRadius
            : this.config.radius;
        const areaScale = clamp(Math.sqrt((this.width * this.height) / 250000), 0.88, 1.12);
        const maximum = tier === 'mobile' ? 126 : tier === 'tablet' ? 174 : 212;
        return Math.min(baseRadius * areaScale, this.width * 0.54, maximum);
      }

      usesDesktopPointer() {
        return window.innerWidth > 900 && this.finePointer.matches;
      }

      resize() {
        const width = this.card.clientWidth;
        const height = this.card.clientHeight;
        if (!width || !height || !this.context || !this.canvas) return;

        this.width = width;
        this.height = height;
        this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        this.canvas.width = Math.round(width * this.pixelRatio);
        this.canvas.height = Math.round(height * this.pixelRatio);
        this.context.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
        this.createParticles();
        this.draw();
      }

      createParticles() {
        const count = this.particleCount();
        const aspect = Math.max(this.width / this.height, 0.45);
        const columns = Math.max(4, Math.ceil(Math.sqrt(count * aspect)));
        const rows = Math.ceil(count / columns);
        this.particles.length = 0;

        for (let index = 0; index < count; index += 1) {
          const column = index % columns;
          const row = Math.floor(index / columns);
          let homeX = ((column + 0.5) / columns) * this.width;
          let homeY = ((row + 0.5) / rows) * this.height;

          if (this.variant === 'foundation') {
            homeX += (Math.random() - 0.5) * (this.width / columns) * 0.32;
            homeY += (Math.random() - 0.5) * (this.height / rows) * 0.26;
          } else if (this.variant === 'evolution') {
            const flow = (index * 0.61803398875) % 1;
            homeX = (0.08 + flow * 0.84) * this.width;
            homeY = (0.07 + ((index + 0.5) / count) * 0.86) * this.height;
            homeX += Math.sin(index * 1.7) * Math.min(18, this.width * 0.035);
          } else {
            homeX += (Math.random() - 0.5) * (this.width / columns) * 0.18;
            homeY += (Math.random() - 0.5) * (this.height / rows) * 0.2;
          }

          const sizeSeed = Math.random();
          const isDistant = sizeSeed < 0.65;
          const isIntermediate = sizeSeed >= 0.65 && sizeSeed < 0.9;
          const depth = isDistant
            ? 0.56 + Math.random() * 0.2
            : isIntermediate
              ? 0.82 + Math.random() * 0.18
              : 1.08 + Math.random() * 0.22;
          const radius = isDistant
            ? 1 + Math.random() * 1.5
            : isIntermediate
              ? 3 + Math.random() * 2
              : 6 + Math.random() * 4;
          const goldChance = this.variant === 'evolution' ? 0.085 : 0.07;
          const gold = Math.random() < goldChance;
          const opacity = isDistant
            ? 0.1 + Math.random() * 0.1
            : isIntermediate
              ? 0.18 + Math.random() * 0.17
              : 0.26 + Math.random() * 0.19;
          const graphite = isDistant ? '104, 106, 105' : isIntermediate ? '137, 137, 132' : '162, 158, 148';

          this.particles.push({
            x: homeX,
            y: homeY,
            homeX,
            homeY,
            vx: 0,
            vy: 0,
            radius,
            depth,
            gold,
            opacity,
            color: gold ? `rgba(211, 169, 82, ${Math.min(opacity * 1.04, 0.44)})` : `rgba(${graphite}, ${opacity})`
          });
        }

        this.card.dataset.particleCount = String(count);
      }

      localPoint(event) {
        const rect = this.card.getBoundingClientRect();
        return {
          x: clamp(event.clientX - rect.left, 0, this.width),
          y: clamp(event.clientY - rect.top, 0, this.height),
          normalizedX: clamp((event.clientX - rect.left) / rect.width),
          normalizedY: clamp((event.clientY - rect.top) / rect.height)
        };
      }

      updatePointer(event, createTrail = true) {
        const point = this.localPoint(event);
        const previousX = this.pointer.x;
        const previousY = this.pointer.y;
        const now = performance.now();
        const elapsed = this.pointer.time ? clamp(now - this.pointer.time, 8, 40) : 16.67;
        const timeScale = 16.67 / elapsed;
        this.pointer.lastX = previousX;
        this.pointer.lastY = previousY;
        this.pointer.x = point.x;
        this.pointer.y = point.y;
        this.pointer.dx = previousX < -100 ? 0 : clamp((point.x - previousX) * timeScale, -28, 28);
        this.pointer.dy = previousY < -100 ? 0 : clamp((point.y - previousY) * timeScale, -28, 28);
        this.pointer.speed = Math.min(Math.hypot(this.pointer.dx, this.pointer.dy), 28);
        this.pointer.time = now;

        this.card.style.setProperty('--card-pointer-x', `${(point.normalizedX * 100).toFixed(2)}%`);
        this.card.style.setProperty('--card-pointer-y', `${(point.normalizedY * 100).toFixed(2)}%`);

        const tiltX = (point.normalizedY - 0.5) * -1.5;
        const tiltY = (point.normalizedX - 0.5) * 1.7;
        this.card.style.transform = `perspective(1100px) translateY(-10px) rotateX(${tiltX.toFixed(3)}deg) rotateY(${tiltY.toFixed(3)}deg)`;

        if (createTrail) this.spawnTrail();
      }

      spawnTrail() {
        const now = performance.now();
        const speed = this.pointer.speed;
        if (speed < 1.8 || now - this.lastTrailTime < 18) return;
        this.lastTrailTime = now;
        const amount = Math.min(4, 1 + (speed > 9 ? 1 : 0) + (speed > 18 ? 1 : 0) + (speed > 23 && this.variant === 'performance' ? 1 : 0));

        for (let index = 0; index < amount; index += 1) {
          const offset = Math.random() * 0.82;
          const trail = this.trailPool.pop() || {};
          trail.x = this.pointer.x - this.pointer.dx * offset + (Math.random() - 0.5) * 10;
          trail.y = this.pointer.y - this.pointer.dy * offset + (Math.random() - 0.5) * 10;
          trail.vx = -this.pointer.dx * 0.045 + (Math.random() - 0.5) * 0.7;
          trail.vy = -this.pointer.dy * 0.045 + (Math.random() - 0.5) * 0.7;
          trail.radius = 0.9 + Math.random() * 2.2;
          trail.life = 1;
          trail.decay = 0.024 + Math.random() * 0.03;
          trail.alpha = this.config.trailAlpha * (0.72 + Math.random() * 0.28);
          trail.gold = Math.random() < 0.18;
          this.trails.push(trail);
        }

        while (this.trails.length > this.config.trailLimit) {
          const trail = this.trails.shift();
          if (trail) this.trailPool.push(trail);
        }
      }

      impactAt(x, y, strength = this.config.impact) {
        const tier = this.viewportTier();
        const radius = tier === 'mobile' ? Math.min(this.interactionRadius() * 1.2, 138) : Math.min(this.interactionRadius() * 0.86, 160);
        for (let index = 0; index < this.particles.length; index += 1) {
          const particle = this.particles[index];
          const dx = particle.x - x;
          const dy = particle.y - y;
          const distance = Math.max(Math.hypot(dx, dy), 1);
          if (distance > radius) continue;
          const force = Math.pow(1 - distance / radius, 1.15) * strength * particle.depth;
          particle.vx += (dx / distance) * force;
          particle.vy += (dy / distance) * force;
        }

        this.impact.x = x;
        this.impact.y = y;
        this.impact.radius = radius;
        this.impact.life = 1;
        this.settledFrames = 0;
        this.start();
      }

      handlePointerEnter(event) {
        if (!this.usesDesktopPointer() || event.pointerType === 'touch') return;
        this.pointer.active = true;
        this.updatePointer(event, false);
        this.card.classList.add('is-particle-active');
        this.impactAt(this.pointer.x, this.pointer.y);
      }

      handlePointerMove(event) {
        if (!this.usesDesktopPointer() || event.pointerType === 'touch') return;
        this.pointer.active = true;
        this.card.classList.add('is-particle-active');
        this.updatePointer(event);
        this.settledFrames = 0;
        this.start();
      }

      handlePointerLeave(event) {
        if (event.pointerType === 'touch') return;
        this.releasePointer();
      }

      releasePointer() {
        this.pointer.active = false;
        this.pointer.x = -999;
        this.pointer.y = -999;
        this.pointer.dx = 0;
        this.pointer.dy = 0;
        this.pointer.speed = 0;
        this.pointer.time = 0;
        this.card.classList.remove('is-particle-active');
        this.card.style.setProperty('--card-pointer-x', '50%');
        this.card.style.setProperty('--card-pointer-y', '50%');
        this.card.style.transform = '';
        this.start();
      }

      handlePointerDown(event) {
        if (this.usesDesktopPointer() && event.pointerType !== 'touch') return;
        const point = this.localPoint(event);
        this.card.style.setProperty('--card-pointer-x', `${(point.normalizedX * 100).toFixed(2)}%`);
        this.card.style.setProperty('--card-pointer-y', `${(point.normalizedY * 100).toFixed(2)}%`);
        this.card.classList.add('is-touch-impact');
        this.impactAt(point.x, point.y, this.config.impact * 0.92);
        window.clearTimeout(this.touchTimer);
        this.touchTimer = window.setTimeout(() => this.card.classList.remove('is-touch-impact'), 440);
      }

      updatePhysics() {
        const influenceRadius = this.interactionRadius();
        const innerRadius = influenceRadius * 0.34;
        const speedBoost = 1 + (this.pointer.speed / 28) * 0.9;
        let moving = false;

        for (let index = 0; index < this.particles.length; index += 1) {
          const particle = this.particles[index];

          if (this.pointer.active) {
            const dx = particle.x - this.pointer.x;
            const dy = particle.y - this.pointer.y;
            const distance = Math.max(Math.hypot(dx, dy), 1);

            if (distance < influenceRadius) {
              const proximity = 1 - distance / influenceRadius;
              const depthResponse = 0.62 + particle.depth * 0.48;
              const voidForce = distance < innerRadius ? (1 - distance / innerRadius) * this.config.repulsion * 0.95 : 0;
              const force = (Math.pow(proximity, 1.45) * this.config.repulsion * speedBoost + voidForce) * depthResponse;
              const normalX = dx / distance;
              const normalY = dy / distance;
              const directionalCarry = 0.018 + particle.depth * 0.012;
              particle.vx += normalX * force + this.pointer.dx * proximity * directionalCarry;
              particle.vy += normalY * force + this.pointer.dy * proximity * directionalCarry;

              if (this.config.tangent) {
                const direction = Math.sign(this.pointer.dx + this.pointer.dy) || 1;
                particle.vx += -normalY * force * this.config.tangent * direction;
                particle.vy += normalX * force * this.config.tangent * direction;
              }
            }
          }

          const returnStrength = this.config.spring * (0.78 + particle.depth * 0.25);
          particle.vx += (particle.homeX - particle.x) * returnStrength;
          particle.vy += (particle.homeY - particle.y) * returnStrength;
          particle.vx *= this.config.damping;
          particle.vy *= this.config.damping;
          const particleSpeed = Math.hypot(particle.vx, particle.vy);
          const maximumSpeed = this.config.maxSpeed * (0.72 + particle.depth * 0.28);
          if (particleSpeed > maximumSpeed) {
            const speedLimit = maximumSpeed / particleSpeed;
            particle.vx *= speedLimit;
            particle.vy *= speedLimit;
          }
          particle.x += particle.vx;
          particle.y += particle.vy;

          if (Math.abs(particle.vx) + Math.abs(particle.vy) > 0.025 || Math.abs(particle.x - particle.homeX) + Math.abs(particle.y - particle.homeY) > 0.12) moving = true;
        }

        this.pointer.dx *= 0.82;
        this.pointer.dy *= 0.82;
        this.pointer.speed *= 0.8;

        for (let index = this.trails.length - 1; index >= 0; index -= 1) {
          const trail = this.trails[index];
          trail.x += trail.vx;
          trail.y += trail.vy;
          trail.vx *= 0.93;
          trail.vy *= 0.93;
          trail.life -= trail.decay;
          if (trail.life <= 0) {
            this.trails.splice(index, 1);
            this.trailPool.push(trail);
          }
        }

        if (this.impact.life > 0) this.impact.life = Math.max(0, this.impact.life - 0.055);
        return moving || this.trails.length > 0 || this.impact.life > 0;
      }

      draw() {
        if (!this.context || !this.width || !this.height) return;
        const context = this.context;
        context.clearRect(0, 0, this.width, this.height);

        for (let index = 0; index < this.particles.length; index += 1) {
          const particle = this.particles[index];
          const speed = Math.hypot(particle.vx, particle.vy);

          if (speed > 0.55) {
            context.beginPath();
            context.moveTo(particle.x, particle.y);
            context.lineTo(particle.x - particle.vx * (2.4 + particle.depth), particle.y - particle.vy * (2.4 + particle.depth));
            context.strokeStyle = particle.gold
              ? `rgba(216, 173, 85, ${Math.min(speed * 0.018 * particle.depth, 0.14)})`
              : `rgba(155, 153, 147, ${Math.min(speed * 0.011 * particle.depth, 0.085)})`;
            context.lineWidth = Math.max(0.45, particle.radius * 0.24);
            context.stroke();
          }

          context.beginPath();
          context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          context.fillStyle = particle.color;
          context.fill();
        }

        for (let index = 0; index < this.trails.length; index += 1) {
          const trail = this.trails[index];
          context.beginPath();
          context.arc(trail.x, trail.y, trail.radius, 0, Math.PI * 2);
          context.fillStyle = trail.gold
            ? `rgba(216, 173, 85, ${trail.alpha * trail.life})`
            : `rgba(169, 166, 157, ${trail.alpha * trail.life})`;
          context.fill();
        }

        if (this.impact.life > 0) {
          const progress = 1 - this.impact.life;
          context.beginPath();
          context.arc(this.impact.x, this.impact.y, 18 + progress * this.impact.radius, 0, Math.PI * 2);
          context.strokeStyle = `rgba(216, 173, 85, ${this.impact.life * 0.12})`;
          context.lineWidth = 1;
          context.stroke();
        }
      }

      animate() {
        this.frame = 0;
        if (!this.visible) return;
        const moving = this.updatePhysics();
        this.draw();

        if (!this.pointer.active && !moving) {
          this.settledFrames += 1;
          if (this.settledFrames > 5) {
            for (let index = 0; index < this.particles.length; index += 1) {
              const particle = this.particles[index];
              particle.x = particle.homeX;
              particle.y = particle.homeY;
              particle.vx = 0;
              particle.vy = 0;
            }
            this.draw();
            return;
          }
        } else {
          this.settledFrames = 0;
        }

        this.start();
      }

      start() {
        if (!this.visible || this.frame) return;
        this.frame = window.requestAnimationFrame(this.animate);
      }

      destroy() {
        if (this.frame) window.cancelAnimationFrame(this.frame);
        window.clearTimeout(this.touchTimer);
        this.resizeObserver?.disconnect();
        this.visibilityObserver?.disconnect();
        this.card.removeEventListener('pointerenter', this.handlePointerEnter);
        this.card.removeEventListener('pointermove', this.handlePointerMove);
        this.card.removeEventListener('pointerleave', this.handlePointerLeave);
        this.card.removeEventListener('pointerdown', this.handlePointerDown);
      }
    }

    trainingCards.forEach((card) => {
      const variant = card.dataset.cardParticles;
      const config = trainingCardConfigs[variant];
      if (!config) return;
      const field = new CardParticleField(card, config, variant);
      if (field.context) trainingCardFields.push(field);
    });

    window.addEventListener('scroll', releaseTrainingCardPointersOnScroll, { passive: true });
  }

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

  // Vídeo cinematográfico da seção Estrutura
  const structureVideoSection = document.querySelector('[data-structure-video-section]');
  const structureVideoStage = structureVideoSection?.querySelector('[data-structure-video-stage]');
  const structureVideoFrame = structureVideoSection?.querySelector('[data-structure-video-frame]');
  const structureVideo = structureVideoSection?.querySelector('[data-structure-video]');
  const structurePlayButton = structureVideoSection?.querySelector('[data-structure-play]');
  const structurePlayIcon = structureVideoSection?.querySelector('[data-structure-play-icon]');
  const structurePlayLabel = structureVideoSection?.querySelector('[data-structure-play-label]');
  const structureSoundButton = structureVideoSection?.querySelector('[data-structure-sound]');
  const structureSoundLabel = structureVideoSection?.querySelector('[data-structure-sound-label]');
  const structureFallbackButton = structureVideoSection?.querySelector('[data-structure-fallback]');
  let structureVideoObserver = null;
  let structurePointerFrame = 0;

  if (structureVideoStage && structureVideoFrame && structureVideo && structurePlayButton && structureSoundButton && structureFallbackButton) {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let isPlaybackZoneActive = false;
    let hasVideoEnded = false;

    structureVideo.defaultMuted = true;
    structureVideo.muted = true;
    structureVideo.volume = 0.9;

    const updateStructureVideoControls = () => {
      const isPlaying = !structureVideo.paused && !structureVideo.ended;
      const hasSound = !structureVideo.muted;

      structurePlayButton.setAttribute('aria-pressed', String(isPlaying));
      structurePlayButton.setAttribute('aria-label', isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo');
      if (structurePlayIcon) structurePlayIcon.textContent = isPlaying ? 'Ⅱ' : '▶';
      if (structurePlayLabel) structurePlayLabel.textContent = isPlaying ? 'Pausar' : 'Reproduzir';

      structureSoundButton.setAttribute('aria-pressed', String(hasSound));
      structureSoundButton.setAttribute('aria-label', hasSound ? 'Silenciar vídeo' : 'Ativar som');
      if (structureSoundLabel) structureSoundLabel.textContent = hasSound ? 'Silenciar' : 'Ativar som';
    };

    const playStructureVideo = async (restart = false) => {
      if (restart || structureVideo.ended) {
        structureVideo.currentTime = 0;
        hasVideoEnded = false;
      }

      try {
        await structureVideo.play();
        structureFallbackButton.hidden = true;
      } catch {
        structureFallbackButton.hidden = false;
        updateStructureVideoControls();
      }
    };

    structurePlayButton.addEventListener('click', () => {
      if (structureVideo.paused || structureVideo.ended) {
        playStructureVideo(structureVideo.ended);
      } else {
        structureVideo.pause();
      }
    });

    structureFallbackButton.addEventListener('click', () => playStructureVideo(structureVideo.ended));

    structureSoundButton.addEventListener('click', () => {
      structureVideo.muted = !structureVideo.muted;
      updateStructureVideoControls();
    });

    structureVideo.addEventListener('play', () => {
      structureFallbackButton.hidden = true;
      updateStructureVideoControls();
    });
    structureVideo.addEventListener('pause', updateStructureVideoControls);
    structureVideo.addEventListener('volumechange', updateStructureVideoControls);
    structureVideo.addEventListener('ended', () => {
      hasVideoEnded = true;
      updateStructureVideoControls();
    });
    structureVideo.addEventListener('error', () => {
      structureFallbackButton.hidden = false;
      updateStructureVideoControls();
    });

    structureVideoObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.12) structureVideoStage.classList.add('is-video-visible');

      if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
        if (!isPlaybackZoneActive) {
          isPlaybackZoneActive = true;
          if (reducedMotion) {
            structureFallbackButton.hidden = false;
          } else {
            playStructureVideo(hasVideoEnded);
          }
        }
      } else if (isPlaybackZoneActive && entry.intersectionRatio < 0.16) {
        isPlaybackZoneActive = false;
        structureVideo.pause();
      }
    }, { threshold: [0, 0.12, 0.16, 0.35, 0.5] });
    structureVideoObserver.observe(structureVideoFrame);

    structureVideoStage.addEventListener('pointermove', (event) => {
      if (reducedMotion || !finePointer.matches) return;
      if (structurePointerFrame) window.cancelAnimationFrame(structurePointerFrame);
      structurePointerFrame = window.requestAnimationFrame(() => {
        const rect = structureVideoStage.getBoundingClientRect();
        const x = clamp((event.clientX - rect.left) / rect.width);
        const y = clamp((event.clientY - rect.top) / rect.height);
        structureVideoStage.style.setProperty('--structure-pointer-x', `${(x * 100).toFixed(2)}%`);
        structureVideoStage.style.setProperty('--structure-pointer-y', `${(y * 100).toFixed(2)}%`);
        structureVideoStage.classList.add('is-pointer-active');
      });
    });

    structureVideoStage.addEventListener('pointerleave', () => {
      structureVideoStage.style.setProperty('--structure-pointer-x', '50%');
      structureVideoStage.style.setProperty('--structure-pointer-y', '48%');
      structureVideoStage.classList.remove('is-pointer-active');
    });

    updateStructureVideoControls();
  }

  const currentYear = document.getElementById('currentYear');
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());

  window.addEventListener('beforeunload', () => {
    if (particleFrame) window.cancelAnimationFrame(particleFrame);
    if (trainingCardScrollFrame) window.cancelAnimationFrame(trainingCardScrollFrame);
    if (structurePointerFrame) window.cancelAnimationFrame(structurePointerFrame);
    structureVideoObserver?.disconnect();
    window.removeEventListener('scroll', releaseTrainingCardPointersOnScroll);
    trainingCardFields.forEach((field) => field.destroy());
  });
})();
