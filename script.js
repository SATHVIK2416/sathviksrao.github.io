// LANDONORRIS.COM CLONE JS - OPTIMIZED
document.addEventListener('DOMContentLoaded', () => {

    // 1. MENU TOGGLE (Optimized)
    const menuTrigger = document.querySelector('.menu-trigger');
    const menuOverlay = document.querySelector('.menu-overlay');
    const menuLinks = document.querySelectorAll('.menu-link');
    const hamburger = document.querySelector('.hamburger');

    let isMenuOpen = false;

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        menuOverlay.classList.toggle('active', isMenuOpen);

        // Animate hamburger
        if (isMenuOpen) {
            hamburger.children[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            hamburger.children[1].style.transform = 'rotate(-45deg) translate(5px, -6px)';
            document.body.style.overflow = 'hidden';
            document.querySelector('.menu-text').textContent = 'CLOSE';
        } else {
            hamburger.children[0].style.transform = 'none';
            hamburger.children[1].style.transform = 'none';
            document.body.style.overflow = '';
            document.querySelector('.menu-text').textContent = 'MENU';
        }
    }

    if (menuTrigger) {
        menuTrigger.addEventListener('click', toggleMenu);
    }

    menuLinks.forEach(link => {
        link.addEventListener('click', toggleMenu);
    });


    // 2. SCROLL REVEAL (IntersectionObserver)
    const revealElements = document.querySelectorAll('.grid-item, .project-card');

    // Use a single observer for all reveal elements
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target); // Once visible, stop observing
            }
        });
    }, {
        threshold: 0.15, // Trigger slightly later for better effect
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));


    // 3. STATS COUNTER ANIMATION
    const stats = document.querySelectorAll('.stat-num');
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const targetVal = parseInt(el.getAttribute('data-val'));
                animateValue(el, 0, targetVal, 1500);
                statsObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => statsObserver.observe(stat));

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease Out Quart - smoother finish
            const ease = 1 - Math.pow(1 - progress, 4);

            obj.innerHTML = Math.floor(progress * (end - start) + start);

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = end < 10 ? `0${end}` : end; // Pad
            }
        };
        window.requestAnimationFrame(step);
    }


    // 4. P5.JS BACKGROUND (Performance Optimized)
    // Runs only when visible and simpler calculations
    (function attachP5Rings() {
        const hostId = 'vanta-bg';
        const host = document.getElementById(hostId);
        if (!host) return;

        let sketchInstance = null;

        function ringsSketch(p) {
            let t = 0;
            p.setup = function () {
                const rect = host.getBoundingClientRect();
                const cnv = p.createCanvas(rect.width, rect.height);
                cnv.parent(hostId);

                // Limit pixel density for perfromance
                const dpr = window.devicePixelRatio || 1;
                p.pixelDensity(Math.min(dpr, 1.5)); // Capped at 1.5x for performance

                p.noFill();
                p.stroke(255);
                p.strokeWeight(1);
            };

            p.windowResized = function () {
                if (!host) return;
                const rect = host.getBoundingClientRect();
                p.resizeCanvas(rect.width, rect.height);
            };

            const ringCache = [];
            let frameCounter = 0;

            p.draw = function () {
                p.clear();
                p.translate(p.width / 2, p.height / 2);

                const rings = 20; // Reduced form 25 -> 20
                const gap = 12.0;
                const baseR = 80;

                t += 0.005;
                frameCounter++;

                // Optim: Recompute noise only every 2nd frame
                const recompute = frameCounter % 2 === 0;

                if (recompute || ringCache.length === 0) {
                    ringCache.length = 0;
                    // Pre-calculate per-ring noise offsets to avoid p5.noise inside vertex loop if possible,
                    // but here we need vertex variation.
                    // Optim: reduced angular resolution (0.1 instead of 0.05) = Half vertices
                    for (let i = 0; i < rings; i++) {
                        const pts = [];
                        const r = baseR + i * gap;
                        const amp = 15;

                        // Optimized Loop: Less vertices
                        for (let a = 0; a < p.TWO_PI; a += 0.1) {
                            // Simplified noise
                            const n = p.noise(Math.cos(a) + t, Math.sin(a) + t, i * 0.1);
                            const disp = (n - 0.5) * amp * (i * 0.15 + 1);
                            const rr = r + disp;

                            pts.push([rr * Math.cos(a), rr * Math.sin(a)]);
                        }
                        ringCache.push({ pts, i });
                    }
                }

                // Draw from cache
                for (let i = 0; i < ringCache.length; i++) {
                    const { pts, i: idx } = ringCache[i];
                    const alpha = p.map(idx, 0, rings, 200, 0); // slightly reduced max alpha
                    p.stroke(255, 255, 255, alpha * 0.5);

                    p.beginShape();
                    for (let k = 0; k < pts.length; k++) {
                        const pt = pts[k];
                        p.vertex(pt[0], pt[1]);
                    }
                    p.endShape(p.CLOSE);
                }
            };
        }

        // Only initialize if intersection observer sees it (lazy load p5)
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!sketchInstance) sketchInstance = new p5(ringsSketch);
                } else {
                    // Optional: remove sketch when out of view to save battery
                    // if (sketchInstance) { sketchInstance.remove(); sketchInstance = null; }
                }
            });
        });
        observer.observe(host);
    })();

});
