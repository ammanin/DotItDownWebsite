/* ============================================================
   Dot It Down — client behavior
   Interactive demo, connect-the-dots, cursor, sound, eggs.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* ---------- Loading screen ---------- */
    const loadingScreen = document.getElementById('loading-screen');
    function hideLoadingScreen() {
        if (!loadingScreen || loadingScreen.classList.contains('fade-out')) return;
        loadingScreen.classList.add('fade-out');
        document.body.classList.remove('loading');
        setTimeout(() => loadingScreen.remove(), 500);
    }
    window.addEventListener('load', hideLoadingScreen);
    setTimeout(hideLoadingScreen, 2200);

    /* ---------- Mobile nav ---------- */
    const navToggle = document.getElementById('nav-toggle');
    const siteNav = document.getElementById('site-nav');
    navToggle?.addEventListener('click', () => {
        const open = siteNav.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', String(open));
        navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    siteNav?.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            siteNav.classList.remove('open');
            navToggle?.setAttribute('aria-expanded', 'false');
        });
    });

    /* ---------- Custom cursor + trail ---------- */
    const cursor = document.querySelector('.dot-cursor');
    if (cursor && finePointer && !reduceMotion) {
        let mx = 0, my = 0, cx = 0, cy = 0, trailTick = 0;
        window.addEventListener('mousemove', e => {
            mx = e.clientX; my = e.clientY;
            if (++trailTick % 3 === 0) {
                const d = document.createElement('span');
                d.className = 'trail-dot';
                d.style.left = mx + 'px';
                d.style.top = my + 'px';
                const hues = ['#FF3CF0', '#FF7A6B', '#FFC857', '#FF6FC1'];
                d.style.background = hues[trailTick % hues.length];
                document.body.appendChild(d);
                setTimeout(() => d.remove(), 700);
            }
        });
        const raf = () => {
            cx += (mx - cx) * 0.22;
            cy += (my - cy) * 0.22;
            cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
            requestAnimationFrame(raf);
        };
        raf();
        const interactive = 'a, button, input, textarea, select, .demo-task, .demo-check, .thought, .pop-dot';
        document.addEventListener('mouseover', e => {
            if (e.target.closest(interactive)) cursor.classList.add('is-active');
        });
        document.addEventListener('mouseout', e => {
            if (e.target.closest(interactive)) cursor.classList.remove('is-active');
        });
    }

    /* ---------- Sound toggle ---------- */
    const soundBtn = document.getElementById('sound-toggle');
    let soundOn = false;
    let audioCtx = null;
    function playTick() {
        if (!soundOn) return;
        try {
            audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.type = 'sine';
            o.frequency.setValueAtTime(920, audioCtx.currentTime);
            o.frequency.exponentialRampToValueAtTime(420, audioCtx.currentTime + 0.09);
            g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.14, audioCtx.currentTime + 0.01);
            g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.13);
            o.connect(g).connect(audioCtx.destination);
            o.start();
            o.stop(audioCtx.currentTime + 0.14);
        } catch (_) { /* ignore */ }
    }
    soundBtn?.addEventListener('click', () => {
        soundOn = !soundOn;
        soundBtn.setAttribute('aria-pressed', String(soundOn));
        if (soundOn) playTick();
    });

    /* ---------- Interactive mini task list ---------- */
    const list = document.getElementById('demo-list');
    const form = document.getElementById('demo-add-form');
    const input = document.getElementById('demo-input');
    const countEl = document.getElementById('demo-count-num');
    const tipEl = document.getElementById('demo-tip');
    const emptyEl = document.getElementById('demo-empty');
    const phone = document.getElementById('demo-phone');
    const dateEl = document.getElementById('demo-date');

    if (dateEl) {
        const now = new Date();
        dateEl.textContent = 'TODAY';
    }

    const starterTasks = [
        { text: 'Water the plants', icon: '🪴' },
        { text: 'Text mom back', icon: '💬' },
        { text: 'Pick up the dry cleaning', icon: '👕' },
    ];

    const tips = [
        'tip: swipe a task right to complete it →',
        'nice. try adding another.',
        'try typing "pizza"',
        'or drop one of those floating thoughts in.',
        "that's the whole thing. that's the app.",
        'imagine this on your phone. that\'s it.',
    ];
    let tipIndex = 0;
    function nextTip() {
        if (!tipEl) return;
        tipIndex = (tipIndex + 1) % tips.length;
        tipEl.style.opacity = 0;
        setTimeout(() => {
            tipEl.textContent = tips[tipIndex];
            tipEl.style.opacity = 1;
        }, 180);
    }

    function remainingCount() {
        return list ? list.querySelectorAll('.demo-task:not(.completing)').length : 0;
    }

    function updateCount() {
        if (!countEl) return;
        const n = remainingCount();
        countEl.textContent = n;
        if (emptyEl) {
            const empty = n === 0;
            emptyEl.hidden = !empty;
            if (list) list.style.display = empty ? 'none' : 'flex';
        }
    }

    function spawnPop(task) {
        const pop = document.createElement('span');
        pop.className = 'dot-pop';
        const r = task.getBoundingClientRect();
        const pr = phone?.getBoundingClientRect();
        if (!pr) return;
        pop.style.left = (r.left - pr.left + 18) + 'px';
        pop.style.top = (r.top - pr.top + 18) + 'px';
        phone.appendChild(pop);
        setTimeout(() => pop.remove(), 450);
    }

    function completeTask(task) {
        if (!task || task.classList.contains('completing')) return;
        task.classList.add('completing');
        task.querySelector('.demo-check')?.classList.add('checked');
        spawnPop(task);
        phone?.classList.remove('pop');
        void phone?.offsetWidth;
        phone?.classList.add('pop');
        playTick();
        updateCount();
        setTimeout(() => {
            task.remove();
            updateCount();
        }, 550);
        nextTip();
    }

    list?.addEventListener('click', (e) => {
        const check = e.target.closest('.demo-check');
        if (!check) return;
        completeTask(check.closest('.demo-task'));
    });

    // Pointer swipe (one set of listeners)
    let swipe = null;
    list?.addEventListener('pointerdown', (e) => {
        const task = e.target.closest('.demo-task');
        if (!task || e.target.closest('.demo-check')) return;
        swipe = { task, startX: e.clientX, dx: 0 };
        task.classList.add('dragging');
        task.setPointerCapture?.(e.pointerId);
    });
    list?.addEventListener('pointermove', (e) => {
        if (!swipe) return;
        swipe.dx = Math.max(0, e.clientX - swipe.startX);
        swipe.task.style.transform = `translateX(${swipe.dx}px)`;
        swipe.task.classList.toggle('swiping', swipe.dx > 36);
    });
    const endSwipe = () => {
        if (!swipe) return;
        const { task, dx } = swipe;
        task.classList.remove('dragging');
        if (dx > 88) {
            task.style.transform = '';
            completeTask(task);
        } else {
            task.style.transform = '';
            task.classList.remove('swiping');
        }
        swipe = null;
    };
    list?.addEventListener('pointerup', endSwipe);
    list?.addEventListener('pointercancel', endSwipe);

    const emojiFor = (text) => {
        const t = text.toLowerCase();
        if (/plant|water/.test(t)) return '🪴';
        if (/mom|dad|text|call|phone/.test(t)) return '💬';
        if (/dentist|tooth/.test(t)) return '🦷';
        if (/pill|prescription|meds/.test(t)) return '💊';
        if (/coffee|brew|espresso/.test(t)) return '☕';
        if (/dog|walk/.test(t)) return '🐕';
        if (/book|read|library/.test(t)) return '📚';
        if (/gym|run|workout/.test(t)) return '🏃';
        if (/pizza/.test(t)) return '🍕';
        if (/mail|post|letter|grandma/.test(t)) return '📮';
        if (/laundry|wash|clean|dry/.test(t)) return '🧺';
        if (/eat|lunch|dinner|food/.test(t)) return '🥗';
        if (/birthday|card|gift/.test(t)) return '🎁';
        if (/car|drive/.test(t)) return '🚗';
        if (/sleep|nap/.test(t)) return '😴';
        if (/secret/.test(t)) return '🤫';
        return '•';
    };

    function burst(anchor, emoji, count = 8) {
        const rect = (anchor || document.body).getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'egg-burst';
            p.textContent = emoji;
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
            const dist = 110 + Math.random() * 70;
            p.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
            p.style.setProperty('--dy', `${Math.sin(angle) * dist - 50}px`);
            p.style.left = `${cx}px`;
            p.style.top = `${cy}px`;
            document.body.appendChild(p);
            setTimeout(() => p.remove(), 1300);
        }
    }

    function addTask(text, icon) {
        const val = (text || '').trim();
        if (!val || !list) return;

        if (emptyEl) emptyEl.hidden = true;
        list.style.display = 'flex';

        if (/\bpizza\b/i.test(val)) burst(form, '🍕');
        if (/\bcoffee\b/i.test(val)) burst(form, '☕', 6);
        if (/\bsecret\b/i.test(val)) {
            if (tipEl) tipEl.textContent = "shhh. you're my favorite visitor.";
        }

        const li = document.createElement('li');
        li.className = 'demo-task added';
        const safeIcon = icon || emojiFor(val);
        li.innerHTML = `
            <button class="demo-check" aria-label="Complete ${val.replace(/"/g, '')}"></button>
            <span class="demo-icon" aria-hidden="true"></span>
            <span class="demo-text"></span>
        `;
        li.querySelector('.demo-icon').textContent = safeIcon;
        li.querySelector('.demo-text').textContent = val;
        list.appendChild(li);
        updateCount();
        nextTip();
    }

    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        addTask(input.value);
        input.value = '';
    });

    document.querySelectorAll('.thought').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('used')) return;
            btn.classList.add('used');
            addTask(btn.dataset.task, emojiFor(btn.dataset.task || ''));
        });
    });

    document.getElementById('demo-reset')?.addEventListener('click', () => {
        list.innerHTML = '';
        starterTasks.forEach(t => addTask(t.text, t.icon));
        document.querySelectorAll('.thought.used').forEach(t => t.classList.remove('used'));
        if (tipEl) tipEl.textContent = 'welcome back. catch another thought.';
    });

    updateCount();

    /* ---------- Logo dance easter egg ---------- */
    const logo = document.getElementById('logo-link');
    let logoClicks = 0;
    logo?.addEventListener('click', (e) => {
        if (logo.getAttribute('href') === '#') e.preventDefault();
        logoClicks += 1;
        if (logoClicks >= 5) {
            logo.classList.add('dance');
            burst(logo, '•', 10);
            setTimeout(() => logo.classList.remove('dance'), 2800);
            logoClicks = 0;
        }
    });

    /* ---------- Footer pop-dots ---------- */
    document.querySelectorAll('.pop-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            dot.classList.toggle('popped');
            playTick();
        });
    });

    /* ---------- FAQ ---------- */
    document.querySelectorAll('.faq-question').forEach(q => {
        q.addEventListener('click', () => {
            const item = q.closest('.faq-item');
            const expanded = item.classList.toggle('open');
            q.setAttribute('aria-expanded', String(expanded));
        });
    });

    /* ---------- Email signup ---------- */
    const emailForm = document.getElementById('email-signup');
    const emailInput = document.getElementById('email-input');
    const emailStatus = document.getElementById('email-status');
    emailForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const v = (emailInput.value || '').trim();
        if (!v) return;
        emailStatus.textContent = 'noting that down…';
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    name: 'Newsletter',
                    email: v,
                    category: 'Newsletter',
                    message: 'Please add me to the occasional notes list.'
                })
            });
            const data = await res.json().catch(() => ({}));
            emailStatus.textContent = data.ok
                ? 'noted. no spam, promise.'
                : 'noted locally. (the carrier pigeon is napping.)';
        } catch {
            emailStatus.textContent = 'noted. no spam, promise.';
        }
        emailInput.value = '';
        setTimeout(() => { emailStatus.textContent = ''; }, 6000);
    });

    /* ---------- Contact modal ---------- */
    const contactTrigger = document.getElementById('contact-trigger');
    const contactModal = document.getElementById('contact-modal');
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('contact-form-status');
    const modalCloseBtn = contactModal?.querySelector('.modal-close');

    function openContactModal() {
        if (!contactModal) return;
        contactModal.classList.add('is-open');
        contactModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        contactModal.querySelector('input, select, textarea')?.focus();
    }
    function closeContactModal() {
        if (!contactModal) return;
        contactModal.classList.remove('is-open');
        contactModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
    contactTrigger?.addEventListener('click', (e) => {
        e.preventDefault();
        openContactModal();
    });
    modalCloseBtn?.addEventListener('click', closeContactModal);
    contactModal?.addEventListener('click', (e) => {
        if (e.target === contactModal) closeContactModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && contactModal?.classList.contains('is-open')) closeContactModal();
    });

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            formStatus.textContent = '';
            formStatus.className = 'form-status';
            const submitBtn = contactForm.querySelector('.btn-submit');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending…';
            }
            const payload = {
                name: contactForm.querySelector('#contact-name')?.value?.trim() || '',
                email: contactForm.querySelector('#contact-email')?.value?.trim() || '',
                category: contactForm.querySelector('#contact-category')?.value?.trim() || '',
                message: contactForm.querySelector('#contact-message')?.value?.trim() || ''
            };
            const action = contactForm.getAttribute('action') || '/api/contact';
            try {
                const res = await fetch(action, {
                    method: 'POST',
                    body: JSON.stringify(payload),
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
                });
                const data = await res.json();
                if (data.ok) {
                    formStatus.textContent = 'Got it. I\'ll write back.';
                    formStatus.classList.add('success');
                    contactForm.reset();
                    setTimeout(closeContactModal, 1400);
                } else {
                    formStatus.textContent = data.error || 'Something went sideways. Try again?';
                    formStatus.classList.add('error');
                }
            } catch {
                formStatus.textContent = 'Network hiccup. Try again in a moment.';
                formStatus.classList.add('error');
            }
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send';
            }
        });
    }

    /* ---------- Walkthrough play button ---------- */
    const watchFrame = document.getElementById('watch-frame');
    const watchPlay = document.getElementById('watch-play');
    const watchVideo = document.getElementById('watch-video');
    watchPlay?.addEventListener('click', () => {
        watchFrame?.classList.add('is-playing');
        if (watchVideo) {
            watchVideo.hidden = false;
            watchVideo.muted = false;
            watchVideo.play?.().catch(() => {});
        }
    });

    /* ---------- Squiggle underlines on titles ---------- */
    document.querySelectorAll('.section-title').forEach(title => {
        if (title.querySelector('.title-squiggle')) return;
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'title-squiggle');
        svg.setAttribute('viewBox', '0 0 280 16');
        svg.setAttribute('preserveAspectRatio', 'none');
        svg.setAttribute('aria-hidden', 'true');
        svg.innerHTML = '<path d="M4 10 C 40 2, 70 14, 110 8 S 180 2, 220 11 S 260 6, 276 9"/>';
        title.appendChild(svg);
    });

    /* ---------- Scroll reveals ---------- */
    const revealTargets = document.querySelectorAll(
        '.section-title, .section-sub, .win-card, .moment-card, .day-card, .say-card, .no-list li, .nutrition-card, .price-card, .founder-note, .founder-stats, .download-buttons, .email-signup, .doodle-divider, .a-day, .watch-frame'
    );
    revealTargets.forEach(el => el.classList.add('reveal'));

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
        });
    }, { threshold: 0.12 });
    revealTargets.forEach(el => io.observe(el));

    /* ---------- Play feature clips when in view ---------- */
    const videos = document.querySelectorAll('.win-video video, .moment-video video');
    const vio = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const v = entry.target;
            if (entry.isIntersecting) v.play?.().catch(() => {});
            else v.pause?.();
        });
    }, { threshold: 0.25 });
    videos.forEach(v => vio.observe(v));

    /* ---------- Smooth-scroll anchors ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const id = a.getAttribute('href');
            if (!id || id === '#' || id.length < 2) return;
            const t = document.querySelector(id);
            if (!t) return;
            e.preventDefault();
            t.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        });
    });

    /* ---------- Connect-the-dots (scroll-driven) ---------- */
    const canvas = document.getElementById('connect-dots');
        if (canvas && !reduceMotion && window.innerWidth > 780 && !document.body.classList.contains('page-privacy')) {
        const ctx = canvas.getContext('2d');
        const dots = [];
        const DOT_COUNT = 16;

        function hash(i, salt) {
            const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
            return x - Math.floor(x);
        }

        function layoutDots() {
            dots.length = 0;
            const docH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
            for (let i = 0; i < DOT_COUNT; i++) {
                const side = i % 2 === 0 ? 'left' : 'right';
                const margin = 28 + hash(i, 1) * 36;
                dots.push({
                    x: side === 'left' ? margin : window.innerWidth - margin,
                    y: (docH * (0.08 + (i / (DOT_COUNT - 1)) * 0.84)),
                    r: 2.4 + hash(i, 2) * 2.4,
                    hue: hash(i, 3)
                });
            }
        }

        function sizeCanvas() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = window.innerWidth + 'px';
            canvas.style.height = window.innerHeight + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            layoutDots();
        }

        function draw() {
            const w = window.innerWidth;
            const h = window.innerHeight;
            ctx.clearRect(0, 0, w, h);
            const maxScroll = Math.max(1, document.documentElement.scrollHeight - h);
            const progress = Math.min(1, window.scrollY / maxScroll);
            const inkY = window.scrollY + h * 0.42 + progress * h * 0.2;

            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            for (let i = 0; i < dots.length - 1; i++) {
                const a = dots[i];
                const b = dots[i + 1];
                const ay = a.y - window.scrollY;
                const by = b.y - window.scrollY;
                const reached = inkY > a.y;
                if (!reached) continue;

                const t = Math.max(0, Math.min(1, (inkY - a.y) / Math.max(1, b.y - a.y)));
                const mx = a.x + (b.x - a.x) * t;
                const my = ay + (by - ay) * t;
                const cx1 = a.x + (b.x - a.x) * 0.35;
                const cy1 = ay + 40 * (i % 2 === 0 ? 1 : -1);
                const endX = t < 1 ? mx : b.x;
                const endY = t < 1 ? my : by;

                ctx.beginPath();
                ctx.moveTo(a.x, ay);
                ctx.quadraticCurveTo(cx1, cy1, endX, endY);
                ctx.strokeStyle = `rgba(255, 60, 240, ${0.22 + 0.18 * (1 - i / dots.length)})`;
                ctx.lineWidth = 1.4;
                ctx.stroke();
            }

            dots.forEach((d, i) => {
                const y = d.y - window.scrollY;
                if (y < -40 || y > h + 40) return;
                const filled = inkY > d.y;
                ctx.beginPath();
                ctx.arc(d.x, y, d.r, 0, Math.PI * 2);
                if (filled) {
                    const pal = ['#FF3CF0', '#FF7A6B', '#FFC857', '#FF6FC1'];
                    ctx.fillStyle = pal[i % pal.length];
                    ctx.fill();
                } else {
                    ctx.strokeStyle = 'rgba(255, 252, 249, 0.28)';
                    ctx.lineWidth = 1.2;
                    ctx.stroke();
                }
            });
        }

        let ticking = false;
        function onScroll() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => { draw(); ticking = false; });
        }

        sizeCanvas();
        draw();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', () => { sizeCanvas(); draw(); });
    }
});
