/**
 * Sanchari World — Main Application Logic (Option 2 Redesign)
 * Features:
 *  - Mobile glassmorphic drawer toggle & keyboard accessibility
 *  - Hero background video autoplay resilience & dynamic video switcher
 *  - Dual search booking engine tabs (Seater Booking vs Custom Tour Planning)
 *  - Dynamic Seater Fleet category filtering (4-seater, 6/7-seater, Tempo, Bus)
 *  - Universal booking dialog modal with prefilled data
 *  - Direct WhatsApp links & Mailto trip enquiry generator
 *  - Newsletter local subscription storage
 *  - Sticky header elevation on scroll & active link Spy (IntersectionObserver)
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // 1. CONSTANTS & CONFIGURATION
    const BUSINESS_EMAIL = 'hello@sanchariworld.com';
    const WHATSAPP_NUMBER = '919876543210'; // Replace with verified business WhatsApp
    const DEFAULT_WA_MESSAGE = 'Hello Sanchari World! I would like to enquire about your custom tours and seater vehicle services.';

    // Helper shorthand functions
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

    // 2. TOAST POPUP NOTIFICATION SYSTEM
    const toastEl = $('#toastPopup');
    let toastTimeout = null;

    function showToast(message, duration = 3800) {
        if (!toastEl) return;
        toastEl.textContent = message;
        toastEl.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toastEl.classList.remove('show');
        }, duration);
    }

    // 3. AUTO-UPDATE YEAR
    const yearEl = $('#currentYear');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // 4. RESTRICT DATE PICKERS TO TODAY ONWARDS
    const today = new Date();
    const localDateStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);

    const dateInputs = ['#rentalDate', '#tourStartDate', '#formTravelDate', '#modalDate'];
    dateInputs.forEach(selector => {
        const input = $(selector);
        if (input) {
            input.min = localDateStr;
        }
    });

    // 5. STICKY HEADER & ACTIVE SCROLL SPY
    const header = $('#topHeader');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }
    }, { passive: true });

    // Active Navigation Link Spy via IntersectionObserver
    const navAnchors = $$('#navLinks .nav-link');
    const sections = $$('main section[id]');
    if ('IntersectionObserver' in window && sections.length > 0) {
        const navObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const currentId = entry.target.id;
                    navAnchors.forEach(link => {
                        const href = link.getAttribute('href');
                        link.classList.toggle('active', href === `#${currentId}`);
                    });
                }
            });
        }, { rootMargin: '-30% 0px -50% 0px' });

        sections.forEach(sec => navObserver.observe(sec));
    }

    // 6. MOBILE NAVIGATION TOGGLE
    const menuToggle = $('#menuToggle');
    const navLinks = $('#navLinks');

    function closeMobileNav() {
        if (navLinks && navLinks.classList.contains('open')) {
            navLinks.classList.remove('open');
            menuToggle?.classList.remove('active');
            menuToggle?.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    }

    function toggleMobileNav() {
        if (!navLinks) return;
        const isOpen = navLinks.classList.toggle('open');
        menuToggle?.classList.toggle('active', isOpen);
        menuToggle?.setAttribute('aria-expanded', String(isOpen));
        // Prevent background scrolling when menu open on mobile
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', toggleMobileNav);

        // Close on navigation click
        $$('a', navLinks).forEach(link => {
            link.addEventListener('click', closeMobileNav);
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('open') &&
                !navLinks.contains(e.target) &&
                !menuToggle.contains(e.target)) {
                closeMobileNav();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeMobileNav();
            }
        });
    }

    // 7. HERO VIDEO & INTERACTIVE SWITCHER
    const heroVideo = $('#heroBgVideo');
    const switcherBtns = $$('#videoSwitcher .switcher-btn');

    if (heroVideo) {
        heroVideo.muted = true;
        heroVideo.defaultMuted = true;
        heroVideo.playsInline = true;

        const attemptPlay = () => {
            const playPromise = heroVideo.play();
            if (playPromise && playPromise.catch) {
                playPromise.catch(() => {
                    // Autoplay prevented by browser power saver or permission
                });
            }
        };

        attemptPlay();

        // Browser gesture fallback for autoplay resilience
        ['click', 'touchstart', 'scroll'].forEach(event => {
            window.addEventListener(event, () => {
                if (heroVideo.paused) attemptPlay();
            }, { once: true, passive: true });
        });

        // Video switcher controls
        switcherBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                switcherBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const newSrc = btn.dataset.src;
                if (!newSrc) return;

                heroVideo.pause();
                heroVideo.src = newSrc;
                heroVideo.load();
                heroVideo.play().catch(() => {});

                showToast(`Switched view to ${btn.textContent.trim()}`);
            });
        });
    }

    // 8. DUAL SEARCH ENGINE TABS (BOOK SEATER vs PLAN CUSTOM TOUR)
    const tabSeater = $('#tabSeater');
    const tabTour = $('#tabTour');
    const seaterPane = $('#seaterPane');
    const tourPane = $('#tourPane');

    function switchSearchTab(targetTab) {
        if (targetTab === 'seater') {
            tabSeater?.classList.add('active');
            tabSeater?.setAttribute('aria-selected', 'true');
            tabTour?.classList.remove('active');
            tabTour?.setAttribute('aria-selected', 'false');

            seaterPane?.classList.add('active');
            tourPane?.classList.remove('active');
        } else {
            tabTour?.classList.add('active');
            tabTour?.setAttribute('aria-selected', 'true');
            tabSeater?.classList.remove('active');
            tabSeater?.setAttribute('aria-selected', 'false');

            tourPane?.classList.add('active');
            seaterPane?.classList.remove('active');
        }
    }

    tabSeater?.addEventListener('click', () => switchSearchTab('seater'));
    tabTour?.addEventListener('click', () => switchSearchTab('tour'));

    // Tab 1 Form Handler: Seater Search -> Forward to enquiry
    if (seaterPane) {
        seaterPane.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(seaterPane);
            const seater = formData.get('seaterType') || 'Seater Vehicle';
            const pickup = formData.get('pickupCity') || '';
            const drop = formData.get('destination') || '';
            const date = formData.get('date') || '';

            // Prefill main enquiry form
            const categoryInput = $('#serviceCategory');
            const routeInput = $('#tripRoute');
            const dateInput = $('#formTravelDate');
            const notesInput = $('#userNotes');

            if (categoryInput) {
                // Find matching option or set closest
                for (let opt of categoryInput.options) {
                    if (opt.value.toLowerCase().includes(seater.toLowerCase().split(' ')[0])) {
                        opt.selected = true;
                        break;
                    }
                }
            }
            if (routeInput) routeInput.value = `${pickup} to ${drop}`;
            if (dateInput) dateInput.value = date;
            if (notesInput) notesInput.value = `Vehicle Requested: ${seater}\nRoute: ${pickup} to ${drop}\nDate: ${date}`;

            // Smooth scroll to contact section
            const contactSection = $('#contact');
            contactSection?.scrollIntoView({ behavior: 'smooth' });
            $('#userName')?.focus();

            showToast(`Selected ${seater} for ${pickup} to ${drop}. Fill details below to get instant quote!`);
        });
    }

    // Tab 2 Form Handler: Custom Tour Search -> Forward to enquiry
    if (tourPane) {
        tourPane.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(tourPane);
            const destination = formData.get('destination') || '';
            const duration = formData.get('duration') || '';
            const pax = formData.get('passengers') || '';
            const date = formData.get('date') || '';

            // Prefill main enquiry form
            const categoryInput = $('#serviceCategory');
            const routeInput = $('#tripRoute');
            const dateInput = $('#formTravelDate');
            const notesInput = $('#userNotes');

            if (categoryInput) categoryInput.value = 'Custom Tour Planning';
            if (routeInput) routeInput.value = destination;
            if (dateInput) dateInput.value = date;
            if (notesInput) {
                notesInput.value = `Custom Tour Request:\nDestination: ${destination}\nDuration: ${duration}\nTravellers: ${pax}\nStart Date: ${date}`;
            }

            const contactSection = $('#contact');
            contactSection?.scrollIntoView({ behavior: 'smooth' });
            $('#userName')?.focus();

            showToast(`Custom tour to ${destination} pre-filled. Complete your contact details below!`);
        });
    }

    // 9. SEATER FLEET FILTER PILLS
    const fleetPills = $$('.fleet-pill');
    const seaterCards = $$('.seater-card');

    fleetPills.forEach(pill => {
        pill.addEventListener('click', () => {
            fleetPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            const filter = pill.dataset.filter || 'all';

            seaterCards.forEach(card => {
                const category = card.dataset.category || '';
                if (filter === 'all' || category === filter) {
                    card.classList.remove('hidden');
                    card.style.display = '';
                } else {
                    card.classList.add('hidden');
                    card.style.display = 'none';
                }
            });
        });
    });

    // 10. UNIVERSAL BOOKING MODAL
    const bookingModal = $('#bookingModal');
    const modalTitle = $('#modalTitle');
    const modalSubtitle = $('#modalSubtitle');
    const modalSelectedItem = $('#modalSelectedItem');
    const modalServiceType = $('#modalServiceType');
    const closeModalBtn = $('#closeModalBtn');
    const cancelModalBtn = $('#cancelModalBtn');
    const modalForm = $('#modalForm');

    function openBookingModal(itemName, itemType) {
        if (!bookingModal) return;

        if (modalTitle) modalTitle.textContent = `Book ${itemName}`;
        if (modalSubtitle) modalSubtitle.textContent = `Provide your contact and travel date for ${itemType}. Our concierge will confirm availability.`;
        if (modalSelectedItem) modalSelectedItem.value = itemName;
        if (modalServiceType) modalServiceType.value = itemType;

        if (typeof bookingModal.showModal === 'function') {
            bookingModal.showModal();
        } else {
            // Fallback for older browsers without dialog support
            const contactSection = $('#contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
                const tripRoute = $('#tripRoute');
                if (tripRoute) tripRoute.value = itemName;
            }
        }
    }

    function closeBookingModal() {
        if (bookingModal && typeof bookingModal.close === 'function' && bookingModal.open) {
            bookingModal.close();
        }
    }

    // Attach click listeners to all open-booking buttons
    $$('.open-booking').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.dataset.item || 'Service Booking';
            const type = btn.dataset.type || 'Custom Service';
            openBookingModal(item, type);
        });
    });

    closeModalBtn?.addEventListener('click', closeBookingModal);
    cancelModalBtn?.addEventListener('click', closeBookingModal);

    // Close when clicking modal backdrop
    bookingModal?.addEventListener('click', (e) => {
        if (e.target === bookingModal) {
            closeBookingModal();
        }
    });

    // Modal Form Submission
    modalForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = $('#modalName')?.value || '';
        const phone = $('#modalPhone')?.value || '';
        const date = $('#modalDate')?.value || '';
        const route = $('#modalRoute')?.value || '';
        const item = modalSelectedItem?.value || 'Selected Service';

        closeBookingModal();
        modalForm.reset();

        showToast(`Thank you ${name}! Booking request for ${item} received. Opening WhatsApp...`);

        // Construct pre-filled WhatsApp message
        const waText = encodeURIComponent(
            `*New Booking Request — Sanchari World*\n\n` +
            `• *Service/Vehicle*: ${item}\n` +
            `• *Name*: ${name}\n` +
            `• *Phone*: ${phone}\n` +
            `• *Date*: ${date}\n` +
            `• *Pickup & Route*: ${route}\n\n` +
            `Please share the rate card and confirmation.`
        );

        setTimeout(() => {
            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`, '_blank');
        }, 600);
    });

    // 11. DYNAMIC WHATSAPP LINKS
    const customWaBtn = $('#customWhatsappBtn');
    const directWaLink = $('#whatsappDirectLink');
    const floatingWaBtn = $('#whatsappFloatingBtn');

    const generalWaUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_WA_MESSAGE)}`;

    [customWaBtn, directWaLink, floatingWaBtn].forEach(el => {
        if (el) {
            el.setAttribute('href', generalWaUrl);
            el.setAttribute('target', '_blank');
            el.setAttribute('rel', 'noopener noreferrer');
        }
    });

    // 12. MAIN ENQUIRY FORM SUBMISSION
    const enquiryForm = $('#enquiryForm');
    const formStatusNote = $('#formStatusNote');

    if (enquiryForm) {
        enquiryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(enquiryForm);
            const name = formData.get('name') || '';
            const phone = formData.get('phone') || '';
            const email = formData.get('email') || 'Not provided';
            const service = formData.get('service') || '';
            const route = formData.get('destination') || '';
            const date = formData.get('date') || '';
            const notes = formData.get('notes') || 'No special preferences';

            const subject = encodeURIComponent(`Sanchari World Trip Enquiry — ${service} (${route})`);
            const body = encodeURIComponent(
                `SANCHARI WORLD TRIP ENQUIRY\n` +
                `============================\n\n` +
                `Full Name: ${name}\n` +
                `Mobile/WhatsApp: ${phone}\n` +
                `Email: ${email}\n` +
                `Service Needed: ${service}\n` +
                `Destination / Route: ${route}\n` +
                `Travel Date: ${date}\n\n` +
                `Special Requests / Notes:\n${notes}\n\n` +
                `Submitted from sanchariworld.com`
            );

            if (formStatusNote) {
                formStatusNote.textContent = 'Enquiry draft prepared. Opening your mail client...';
                formStatusNote.style.color = 'var(--primary-gold)';
            }

            showToast('Trip enquiry submitted! Opening your email app...');

            // Open mail draft
            window.location.href = `mailto:${BUSINESS_EMAIL}?subject=${subject}&body=${body}`;

            enquiryForm.reset();
        });
    }

    // 13. FOOTER NEWSLETTER SUBSCRIPTION
    const newsletterForm = $('#footerNewsletter');
    const newsletterMsg = $('#newsletterMsg');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = $('input[type="email"]', newsletterForm);
            const email = emailInput?.value?.trim();

            if (email) {
                try {
                    const subs = JSON.parse(localStorage.getItem('sanchari_subscribers') || '[]');
                    if (!subs.includes(email)) {
                        subs.push(email);
                        localStorage.setItem('sanchari_subscribers', JSON.stringify(subs));
                    }
                } catch (err) {
                    // Ignore storage quota or disabled storage
                }

                if (newsletterMsg) {
                    newsletterMsg.textContent = '✦ Subscribed! Thank you for joining Sanchari World.';
                    newsletterMsg.style.color = 'var(--accent-emerald)';
                }

                showToast('Subscribed! You will receive our seasonal travel recommendations.');
                newsletterForm.reset();
            }
        });
    }

    // 14. LOG INITIALIZATION SUCCESS
    console.log('Sanchari World (Option 2) initialized successfully.');
});
