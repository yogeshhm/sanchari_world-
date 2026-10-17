/**
 * SANCHARI WORLD — OPTION 2: 3D WEBGL INTERACTIVE LOGIC
 * Features:
 *  - Three.js Interactive 3D Globe with South India tour routes & animated light arcs
 *  - Real-time 3D Card Perspective Tilt Engine with dynamic specular glare
 *  - Interactive 3D Tour & Cost Estimator with live WhatsApp booking link generator
 *  - Dual Engine Search Console (Seater Booking vs Custom Tour Planning)
 *  - Embedded Video Portal with live Route Switcher (Mountain vs Coast)
 *  - Universal HUD Booking Dialog Modal & WhatsApp integration
 *  - Mobile Drawer Navigation & Sticky Header elevation
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // 1. BUSINESS CONFIGURATION
    const BUSINESS_EMAIL = 'hello@sanchariworld.com';
    const WHATSAPP_NUMBER = '919876543210';
    const DEFAULT_WA_MSG = 'Hello Sanchari World! I would like to enquire about your custom tours and seater vehicle fleet.';

    // Helper utilities
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

    // 2. HUD TOAST NOTIFICATION SYSTEM
    const toastEl = $('#hudToast');
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
    const yearEl = $('#currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // 4. RESTRICT DATE PICKERS TO TODAY ONWARDS
    const today = new Date();
    const minDateStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);

    ['#seaterDateInput', '#tourDateInput', '#uDate', '#mDate'].forEach(sel => {
        const input = $(sel);
        if (input) input.min = minDateStr;
    });

    // 5. STICKY HUD HEADER & ACTIVE SCROLL SPY
    const header = $('#hudHeader');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }
    }, { passive: true });

    // Active Navigation Link Spy via IntersectionObserver
    const navAnchors = $$('.hud-nav-item');
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

    // 6. MOBILE NAVIGATION DRAWER
    const burgerTrigger = $('#hudBurger');
    const navMenu = $('#hudNav');

    function closeNav() {
        if (navMenu && navMenu.classList.contains('open')) {
            navMenu.classList.remove('open');
            burgerTrigger?.classList.remove('active');
            burgerTrigger?.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    }

    function toggleNav() {
        if (!navMenu) return;
        const isOpen = navMenu.classList.toggle('open');
        burgerTrigger?.classList.toggle('active', isOpen);
        burgerTrigger?.setAttribute('aria-expanded', String(isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    if (burgerTrigger && navMenu) {
        burgerTrigger.addEventListener('click', toggleNav);

        $$('a', navMenu).forEach(link => {
            link.addEventListener('click', closeNav);
        });

        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('open') &&
                !navMenu.contains(e.target) &&
                !burgerTrigger.contains(e.target)) {
                closeNav();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeNav();
        });
    }

    // =========================================================================
    // 7. THREE.JS 3D WEBGL INTERACTIVE GLOBE & TOUR ROUTE GRAPH
    // =========================================================================
    const canvas = document.getElementById('webglCanvas');
    const container = document.getElementById('webglCanvasContainer');

    if (canvas && container && typeof THREE !== 'undefined') {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.z = 12.5;

        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const globeGroup = new THREE.Group();
        scene.add(globeGroup);

        const GLOBE_RADIUS = 4.2;

        // Base 3D Sphere Wireframe
        const wireGeo = new THREE.IcosahedronGeometry(GLOBE_RADIUS, 18);
        const wireMat = new THREE.MeshBasicMaterial({
            color: 0x00f5a0,
            wireframe: true,
            transparent: true,
            opacity: 0.14
        });
        const wireSphere = new THREE.Mesh(wireGeo, wireMat);
        globeGroup.add(wireSphere);

        // Core Dark Sphere (gives depth)
        const coreGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 0.985, 32, 32);
        const coreMat = new THREE.MeshBasicMaterial({
            color: 0x06080d,
            transparent: true,
            opacity: 0.88
        });
        const coreSphere = new THREE.Mesh(coreGeo, coreMat);
        globeGroup.add(coreSphere);

        // Atmospheric Neon Outer Ring
        const ringGeo = new THREE.RingGeometry(GLOBE_RADIUS * 1.08, GLOBE_RADIUS * 1.18, 64);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x00f5a0,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.18
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2.3;
        globeGroup.add(ringMesh);

        // Coordinate projection helper
        function latLonToVector3(lat, lon, radius) {
            const phi = (90 - lat) * (Math.PI / 180);
            const theta = (lon + 180) * (Math.PI / 180);
            const x = -(radius * Math.sin(phi) * Math.cos(theta));
            const z = (radius * Math.sin(phi) * Math.sin(theta));
            const y = (radius * Math.cos(phi));
            return new THREE.Vector3(x, y, z);
        }

        // South India Tour Hub & Destinations
        const HUB = { name: 'Bengaluru (HQ)', lat: 12.97, lon: 77.59 };
        const DESTINATIONS = [
            { name: 'Coorg & Chikmagalur', lat: 12.33, lon: 75.80, dist: '260 km', time: '5.5 hrs', vehicle: 'Innova / Sedan' },
            { name: 'Wayanad & Ooty', lat: 11.68, lon: 76.13, dist: '280 km', time: '6 hrs', vehicle: 'Innova Crysta' },
            { name: 'Hampi & Badami', lat: 15.33, lon: 76.46, dist: '340 km', time: '6.5 hrs', vehicle: 'Tempo / Sedan' },
            { name: 'Gokarna Coast', lat: 14.54, lon: 74.31, dist: '490 km', time: '9 hrs', vehicle: 'Innova / Tempo' },
            { name: 'Mysuru Heritage', lat: 12.29, lon: 76.63, dist: '150 km', time: '3 hrs', vehicle: 'Sedan / SUV' }
        ];

        const hubVec = latLonToVector3(HUB.lat, HUB.lon, GLOBE_RADIUS);

        // Hub Marker (Bengaluru)
        const hubMarkerGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const hubMarkerMat = new THREE.MeshBasicMaterial({ color: 0xffb800 });
        const hubMarker = new THREE.Mesh(hubMarkerGeo, hubMarkerMat);
        hubMarker.position.copy(hubVec);
        globeGroup.add(hubMarker);

        // Destination Markers & 3D Bézier Arcs
        const arcPulses = [];

        DESTINATIONS.forEach((dest, index) => {
            const destVec = latLonToVector3(dest.lat, dest.lon, GLOBE_RADIUS);

            // Dest Pin
            const pinGeo = new THREE.SphereGeometry(0.08, 12, 12);
            const pinMat = new THREE.MeshBasicMaterial({ color: 0x00f5a0 });
            const pinMesh = new THREE.Mesh(pinGeo, pinMat);
            pinMesh.position.copy(destVec);
            globeGroup.add(pinMesh);

            // 3D Quadratic Bézier Curve for Tour Arc
            const midVec = new THREE.Vector3().addVectors(hubVec, destVec).multiplyScalar(0.5);
            midVec.normalize().multiplyScalar(GLOBE_RADIUS * (1.28 + index * 0.04));

            const curve = new THREE.QuadraticBezierCurve3(hubVec, midVec, destVec);
            const curvePoints = curve.getPoints(40);
            const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
            const curveMat = new THREE.LineBasicMaterial({
                color: index % 2 === 0 ? 0x00f5a0 : 0x00d2ff,
                transparent: true,
                opacity: 0.6
            });
            const arcLine = new THREE.Line(curveGeo, curveMat);
            globeGroup.add(arcLine);

            // Light pulse traveling along arc
            const pulseGeo = new THREE.SphereGeometry(0.05, 8, 8);
            const pulseMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
            globeGroup.add(pulseMesh);

            arcPulses.push({
                curve: curve,
                mesh: pulseMesh,
                progress: (index * 0.2) % 1
            });
        });

        // 1,200 Floating Ambient Star Dust Particles
        const starGeo = new THREE.BufferGeometry();
        const starCount = 1200;
        const starPositions = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount * 3; i += 3) {
            starPositions[i] = (Math.random() - 0.5) * 35;
            starPositions[i + 1] = (Math.random() - 0.5) * 35;
            starPositions[i + 2] = (Math.random() - 0.5) * 35;
        }

        starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        const starMat = new THREE.PointsMaterial({
            size: 0.045,
            color: 0x00f5a0,
            transparent: true,
            opacity: 0.4
        });
        const starField = new THREE.Points(starGeo, starMat);
        scene.add(starField);

        // Center globe view towards South India
        globeGroup.rotation.y = -1.95;
        globeGroup.rotation.x = 0.35;

        // Interactive Drag-to-Rotate Controls
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        let targetRotationX = 0.35;
        let targetRotationY = -1.95;

        container.addEventListener('pointerdown', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener('pointermove', (e) => {
            if (!isDragging) {
                // Subtle cursor parallax
                const rect = container.getBoundingClientRect();
                const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
                const mouseY = (e.clientY - rect.top) / rect.height - 0.5;
                camera.position.x = mouseX * 0.8;
                camera.position.y = -mouseY * 0.8;
                camera.lookAt(scene.position);
                return;
            }

            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;

            targetRotationY += deltaX * 0.005;
            targetRotationX += deltaY * 0.005;
            targetRotationX = Math.max(-1.2, Math.min(1.2, targetRotationX));

            previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener('pointerup', () => { isDragging = false; });
        window.addEventListener('pointercancel', () => { isDragging = false; });

        // HUD Active Route Card Rotation
        let activeRouteIdx = 0;
        const hudTitle = $('#hudRouteTitle');
        const hudDist = $('#hudRouteDist');
        const hudTime = $('#hudRouteTime');
        const hudVehicle = $('#hudRouteVehicle');

        setInterval(() => {
            activeRouteIdx = (activeRouteIdx + 1) % DESTINATIONS.length;
            const cur = DESTINATIONS[activeRouteIdx];
            if (hudTitle) hudTitle.textContent = `Bengaluru ➔ ${cur.name}`;
            if (hudDist) hudDist.textContent = cur.dist;
            if (hudTime) hudTime.textContent = cur.time;
            if (hudVehicle) hudVehicle.textContent = cur.vehicle;
        }, 4200);

        // Animation Loop
        let clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();

            // Smooth interpolation of rotation
            globeGroup.rotation.y += (targetRotationY - globeGroup.rotation.y) * 0.08;
            globeGroup.rotation.x += (targetRotationX - globeGroup.rotation.x) * 0.08;

            if (!isDragging) {
                targetRotationY += 0.0018; // Gentle autonomous rotation
            }

            // Animate travelling light pulses along arcs
            arcPulses.forEach(pulse => {
                pulse.progress = (pulse.progress + delta * 0.45) % 1;
                const pt = pulse.curve.getPoint(pulse.progress);
                pulse.mesh.position.copy(pt);
            });

            // Ambient star field slow rotation
            starField.rotation.y += 0.0003;

            renderer.render(scene, camera);
        }

        animate();

        // Responsive resize
        window.addEventListener('resize', () => {
            if (!container) return;
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        });
    }

    // =========================================================================
    // 8. 3D CARD PERSPECTIVE TILT & DYNAMIC GLARE
    // =========================================================================
    const tiltCards = $$('.tilt-card');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -9; // Max 9 deg
            const rotateY = ((x - centerX) / centerX) * 9;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

            // Position specular glare
            const glare = card.querySelector('.blueprint-card-glare, .seater-card-glare, .pkg-card-glare');
            if (glare) {
                const glareX = (x / rect.width) * 100;
                const glareY = (y / rect.height) * 100;
                glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.22) 0%, transparent 60%)`;
            }
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });

    // =========================================================================
    // 9. INTERACTIVE 3D TOUR & COST ESTIMATOR
    // =========================================================================
    let currentDest = { name: 'Coorg & Chikmagalur', km: 550 };
    let currentVehicle = { name: '4-Seater Sedan', rate: 12 };

    const destPills = $$('#estDestOptions .est-pill');
    const vehiclePills = $$('#estVehicleOptions .est-pill');

    const outRoute = $('#calcRouteName');
    const outDist = $('#calcDistance');
    const outVehicle = $('#calcVehicle');
    const outCost = $('#calcEstimatedCost');
    const estWaBtn = $('#estBookWaBtn');

    function updateEstimator() {
        const estTotal = currentDest.km * currentVehicle.rate;
        if (outRoute) outRoute.textContent = currentDest.name;
        if (outDist) outDist.textContent = `${currentDest.km} km (Round Trip)`;
        if (outVehicle) outVehicle.textContent = currentVehicle.name;
        if (outCost) outCost.textContent = `₹${estTotal.toLocaleString('en-IN')}*`;

        // Update WhatsApp Booking CTA
        const waText = encodeURIComponent(
            `*Custom Tour Enquiry (3D Estimator)*\n\n` +
            `• *Destination*: ${currentDest.name}\n` +
            `• *Estimated Distance*: ${currentDest.km} km\n` +
            `• *Selected Vehicle*: ${currentVehicle.name}\n` +
            `• *Estimated Tariff*: ₹${estTotal.toLocaleString('en-IN')}\n\n` +
            `Please share the detailed itinerary and confirm chauffeur availability.`
        );

        if (estWaBtn) {
            estWaBtn.onclick = () => {
                window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`, '_blank');
            };
        }
    }

    destPills.forEach(pill => {
        pill.addEventListener('click', () => {
            destPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentDest.name = pill.dataset.dest;
            currentDest.km = parseInt(pill.dataset.km, 10);
            updateEstimator();
        });
    });

    vehiclePills.forEach(pill => {
        pill.addEventListener('click', () => {
            vehiclePills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentVehicle.name = pill.dataset.vehicle;
            currentVehicle.rate = parseInt(pill.dataset.rate, 10);
            updateEstimator();
        });
    });

    updateEstimator();

    // =========================================================================
    // 10. DUAL ENGINE BOOKING CONSOLE (HERO TABS)
    // =========================================================================
    const tabSeater = $('#tabSeater');
    const tabTour = $('#tabTour');
    const seaterPane = $('#seaterPane');
    const tourPane = $('#tourPane');

    tabSeater?.addEventListener('click', () => {
        tabSeater.classList.add('active');
        tabSeater.setAttribute('aria-selected', 'true');
        tabTour?.classList.remove('active');
        tabTour?.setAttribute('aria-selected', 'false');

        seaterPane?.classList.add('active');
        tourPane?.classList.remove('active');
    });

    tabTour?.addEventListener('click', () => {
        tabTour.classList.add('active');
        tabTour.setAttribute('aria-selected', 'true');
        tabSeater?.classList.remove('active');
        tabSeater?.setAttribute('aria-selected', 'false');

        tourPane?.classList.add('active');
        seaterPane?.classList.remove('active');
    });

    // Seater Form Submission
    seaterPane?.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = new FormData(seaterPane);
        const seater = data.get('seaterType') || 'Seater Vehicle';
        const pickup = data.get('pickupCity') || '';
        const drop = data.get('destination') || '';
        const date = data.get('date') || '';

        const sSelect = $('#uService');
        const rInput = $('#uRoute');
        const dInput = $('#uDate');
        const nInput = $('#uNotes');

        if (sSelect) {
            for (let opt of sSelect.options) {
                if (opt.value.toLowerCase().includes(seater.toLowerCase().split(' ')[0])) {
                    opt.selected = true;
                    break;
                }
            }
        }
        if (rInput) rInput.value = `${pickup} to ${drop}`;
        if (dInput) dInput.value = date;
        if (nInput) {
            nInput.value = `Seater Booking Request:\nVehicle: ${seater}\nRoute: ${pickup} to ${drop}\nTravel Date: ${date}`;
        }

        $('#contact')?.scrollIntoView({ behavior: 'smooth' });
        $('#uName')?.focus();

        showToast(`Selected ${seater}. Please fill your contact details below to get instant quote!`);
    });

    // Tour Form Submission
    tourPane?.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = new FormData(tourPane);
        const dest = data.get('destination') || '';
        const duration = data.get('duration') || '';
        const pax = data.get('passengers') || '';
        const date = data.get('date') || '';

        const sSelect = $('#uService');
        const rInput = $('#uRoute');
        const dInput = $('#uDate');
        const nInput = $('#uNotes');

        if (sSelect) sSelect.value = 'Custom Tour Planning';
        if (rInput) rInput.value = dest;
        if (dInput) dInput.value = date;
        if (nInput) {
            nInput.value = `Custom Tour Request:\nDestination: ${dest}\nDuration: ${duration}\nTravellers: ${pax}\nStart Date: ${date}`;
        }

        $('#contact')?.scrollIntoView({ behavior: 'smooth' });
        $('#uName')?.focus();

        showToast(`Custom tour to ${dest} pre-filled. Please complete your details below!`);
    });

    // =========================================================================
    // 11. EMBEDDED CINEMATIC VIDEO PORTAL SWITCHER
    // =========================================================================
    const portalVid = $('#portalVideo');
    const portalBtns = $$('.portal-btn');

    if (portalVid) {
        portalVid.muted = true;
        portalVid.defaultMuted = true;
        portalVid.playsInline = true;

        const tryPlay = () => {
            const p = portalVid.play();
            if (p && p.catch) p.catch(() => {});
        };

        tryPlay();

        ['click', 'touchstart', 'scroll'].forEach(evt => {
            window.addEventListener(evt, () => {
                if (portalVid.paused) tryPlay();
            }, { once: true, passive: true });
        });

        portalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                portalBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const newSrc = btn.dataset.src;
                if (!newSrc) return;

                portalVid.pause();
                portalVid.src = newSrc;
                portalVid.load();
                portalVid.play().catch(() => {});

                showToast(`Switched view to ${btn.textContent.trim()}`);
            });
        });
    }

    // =========================================================================
    // 12. SEATERS CATEGORY FILTER DOCK
    // =========================================================================
    const fleetFilterBtns = $$('.fleet-filter-btn');
    const seaterCards = $$('.seater-3d-card');

    fleetFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            fleetFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter || 'all';

            seaterCards.forEach(card => {
                const cat = card.dataset.category || '';
                if (filter === 'all' || cat === filter) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // =========================================================================
    // 13. UNIVERSAL BOOKING MODAL
    // =========================================================================
    const modal = $('#hudModal');
    const modalTitle = $('#modalTitle');
    const modalSubtitle = $('#modalSubtitle');
    const modalItem = $('#modalItem');
    const modalType = $('#modalType');
    const modalClose = $('#hudModalClose');
    const modalCancel = $('#hudModalCancel');
    const modalForm = $('#hudModalForm');

    function openModal(item, type) {
        if (!modal) return;
        if (modalTitle) modalTitle.textContent = `Book ${item}`;
        if (modalSubtitle) modalSubtitle.textContent = `Provide your contact details and preferred travel date for ${type}.`;
        if (modalItem) modalItem.value = item;
        if (modalType) modalType.value = type;

        if (typeof modal.showModal === 'function') {
            modal.showModal();
        } else {
            $('#contact')?.scrollIntoView({ behavior: 'smooth' });
            const r = $('#uRoute');
            if (r) r.value = item;
        }
    }

    function closeModal() {
        if (modal && typeof modal.close === 'function' && modal.open) {
            modal.close();
        }
    }

    $$('.trigger-modal-btn').forEach(btn => {
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

    // Modal Form Submit -> Open WhatsApp with formatted booking enquiry
    modalForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = $('#mName')?.value || '';
        const phone = $('#mPhone')?.value || '';
        const date = $('#mDate')?.value || '';
        const route = $('#mRoute')?.value || '';
        const item = modalItem?.value || 'Selected Service';

        closeModal();
        modalForm.reset();

        showToast(`Thank you ${name}! Opening WhatsApp with your enquiry for ${item}...`);

        const waText = encodeURIComponent(
            `*New Booking Request (3D WebGL Studio)*\n\n` +
            `• *Service/Vehicle*: ${item}\n` +
            `• *Name*: ${name}\n` +
            `• *Phone*: ${phone}\n` +
            `• *Travel Date*: ${date}\n` +
            `• *Route*: ${route}\n\n` +
            `Please share the rate card and confirmation.`
        );

        setTimeout(() => {
            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`, '_blank');
        }, 500);
    });

    // =========================================================================
    // 14. DYNAMIC WHATSAPP & DIRECT ACTIONS
    // =========================================================================
    const generalWaUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_WA_MSG)}`;

    ['#tickerWaLink', '#customTourWaBtn', '#directWaChat', '#hudFloatingWa'].forEach(sel => {
        const el = $(sel);
        if (el) {
            el.setAttribute('href', generalWaUrl);
            el.setAttribute('target', '_blank');
            el.setAttribute('rel', 'noopener noreferrer');
        }
    });

    // Seater Card WhatsApp buttons
    $$('.seater-wa-btn').forEach(btn => {
        const v = btn.dataset.vehicle || 'Seater Vehicle';
        const msg = encodeURIComponent(`Hello Sanchari World! Please share the per-km tariff and availability for ${v}.`);
        btn.setAttribute('href', `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`);
        btn.setAttribute('target', '_blank');
        btn.setAttribute('rel', 'noopener noreferrer');
    });

    // =========================================================================
    // 15. MAIN TRIP ENQUIRY FORM (EMAIL CLIENT LAUNCH)
    // =========================================================================
    const enquiryForm = $('#hudEnquiryForm');
    const formNote = $('#formHudNote');

    if (enquiryForm) {
        enquiryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = new FormData(enquiryForm);
            const name = data.get('name') || '';
            const phone = data.get('phone') || '';
            const email = data.get('email') || 'Not provided';
            const service = data.get('service') || '';
            const route = data.get('destination') || '';
            const date = data.get('date') || '';
            const notes = data.get('notes') || 'No special preferences';

            const subject = encodeURIComponent(`Sanchari World Trip Enquiry — ${service} (${route})`);
            const body = encodeURIComponent(
                `SANCHARI WORLD TRIP ENQUIRY (3D WEBGL STUDIO)\n` +
                `===========================================\n\n` +
                `Name: ${name}\n` +
                `Phone/WhatsApp: ${phone}\n` +
                `Email: ${email}\n` +
                `Service Needed: ${service}\n` +
                `Route / Destination: ${route}\n` +
                `Travel Date: ${date}\n\n` +
                `Special Notes:\n${notes}\n`
            );

            if (formNote) {
                formNote.textContent = 'Enquiry draft ready. Opening your mail client...';
                formNote.style.color = 'var(--neon-emerald)';
            }

            showToast('Trip enquiry submitted! Opening your email app...');

            window.location.href = `mailto:${BUSINESS_EMAIL}?subject=${subject}&body=${body}`;

            enquiryForm.reset();
        });
    }

    // =========================================================================
    // 16. NEWSLETTER SUBSCRIPTION
    // =========================================================================
    const newsForm = $('#hudNewsletter');
    const newsStatus = $('#newsletterStatus');

    if (newsForm) {
        newsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = $('input[type="email"]', newsForm)?.value?.trim();

            if (email) {
                try {
                    const subs = JSON.parse(localStorage.getItem('sanchari_subscribers_3d') || '[]');
                    if (!subs.includes(email)) {
                        subs.push(email);
                        localStorage.setItem('sanchari_subscribers_3d', JSON.stringify(subs));
                    }
                } catch (err) {}

                if (newsStatus) {
                    newsStatus.textContent = '✦ Subscribed! Thank you for joining Sanchari World.';
                    newsStatus.style.color = 'var(--neon-emerald)';
                }

                showToast('Thank you for subscribing to Sanchari World updates!');
                newsForm.reset();
            }
        });
    }

    console.log('Sanchari World (Option 2 — 3D WebGL Studio Edition) Initialized.');
});
