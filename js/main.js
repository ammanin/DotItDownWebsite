document.addEventListener('DOMContentLoaded', () => {
    // Loading screen logic
    const loadingScreen = document.getElementById('loading-screen');
    const body = document.body;

    function hideLoadingScreen() {
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            body.classList.remove('loading');
            // Remove from DOM after transition
            setTimeout(() => {
                loadingScreen.remove();
            }, 500);
        }
    }

    // Hide loading screen when everything is loaded
    window.addEventListener('load', hideLoadingScreen);

    // Fallback: hide loading screen after 5 seconds if load event hasn't fired
    setTimeout(hideLoadingScreen, 5000);

    // Contact modal: open/close and form submit
    const contactTrigger = document.getElementById('contact-trigger');
    const contactModal = document.getElementById('contact-modal');
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('contact-form-status');
    const modalCloseBtn = contactModal?.querySelector('.modal-close');

    function openContactModal() {
        if (!contactModal) return;
        contactModal.classList.add('is-open');
        contactModal.setAttribute('aria-hidden', 'false');
        contactModal.setAttribute('aria-modal', 'true');
        document.body.style.overflow = 'hidden';
        contactModal.querySelector('input, select, textarea')?.focus();
    }

    function closeContactModal() {
        if (!contactModal) return;
        contactModal.classList.remove('is-open');
        contactModal.setAttribute('aria-hidden', 'true');
        contactModal.setAttribute('aria-modal', 'false');
        document.body.style.overflow = '';
    }

    if (contactTrigger) {
        contactTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            openContactModal();
        });
    }

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
                    formStatus.textContent = 'Thanks! Your message has been sent.';
                    formStatus.classList.add('success');
                    contactForm.reset();
                    setTimeout(closeContactModal, 1500);
                } else {
                    formStatus.textContent = data.error || 'Something went wrong. Please try again.';
                    formStatus.classList.add('error');
                }
            } catch (err) {
                formStatus.textContent = 'Network error. Please try again.';
                formStatus.classList.add('error');
            }
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send';
            }
        });
    }

    // Sticky nav: fix to top-right when scrolled past header
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');
    function setNavStuckPosition() {
        if (!nav || !nav.classList.contains('nav-is-stuck')) return;
        const container = document.querySelector('.container');
        if (!container) return;
        const cr = container.getBoundingClientRect();
        const nr = nav.getBoundingClientRect();
        nav.style.setProperty('--nav-stuck-left', (cr.right - nr.width - 32) + 'px'); /* 32px = 2rem */
    }
    if (header && nav) {
        const observer = new IntersectionObserver(
            ([e]) => {
                const stuck = !e.isIntersecting;
                if (stuck) {
                    const left = nav.getBoundingClientRect().left;
                    nav.classList.add('nav-is-stuck');
                    nav.style.setProperty('--nav-stuck-left', left + 'px');
                } else {
                    nav.classList.remove('nav-is-stuck');
                    nav.style.removeProperty('--nav-stuck-left');
                }
            },
            { threshold: 0, rootMargin: '-1px 0px 0px 0px' }
        );
        observer.observe(header);
        window.addEventListener('resize', setNavStuckPosition);
    }

    // Smooth scrolling for nav links
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth'
                });

                // Update active state
                document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // Simple FAQ toggle (if needed, though wireframe shows them as list)
    const faqItems = document.querySelectorAll('.faq-question');
    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            const answer = item.nextElementSibling;
            if (answer && answer.classList.contains('faq-answer')) {
                const isVisible = answer.style.display === 'block';
                answer.style.display = isVisible ? 'none' : 'block';
            }
        });
    });

    // Feature navigation: switch and play video when a feature is expanded
    const defaultVideoSrc = 'assets/did_on0.mp4';
    const featureVideo = document.querySelector('.feature-video');
    const featureExpandables = document.querySelectorAll('.feature-item-expandable');
    if (featureVideo && featureVideo.src) {
        featureVideo.play().catch(() => {});
    }
    featureExpandables.forEach(item => {
        const navItem = item.querySelector('.feature-nav-item');
        navItem.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            featureExpandables.forEach(f => {
                f.classList.remove('active');
                const inlineV = f.querySelector('.feature-video-inline');
                if (inlineV) {
                    inlineV.pause();
                    inlineV.removeAttribute('src');
                }
            });
            if (!isActive) {
                item.classList.add('active');
                if (window.matchMedia('(max-width: 768px)').matches) {
                    item.scrollIntoView({ behavior: 'auto', block: 'start' });
                }
            }
            if (!featureVideo) return;
            const videoSrc = item.getAttribute('data-video');
            if (videoSrc && !isActive) {
                featureVideo.src = videoSrc;
                featureVideo.play().catch(() => {});
                const inlineVideo = item.querySelector('.feature-video-inline');
                if (inlineVideo) {
                    inlineVideo.src = videoSrc;
                    inlineVideo.play().catch(() => {});
                }
            } else {
                featureVideo.src = defaultVideoSrc;
                featureVideo.play().catch(() => {});
            }
        });
    });

    // Set first feature as active by default
    /*if (featureExpandables.length > 0) {
        featureExpandables[0].classList.add('active');
    }*/

    // Quotes Slider Logic
    const slides = document.querySelectorAll('.quote-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.quote-nav.prev');
    const nextBtn = document.querySelector('.quote-nav.next');
    let currentSlide = 0;

    function showSlide(index) {
        if (slides.length === 0) return;
        
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Handle wrapping
        if (index >= slides.length) currentSlide = 0;
        else if (index < 0) currentSlide = slides.length - 1;
        else currentSlide = index;

        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
        nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });

    // Auto-advance every 8 seconds
    setInterval(() => {
        showSlide(currentSlide + 1);
    }, 8000);
});
