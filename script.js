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
            '╔══════════════════════════════════════╗',
            '║  🎉 You found the secret!            ║',
            '║  "There are 10 types of people —     ║',
            '║  those who understand binary and      ║',
            '║  those who don\'t."                   ║',
            '╚══════════════════════════════════════╝'
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
    const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`01';

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
                    if (char === ' ') return ' ';
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join('');

            if (iteration >= length) {
                clearInterval(interval);
                element.textContent = originalText;
            }

            iteration += 1 / 2;
        }, 30);
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

// ---- H1-B Runner Game ----
function initGame() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const startOverlay = document.getElementById('game-start-overlay');
    const overOverlay = document.getElementById('game-over-overlay');
    const winOverlay = document.getElementById('game-win-overlay');
    const scoreDisplay = document.getElementById('game-score');
    const finalScore = document.getElementById('final-score');
    const winScore = document.getElementById('win-score');
    const overMsg = document.getElementById('game-over-msg');

    const W = 800;
    const H = 300;
    const GROUND_Y = H - 40;
    const WIN_DISTANCE = 1000;

    let gameState = 'idle'; // idle, playing, over, won
    let score = 0;
    let speed = 4;
    let frameCount = 0;

    // Player
    const player = {
        x: 80,
        y: GROUND_Y,
        w: 30,
        h: 40,
        vy: 0,
        jumping: false,
        jumpPower: -11,
        gravity: 0.55,
        frame: 0
    };

    // Obstacles
    let obstacles = [];
    const obstacleTypes = [
        { emoji: '∑', label: 'Math', color: '#ff6b6b', w: 30, h: 35 },
        { emoji: '∫', label: 'Math', color: '#ff6b6b', w: 25, h: 40 },
        { emoji: 'π', label: 'Math', color: '#ff6b6b', w: 30, h: 32 },
        { emoji: '∂', label: 'Math', color: '#ff6b6b', w: 28, h: 35 },
        { emoji: '⏰', label: 'Time', color: '#ffa500', w: 32, h: 32 },
        { emoji: '⏳', label: 'Time', color: '#ffa500', w: 28, h: 35 },
    ];

    // Background stars
    const stars = [];
    for (let i = 0; i < 40; i++) {
        stars.push({
            x: Math.random() * W,
            y: Math.random() * (GROUND_Y - 20),
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.5 + 0.1
        });
    }

    // Ground tiles
    const groundDashes = [];
    for (let i = 0; i < 30; i++) {
        groundDashes.push({
            x: i * 30 + Math.random() * 10,
            w: Math.random() * 15 + 5
        });
    }

    // H1-B Card (goal)
    let h1bCard = {
        x: W + 100,
        visible: false,
        w: 60,
        h: 45
    };

    function jump() {
        if (!player.jumping) {
            player.vy = player.jumpPower;
            player.jumping = true;
        }
    }

    function spawnObstacle() {
        const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        obstacles.push({
            x: W + 20,
            y: GROUND_Y - type.h,
            w: type.w,
            h: type.h,
            emoji: type.emoji,
            label: type.label,
            color: type.color
        });
    }

    function resetGame() {
        player.y = GROUND_Y;
        player.vy = 0;
        player.jumping = false;
        player.frame = 0;
        obstacles = [];
        score = 0;
        speed = 4;
        frameCount = 0;
        h1bCard.x = W + 100;
        h1bCard.visible = false;
    }

    function startGame() {
        resetGame();
        gameState = 'playing';
        startOverlay.classList.add('hidden');
        overOverlay.classList.add('hidden');
        winOverlay.classList.add('hidden');
        gameLoop();
    }

    function endGame(obstacle) {
        gameState = 'over';
        overOverlay.classList.remove('hidden');
        finalScore.textContent = score;
        overMsg.textContent = obstacle.label === 'Math'
            ? `A Math Monster (${obstacle.emoji}) got you!`
            : `Time (${obstacle.emoji}) caught up with you!`;
    }

    function winGame() {
        gameState = 'won';
        winOverlay.classList.remove('hidden');
        winScore.textContent = score;
    }

    function update() {
        frameCount++;
        score = Math.floor(frameCount * speed / 10);
        scoreDisplay.textContent = score;

        // Speed ramp
        speed = 4 + Math.floor(score / 100) * 0.5;
        if (speed > 10) speed = 10;

        // Player physics
        player.vy += player.gravity;
        player.y += player.vy;
        if (player.y >= GROUND_Y) {
            player.y = GROUND_Y;
            player.vy = 0;
            player.jumping = false;
        }

        // Running animation frame
        if (!player.jumping) {
            player.frame = Math.floor(frameCount / 6) % 4;
        }

        // Spawn obstacles
        let spawnRate = Math.max(60, 120 - score / 5);
        if (frameCount % Math.floor(spawnRate) === 0 && score < WIN_DISTANCE - 50) {
            spawnObstacle();
        }

        // Move obstacles
        obstacles.forEach(ob => {
            ob.x -= speed;
        });
        obstacles = obstacles.filter(ob => ob.x > -50);

        // Collision detection
        const px = player.x;
        const py = player.y - player.h;
        for (let ob of obstacles) {
            if (px + player.w - 8 > ob.x + 5 &&
                px + 8 < ob.x + ob.w - 5 &&
                py + player.h > ob.y + 5 &&
                py < ob.y + ob.h - 5) {
                endGame(ob);
                return;
            }
        }

        // H1-B card logic
        if (score >= WIN_DISTANCE - 100) {
            h1bCard.visible = true;
            h1bCard.x -= speed * 0.5;
            if (h1bCard.x < player.x + player.w + 20) {
                winGame();
                return;
            }
        }

        // Move stars
        stars.forEach(s => {
            s.x -= s.speed;
            if (s.x < 0) s.x = W;
        });

        // Move ground
        groundDashes.forEach(d => {
            d.x -= speed;
            if (d.x < -20) d.x = W + Math.random() * 30;
        });
    }

    function drawPlayer() {
        const px = player.x;
        const py = player.y - player.h;

        // Body
        ctx.fillStyle = '#64ffda';
        ctx.fillRect(px + 8, py + 8, 14, 18);

        // Head
        ctx.beginPath();
        ctx.arc(px + 15, py + 5, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#e2e8f0';
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(px + 13, py + 3, 2, 2);
        ctx.fillRect(px + 17, py + 3, 2, 2);

        // Legs (animated)
        ctx.strokeStyle = '#64ffda';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        if (player.jumping) {
            // Tucked legs while jumping
            ctx.beginPath();
            ctx.moveTo(px + 10, py + 26);
            ctx.lineTo(px + 6, py + 32);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(px + 20, py + 26);
            ctx.lineTo(px + 24, py + 32);
            ctx.stroke();
        } else {
            // Running animation
            const legOffset = Math.sin(player.frame * Math.PI / 2) * 6;
            ctx.beginPath();
            ctx.moveTo(px + 12, py + 26);
            ctx.lineTo(px + 12 + legOffset, py + 38);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(px + 18, py + 26);
            ctx.lineTo(px + 18 - legOffset, py + 38);
            ctx.stroke();
        }

        // Arms
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        const armSwing = Math.sin(player.frame * Math.PI / 2) * 4;
        ctx.beginPath();
        ctx.moveTo(px + 8, py + 12);
        ctx.lineTo(px + 2 - armSwing, py + 22);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(px + 22, py + 12);
        ctx.lineTo(px + 28 + armSwing, py + 22);
        ctx.stroke();
    }

    function drawObstacles() {
        obstacles.forEach(ob => {
            // Glow
            ctx.shadowColor = ob.color;
            ctx.shadowBlur = 12;

            ctx.font = `${ob.h}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillStyle = ob.color;
            ctx.fillText(ob.emoji, ob.x + ob.w / 2, ob.y + ob.h);

            ctx.shadowBlur = 0;
        });
    }

    function drawH1BCard() {
        if (!h1bCard.visible) return;

        const cx = h1bCard.x;
        const cy = GROUND_Y - h1bCard.h - 10;

        // Glow
        ctx.shadowColor = '#64ffda';
        ctx.shadowBlur = 20;

        // Card body
        ctx.fillStyle = '#1a5c40';
        ctx.strokeStyle = '#64ffda';
        ctx.lineWidth = 2;
        roundRect(ctx, cx, cy, h1bCard.w, h1bCard.h, 6);
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;

        // Text
        ctx.fillStyle = '#64ffda';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('H1-B', cx + h1bCard.w / 2, cy + 16);

        ctx.font = '9px monospace';
        ctx.fillStyle = '#a0f0d0';
        ctx.fillText('VISA', cx + h1bCard.w / 2, cy + 30);
        ctx.fillText('🇺🇸', cx + h1bCard.w / 2, cy + 42);

        // Bouncing arrow
        const bounce = Math.sin(frameCount * 0.1) * 4;
        ctx.fillStyle = '#64ffda';
        ctx.font = '16px sans-serif';
        ctx.fillText('▼', cx + h1bCard.w / 2, cy - 6 + bounce);
    }

    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Sky gradient
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#0a0e1a');
        grad.addColorStop(0.6, '#111827');
        grad.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Stars
        stars.forEach(s => {
            ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(frameCount * 0.02 + s.x) * 0.2})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Ground line
        ctx.strokeStyle = 'rgba(100, 255, 218, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, GROUND_Y + 2);
        ctx.lineTo(W, GROUND_Y + 2);
        ctx.stroke();

        // Ground dashes
        ctx.strokeStyle = 'rgba(100, 255, 218, 0.1)';
        ctx.lineWidth = 1;
        groundDashes.forEach(d => {
            ctx.beginPath();
            ctx.moveTo(d.x, GROUND_Y + 8);
            ctx.lineTo(d.x + d.w, GROUND_Y + 8);
            ctx.stroke();
        });

        // Distance markers
        if (score > 0) {
            ctx.fillStyle = 'rgba(100, 255, 218, 0.15)';
            ctx.font = '10px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(`${score}m`, W - 10, 20);

            // Progress bar
            const progress = Math.min(score / WIN_DISTANCE, 1);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.fillRect(W - 160, 26, 150, 4);
            ctx.fillStyle = progress >= 1 ? '#64ffda' : 'rgba(100, 255, 218, 0.4)';
            ctx.fillRect(W - 160, 26, 150 * progress, 4);

            // H1-B label at end of bar
            ctx.fillStyle = 'rgba(100, 255, 218, 0.3)';
            ctx.font = '8px monospace';
            ctx.textAlign = 'right';
            ctx.fillText('H1-B', W - 10, 40);
        }

        drawPlayer();
        drawObstacles();
        drawH1BCard();
    }

    function gameLoop() {
        if (gameState !== 'playing') return;
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    // Controls
    function handleInput(e) {
        if (gameState === 'playing') {
            if (e.type === 'keydown' && e.code === 'Space') {
                e.preventDefault();
                jump();
            }
            if (e.type === 'click' || e.type === 'touchstart') {
                jump();
            }
        }
    }

    document.addEventListener('keydown', handleInput);
    canvas.addEventListener('click', handleInput);
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleInput(e);
    });

    // Buttons
    document.getElementById('game-start-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        startGame();
    });
    document.getElementById('game-restart-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        startGame();
    });
    document.getElementById('game-replay-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        startGame();
    });

    // Also start on space from idle
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            if (gameState === 'idle') {
                e.preventDefault();
                startGame();
            } else if (gameState === 'over' || gameState === 'won') {
                e.preventDefault();
                startGame();
            }
        }
    });

    // Draw initial frame
    draw();
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
    initDynamicGreeting();
    initTerminal();
    initCursorTrail();
    initTextScramble();
    initGame();
});
