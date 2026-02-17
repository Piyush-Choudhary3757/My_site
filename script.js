/* ============================================
   PIYUSH CHOUDHARY — PORTFOLIO SCRIPTS
   Particles, animations, and interactivity
   ============================================ */

// ---- Preloader ----
function initPreloader() {
    const preloader = document.getElementById('preloader');
    const fill = document.getElementById('preloader-fill');
    if (!preloader || !fill) return;

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
            progress = 100;
            fill.style.width = '100%';
            clearInterval(interval);
            setTimeout(() => {
                preloader.classList.add('hidden');
                document.body.style.overflow = '';
            }, 400);
        } else {
            fill.style.width = progress + '%';
        }
    }, 120);

    // Failsafe: remove preloader after 3s no matter what
    setTimeout(() => {
        preloader.classList.add('hidden');
        document.body.style.overflow = '';
    }, 3000);
}

// ---- Particle System ----
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: -1000, y: -1000 };
        this.resize();
        this.init();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        const count = Math.min(90, Math.floor(window.innerWidth * 0.055));
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                size: Math.random() * 2.5 + 0.5,
                opacity: Math.random() * 0.5 + 0.1,
                hue: Math.random() > 0.5 ? 160 : 270,
                pulse: Math.random() * Math.PI * 2 // for pulsing effect
            });
        }
    }

    update() {
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.pulse += 0.01;

            // Mouse interaction — stronger
            const dx = this.mouse.x - p.x;
            const dy = this.mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 180) {
                const force = (180 - dist) / 180;
                p.vx -= dx * 0.00008 * force;
                p.vy -= dy * 0.00008 * force;
            }

            // Boundaries
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

            // Limit velocity
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (speed > 0.6) {
                p.vx *= 0.98;
                p.vy *= 0.98;
            }
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw connections with gradient opacity
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 140) {
                    const opacity = (1 - dist / 140) * 0.15;
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(100, 255, 218, ${opacity})`;
                    this.ctx.lineWidth = 0.6;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }

            // Draw mouse connections
            const mdx = this.mouse.x - this.particles[i].x;
            const mdy = this.mouse.y - this.particles[i].y;
            const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mDist < 200) {
                const opacity = (1 - mDist / 200) * 0.25;
                this.ctx.beginPath();
                this.ctx.strokeStyle = `rgba(167, 139, 250, ${opacity})`;
                this.ctx.lineWidth = 0.4;
                this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                this.ctx.lineTo(this.mouse.x, this.mouse.y);
                this.ctx.stroke();
            }
        }

        // Draw particles with pulsing glow
        this.particles.forEach(p => {
            const pulseFactor = 0.3 + Math.sin(p.pulse) * 0.15;
            const glowSize = p.size + pulseFactor;

            // Glow
            this.ctx.beginPath();
            const glowColor = p.hue === 160
                ? `rgba(100, 255, 218, ${p.opacity * 0.3})`
                : `rgba(167, 139, 250, ${p.opacity * 0.3})`;
            this.ctx.fillStyle = glowColor;
            this.ctx.arc(p.x, p.y, glowSize * 3, 0, Math.PI * 2);
            this.ctx.fill();

            // Core
            this.ctx.beginPath();
            const color = p.hue === 160
                ? `rgba(100, 255, 218, ${p.opacity})`
                : `rgba(167, 139, 250, ${p.opacity})`;
            this.ctx.fillStyle = color;
            this.ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// ---- Custom Cursor ----
class CustomCursor {
    constructor() {
        this.cursor = document.getElementById('cursor');
        this.follower = document.getElementById('cursor-follower');
        if (!this.cursor || !this.follower) return;

        this.pos = { x: 0, y: 0 };
        this.target = { x: 0, y: 0 };

        window.addEventListener('mousemove', (e) => {
            this.target.x = e.clientX;
            this.target.y = e.clientY;
        });

        // Hover effect for interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .glass-card, .highlight-card, .btn, .wid-card, .wid-focus-item');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => this.follower.classList.add('hovering'));
            el.addEventListener('mouseleave', () => this.follower.classList.remove('hovering'));
        });

        this.animate();
    }

    animate() {
        this.pos.x += (this.target.x - this.pos.x) * 0.12;
        this.pos.y += (this.target.y - this.pos.y) * 0.12;

        this.cursor.style.transform = `translate(${this.target.x - 4}px, ${this.target.y - 4}px)`;
        this.follower.style.transform = `translate(${this.pos.x - 18}px, ${this.pos.y - 18}px)`;

        requestAnimationFrame(() => this.animate());
    }
}

// ---- Scroll Progress Bar ----
function initScrollProgress() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.scrollY / scrollHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// ---- Back to Top Button ----
function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 600) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ---- Rotating Text ----
function initRotatingText() {
    const element = document.getElementById('rotating-text');
    if (!element) return;

    const phrases = [
        'turn data into decisions',
        'build analytics pipelines',
        'create smart dashboards',
        'explore LLMs & AI',
        'automate everything'
    ];
    let index = 0;

    setInterval(() => {
        // Fade out
        element.classList.add('fade-out');

        setTimeout(() => {
            index = (index + 1) % phrases.length;
            element.textContent = phrases[index];
            element.classList.remove('fade-out');
            element.classList.add('fade-in');

            // Force reflow then remove fade-in
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    element.classList.remove('fade-in');
                });
            });
        }, 300);
    }, 3000);
}

// ---- Navbar ----
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    const navLinks = document.querySelectorAll('.nav-link');

    // Scroll behavior
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const scroll = window.scrollY;

        if (scroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Hide/show on scroll
        if (scroll > lastScroll && scroll > 200) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        lastScroll = scroll;

        // Active section highlighting
        updateActiveNav();
    });

    // Hamburger toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('open');
        document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });

    // Mobile link click
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    function updateActiveNav() {
        const sections = document.querySelectorAll('.section, .hero');
        let current = '';

        sections.forEach(section => {
            const top = section.offsetTop - 150;
            if (window.scrollY >= top) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === current) {
                link.classList.add('active');
            }
        });
    }
}

// ---- Scroll Animations with Stagger ----
function initScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Calculate stagger delay based on sibling position
                const siblings = Array.from(entry.target.parentElement.children)
                    .filter(child => child.classList.contains('animate-on-scroll'));
                const idx = siblings.indexOf(entry.target);
                const delay = idx * 120;

                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, Math.min(delay, 500));

                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

// ---- Skill Bars Animation ----
function initSkillBars() {
    const skillFills = document.querySelectorAll('.skill-fill');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const width = entry.target.getAttribute('data-width');
                setTimeout(() => {
                    entry.target.style.width = width + '%';
                    entry.target.classList.add('animated');
                }, 200);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    skillFills.forEach(bar => observer.observe(bar));
}

// ---- Smooth Scroll for Anchor Links ----
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// ---- Enhanced Tilt Effect for Cards ----
function initTiltEffect() {
    const cards = document.querySelectorAll('.glass-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / centerY * -4;
            const rotateY = (x - centerX) / centerX * 4;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;

            // Dynamic gradient follow
            const percentX = (x / rect.width) * 100;
            const percentY = (y / rect.height) * 100;
            card.style.background = `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(100, 255, 218, 0.04), transparent 50%), rgba(255, 255, 255, 0.03)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            card.style.background = '';
        });
    });
}

// ---- Magnetic Buttons ----
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });
}

// ---- Typing Effect ----
function initTypingEffect() {
    const tagline = document.querySelector('.hero-tagline');
    if (!tagline) return;

    const rotatingText = tagline.querySelector('.rotating-text');
    if (rotatingText) {
        rotatingText.style.borderRight = '2px solid var(--accent)';
        rotatingText.style.paddingRight = '4px';
        rotatingText.style.animation = 'blink 1s step-end infinite';

        // Remove cursor after a delay
        setTimeout(() => {
            rotatingText.style.borderRight = 'none';
            rotatingText.style.animation = 'none';
        }, 4000);
    }
}

// ---- Add blinking cursor keyframe dynamically ----
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes blink {
            0%, 50% { border-color: var(--accent); }
            51%, 100% { border-color: transparent; }
        }
        
        .hero-name .char {
            display: inline-block;
            animation: charReveal 0.5s ease forwards;
            opacity: 0;
        }
        
        @keyframes charReveal {
            to { opacity: 1; transform: translateY(0); }
            from { opacity: 0; transform: translateY(10px); }
        }
    `;
    document.head.appendChild(style);
}

// ---- Counter Animation for Stats ----
function initCounters() {
    const counters = document.querySelectorAll('.highlight-number');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
    const text = element.textContent;
    const match = text.match(/(\d+)/);
    if (!match) return;

    const target = parseInt(match[1]);
    const suffix = text.replace(match[1], '').trim();
    const prefix = text.indexOf(match[1]) > 0 ? text.substring(0, text.indexOf(match[1])) : '';
    const duration = 1500;
    const start = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);

        element.textContent = prefix + current + suffix;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = text; // Restore original
        }
    }

    requestAnimationFrame(update);
}

// ---- Parallax Effect ----
function initParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const heroContent = document.querySelector('.hero-content');
        if (heroContent && scrolled < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrolled * 0.15}px)`;
            heroContent.style.opacity = 1 - scrolled / (window.innerHeight * 0.8);
        }
    });
}

// ---- Section Reveal Glow ----
function initSectionGlow() {
    const sections = document.querySelectorAll('.section');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
            }
        });
    }, { threshold: 0.05 });

    sections.forEach(sec => {
        sec.style.opacity = '0';
        sec.style.transition = 'opacity 1s ease';
        observer.observe(sec);
    });
}

// ---- Init Everything ----
document.addEventListener('DOMContentLoaded', () => {
    // Lock scroll during preloader
    document.body.style.overflow = 'hidden';

    // Preloader
    initPreloader();

    // Particles
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ps = new ParticleSystem(canvas);
        ps.animate();
    }

    // Cursor (desktop only)
    if (window.innerWidth > 768) {
        new CustomCursor();
    }

    // Features
    addDynamicStyles();
    initNavbar();
    initScrollProgress();
    initBackToTop();
    initRotatingText();
    initScrollAnimations();
    initSkillBars();
    initSmoothScroll();
    initTiltEffect();
    initMagneticButtons();
    initTypingEffect();
    initCounters();
    initParallax();
    initSectionGlow();
});
