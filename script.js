const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelectorAll('.main-nav a');
const revealEls = document.querySelectorAll('.reveal');
const faqItems = document.querySelectorAll('.faq-item');
const visualButtons = document.querySelectorAll('.visual-btn');
const systemSizeEl = document.getElementById('systemSize');
const panelCountEl = document.getElementById('panelCount');
const outputEstimateEl = document.getElementById('outputEstimate');
const calculator = document.getElementById('solarCalculator');
const form = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

const specs = {
  home: { size: '3.0 kW', panels: '8 Panels', output: '350-400 units/mo' },
  'large-home': { size: '5.0 kW', panels: '14 Panels', output: '600-700 units/mo' },
  shop: { size: '4.5 kW', panels: '12 Panels', output: '520-620 units/mo' },
  office: { size: '6.0 kW', panels: '16 Panels', output: '700-850 units/mo' },
  farm: { size: '8.0 kW', panels: '20 Panels', output: '900-1100 units/mo' },
  commercial: { size: '12.0 kW', panels: '30 Panels', output: '1350-1600 units/mo' }
};

const calcResults = {
  capacity: document.getElementById('capacityResult'),
  generation: document.getElementById('generationResult'),
  savings: document.getElementById('savingsResult'),
  yearly: document.getElementById('yearlyResult'),
  payback: document.getElementById('paybackResult')
};

const updateCalculator = () => {
  const bill = Number(document.getElementById('bill').value || 0);
  const propertyType = document.getElementById('propertyType').value;
  const location = document.getElementById('location').value;
  const roofType = document.getElementById('roofType').value;

  const billFactor = bill / 2500;
  const propertyFactor = {
    home: 1,
    shop: 1.2,
    office: 1.4,
    farm: 1.7,
    commercial: 2
  }[propertyType] || 1;
  const locationFactor = {
    churu: 1,
    rural: 0.95,
    urban: 1.05
  }[location] || 1;
  const roofFactor = {
    flat: 1,
    sloped: 1.05,
    mixed: 0.92
  }[roofType] || 1;

  const capacityKw = Math.max(2.5, ((bill / 1000) * 0.95 * propertyFactor * locationFactor * roofFactor)).toFixed(1);
  const generation = Math.round((Number(capacityKw) * 130) * 1.15);
  const monthlySavings = Math.round(Math.min(bill * 0.65, bill * 0.82));
  const yearlySavings = monthlySavings * 12;
  const payback = (Math.max(4, (capacityKw * 9000) / (monthlySavings * 12))).toFixed(1);

  calcResults.capacity.textContent = `${capacityKw} kW`;
  calcResults.generation.textContent = `${generation} kWh`;
  calcResults.savings.textContent = `₹ ${monthlySavings.toLocaleString('en-IN')}`;
  calcResults.yearly.textContent = `₹ ${yearlySavings.toLocaleString('en-IN')}`;
  calcResults.payback.textContent = `~${payback} years`;
};

if (calculator) {
  calculator.addEventListener('submit', (event) => {
    event.preventDefault();
    updateCalculator();
  });
  updateCalculator();
}

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    header.classList.toggle('is-open');
    const expanded = header.classList.contains('is-open');
    menuToggle.setAttribute('aria-expanded', String(expanded));
  });
}

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    header.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const animatedHeadings = document.querySelectorAll('main section h2');

animatedHeadings.forEach((heading) => {
  const label = heading.textContent.trim().replace(/\s+/g, ' ');
  heading.setAttribute('aria-label', label);
  heading.classList.add('text-reveal');
  let wordIndex = 0;
  const wrapNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          fragment.append(document.createTextNode(part));
          return;
        }
        const span = document.createElement('span');
        span.className = 'text-word';
        span.style.setProperty('--word-index', wordIndex++);
        span.textContent = part;
        fragment.append(span);
      });
      return fragment;
    }
    const clone = node.cloneNode(false);
    node.childNodes.forEach((child) => clone.append(wrapNode(child)));
    return clone;
  };
  const content = document.createDocumentFragment();
  heading.childNodes.forEach((node) => content.append(wrapNode(node)));
  heading.replaceChildren(content);
});

if (!prefersReducedMotion.matches && window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  revealEls.forEach((el) => {
    const siblings = Array.from(el.parentElement.children).filter((item) => item.classList.contains('reveal'));
    const staggerDelay = Math.min(siblings.indexOf(el), 4) * 0.09;
    gsap.fromTo(el, { autoAlpha: 0, y: 34 }, {
      autoAlpha: 1,
      y: 0,
      duration: 0.9,
      delay: staggerDelay,
      ease: 'power3.out',
      onComplete: () => el.classList.add('visible'),
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true
      }
    });
  });

  gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 1.12 })
    .fromTo('.hero-copy > *', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.11 })
    .fromTo('.hero-visual', { clipPath: 'inset(12% 0 0 0 round 48% 48% 2px 2px)', scale: 0.96 }, { clipPath: 'inset(0 0 0 0 round 46% 46% 2px 2px)', scale: 1, duration: 1.25 }, '-=0.65');
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });
  revealEls.forEach((el) => observer.observe(el));
  document.querySelectorAll('.hero-copy > *').forEach((el, index) => {
    el.style.animation = `hero-arrive .75s cubic-bezier(.2,.7,.2,1) ${0.12 + index * 0.1}s both`;
  });
}

if (window.gsap && window.ScrollTrigger) {
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: () => header.classList.toggle('is-scrolled', window.scrollY > 24)
  });
} else {
  window.addEventListener('scroll', () => header.classList.toggle('is-scrolled', window.scrollY > 24), { passive: true });
}

if (!prefersReducedMotion.matches) {
  const parallaxHero = document.querySelector('.hero-bg');
  let scrollTicking = false;

  const updateParallax = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
    if (parallaxHero && window.innerWidth > 768) {
      parallaxHero.style.setProperty('--parallax-y', `${Math.min(window.scrollY * 0.12, 110)}px`);
    }
    scrollTicking = false;
  };

  updateParallax();
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      scrollTicking = true;
      window.requestAnimationFrame(updateParallax);
    }
  }, { passive: true });

  if (isFinePointer.matches) {
    document.querySelectorAll('.hero-visual').forEach((scene) => {
      scene.addEventListener('pointermove', (event) => {
        const bounds = scene.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width) * 100;
        const y = ((event.clientY - bounds.top) / bounds.height) * 100;
        scene.style.setProperty('--pointer-x', `${x}%`);
        scene.style.setProperty('--pointer-y', `${y}%`);
      });
      scene.addEventListener('pointerleave', () => {
        scene.style.removeProperty('--pointer-x');
        scene.style.removeProperty('--pointer-y');
      });
    });

    document.querySelectorAll('.hero-actions .btn-primary').forEach((button) => {
      button.addEventListener('pointermove', (event) => {
        const bounds = button.getBoundingClientRect();
        const x = (event.clientX - bounds.left - bounds.width / 2) * 0.12;
        const y = (event.clientY - bounds.top - bounds.height / 2) * 0.12;
        button.style.translate = `${x}px ${y}px`;
      });
      button.addEventListener('pointerleave', () => {
        button.style.removeProperty('translate');
      });
    });

    document.querySelectorAll('.solution-card, .feature-card, .system-card, .step').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        card.style.setProperty('--tilt-x', `${y * -3}deg`);
        card.style.setProperty('--tilt-y', `${x * 3}deg`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.removeProperty('--tilt-x');
        card.style.removeProperty('--tilt-y');
      });
    });
  }
}

faqItems.forEach((item) => {
  const question = item.querySelector('.faq-question');
  question.addEventListener('click', () => {
    const isOpen = item.classList.contains('active');
    faqItems.forEach((faq) => {
      faq.classList.remove('active');
      faq.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });

    if (!isOpen) {
      item.classList.add('active');
      question.setAttribute('aria-expanded', 'true');
    }
  });
});

visualButtons.forEach((button) => {
  button.addEventListener('click', () => {
    visualButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    const key = button.dataset.spec;
    const selected = specs[key];
    systemSizeEl.textContent = selected.size;
    panelCountEl.textContent = selected.panels;
    outputEstimateEl.textContent = selected.output;
  });
});

const counters = document.querySelectorAll('.stat-number');
const animateCounters = () => {
  counters.forEach((counter) => {
    const target = Number(counter.dataset.target ?? 0);
    const prefix = counter.dataset.prefix || '';
    const format = (value) => `${prefix}${Math.round(value).toLocaleString('en-IN')}`;
    if (prefersReducedMotion.matches) {
      counter.textContent = format(target);
      return;
    }

    const duration = 1400;
    const startedAt = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      counter.textContent = format(target * eased);
      if (progress < 1) window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
  });
};

document.addEventListener('DOMContentLoaded', () => {
  const statSection = document.querySelector('.stats-section');
  if (statSection) {
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounters();
          statObserver.disconnect();
        }
      });
    }, { threshold: 0.35 });
    statObserver.observe(statSection);
  }
});

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('name').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    const city = document.getElementById('city').value.trim();
    const bill = document.getElementById('billInput').value.trim();

    if (!name || !mobile || !city || !bill) {
      formStatus.textContent = 'Please fill in all required fields.';
      formStatus.className = 'form-status error';
      return;
    }

    if (mobile.length < 10) {
      formStatus.textContent = 'Please enter a valid mobile number.';
      formStatus.className = 'form-status error';
      return;
    }

    formStatus.textContent = 'Thank you! Your consultation request has been received. Call 9551181203 for immediate assistance.';
    formStatus.className = 'form-status success';
    form.reset();
  });
}
