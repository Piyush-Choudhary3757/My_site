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

            // For CSS glow pseudo-element
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            // Light tilt
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / centerY * -2;
            const rotateY = (x - centerX) / centerX * 2;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
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
    const dataTarget = element.getAttribute('data-target');
    let target, suffix, prefix;

    if (dataTarget) {
        target = parseInt(dataTarget);
        prefix = '';
        suffix = '';
    } else {
        const text = element.textContent;
        const match = text.match(/(\d+)/);
        if (!match) return;
        target = parseInt(match[1]);
        suffix = text.replace(match[1], '').trim();
        prefix = text.indexOf(match[1]) > 0 ? text.substring(0, text.indexOf(match[1])) : '';
    }

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
            element.textContent = prefix + target + suffix;
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
            const progress = scrolled / window.innerHeight;
            heroContent.style.transform = `translateY(${scrolled * 0.2}px) scale(${1 - progress * 0.05})`;
            heroContent.style.opacity = 1 - progress * 1.2;
            heroContent.style.filter = `blur(${progress * 3}px)`;
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

// ---- Dynamic Greeting ----
function initDynamicGreeting() {
    const el = document.getElementById('dynamic-greeting');
    if (!el) return;

    const hour = new Date().getHours();
    let greeting;

    if (hour >= 5 && hour < 12) greeting = 'Good morning';
    else if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    else if (hour >= 17 && hour < 21) greeting = 'Good evening';
    else greeting = 'Hey there, night owl';

    el.textContent = greeting;
}

// ---- Interactive Terminal ----
function initTerminal() {
    const input = document.getElementById('terminal-input');
    const output = document.getElementById('terminal-output');
    if (!input || !output) return;

    const commands = {
        help: [
            'Available commands:',
            '  about    → Who am I',
            '  skills   → Technical skills',
            '  contact  → How to reach me',
            '  projects → My project highlights',
            '  resume   → Open my resume',
            '  clear    → Clear terminal',
            '  secret   → ???'
        ],
        about: [
            'Piyush Choudhary',
            '─────────────────',
            'Data Analyst @ JEA | MS Data Science @ FSU',
            'Building analytics pipelines, KPI dashboards,',
            'and exploring LLMs & Agentic AI workflows.'
        ],
        skills: [
            'Languages:  Python, SQL, R, JavaScript',
            'Analytics:  Pandas, NumPy, Scikit-learn, TensorFlow',
            'Databases:  PostgreSQL, MySQL, SQLite',
            'Viz:        Power BI, Tableau, Matplotlib',
            'Cloud:      AWS (Lambda, S3, SageMaker), Azure, GCP',
            'Tools:      Git, Docker, Linux, Jupyter'
        ],
        contact: [
            'Email:    piyush99939@gmail.com',
            'GitHub:   github.com/Piyush-Choudhary3757',
            'LinkedIn: linkedin.com/in/piyush-c3757'
        ],
        projects: [
            '1. Water Utility Analytics Pipeline (SQL + Python)',
            '2. IoT Smart Agriculture Dashboard (AWS)',
            '3. YOLOv8 Traffic Analysis System',
            '4. LLM Council — Multi-model AI debate platform',
            '5. Hinge Dating Data Analysis (NLP)'
        ],
        secret: [
            '🎉 You found the secret!',
            '',
            '+---------------------------------+',
            '| There are 10 types of people -  |',
            '| those who understand binary and |',
            '| those who don\'t.                |',
            '+---------------------------------+'
        ]
    };

    input.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;

        const cmd = input.value.trim().toLowerCase();
        input.value = '';

        // Echo the command
        const echoLine = document.createElement('div');
        echoLine.className = 'terminal-line';
        echoLine.innerHTML = `<span class="terminal-prompt">→</span><span class="terminal-text terminal-input-echo">${cmd}</span>`;
        output.appendChild(echoLine);

        if (cmd === 'clear') {
            output.innerHTML = '';
            return;
        }

        if (cmd === 'resume') {
            window.open('Piyush-_Resume_.pdf', '_blank');
            const responseLine = document.createElement('div');
            responseLine.className = 'terminal-line';
            responseLine.innerHTML = '<span class="terminal-text terminal-response">Opening resume...</span>';
            output.appendChild(responseLine);
            output.scrollTop = output.scrollHeight;
            return;
        }

        const response = commands[cmd];
        if (response) {
            response.forEach((line, i) => {
                setTimeout(() => {
                    const responseLine = document.createElement('div');
                    responseLine.className = 'terminal-line';
                    if (line.trim().startsWith('+') || line.trim().startsWith('|')) {
                        responseLine.classList.add('condensed');
                    }
                    responseLine.innerHTML = `<span class="terminal-text terminal-response">${line}</span>`;
                    output.appendChild(responseLine);
                    output.scrollTop = output.scrollHeight;
                }, i * 50);
            });
        } else {
            const errorLine = document.createElement('div');
            errorLine.className = 'terminal-line';
            errorLine.innerHTML = `<span class="terminal-text terminal-response">Command not found: ${cmd}. Type <span class="terminal-cmd">help</span> for available commands.</span>`;
            output.appendChild(errorLine);
        }

        output.scrollTop = output.scrollHeight;
    });
}

// ---- Cursor Glow Trail ----
function initCursorTrail() {
    if (window.innerWidth <= 768) return; // Skip on mobile

    const TRAIL_COUNT = 12;
    const trails = [];

    for (let i = 0; i < TRAIL_COUNT; i++) {
        const dot = document.createElement('div');
        dot.className = 'cursor-trail';
        document.body.appendChild(dot);
        trails.push({
            el: dot,
            x: 0,
            y: 0
        });
    }

    let mouseX = 0, mouseY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateTrail() {
        let prevX = mouseX;
        let prevY = mouseY;

        trails.forEach((trail, i) => {
            const speed = 0.35 - (i * 0.02);
            trail.x += (prevX - trail.x) * speed;
            trail.y += (prevY - trail.y) * speed;

            const scale = 1 - (i / TRAIL_COUNT) * 0.6;
            const opacity = 1 - (i / TRAIL_COUNT);

            trail.el.style.transform = `translate(${trail.x - 3}px, ${trail.y - 3}px) scale(${scale})`;
            trail.el.style.opacity = opacity * 0.5;

            prevX = trail.x;
            prevY = trail.y;
        });

        requestAnimationFrame(animateTrail);
    }

    animateTrail();
}

// ---- Text Scramble Effect ----
function initTextScramble() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    function scrambleText(element) {
        const originalText = element.getAttribute('data-text') || element.textContent;
        element.setAttribute('data-text', originalText);
        const length = originalText.length;
        let iteration = 0;

        const interval = setInterval(() => {
            element.textContent = originalText
                .split('')
                .map((char, index) => {
                    if (index < iteration) return originalText[index];
                    if (char === ' ' || char === '&' || char === '.' || char === ',' || char === ':' || char === '-') return char;
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join('');

            if (iteration >= length) {
                clearInterval(interval);
                element.textContent = originalText;
            }

            iteration += 1;
        }, 25);
    }

    const headings = document.querySelectorAll('.section-heading');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Find the text node (after the section-number span and heading-line span)
                const heading = entry.target;
                const textNodes = [];
                heading.childNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                        textNodes.push(node);
                    }
                });

                if (textNodes.length > 0) {
                    const text = textNodes[0].textContent.trim();
                    // Create a span wrapper for scramble
                    const span = document.createElement('span');
                    span.className = 'scramble-text';
                    span.textContent = text;
                    textNodes[0].replaceWith(span);
                    scrambleText(span);
                }

                observer.unobserve(heading);
            }
        });
    }, { threshold: 0.3 });

    headings.forEach(h => observer.observe(h));
}

// ---- Interactive Skill Radar Chart ----
function initSkillRadar() {
    const canvas = document.getElementById('skillRadar');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const size = 420;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const maxR = 160;
    const categories = [
        { label: 'Python', value: 0.92 },
        { label: 'SQL', value: 0.95 },
        { label: 'ML / AI', value: 0.80 },
        { label: 'Dashboards', value: 0.88 },
        { label: 'ETL Pipelines', value: 0.90 },
        { label: 'Statistics', value: 0.85 },
    ];
    const n = categories.length;
    let animProgress = 0;
    let hoverIndex = -1;

    function angleFor(i) {
        return (Math.PI * 2 * i) / n - Math.PI / 2;
    }

    function draw() {
        ctx.clearRect(0, 0, size, size);

        // Grid rings
        for (let ring = 1; ring <= 4; ring++) {
            const r = (maxR * ring) / 4;
            ctx.beginPath();
            for (let i = 0; i <= n; i++) {
                const a = angleFor(i % n);
                const x = cx + r * Math.cos(a);
                const y = cy + r * Math.sin(a);
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.strokeStyle = `rgba(100, 255, 218, ${ring === 4 ? 0.15 : 0.06})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Axis lines
        for (let i = 0; i < n; i++) {
            const a = angleFor(i);
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + maxR * Math.cos(a), cy + maxR * Math.sin(a));
            ctx.strokeStyle = 'rgba(100, 255, 218, 0.08)';
            ctx.stroke();
        }

        // Data polygon (animated fill)
        const progress = Math.min(animProgress, 1);
        ctx.beginPath();
        for (let i = 0; i <= n; i++) {
            const idx = i % n;
            const a = angleFor(idx);
            const r = maxR * categories[idx].value * progress;
            const x = cx + r * Math.cos(a);
            const y = cy + r * Math.sin(a);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();

        // Gradient fill
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
        gradient.addColorStop(0, 'rgba(100, 255, 218, 0.15)');
        gradient.addColorStop(1, 'rgba(167, 139, 250, 0.08)');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Stroke
        ctx.strokeStyle = 'rgba(100, 255, 218, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Data points + Labels
        for (let i = 0; i < n; i++) {
            const a = angleFor(i);
            const r = maxR * categories[i].value * progress;
            const x = cx + r * Math.cos(a);
            const y = cy + r * Math.sin(a);

            // Glow dot
            ctx.beginPath();
            ctx.arc(x, y, i === hoverIndex ? 7 : 4, 0, Math.PI * 2);
            ctx.fillStyle = i === hoverIndex ? '#64ffda' : 'rgba(100, 255, 218, 0.8)';
            ctx.fill();
            if (i === hoverIndex) {
                ctx.beginPath();
                ctx.arc(x, y, 12, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(100, 255, 218, 0.15)';
                ctx.fill();
            }

            // Label
            const labelR = maxR + 24;
            const lx = cx + labelR * Math.cos(a);
            const ly = cy + labelR * Math.sin(a);
            ctx.font = i === hoverIndex ? 'bold 12px "JetBrains Mono", monospace' : '11px "JetBrains Mono", monospace';
            ctx.fillStyle = i === hoverIndex ? '#64ffda' : 'rgba(200, 210, 220, 0.6)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(categories[i].label, lx, ly);

            // Value on hover
            if (i === hoverIndex) {
                ctx.font = 'bold 14px "Outfit", sans-serif';
                ctx.fillStyle = '#64ffda';
                ctx.fillText(Math.round(categories[i].value * 100) + '%', lx, ly + 16);
            }
        }
    }

    // Animate entrance
    let started = false;
    function animate() {
        if (animProgress < 1) {
            animProgress += 0.025;
            draw();
            requestAnimationFrame(animate);
        } else {
            draw();
        }
    }

    // Start animation when visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !started) {
                started = true;
                animate();
            }
        });
    }, { threshold: 0.3 });
    observer.observe(canvas);

    // Hover interaction
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = size / rect.width;
        const scaleY = size / rect.height;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;

        hoverIndex = -1;
        for (let i = 0; i < n; i++) {
            const a = angleFor(i);
            const r = maxR * categories[i].value;
            const px = cx + r * Math.cos(a);
            const py = cy + r * Math.sin(a);
            if (Math.hypot(mx - px, my - py) < 20) {
                hoverIndex = i;
                break;
            }
        }
        canvas.style.cursor = hoverIndex >= 0 ? 'pointer' : 'default';
        if (animProgress >= 1) draw();
    });

    canvas.addEventListener('mouseleave', () => {
        hoverIndex = -1;
        if (animProgress >= 1) draw();
    });
}

// ---- Matrix Data Rain ----
function initMatrixRain() {
    const canvas = document.getElementById('matrix-rain');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const chars = '01アイウエオカキクケコ∑∏√∫≈≠∞SELECTFROMWHEREGROUPBYJOIN'.split('');
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(0).map(() => Math.random() * -100);

    function draw() {
        ctx.fillStyle = 'rgba(10, 14, 20, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#64ffda';
        ctx.font = fontSize + 'px "JetBrains Mono", monospace';

        for (let i = 0; i < drops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            const x = i * fontSize;
            const y = drops[i] * fontSize;

            ctx.globalAlpha = Math.random() * 0.5 + 0.1;
            ctx.fillText(char, x, y);

            if (y > canvas.height && Math.random() > 0.98) {
                drops[i] = 0;
            }
            drops[i] += 0.3 + Math.random() * 0.3;
        }
        ctx.globalAlpha = 1;
        requestAnimationFrame(draw);
    }
    draw();
}

// ---- Orbit Metric Counter Animation ----
function initOrbitCounters() {
    const orbit = document.querySelector('.data-orbit');
    if (!orbit) return;

    const values = orbit.querySelectorAll('.orbit-value');
    const targets = [
        { end: 500, suffix: 'K+' },
        { end: 95, suffix: '%' },
        { end: 40, suffix: '%' },
        { end: 10, suffix: '+' },
    ];

    let animated = false;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                values.forEach((el, i) => {
                    if (!targets[i]) return;
                    const target = targets[i];
                    const duration = 2000;
                    const start = performance.now();
                    function tick(now) {
                        const progress = Math.min((now - start) / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        const current = Math.round(target.end * eased);
                        el.textContent = current + target.suffix;
                        if (progress < 1) requestAnimationFrame(tick);
                    }
                    setTimeout(() => requestAnimationFrame(tick), i * 200);
                });
            }
        });
    }, { threshold: 0.3 });
    observer.observe(orbit);
}


// ---- GSAP Scroll Animations ----
// IMPORTANT: Only animate elements that do NOT use the CSS animate-on-scroll system
// to avoid opacity/transform conflicts between CSS transitions and GSAP inline styles.
function initGSAPAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Tech icons — wave effect (these don't use animate-on-scroll)
    gsap.utils.toArray('.tech-icon').forEach((icon, i) => {
        gsap.fromTo(icon,
            { y: 20, opacity: 0 },
            {
                scrollTrigger: {
                    trigger: icon.closest('.tech-strip') || icon,
                    start: 'top 90%',
                },
                y: 0,
                opacity: 1,
                duration: 0.4,
                delay: i * 0.04,
                ease: 'power2.out'
            }
        );
    });

    // Smooth parallax for background orbs based on scroll
    gsap.utils.toArray('.orb').forEach((orb, i) => {
        gsap.to(orb, {
            scrollTrigger: {
                trigger: 'body',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1
            },
            y: (i + 1) * -200,
            ease: 'none'
        });
    });
}

// ---- Mode Toggle ----
function initModeToggle() {
    const toggleContainer = document.getElementById('mode-toggle');
    if (!toggleContainer) return;

    // Set initial mode to recruiter
    document.body.setAttribute('data-mode', 'recruiter');

    toggleContainer.addEventListener('click', () => {
        const currentMode = document.body.getAttribute('data-mode');
        const newMode = currentMode === 'recruiter' ? 'engineer' : 'recruiter';

        document.body.setAttribute('data-mode', newMode);

        // Update labels
        const recruiterLabel = toggleContainer.querySelector('.recruiter-label');
        const engineerLabel = toggleContainer.querySelector('.engineer-label');

        if (newMode === 'engineer') {
            recruiterLabel.classList.remove('active');
            engineerLabel.classList.add('active');
        } else {
            engineerLabel.classList.remove('active');
            recruiterLabel.classList.add('active');
        }
    });
}

// ---- Neural Knowledge Graph ----
function initKnowledgeGraph() {
    const container = document.getElementById('3d-graph');
    if (!container || typeof ForceGraph === 'undefined') return;

    // Define graph data
    const gData = {
        nodes: [
            { id: 'Piyush', group: 1, val: 30, color: '#64ffda' },
            { id: 'Python', group: 2, val: 20 },
            { id: 'SQL', group: 2, val: 20 },
            { id: 'AWS', group: 2, val: 15 },
            { id: 'LLMs', group: 2, val: 15 },
            { id: 'JEA', group: 3, val: 15, color: '#a78bfa' },
            { id: 'AICTE', group: 3, val: 10, color: '#a78bfa' },
            { id: 'ETL Pipeline', group: 4, val: 12, color: '#38bdf8' },
            { id: 'AI Music GAN', group: 4, val: 12, color: '#38bdf8' },
            { id: 'Dashboard', group: 4, val: 12, color: '#38bdf8' }
        ],
        links: [
            { source: 'Piyush', target: 'Python' },
            { source: 'Piyush', target: 'SQL' },
            { source: 'Piyush', target: 'AWS' },
            { source: 'Piyush', target: 'LLMs' },
            { source: 'Piyush', target: 'JEA' },
            { source: 'Piyush', target: 'AICTE' },
            { source: 'JEA', target: 'SQL' },
            { source: 'JEA', target: 'Python' },
            { source: 'JEA', target: 'ETL Pipeline' },
            { source: 'AICTE', target: 'AWS' },
            { source: 'Python', target: 'AI Music GAN' },
            { source: 'Python', target: 'LLMs' },
            { source: 'SQL', target: 'Dashboard' },
            { source: 'ETL Pipeline', target: 'Python' }
        ]
    };

    const width = container.clientWidth;
    const height = container.clientHeight;

    const Graph = ForceGraph()(container)
        .width(width)
        .height(height)
        .backgroundColor('rgba(0,0,0,0)')
        .nodeRelSize(6)
        .nodeAutoColorBy('group')
        .nodeLabel('id')
        .linkColor(() => 'rgba(100, 255, 218, 0.2)')
        .linkWidth(1.5)
        .linkDirectionalParticles(2)
        .linkDirectionalParticleWidth(2)
        .graphData(gData);

    // Make nodes pulse/glow
    Graph.nodeCanvasObject((node, ctx, globalScale) => {
        const label = node.id;
        const fontSize = 12 / globalScale;
        ctx.font = `${fontSize}px "JetBrains Mono"`;
        const textWidth = ctx.measureText(label).width;
        const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

        ctx.fillStyle = 'rgba(10, 10, 26, 0.8)';
        ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = node.color || '#a78bfa';
        ctx.fillText(label, node.x, node.y);

        node.__bckgDimensions = bckgDimensions;
    });

    // Handle clicks
    Graph.onNodeClick(node => {
        Graph.centerAt(node.x, node.y, 1000);
        Graph.zoom(3, 2000);

        // Highlight logic
        const highlightNodes = new Set();
        const highlightLinks = new Set();

        highlightNodes.add(node);
        gData.links.forEach(link => {
            if (link.source.id === node.id || link.target.id === node.id) {
                highlightLinks.add(link);
                highlightNodes.add(link.source);
                highlightNodes.add(link.target);
            }
        });

        Graph.nodeColor(n => highlightNodes.has(n) ? (n.color || '#64ffda') : 'rgba(255,255,255,0.1)')
            .linkColor(l => highlightLinks.has(l) ? 'rgba(100, 255, 218, 0.8)' : 'rgba(255,255,255,0.05)')
            .linkWidth(l => highlightLinks.has(l) ? 3 : 1)
            .linkDirectionalParticles(l => highlightLinks.has(l) ? 4 : 0);
    });

    Graph.onBackgroundClick(() => {
        Graph.zoomToFit(1000, 50);
        Graph.nodeColor(n => n.color || '#a78bfa')
            .linkColor(() => 'rgba(100, 255, 218, 0.2)')
            .linkWidth(1.5)
            .linkDirectionalParticles(2);
    });

    // Resize handling
    window.addEventListener('resize', () => {
        Graph.width(container.clientWidth).height(container.clientHeight);
    });

    // Initial zoom out then fit
    setTimeout(() => {
        Graph.zoomToFit(1500, 50);
    }, 1000);
}

// ---- ETL Pipeline Mini-Game ----
function initETLMiniGame() {
    const defaultData = document.getElementById('draggable-data');
    if (!defaultData) return;

    const stages = ['extract', 'transform', 'load', 'dashboard'];
    const dropzones = {};
    stages.forEach(s => {
        const dz = document.getElementById(`dropzone-${s}`);
        if (dz) dropzones[s] = dz;
    });

    const status = document.getElementById('etl-status');
    const gear = document.getElementById('transform-gear');
    const dashboard = document.getElementById('etl-dashboard');
    const resetBtn = document.getElementById('reset-etl');

    let currentStage = 'extract';

    // Set up dragging
    defaultData.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', defaultData.id);
        setTimeout(() => {
            defaultData.style.opacity = '0.4';
        }, 0);
    });

    defaultData.addEventListener('dragend', () => {
        defaultData.style.opacity = '1';
    });

    // Drop logic
    Object.keys(dropzones).forEach(key => {
        const dz = dropzones[key];

        dz.addEventListener('dragenter', (e) => {
            e.preventDefault(); // Necessary to allow dropping in some browsers
            dz.classList.add('drag-over');
        });

        dz.addEventListener('dragover', (e) => {
            e.preventDefault(); // Necessary to allow dropping
            dz.classList.add('drag-over');
        });

        dz.addEventListener('dragleave', () => {
            dz.classList.remove('drag-over');
        });

        dz.addEventListener('drop', (e) => {
            e.preventDefault();
            dz.classList.remove('drag-over');

            // Enforce order
            const stageOrder = ['extract', 'transform', 'load'];
            const currentIndex = stageOrder.indexOf(currentStage);
            const dropIndex = stageOrder.indexOf(key);

            if (dropIndex !== currentIndex + 1) {
                // Must go in order
                status.textContent = "Oops! Data must flow in sequence: Extract → Transform → Load";
                status.style.color = "#ef4444";
                return;
            }

            // Valid drop
            dz.appendChild(defaultData);
            currentStage = key;

            status.style.color = "var(--accent)";

            if (key === 'transform') {
                status.innerHTML = "Transforming data via Pandas... <br/> <code>df.dropna().drop_duplicates()</code>";
                gear.classList.add('spin');
                defaultData.textContent = "Clean.json";
                defaultData.className = "data-block clean-data";
            } else if (key === 'load') {
                status.innerHTML = "Loading data into PostgreSQL DB... <br/> <code>INSERT INTO prod_schema...</code>";
                gear.classList.remove('spin');
                defaultData.textContent = "Prod_DB";
                defaultData.className = "data-block db-data";

                // Trigger dashboard
                setTimeout(() => {
                    dashboard.classList.add('active');
                    status.innerHTML = "Pipeline Complete! Dashboard live with updated metrics. 🎉";
                    resetBtn.style.display = 'inline-block';
                    defaultData.setAttribute('draggable', 'false');
                    defaultData.style.cursor = 'default';
                }, 1000);
            }
        });
    });

    // Reset button
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            currentStage = 'extract';
            dropzones['extract'].appendChild(defaultData);
            defaultData.setAttribute('draggable', 'true');
            defaultData.style.cursor = 'grab';
            defaultData.className = "data-block raw-data";
            defaultData.textContent = "Raw.json";

            gear.classList.remove('spin');
            dashboard.classList.remove('active');

            status.textContent = "Status: Waiting for data extraction...";
            status.style.color = "var(--accent)";
            resetBtn.style.display = 'none';
        });
    }
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
    initModeToggle();
    initKnowledgeGraph();
    initETLMiniGame();
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
    initDynamicGreeting();
    initTerminal();
    initCursorTrail();
    initTextScramble();
    initSkillRadar();
    initMatrixRain();
    initOrbitCounters();

    // GSAP (defer to allow library loading)
    setTimeout(initGSAPAnimations, 200);
});
