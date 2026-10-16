/**
 * Sanchari World — Option 2 Application Logic
 * Modern Boutique Luxury & Split Tour Engine
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // 1. BUSINESS CONFIGURATION
    const BUSINESS_EMAIL = 'hello@sanchariworld.com';
    const WHATSAPP_NUMBER = '919876543210';
    const DEFAULT_WA_MSG = 'Hello Sanchari World! I would like to enquire about your custom tours and seater vehicle rentals.';

    // Helper utilities
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

    // 2. TOAST POPUP NOTIFICATION
    const toastEl = $('#studioToast');
    let toastTimer = null;

    function showToast(message, duration = 3800) {
        if (!toastEl) return;
        toastEl.textContent = message;
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toastEl.classList.remove('show');
        }, duration);
    }

    // 3. AUTO-UPDATE YEAR
    const yearEl = $('#studioYear');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // 4. RESTRICT DATE PICKERS TO TODAY ONWARDS
    const today = new Date();
    const minDateStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);

    ['#engineDate', '#engineTourDate', '#clientDate', '#mDate'].forEach(sel => {
        const input = $(sel);
        if (input) input.min = minDateStr;
    });

    // 5. STICKY HEADER & SCROLL SHADOW
    const header = $('#siteHeader');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }
    }, { passive: true });

    // Active Navigation Spy (IntersectionObserver)
    const navAnchors = $$('.nav-item');
    const sections = $$('main section[id]');
    if ('IntersectionObserver' in window && sections.length > 0) {
        const spyObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navAnchors.forEach(link => {
                        const href = link.getAttribute('href');
                        link.classList.toggle('active', href === `#${id}`);
                    });
                }
            });
        }, { rootMargin: '-25% 0px -55% 0px' });

        sections.forEach(s => spyObserver.observe(s));
    }

    // 6. MOBILE MENU DRAWER TOGGLE
    const mobileTrigger = $('#mobileMenuTrigger');
    const navMenu = $('#navMenu');

    function closeMobileNav() {
        if (navMenu && navMenu.classList.contains('open')) {
            navMenu.classList.remove('open');
            mobileTrigger?.classList.remove('active');
            mobileTrigger?.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    }

    function toggleMobileNav() {
        if (!navMenu) return;
        const isOpen = navMenu.classList.toggle('open');
        mobileTrigger?.classList.toggle('active', isOpen);
        mobileTrigger?.setAttribute('aria-expanded', String(isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    if (mobileTrigger && navMenu) {
        mobileTrigger.addEventListener('click', toggleMobileNav);

        $$('a', navMenu).forEach(link => {
            link.addEventListener('click', closeMobileNav);
        });

        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('open') &&
                !navMenu.contains(e.target) &&
                !mobileTrigger.contains(e.target)) {
                closeMobileNav();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMobileNav();
        });
    }

    // 7. HERO VIDEO & INTERACTIVE SWITCHER
    const heroVid = $('#splitHeroVideo');
    const dockBtns = $$('.dock-btn');

    if (heroVid) {
        heroVid.muted = true;
        heroVid.defaultMuted = true;
        heroVid.playsInline = true;

        const attemptPlay = () => {
            const prom = heroVid.play();
            if (prom && prom.catch) prom.catch(() => {});
        };

        attemptPlay();

        ['click', 'touchstart', 'scroll'].forEach(evt => {
            window.addEventListener(evt, () => {
                if (heroVid.paused) attemptPlay();
            }, { once: true, passive: true });
        });

        // Switch between Mountain and Coastal videos
        dockBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                dockBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const newSrc = btn.dataset.src;
                if (!newSrc) return;

                heroVid.pause();
                heroVid.src = newSrc;
                heroVid.load();
                heroVid.play().catch(() => {});

                showToast(`Switched view to ${btn.textContent.trim()}`);
            });
        });
    }

    // 8. DUAL ENGINE BOOKING TABS (SEATER vs CUSTOM TOUR)
    const tabSeater = $('#tabSeaterEngine');
    const tabTour = $('#tabTourEngine');
    const seaterForm = $('#seaterEngineForm');
    const tourForm = $('#tourEngineForm');

    tabSeater?.addEventListener('click', () => {
        tabSeater.classList.add('active');
        tabSeater.setAttribute('aria-selected', 'true');
        tabTour?.classList.remove('active');
        tabTour?.setAttribute('aria-selected', 'false');

        seaterForm?.classList.add('active');
        tourForm?.classList.remove('active');
    });

    tabTour?.addEventListener('click', () => {
        tabTour.classList.add('active');
        tabTour.setAttribute('aria-selected', 'true');
        tabSeater?.classList.remove('active');
        tabSeater?.setAttribute('aria-selected', 'false');

        tourForm?.classList.add('active');
        seaterForm?.classList.remove('active');
    });

    // Seater Tab submit -> Pre-fills enquiry form
    if (seaterForm) {
        seaterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = new FormData(seaterForm);
            const seater = data.get('seaterType') || 'Seater Vehicle';
            const pickup = data.get('pickupCity') || '';
            const drop = data.get('destination') || '';
            const date = data.get('date') || '';

            const serviceSelect = $('#clientService');
            const routeInput = $('#clientRoute');
            const dateInput = $('#clientDate');
            const notesInput = $('#clientNotes');

            if (serviceSelect) {
                for (let opt of serviceSelect.options) {
                    if (opt.value.toLowerCase().includes(seater.toLowerCase().split(' ')[0])) {
                        opt.selected = true;
                        break;
                    }
                }
            }
            if (routeInput) routeInput.value = `${pickup} to ${drop}`;
            if (dateInput) dateInput.value = date;
            if (notesInput) {
                notesInput.value = `Seater Requirement: ${seater}\nRoute: ${pickup} to ${drop}\nTravel Date: ${date}`;
            }

            $('#contact')?.scrollIntoView({ behavior: 'smooth' });
            $('#clientName')?.focus();

            showToast(`Selected ${seater}. Complete your details below for an instant quote!`);
        });
    }

    // Custom Tour Tab submit -> Pre-fills enquiry form
    if (tourForm) {
        tourForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = new FormData(tourForm);
            const dest = data.get('destination') || '';
            const duration = data.get('duration') || '';
            const pax = data.get('passengers') || '';
            const date = data.get('date') || '';

            const serviceSelect = $('#clientService');
            const routeInput = $('#clientRoute');
            const dateInput = $('#clientDate');
            const notesInput = $('#clientNotes');

            if (serviceSelect) serviceSelect.value = 'Custom Tour Planning';
            if (routeInput) routeInput.value = dest;
            if (dateInput) dateInput.value = date;
            if (notesInput) {
                notesInput.value = `Custom Tour Plan:\nDestination: ${dest}\nDuration: ${duration}\nTravellers: ${pax}\nStart Date: ${date}`;
            }

            $('#contact')?.scrollIntoView({ behavior: 'smooth' });
            $('#clientName')?.focus();

            showToast(`Custom tour to ${dest} pre-filled. Complete your details below!`);
        });
    }

    // 9. SEATERS CATEGORY FILTER
    const filterBtns = $$('.filter-btn');
    const vehicleCards = $$('.luxury-vehicle-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter || 'all';

            vehicleCards.forEach(card => {
                const category = card.dataset.category || '';
                if (filter === 'all' || category === filter) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // 10. UNIVERSAL BOOKING MODAL
    const modal = $('#studioBookingModal');
    const modalTitle = $('#modalStudioTitle');
    const modalSubtitle = $('#modalStudioSubtitle');
    const modalItemHolder = $('#modalItemHolder');
    const modalTypeHolder = $('#modalTypeHolder');
    const modalClose = $('#studioModalClose');
    const modalCancel = $('#studioModalCancel');
    const modalForm = $('#studioModalForm');

    function openModal(item, type) {
        if (!modal) return;
        if (modalTitle) modalTitle.textContent = `Book ${item}`;
        if (modalSubtitle) modalSubtitle.textContent = `Provide your details for ${type}. We will confirm availability and share quote.`;
        if (modalItemHolder) modalItemHolder.value = item;
        if (modalTypeHolder) modalTypeHolder.value = type;

        if (typeof modal.showModal === 'function') {
            modal.showModal();
        } else {
            $('#contact')?.scrollIntoView({ behavior: 'smooth' });
            const route = $('#clientRoute');
            if (route) route.value = item;
        }
    }

    function closeModal() {
        if (modal && typeof modal.close === 'function' && modal.open) {
            modal.close();
        }
    }

    $$('.open-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.dataset.item || 'Service Booking';
            const type = btn.dataset.type || 'Custom Service';
            openModal(item, type);
        });
    });

    modalClose?.addEventListener('click', closeModal);
    modalCancel?.addEventListener('click', closeModal);

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Modal Form Submission -> Opens WhatsApp with prefilled message
    modalForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = $('#mName')?.value || '';
        const phone = $('#mPhone')?.value || '';
        const date = $('#mDate')?.value || '';
        const route = $('#mRoute')?.value || '';
        const item = modalItemHolder?.value || 'Requested Service';

        closeModal();
        modalForm.reset();

        showToast(`Thank you ${name}! Opening WhatsApp with your enquiry for ${item}...`);

        const waText = encodeURIComponent(
            `*New Booking Request (Option 2) — Sanchari World*\n\n` +
            `• *Service/Vehicle*: ${item}\n` +
            `• *Name*: ${name}\n` +
            `• *Phone*: ${phone}\n` +
            `• *Travel Date*: ${date}\n` +
            `• *Route*: ${route}\n\n` +
            `Please confirm availability and share tariff.`
        );

        setTimeout(() => {
            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`, '_blank');
        }, 500);
    });

    // 11. DYNAMIC WHATSAPP LINKS
    const waBaseUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_WA_MSG)}`;

    ['#announcementWa', '#customBannerWa', '#contactDirectWa', '#floatingWaPill'].forEach(sel => {
        const el = $(sel);
        if (el) {
            el.setAttribute('href', waBaseUrl);
            el.setAttribute('target', '_blank');
            el.setAttribute('rel', 'noopener noreferrer');
        }
    });

    // Vehicle WhatsApp Quote buttons
    $$('.v-wa-btn').forEach(btn => {
        const vName = btn.dataset.vehicle || 'Seater Vehicle';
        const msg = encodeURIComponent(`Hello Sanchari World! Please share the per-km tariff and availability for ${vName}.`);
        btn.setAttribute('href', `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`);
        btn.setAttribute('target', '_blank');
        btn.setAttribute('rel', 'noopener noreferrer');
    });

    // 12. MAIN ENQUIRY FORM SUBMISSION
    const mainForm = $('#studioEnquiryForm');
    const formHelp = $('#studioFormHelp');

    if (mainForm) {
        mainForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = new FormData(mainForm);
            const name = data.get('name') || '';
            const phone = data.get('phone') || '';
            const email = data.get('email') || 'Not provided';
            const service = data.get('service') || '';
            const route = data.get('destination') || '';
            const date = data.get('date') || '';
            const notes = data.get('notes') || 'No special preferences';

            const subject = encodeURIComponent(`Sanchari World Enquiry — ${service} (${route})`);
            const body = encodeURIComponent(
                `SANCHARI WORLD TRIP ENQUIRY (OPTION 2)\n` +
                `=====================================\n\n` +
                `Name: ${name}\n` +
                `Phone/WhatsApp: ${phone}\n` +
                `Email: ${email}\n` +
                `Service Needed: ${service}\n` +
                `Route / Destination: ${route}\n` +
                `Travel Date: ${date}\n\n` +
                `Special Notes:\n${notes}\n`
            );

            if (formHelp) {
                formHelp.textContent = 'Enquiry draft ready. Opening your mail client...';
                formHelp.style.color = 'var(--primary)';
            }

            showToast('Trip enquiry submitted! Opening your email app...');

            window.location.href = `mailto:${BUSINESS_EMAIL}?subject=${subject}&body=${body}`;

            mainForm.reset();
        });
    }

    // 13. FOOTER NEWSLETTER
    const newsletterForm = $('#studioNewsletter');
    const newsletterStatus = $('#studioNewsletterStatus');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = $('input[type="email"]', newsletterForm);
            const email = emailInput?.value?.trim();

            if (email) {
                try {
                    const subs = JSON.parse(localStorage.getItem('sanchari_subscribers_opt2') || '[]');
                    if (!subs.includes(email)) {
                        subs.push(email);
                        localStorage.setItem('sanchari_subscribers_opt2', JSON.stringify(subs));
                    }
                } catch (err) {}

                if (newsletterStatus) {
                    newsletterStatus.textContent = '✦ Subscribed! Thank you for joining Sanchari World.';
                    newsletterStatus.style.color = '#34D399';
                }

                showToast('Thank you for subscribing to Sanchari World updates!');
                newsletterForm.reset();
            }
        });
    }

    console.log('Sanchari World (Option 2 — Boutique Luxury) initialized.');
});
