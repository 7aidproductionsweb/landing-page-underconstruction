/* ===================================================
   UNDER CONSTRUCTION — Kreolyse
   =================================================== */

// ---- 1. PARTICULES SPARKS ----

const pCanvas = document.getElementById('particles-canvas');
const pCtx    = pCanvas.getContext('2d');

function resizeCanvas() {
    pCanvas.width  = window.innerWidth;
    pCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor() { this.reset(true); }

    reset(initial = false) {
        this.x    = Math.random() * pCanvas.width;
        this.y    = initial ? Math.random() * pCanvas.height : pCanvas.height + 10;
        this.size = Math.random() * 1.7 + 0.4;
        this.vx   = (Math.random() - 0.5) * 0.4;
        this.vy   = -(Math.random() * 0.65 + 0.15);
        this.life = 0;
        this.max  = Math.random() * 220 + 120;
        this.color = Math.random() > 0.55 ? '#ff6b00' : '#ffd60a';
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life++;
        if (this.life >= this.max) this.reset();
    }

    draw() {
        const alpha = (1 - this.life / this.max) * 0.5;
        pCtx.save();
        pCtx.globalAlpha = alpha;
        pCtx.fillStyle   = this.color;
        pCtx.shadowBlur  = 5;
        pCtx.shadowColor = this.color;
        pCtx.beginPath();
        pCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        pCtx.fill();
        pCtx.restore();
    }
}

const particles = Array.from({ length: 85 }, () => new Particle());

function tickParticles() {
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(tickParticles);
}
tickParticles();


// ---- 2. PARALLAXE SOURIS ----

document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (cx - e.clientX) / 90;
    const dy = (cy - e.clientY) / 90;

    document.querySelectorAll('.parallax').forEach(el => {
        const s = parseFloat(el.getAttribute('data-speed')) || 1;
        el.style.transform = `translate(${dx * s}px, ${dy * s}px)`;
    });
});


// ---- 3. FAUSSE BARRE DE PROGRESSION CENTRALE ----

const bar      = document.getElementById('progress-bar');
const pctLabel = document.getElementById('pct-label');
let pct = 73;

setInterval(() => {
    if (isBroken) return;
    const delta = (Math.random() - 0.52) * 0.55;
    pct = Math.max(68, Math.min(74, pct + delta));
    pctLabel.textContent = Math.round(pct) + '%';
    bar.style.width = pct + '%';
}, 1800);


// ---- 4. GLITCH PÉRIODIQUE SUR LE TITRE ----

const h1 = document.getElementById('main-h1');

function scheduleGlitch() {
    const delay = Math.random() * 6000 + 5000;
    setTimeout(() => {
        if (!isBroken) {
            h1.classList.add('glitch');
            setTimeout(() => h1.classList.remove('glitch'), 420);
        }
        scheduleGlitch();
    }, delay);
}
scheduleGlitch();


// ---- 5. TOASTS POUR LES CARTES APPLICATIONS ----

const toastContainer = document.getElementById('toast-container');
let activeToast = null;
let activeToastHideTimer = null;
const TOAST_MIN_MS = 6200;
const TOAST_MAX_MS = 12000;
const TOAST_BASE_MS = 2600;
const TOAST_PER_CHAR_MS = 48;

function getToastDuration(msg) {
    const computed = TOAST_BASE_MS + (msg?.length || 0) * TOAST_PER_CHAR_MS;
    return Math.max(TOAST_MIN_MS, Math.min(TOAST_MAX_MS, computed));
}

function showToast(name, msg) {
    // Retire le toast précédent si encore présent
    if (activeToast) {
        const previousToast = activeToast;
        previousToast.classList.add('out');
        setTimeout(() => previousToast.remove(), 280);
    }

    // Prevent old hide timers from affecting the new toast
    if (activeToastHideTimer) {
        clearTimeout(activeToastHideTimer);
        activeToastHideTimer = null;
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <div class="toast-name">${name}</div>
        <div class="toast-msg">${msg}</div>
    `;
    toastContainer.appendChild(toast);
    activeToast = toast;

    // Auto-dismiss (longer for long messages)
    const toastDuration = getToastDuration(msg);
    activeToastHideTimer = setTimeout(() => {
        activeToastHideTimer = null;
        toast.classList.add('out');
        setTimeout(() => {
            toast.remove();
            if (activeToast === toast) activeToast = null;
        }, 300);
    }, toastDuration);
}

// Attache le comportement à chaque carte
document.querySelectorAll('.app-card').forEach(card => {
    const name = card.getAttribute('data-name');
    const msg  = card.getAttribute('data-msg');
    let cooldown = false;

    const trigger = () => {
        if (cooldown) return;
        cooldown = true;

        // Animation blocked sur la carte
        card.classList.remove('blocked');
        void card.offsetWidth; // force reflow
        card.classList.add('blocked');
        setTimeout(() => card.classList.remove('blocked'), 400);

        showToast(name, msg);
        setTimeout(() => { cooldown = false; }, 800);
    };

    card.addEventListener('click',   trigger);
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            trigger();
        }
    });
});


// ---- 6. LE BOUTON QUI NE FAUT PAS CLIQUER ----

const btn           = document.getElementById('danger-btn');
const btnText       = document.getElementById('btn-text');
const mainContent   = document.getElementById('main-content');
const crackCanvas   = document.getElementById('crack-canvas');
const dropContainer = document.getElementById('drop-container');
const flash         = document.getElementById('screen-flash');
const sign          = document.getElementById('sign');
let   isBroken      = false;

btn.addEventListener('click', () => {
    if (isBroken) return;
    isBroken = true;

    // a) Flash blanc
    flash.classList.add('flash-anim');
    setTimeout(() => flash.classList.remove('flash-anim'), 400);

    // b) Tremblement écran
    mainContent.classList.add('shake-screen');
    setTimeout(() => mainContent.classList.remove('shake-screen'), 800);

    // c) Panneau change
    setTimeout(() => {
        sign.innerHTML = `
            <div class="sign-top">
                <span class="sign-icon">💥</span>
                <span class="sign-title">OH NON…</span>
                <span class="sign-icon">💥</span>
            </div>
            <div class="sign-sub">le chantier s'est emballe tout seul</div>
        `;
        sign.style.borderColor = '#e74c3c';
        sign.style.boxShadow   = '0 0 35px rgba(231,76,60,0.4)';
    }, 200);

    // d) Fissure écran
    setTimeout(() => {
        drawCrack();
        crackCanvas.classList.add('visible');
        setTimeout(() => crackCanvas.classList.remove('visible'), 3200);
    }, 300);

    // e) Bouton cassé
    btnText.textContent = "💀 Ah bravo, t'as tout cassé !";
    btn.classList.add('broken');
    btn.style.pointerEvents = 'none';

    // f) Barre s'effondre
    pctLabel.textContent = '0%';
    bar.style.width      = '0%';

    // g) Pluie d'objets de chantier
    setTimeout(() => rainDebris(), 380);

    // h) Glitch frénétique du titre
    let count = 0;
    const fury = setInterval(() => {
        h1.classList.add('glitch');
        setTimeout(() => h1.classList.remove('glitch'), 280);
        if (++count >= 7) clearInterval(fury);
    }, 280);
});


// ---- 7. PLUIE D'OBJETS ----

function rainDebris() {
    const items  = ['📄','🧱','🧩','⚠️','💥','🚧','📌','🌀','🧾','📦','⚡','🛑','📎'];
    const amount = 65;

    for (let i = 0; i < amount; i++) {
        setTimeout(() => {
            const el = document.createElement('div');
            el.className   = 'drop-item';
            el.textContent = items[Math.floor(Math.random() * items.length)];
            el.style.left              = Math.random() * 100 + 'vw';
            el.style.fontSize          = (Math.random() * 2.2 + 1.4) + 'rem';
            el.style.animationDuration = (Math.random() * 2 + 1.4) + 's';
            dropContainer.appendChild(el);
            setTimeout(() => el.remove(), 4000);
        }, i * 38 + Math.random() * 55);
    }
}


// ---- 8. FISSURE CANVAS PROCÉDURALE ----

function drawCrack() {
    const c   = crackCanvas;
    const ctx = c.getContext('2d');
    c.width   = window.innerWidth;
    c.height  = window.innerHeight;
    ctx.clearRect(0, 0, c.width, c.height);

    const ox = c.width  / 2 + (Math.random() - 0.5) * 100;
    const oy = c.height / 2 + (Math.random() - 0.5) * 100;

    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth   = 1.5;
    ctx.shadowColor = 'rgba(255,255,255,0.55)';
    ctx.shadowBlur  = 6;
    ctx.lineCap     = 'round';

    const branches = 10 + Math.floor(Math.random() * 5);
    for (let b = 0; b < branches; b++) {
        const angle  = (b / branches) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
        const length = 80 + Math.random() * Math.min(c.width, c.height) * 0.33;
        drawBranch(ctx, ox, oy, angle, length, 4);
    }

    // Vignette sombre au centre autour du point d'impact
    const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, Math.max(c.width, c.height) * 0.55);
    grad.addColorStop(0,   'transparent');
    grad.addColorStop(0.65,'transparent');
    grad.addColorStop(1,   'rgba(0,0,0,0.32)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, c.width, c.height);
}

function drawBranch(ctx, x, y, angle, length, depth) {
    if (depth === 0 || length < 12) return;

    const ex = x + Math.cos(angle) * length;
    const ey = y + Math.sin(angle) * length;

    ctx.beginPath();
    ctx.moveTo(x, y);
    const steps = 4 + Math.floor(Math.random() * 3);
    let cx2 = x, cy2 = y;
    for (let i = 1; i <= steps; i++) {
        const t  = i / steps;
        const nx = x + (ex - x) * t + (Math.random() - 0.5) * 18;
        const ny = y + (ey - y) * t + (Math.random() - 0.5) * 18;
        ctx.lineTo(nx, ny);
        cx2 = nx; cy2 = ny;
    }
    ctx.lineWidth = Math.max(0.4, depth * 0.34);
    ctx.stroke();

    const subs = depth > 2 ? 3 : 2;
    for (let s = 0; s < subs; s++) {
        if (Math.random() > 0.55) continue;
        const t2    = 0.35 + Math.random() * 0.5;
        const px    = x + (ex - x) * t2;
        const py    = y + (ey - y) * t2;
        const spread = (Math.random() - 0.5) * 1.2;
        drawBranch(ctx, px, py, angle + spread, length * (0.35 + Math.random() * 0.35), depth - 1);
    }
}

window.addEventListener('resize', () => {
    crackCanvas.width  = window.innerWidth;
    crackCanvas.height = window.innerHeight;
});
