/* =========================================================
   textures.js
   程序化生成所有建筑材质
   全部用 CanvasTexture，不依赖外部图片
   ========================================================= */

const TEXTURES = {};

/* ---------- 工具：噪点 ---------- */
function addNoise(ctx, w, h, amount, alpha, color) {
    for (let i = 0; i < amount; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = Math.random() * 2 + 0.5;
        ctx.fillStyle = 'rgba(' + color + ',' + (Math.random() * alpha) + ')';
        ctx.fillRect(x, y, r, r);
    }
}

/* ---------- 工具：裂缝 ---------- */
function addCracks(ctx, w, h, count, depth) {
    ctx.strokeStyle = 'rgba(10,10,12,0.55)';
    ctx.lineWidth = 1;
    for (let i = 0; i < count; i++) {
        ctx.beginPath();
        let x = Math.random() * w;
        let y = Math.random() * h;
        ctx.moveTo(x, y);
        const segs = 6 + Math.floor(Math.random() * 8);
        for (let j = 0; j < segs; j++) {
            x += (Math.random() - 0.5) * depth;
            y += (Math.random() - 0.5) * depth;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
}

/* ---------- 工具：污渍 ---------- */
function addStains(ctx, w, h, count) {
    for (let i = 0; i < count; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 8 + Math.random() * 40;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        const tone = Math.random() > 0.5 ? '40,30,20' : '20,20,25';
        g.addColorStop(0, 'rgba(' + tone + ',' + (0.15 + Math.random() * 0.2) + ')');
        g.addColorStop(1, 'rgba(' + tone + ',0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
}

/* ---------- 工具：水痕 ---------- */
function addWaterDrip(ctx, w, h, count) {
    for (let i = 0; i < count; i++) {
        const x = Math.random() * w;
        const startY = Math.random() * h * 0.3;
        const len = 60 + Math.random() * 200;
        const width = 2 + Math.random() * 6;
        const g = ctx.createLinearGradient(x, startY, x, startY + len);
        g.addColorStop(0, 'rgba(30,25,15,0.35)');
        g.addColorStop(0.5, 'rgba(30,25,15,0.15)');
        g.addColorStop(1, 'rgba(30,25,15,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x - width / 2, startY, width, len);
    }
}

/* ---------- 工具：锈斑 ---------- */
function addRust(ctx, w, h, count) {
    for (let i = 0; i < count; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 3 + Math.random() * 18;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        const rustColors = ['120,50,15', '90,35,10', '150,70,25', '70,25,8'];
        const c = rustColors[Math.floor(Math.random() * rustColors.length)];
        g.addColorStop(0, 'rgba(' + c + ',' + (0.5 + Math.random() * 0.4) + ')');
        g.addColorStop(0.6, 'rgba(' + c + ',' + (0.25 + Math.random() * 0.2) + ')');
        g.addColorStop(1, 'rgba(' + c + ',0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
}

/* ---------- 工具：划痕 ---------- */
function addScratches(ctx, w, h, count) {
    ctx.strokeStyle = 'rgba(200,200,190,0.08)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < count; i++) {
        ctx.beginPath();
        const x = Math.random() * w;
        const y = Math.random() * h;
        const angle = Math.random() * Math.PI * 2;
        const len = 20 + Math.random() * 100;
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
        ctx.stroke();
    }
}

/* =========================================================
   材质 1：混凝土墙
   ========================================================= */
TEXTURES.concrete = function() {
    const w = 512, h = 512;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#4a4a4e';
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 15; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const rw = 50 + Math.random() * 150;
        const rh = 50 + Math.random() * 150;
        const v = Math.random() * 20 - 10;
        ctx.fillStyle = 'rgba(' + (74+v) + ',' + (74+v) + ',' + (78+v) + ',0.4)';
        ctx.fillRect(x, y, rw, rh);
    }

    addNoise(ctx, w, h, 15000, 0.25, '30,30,34');
    addNoise(ctx, w, h, 8000, 0.15, '90,90,95');

    for (let i = 0; i < 200; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = Math.random() * 1.5 + 0.3;
        ctx.fillStyle = 'rgba(20,20,22,' + (0.4 + Math.random() * 0.3) + ')';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    addCracks(ctx, w, h, 12, 25);
    addWaterDrip(ctx, w, h, 8);
    addStains(ctx, w, h, 20);

    for (let i = 0; i < 4; i++) {
        const x = i % 2 === 0 ? Math.random() * 100 : w - Math.random() * 100;
        const y = i < 2 ? Math.random() * 100 : h - Math.random() * 100;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 60 + Math.random() * 40);
        g.addColorStop(0, 'rgba(20,25,15,0.4)');
        g.addColorStop(1, 'rgba(20,25,15,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 100, 0, Math.PI * 2);
        ctx.fill();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 4;
    return tex;
};

/* =========================================================
   材质 2：水泥地面
   ========================================================= */
TEXTURES.cementFloor = function() {
    const w = 512, h = 512;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#3a3a3d';
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 20; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const rw = 60 + Math.random() * 180;
        const rh = 60 + Math.random() * 180;
        const v = Math.random() * 15 - 7;
        ctx.fillStyle = 'rgba(' + (58+v) + ',' + (58+v) + ',' + (61+v) + ',0.35)';
        ctx.fillRect(x, y, rw, rh);
    }

    addNoise(ctx, w, h, 20000, 0.2, '20,20,22');
    addNoise(ctx, w, h, 6000, 0.1, '80,80,85');

    ctx.strokeStyle = 'rgba(15,15,17,0.6)';
    ctx.lineWidth = 2;
    for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(i * w / 4, 0);
        ctx.lineTo(i * w / 4, h);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * h / 4);
        ctx.lineTo(w, i * h / 4);
        ctx.stroke();
    }

    for (let i = 0; i < 25; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 1.5 + Math.random() * 1.5;
        ctx.fillStyle = 'rgba(15,10,8,' + (0.6 + Math.random() * 0.3) + ')';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
        g.addColorStop(0, 'rgba(40,35,30,0.3)');
        g.addColorStop(1, 'rgba(40,35,30,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r * 4, 0, Math.PI * 2);
        ctx.fill();
    }

    for (let i = 0; i < 15; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const angle = Math.random() * Math.PI * 2;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = 'rgba(20,18,16,' + (0.15 + Math.random() * 0.15) + ')';
        ctx.beginPath();
        ctx.ellipse(0, 0, 7, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    for (let i = 0; i < 8; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 15 + Math.random() * 40;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, 'rgba(10,8,5,0.5)');
        g.addColorStop(0.6, 'rgba(10,8,5,0.2)');
        g.addColorStop(1, 'rgba(10,8,5,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    addCracks(ctx, w, h, 6, 30);

    for (let i = 0; i < 3; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 20 + Math.random() * 30;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, 'rgba(15,18,22,0.35)');
        g.addColorStop(1, 'rgba(15,18,22,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 4;
    return tex;
};

/* =========================================================
   材质 3：旧瓷砖地面
   ========================================================= */
TEXTURES.oldTile = function() {
    const w = 512, h = 512;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#6a6a60';
    ctx.fillRect(0, 0, w, h);

    const tileSize = 64;
    const gap = 3;
    for (let ty = 0; ty < 8; ty++) {
        for (let tx = 0; tx < 8; tx++) {
            const x = tx * tileSize;
            const y = ty * tileSize;
            const v = Math.random() * 20 - 10;
            const base = 100 + v;
            ctx.fillStyle = 'rgb(' + base + ',' + (base-5) + ',' + (base-15) + ')';
            ctx.fillRect(x + gap, y + gap, tileSize - gap * 2, tileSize - gap * 2);

            const g = ctx.createLinearGradient(x, y, x, y + tileSize);
            g.addColorStop(0, 'rgba(255,255,255,0.06)');
            g.addColorStop(0.5, 'rgba(255,255,255,0)');
            g.addColorStop(1, 'rgba(0,0,0,0.08)');
            ctx.fillStyle = g;
            ctx.fillRect(x + gap, y + gap, tileSize - gap * 2, tileSize - gap * 2);

            if (Math.random() < 0.08) {
                ctx.fillStyle = 'rgba(60,55,45,0.5)';
                ctx.fillRect(x + gap + Math.random() * 30, y + gap + Math.random() * 30, 10 + Math.random() * 15, 5 + Math.random() * 10);
            }
            if (Math.random() < 0.15) {
                const sx = x + gap + Math.random() * (tileSize - gap * 2);
                const sy = y + gap + Math.random() * (tileSize - gap * 2);
                const g2 = ctx.createRadialGradient(sx, sy, 0, sx, sy, 20);
                g2.addColorStop(0, 'rgba(50,40,25,0.35)');
                g2.addColorStop(1, 'rgba(50,40,25,0)');
                ctx.fillStyle = g2;
                ctx.fillRect(x + gap, y + gap, tileSize - gap * 2, tileSize - gap * 2);
            }
        }
    }

    ctx.strokeStyle = 'rgba(20,18,15,0.5)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 8; i++) {
        ctx.beginPath();
        ctx.moveTo(i * tileSize, 0);
        ctx.lineTo(i * tileSize, h);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * tileSize);
        ctx.lineTo(w, i * tileSize);
        ctx.stroke();
    }

    addNoise(ctx, w, h, 8000, 0.12, '30,30,25');
    addStains(ctx, w, h, 10);
    addScratches(ctx, w, h, 40);

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 4;
    return tex;
};

/* =========================================================
   材质 4：锈铁
   ========================================================= */
TEXTURES.rustMetal = function() {
    const w = 512, h = 512;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#3a3530';
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 200; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        ctx.strokeStyle = 'rgba(' + (60+Math.random()*30) + ',' + (55+Math.random()*25) + ',' + (50+Math.random()*20) + ',0.15)';
        ctx.lineWidth = 0.5 + Math.random() * 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.random() * 100 - 50, y + Math.random() * 4 - 2);
        ctx.stroke();
    }

    addRust(ctx, w, h, 300);

    for (let i = 0; i < 8; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 40 + Math.random() * 80;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, 'rgba(110,45,15,0.6)');
        g.addColorStop(0.5, 'rgba(90,35,10,0.35)');
        g.addColorStop(1, 'rgba(70,25,5,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    for (let i = 0; i < 15; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const rw = 10 + Math.random() * 40;
        const rh = 10 + Math.random() * 40;
        ctx.fillStyle = 'rgba(80,75,70,0.5)';
        ctx.beginPath();
        ctx.ellipse(x, y, rw / 2, rh / 2, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
    }

    addScratches(ctx, w, h, 200);

    for (let i = 0; i < 12; i++) {
        const edge = Math.floor(Math.random() * 4);
        let x, y;
        if (edge === 0) { x = Math.random() * w; y = 20; }
        else if (edge === 1) { x = w - 20; y = Math.random() * h; }
        else if (edge === 2) { x = Math.random() * w; y = h - 20; }
        else { x = 20; y = Math.random() * h; }
        const r = 4;
        ctx.fillStyle = 'rgba(100,90,80,0.8)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(180,170,160,0.5)';
        ctx.beginPath();
        ctx.arc(x - 1, y - 1, r * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(30,25,20,0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
            const a = k * Math.PI / 3;
            const px = x + Math.cos(a) * r;
            const py = y + Math.sin(a) * r;
            if (k === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 4;
    return tex;
};

/* =========================================================
   材质 5：掉漆墙面
   ========================================================= */
TEXTURES.paintedWall = function() {
    const w = 512, h = 512;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#8a8880';
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 20; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const rw = 50 + Math.random() * 150;
        const rh = 50 + Math.random() * 150;
        const v = Math.random() * 25 - 12;
        ctx.fillStyle = 'rgba(' + (138+v) + ',' + (136+v) + ',' + (128+v) + ',0.4)';
        ctx.fillRect(x, y, rw, rh);
    }

    addNoise(ctx, w, h, 12000, 0.2, '40,40,35');

    ctx.save();
    ctx.font = 'bold 72px sans-serif';
    ctx.fillStyle = 'rgba(180,30,20,0.25)';
    ctx.fillText('安全', 40, 180);
    ctx.fillText('第一', 200, 180);
    ctx.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 30; i++) {
        ctx.fillStyle = 'rgba(0,0,0,' + (0.3 + Math.random() * 0.5) + ')';
        ctx.fillRect(30 + Math.random() * 300, 120 + Math.random() * 80, 5 + Math.random() * 20, 3 + Math.random() * 8);
    }
    ctx.restore();

    for (let i = 0; i < 30; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 5 + Math.random() * 30;
        ctx.fillStyle = 'rgba(60,55,50,' + (0.3 + Math.random() * 0.3) + ')';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    addWaterDrip(ctx, w, h, 12);
    addStains(ctx, w, h, 15);
    addCracks(ctx, w, h, 8, 20);

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 4;
    return tex;
};

/* =========================================================
   材质 6：纸张
   ========================================================= */
TEXTURES.paper = function(text, opts) {
    opts = opts || {};
    const w = 512, h = 680;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#e8dfc8';
    ctx.fillRect(0, 0, w, h);

    addNoise(ctx, w, h, 8000, 0.08, '120,100,70');
    addNoise(ctx, w, h, 4000, 0.05, '200,180,150');

    ctx.strokeStyle = 'rgba(120,100,70,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    if (!opts.noStain) {
        for (let i = 0; i < 3; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const r = 30 + Math.random() * 80;
            const g = ctx.createRadialGradient(x, y, 0, x, y, r);
            g.addColorStop(0, 'rgba(150,120,70,0.25)');
            g.addColorStop(1, 'rgba(150,120,70,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    if (text) {
        ctx.save();
        ctx.fillStyle = opts.color || '#1a1a1a';
        ctx.font = opts.font || '22px serif';
        const lines = text.split('\n');
        const lineHeight = 32;
        let y = 80;
        lines.forEach(function(line) {
            ctx.fillText(line, 50, y);
            y += lineHeight;
        });
        ctx.restore();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 4;
    return tex;
};

/* =========================================================
   材质 7：蓝色确良布
   ========================================================= */
TEXTURES.cloth = function() {
    const w = 256, h = 256;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#3a5a7a';
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < w; i += 2) {
        ctx.fillStyle = 'rgba(255,255,255,' + (0.02 + Math.random() * 0.03) + ')';
        ctx.fillRect(i, 0, 1, h);
    }
    for (let i = 0; i < h; i += 2) {
        ctx.fillStyle = 'rgba(0,0,0,' + (0.02 + Math.random() * 0.03) + ')';
        ctx.fillRect(0, i, w, 1);
    }

    for (let i = 0; i < 20; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 20 + Math.random() * 60;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, 'rgba(180,190,200,0.15)');
        g.addColorStop(1, 'rgba(180,190,200,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    addStains(ctx, w, h, 8);

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
};

/* =========================================================
   材质 8：脏玻璃
   ========================================================= */
TEXTURES.glass = function() {
    const w = 256, h = 256;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');

    ctx.fillStyle = 'rgba(30,35,40,0.4)';
    ctx.fillRect(0, 0, w, h);

    addNoise(ctx, w, h, 3000, 0.15, '100,100,100');

    for (let i = 0; i < 3; i++) {
        const x = Math.random() * w;
        const g = ctx.createLinearGradient(x, 0, x + 60, h);
        g.addColorStop(0, 'rgba(200,200,200,0)');
        g.addColorStop(0.5, 'rgba(200,200,200,0.08)');
        g.addColorStop(1, 'rgba(200,200,200,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x, 0, 60, h);
    }

    ctx.strokeStyle = 'rgba(200,200,200,0.4)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        let x = Math.random() * w;
        let y = Math.random() * h;
        ctx.moveTo(x, y);
        for (let j = 0; j < 8; j++) {
            x += (Math.random() - 0.5) * 40;
            y += (Math.random() - 0.5) * 40;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 4;
    return tex;
};

/* =========================================================
   材质 9：旧木头
   ========================================================= */
TEXTURES.wood = function() {
    const w = 256, h = 256;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#5a4530';
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 60; i++) {
        const y = Math.random() * h;
        const v = Math.random() * 30 - 15;
        ctx.strokeStyle = 'rgba(' + (90+v) + ',' + (70+v) + ',' + (45+v) + ',0.4)';
        ctx.lineWidth = 0.5 + Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < w; x += 10) {
            ctx.lineTo(x, y + Math.sin(x * 0.05 + i) * 3);
        }
        ctx.stroke();
    }

    addNoise(ctx, w, h, 4000, 0.1, '30,20,10');
    addScratches(ctx, w, h, 60);
    addStains(ctx, w, h, 5);

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
};

/* =========================================================
   材质 10：金属板
   ========================================================= */
TEXTURES.metalPlate = function() {
    const w = 512, h = 512;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#5a5a5e';
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 400; i++) {
        const y = Math.random() * h;
        const v = Math.random() * 30 - 15;
        ctx.strokeStyle = 'rgba(' + (90+v) + ',' + (90+v) + ',' + (95+v) + ',0.2)';
        ctx.lineWidth = 0.5 + Math.random() * 1.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y + (Math.random() - 0.5) * 2);
        ctx.stroke();
    }

    addRust(ctx, w, h, 40);
    addScratches(ctx, w, h, 150);

    const boltPositions = [
        [40, 40], [w - 40, 40], [40, h - 40], [w - 40, h - 40],
        [w / 2, 40], [w / 2, h - 40]
    ];
    boltPositions.forEach(function(p) {
        const x = p[0], y = p[1];
        ctx.fillStyle = 'rgba(20,20,22,0.8)';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(120,120,125,0.5)';
        ctx.beginPath();
        ctx.arc(x - 1, y - 1, 2, 0, Math.PI * 2);
        ctx.fill();
    });

    addStains(ctx, w, h, 10);

    ctx.fillStyle = 'rgba(180,180,170,0.25)';
    ctx.fillRect(w / 2 - 80, h / 2 - 40, 160, 80);
    ctx.strokeStyle = 'rgba(40,40,40,0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(w / 2 - 80, h / 2 - 40, 160, 80);

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 4;
    return tex;
};

/* =========================================================
   材质 11：锈蚀管道
   ========================================================= */
TEXTURES.rustyPipe = function() {
    const w = 512, h = 128;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#6a3a18';
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 300; i++) {
        const y = Math.random() * h;
        const v = Math.random() * 40 - 20;
        ctx.strokeStyle = 'rgba(' + (120+v) + ',' + (60+v) + ',' + (25+v) + ',0.3)';
        ctx.lineWidth = 0.5 + Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }

    addRust(ctx, w, h, 200);

    for (let i = 0; i < 30; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 2 + Math.random() * 8;
        ctx.fillStyle = 'rgba(40,15,5,' + (0.5 + Math.random() * 0.4) + ')';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    const flangePositions = [0, w / 3, w * 2 / 3, w];
    flangePositions.forEach(function(x) {
        ctx.fillStyle = 'rgba(60,35,15,0.8)';
        ctx.fillRect(x - 5, 0, 10, h);
        ctx.fillStyle = 'rgba(90,55,25,0.6)';
        ctx.fillRect(x - 5, 0, 10, 3);
        ctx.fillRect(x - 5, h - 3, 10, 3);
    });

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 4;
    return tex;
};

/* =========================================================
   材质 12：泥土地面
   ========================================================= */
TEXTURES.dirtGround = function() {
    const w = 512, h = 512;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#3a3025';
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 30; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const rw = 30 + Math.random() * 100;
        const rh = 30 + Math.random() * 100;
        const v = Math.random() * 25 - 12;
        ctx.fillStyle = 'rgba(' + (58+v) + ',' + (48+v) + ',' + (37+v) + ',0.4)';
        ctx.fillRect(x, y, rw, rh);
    }

    for (let i = 0; i < 200; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 1 + Math.random() * 3;
        const v = Math.random() * 60 - 30;
        ctx.fillStyle = 'rgba(' + (80+v) + ',' + (75+v) + ',' + (65+v) + ',0.7)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    addNoise(ctx, w, h, 15000, 0.25, '20,15,10');
    addNoise(ctx, w, h, 8000, 0.15, '80,70,55');
    addCracks(ctx, w, h, 20, 40);

    ctx.strokeStyle = 'rgba(20,15,10,0.4)';
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.3);
    for (let x = 0; x < w; x += 20) {
        ctx.lineTo(x, h * 0.3 + Math.sin(x * 0.02) * 8);
    }
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, h * 0.7);
    for (let x = 0; x < w; x += 20) {
        ctx.lineTo(x, h * 0.7 + Math.sin(x * 0.02) * 8);
    }
    ctx.stroke();

    for (let i = 0; i < 100; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const angle = Math.random() * Math.PI * 2;
        const len = 3 + Math.random() * 8;
        ctx.strokeStyle = 'rgba(' + (100+Math.random()*30) + ',' + (85+Math.random()*20) + ',50,' + (0.3 + Math.random() * 0.3) + ')';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
        ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 4;
    return tex;
};

/* =========================================================
   材质 13：柏油路
   ========================================================= */
TEXTURES.asphalt = function() {
    const w = 512, h = 512;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#2a2a2c';
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 8000; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 0.3 + Math.random() * 1.5;
        const v = Math.random() * 80 - 40;
        ctx.fillStyle = 'rgba(' + (60+v) + ',' + (60+v) + ',' + (62+v) + ',' + (0.3 + Math.random() * 0.4) + ')';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    for (let i = 0; i < 15; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const rw = 50 + Math.random() * 150;
        const rh = 50 + Math.random() * 150;
        const v = Math.random() * 20 - 10;
        ctx.fillStyle = 'rgba(' + (42+v) + ',' + (42+v) + ',' + (44+v) + ',0.3)';
        ctx.fillRect(x, y, rw, rh);
    }

    addCracks(ctx, w, h, 15, 35);

    for (let i = 0; i < 4; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const rw = 40 + Math.random() * 80;
        const rh = 30 + Math.random() * 60;
        ctx.fillStyle = 'rgba(15,15,17,0.5)';
        ctx.fillRect(x, y, rw, rh);
        ctx.strokeStyle = 'rgba(50,50,52,0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, rw, rh);
    }

    ctx.strokeStyle = 'rgba(200,195,180,0.35)';
    ctx.lineWidth = 6;
    ctx.setLineDash([40, 30]);
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
    ctx.setLineDash([]);

    for (let i = 0; i < 6; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 20 + Math.random() * 50;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, 'rgba(5,5,8,0.6)');
        g.addColorStop(0.5, 'rgba(5,5,8,0.3)');
        g.addColorStop(1, 'rgba(5,5,8,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 4;
    return tex;
};

/* =========================================================
   材质 14：旧血迹
   ========================================================= */
TEXTURES.bloodStain = function() {
    const w = 512, h = 512;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');

    ctx.clearRect(0, 0, w, h);

    const cx = w / 2, cy = h / 2;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 180);
    g.addColorStop(0, 'rgba(80,15,10,0.85)');
    g.addColorStop(0.4, 'rgba(60,12,8,0.6)');
    g.addColorStop(0.7, 'rgba(40,10,5,0.3)');
    g.addColorStop(1, 'rgba(40,10,5,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, 180, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 60; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 60 + Math.random() * 100;
        const x = cx + Math.cos(angle) * dist;
        const y = cy + Math.sin(angle) * dist;
        const r = 3 + Math.random() * 15;
        const gg = ctx.createRadialGradient(x, y, 0, x, y, r);
        gg.addColorStop(0, 'rgba(70,12,8,0.5)');
        gg.addColorStop(1, 'rgba(70,12,8,0)');
        ctx.fillStyle = gg;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.strokeStyle = 'rgba(35,5,3,0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 150, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 180 + Math.random() * 120;
        const x = cx + Math.cos(angle) * dist;
        const y = cy + Math.sin(angle) * dist;
        const r = 1 + Math.random() * 4;
        ctx.fillStyle = 'rgba(50,8,5,' + (0.4 + Math.random() * 0.4) + ')';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 4;
    return tex;
};

/* =========================================================
   材质 15：遗骨周围布料
   ========================================================= */
TEXTURES.skinOld = function() {
    const w = 256, h = 256;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#6a7580';
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < w; i += 3) {
        ctx.fillStyle = 'rgba(255,255,255,' + (0.03 + Math.random() * 0.03) + ')';
        ctx.fillRect(i, 0, 1, h);
    }
    for (let i = 0; i < h; i += 3) {
        ctx.fillStyle = 'rgba(0,0,0,' + (0.03 + Math.random() * 0.03) + ')';
        ctx.fillRect(0, i, w, 1);
    }

    for (let i = 0; i < 30; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 20 + Math.random() * 80;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, 'rgba(' + (150+Math.random()*30) + ',' + (140+Math.random()*30) + ',' + (130+Math.random()*30) + ',0.25)');
        g.addColorStop(1, 'rgba(150,140,130,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    for (let i = 0; i < 8; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        ctx.fillStyle = 'rgba(20,15,10,0.7)';
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let j = 0; j < 6; j++) {
            const nx = x + (Math.random() - 0.5) * 30;
            const ny = y + (Math.random() - 0.5) * 30;
            ctx.lineTo(nx, ny);
        }
        ctx.closePath();
        ctx.fill();
    }

    addStains(ctx, w, h, 15);

    for (let i = 0; i < 5; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 8 + Math.random() * 25;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, 'rgba(70,20,15,0.5)');
        g.addColorStop(1, 'rgba(70,20,15,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
};

/* =========================================================
   材质 16：室内墙面
   ========================================================= */
TEXTURES.wallInterior = function() {
    const w = 512, h = 512;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#7a7a72';
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 15; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const rw = 80 + Math.random() * 150;
        const rh = 80 + Math.random() * 150;
        const v = Math.random() * 20 - 10;
        ctx.fillStyle = 'rgba(' + (122+v) + ',' + (122+v) + ',' + (114+v) + ',0.35)';
        ctx.fillRect(x, y, rw, rh);
    }

    addNoise(ctx, w, h, 12000, 0.18, '40,40,35');
    addNoise(ctx, w, h, 6000, 0.1, '150,145,135');
    addWaterDrip(ctx, w, h, 6);
    addStains(ctx, w, h, 12);
    addCracks(ctx, w, h, 6, 20);

    const g = ctx.createLinearGradient(0, h * 0.85, 0, h);
    g.addColorStop(0, 'rgba(40,35,30,0)');
    g.addColorStop(1, 'rgba(40,35,30,0.5)');
    ctx.fillStyle = g;
    ctx.fillRect(0, h * 0.85, w, h * 0.15);

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 4;
    return tex;
};

/* =========================================================
   材质缓存
   ========================================================= */
const _texCache = {};
function getTexture(name) {
    if (_texCache[name]) return _texCache[name];
    if (!TEXTURES[name]) {
        console.warn('材质不存在:', name);
        return null;
    }
    _texCache[name] = TEXTURES[name]();
    return _texCache[name];
}

window.TEXTURES = TEXTURES;
window.getTexture = getTexture;