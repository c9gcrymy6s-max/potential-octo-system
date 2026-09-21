/* =========================================================
   audio.js
   音效引擎 · 基于 Web Audio API
   无外部音频文件依赖
   ========================================================= */

let audioCtx = null;
let masterGain = null;
let ambientNode = null;
let ambientTimers = [];
let heartbeatTimer = null;
let heartbeatRate = 70;

/* ---------- 初始化 ---------- */
function initAudio() {
    if (audioCtx) return;
    try {
        const AC = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AC();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.28;
        masterGain.connect(audioCtx.destination);
    } catch (e) {
        console.warn('AudioContext 初始化失败', e);
    }
}

function ensureRunning(cb) {
    initAudio();
    if (!audioCtx) { if (cb) cb(false); return; }
    if (audioCtx.state === 'running') { if (cb) cb(true); return; }
    audioCtx.resume().then(function() {
        if (cb) cb(audioCtx.state === 'running');
    }).catch(function() {
        if (cb) cb(false);
    });
}

/* ---------- 环境音配置 ---------- */
const AMBIENT_CONFIG = {
    outside:    { f: 42, n: .018, r: .25, type: 'sine' },
    road:       { f: 38, n: .016, r: .20, type: 'sine' },
    powerplant: { f: 48, n: .024, r: .40, type: 'sine' },
    control:    { f: 45, n: .026, r: .35, type: 'sine' },
    electric:   { f: 55, n: .032, r: .70, type: 'sawtooth', hum: true },
    hall:       { f: 35, n: .038, r: .25, type: 'sine' },
    tunnel:     { f: 28, n: .042, r: .18, type: 'sine', drip: true },
    factory:    { f: 40, n: .034, r: .35, type: 'sine', hum: true },
    warehouse:  { f: 36, n: .028, r: .28, type: 'sine' },
    collapse:   { f: 26, n: .048, r: .16, type: 'sine', drip: true },
    hidden:     { f: 22, n: .055, r: .12, type: 'sine', hum: true }
};

/* ---------- 播放环境音 ---------- */
function playAmbient(scene) {
    ensureRunning(function(ok) {
        if (!ok) return;
        stopAmbient();
        const cfg = AMBIENT_CONFIG[scene] || AMBIENT_CONFIG.outside;
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = cfg.type || 'sine';
        osc.frequency.value = cfg.f;
        g.gain.value = cfg.n;
        osc.connect(g);
        g.connect(masterGain);
        osc.start();

        const lfo = audioCtx.createOscillator();
        const lg = audioCtx.createGain();
        lfo.frequency.value = cfg.r;
        lg.gain.value = cfg.f * 0.12;
        lfo.connect(lg);
        lg.connect(osc.frequency);
        lfo.start();

        ambientNode = { osc: osc, lfo: lfo, g: g };

        if (cfg.drip) scheduleDrip();
        if (cfg.hum) scheduleHum();
    });
}

function stopAmbient() {
    ambientTimers.forEach(function(t) { clearTimeout(t); });
    ambientTimers = [];
    if (ambientNode) {
        try { ambientNode.osc.stop(); ambientNode.lfo.stop(); } catch (e) {}
        ambientNode = null;
    }
}

function scheduleDrip() {
    const t = setTimeout(function() {
        if (!ambientNode) return;
        playSfx('drip');
        scheduleDrip();
    }, 2800 + Math.random() * 4200);
    ambientTimers.push(t);
}

function scheduleHum() {
    const t = setTimeout(function() {
        if (!ambientNode) return;
        playSfx('hum');
        scheduleHum();
    }, 5000 + Math.random() * 6000);
    ambientTimers.push(t);
}

/* ---------- 音效 ---------- */
function playSfx(type) {
    ensureRunning(function(ok) {
        if (!ok) return;
        const map = {
            step:      { f: 75,  t: 'triangle', d: .06, g: .022 },
            pickup:    { f: 620, t: 'triangle', d: .18, g: .05 },
            drip:      { f: 220, t: 'sine',     d: .35, g: .045 },
            door:      { f: 110, t: 'square',   d: .45, g: .05 },
            paper:     { f: 820, t: 'triangle', d: .22, g: .04 },
            whisper:   { f: 175, t: 'sine',     d: 1.6, g: .04 },
            static:    { f: 95,  t: 'sawtooth', d: .90, g: .05 },
            metal:     { f: 340, t: 'triangle', d: .38, g: .05 },
            hum:       { f: 60,  t: 'sawtooth', d: 2.5, g: .018 },
            lock:      { f: 160, t: 'square',   d: .28, g: .06 },
            unlock:    { f: 480, t: 'triangle', d: .35, g: .06 },
            error:     { f: 130, t: 'square',   d: .50, g: .07 },
            heartbeat: { f: 50,  t: 'sine',     d: .25, g: .07 },
            wind:      { f: 30,  t: 'sine',     d: 3.0, g: .02 },
            radio:     { f: 400, t: 'sine',     d: .80, g: .035 },
            ending:    { f: 55,  t: 'sine',     d: 4.0, g: .08 },
            page:      { f: 700, t: 'triangle', d: .18, g: .035 },
            switch:    { f: 260, t: 'square',   d: .10, g: .05 }
        };
        const c = map[type] || map.pickup;
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g);
        g.connect(masterGain);
        o.type = c.t;
        if (type === 'heartbeat') {
            o.frequency.setValueAtTime(60, audioCtx.currentTime);
            o.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + c.d);
        } else if (type === 'error') {
            o.frequency.setValueAtTime(200, audioCtx.currentTime);
            o.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + c.d);
        } else {
            o.frequency.value = c.f;
        }
        g.gain.setValueAtTime(c.g, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + c.d);
        o.start();
        o.stop(audioCtx.currentTime + c.d);

        if (type === 'heartbeat') {
            setTimeout(function() {
                if (!audioCtx) return;
                const o2 = audioCtx.createOscillator();
                const g2 = audioCtx.createGain();
                o2.connect(g2);
                g2.connect(masterGain);
                o2.type = 'sine';
                o2.frequency.setValueAtTime(50, audioCtx.currentTime);
                o2.frequency.exponentialRampToValueAtTime(25, audioCtx.currentTime + .15);
                g2.gain.setValueAtTime(.05, audioCtx.currentTime);
                g2.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + .18);
                o2.start();
                o2.stop(audioCtx.currentTime + .18);
            }, 200);
        }
    });
}

/* ---------- 摩斯电码 ---------- */
function playMorse(text, speed) {
    speed = speed || 12;
    ensureRunning(function(ok) {
        if (!ok) return;
        const map = {
            '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-',
            '5':'.....','6':'-....','7':'--...','8':'---..','9':'----.',
            'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.',
            'G':'--.','H':'....','I':'..','J':'.---','K':'-.-','L':'.-..',
            'M':'--','N':'-.','O':'---','P':'.--.','Q':'--.-','R':'.-.',
            'S':'...','T':'-','U':'..-','V':'...-','W':'.--','X':'-..-',
            'Y':'-.--','Z':'--..'
        };
        const dot = 1000 / speed;
        const dash = dot * 3;
        const gap = dot;
        const letterGap = dot * 3;
        let t = 0;
        text.toUpperCase().split('').forEach(function(ch) {
            const code = map[ch];
            if (!code) { t += letterGap; return; }
            code.split('').forEach(function(sym) {
                const startAt = t;
                const dur = sym === '.' ? dot : dash;
                setTimeout(function() {
                    if (!audioCtx || audioCtx.state !== 'running') return;
                    const o = audioCtx.createOscillator();
                    const g = audioCtx.createGain();
                    o.connect(g);
                    g.connect(masterGain);
                    o.frequency.value = 620;
                    g.gain.setValueAtTime(.045, audioCtx.currentTime);
                    g.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + dur / 1000 - .01);
                    o.start();
                    o.stop(audioCtx.currentTime + dur / 1000);
                }, startAt);
                t += dur + gap;
            });
            t += letterGap;
        });
    });
}

/* ---------- 心跳 ---------- */
function startHeartbeat(rate) {
    stopHeartbeat();
    heartbeatRate = rate || 70;
    heartbeatTimer = setInterval(function() {
        playSfx('heartbeat');
    }, 60000 / heartbeatRate);
}

function stopHeartbeat() {
    if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
    }
}

function setHeartbeatRate(rate) {
    heartbeatRate = rate;
    if (heartbeatTimer) startHeartbeat(rate);
}

/* ---------- 自动解锁 ---------- */
document.addEventListener('click', function() { ensureRunning(); });
document.addEventListener('keydown', function() { ensureRunning(); });
document.addEventListener('touchstart', function() { ensureRunning(); });

/* ---------- 导出 ---------- */
window.playAmbient = playAmbient;
window.stopAmbient = stopAmbient;
window.playSfx = playSfx;
window.playMorse = playMorse;
window.startHeartbeat = startHeartbeat;
window.stopHeartbeat = stopHeartbeat;
window.setHeartbeatRate = setHeartbeatRate;