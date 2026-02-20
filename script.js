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

// ---- Auto-Typing Code Terminal ----
function initAutoTypingTerminal() {
    const codeEl = document.getElementById('auto-typed-code');
    if (!codeEl) return;

    const codeSnippets = [
        {
            tab: 'pipeline.py',
            lines: [
                { text: '# ETL Pipeline — Production', cls: 'syntax-comment' },
                { text: 'import', cls: 'syntax-keyword', rest: ' pandas ', restCls: 'syntax-keyword', rest2: 'as pd', rest2Cls: 'syntax-variable' },
                { text: 'from', cls: 'syntax-keyword', rest: ' sqlalchemy ', restCls: '', rest2: 'import create_engine', rest2Cls: 'syntax-function' },
                { text: '' },
                { text: 'df = pd.', cls: '', rest: 'read_sql', restCls: 'syntax-function', rest2: '(query, engine)', rest2Cls: '' },
                { text: 'df = df.', cls: '', rest: 'dropna', restCls: 'syntax-function', rest2: '().reset_index()', rest2Cls: '' },
                { text: 'df[', cls: '', rest: '"efficiency"', restCls: 'syntax-string', rest2: '] = df.output / df.input', rest2Cls: '' },
                { text: 'df.', cls: '', rest: 'to_sql', restCls: 'syntax-function', rest2: '("kpi_metrics", engine)', rest2Cls: '' },
            ]
        },
        {
            tab: 'model.py',
            lines: [
                { text: '# ML Model Training', cls: 'syntax-comment' },
                { text: 'from', cls: 'syntax-keyword', rest: ' sklearn.ensemble ', restCls: '', rest2: 'import RandomForestClassifier', rest2Cls: 'syntax-class' },
                { text: 'from', cls: 'syntax-keyword', rest: ' sklearn.metrics ', restCls: '', rest2: 'import accuracy_score', rest2Cls: 'syntax-function' },
                { text: '' },
                { text: 'model = ', cls: '', rest: 'RandomForestClassifier', restCls: 'syntax-class', rest2: '(n_estimators=100)', rest2Cls: '' },
                { text: 'model.', cls: '', rest: 'fit', restCls: 'syntax-function', rest2: '(X_train, y_train)', rest2Cls: '' },
                { text: 'accuracy = ', cls: '', rest: 'accuracy_score', restCls: 'syntax-function', rest2: '(y_test, predictions)', rest2Cls: '' },
                { text: 'print(f"Accuracy: ', cls: '', rest: '{accuracy:.2%}', restCls: 'syntax-variable', rest2: '")', rest2Cls: 'syntax-string' },
            ]
        },
        {
            tab: 'analysis.sql',
            lines: [
                { text: '-- KPI Dashboard Query', cls: 'syntax-comment' },
                { text: 'SELECT', cls: 'syntax-keyword', rest: ' department,', restCls: '', rest2: '', rest2Cls: '' },
                { text: '       COUNT', cls: 'syntax-function', rest: '(*) ', restCls: '', rest2: 'AS total_records,', rest2Cls: 'syntax-variable' },
                { text: '       AVG', cls: 'syntax-function', rest: '(efficiency) ', restCls: '', rest2: 'AS avg_efficiency,', rest2Cls: 'syntax-variable' },
                { text: '       SUM', cls: 'syntax-function', rest: '(cost) ', restCls: '', rest2: 'AS total_cost', rest2Cls: 'syntax-variable' },
                { text: 'FROM', cls: 'syntax-keyword', rest: ' operational_metrics', restCls: '', rest2: '', rest2Cls: '' },
                { text: 'WHERE', cls: 'syntax-keyword', rest: ' fiscal_year = ', restCls: '', rest2: '2025', rest2Cls: 'syntax-number' },
                { text: 'GROUP BY', cls: 'syntax-keyword', rest: ' department ', restCls: '', rest2: 'ORDER BY avg_efficiency DESC;', rest2Cls: 'syntax-keyword' },
            ]
        }
    ];

    let currentSnippet = 0;
    let currentLine = 0;
    let currentChar = 0;

    function getLineHTML(lineObj) {
        if (!lineObj.text) return '';
        let html = '';
        const fullText = lineObj.text + (lineObj.rest || '') + (lineObj.rest2 || '');
        return fullText;
    }

    function buildSyntaxHTML(lineObj, charCount) {
        const fullText = lineObj.text + (lineObj.rest || '') + (lineObj.rest2 || '');
        const visibleText = fullText.substring(0, charCount);

        // Build syntax-highlighted HTML for visible portion
        let html = '';
        let pos = 0;

        // Part 1: lineObj.text
        const t1 = lineObj.text;
        const t1Visible = visibleText.substring(pos, Math.min(pos + t1.length, charCount));
        if (t1Visible.length > 0) {
            html += lineObj.cls ? `<span class="${lineObj.cls}">${t1Visible}</span>` : t1Visible;
        }
        pos += t1.length;

        // Part 2: lineObj.rest
        if (lineObj.rest && pos < charCount) {
            const t2 = lineObj.rest;
            const t2Visible = visibleText.substring(pos, Math.min(pos + t2.length, charCount));
            if (t2Visible.length > 0) {
                html += lineObj.restCls ? `<span class="${lineObj.restCls}">${t2Visible}</span>` : t2Visible;
            }
            pos += t2.length;
        }

        // Part 3: lineObj.rest2
        if (lineObj.rest2 && pos < charCount) {
            const t3 = lineObj.rest2;
            const t3Visible = visibleText.substring(pos, Math.min(pos + t3.length, charCount));
            if (t3Visible.length > 0) {
                html += lineObj.rest2Cls ? `<span class="${lineObj.rest2Cls}">${t3Visible}</span>` : t3Visible;
            }
        }

        return html;
    }

    function typeNextChar() {
        const snippet = codeSnippets[currentSnippet];
        const line = snippet.lines[currentLine];
        const fullText = line.text + (line.rest || '') + (line.rest2 || '');

        if (currentChar <= fullText.length) {
            // Build all previous lines (fully typed)
            let html = '';
            for (let i = 0; i < currentLine; i++) {
                html += buildSyntaxHTML(snippet.lines[i], 9999) + '\n';
            }
            // Current line (partially typed)
            html += buildSyntaxHTML(line, currentChar);

            codeEl.innerHTML = html;
            currentChar++;
            setTimeout(typeNextChar, 25 + Math.random() * 35);
        } else {
            // Move to next line
            currentLine++;
            currentChar = 0;
            if (currentLine < snippet.lines.length) {
                setTimeout(typeNextChar, 100);
            } else {
                // Snippet complete, wait then switch
                setTimeout(() => {
                    currentSnippet = (currentSnippet + 1) % codeSnippets.length;
                    currentLine = 0;
                    currentChar = 0;

                    // Update tab name
                    const tabEl = document.querySelector('.hero-terminal-tab');
                    if (tabEl) tabEl.textContent = codeSnippets[currentSnippet].tab;

                    // Fade out, clear, fade in
                    codeEl.style.opacity = '0';
                    setTimeout(() => {
                        codeEl.innerHTML = '';
                        codeEl.style.opacity = '1';
                        typeNextChar();
                    }, 400);
                }, 3000);
            }
        }
    }

    // Start typing after preloader completes (3s preloader + 500ms buffer)
    setTimeout(typeNextChar, 4000);
}

// ---- GSAP Scroll Animations ----
function initGSAPAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Helper: remove animate-on-scroll from GSAP-targeted elements so they don't conflict
    function prepForGSAP(selector) {
        gsap.utils.toArray(selector).forEach(el => {
            el.classList.remove('animate-on-scroll');
            el.classList.remove('visible');
            el.style.opacity = '';
            el.style.transform = '';
            el.style.filter = '';
            el.style.transition = 'none';
        });
    }

    // Prep all GSAP-targeted elements
    prepForGSAP('.timeline-item');
    prepForGSAP('.project-card');
    prepForGSAP('.cert-card');
    prepForGSAP('.stat-item');
    prepForGSAP('.tech-icon');

    // Timeline items — stagger from left
    gsap.utils.toArray('.timeline-item').forEach((item, i) => {
        gsap.fromTo(item,
            { x: -40, opacity: 0 },
            {
                scrollTrigger: {
                    trigger: item,
                    start: 'top 85%',
                },
                x: 0,
                opacity: 1,
                duration: 0.8,
                delay: i * 0.12,
                ease: 'power2.out'
            }
        );
    });

    // Project cards — pop in
    gsap.utils.toArray('.project-card').forEach((card, i) => {
        gsap.fromTo(card,
            { y: 50, scale: 0.92, opacity: 0 },
            {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                },
                y: 0,
                scale: 1,
                opacity: 1,
                duration: 0.7,
                delay: i * 0.1,
                ease: 'back.out(1.5)'
            }
        );
    });

    // Cert cards — cascade in
    gsap.utils.toArray('.cert-card').forEach((card, i) => {
        gsap.fromTo(card,
            { y: 40, opacity: 0 },
            {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                },
                y: 0,
                opacity: 1,
                duration: 0.6,
                delay: i * 0.08,
                ease: 'power2.out'
            }
        );
    });

    // Stats counter — scale bounce
    gsap.utils.toArray('.stat-item').forEach((item, i) => {
        gsap.fromTo(item,
            { scale: 0, opacity: 0 },
            {
                scrollTrigger: {
                    trigger: item,
                    start: 'top 90%',
                },
                scale: 1,
                opacity: 1,
                duration: 0.5,
                delay: i * 0.15,
                ease: 'back.out(2)'
            }
        );
    });

    // Tech icons — wave effect
    gsap.utils.toArray('.tech-icon').forEach((icon, i) => {
        gsap.fromTo(icon,
            { y: 20, opacity: 0 },
            {
                scrollTrigger: {
                    trigger: icon,
                    start: 'top 90%',
                },
                y: 0,
                opacity: 1,
                duration: 0.4,
                delay: i * 0.05,
                ease: 'power2.out'
            }
        );
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
    initDynamicGreeting();
    initTerminal();
    initCursorTrail();
    initTextScramble();
    initAutoTypingTerminal();

    // GSAP (defer to allow library loading)
    setTimeout(initGSAPAnimations, 200);
});
