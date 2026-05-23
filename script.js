function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    const menuToggle = document.querySelector('.menu-toggle');
    const body = document.body;
    
    if (navLinks) {
        const isActive = navLinks.classList.toggle('active');
        if (body) {
            if (isActive) {
                body.classList.add('menu-open');
            } else {
                body.classList.remove('menu-open');
            }
        }
        if (menuToggle) {
            menuToggle.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        }
    }
}

function closeMenu() {
    const navLinks = document.getElementById('navLinks');
    const menuToggle = document.querySelector('.menu-toggle');
    if (navLinks && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        if (menuToggle) {
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
        document.body.classList.remove('menu-open');
    }
}

function toggleFAQ(element) {
    const faqItem = element.closest('.faq-item');
    const isActive = faqItem.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('active'));
    if (!isActive) faqItem.classList.add('active');
}

// Direct initialization of event handlers on .menu-toggle immediately on DOM load
function initMenuEvents() {
    const menuToggle = document.querySelector('.menu-toggle');
    if (!menuToggle) return;

    // Use clean flag check to prevent duplicate binding
    if (menuToggle.getAttribute('data-nav-bound') === 'true') return;
    menuToggle.setAttribute('data-nav-bound', 'true');

    // Clean, standard 'pointerup' event listener mapped strictly to the button itself (passive: true to bypass scroll thread blocking)
    menuToggle.addEventListener('pointerup', () => {
        toggleMenu();
    }, { passive: true });

    // Accessibility keydown support
    menuToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMenu();
        }
    });
}

// Lazy-loads heavy external third-party widgets (e.g. WhatsApp, trackers) 2 seconds after page load
function initLazyThirdParty() {
    window.addEventListener('load', () => {
        setTimeout(() => {
            // Find and initialize any external script tagged for lazy loading
            document.querySelectorAll('script[data-lazy-src]').forEach(script => {
                const src = script.getAttribute('data-lazy-src');
                if (src) {
                    const newScript = document.createElement('script');
                    newScript.src = src;
                    newScript.async = true;
                    Array.from(script.attributes).forEach(attr => {
                        if (attr.name !== 'data-lazy-src' && attr.name !== 'src') {
                            newScript.setAttribute(attr.name, attr.value);
                        }
                    });
                    script.parentNode.replaceChild(newScript, script);
                }
            });

            // Postpone any dynamically injected widgets or external scripts (e.g. WhatsApp widget loaders)
            if (typeof window.initWhatsAppWidget === 'function') {
                try {
                    window.initWhatsAppWidget();
                } catch (err) {
                    console.warn('Deferred WhatsApp widget loading failed:', err);
                }
            }
        }, 2000);
    }, { passive: true });
}

// Document-level clean click events
document.addEventListener('click', (e) => {
    const navLinks = document.getElementById('navLinks');
    
    // Close menu when clicking outside (does not intercept link behaviors)
    if (navLinks && navLinks.classList.contains('active') && !e.target.closest('#navLinks') && !e.target.closest('.menu-toggle')) {
        closeMenu();
        return;
    }

    // Smooth scroll and auto-close for internal anchor links
    const anchor = e.target.closest('a[href^="#"]');
    if (anchor) {
        const href = anchor.getAttribute('href');
        if (href !== '#' && href.length > 1) {
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                closeMenu();
                window.scrollTo({ top: target.offsetTop - 100, behavior: 'smooth' });
            }
        }
    }
});

window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (header) {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
}, { passive: true });

function highlightActiveTab() {
    let currentPath = window.location.pathname;

    if (currentPath.endsWith('/index.html')) currentPath = currentPath.replace('/index.html', '');
    if (currentPath.endsWith('/') && currentPath.length > 1) currentPath = currentPath.slice(0, -1);
    if (currentPath === '') currentPath = '/';

    const navLinks = document.querySelectorAll('.nav-links a');
    if (!navLinks || navLinks.length === 0) return;

    navLinks.forEach(link => {
        link.classList.remove('active', 'current');
    });

    navLinks.forEach(link => {
        let linkPath = new URL(link.href, window.location.origin).pathname;

        if (linkPath.endsWith('/index.html')) linkPath = linkPath.replace('/index.html', '');
        if (linkPath.endsWith('/') && linkPath.length > 1) linkPath = linkPath.slice(0, -1);
        if (linkPath === '') linkPath = '/';

        if (currentPath === linkPath) {
            link.classList.add('active');
        } else if (linkPath !== '/' && currentPath.startsWith(linkPath)) {
            link.classList.add('active');
        }
    });
}

// Optimized scroll reveal using CSS transitions and container-based staggering
function initScrollStagger() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05 });

    // Stagger items inside structural grid or list containers dynamically
    const containers = document.querySelectorAll(
        '.portfolio-grid, .testimonials-grid, .stats-strip, .faq-container, .process-grid, .perks-grid, .portals-grid, .trust-grid, .subjects-grid'
    );

    containers.forEach(container => {
        const revealableItems = container.querySelectorAll(
            '.portfolio-card, .faq-item, .trust-card, .stat-block, .perk-card, .process-step, .portal-card, .testimonial-card'
        );
        revealableItems.forEach((item, index) => {
            item.classList.add('reveal-on-scroll');
            // 65ms elegant stagger delay
            item.style.setProperty('--reveal-delay', `${index * 65}ms`);
            observer.observe(item);
        });
    });

    // Fallback observe for stray elements
    document.querySelectorAll('.portfolio-card, .faq-item, .trust-card, .stat-block, .perk-card, .process-step, .portal-card, .testimonial-card').forEach(item => {
        if (!item.classList.contains('reveal-on-scroll')) {
            item.classList.add('reveal-on-scroll');
            observer.observe(item);
        }
    });
}

// Initialize magnetic hover glow effect for glassmorphic elements
function initMagneticGlow() {
    const isHoverDevice = window.matchMedia('(hover: hover)').matches;
    if (!isHoverDevice) return;

    document.querySelectorAll('.portfolio-card, .trust-card, .perk-card, .process-step, .portal-card, .testimonial-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            // Calculate 3D tilt coordinates
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const offsetX = x - centerX;
            const offsetY = y - centerY;
            
            // Maximum tilt angle of 8 degrees for clean elegance
            const rotateX = -(offsetY / centerY) * 8;
            const rotateY = (offsetX / centerX) * 8;

            card.style.transition = 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)';
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });
}

// Magnetic Pull Effect for CTA and floating buttons on Hover Devices
function initMagneticButtons() {
    const isHoverDevice = window.matchMedia('(hover: hover)').matches;
    if (!isHoverDevice) return;

    const magneticElements = document.querySelectorAll('.cta-button, .cta-button-outline, .submit-button, .whatsapp-float');
    
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            // Calculate relative hover offset
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Shift element up to 12px towards cursor for dynamic tactile feedback
            const scale = el.classList.contains('whatsapp-float') ? 1.08 : 1.03;
            el.style.transform = `translate3d(${x * 0.3}px, ${y * 0.3}px, 0) scale(${scale})`;
            el.style.transition = 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)';
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate3d(0, 0, 0) scale(1)';
            el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        });
    });
}

// Ambient Background Color Orbs Injection
function initAmbientOrbs() {
    let orbContainer = document.querySelector('.orb-container');
    if (!orbContainer) {
        orbContainer = document.createElement('div');
        orbContainer.className = 'orb-container';
        document.body.appendChild(orbContainer);
    }
    orbContainer.innerHTML = `
        <div class="ambient-orb orb-1"></div>
        <div class="ambient-orb orb-2"></div>
    `;
}

// Client-side Router to Coordinate Page Worlds Themes
function applyPageTheme() {
    const path = window.location.pathname.toLowerCase();
    let accent = '#94a3b8'; // Premium slate grey accent
    let accentRgb = '148, 163, 184';
    let orb1 = 'rgba(148, 163, 184, 0.08)'; // Cool slate grey orb 1
    let orb2 = 'rgba(100, 116, 139, 0.06)'; // Platinum grey orb 2
    
    if (path.includes('/assignment-help')) {
        accent = '#10b981'; // emerald green
        accentRgb = '16, 185, 129';
        orb1 = 'rgba(16, 185, 129, 0.08)';
        orb2 = 'rgba(20, 184, 166, 0.06)';
    } else if (path.includes('/technical-solutions')) {
        accent = '#8b5cf6'; // electric purple
        accentRgb = '139, 92, 246';
        orb1 = 'rgba(139, 92, 246, 0.08)';
        orb2 = 'rgba(59, 130, 246, 0.06)';
    } else if (path.includes('/earn-with-us')) {
        accent = '#f59e0b'; // amber gold
        accentRgb = '245, 158, 11';
        orb1 = 'rgba(245, 158, 11, 0.08)';
        orb2 = 'rgba(249, 115, 22, 0.06)';
    } else if (path.includes('/contact-us')) {
        accent = '#f97316'; // coral orange
        accentRgb = '249, 115, 22';
        orb1 = 'rgba(249, 115, 22, 0.08)';
        orb2 = 'rgba(239, 68, 68, 0.06)';
    } else if (path.includes('/portals')) {
        accent = '#14b8a6'; // teal mint
        accentRgb = '20, 184, 166';
        orb1 = 'rgba(20, 184, 166, 0.08)';
        orb2 = 'rgba(16, 185, 129, 0.06)';
    } else if (path.includes('/client-portal') || path.includes('/writer-portal')) {
        accent = '#3b82f6'; // cobalt blue
        accentRgb = '59, 130, 246';
        orb1 = 'rgba(59, 130, 246, 0.08)';
        orb2 = 'rgba(99, 102, 241, 0.06)';
    }
    
    const root = document.documentElement;
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--accent-rgb', accentRgb);
    root.style.setProperty('--orb-1-color', orb1);
    root.style.setProperty('--orb-2-color', orb2);
    
    initAmbientOrbs();
}

// Hero Title Word Slider
function initWordSlider() {
    const container = document.querySelector('.slider-word-container');
    if (!container) return;

    const words = ['Handle', 'Automate', 'Write', 'Code', 'Solve'];
    let currentIdx = 0;

    setInterval(() => {
        const activeWord = container.querySelector('.slider-word.active');
        if (!activeWord) return;

        currentIdx = (currentIdx + 1) % words.length;
        const nextWordText = words[currentIdx];

        // Create new word element
        const nextWord = document.createElement('span');
        nextWord.className = 'slider-word';
        nextWord.textContent = nextWordText;

        // Measure widths
        const oldWidth = activeWord.offsetWidth;
        container.style.width = oldWidth + 'px';

        // Add new word to DOM hidden
        container.appendChild(nextWord);
        const newWidth = nextWord.offsetWidth;

        // Force reflow
        nextWord.offsetHeight;

        // Transition container width
        container.style.width = newWidth + 'px';

        // Start slide animation
        activeWord.classList.remove('active');
        activeWord.classList.add('exit');
        nextWord.classList.add('active');

        // Clean up after transition
        setTimeout(() => {
            if (activeWord.parentNode === container) {
                container.removeChild(activeWord);
            }
            container.style.width = ''; // clear explicit width for responsiveness
        }, 350);
    }, 3000);
}

// Format Statistic values cleanly
function formatStatValue(value, type) {
    if (type === 'percent') {
        return value.toFixed(1) + '%';
    } else if (type === 'comma') {
        return Math.floor(value).toLocaleString();
    } else {
        return Math.floor(value).toString();
    }
}

// Viewport-Triggered Counter & Live Stat Increments
function initLiveCounters() {
    const stats = [
        { id: 'stat-projects', target: 10482, current: 0, type: 'comma', interval: 8000, step: 1 },
        { id: 'stat-students', target: 2184, current: 0, type: 'comma', interval: 22000, step: 1 },
        { id: 'stat-accuracy', target: 99.4, current: 0, type: 'percent', interval: 0, step: 0 },
        { id: 'stat-countries', target: 42, current: 0, type: 'integer', interval: 0, step: 0 }
    ];

    const elements = [];

    stats.forEach(stat => {
        const el = document.getElementById(stat.id);
        if (el) {
            const rawText = el.textContent.trim();
            if (rawText.includes('%')) {
                stat.target = parseFloat(rawText.replace('%', ''));
                stat.type = 'percent';
            } else if (rawText.includes(',')) {
                stat.target = parseInt(rawText.replace(/,/g, ''), 10);
                stat.type = 'comma';
            } else {
                stat.target = parseInt(rawText, 10);
                stat.type = 'integer';
            }
            
            el.textContent = formatStatValue(0, stat.type);
            elements.push({ el, stat });
        }
    });

    if (elements.length === 0) return;

    const countUpObserver = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCountUp();
                observerInstance.disconnect();
            }
        });
    }, { threshold: 0.1 });

    const statsContainer = document.querySelector('.stats-strip') || elements[0].el;
    countUpObserver.observe(statsContainer);

    function animateCountUp() {
        const duration = 1500; 
        const startTime = performance.now();

        function update(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic

            elements.forEach(({ el, stat }) => {
                const currentVal = easeProgress * stat.target;
                el.textContent = formatStatValue(currentVal, stat.type);
            });

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                elements.forEach(({ el, stat }) => {
                    stat.current = stat.target;
                    el.textContent = formatStatValue(stat.target, stat.type);
                    if (stat.interval > 0) {
                        setupLiveIncrement(el, stat);
                    }
                });
            }
        }

        requestAnimationFrame(update);
    }

    function setupLiveIncrement(el, stat) {
        setInterval(() => {
            stat.current += stat.step;
            const statBlock = el.closest('.stat-block') || el;
            
            statBlock.classList.remove('stat-pulse-active');
            statBlock.offsetHeight; // force reflow
            statBlock.classList.add('stat-pulse-active');
            
            el.textContent = formatStatValue(stat.current, stat.type);
            
            setTimeout(() => {
                statBlock.classList.remove('stat-pulse-active');
            }, 800);
        }, stat.interval);
    }
}

function initNavCapsule() {
    const isHoverDevice = window.matchMedia('(hover: hover)').matches;
    if (!isHoverDevice) return;

    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    let pill = navLinks.querySelector('.nav-hover-pill');
    if (!pill) {
        pill = document.createElement('div');
        pill.className = 'nav-hover-pill';
        navLinks.appendChild(pill);
    }

    const links = navLinks.querySelectorAll('a');
    
    function positionPill(a) {
        if (!a) {
            pill.style.opacity = '0';
            return;
        }
        pill.style.left = `${a.offsetLeft}px`;
        pill.style.width = `${a.offsetWidth}px`;
        pill.style.height = `${a.offsetHeight}px`;
        pill.style.opacity = '1';
    }

    // Set initial position on active link
    const activeLink = navLinks.querySelector('a.active');
    if (activeLink) {
        setTimeout(() => positionPill(activeLink), 150);
    }

    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            positionPill(link);
        });
    });

    navLinks.addEventListener('mouseleave', () => {
        const currentActive = navLinks.querySelector('a.active');
        if (currentActive) {
            positionPill(currentActive);
        } else {
            pill.style.opacity = '0';
        }
    });
}

// Global initializer
function initAll() {
    // 1. Immediately initialize menu events to insulate input responsiveness
    initMenuEvents();
    
    // 2. Initialize lazy-loading for heavy third-party external widgets
    initLazyThirdParty();
    
    // 3. Defer all non-essential and heavy layout/DOM calculations to the next frame
    requestAnimationFrame(() => {
        setTimeout(() => {
            highlightActiveTab();
            applyPageTheme();
            initMagneticGlow();
            initMagneticButtons();
            initScrollStagger();
            initWordSlider();
            initLiveCounters();
            initNavCapsule();
        }, 0);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", initAll);
} else {
    initAll();
}

// Dynamic Page Shutter injection for seamless outclass transitions
(function injectPageShutter() {
    const shutter = document.createElement('div');
    shutter.className = 'page-shutter';
    document.documentElement.appendChild(shutter);
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            shutter.classList.add('dismissed');
            setTimeout(() => shutter.remove(), 600);
        }, 80);
    });
})();