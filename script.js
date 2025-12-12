// Smooth animations
document.addEventListener('DOMContentLoaded', function() {
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('animate');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with data-animate
    document.querySelectorAll('[data-animate]').forEach(el => {
        observer.observe(el);
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Button interactions
    document.querySelectorAll('.cta-button').forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.02)';
        });
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Enable perf mode on slower devices
function enablePerfModeIfLowFPS() {
    let frames = 0;
    let start = performance.now();
    let rafId = null;
    function loop(now) {
        frames++;
        if (now - start < 1000) {
            rafId = requestAnimationFrame(loop);
        } else {
            const fps = frames / ((now - start) / 1000);
            if (fps < 45) {
                window.__LOW_PERF__ = true;
                document.documentElement.classList.add('perf');
            }
            if (rafId) cancelAnimationFrame(rafId);
        }
    }
    rafId = requestAnimationFrame(loop);
}
window.addEventListener('load', enablePerfModeIfLowFPS, { once: true });

// Preloader fade-in
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// p5 Concentric Wavy Rings in hero background
(function attachP5Rings(){
    const hostId = 'vanta-bg';
    let sketchInstance = null;

    function ringsSketch(p) {
        let t = 0;
        p.setup = function() {
            const host = document.getElementById(hostId);
            const rect = host.getBoundingClientRect();
            const cnv = p.createCanvas(rect.width, rect.height);
            cnv.parent(hostId);
            const perf = document.documentElement.classList.contains('perf');
            const dpr = perf ? 1 : Math.min(window.devicePixelRatio || 1, 2);
            p.pixelDensity(dpr);
            p.noFill();
            p.stroke(255);
            p.strokeWeight(1);
        };
        p.windowResized = function() {
            const host = document.getElementById(hostId);
            if (!host) return;
            const rect = host.getBoundingClientRect();
            p.resizeCanvas(rect.width, rect.height);
        };
        const ringCache = [];
        let frameCounter = 0;
        p.draw = function() {
            const perf = document.documentElement.classList.contains('perf');
            p.background(0, 0, 0);
            p.translate(p.width/2, p.height/2);

            const prevOuter = 80 + (40 - 1) * 6.0;
            const rings = 25;
            const gap = 8.0;
            const baseR = prevOuter - (rings - 1) * gap;

            const timeSpeed = perf ? 0.12 : 0.22;
            t += 0.01 * timeSpeed;
            frameCounter++;

            const recompute = frameCounter % 2 === 0;
            const step = perf ? 0.03 : 0.024;

            if (recompute) {
                ringCache.length = 0;
                for (let i = 0; i < rings; i++) {
                    const pts = [];
                    const r = baseR + i * gap;
                    const ringPct = i / (rings - 1);
                    const innerBias = 1 - ringPct;
                    const ampBase = (perf ? 2.4 : 3.4) * (0.55 + innerBias * 0.45);
                    const fineAmp = ampBase * 0.3;
                    const phase = i * 0.35;
                    for (let a = 0; a < p.TWO_PI + step; a += step) {
                        const wave1 = Math.sin(a * 3.0 + t * 0.5 + phase) * ampBase * 0.55;
                        const wave2 = Math.sin(a * 6.0 - t * 0.3 + phase * 0.65) * ampBase * 0.22;
                        const wave3 = Math.sin(a * 12.0 + t * 0.7 + phase * 0.25) * fineAmp * 0.3;
                        const n = p.noise(
                            0.42 * Math.cos(a) + 10 + i * 0.1,
                            0.42 * Math.sin(a) + 20 + t * 0.25,
                            i * 0.07 + t * 0.5
                        );
                        const noiseDisp = (n - 0.5) * ampBase * 0.65;
                        const wobble = (wave1 + wave2 + wave3 + noiseDisp) * (0.5 + innerBias * 0.5);
                        const rr = r + wobble;
                        pts.push([rr * Math.cos(a), rr * Math.sin(a)]);
                    }
                    ringCache.push({ pts, ringPct });
                }
            }

            for (let i = 0; i < ringCache.length; i++) {
                const { pts, ringPct } = ringCache[i];
                const alpha = 200 - ringPct * 110;
                p.stroke(255, alpha);
                p.beginShape();
                for (let k = 0; k < pts.length; k++) {
                    const pt = pts[k];
                    p.vertex(pt[0], pt[1]);
                }
                p.endShape(p.CLOSE);
            }
        };
    }

    function mount() {
        if (sketchInstance) return;
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const host = document.getElementById(hostId);
        if (!host) return;
        sketchInstance = new p5(ringsSketch);
        requestAnimationFrame(() => requestAnimationFrame(() => {
            const canvas = host.querySelector('canvas');
            if (canvas) canvas.style.setProperty('opacity', '0.35', 'important');
        }));
    }
    function unmount() {
        const host = document.getElementById(hostId);
        if (host) {
            const canvas = host.querySelector('canvas');
            if (canvas) canvas.style.setProperty('opacity', '0', 'important');
        }
        setTimeout(() => {
            if (sketchInstance && typeof sketchInstance.remove === 'function') {
                sketchInstance.remove();
            }
            sketchInstance = null;
        }, 320);
    }

    // Observe hero visibility
    document.addEventListener('DOMContentLoaded', () => {
        const homeSection = document.getElementById('home');
        if (!('IntersectionObserver' in window) || !homeSection) { mount(); return; }
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) mount();
                else {
                    const rect = e.boundingClientRect;
                    const vh = window.innerHeight || document.documentElement.clientHeight;
                    const fullyOut = rect.bottom <= 0 || rect.top >= vh;
                    if (fullyOut) unmount();
                }
            });
        }, { threshold: [0, 0.01] });
        obs.observe(homeSection);
    });

    window.addEventListener('beforeunload', unmount);
})();
