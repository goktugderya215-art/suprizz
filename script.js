        document.addEventListener('DOMContentLoaded', () => {

            const triggerOverlay = document.getElementById('triggerOverlay');
            const startButton = document.getElementById('startButton');
            const loadingBar = document.getElementById('loadingBar');
            const statusText = document.getElementById('statusText');
            const ambientLight = document.getElementById('ambientLight');
            const ambientLight2 = document.getElementById('ambientLight2');
            const spotlightWarm = document.getElementById('spotlightWarm');
            const roseWrapper = document.getElementById('roseWrapper');
            const roseHead = document.getElementById('roseHead');
            const calyx = document.getElementById('calyx');
            const stem = document.getElementById('stem');
            const leafLeft = document.getElementById('leafLeft');
            const leafRight = document.getElementById('leafRight');
            const endText = document.getElementById('endText');
            const fallingPetalsEl = document.getElementById('fallingPetals');
            const dustParticlesEl = document.getElementById('dustParticles');
            const sparklesEl = document.getElementById('sparkles');
            const bokehCanvas = document.getElementById('bokehCanvas');
            const groundReflection = document.getElementById('groundReflection');

            const PETAL_LAYERS = [
                { count: 4, w: 24, h: 46, curl: 78, delayBase: 0, tz: 2, cls: 'petal-bud' },
                { count: 5, w: 34, h: 58, curl: 65, delayBase: 0.3, tz: 9, cls: 'petal-core' },
                { count: 6, w: 46, h: 72, curl: 48, delayBase: 0.65, tz: 18, cls: 'petal-inner' },
                { count: 7, w: 58, h: 88, curl: 22, delayBase: 1.05, tz: 30, cls: 'petal-mid-inner' },
                { count: 8, w: 72, h: 104, curl: -5, delayBase: 1.50, tz: 44, cls: 'petal-mid' },
                { count: 9, w: 86, h: 118, curl: -25, delayBase: 2.00, tz: 60, cls: 'petal-outer' },
                { count: 10, w: 98, h: 130, curl: -48, delayBase: 2.55, tz: 76, cls: 'petal-blush' },
            ];

            const SEPALS_COUNT = 5;

            const FALLING_PETAL_COLORS = [
                ['#a40020', '#3d0008'],
                ['#8c001a', '#2b0005'],
                ['#b80025', '#480008'],
                ['#cc002c', '#52000c'],
                ['#960019', '#350005'],
            ];

            let fallingPetalInterval = null;

            /* === Bokeh Background === */
            function initBokeh() {
                const ctx = bokehCanvas.getContext('2d');
                let w, h;
                const bokehDots = [];
                const BOKEH_COUNT = 35;

                function resize() {
                    w = bokehCanvas.width = window.innerWidth;
                    h = bokehCanvas.height = window.innerHeight;
                }
                resize();
                window.addEventListener('resize', resize);

                for (let i = 0; i < BOKEH_COUNT; i++) {
                    bokehDots.push({
                        x: Math.random() * w,
                        y: Math.random() * h,
                        r: Math.max(1, 2 + Math.random() * 18),
                        dx: (Math.random() - 0.5) * 0.15,
                        dy: (Math.random() - 0.5) * 0.12,
                        opacity: 0.01 + Math.random() * 0.04,
                        hue: Math.random() > 0.7 ? (340 + Math.random() * 30) : (350 + Math.random() * 20),
                        pulse: Math.random() * Math.PI * 2,
                        pulseSpeed: 0.003 + Math.random() * 0.008,
                    });
                }

                function drawBokeh() {
                    ctx.clearRect(0, 0, w, h);
                    bokehDots.forEach(d => {
                        d.x += d.dx;
                        d.y += d.dy;
                        d.pulse += d.pulseSpeed;

                        if (d.x < -d.r) d.x = w + d.r;
                        if (d.x > w + d.r) d.x = -d.r;
                        if (d.y < -d.r) d.y = h + d.r;
                        if (d.y > h + d.r) d.y = -d.r;

                        const pulseOp = d.opacity * (0.6 + 0.4 * Math.sin(d.pulse));
                        const r = Math.max(1, d.r);

                        const grad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, r);
                        grad.addColorStop(0, `hsla(${d.hue}, 80%, 60%, ${pulseOp})`);
                        grad.addColorStop(0.5, `hsla(${d.hue}, 70%, 45%, ${pulseOp * 0.4})`);
                        grad.addColorStop(1, `hsla(${d.hue}, 60%, 30%, 0)`);

                        ctx.beginPath();
                        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
                        ctx.fillStyle = grad;
                        ctx.fill();
                    });
                    requestAnimationFrame(drawBokeh);
                }
                drawBokeh();
            }

            /* === Dust Particles === */
            function createDustParticles() {
                const count = 25;
                for (let i = 0; i < count; i++) {
                    const dust = document.createElement('div');
                    dust.className = 'dust-particle';

                    const size = 1 + Math.random() * 2.5;
                    const x = Math.random() * 100;
                    const y = 20 + Math.random() * 70;
                    const dur = 10 + Math.random() * 15;
                    const fadeDelay = Math.random() * 3;
                    const opacity = 0.15 + Math.random() * 0.35;

                    dust.style.left = `${x}vw`;
                    dust.style.top = `${y}vh`;
                    dust.style.setProperty('--dust-size', `${size}px`);
                    dust.style.setProperty('--dust-opacity', opacity);
                    dust.style.setProperty('--dust-dur', `${dur}s`);
                    dust.style.setProperty('--dust-delay', `${Math.random() * dur}s`);
                    dust.style.setProperty('--dust-fade', `${fadeDelay}s`);
                    dust.style.setProperty('--dx1', `${(Math.random() - 0.5) * 30}px`);
                    dust.style.setProperty('--dy1', `${-15 - Math.random() * 30}px`);
                    dust.style.setProperty('--dx2', `${(Math.random() - 0.5) * 25}px`);
                    dust.style.setProperty('--dy2', `${-30 - Math.random() * 30}px`);
                    dust.style.setProperty('--dx3', `${(Math.random() - 0.5) * 35}px`);
                    dust.style.setProperty('--dy3', `${-10 - Math.random() * 20}px`);

                    dustParticlesEl.appendChild(dust);

                    setTimeout(() => dust.classList.add('visible'), 100);
                }
            }

            /* === Sparkles around rose === */
            function createSparkles() {
                const count = 18;
                for (let i = 0; i < count; i++) {
                    const sp = document.createElement('div');
                    sp.className = 'sparkle';

                    const angle = Math.random() * Math.PI * 2;
                    const dist = 60 + Math.random() * 120;
                    const x = Math.cos(angle) * dist;
                    const y = Math.sin(angle) * dist - 30;

                    sp.style.left = `calc(50% + ${x}px)`;
                    sp.style.bottom = `calc(245px + ${-y}px)`;
                    sp.style.setProperty('--sp-size', `${1.5 + Math.random() * 3}px`);
                    sp.style.setProperty('--sp-dur', `${2.5 + Math.random() * 4}s`);
                    sp.style.setProperty('--sp-delay', `${Math.random() * 5}s`);

                    roseWrapper.appendChild(sp);
                }
            }

            /* === Card Loader === */
            function startCardLoader() {
                const duration = 2800;
                const steps = [
                    { threshold: 15, text: 'Loading Love.css...' },
                    { threshold: 35, text: 'Parsing <3 selectors...' },
                    { threshold: 55, text: 'Growing digital petals...' },
                    { threshold: 72, text: 'Adding velvet textures...' },
                    { threshold: 88, text: 'Optimizing 3D rendering...' },
                    { threshold: 96, text: 'Compiling romance...' },
                    { threshold: 100, text: 'Ready to bloom ♥' }
                ];

                let startTimestamp = null;

                function animateLoader(timestamp) {
                    if (!startTimestamp) startTimestamp = timestamp;
                    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const percent = Math.floor(eased * 100);

                    loadingBar.style.width = `${percent}%`;
                    const activeStep = steps.find(s => percent <= s.threshold) || steps[steps.length - 1];
                    statusText.textContent = activeStep.text;

                    if (progress < 1) {
                        requestAnimationFrame(animateLoader);
                    } else {
                        startButton.removeAttribute('disabled');
                    }
                }

                requestAnimationFrame(animateLoader);
            }

            /* === Create Sepals === */
            function createSepals() {
                const step = 360 / SEPALS_COUNT;
                for (let i = 0; i < SEPALS_COUNT; i++) {
                    const sepal = document.createElement('div');
                    sepal.className = 'sepal';
                    const angle = i * step + (Math.random() - 0.5) * 5;
                    const delay = 0.35 + i * 0.07;
                    const curl = 16 + Math.random() * 10;

                    sepal.style.setProperty('--sepal-angle', `${angle}deg`);
                    sepal.style.setProperty('--sepal-curl', `${curl}deg`);
                    sepal.style.setProperty('--sepal-delay', `${delay}s`);
                    calyx.appendChild(sepal);
                }
            }

            /* === Create Petals === */
            function createPetals() {
                PETAL_LAYERS.forEach((layer, li) => {
                    const angleStep = 360 / layer.count;
                    const layerOffset = li * 22 + (Math.random() - 0.5) * 10;

                    for (let i = 0; i < layer.count; i++) {
                        const petal = document.createElement('div');
                        petal.className = `petal ${layer.cls}`;

                        const angle = layerOffset + i * angleStep + (Math.random() - 0.5) * 6;
                        const delay = layer.delayBase + i * 0.06;
                        const curlJitter = (Math.random() - 0.5) * 7;
                        const scaleJitter = 0.92 + Math.random() * 0.16;
                        const bloomDur = 2.2 + Math.random() * 0.5;

                        petal.style.width = `${layer.w}px`;
                        petal.style.height = `${layer.h}px`;
                        petal.style.setProperty('--angle', `${angle}deg`);
                        petal.style.setProperty('--curl', `${layer.curl + curlJitter}deg`);
                        petal.style.setProperty('--scale', scaleJitter);
                        petal.style.setProperty('--delay', `${delay}s`);
                        petal.style.setProperty('--tz', `${layer.tz}px`);
                        petal.style.setProperty('--bloom-dur', `${bloomDur}s`);

                        roseHead.appendChild(petal);
                    }
                });
            }

            /* === Grow Stem === */
            function growStem() {
                return new Promise(resolve => {
                    stem.classList.add('grow');

                    setTimeout(() => leafLeft.classList.add('visible'), 900);
                    setTimeout(() => leafRight.classList.add('visible'), 1200);

                    setTimeout(resolve, 2500);
                });
            }

            /* === Bloom === */
            function bloom() {
                calyx.classList.add('visible');
                ambientLight.classList.add('visible');
                ambientLight2.classList.add('visible');
                spotlightWarm.classList.add('visible');
                groundReflection.classList.add('visible');
                roseHead.classList.add('blooming');
            }

            /* === Falling Petals === */
            function spawnFallingPetal() {
                if (fallingPetalsEl.childElementCount > 12) return;

                const petal = document.createElement('div');
                petal.className = 'falling-petal';

                const w = 9 + Math.random() * 14;
                const h = w * (1.2 + Math.random() * 0.2);
                const x = 15 + Math.random() * 70;
                const y = 2 + Math.random() * 12;
                const dur = 5 + Math.random() * 4;
                const delay = Math.random() * 0.8;

                const colors = FALLING_PETAL_COLORS[Math.floor(Math.random() * FALLING_PETAL_COLORS.length)];

                const sign = () => (Math.random() > 0.5 ? 1 : -1);
                const s1 = sign() * (15 + Math.random() * 30);
                const s2 = sign() * (10 + Math.random() * 25);
                const s3 = sign() * (20 + Math.random() * 35);
                const s4 = sign() * (10 + Math.random() * 18);

                petal.style.left = `${x}vw`;
                petal.style.top = `${y}vh`;
                petal.style.setProperty('--fp-w', `${w}px`);
                petal.style.setProperty('--fp-h', `${h}px`);
                petal.style.setProperty('--fp-c1', colors[0]);
                petal.style.setProperty('--fp-c2', colors[1]);
                petal.style.setProperty('--f-dur', `${dur}s`);
                petal.style.setProperty('--f-delay', `${delay}s`);
                petal.style.setProperty('--s1', `${s1}px`);
                petal.style.setProperty('--s2', `${s2}px`);
                petal.style.setProperty('--s3', `${s3}px`);
                petal.style.setProperty('--s4', `${s4}px`);

                fallingPetalsEl.appendChild(petal);

                setTimeout(() => {
                    if (petal.parentNode) petal.remove();
                }, (dur + delay) * 1000 + 500);
            }

            function startFallingPetals() {
                for (let i = 0; i < 4; i++) {
                    setTimeout(() => spawnFallingPetal(), i * 250);
                }
                fallingPetalInterval = setInterval(() => {
                    spawnFallingPetal();
                }, 1800);
            }

            /* === Animation Sequence === */
            async function startAnimationSequence() {
                bokehCanvas.classList.add('visible');
                createDustParticles();
                createSparkles();

                await growStem();
                await delay(150);
                bloom();

                setTimeout(() => {
                    roseWrapper.classList.add('rotating');
                }, 2800);

                setTimeout(() => startFallingPetals(), 3600);

                setTimeout(() => {
                    endText.classList.add('visible');
                }, 5000);
            }

            function delay(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            /* === Init === */
            startButton.addEventListener('click', () => {
                triggerOverlay.classList.add('fade-out');
                setTimeout(() => {
                    startAnimationSequence();
                }, 900);
            });

            createSepals();
            createPetals();
            initBokeh();

            setTimeout(() => {
                startCardLoader();
            }, 500);

        });