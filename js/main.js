/* ============================================================
   Dot It Down — client behavior
   Interactive demo, connect-the-dots, cursor, sound, eggs.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const PALETTE = ['#9B30FF', '#FF3CF0', '#0063D6', '#FFD700', '#B366FF', '#FF8C00'];

    /* ---------- Animations Toggle State ---------- */
    let animationsEnabled = localStorage.getItem('did-animations') !== 'false';
    const animToggle = document.getElementById('sound-toggle');
    
    function updateAnimationState() {
        document.body.classList.toggle('animations-disabled', !animationsEnabled);
        if (animToggle) {
            animToggle.setAttribute('aria-pressed', String(animationsEnabled));
        }
        localStorage.setItem('did-animations', String(animationsEnabled));
    }
    
    animToggle?.addEventListener('click', () => {
        animationsEnabled = !animationsEnabled;
        updateAnimationState();
    });
    
    // Initial sync
    updateAnimationState();

    function spawnParticleBurst(x, y, count = 14) {
        if (!animationsEnabled) return;
        for (let i = 0; i < count; i++) {
            const el = document.createElement('span');
            el.className = 'particle-burst';
            el.style.left = x + 'px';
            el.style.top = y + 'px';
            el.style.background = PALETTE[i % PALETTE.length];
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const dist = 60 + Math.random() * 80;
            el.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
            el.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 900);
        }
    }

    function initCosmicBackground() {
        const sky = document.getElementById('sky-canvas');
        const swirl = document.getElementById('swirl-canvas');
        if (!sky || !swirl || reduceMotion) return;
        const skyCtx = sky.getContext('2d');
        const swirlCtx = swirl.getContext('2d');
        const stars = [];
        let w = 0, h = 0, dpr = 1, scrollY = 0, time = 0;

        function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = window.innerWidth;
            h = window.innerHeight;
            [sky, swirl].forEach(c => {
                c.width = w * dpr;
                c.height = h * dpr;
                c.style.width = w + 'px';
                c.style.height = h + 'px';
            });
            skyCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
            swirlCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
            if (!stars.length) {
                for (let i = 0; i < 130; i++) {
                    stars.push({
                        x: Math.random() * w,
                        y: Math.random() * h * 2,
                        r: Math.random() * 1.6 + 0.35,
                        tw: Math.random() * 6.28,
                        c: PALETTE[Math.floor(Math.random() * PALETTE.length)],
                    });
                }
            }
        }

        function draw() {
            if (!animationsEnabled) {
                skyCtx.clearRect(0, 0, w, h);
                swirlCtx.clearRect(0, 0, w, h);
                requestAnimationFrame(draw);
                return;
            }
            time += 0.014;
            scrollY = window.scrollY;
            skyCtx.clearRect(0, 0, w, h);
            const drift = scrollY * 0.06;
            for (const s of stars) {
                let y = (s.y - drift * 0.15) % (h + 16);
                if (y < 0) y += h + 16;
                const pulse = 0.5 + Math.sin(time * 2 + s.tw) * 0.35;
                skyCtx.beginPath();
                skyCtx.arc(s.x, y, s.r * pulse, 0, Math.PI * 2);
                skyCtx.fillStyle = s.c;
                skyCtx.globalAlpha = 0.25 + pulse * 0.5;
                skyCtx.fill();
            }
            skyCtx.globalAlpha = 1;

            swirlCtx.clearRect(0, 0, w, h);
            const cx = w * 0.65 + Math.sin(time * 0.12) * 24;
            const cy = h * 0.32 + scrollY * 0.04;
            swirlCtx.save();
            swirlCtx.translate(cx, cy);
            swirlCtx.rotate(time * 0.018);
            for (let i = 0; i < 4; i++) {
                swirlCtx.beginPath();
                const R = 100 + i * 50;
                for (let a = 0; a <= Math.PI * 2; a += 0.1) {
                    const r = R + Math.sin(a * 3 + time + i) * 22;
                    const x = Math.cos(a) * r;
                    const y = Math.sin(a) * r * 0.55;
                    a === 0 ? swirlCtx.moveTo(x, y) : swirlCtx.lineTo(x, y);
                }
                swirlCtx.closePath();
                swirlCtx.strokeStyle = i % 2 ? `rgba(155,48,255,${0.07 + i * 0.02})` : `rgba(0,99,214,${0.06 + i * 0.02})`;
                swirlCtx.lineWidth = 2;
                swirlCtx.stroke();
            }
            swirlCtx.restore();
            requestAnimationFrame(draw);
        }

        resize();
        window.addEventListener('resize', resize);
        draw();
    }

    function initLoaderBurst() {
        const canvas = document.getElementById('loader-particles');
        if (!canvas || reduceMotion) return;
        const ctx = canvas.getContext('2d');
        const parts = [];
        for (let i = 0; i < 40; i++) {
            const a = (Math.PI * 2 * i) / 40;
            parts.push({
                x: canvas.offsetWidth / 2, y: canvas.offsetHeight / 2,
                vx: Math.cos(a) * (1 + Math.random()),
                vy: Math.sin(a) * (1 + Math.random()),
                life: 1, c: PALETTE[i % PALETTE.length], r: 2 + Math.random() * 2,
            });
        }
        let frames = 0;
        function loop() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (const p of parts) {
                p.x += p.vx; p.y += p.vy; p.life -= 0.015;
                if (p.life <= 0) continue;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
                ctx.fillStyle = p.c;
                ctx.globalAlpha = p.life;
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            if (++frames < 100) requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    }

    function initParallaxHero() {
        if (reduceMotion) return;
        const demo = document.querySelector('.hero-demo');
        const copy = document.querySelector('.hero-copy');
        if (!demo) return;
        window.addEventListener('mousemove', (e) => {
            if (!animationsEnabled) {
                demo.style.transform = '';
                if (copy) copy.style.transform = '';
                return;
            }
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;
            demo.style.transform = `perspective(900px) rotateY(${x * 4}deg) rotateX(${-y * 3}deg)`;
            if (copy) copy.style.transform = `translate(${x * -8}px, ${y * -6}px)`;
        });
    }

    function initMeltCards() {
        if (reduceMotion) return;
        const cards = document.querySelectorAll('[data-melt]');
        const onScroll = () => {
            if (!animationsEnabled) {
                cards.forEach(el => el.style.transform = '');
                return;
            }
            const vh = window.innerHeight;
            cards.forEach(el => {
                const r = el.getBoundingClientRect();
                const dist = ((r.top + r.height / 2) - vh * 0.5) / vh;
                const skew = Math.max(-2.5, Math.min(2.5, dist * 5));
                el.style.transform = `translateY(${dist * 10}px) skewY(${skew * 0.35}deg) rotate(${skew * 0.12}deg)`;
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    function initPriceTilt() {
        const card = document.querySelector('.glass-price');
        if (!card || reduceMotion) return;
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform = `perspective(800px) rotateX(${-y * 7}deg) rotateY(${x * 9}deg)`;
        });
        card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    }

    initCosmicBackground();
    initLoaderBurst();
    initParallaxHero();
    initMeltCards();
    initPriceTilt();

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
    const cursor = document.querySelector('.orbit-cursor');
    if (cursor && finePointer && !reduceMotion) {
        let mx = 0, my = 0, cx = 0, cy = 0, trailTick = 0;
        const phoneEl = document.getElementById('demo-phone') || document.querySelector('.glass-device');

        phoneEl?.addEventListener('pointerenter', () => {
            cursor.classList.add('is-hidden');
            cursor.classList.remove('is-active');
            document.querySelectorAll('.trail-dot').forEach(d => d.remove());
        });
        phoneEl?.addEventListener('pointerleave', () => {
            cursor.classList.remove('is-hidden');
        });

        window.addEventListener('mousemove', e => {
            if (!animationsEnabled) {
                document.querySelectorAll('.trail-dot').forEach(d => d.remove());
                return;
            }
            mx = e.clientX; my = e.clientY;
            const r = phoneEl?.getBoundingClientRect();
            const overPhone = !!e.target.closest('#demo-phone, .glass-device') ||
                (r && mx >= r.left && mx <= r.right && my >= r.top && my <= r.bottom);

            cursor.classList.toggle('is-hidden', overPhone);
            if (overPhone) {
                document.querySelectorAll('.trail-dot').forEach(d => d.remove());
                return;
            }

            if (++trailTick % 3 === 0) {
                const d = document.createElement('span');
                d.className = 'trail-dot';
                d.style.left = mx + 'px';
                d.style.top = my + 'px';
                const hues = ['#9B30FF', '#FF3CF0', '#0063D6', '#FFD700'];
                d.style.background = hues[trailTick % hues.length];
                document.body.appendChild(d);
                setTimeout(() => d.remove(), 700);
            }
        });
        const raf = () => {
            if (animationsEnabled) {
                cx += (mx - cx) * 0.3;
                cy += (my - cy) * 0.3;
                cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
            }
            requestAnimationFrame(raf);
        };
        raf();
        const interactive = 'a, button, input, textarea, select, .demo-task, .demo-check, .orbit-bubble, .pop-dot';
        document.addEventListener('mouseover', e => {
            if (e.target.closest('#demo-phone, .glass-device')) {
                cursor.classList.add('is-hidden');
                cursor.classList.remove('is-active');
                return;
            }
            if (e.target.closest(interactive)) cursor.classList.add('is-active');
        });
        document.addEventListener('mouseout', e => {
            if (e.target.closest(interactive)) cursor.classList.remove('is-active');
        });
    }

    /* ---------- Interactive mini task list ---------- */
    const list = document.getElementById('demo-list');
    const phone = document.getElementById('demo-phone');
    const dateEl = document.getElementById('demo-date');
    const tomorrowDateEl = document.getElementById('demo-tomorrow-date');

    const now = new Date();
    if (dateEl) {
        dateEl.textContent = now.toLocaleDateString(undefined, { day: 'numeric' });
    }
    if (tomorrowDateEl) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrowDateEl.textContent = tomorrow.toLocaleDateString(undefined, { day: 'numeric' });
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

    function moveTaskWithFlip(task, reorderFn) {
        const parent = task?.parentElement;
        if (!parent) {
            reorderFn?.();
            return;
        }

        const children = Array.from(parent.children);
        children.forEach(el => {
            el.style.transform = '';
            el.style.transition = '';
        });

        const firstRects = new Map();
        children.forEach(el => {
            firstRects.set(el, el.getBoundingClientRect());
        });

        reorderFn?.();

        const newChildren = Array.from(parent.children);
        let hasMovement = false;
        newChildren.forEach(el => {
            const first = firstRects.get(el);
            if (!first) return;
            const last = el.getBoundingClientRect();
            const dy = first.top - last.top;
            if (Math.abs(dy) > 0.5) {
                hasMovement = true;
                el.style.transform = `translateY(${dy}px)`;
                el.style.transition = 'none';
            }
        });

        if (!hasMovement) return;

        requestAnimationFrame(() => {
            void parent.offsetHeight;
            newChildren.forEach(el => {
                if (el.style.transform) {
                    el.style.transition = 'transform 0.38s var(--spring)';
                    el.style.transform = '';
                }
            });

            setTimeout(() => {
                newChildren.forEach(el => {
                    if (el.style.transition) el.style.transition = '';
                });
            }, 400);
        });
    }

    function completeTask(task) {
        if (!task || task.classList.contains('done')) return;
        task.classList.add('completing');
        task.classList.add('done');
        const check = task.querySelector('.demo-check');
        check?.classList.add('checked');
        if (check) {
            const currentLabel = check.getAttribute('aria-label') || '';
            check.setAttribute('aria-label', currentLabel.replace(/^Complete/, 'Mark incomplete'));
        }

        spawnPop(task);
        const r = task.getBoundingClientRect();
        spawnParticleBurst(r.right - 16, r.top + r.height / 2, 12);

        const parent = task.parentElement;
        if (!parent) return;

        const siblings = Array.from(parent.children);
        if (siblings[siblings.length - 1] === task) {
            setTimeout(() => {
                task.classList.remove('completing');
            }, 280);
            return;
        }

        setTimeout(() => {
            task.classList.remove('completing');
            if (!task.isConnected || !task.classList.contains('done')) return;
            moveTaskWithFlip(task, () => {
                parent.appendChild(task);
            });
        }, 280);
    }

    function uncompleteTask(task) {
        if (!task || !task.classList.contains('done')) return;
        task.classList.remove('done');
        task.classList.remove('completing');
        const check = task.querySelector('.demo-check');
        check?.classList.remove('checked');
        if (check) {
            const currentLabel = check.getAttribute('aria-label') || '';
            check.setAttribute('aria-label', currentLabel.replace(/^Mark incomplete/, 'Complete'));
        }

        const parent = task.parentElement;
        if (!parent) return;

        const firstDone = parent.querySelector('.demo-task.done');
        if (firstDone && firstDone !== task) {
            setTimeout(() => {
                if (!task.isConnected || task.classList.contains('done')) return;
                moveTaskWithFlip(task, () => {
                    parent.insertBefore(task, firstDone);
                });
            }, 120);
        }
    }

    list?.addEventListener('click', (e) => {
        const check = e.target.closest('.demo-check');
        if (!check) return;
        const task = check.closest('.demo-task');
        if (!task) return;
        if (task.classList.contains('done')) {
            uncompleteTask(task);
        } else {
            completeTask(task);
        }
    });

    // Pointer swipe (one set of listeners)
    let swipe = null;
    list?.addEventListener('pointerdown', (e) => {
        const task = e.target.closest('.demo-task');
        if (!task || e.target.closest('.demo-check')) return;
        if (task.classList.contains('done')) return;
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
        task.classList.remove('swiping');
        task.style.transform = '';
        if (dx > 88) {
            completeTask(task);
        }
        swipe = null;
    };
    list?.addEventListener('pointerup', endSwipe);
    list?.addEventListener('pointercancel', endSwipe);

    function addTask(text) {
        const val = (text || '').trim();
        if (!val || !list) return;

        const li = document.createElement('li');
        li.className = 'demo-task added';
        li.innerHTML = `
            <button class="demo-check" aria-label="Complete ${val.replace(/"/g, '')}"></button>
            <span class="demo-text"></span>
        `;
        li.querySelector('.demo-text').textContent = val;

        const firstDone = list.querySelector('.demo-task.done');
        if (firstDone) {
            list.insertBefore(li, firstDone);
        } else {
            list.appendChild(li);
        }
    }

    document.querySelectorAll('.orbit-bubble').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('used')) return;
            btn.classList.add('used');
            addTask(btn.dataset.task);
        });
    });

    /* ---------- Logo dance easter egg ---------- */
    const logo = document.getElementById('logo-link');
    let logoClicks = 0;
    logo?.addEventListener('click', (e) => {
        if (logo.getAttribute('href') === '#') e.preventDefault();
        logoClicks += 1;
        if (logoClicks >= 5) {
            logo.classList.add('dance');
            const r = logo.getBoundingClientRect();
            spawnParticleBurst(r.left + r.width / 2, r.top + r.height / 2, 24);
            setTimeout(() => logo.classList.remove('dance'), 2800);
            logoClicks = 0;
        }
    });

    document.querySelectorAll('.no-list li:not(.no-really)').forEach(li => {
        li.addEventListener('click', () => {
            if (li.classList.contains('popped')) return;
            li.classList.add('popped');
            const r = li.getBoundingClientRect();
            spawnParticleBurst(r.left + r.width / 2, r.top + r.height / 2, 10);
        });
    });

    // Reset other buttons in the list when "Just you, dotting it down" is clicked
    document.querySelector('.no-really')?.addEventListener('click', () => {
        document.querySelectorAll('.no-list li.popped').forEach(li => {
            li.classList.remove('popped');
        });
    });

    /* ---------- Footer pop-dots ---------- */
    document.querySelectorAll('.pop-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            dot.classList.toggle('popped');
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

    /* ---------- Scroll reveals ---------- */
    const revealTargets = document.querySelectorAll(
        '.section-title, .section-sub, .day-card, .say-card, .no-list li, .price-card, .founder-note, .founder-stats, .download-buttons, .constellation-divider'
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

    /* ---------- Count-up stat (months since launch) ---------- */
    const crashStatEl = document.getElementById('crash-free-months');
    if (crashStatEl) {
        const startStr = crashStatEl.getAttribute('data-start-date') || '2026-03-10';
        const [sYear, sMonth, sDay] = startStr.split('-').map(Number);
        const startDate = new Date(sYear, sMonth - 1, sDay);

        function calculateMonths() {
            const now = new Date();
            if (now < startDate) return 0;

            let months = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
            if (now.getDate() < startDate.getDate()) {
                const daysElapsed = (now - startDate) / (1000 * 60 * 60 * 24);
                if (daysElapsed < months * 30) {
                    months--;
                }
            }
            return Math.max(0, months);
        }

        const targetMonths = calculateMonths();

        let animated = false;
        function runCountUp() {
            if (animated) return;
            animated = true;

            if (reduceMotion || targetMonths === 0) {
                crashStatEl.textContent = `${targetMonths}mo`;
                return;
            }

            const duration = Math.min(1200, Math.max(600, targetMonths * 120));
            const startTime = performance.now();

            function frame(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(1, elapsed / duration);
                const eased = 1 - Math.pow(1 - progress, 3);
                const currentVal = Math.round(eased * targetMonths);

                crashStatEl.textContent = `${currentVal}mo`;

                if (progress < 1) {
                    requestAnimationFrame(frame);
                } else {
                    crashStatEl.textContent = `${targetMonths}mo`;
                }
            }

            requestAnimationFrame(frame);
        }

        if ('IntersectionObserver' in window) {
            const statObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    runCountUp();
                    statObserver.unobserve(entry.target);
                });
            }, { threshold: 0.2 });
            statObserver.observe(crashStatEl);
        } else {
            runCountUp();
        }
    }

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
});
