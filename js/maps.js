/* =========================================================
   maps.js
   真实场景数据 · 细节 · 生活痕迹
   性能优化版：3 个工具函数内部换实现，视觉不变
   ========================================================= */

window.MAPS = {};

/* ---------- 工具函数 ---------- */
function buildWall(scene, x, y, z, w, h, d, tex, color) {
    const mat = new THREE.MeshStandardMaterial({
        map: tex, roughness: 0.9, metalness: 0.05,
        color: color || 0xffffff
    });
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    wall.position.set(x, y, z);
    scene.add(wall);
    return wall;
}

function buildFloor(scene, x, y, z, w, d, tex, color) {
    const mat = new THREE.MeshStandardMaterial({
        map: tex, roughness: 0.95, metalness: 0.05,
        color: color || 0xffffff
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(x, y, z);
    floor.receiveShadow = true;
    scene.add(floor);
    return floor;
}

function buildCeiling(scene, x, y, z, w, d, tex) {
    const mat = new THREE.MeshStandardMaterial({
        map: tex, roughness: 0.95, color: 0x555555,
        side: THREE.DoubleSide
    });
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(x, y, z);
    scene.add(ceil);
    return ceil;
}

function buildRoom(scene, cx, cz, w, d, h, tex, opts) {
    opts = opts || {};
    const t = 0.3;
    const y = h / 2;

    if (!opts.noNorth) {
        if (opts.doorNorth) {
            const doorW = opts.doorNorth.w || 1.2;
            const doorH = opts.doorNorth.h || 2.2;
            const leftW = (w - doorW) / 2;
            buildWall(scene, cx - w/2 + leftW/2, y, cz - d/2, leftW, h, t, tex);
            buildWall(scene, cx + w/2 - leftW/2, y, cz - d/2, leftW, h, t, tex);
            buildWall(scene, cx, doorH + (h - doorH)/2, cz - d/2, doorW, h - doorH, t, tex);
        } else {
            buildWall(scene, cx, y, cz - d/2, w, h, t, tex);
        }
    }
    if (!opts.noSouth) {
        if (opts.doorSouth) {
            const doorW = opts.doorSouth.w || 1.2;
            const doorH = opts.doorSouth.h || 2.2;
            const leftW = (w - doorW) / 2;
            buildWall(scene, cx - w/2 + leftW/2, y, cz + d/2, leftW, h, t, tex);
            buildWall(scene, cx + w/2 - leftW/2, y, cz + d/2, leftW, h, t, tex);
            buildWall(scene, cx, doorH + (h - doorH)/2, cz + d/2, doorW, h - doorH, t, tex);
        } else {
            buildWall(scene, cx, y, cz + d/2, w, h, t, tex);
        }
    }
    if (!opts.noWest) {
        if (opts.doorWest) {
            const doorW = opts.doorWest.w || 1.2;
            const doorH = opts.doorWest.h || 2.2;
            const leftD = (d - doorW) / 2;
            buildWall(scene, cx - w/2, y, cz - d/2 + leftD/2, t, h, leftD, tex);
            buildWall(scene, cx - w/2, y, cz + d/2 - leftD/2, t, h, leftD, tex);
            buildWall(scene, cx - w/2, doorH + (h - doorH)/2, cz, t, h - doorH, doorW, tex);
        } else {
            buildWall(scene, cx - w/2, y, cz, t, h, d, tex);
        }
    }
    if (!opts.noEast) {
        if (opts.doorEast) {
            const doorW = opts.doorEast.w || 1.2;
            const doorH = opts.doorEast.h || 2.2;
            const leftD = (d - doorW) / 2;
            buildWall(scene, cx + w/2, y, cz - d/2 + leftD/2, t, h, leftD, tex);
            buildWall(scene, cx + w/2, y, cz + d/2 - leftD/2, t, h, leftD, tex);
            buildWall(scene, cx + w/2, doorH + (h - doorH)/2, cz, t, h - doorH, doorW, tex);
        } else {
            buildWall(scene, cx + w/2, y, cz, t, h, d, tex);
        }
    }
}

function buildPipe(scene, x1, y1, z1, x2, y2, z2, radius, tex) {
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, metalness: 0.6 });
    const dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
    const length = Math.sqrt(dx*dx + dy*dy + dz*dz);
    const geo = new THREE.CylinderGeometry(radius, radius, length, 8);
    const pipe = new THREE.Mesh(geo, mat);
    pipe.position.set((x1+x2)/2, (y1+y2)/2, (z1+z2)/2);
    const dir = new THREE.Vector3(dx, dy, dz).normalize();
    pipe.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    scene.add(pipe);
    return pipe;
}

function buildLight(scene, x, y, z, color, intensity, distance) {
    const light = new THREE.PointLight(color, intensity || 0.5, distance || 8);
    light.position.set(x, y, z);
    scene.add(light);
    return light;
}

function addInteract(scene, sceneId, id, x, y, z, w, h, d, label) {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w || 0.5, h || 0.5, d || 0.5),
        new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 })
    );
    mesh.position.set(x, y, z);
    scene.add(mesh);
    if (!window.MAPS[sceneId].interactables) window.MAPS[sceneId].interactables = [];
    window.MAPS[sceneId].interactables.push({ id: id, mesh: mesh, label: label });
    return mesh;
}

/* =========================================================
   工具：杂草（性能优化版 · 共享几何体和材质）
   ========================================================= */
var _grassMats = null;
var _grassGeo = null;
function _initGrassResources() {
    if (_grassMats) return;
    _grassGeo = new THREE.PlaneGeometry(1, 1);
    _grassMats = [0x3a4a2a, 0x2a3a1a, 0x4a4225, 0x5a4a2a].map(function(c) {
        return new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide });
    });
}

function addGrass(scene, x, z, scale) {
    scale = scale || 1;
    _initGrassResources();
    const count = 6 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
        const h = (0.25 + Math.random() * 0.45) * scale;
        const w = (0.06 + Math.random() * 0.08) * scale;
        const blade = new THREE.Mesh(
            _grassGeo,
            _grassMats[Math.floor(Math.random() * 4)]
        );
        blade.scale.set(w, h, 1);
        blade.position.set(
            x + (Math.random() - 0.5) * 0.6 * scale,
            h / 2,
            z + (Math.random() - 0.5) * 0.6 * scale
        );
        blade.rotation.y = Math.random() * Math.PI;
        blade.rotation.z = (Math.random() - 0.5) * 0.3;
        scene.add(blade);
    }
}

/* =========================================================
   工具：垃圾（性能优化版 · 共享材质）
   ========================================================= */
var _debrisMats = null;
function _initDebrisResources() {
    if (_debrisMats) return;
    _debrisMats = {
        paper: [0x8a8070, 0xa89880, 0x6a6050].map(function(c) {
            return new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide });
        }),
        leaf: [0x5a4020, 0x4a3a1a, 0x6a5030].map(function(c) {
            return new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide });
        }),
        butt: new THREE.MeshBasicMaterial({ color: 0xddddcc })
    };
}

function addDebris(scene, x, z, count) {
    count = count || 8;
    _initDebrisResources();
    for (let i = 0; i < count; i++) {
        const type = Math.random();
        if (type < 0.4) {
            const paper = new THREE.Mesh(
                new THREE.PlaneGeometry(0.15 + Math.random() * 0.15, 0.1 + Math.random() * 0.1),
                _debrisMats.paper[Math.floor(Math.random() * 3)]
            );
            paper.rotation.x = -Math.PI / 2;
            paper.rotation.z = Math.random() * Math.PI;
            paper.position.set(
                x + (Math.random() - 0.5) * 2,
                0.005,
                z + (Math.random() - 0.5) * 2
            );
            scene.add(paper);
        } else if (type < 0.7) {
            const leaf = new THREE.Mesh(
                new THREE.PlaneGeometry(0.1, 0.14),
                _debrisMats.leaf[Math.floor(Math.random() * 3)]
            );
            leaf.rotation.x = -Math.PI / 2;
            leaf.rotation.z = Math.random() * Math.PI;
            leaf.position.set(
                x + (Math.random() - 0.5) * 2,
                0.006,
                z + (Math.random() - 0.5) * 2
            );
            scene.add(leaf);
        } else {
            const butt = new THREE.Mesh(
                new THREE.CylinderGeometry(0.015, 0.02, 0.05, 6),
                _debrisMats.butt
            );
            butt.rotation.z = Math.PI / 2;
            butt.rotation.y = Math.random() * Math.PI;
            butt.position.set(
                x + (Math.random() - 0.5) * 2,
                0.015,
                z + (Math.random() - 0.5) * 2
            );
            scene.add(butt);
        }
    }
}

/* =========================================================
   工具：夜空（性能优化版 · 全局缓存）
   ========================================================= */
var _nightSkyTex = null;
var _nightSkyGeo = null;

function buildNightSky(scene) {
    if (!_nightSkyTex) {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        const grad = ctx.createLinearGradient(0, 0, 0, 1024);
        grad.addColorStop(0, '#03050a');
        grad.addColorStop(0.35, '#0a1020');
        grad.addColorStop(0.6, '#1a2030');
        grad.addColorStop(0.78, '#3a2e28');
        grad.addColorStop(0.88, '#4a3520');
        grad.addColorStop(1, '#2a1c10');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 2048, 1024);

        for (let i = 0; i < 600; i++) {
            const x = Math.random() * 2048;
            const y = Math.random() * 500;
            const r = Math.random() * 1.2;
            const a = Math.random() * 0.7 + 0.2;
            ctx.fillStyle = 'rgba(220,230,255,' + a + ')';
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        const moonX = 380;
        const moonY = 220;
        for (let i = 0; i < 5; i++) {
            const r = 40 + i * 35;
            const halo = ctx.createRadialGradient(moonX, moonY, 20, moonX, moonY, r);
            halo.addColorStop(0, 'rgba(220,225,240,0.18)');
            halo.addColorStop(1, 'rgba(220,225,240,0)');
            ctx.fillStyle = halo;
            ctx.beginPath();
            ctx.arc(moonX, moonY, r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = '#e8eaf0';
        ctx.beginPath();
        ctx.arc(moonX, moonY, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(180,185,200,0.5)';
        ctx.beginPath();
        ctx.arc(moonX - 8, moonY - 5, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(moonX + 10, moonY + 8, 6, 0, Math.PI * 2);
        ctx.fill();

        for (let i = 0; i < 40; i++) {
            const x = Math.random() * 2048;
            const y = 300 + Math.random() * 300;
            const w = 100 + Math.random() * 300;
            const h = 20 + Math.random() * 50;
            const g = ctx.createRadialGradient(x, y, 0, x, y, w);
            g.addColorStop(0, 'rgba(40,45,60,' + (0.3 + Math.random() * 0.3) + ')');
            g.addColorStop(1, 'rgba(40,45,60,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 2048;
            const y = 780 + Math.random() * 80;
            const r = 80 + Math.random() * 150;
            const g = ctx.createRadialGradient(x, y, 0, x, y, r);
            g.addColorStop(0, 'rgba(200,120,60,0.15)');
            g.addColorStop(1, 'rgba(200,120,60,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        _nightSkyTex = new THREE.CanvasTexture(canvas);
        _nightSkyTex.mapping = THREE.EquirectangularReflectionMapping;
        _nightSkyGeo = new THREE.SphereGeometry(150, 32, 24);
    }

    const skyMat = new THREE.MeshBasicMaterial({
        map: _nightSkyTex,
        side: THREE.BackSide,
        fog: false
    });
    const skyDome = new THREE.Mesh(_nightSkyGeo, skyMat);
    scene.add(skyDome);
    return skyDome;
}

/* =========================================================
   场景 1：江北大道 · 西段
   ========================================================= */
window.MAPS.road = {
    name: '江北大道 · 西段',
    ambient: 'road',

    build: function(scene) {
        const T = window.getTexture;

        buildNightSky(scene);

        const roadTex = T('asphalt');
        roadTex.repeat.set(2, 20);
        const roadMat = new THREE.MeshStandardMaterial({
            map: roadTex, roughness: 0.95, metalness: 0.08
        });
        const road = new THREE.Mesh(new THREE.PlaneGeometry(10, 120), roadMat);
        road.rotation.x = -Math.PI / 2;
        road.position.set(0, 0, 0);
        scene.add(road);

        const lineMat = new THREE.MeshStandardMaterial({ color: 0x9a9588, roughness: 0.9 });
        for (let z = -55; z < 60; z += 6) {
            const line = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 2.5), lineMat);
            line.rotation.x = -Math.PI / 2;
            line.position.set(0, 0.008, z);
            scene.add(line);
        }
        [-4.7, 4.7].forEach(function(x) {
            const line = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 115), lineMat);
            line.rotation.x = -Math.PI / 2;
            line.position.set(x, 0.008, 0);
            scene.add(line);
        });

        const manholeMat = new THREE.MeshStandardMaterial({ map: T('rustMetal'), roughness: 0.9, color: 0x3a3530 });
        [-15, 20, 45].forEach(function(z) {
            const manhole = new THREE.Mesh(
                new THREE.CylinderGeometry(0.4, 0.4, 0.05, 16),
                manholeMat
            );
            manhole.position.set(-3 + Math.random() * 2, 0.025, z);
            scene.add(manhole);
        });

        const gutterMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.95 });
        [-5.0, 5.0].forEach(function(x) {
            const gutter = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 118), gutterMat);
            gutter.position.set(x, 0.01, 0);
            scene.add(gutter);
        });

        const curbMat = new THREE.MeshStandardMaterial({ map: T('concrete'), roughness: 0.95, color: 0x8a8880 });
        [-5.3, 5.3].forEach(function(x) {
            const curb = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 118), curbMat);
            curb.position.set(x, 0.125, 0);
            scene.add(curb);
        });

        const walkTex = T('cementFloor');
        walkTex.repeat.set(2, 30);
        const walkMat = new THREE.MeshStandardMaterial({ map: walkTex, roughness: 0.95 });
        [-6.6, 6.6].forEach(function(x) {
            const walk = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 118), walkMat);
            walk.rotation.x = -Math.PI / 2;
            walk.position.set(x, 0.22, 0);
            scene.add(walk);
        });

        const blindMat = new THREE.MeshStandardMaterial({ color: 0x8a7a3a, roughness: 0.9 });
        [-6.6, 6.6].forEach(function(x) {
            const blind = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 118), blindMat);
            blind.rotation.x = -Math.PI / 2;
            blind.position.set(x + (x > 0 ? 0.8 : -0.8), 0.225, 0);
            scene.add(blind);
        });

        const dirtTex = T('dirtGround');
        dirtTex.repeat.set(10, 30);
        const dirtMat = new THREE.MeshStandardMaterial({ map: dirtTex, roughness: 1.0 });
        [-22, 22].forEach(function(x) {
            const dirt = new THREE.Mesh(new THREE.PlaneGeometry(28, 118), dirtMat);
            dirt.rotation.x = -Math.PI / 2;
            dirt.position.set(x, 0.02, 0);
            scene.add(dirt);
        });

        for (let i = 0; i < 60; i++) {
            const side = Math.random() < 0.5 ? -1 : 1;
            const x = side * (8.5 + Math.random() * 10);
            const z = -55 + Math.random() * 110;
            addGrass(scene, x, z, 0.8 + Math.random() * 0.6);
        }

        for (let i = 0; i < 30; i++) {
            const side = Math.random() < 0.5 ? -1 : 1;
            const x = side * (7 + Math.random() * 8);
            const z = -55 + Math.random() * 110;
            addDebris(scene, x, z, 5);
        }

        const rockMat = new THREE.MeshStandardMaterial({ map: T('concrete'), roughness: 0.95, color: 0x505050 });
        for (let i = 0; i < 40; i++) {
            const size = 0.1 + Math.random() * 0.3;
            const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(size, 0), rockMat);
            const side = Math.random() < 0.5 ? -1 : 1;
            rock.position.set(side * (7 + Math.random() * 10), size / 2, -55 + Math.random() * 110);
            rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            scene.add(rock);
        }

        const tireMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.95 });
        [-25, 15, 50].forEach(function(z) {
            const tire = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.15, 8, 16), tireMat);
            tire.rotation.x = Math.PI / 2;
            tire.position.set(-11 + Math.random() * 3, 0.15, z);
            scene.add(tire);
        });

        const concreteTex = T('concrete');
        concreteTex.repeat.set(4, 4);
        const concreteMat = new THREE.MeshStandardMaterial({ map: concreteTex, roughness: 0.9, metalness: 0.05 });

        const mainBuilding = new THREE.Mesh(new THREE.BoxGeometry(24, 20, 16), concreteMat);
        mainBuilding.position.set(0, 10, -70);
        scene.add(mainBuilding);

        for (let row = 0; row < 7; row++) {
            for (let col = 0; col < 9; col++) {
                const isLit = Math.random() < 0.12;
                const win = new THREE.Mesh(
                    new THREE.PlaneGeometry(1.1, 1.3),
                    new THREE.MeshBasicMaterial({
                        color: isLit ? 0xffcc66 : 0x0a1018,
                        fog: true
                    })
                );
                win.position.set(-10 + col * 2.5, 2.5 + row * 2.6, -61.9);
                scene.add(win);
            }
        }

        for (let row = 0; row < 7; row++) {
            for (let col = 0; col < 5; col++) {
                const isLit = Math.random() < 0.1;
                const win = new THREE.Mesh(
                    new THREE.PlaneGeometry(1.1, 1.3),
                    new THREE.MeshBasicMaterial({
                        color: isLit ? 0xffcc66 : 0x0a1018
                    })
                );
                win.rotation.y = Math.PI / 2;
                win.position.set(12.1, 2.5 + row * 2.6, -75 + col * 2.5);
                scene.add(win);
            }
        }

        const annex = new THREE.Mesh(new THREE.BoxGeometry(12, 9, 10), concreteMat);
        annex.position.set(-24, 4.5, -64);
        scene.add(annex);

        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 4; col++) {
                const isLit = Math.random() < 0.15;
                const win = new THREE.Mesh(
                    new THREE.PlaneGeometry(1, 1.2),
                    new THREE.MeshBasicMaterial({
                        color: isLit ? 0xffcc66 : 0x0a1018
                    })
                );
                win.position.set(-27 + col * 2.5, 1.8 + row * 2.4, -58.9);
                scene.add(win);
            }
        }

        function buildChimney(x, z, h) {
            const chimney = new THREE.Mesh(
                new THREE.CylinderGeometry(1.5, 2.2, h, 20),
                concreteMat
            );
            chimney.position.set(x, h / 2, z);
            scene.add(chimney);

            const stripeMat = new THREE.MeshStandardMaterial({ color: 0xaa3322, roughness: 0.9 });
            for (let i = 0; i < 5; i++) {
                const stripe = new THREE.Mesh(
                    new THREE.CylinderGeometry(2.05, 2.05, 1.8, 20, 1, true),
                    stripeMat
                );
                stripe.position.set(x, h * 0.35 + i * 5.5, z);
                scene.add(stripe);
            }

            for (let i = 0; i < 4; i++) {
                const smoke = new THREE.Mesh(
                    new THREE.SphereGeometry(2 + i * 0.8, 8, 6),
                    new THREE.MeshBasicMaterial({
                        color: 0x2a2a2a,
                        transparent: true,
                        opacity: 0.3 - i * 0.05,
                        depthWrite: false
                    })
                );
                smoke.position.set(x + i * 1.5, h + 2 + i * 2, z);
                scene.add(smoke);
            }
        }

        buildChimney(-14, -75, 45);
        buildChimney(14, -75, 45);

        const fenceMat = new THREE.MeshStandardMaterial({ map: T('concrete'), roughness: 0.95, color: 0x707068 });
        const fence = new THREE.Mesh(new THREE.BoxGeometry(80, 2.8, 0.4), fenceMat);
        fence.position.set(0, 1.4, -55);
        scene.add(fence);

        const wireMat = new THREE.MeshBasicMaterial({ color: 0x3a3a3a });
        for (let i = 0; i < 30; i++) {
            const wire = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.8, 0.02), wireMat);
            wire.position.set(-38 + i * 2.6, 3.2, -55);
            scene.add(wire);
        }
        for (let i = 0; i < 3; i++) {
            const wire = new THREE.Mesh(new THREE.BoxGeometry(80, 0.02, 0.02), wireMat);
            wire.position.set(0, 3 + i * 0.3, -55);
            scene.add(wire);
        }

        const poleWoodMat = new THREE.MeshStandardMaterial({ color: 0x3a3025, roughness: 0.95 });
        const poleGeo = new THREE.CylinderGeometry(0.15, 0.22, 9, 10);

        const poleZ = [-35, -5, 25, 55];
        poleZ.forEach(function(z) {
            const pole = new THREE.Mesh(poleGeo, poleWoodMat);
            pole.position.set(-8.5, 4.5, z);
            scene.add(pole);

            const arm = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 0.1), poleWoodMat);
            arm.position.set(-8.5, 8.3, z);
            scene.add(arm);

            [-1, 0, 1].forEach(function(dx) {
                const insulator = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.07, 0.09, 0.15, 8),
                    new THREE.MeshStandardMaterial({ color: 0xd8d8d0, roughness: 0.5 })
                );
                insulator.position.set(-8.5 + dx, 8.4, z);
                scene.add(insulator);
            });
        });

        for (let i = 0; i < poleZ.length - 1; i++) {
            const z1 = poleZ[i];
            const z2 = poleZ[i + 1];
            [-1, 0, 1].forEach(function(dx) {
                const curve = new THREE.CatmullRomCurve3([
                    new THREE.Vector3(-8.5 + dx, 8.4, z1),
                    new THREE.Vector3(-8.5 + dx, 7.8, (z1 + z2) / 2),
                    new THREE.Vector3(-8.5 + dx, 8.4, z2)
                ]);
                const tube = new THREE.Mesh(
                    new THREE.TubeGeometry(curve, 20, 0.03, 6, false),
                    new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.9 })
                );
                scene.add(tube);
            });
        }

        const lampPoleMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.8, metalness: 0.6 });
        [-20, 20, 60].forEach(function(z) {
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 6.5, 10), lampPoleMat);
            pole.position.set(7.5, 3.25, z);
            scene.add(pole);

            const armCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(7.5, 6.5, z),
                new THREE.Vector3(7.5, 6.8, z),
                new THREE.Vector3(6.8, 6.8, z)
            ]);
            const arm = new THREE.Mesh(
                new THREE.TubeGeometry(armCurve, 8, 0.06, 6, false),
                lampPoleMat
            );
            scene.add(arm);

            const shade = new THREE.Mesh(
                new THREE.ConeGeometry(0.3, 0.2, 8),
                new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.7 })
            );
            shade.position.set(6.8, 6.7, z);
            scene.add(shade);

            const bulb = new THREE.Mesh(
                new THREE.SphereGeometry(0.13, 10, 10),
                new THREE.MeshBasicMaterial({ color: 0xffd080 })
            );
            bulb.position.set(6.8, 6.55, z);
            scene.add(bulb);

            const light = new THREE.PointLight(0xffcc80, 1.2, 14);
            light.position.set(6.8, 6.4, z);
            scene.add(light);

            const pool = new THREE.Mesh(
                new THREE.CircleGeometry(2.5, 32),
                new THREE.MeshBasicMaterial({
                    color: 0xffcc80,
                    transparent: true,
                    opacity: 0.06,
                    depthWrite: false
                })
            );
            pool.rotation.x = -Math.PI / 2;
            pool.position.set(6.5, 0.23, z);
            scene.add(pool);
        });

        const signCanvas = document.createElement('canvas');
        signCanvas.width = 512;
        signCanvas.height = 256;
        const sctx = signCanvas.getContext('2d');
        sctx.fillStyle = '#2a4a2a';
        sctx.fillRect(0, 0, 512, 256);
        sctx.strokeStyle = '#e8e0d0';
        sctx.lineWidth = 6;
        sctx.strokeRect(14, 14, 484, 228);
        sctx.fillStyle = '#e8e0d0';
        sctx.font = 'bold 52px sans-serif';
        sctx.textAlign = 'center';
        sctx.fillText('城北工业区', 256, 95);
        sctx.font = '32px sans-serif';
        sctx.fillStyle = '#c9a877';
        sctx.fillText('老电厂 → 1.2km', 256, 160);
        sctx.fillText('化工厂 → 2.8km', 256, 210);
        const signTex = new THREE.CanvasTexture(signCanvas);

        const signGroup = new THREE.Group();
        const signPole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.2, 10), lampPoleMat);
        signPole.position.y = 1.6;
        signGroup.add(signPole);

        const signBoard = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 0.9, 0.06),
            new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.85, metalness: 0.15 })
        );
        signBoard.position.y = 2.7;
        signGroup.add(signBoard);

        signGroup.position.set(-6.8, 0, 16);
        signGroup.rotation.y = Math.PI / 8;
        scene.add(signGroup);

        const signLight = new THREE.PointLight(0xffcc80, 0.7, 5);
        signLight.position.set(-6.8, 2.2, 16);
        scene.add(signLight);

        const brokenWire = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-8.5, 7.5, -5),
            new THREE.Vector3(-8.0, 5, -2),
            new THREE.Vector3(-7.5, 2, 2),
            new THREE.Vector3(-7.2, 0.3, 5)
        ]);
        const brokenTube = new THREE.Mesh(
            new THREE.TubeGeometry(brokenWire, 30, 0.03, 6, false),
            new THREE.MeshStandardMaterial({ color: 0x0a0a0a })
        );
        scene.add(brokenTube);

        const spark = new THREE.Mesh(
            new THREE.CircleGeometry(0.4, 16),
            new THREE.MeshBasicMaterial({
                color: 0x1a0a00,
                transparent: true,
                opacity: 0.5,
                depthWrite: false
            })
        );
        spark.rotation.x = -Math.PI / 2;
        spark.position.set(-7.2, 0.24, 5);
        scene.add(spark);

        addInteract(scene, 'road', 'road_sign', -6.8, 2.7, 16, 1.8, 0.9, 0.3, '查看路牌');
    },

    colliders: [
        { minX: -12, maxX: 12, minZ: -78, maxZ: -61 },
        { minX: -30, maxX: -18, minZ: -69, maxZ: -59 },
        { minX: -40, maxX: 40, minZ: -55.5, maxZ: -54.5 },
        { minX: -8.8, maxX: -8.2, minZ: -35.3, maxZ: -34.7 },
        { minX: -8.8, maxX: -8.2, minZ: -5.3, maxZ: -4.7 },
        { minX: -8.8, maxX: -8.2, minZ: 24.7, maxZ: 25.3 },
        { minX: -8.8, maxX: -8.2, minZ: 54.7, maxZ: 55.3 },
        { minX: 7.3, maxX: 7.7, minZ: -20.3, maxZ: -19.7 },
        { minX: 7.3, maxX: 7.7, minZ: 19.7, maxZ: 20.3 },
        { minX: 7.3, maxX: 7.7, minZ: 59.7, maxZ: 60.3 },
        { minX: -7.0, maxX: -6.6, minZ: 15.8, maxZ: 16.2 }
    ],

    interactables: [],

    exits: [
        { x: 0, z: -55, w: 3, d: 3, to: 'gate',
          pos: { x: 0, y: 0, z: 10 }, yaw: 0 }
    ],

    onEnter: {
        name: '',
        text: '江北大道西段。\n\n路两边是荒地。\n远处能看到老电厂的烟囱。\n\n月光很淡。'
    }
};
/* =========================================================
   场景 2：老电厂 · 大门
   ========================================================= */
window.MAPS.gate = {
    name: '老电厂 · 大门',
    ambient: 'outside',

    build: function(scene) {
        const T = window.getTexture;

        buildNightSky(scene);

        const dirtTex = T('dirtGround');
        dirtTex.repeat.set(12, 12);
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(80, 80),
            new THREE.MeshStandardMaterial({ map: dirtTex, roughness: 1.0 })
        );
        ground.rotation.x = -Math.PI / 2;
        scene.add(ground);

        const trackMat = new THREE.MeshBasicMaterial({
            color: 0x1a1408,
            transparent: true,
            opacity: 0.35,
            depthWrite: false
        });
        [-2.5, 2.5].forEach(function(x) {
            const track = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 40), trackMat);
            track.rotation.x = -Math.PI / 2;
            track.position.set(x, 0.015, 0);
            scene.add(track);
        });

        const puddleMat = new THREE.MeshStandardMaterial({
            color: 0x0a1420,
            roughness: 0.1,
            metalness: 0.6,
            transparent: true,
            opacity: 0.85
        });
        [[-3, 8], [5, -12], [-8, 15], [2, 20]].forEach(function(p) {
            const puddle = new THREE.Mesh(new THREE.CircleGeometry(0.8 + Math.random() * 0.6, 16), puddleMat);
            puddle.rotation.x = -Math.PI / 2;
            puddle.position.set(p[0], 0.018, p[1]);
            scene.add(puddle);
        });

        for (let i = 0; i < 50; i++) {
            const x = (Math.random() - 0.5) * 70;
            const z = (Math.random() - 0.5) * 60;
            if (Math.abs(x) < 5 && Math.abs(z) < 20) continue;
            addGrass(scene, x, z, 0.9 + Math.random() * 0.5);
        }

        for (let i = 0; i < 25; i++) {
            const x = (Math.random() - 0.5) * 60;
            const z = (Math.random() - 0.5) * 50;
            addDebris(scene, x, z, 4);
        }

        const concreteTex = T('concrete');
        concreteTex.repeat.set(5, 5);
        const concreteMat = new THREE.MeshStandardMaterial({ map: concreteTex, roughness: 0.9, metalness: 0.05 });

        const mainBuilding = new THREE.Mesh(new THREE.BoxGeometry(40, 22, 20), concreteMat);
        mainBuilding.position.set(0, 11, -35);
        scene.add(mainBuilding);

        for (let row = 0; row < 7; row++) {
            for (let col = 0; col < 14; col++) {
                const isLit = Math.random() < 0.08;
                const win = new THREE.Mesh(
                    new THREE.PlaneGeometry(1.4, 1.6),
                    new THREE.MeshBasicMaterial({
                        color: isLit ? 0xffcc66 : 0x0a1018
                    })
                );
                win.position.set(-18 + col * 2.8, 2.5 + row * 2.8, -24.9);
                scene.add(win);
            }
        }

        const awning = new THREE.Mesh(
            new THREE.BoxGeometry(6, 0.2, 3),
            new THREE.MeshStandardMaterial({ map: T('rustMetal'), roughness: 0.9, color: 0x4a3a2a })
        );
        awning.position.set(0, 3.5, -22.5);
        scene.add(awning);

        [-2.5, 2.5].forEach(function(x) {
            const pole = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.08, 3.5, 8),
                new THREE.MeshStandardMaterial({ color: 0x2a2a2a })
            );
            pole.position.set(x, 1.75, -21.5);
            scene.add(pole);
        });

        function buildChimney(x, z, h) {
            const chimney = new THREE.Mesh(
                new THREE.CylinderGeometry(1.8, 2.4, h, 20),
                concreteMat
            );
            chimney.position.set(x, h / 2, z);
            scene.add(chimney);

            const stripeMat = new THREE.MeshStandardMaterial({ color: 0xaa3322, roughness: 0.9 });
            for (let i = 0; i < 6; i++) {
                const stripe = new THREE.Mesh(
                    new THREE.CylinderGeometry(2.24, 2.24, 1.8, 20, 1, true),
                    stripeMat
                );
                stripe.position.set(x, h * 0.3 + i * 5.5, z);
                scene.add(stripe);
            }

            const cap = new THREE.Mesh(
                new THREE.CylinderGeometry(2.0, 2.0, 0.5, 20),
                new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.9 })
            );
            cap.position.set(x, h + 0.25, z);
            scene.add(cap);

            for (let i = 0; i < 5; i++) {
                const smoke = new THREE.Mesh(
                    new THREE.SphereGeometry(2 + i * 0.8, 8, 6),
                    new THREE.MeshBasicMaterial({
                        color: 0x2a2a2a,
                        transparent: true,
                        opacity: 0.28 - i * 0.05,
                        depthWrite: false
                    })
                );
                smoke.position.set(x + i * 1.8, h + 3 + i * 2, z);
                scene.add(smoke);
            }
        }

        buildChimney(-14, -40, 48);
        buildChimney(14, -40, 48);

        const fenceMat = new THREE.MeshStandardMaterial({ map: T('concrete'), roughness: 0.95, color: 0x8a8878 });

        const wallL = new THREE.Mesh(new THREE.BoxGeometry(26, 3.2, 0.4), fenceMat);
        wallL.position.set(-18, 1.6, 0);
        scene.add(wallL);

        const wallR = new THREE.Mesh(new THREE.BoxGeometry(26, 3.2, 0.4), fenceMat);
        wallR.position.set(18, 1.6, 0);
        scene.add(wallR);

        for (let i = 0; i < 8; i++) {
            const stain = new THREE.Mesh(
                new THREE.PlaneGeometry(1 + Math.random() * 1.5, 0.8 + Math.random() * 1.2),
                new THREE.MeshBasicMaterial({
                    color: 0x2a2518,
                    transparent: true,
                    opacity: 0.5,
                    depthWrite: false
                })
            );
            const side = Math.random() < 0.5 ? -1 : 1;
            stain.position.set(side * 18 + side * 0.21, 1 + Math.random() * 1.5, (Math.random() - 0.5) * 25);
            stain.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
            scene.add(stain);
        }

        const sloganCanvas = document.createElement('canvas');
        sloganCanvas.width = 1024;
        sloganCanvas.height = 256;
        const sctx = sloganCanvas.getContext('2d');
        sctx.fillStyle = '#8a8878';
        sctx.fillRect(0, 0, 1024, 256);
        for (let i = 0; i < 200; i++) {
            sctx.fillStyle = 'rgba(60,55,45,' + (Math.random() * 0.3) + ')';
            sctx.fillRect(Math.random() * 1024, Math.random() * 256, Math.random() * 40, Math.random() * 20);
        }
        sctx.fillStyle = 'rgba(180,40,30,0.55)';
        sctx.font = 'bold 120px sans-serif';
        sctx.textAlign = 'center';
        sctx.fillText('安全第一', 512, 160);
        for (let i = 0; i < 30; i++) {
            sctx.fillStyle = 'rgba(140,135,120,' + (0.5 + Math.random() * 0.4) + ')';
            sctx.fillRect(Math.random() * 1024, 60 + Math.random() * 100, 20 + Math.random() * 60, 5 + Math.random() * 15);
        }
        const sloganTex = new THREE.CanvasTexture(sloganCanvas);

        const slogan = new THREE.Mesh(
            new THREE.PlaneGeometry(12, 3),
            new THREE.MeshStandardMaterial({ map: sloganTex, roughness: 0.9 })
        );
        slogan.position.set(-18, 1.8, 0.22);
        scene.add(slogan);

        const ironMat = new THREE.MeshStandardMaterial({
            map: T('rustMetal'),
            roughness: 0.85,
            metalness: 0.6,
            color: 0x5a4a3a
        });

        const gateGroup = new THREE.Group();

        [-3.5, 3.5].forEach(function(x) {
            const post = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.5, 0.3), ironMat);
            post.position.set(x, 2.25, 0);
            gateGroup.add(post);
        });

        const topBeam = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.3, 0.3), ironMat);
        topBeam.position.set(0, 4.5, 0);
        gateGroup.add(topBeam);

        for (let i = 0; i < 6; i++) {
            const bar = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.08, 0.08), ironMat);
            bar.position.set(0, 0.5 + i * 0.7, 0);
            gateGroup.add(bar);
        }

        for (let i = -6; i <= 6; i++) {
            const bar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 4, 0.08), ironMat);
            bar.position.set(i * 0.5, 2, 0);
            gateGroup.add(bar);
        }

        const chainMat = new THREE.MeshStandardMaterial({ color: 0x4a4030, roughness: 0.7, metalness: 0.8 });
        const lock = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.2, 0.08), chainMat);
        lock.position.set(0, 2.3, 0.1);
        gateGroup.add(lock);

        for (let i = 0; i < 4; i++) {
            const link = new THREE.Mesh(
                new THREE.TorusGeometry(0.06, 0.02, 6, 8),
                chainMat
            );
            link.position.set(0.3 + i * 0.1, 2.3 + i * 0.05, 0.1);
            link.rotation.x = Math.PI / 2;
            gateGroup.add(link);
        }

        const plateCanvas = document.createElement('canvas');
        plateCanvas.width = 256;
        plateCanvas.height = 128;
        const pctx = plateCanvas.getContext('2d');
        pctx.fillStyle = '#2a1a0a';
        pctx.fillRect(0, 0, 256, 128);
        pctx.fillStyle = '#c9a877';
        pctx.font = 'bold 28px sans-serif';
        pctx.textAlign = 'center';
        pctx.fillText('闲人免进', 128, 55);
        pctx.font = '18px sans-serif';
        pctx.fillText('临江市第二发电厂', 128, 95);
        const plateTex = new THREE.CanvasTexture(plateCanvas);
        const plate = new THREE.Mesh(
            new THREE.PlaneGeometry(0.8, 0.4),
            new THREE.MeshStandardMaterial({ map: plateTex, roughness: 0.9 })
        );
        plate.position.set(0, 3.5, 0.05);
        gateGroup.add(plate);

        scene.add(gateGroup);

        const pillarMat = new THREE.MeshStandardMaterial({ map: T('concrete'), roughness: 0.95, color: 0x8a8a80 });
        [-4, 4].forEach(function(x) {
            const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5, 0.8), pillarMat);
            pillar.position.set(x, 2.5, 0);
            scene.add(pillar);

            const ball = new THREE.Mesh(
                new THREE.SphereGeometry(0.5, 16, 12),
                new THREE.MeshStandardMaterial({ color: 0x707068, roughness: 0.9 })
            );
            ball.position.set(x, 5.3, 0);
            scene.add(ball);
        });

        const guardGroup = new THREE.Group();

        const brickCanvas = document.createElement('canvas');
        brickCanvas.width = 512;
        brickCanvas.height = 512;
        const bctx = brickCanvas.getContext('2d');
        bctx.fillStyle = '#5a4030';
        bctx.fillRect(0, 0, 512, 512);
        const brickW = 64, brickH = 32;
        for (let y = 0; y < 512; y += brickH) {
            for (let x = 0; x < 512; x += brickW) {
                const offset = (Math.floor(y / brickH) % 2) * brickW / 2;
                const bx = x + offset;
                const v = Math.random() * 20 - 10;
                bctx.fillStyle = 'rgba(' + (90+v) + ',' + (55+v) + ',' + (40+v) + ',0.6)';
                bctx.fillRect(bx + 2, y + 2, brickW - 4, brickH - 4);
            }
        }
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const r = 30 + Math.random() * 80;
            const g = bctx.createRadialGradient(x, y, 0, x, y, r);
            g.addColorStop(0, 'rgba(30,25,15,0.4)');
            g.addColorStop(1, 'rgba(30,25,15,0)');
            bctx.fillStyle = g;
            bctx.fillRect(0, 0, 512, 512);
        }
        const brickTex = new THREE.CanvasTexture(brickCanvas);
        brickTex.wrapS = brickTex.wrapT = THREE.RepeatWrapping;
        brickTex.repeat.set(2, 2);

        const guardWall = new THREE.Mesh(
            new THREE.BoxGeometry(5, 3.2, 4),
            new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.95 })
        );
        guardWall.position.set(0, 1.6, 0);
        guardGroup.add(guardWall);

        const windowHole = new THREE.Mesh(
            new THREE.PlaneGeometry(1.4, 1.0),
            new THREE.MeshBasicMaterial({ color: 0x0a1420 })
        );
        windowHole.position.set(-1.4, 1.9, 2.01);
        guardGroup.add(windowHole);

        const frameMat = new THREE.MeshStandardMaterial({ color: 0x3a3025, roughness: 0.9 });
        const frameTop = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 0.08), frameMat);
        frameTop.position.set(-1.4, 2.42, 2.02);
        guardGroup.add(frameTop);
        const frameBot = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 0.08), frameMat);
        frameBot.position.set(-1.4, 1.38, 2.02);
        guardGroup.add(frameBot);
        const frameMid = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.05, 0.08), frameMat);
        frameMid.position.set(-1.4, 1.9, 2.02);
        guardGroup.add(frameMid);

        const doorMesh = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 2.2, 0.08),
            new THREE.MeshStandardMaterial({ map: T('wood'), roughness: 0.9, color: 0x3a2a1a })
        );
        doorMesh.position.set(0.8, 1.1, 2.02);
        guardGroup.add(doorMesh);

        const handle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 0.15, 8),
            new THREE.MeshStandardMaterial({ color: 0x8a7a50, roughness: 0.5, metalness: 0.8 })
        );
        handle.rotation.z = Math.PI / 2;
        handle.position.set(1.3, 1.1, 2.07);
        guardGroup.add(handle);

        const roof = new THREE.Mesh(
            new THREE.BoxGeometry(5.6, 0.25, 4.6),
            new THREE.MeshStandardMaterial({ map: T('rustMetal'), roughness: 0.9, color: 0x4a3a2a })
        );
        roof.position.set(0, 3.32, 0);
        guardGroup.add(roof);

        const roofLamp = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0x8a8a60 })
        );
        roofLamp.position.set(0, 3.55, 1);
        guardGroup.add(roofLamp);

        guardGroup.position.set(-10, 0, 3);
        scene.add(guardGroup);

        const guardLight = new THREE.PointLight(0xffaa66, 0.4, 5);
        guardLight.position.set(-10, 1.9, 3);
        scene.add(guardLight);

        const lampPoleMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.8, metalness: 0.6 });
        const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 7, 12), lampPoleMat);
        lampPole.position.set(6, 3.5, 2);
        scene.add(lampPole);

        const armCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(6, 7, 2),
            new THREE.Vector3(6, 7.3, 2),
            new THREE.Vector3(5.2, 7.3, 2)
        ]);
        const lampArm = new THREE.Mesh(
            new THREE.TubeGeometry(armCurve, 8, 0.07, 6, false),
            lampPoleMat
        );
        scene.add(lampArm);

        const shade = new THREE.Mesh(
            new THREE.ConeGeometry(0.35, 0.25, 10),
            new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 })
        );
        shade.position.set(5.2, 7.15, 2);
        scene.add(shade);

        const bulb = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 12, 12),
            new THREE.MeshBasicMaterial({ color: 0xffd080 })
        );
        bulb.position.set(5.2, 7.0, 2);
        scene.add(bulb);

        const lampLight = new THREE.PointLight(0xffcc80, 1.5, 18);
        lampLight.position.set(5.2, 6.8, 2);
        scene.add(lampLight);

        const pool = new THREE.Mesh(
            new THREE.CircleGeometry(3.5, 32),
            new THREE.MeshBasicMaterial({
                color: 0xffcc80,
                transparent: true,
                opacity: 0.08,
                depthWrite: false
            })
        );
        pool.rotation.x = -Math.PI / 2;
        pool.position.set(5, 0.02, 2);
        scene.add(pool);

        const bikeMat = new THREE.MeshStandardMaterial({ map: T('rustMetal'), roughness: 0.9, color: 0x3a2a1a });
        const wheel1 = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.04, 8, 20), bikeMat);
        wheel1.rotation.x = Math.PI / 2;
        wheel1.position.set(-14, 0.35, 5);
        scene.add(wheel1);

        const wheel2 = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.04, 8, 20), bikeMat);
        wheel2.rotation.x = Math.PI / 2;
        wheel2.rotation.z = Math.PI / 6;
        wheel2.position.set(-13.2, 0.35, 5.8);
        scene.add(wheel2);

        const bikeFrame = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.05, 0.05),
            bikeMat
        );
        bikeFrame.position.set(-13.6, 0.55, 5.4);
        bikeFrame.rotation.y = Math.PI / 8;
        scene.add(bikeFrame);

        addInteract(scene, 'gate', 'gate_iron', 0, 2.25, 0, 6.5, 4, 0.5, '推开铁门');
        addInteract(scene, 'gate', 'gate_guard', -10, 1.6, 3, 5, 3.2, 4, '查看门卫室');
    },

    colliders: [
        { minX: -20, maxX: 20, minZ: -45, maxZ: -25 },
        { minX: -31, maxX: -5, minZ: -0.4, maxZ: 0.4 },
        { minX: 5, maxX: 31, minZ: -0.4, maxZ: 0.4 },
        { minX: -4.4, maxX: -3.6, minZ: -0.4, maxZ: 0.4 },
        { minX: 3.6, maxX: 4.4, minZ: -0.4, maxZ: 0.4 },
        { minX: -12.5, maxX: -7.5, minZ: 1, maxZ: 5 },
        { minX: 5.85, maxX: 6.15, minZ: 1.85, maxZ: 2.15 }
    ],

    interactables: [],

    exits: [
        { x: 0, z: 15, w: 3, d: 3, to: 'road',
          pos: { x: 0, y: 0, z: -50 }, yaw: Math.PI },
        { x: 0, z: -22, w: 4, d: 3, to: 'main_hall',
          pos: { x: 0, y: 0, z: 2 }, yaw: 0 }
    ],

    onEnter: {
        name: '',
        text: '老电厂大门。\n\n铁门锈得厉害。\n门卫室的门虚掩着。'
    }
};

/* =========================================================
   场景 3：老电厂 · 主楼大厅
   ========================================================= */
window.MAPS.main_hall = {
    name: '老电厂 · 主楼大厅',
    ambient: 'powerplant',

    build: function(scene) {
        const T = window.getTexture;
        const w = 20, d = 15, h = 6;

        const tileTex = T('oldTile');
        tileTex.repeat.set(8, 6);
        const floorMat = new THREE.MeshStandardMaterial({
            map: tileTex, roughness: 0.9, metalness: 0.1
        });
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), floorMat);
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);

        for (let i = 0; i < 4; i++) {
            const stain = new THREE.Mesh(
                new THREE.CircleGeometry(0.5 + Math.random() * 0.6, 16),
                new THREE.MeshBasicMaterial({
                    color: 0x1a1810,
                    transparent: true,
                    opacity: 0.4,
                    depthWrite: false
                })
            );
            stain.rotation.x = -Math.PI / 2;
            stain.position.set((Math.random() - 0.5) * 14, 0.01, (Math.random() - 0.5) * 10);
            scene.add(stain);
        }

        for (let i = 0; i < 15; i++) {
            const shard = new THREE.Mesh(
                new THREE.PlaneGeometry(0.1 + Math.random() * 0.15, 0.08 + Math.random() * 0.1),
                new THREE.MeshStandardMaterial({
                    color: 0x7a7a70,
                    roughness: 0.7,
                    side: THREE.DoubleSide
                })
            );
            shard.rotation.x = -Math.PI / 2;
            shard.rotation.z = Math.random() * Math.PI;
            shard.position.set((Math.random() - 0.5) * 16, 0.012, (Math.random() - 0.5) * 12);
            scene.add(shard);
        }

        const ceilTex = T('concrete');
        ceilTex.repeat.set(6, 5);
        const ceilMat = new THREE.MeshStandardMaterial({
            map: ceilTex, roughness: 0.95, color: 0x3a3a3a,
            side: THREE.DoubleSide
        });
        const ceil = new THREE.Mesh(new THREE.PlaneGeometry(w, d), ceilMat);
        ceil.rotation.x = Math.PI / 2;
        ceil.position.y = h;
        scene.add(ceil);

        const lightPositions = [
            { x: -6, z: -4, lit: true },
            { x: 0, z: -4, lit: false },
            { x: 6, z: -4, lit: true },
            { x: -6, z: 0, lit: false },
            { x: 0, z: 0, lit: true },
            { x: 6, z: 0, lit: false },
            { x: -6, z: 4, lit: false },
            { x: 0, z: 4, lit: false },
            { x: 6, z: 4, lit: true }
        ];

        lightPositions.forEach(function(p) {
            const base = new THREE.Mesh(
                new THREE.BoxGeometry(1.4, 0.1, 0.5),
                new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.8 })
            );
            base.position.set(p.x, h - 0.05, p.z);
            scene.add(base);

            if (p.lit) {
                const tube = new THREE.Mesh(
                    new THREE.BoxGeometry(1.2, 0.06, 0.15),
                    new THREE.MeshBasicMaterial({ color: 0xfff2c0 })
                );
                tube.position.set(p.x, h - 0.12, p.z);
                scene.add(tube);

                const light = new THREE.PointLight(0xffe8a0, 0.6, 8);
                light.position.set(p.x, h - 0.5, p.z);
                scene.add(light);

                const pool = new THREE.Mesh(
                    new THREE.CircleGeometry(2, 24),
                    new THREE.MeshBasicMaterial({
                        color: 0xffe8a0,
                        transparent: true,
                        opacity: 0.05,
                        depthWrite: false
                    })
                );
                pool.rotation.x = -Math.PI / 2;
                pool.position.set(p.x, 0.02, p.z);
                scene.add(pool);
            } else {
                const tube = new THREE.Mesh(
                    new THREE.BoxGeometry(1.2, 0.06, 0.15),
                    new THREE.MeshStandardMaterial({ color: 0x303030, roughness: 0.9 })
                );
                tube.position.set(p.x, h - 0.12, p.z);
                scene.add(tube);
            }
        });

        const wallTex = T('paintedWall');
        wallTex.repeat.set(8, 3);
        buildRoom(scene, 0, 0, w, d, h, wallTex, {
            doorSouth: { w: 2.4, h: 3.2 },
            doorNorth: { w: 1.6, h: 2.6 },
            doorEast: { w: 1.4, h: 2.4 }
        });

        const posterCanvas = document.createElement('canvas');
        posterCanvas.width = 256;
        posterCanvas.height = 384;
        const pctx = posterCanvas.getContext('2d');
        pctx.fillStyle = '#c8b890';
        pctx.fillRect(0, 0, 256, 384);
        for (let i = 0; i < 100; i++) {
            pctx.fillStyle = 'rgba(120,100,70,' + (Math.random() * 0.3) + ')';
            pctx.fillRect(Math.random() * 256, Math.random() * 384, Math.random() * 30, Math.random() * 20);
        }
        pctx.fillStyle = 'rgba(180,40,30,0.6)';
        pctx.font = 'bold 48px sans-serif';
        pctx.textAlign = 'center';
        pctx.fillText('大干快上', 128, 120);
        pctx.fillText('多快好省', 128, 200);
        pctx.fillStyle = 'rgba(60,40,20,0.5)';
        pctx.font = '20px sans-serif';
        pctx.fillText('1978年', 128, 260);
        pctx.fillText('临江市电厂', 128, 300);
        pctx.fillStyle = '#8a8880';
        pctx.beginPath();
        pctx.moveTo(0, 380);
        pctx.lineTo(60, 360);
        pctx.lineTo(120, 380);
        pctx.lineTo(180, 355);
        pctx.lineTo(256, 375);
        pctx.lineTo(256, 384);
        pctx.closePath();
        pctx.fill();
        const posterTex = new THREE.CanvasTexture(posterCanvas);

        const poster = new THREE.Mesh(
            new THREE.PlaneGeometry(2.4, 3.6),
            new THREE.MeshStandardMaterial({ map: posterTex, roughness: 0.9 })
        );
        poster.position.set(-9.7, 2.5, 2);
        poster.rotation.y = Math.PI / 2;
        scene.add(poster);

        const deskMat = new THREE.MeshStandardMaterial({
            map: T('wood'), roughness: 0.9, color: 0x5a4030
        });
        const desk = new THREE.Mesh(new THREE.BoxGeometry(4, 1.1, 0.9), deskMat);
        desk.position.set(-4, 0.55, 3);
        scene.add(desk);

        const deskTop = new THREE.Mesh(
            new THREE.BoxGeometry(4.05, 0.06, 0.95),
            new THREE.MeshStandardMaterial({ map: T('wood'), roughness: 0.85, color: 0x6a5040 })
        );
        deskTop.position.set(-4, 1.13, 3);
        scene.add(deskTop);

        const drawerMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.9 });
        for (let i = 0; i < 2; i++) {
            const drawer = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.3, 0.75), drawerMat);
            drawer.position.set(-5.5 + i * 3, 0.35, 3.02);
            scene.add(drawer);
            const handle = new THREE.Mesh(
                new THREE.CylinderGeometry(0.02, 0.02, 0.15, 8),
                new THREE.MeshStandardMaterial({ color: 0x8a7a50, roughness: 0.5, metalness: 0.8 })
            );
            handle.rotation.z = Math.PI / 2;
            handle.position.set(-5.5 + i * 3, 0.35, 3.42);
            scene.add(handle);
        }

        const mug = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.06, 0.12, 12),
            new THREE.MeshStandardMaterial({ color: 0xd8d0c0, roughness: 0.7 })
        );
        mug.position.set(-4.5, 1.22, 3.1);
        scene.add(mug);

        const notebook = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.05, 0.3),
            new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 0.9 })
        );
        notebook.position.set(-3.3, 1.185, 3);
        scene.add(notebook);

        const stairMat = new THREE.MeshStandardMaterial({
            map: T('concrete'), roughness: 0.9, color: 0x707070
        });
        const stairGroup = new THREE.Group();

        for (let i = 0; i < 20; i++) {
            const step = new THREE.Mesh(new THREE.BoxGeometry(3, 0.18, 0.35), stairMat);
            step.position.set(0, 0.09 + i * 0.18, -i * 0.35);
            stairGroup.add(step);

            if (i % 5 === 0) {
                const side = new THREE.Mesh(
                    new THREE.BoxGeometry(0.1, 1.2, 0.35 * 5),
                    stairMat
                );
                side.position.set(1.55, 0.6 + i * 0.18, -i * 0.35 - 0.7);
                stairGroup.add(side);
                const side2 = side.clone();
                side2.position.x = -1.55;
                stairGroup.add(side2);
            }
        }

        const railMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.7, metalness: 0.6 });
        for (let s = -1; s <= 1; s += 2) {
            for (let i = 0; i < 20; i += 2) {
                const post = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.02, 0.02, 1, 8),
                    railMat
                );
                post.position.set(s * 1.4, 1.0 + i * 0.18, -i * 0.35);
                stairGroup.add(post);
            }
            const railCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(s * 1.4, 1.0, 0),
                new THREE.Vector3(s * 1.4, 2.5, -2),
                new THREE.Vector3(s * 1.4, 4.5, -5)
            ]);
            const rail = new THREE.Mesh(
                new THREE.TubeGeometry(railCurve, 12, 0.03, 6, false),
                railMat
            );
            stairGroup.add(rail);
        }

        stairGroup.position.set(6, 0, 3);
        scene.add(stairGroup);

        const chandelierFrame = new THREE.Group();
        const frameMat2 = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.8, metalness: 0.7 });
        const axis = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 8), frameMat2);
        axis.position.y = -0.6;
        chandelierFrame.add(axis);
        for (let i = 0; i < 3; i++) {
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(0.6 - i * 0.15, 0.02, 6, 20),
                frameMat2
            );
            ring.rotation.x = Math.PI / 2;
            ring.position.y = -0.3 - i * 0.3;
            chandelierFrame.add(ring);
        }
        chandelierFrame.position.set(0, h - 0.8, 0);
        scene.add(chandelierFrame);

        const clockFace = new THREE.Mesh(
            new THREE.CircleGeometry(0.35, 32),
            new THREE.MeshStandardMaterial({ color: 0xd8d0c0, roughness: 0.7 })
        );
        clockFace.position.set(0, 3.5, -d/2 + 0.16);
        scene.add(clockFace);

        const clockRim = new THREE.Mesh(
            new THREE.RingGeometry(0.35, 0.4, 32),
            new THREE.MeshStandardMaterial({ color: 0x3a3025, roughness: 0.8 })
        );
        clockRim.position.set(0, 3.5, -d/2 + 0.17);
        scene.add(clockRim);

        const handMat = new THREE.MeshBasicMaterial({ color: 0x2a1a0a });
        const hourHand = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 0.15), handMat);
        hourHand.position.set(-0.04, 3.53, -d/2 + 0.18);
        hourHand.rotation.z = Math.PI * 0.06;
        scene.add(hourHand);

        const minuteHand = new THREE.Mesh(new THREE.PlaneGeometry(0.015, 0.22), handMat);
        minuteHand.position.set(0.03, 3.55, -d/2 + 0.18);
        minuteHand.rotation.z = -Math.PI * 0.05;
        scene.add(minuteHand);

        const pipeMat = new THREE.MeshStandardMaterial({
            map: T('rustyPipe'), roughness: 0.9, metalness: 0.5
        });
        for (let i = 0; i < 3; i++) {
            const pipe = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.08, w - 1, 12),
                pipeMat
            );
            pipe.rotation.z = Math.PI / 2;
            pipe.position.set(0, h - 0.4, -4 + i * 4);
            scene.add(pipe);
        }

        [[-7, -4], [7, -4], [-7, 4], [7, 4]].forEach(function(p) {
            const pipe = new THREE.Mesh(
                new THREE.CylinderGeometry(0.06, 0.06, h, 10),
                pipeMat
            );
            pipe.position.set(p[0], h/2, p[1]);
            scene.add(pipe);
        });

        const eboxMat = new THREE.MeshStandardMaterial({
            map: T('metalPlate'), roughness: 0.85, metalness: 0.5, color: 0x505858
        });
        const ebox = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1, 0.3), eboxMat);
        ebox.position.set(9.7, 2, -3);
        ebox.rotation.y = -Math.PI / 2;
        scene.add(ebox);

        for (let i = 0; i < 3; i++) {
            const wireCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(9.85, 2.4, -3 - 0.2 + i * 0.2),
                new THREE.Vector3(9.85, 3.5, -3 - 0.2 + i * 0.2),
                new THREE.Vector3(9.85, h, -3 + i * 0.5)
            ]);
            const wire = new THREE.Mesh(
                new THREE.TubeGeometry(wireCurve, 12, 0.015, 4, false),
                new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
            );
            scene.add(wire);
        }

        const thermos = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.13, 0.5, 16),
            new THREE.MeshStandardMaterial({ color: 0x8a3a3a, roughness: 0.6 })
        );
        thermos.position.set(-8.5, 0.25, -5.5);
        scene.add(thermos);

        const thermosCap = new THREE.Mesh(
            new THREE.CylinderGeometry(0.13, 0.13, 0.08, 16),
            new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.5, metalness: 0.6 })
        );
        thermosCap.position.set(-8.5, 0.54, -5.5);
        scene.add(thermosCap);

        addInteract(scene, 'main_hall', 'hall_desk', -4, 1, 3, 4, 1.2, 0.9, '查看接待台');
        addInteract(scene, 'main_hall', 'hall_stair', 6, 2, 1, 3, 4, 4, '查看楼梯');
    },

    colliders: [
        { minX: -10.3, maxX: 10.3, minZ: -7.7, maxZ: -7.0 },
        { minX: -10.3, maxX: 10.3, minZ: 7.0, maxZ: 7.7 },
        { minX: -10.3, maxX: -10.0, minZ: -7.7, maxZ: 7.7 },
        { minX: 10.0, maxX: 10.3, minZ: -7.7, maxZ: 7.7 },
        { minX: -6, maxX: -2, minZ: 2.5, maxZ: 3.5 },
        { minX: 4.5, maxX: 7.5, minZ: -4, maxZ: 4 },
        { minX: 9.5, maxX: 10, minZ: -3.5, maxZ: -2.5 },
        { minX: -8.7, maxX: -8.3, minZ: -5.7, maxZ: -5.3 }
    ],

    interactables: [],

    exits: [
        { x: 0, z: 8, w: 2.4, d: 1.5, to: 'gate',
          pos: { x: 0, y: 0, z: -15 }, yaw: Math.PI },
        { x: 0, z: -8, w: 1.6, d: 1.5, to: 'control',
          pos: { x: 0, y: 0, z: 0 }, yaw: 0 },
        { x: 10.5, z: 0, w: 1.5, d: 1.4, to: 'power',
          pos: { x: -3, y: 0, z: 0 }, yaw: -Math.PI/2 }
    ],

    onEnter: {
        name: '',
        text: '主楼大厅。\n\n地上铺着旧瓷砖，很多已经碎了。\n天花板上的灯管有些还亮着。\n\n接待台后面空无一人。'
    }
};

/* =========================================================
   场景 4：老电厂 · 控制室
   ========================================================= */
window.MAPS.control = {
    name: '老电厂 · 控制室',
    ambient: 'control',

    build: function(scene) {
        const T = window.getTexture;
        const w = 14, d = 10, h = 3.5;

        const tileTex = T('oldTile');
        tileTex.repeat.set(5, 4);
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(w, d),
            new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.9 })
        );
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);

        for (let i = 0; i < 5; i++) {
            const stain = new THREE.Mesh(
                new THREE.CircleGeometry(0.4 + Math.random() * 0.5, 16),
                new THREE.MeshBasicMaterial({
                    color: 0x1a1810, transparent: true,
                    opacity: 0.4, depthWrite: false
                })
            );
            stain.rotation.x = -Math.PI / 2;
            stain.position.set((Math.random() - 0.5) * 10, 0.01, (Math.random() - 0.5) * 7);
            scene.add(stain);
        }

        const ceil = new THREE.Mesh(
            new THREE.PlaneGeometry(w, d),
            new THREE.MeshStandardMaterial({
                map: T('concrete'), roughness: 0.95, color: 0x3a3a3a,
                side: THREE.DoubleSide
            })
        );
        ceil.rotation.x = Math.PI / 2;
        ceil.position.y = h;
        scene.add(ceil);

        [{x:-3.5,z:0,lit:true},{x:3.5,z:0,lit:false}].forEach(function(p){
            const base = new THREE.Mesh(
                new THREE.BoxGeometry(1.4, 0.08, 0.4),
                new THREE.MeshStandardMaterial({ color: 0x2a2a2a })
            );
            base.position.set(p.x, h - 0.04, p.z);
            scene.add(base);

            const tube = new THREE.Mesh(
                new THREE.BoxGeometry(1.2, 0.06, 0.12),
                new THREE.MeshBasicMaterial({ color: p.lit ? 0xfff2c0 : 0x303030 })
            );
            tube.position.set(p.x, h - 0.1, p.z);
            scene.add(tube);

            if (p.lit) {
                const light = new THREE.PointLight(0xffe8a0, 0.7, 7);
                light.position.set(p.x, h - 0.5, p.z);
                scene.add(light);

                const pool = new THREE.Mesh(
                    new THREE.CircleGeometry(2, 24),
                    new THREE.MeshBasicMaterial({
                        color: 0xffe8a0, transparent: true,
                        opacity: 0.05, depthWrite: false
                    })
                );
                pool.rotation.x = -Math.PI / 2;
                pool.position.set(p.x, 0.02, p.z);
                scene.add(pool);
            }
        });

        const wallTex = T('wallInterior');
        wallTex.repeat.set(4, 1.5);
        buildRoom(scene, 0, 0, w, d, h, wallTex, {
            doorSouth: { w: 1.6, h: 2.6 }
        });

        const consoleMat = new THREE.MeshStandardMaterial({
            map: T('metalPlate'), roughness: 0.85, metalness: 0.5, color: 0x556055
        });
        const consoleBody = new THREE.Mesh(new THREE.BoxGeometry(10, 1.2, 1.2), consoleMat);
        consoleBody.position.set(0, 0.6, -3.5);
        scene.add(consoleBody);

        const consoleTop = new THREE.Mesh(
            new THREE.BoxGeometry(10, 0.06, 1.3),
            new THREE.MeshStandardMaterial({ map: T('metalPlate'), roughness: 0.7, metalness: 0.6, color: 0x606868 })
        );
        consoleTop.position.set(0, 1.22, -3.4);
        consoleTop.rotation.x = -0.15;
        scene.add(consoleTop);

        for (let i = 0; i < 8; i++) {
            const gauge = new THREE.Mesh(
                new THREE.BoxGeometry(0.7, 0.5, 0.05),
                new THREE.MeshStandardMaterial({
                    color: i === 3 ? 0x0a2a0a : 0x0a0a0a,
                    emissive: i === 3 ? 0x00aa00 : 0x000000,
                    emissiveIntensity: i === 3 ? 0.6 : 0,
                    roughness: 0.5
                })
            );
            gauge.position.set(-4 + i * 1.15, 1.35, -3.35);
            gauge.rotation.x = -0.15;
            scene.add(gauge);
        }

        const gaugeGlass = new THREE.Mesh(
            new THREE.PlaneGeometry(9.5, 0.5),
            new THREE.MeshPhysicalMaterial({
                color: 0xffffff, transparent: true, opacity: 0.05,
                roughness: 0.05, metalness: 0,
                transmission: 0.9
            })
        );
        gaugeGlass.position.set(0, 1.35, -3.3);
        gaugeGlass.rotation.x = -0.15;
        scene.add(gaugeGlass);

        for (let i = 0; i < 14; i++) {
            const btn = new THREE.Mesh(
                new THREE.CylinderGeometry(0.04, 0.04, 0.03, 8),
                new THREE.MeshStandardMaterial({
                    color: [0x2a2a2a, 0x8a3a3a, 0x3a6a3a, 0x8a7a2a][Math.floor(Math.random() * 4)],
                    roughness: 0.5
                })
            );
            btn.position.set(-4.5 + i * 0.7, 1.25, -3.05);
            scene.add(btn);
        }

        const chairGroup = new THREE.Group();
        const seat = new THREE.Mesh(
            new THREE.BoxGeometry(0.55, 0.08, 0.55),
            new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 0.9 })
        );
        seat.position.y = 0.45;
        chairGroup.add(seat);

        const back = new THREE.Mesh(
            new THREE.BoxGeometry(0.55, 0.6, 0.08),
            new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 0.9 })
        );
        back.position.set(0, 0.8, -0.25);
        chairGroup.add(back);

        [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]].forEach(function(p){
            const leg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.02, 0.02, 0.45, 6),
                new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.7, metalness: 0.5 })
            );
            leg.position.set(p[0], 0.22, p[1]);
            chairGroup.add(leg);
        });

        chairGroup.position.set(-2, 0, -1.8);
        chairGroup.rotation.y = -0.3;
        scene.add(chairGroup);

        const chairGroup2 = chairGroup.clone();
        chairGroup2.position.set(-0.5, 0, -2);
        chairGroup2.rotation.set(Math.PI * 0.9, -0.5, 0);
        scene.add(chairGroup2);

        const radioMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.7, metalness: 0.2 });
        const radio = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.22), radioMat);
        radio.position.set(3.5, 1.37, -3.3);
        scene.add(radio);

        const radioLight = new THREE.Mesh(
            new THREE.CircleGeometry(0.03, 8),
            new THREE.MeshBasicMaterial({ color: 0x00ff44 })
        );
        radioLight.position.set(3.6, 1.42, -3.19);
        scene.add(radioLight);

        const antenna = new THREE.Mesh(
            new THREE.CylinderGeometry(0.005, 0.005, 0.8, 4),
            new THREE.MeshStandardMaterial({ color: 0x8a8a8a, metalness: 0.8, roughness: 0.3 })
        );
        antenna.position.set(3.5, 1.75, -3.3);
        antenna.rotation.z = 0.4;
        scene.add(antenna);

        const cabMat = new THREE.MeshStandardMaterial({ map: T('rustMetal'), roughness: 0.9, color: 0x606060 });
        const cab = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2, 0.6), cabMat);
        cab.position.set(-5.5, 1, 2);
        scene.add(cab);

        for (let i = 0; i < 4; i++) {
            const drawer = new THREE.Mesh(
                new THREE.BoxGeometry(1.15, 0.04, 0.55),
                new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.85 })
            );
            drawer.position.set(-5.5, 0.3 + i * 0.5, 2.03);
            scene.add(drawer);

            const handle = new THREE.Mesh(
                new THREE.BoxGeometry(0.15, 0.03, 0.03),
                new THREE.MeshStandardMaterial({ color: 0x8a7a50, roughness: 0.4, metalness: 0.8 })
            );
            handle.position.set(-5.5, 0.3 + i * 0.5, 2.32);
            scene.add(handle);
        }

        for (let i = 0; i < 5; i++) {
            const folder = new THREE.Mesh(
                new THREE.BoxGeometry(1.1, 0.05, 0.5),
                new THREE.MeshStandardMaterial({
                    color: [0x8a7a50, 0x6a5a30, 0x9a8a60][Math.floor(Math.random()*3)],
                    roughness: 0.9
                })
            );
            folder.position.set(-5.5 + (Math.random()-0.5)*0.1, 2.03 + i * 0.06, 2);
            folder.rotation.y = (Math.random()-0.5) * 0.15;
            scene.add(folder);
        }

        const clockFace = new THREE.Mesh(
            new THREE.CircleGeometry(0.35, 32),
            new THREE.MeshStandardMaterial({ color: 0xd8d0c0, roughness: 0.7 })
        );
        clockFace.position.set(0, 2.5, -d/2 + 0.16);
        scene.add(clockFace);

        const clockRim = new THREE.Mesh(
            new THREE.RingGeometry(0.35, 0.4, 32),
            new THREE.MeshStandardMaterial({ color: 0x3a3025 })
        );
        clockRim.position.set(0, 2.5, -d/2 + 0.17);
        scene.add(clockRim);

        const handMat = new THREE.MeshBasicMaterial({ color: 0x2a1a0a });
        const hh = new THREE.Mesh(new THREE.PlaneGeometry(0.015, 0.13), handMat);
        hh.position.set(-0.04, 2.53, -d/2 + 0.18);
        hh.rotation.z = Math.PI * 0.06;
        scene.add(hh);

        const mh = new THREE.Mesh(new THREE.PlaneGeometry(0.012, 0.19), handMat);
        mh.position.set(0.03, 2.55, -d/2 + 0.18);
        mh.rotation.z = -Math.PI * 0.05;
        scene.add(mh);

        const ticketCanvas = document.createElement('canvas');
        ticketCanvas.width = 256;
        ticketCanvas.height = 384;
        const tctx = ticketCanvas.getContext('2d');
        tctx.fillStyle = '#e8e0c8';
        tctx.fillRect(0, 0, 256, 384);
        tctx.fillStyle = '#1a1a1a';
        tctx.font = 'bold 22px serif';
        tctx.textAlign = 'center';
        tctx.fillText('操作票', 128, 40);
        tctx.font = '16px serif';
        tctx.textAlign = 'left';
        tctx.fillText('编号：临-8903', 30, 80);
        tctx.fillText('日期：1989.9.12', 30, 110);
        tctx.fillText('操作：3号机停机', 30, 140);
        tctx.fillText('操作人：', 30, 170);
        tctx.font = 'bold 22px 楷体,serif';
        tctx.fillText('陈广志', 110, 170);
        tctx.font = '16px serif';
        tctx.fillText('监护人：', 30, 200);
        tctx.fillText('审批：', 30, 230);
        tctx.strokeStyle = 'rgba(180,40,30,0.7)';
        tctx.lineWidth = 2;
        tctx.beginPath();
        tctx.arc(180, 280, 40, 0, Math.PI * 2);
        tctx.stroke();
        tctx.font = 'bold 18px serif';
        tctx.fillStyle = 'rgba(180,40,30,0.7)';
        tctx.textAlign = 'center';
        tctx.fillText('已审批', 180, 286);
        const ticketTex = new THREE.CanvasTexture(ticketCanvas);

        const ticket = new THREE.Mesh(
            new THREE.PlaneGeometry(0.6, 0.9),
            new THREE.MeshStandardMaterial({ map: ticketTex, roughness: 0.9 })
        );
        ticket.position.set(6.9, 1.8, 1);
        ticket.rotation.y = -Math.PI / 2;
        scene.add(ticket);

        addInteract(scene, 'control', 'ctrl_console', 0, 1.2, -3.5, 10, 1.5, 1.2, '查看控制台');
        addInteract(scene, 'control', 'ctrl_radio', 3.5, 1.37, -3.3, 0.6, 0.5, 0.4, '查看收音机');
        addInteract(scene, 'control', 'ctrl_cab', -5.5, 1, 2, 1.2, 2, 0.6, '打开文件柜');
        addInteract(scene, 'control', 'ctrl_clock', 0, 2.5, -4.8, 0.8, 0.8, 0.2, '查看挂钟');
    },

    colliders: [
        { minX: -7.3, maxX: 7.3, minZ: -5.2, maxZ: -4.8 },
        { minX: -7.3, maxX: 7.3, minZ: 4.8, maxZ: 5.2 },
        { minX: -7.3, maxX: -6.8, minZ: -5.2, maxZ: 5.2 },
        { minX: 6.8, maxX: 7.3, minZ: -5.2, maxZ: 5.2 },
        { minX: -5, maxX: 5, minZ: -4.2, maxZ: -2.8 },
        { minX: -6.2, maxX: -4.9, minZ: 1.6, maxZ: 2.4 }
    ],

    interactables: [],

    exits: [
        { x: 0, z: 5.5, w: 1.6, d: 1.5, to: 'main_hall',
          pos: { x: 0, y: 0, z: -2 }, yaw: Math.PI }
    ],

    onEnter: {
        name: '',
        text: '控制室。\n\n仪表盘大多黑了。\n只有一台老式收音机还亮着一点绿光。'
    }
};
/* =========================================================
   场景 5：老电厂 · 配电房
   ========================================================= */
window.MAPS.power = {
    name: '老电厂 · 配电房',
    ambient: 'electric',

    build: function(scene) {
        const T = window.getTexture;
        const w = 16, d = 8, h = 3.2;

        const floorTex = T('cementFloor');
        floorTex.repeat.set(5, 3);
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(w, d),
            new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.95 })
        );
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);

        const lineMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a, transparent: true, opacity: 0.4 });
        for (let x = -6; x <= 6; x += 4) {
            const line = new THREE.Mesh(new THREE.PlaneGeometry(0.03, d), lineMat);
            line.rotation.x = -Math.PI / 2;
            line.position.set(x, 0.008, 0);
            scene.add(line);
        }

        const ceil = new THREE.Mesh(
            new THREE.PlaneGeometry(w, d),
            new THREE.MeshStandardMaterial({
                map: T('concrete'), roughness: 0.95, color: 0x353535,
                side: THREE.DoubleSide
            })
        );
        ceil.rotation.x = Math.PI / 2;
        ceil.position.y = h;
        scene.add(ceil);

        for (let i = 0; i < 5; i++) {
            const x = -6 + i * 3;
            const lit = i === 2;
            const base = new THREE.Mesh(
                new THREE.BoxGeometry(1.4, 0.08, 0.4),
                new THREE.MeshStandardMaterial({ color: 0x2a2a2a })
            );
            base.position.set(x, h - 0.04, 0);
            scene.add(base);

            const tube = new THREE.Mesh(
                new THREE.BoxGeometry(1.2, 0.06, 0.12),
                new THREE.MeshBasicMaterial({ color: lit ? 0xd0e8ff : 0x303030 })
            );
            tube.position.set(x, h - 0.1, 0);
            scene.add(tube);

            if (lit) {
                const light = new THREE.PointLight(0xc0d8ff, 0.6, 8);
                light.position.set(x, h - 0.5, 0);
                scene.add(light);
            }
        }

        const wallTex = T('wallInterior');
        wallTex.repeat.set(5, 1.5);
        buildRoom(scene, 0, 0, w, d, h, wallTex, {
            doorWest: { w: 1.5, h: 2.4 }
        });

        const cabMat = new THREE.MeshStandardMaterial({
            map: T('metalPlate'), roughness: 0.85, metalness: 0.5, color: 0x505858
        });

        for (let i = 0; i < 6; i++) {
            const x = -5 + i * 2;

            const cab = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.4, 0.9), cabMat);
            cab.position.set(x, 1.2, -2.5);
            scene.add(cab);

            const seam = new THREE.Mesh(
                new THREE.BoxGeometry(0.02, 2.3, 0.02),
                new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
            );
            seam.position.set(x, 1.2, -2.04);
            scene.add(seam);

            const lightColors = [0xff2222, 0x00ff44, 0xffaa00];
            for (let k = 0; k < 3; k++) {
                const indicator = new THREE.Mesh(
                    new THREE.CircleGeometry(0.05, 8),
                    new THREE.MeshBasicMaterial({ color: lightColors[k] })
                );
                indicator.position.set(x - 0.4 + k * 0.4, 2.2, -2.04);
                scene.add(indicator);
            }

            const gauge = new THREE.Mesh(
                new THREE.CircleGeometry(0.12, 16),
                new THREE.MeshStandardMaterial({
                    color: 0xe8e0c8, roughness: 0.4,
                    emissive: 0x222222, emissiveIntensity: 0.2
                })
            );
            gauge.position.set(x, 1.6, -2.04);
            scene.add(gauge);

            const needle = new THREE.Mesh(
                new THREE.PlaneGeometry(0.01, 0.1),
                new THREE.MeshBasicMaterial({ color: 0x1a1a1a })
            );
            needle.position.set(x, 1.63, -2.03);
            needle.rotation.z = (Math.random() - 0.5) * 1.5;
            scene.add(needle);

            const handle = new THREE.Mesh(
                new THREE.BoxGeometry(0.04, 0.4, 0.04),
                new THREE.MeshStandardMaterial({ color: 0x8a7a50, roughness: 0.4, metalness: 0.8 })
            );
            handle.position.set(x + 0.7, 1.3, -2.04);
            scene.add(handle);
        }

        const busMat = new THREE.MeshStandardMaterial({ color: 0x8a5a2a, roughness: 0.5, metalness: 0.8 });
        for (let i = 0; i < 3; i++) {
            const bus = new THREE.Mesh(new THREE.BoxGeometry(11, 0.06, 0.08), busMat);
            bus.position.set(0, 2.9, -2.5 - i * 0.15);
            scene.add(bus);
        }

        const transformMat = new THREE.MeshStandardMaterial({
            map: T('rustMetal'), roughness: 0.9, color: 0x4a3a2a
        });
        const transformer = new THREE.Mesh(new THREE.BoxGeometry(3, 2.5, 1.5), transformMat);
        transformer.position.set(5, 1.25, 2);
        scene.add(transformer);

        for (let i = 0; i < 8; i++) {
            const fin = new THREE.Mesh(
                new THREE.BoxGeometry(0.05, 2.2, 1.4),
                new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.9, metalness: 0.5 })
            );
            fin.position.set(3.6 + i * 0.05, 1.25, 2);
            scene.add(fin);
        }

        for (let i = 0; i < 3; i++) {
            const insulator = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.12, 0.5, 12),
                new THREE.MeshStandardMaterial({ color: 0xc8c0a8, roughness: 0.5 })
            );
            insulator.position.set(4.2 + i * 0.6, 2.7, 2);
            scene.add(insulator);
        }

        const redDot = new THREE.Mesh(
            new THREE.CircleGeometry(0.08, 12),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        redDot.position.set(5, 2.0, 2.76);
        scene.add(redDot);

        const redGlow = new THREE.PointLight(0xff2222, 0.5, 4);
        redGlow.position.set(5, 2.0, 2.8);
        scene.add(redGlow);

        const deskMat = new THREE.MeshStandardMaterial({
            map: T('wood'), roughness: 0.9, color: 0x5a4030
        });
        const desk = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 0.9), deskMat);
        desk.position.set(-6, 0.45, 2);
        scene.add(desk);

        const roster = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.05, 0.28),
            new THREE.MeshStandardMaterial({ color: 0xe8dfc8, roughness: 0.9 })
        );
        roster.position.set(-6, 0.925, 2);
        scene.add(roster);

        const pen = new THREE.Mesh(
            new THREE.CylinderGeometry(0.008, 0.008, 0.14, 6),
            new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5 })
        );
        pen.rotation.z = Math.PI / 2;
        pen.position.set(-5.6, 0.925, 2.1);
        scene.add(pen);

        const mug = new THREE.Mesh(
            new THREE.CylinderGeometry(0.07, 0.06, 0.11, 12),
            new THREE.MeshStandardMaterial({ color: 0xd8d0c0, roughness: 0.7 })
        );
        mug.position.set(-6.7, 0.95, 2.1);
        scene.add(mug);

        const pageMat = new THREE.MeshStandardMaterial({ color: 0xeee5d0, roughness: 0.9 });
        const page = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.26), pageMat);
        page.rotation.x = -Math.PI / 2;
        page.position.set(-6, 0.951, 2);
        scene.add(page);

        const chair = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.5, 0.5),
            new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 0.9 })
        );
        chair.position.set(-6, 0.25, 2.8);
        scene.add(chair);

        const diagramCanvas = document.createElement('canvas');
        diagramCanvas.width = 512;
        diagramCanvas.height = 384;
        const dctx = diagramCanvas.getContext('2d');
        dctx.fillStyle = '#e8e0c8';
        dctx.fillRect(0, 0, 512, 384);
        dctx.strokeStyle = '#1a1a1a';
        dctx.lineWidth = 2;
        dctx.font = 'bold 20px serif';
        dctx.fillStyle = '#1a1a1a';
        dctx.textAlign = 'center';
        dctx.fillText('配电系统图', 256, 35);
        dctx.beginPath();
        dctx.moveTo(60, 100);
        dctx.lineTo(60, 340);
        dctx.moveTo(60, 100);
        dctx.lineTo(460, 100);
        dctx.moveTo(200, 100);
        dctx.lineTo(200, 340);
        dctx.moveTo(340, 100);
        dctx.lineTo(340, 340);
        dctx.stroke();
        for (let y = 150; y < 340; y += 50) {
            dctx.beginPath();
            dctx.arc(60, y, 6, 0, Math.PI * 2);
            dctx.arc(200, y, 6, 0, Math.PI * 2);
            dctx.arc(340, y, 6, 0, Math.PI * 2);
            dctx.stroke();
        }
        const diagramTex = new THREE.CanvasTexture(diagramCanvas);

        const diagram = new THREE.Mesh(
            new THREE.PlaneGeometry(3, 2.2),
            new THREE.MeshStandardMaterial({ map: diagramTex, roughness: 0.9 })
        );
        diagram.position.set(7.9, 1.8, -2);
        diagram.rotation.y = -Math.PI / 2;
        scene.add(diagram);

        addInteract(scene, 'power', 'pwr_roster', -6, 0.95, 2, 0.6, 0.4, 0.4, '查看花名册');
        addInteract(scene, 'power', 'pwr_cab', 0, 1.2, -2.5, 12, 2.4, 0.9, '查看配电柜');
        addInteract(scene, 'power', 'pwr_trans', 5, 1.25, 2, 3.5, 3, 1.8, '查看变压器');
    },

    colliders: [
        { minX: -8.3, maxX: 8.3, minZ: -4.2, maxZ: -3.8 },
        { minX: -8.3, maxX: 8.3, minZ: 3.8, maxZ: 4.2 },
        { minX: -8.3, maxX: -7.8, minZ: -4.2, maxZ: 4.2 },
        { minX: 7.8, maxX: 8.3, minZ: -4.2, maxZ: 4.2 },
        { minX: -6, maxX: 6, minZ: -3.1, maxZ: -2.0 },
        { minX: 3.5, maxX: 6.6, minZ: 1.1, maxZ: 3.0 },
        { minX: -7.2, maxX: -4.9, minZ: 1.5, maxZ: 2.5 }
    ],

    interactables: [],

    exits: [
        { x: -8.5, z: 0, w: 1.5, d: 1.5, to: 'main_hall',
          pos: { x: 0, y: 0, z: 0 }, yaw: Math.PI/2 }
    ],

    onEnter: {
        name: '',
        text: '配电房。\n\n一排配电柜嗡嗡作响。\n变压器像一个死去的巨兽。'
    }
};

/* =========================================================
   场景 6：老电厂 · 涡轮大厅
   ========================================================= */
window.MAPS.turbine = {
    name: '老电厂 · 涡轮大厅',
    ambient: 'hall',

    build: function(scene) {
        const T = window.getTexture;
        const w = 26, d = 18, h = 9;

        const cementTex = T('cementFloor');
        cementTex.repeat.set(8, 6);
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(w, d),
            new THREE.MeshStandardMaterial({ map: cementTex, roughness: 0.95 })
        );
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);

        for (let i = 0; i < 6; i++) {
            const stain = new THREE.Mesh(
                new THREE.CircleGeometry(0.8 + Math.random() * 1.2, 20),
                new THREE.MeshBasicMaterial({
                    color: 0x080502, transparent: true,
                    opacity: 0.6, depthWrite: false
                })
            );
            stain.rotation.x = -Math.PI / 2;
            stain.position.set((Math.random() - 0.5) * 20, 0.01, (Math.random() - 0.5) * 12);
            scene.add(stain);
        }

        const ceil = new THREE.Mesh(
            new THREE.PlaneGeometry(w, d),
            new THREE.MeshStandardMaterial({
                map: T('concrete'), roughness: 0.95, color: 0x2a2a2a,
                side: THREE.DoubleSide
            })
        );
        ceil.rotation.x = Math.PI / 2;
        ceil.position.y = h;
        scene.add(ceil);

        const beamMat = new THREE.MeshStandardMaterial({
            map: T('rustMetal'), roughness: 0.9, color: 0x4a3a2a, metalness: 0.6
        });
        for (let i = 0; i < 4; i++) {
            const beam = new THREE.Mesh(
                new THREE.BoxGeometry(w - 1, 0.3, 0.4),
                beamMat
            );
            beam.position.set(0, h - 0.5, -6 + i * 4);
            scene.add(beam);
        }
        for (let i = 0; i < 3; i++) {
            const beam = new THREE.Mesh(
                new THREE.BoxGeometry(0.4, 0.3, d - 1),
                beamMat
            );
            beam.position.set(-8 + i * 8, h - 0.5, 0);
            scene.add(beam);
        }

        for (let i = 0; i < 6; i++) {
            const x = -10 + (i % 3) * 10;
            const z = -5 + Math.floor(i / 3) * 10;
            const lit = Math.random() < 0.4;

            const base = new THREE.Mesh(
                new THREE.BoxGeometry(2, 0.15, 0.6),
                new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
            );
            base.position.set(x, h - 1, z);
            scene.add(base);

            const tube = new THREE.Mesh(
                new THREE.BoxGeometry(1.8, 0.08, 0.2),
                new THREE.MeshBasicMaterial({ color: lit ? 0xfff0c0 : 0x252525 })
            );
            tube.position.set(x, h - 1.1, z);
            scene.add(tube);

            if (lit) {
                const light = new THREE.PointLight(0xffe8a0, 0.7, 12);
                light.position.set(x, h - 2, z);
                scene.add(light);
            }
        }

        const wallTex = T('concrete');
        wallTex.repeat.set(8, 4);
        buildRoom(scene, 0, 0, w, d, h, wallTex, {
            doorSouth: { w: 2, h: 3 },
            doorEast: { w: 2.5, h: 3 }
        });

        for (let i = 0; i < 3; i++) {
            const pipe = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.15, w - 1, 12),
                new THREE.MeshStandardMaterial({ map: T('rustyPipe'), roughness: 0.9, metalness: 0.5 })
            );
            pipe.rotation.z = Math.PI / 2;
            pipe.position.set(0, 6 + i * 0.4, -d/2 + 0.5);
            scene.add(pipe);
        }
        for (let i = 0; i < 3; i++) {
            const pipe = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.15, w - 1, 12),
                new THREE.MeshStandardMaterial({ map: T('rustyPipe'), roughness: 0.9, metalness: 0.5 })
            );
            pipe.rotation.z = Math.PI / 2;
            pipe.position.set(0, 6 + i * 0.4, d/2 - 0.5);
            scene.add(pipe);
        }

        for (let i = 0; i < 4; i++) {
            const x = -9 + i * 6;

            const frame = new THREE.Mesh(
                new THREE.BoxGeometry(2.2, 2.2, 0.15),
                new THREE.MeshStandardMaterial({ color: 0x3a3025, roughness: 0.9 })
            );
            frame.position.set(x, 6, -d/2 + 0.2);
            scene.add(frame);

            const glass = new THREE.Mesh(
                new THREE.PlaneGeometry(2, 2),
                new THREE.MeshBasicMaterial({
                    color: 0x8fa8d8, transparent: true, opacity: 0.35
                })
            );
            glass.position.set(x, 6, -d/2 + 0.28);
            scene.add(glass);

            const gridMat = new THREE.MeshStandardMaterial({ color: 0x2a2018 });
            for (let k = -1; k <= 1; k += 2) {
                const vbar = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2, 0.05), gridMat);
                vbar.position.set(x + k * 0.5, 6, -d/2 + 0.24);
                scene.add(vbar);
                const hbar = new THREE.Mesh(new THREE.BoxGeometry(2, 0.05, 0.05), gridMat);
                hbar.position.set(x, 6 + k * 0.5, -d/2 + 0.24);
                scene.add(hbar);
            }

            const moonlight = new THREE.SpotLight(0x8fa8d8, 0.8, 12, Math.PI / 6, 0.6, 1.0);
            moonlight.position.set(x, 6, -d/2 + 0.5);
            moonlight.target.position.set(x, 0, -d/2 + 5);
            scene.add(moonlight);
            scene.add(moonlight.target);

            const pool = new THREE.Mesh(
                new THREE.PlaneGeometry(2.5, 5),
                new THREE.MeshBasicMaterial({
                    color: 0x8fa8d8, transparent: true,
                    opacity: 0.08, depthWrite: false
                })
            );
            pool.rotation.x = -Math.PI / 2;
            pool.position.set(x, 0.02, -d/2 + 3);
            scene.add(pool);
        }

        const turbineMat = new THREE.MeshStandardMaterial({
            map: T('rustMetal'), roughness: 0.8, metalness: 0.7, color: 0x5a4a3a
        });

        function buildTurbine(x, z) {
            const group = new THREE.Group();

            const base = new THREE.Mesh(
                new THREE.CylinderGeometry(3.5, 4, 1.5, 24),
                turbineMat
            );
            base.position.y = 0.75;
            group.add(base);

            for (let i = 0; i < 12; i++) {
                const angle = (i / 12) * Math.PI * 2;
                const bolt = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.08, 0.08, 0.15, 6),
                    new THREE.MeshStandardMaterial({ color: 0x3a3a3a, metalness: 0.8, roughness: 0.4 })
                );
                bolt.position.set(Math.cos(angle) * 3.7, 1.55, Math.sin(angle) * 3.7);
                group.add(bolt);
            }

            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(3, 3, 3.5, 32),
                turbineMat
            );
            body.position.y = 3.25;
            group.add(body);

            for (let i = 0; i < 3; i++) {
                const ring = new THREE.Mesh(
                    new THREE.TorusGeometry(3.1, 0.08, 6, 32),
                    new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.9, metalness: 0.5 })
                );
                ring.rotation.x = Math.PI / 2;
                ring.position.y = 2 + i * 1.2;
                group.add(ring);
            }

            const top = new THREE.Mesh(
                new THREE.CylinderGeometry(3.5, 3, 1, 32),
                turbineMat
            );
            top.position.y = 5.5;
            group.add(top);

            const plateCanvas = document.createElement('canvas');
            plateCanvas.width = 256;
            plateCanvas.height = 128;
            const pctx = plateCanvas.getContext('2d');
            pctx.fillStyle = '#3a3025';
            pctx.fillRect(0, 0, 256, 128);
            pctx.fillStyle = '#c9a877';
            pctx.font = 'bold 24px serif';
            pctx.textAlign = 'center';
            pctx.fillText('1987年', 128, 50);
            pctx.font = '18px serif';
            pctx.fillText('上海制造', 128, 80);
            pctx.fillText('型号：QFN-300', 128, 108);
            const plateTex = new THREE.CanvasTexture(plateCanvas);

            const plate = new THREE.Mesh(
                new THREE.PlaneGeometry(0.8, 0.4),
                new THREE.MeshStandardMaterial({ map: plateTex, roughness: 0.8 })
            );
            plate.position.set(0, 3.5, 3.06);
            group.add(plate);

            const pipeCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, 6, 0),
                new THREE.Vector3(0, 7, 0),
                new THREE.Vector3(0, 8, 0),
                new THREE.Vector3(0, h, -d/2 + 1)
            ]);
            const pipe = new THREE.Mesh(
                new THREE.TubeGeometry(pipeCurve, 16, 0.35, 12, false),
                new THREE.MeshStandardMaterial({ map: T('rustyPipe'), roughness: 0.9, metalness: 0.5 })
            );
            group.add(pipe);

            group.position.set(x, 0, z);
            scene.add(group);
        }

        buildTurbine(-8, 0);
        buildTurbine(8, 0);

        const boxMat = new THREE.MeshStandardMaterial({
            map: T('rustMetal'), roughness: 0.9, color: 0x8a6a3a
        });
        const toolbox = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 0.5), boxMat);
        toolbox.position.set(-11.5, 0.225, 6);
        scene.add(toolbox);

        const toolboxLid = new THREE.Mesh(
            new THREE.BoxGeometry(0.92, 0.05, 0.52),
            new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 0.85 })
        );
        toolboxLid.position.set(-11.5, 0.47, 6);
        scene.add(toolboxLid);

        const pryBar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.025, 0.025, 1.5, 8),
            new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.5, metalness: 0.8 })
        );
        pryBar.position.set(-11.8, 0.75, -3);
        pryBar.rotation.z = 0.3;
        scene.add(pryBar);

        const paperMat = new THREE.MeshStandardMaterial({ color: 0xa89878, roughness: 0.95, side: THREE.DoubleSide });
        const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.6), paperMat);
        paper.rotation.x = -Math.PI / 2;
        paper.rotation.z = 0.4;
        paper.position.set(-9, 0.01, 4);
        scene.add(paper);

        addInteract(scene, 'turbine', 'turbine_1', -8, 3, 0, 8, 7, 8, '查看涡轮机');
        addInteract(scene, 'turbine', 'turbine_2', 8, 3, 0, 8, 7, 8, '查看涡轮机');
        addInteract(scene, 'turbine', 'turbine_box', -11.5, 0.25, 6, 1, 0.6, 0.7, '打开工具箱');
        addInteract(scene, 'turbine', 'turbine_tunnel', 12.5, 1.5, 0, 1, 3, 2.5, '进入隧道');
    },

    colliders: [
        { minX: -13.3, maxX: 13.3, minZ: -9.2, maxZ: -8.8 },
        { minX: -13.3, maxX: 13.3, minZ: 8.8, maxZ: 9.2 },
        { minX: -13.3, maxX: -12.8, minZ: -9.2, maxZ: 9.2 },
        { minX: 12.8, maxX: 13.3, minZ: -9.2, maxZ: 9.2 },
        { minX: -12.5, maxX: -3.5, minZ: -4.5, maxZ: 4.5 },
        { minX: 3.5, maxX: 12.5, minZ: -4.5, maxZ: 4.5 },
        { minX: -12.2, maxX: -11.0, minZ: 5.5, maxZ: 6.5 }
    ],

    interactables: [],

    exits: [
        { x: 0, z: 9.5, w: 2, d: 1.5, to: 'main_hall',
          pos: { x: 0, y: 0, z: -4 }, yaw: Math.PI },
        { x: 13, z: 0, w: 1.5, d: 2.5, to: 'tunnel',
          pos: { x: -35, y: 0, z: 0 }, yaw: Math.PI/2 }
    ],

    onEnter: {
        name: '',
        text: '涡轮大厅。\n\n两台巨大的涡轮机静静矗立。\n像两座墓碑。'
    }
};

/* =========================================================
   场景 7：电缆隧道
   ========================================================= */
window.MAPS.tunnel = {
    name: '电缆隧道',
    ambient: 'tunnel',

    build: function(scene) {
        const T = window.getTexture;
        const w = 80, d = 3, h = 2.4;

        const cementTex = T('cementFloor');
        cementTex.repeat.set(30, 2);
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(w, d),
            new THREE.MeshStandardMaterial({ map: cementTex, roughness: 0.95 })
        );
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);

        const gutterMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a, transparent: true, opacity: 0.6 });
        const gutter = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.3), gutterMat);
        gutter.rotation.x = -Math.PI / 2;
        gutter.position.y = 0.005;
        scene.add(gutter);

        for (let i = 0; i < 8; i++) {
            const puddle = new THREE.Mesh(
                new THREE.CircleGeometry(0.3 + Math.random() * 0.4, 16),
                new THREE.MeshStandardMaterial({
                    color: 0x0a1420, roughness: 0.1, metalness: 0.7,
                    transparent: true, opacity: 0.85
                })
            );
            puddle.rotation.x = -Math.PI / 2;
            puddle.position.set(-35 + i * 10 + Math.random() * 4, 0.008, (Math.random() - 0.5) * 0.8);
            scene.add(puddle);
        }

        const ceil = new THREE.Mesh(
            new THREE.PlaneGeometry(w, d),
            new THREE.MeshStandardMaterial({
                map: T('concrete'), roughness: 0.95, color: 0x252525,
                side: THREE.DoubleSide
            })
        );
        ceil.rotation.x = Math.PI / 2;
        ceil.position.y = h;
        scene.add(ceil);

        const wallTex = T('concrete');
        wallTex.repeat.set(30, 1.5);

        const wallN = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, 0.3),
            new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.95, color: 0x5a5550 })
        );
        wallN.position.set(0, h/2, -d/2);
        scene.add(wallN);

        const wallS = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, 0.3),
            new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.95, color: 0x5a5550 })
        );
        wallS.position.set(0, h/2, d/2);
        scene.add(wallS);

        [-w/2, w/2].forEach(function(x) {
            const endWall = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, h, d),
                new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.95 })
            );
            endWall.position.set(x, h/2, 0);
            scene.add(endWall);
        });

        const rackMat = new THREE.MeshStandardMaterial({
            map: T('rustMetal'), roughness: 0.9, color: 0x4a3a2a
        });

        for (let i = -38; i <= 38; i += 2) {
            [-1.1, 1.1].forEach(function(z) {
                const bracket = new THREE.Mesh(
                    new THREE.BoxGeometry(0.06, 1.6, 0.4),
                    rackMat
                );
                bracket.position.set(i, 1.2, z);
                scene.add(bracket);

                for (let k = 0; k < 3; k++) {
                    const arm = new THREE.Mesh(
                        new THREE.BoxGeometry(0.05, 0.05, 0.4),
                        rackMat
                    );
                    arm.position.set(i, 0.6 + k * 0.5, z);
                    scene.add(arm);
                }
            });
        }

        const cableColors = [0x1a1a1a, 0x2a1a1a, 0x1a2a2a, 0x2a2a1a, 0x1a1a2a];
        for (let k = 0; k < 3; k++) {
            for (let s = 0; s < 5; s++) {
                const cable = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.045, 0.045, w - 2, 6),
                    new THREE.MeshStandardMaterial({
                        color: cableColors[s % cableColors.length],
                        roughness: 0.9
                    })
                );
                cable.rotation.z = Math.PI / 2;
                cable.position.set(0, 0.6 + k * 0.5, -1.1);
                scene.add(cable);

                const cable2 = cable.clone();
                cable2.position.z = 1.1;
                scene.add(cable2);
            }
        }

        const pipe = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.1, w - 2, 10),
            new THREE.MeshStandardMaterial({ map: T('rustyPipe'), roughness: 0.9, metalness: 0.5 })
        );
        pipe.rotation.z = Math.PI / 2;
        pipe.position.set(0, h - 0.2, 0);
        scene.add(pipe);

        for (let i = -35; i <= 35; i += 8) {
            const lit = (i / 8) % 2 === 0;

            const base = new THREE.Mesh(
                new THREE.BoxGeometry(0.6, 0.08, 0.2),
                new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
            );
            base.position.set(i, h - 0.05, 0);
            scene.add(base);

            const tube = new THREE.Mesh(
                new THREE.BoxGeometry(0.5, 0.04, 0.08),
                new THREE.MeshBasicMaterial({ color: lit ? 0xd0c8a0 : 0x252525 })
            );
            tube.position.set(i, h - 0.1, 0);
            scene.add(tube);

            if (lit) {
                const light = new THREE.PointLight(0xc0b890, 0.5, 7);
                light.position.set(i, h - 0.5, 0);
                scene.add(light);
            }
        }

        const bloodTex = T('bloodStain');
        [-25, -8, 12, 30].forEach(function(x) {
            const stain = new THREE.Mesh(
                new THREE.PlaneGeometry(0.9, 0.7),
                new THREE.MeshBasicMaterial({
                    map: bloodTex, transparent: true,
                    opacity: 0.55, depthWrite: false
                })
            );
            stain.rotation.x = -Math.PI / 2;
            stain.position.set(x, 0.01, (Math.random() - 0.5) * 0.8);
            scene.add(stain);
        });

        function addWallText(x, text, color) {
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, 256, 128);
            ctx.fillStyle = color || 'rgba(80,40,30,0.8)';
            ctx.font = 'bold 40px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, 128, 64);
            const tex = new THREE.CanvasTexture(canvas);

            const mesh = new THREE.Mesh(
                new THREE.PlaneGeometry(0.9, 0.45),
                new THREE.MeshBasicMaterial({
                    map: tex, transparent: true,
                    depthWrite: false
                })
            );
            mesh.position.set(x, 1.4, -d/2 + 0.16);
            scene.add(mesh);
        }

        addWallText(-20, '9月10日', 'rgba(180,180,150,0.6)');
        addWallText(0, '广志 9.12', 'rgba(120,80,50,0.9)');

        for (let i = 0; i < 8; i++) {
            const scratchCanvas = document.createElement('canvas');
            scratchCanvas.width = 64;
            scratchCanvas.height = 64;
            const sctx = scratchCanvas.getContext('2d');
            sctx.strokeStyle = 'rgba(60,40,30,0.7)';
            sctx.lineWidth = 2;
            sctx.beginPath();
            sctx.moveTo(10, 10);
            sctx.lineTo(50, 54);
            sctx.stroke();
            const scratchTex = new THREE.CanvasTexture(scratchCanvas);
            const scratch = new THREE.Mesh(
                new THREE.PlaneGeometry(0.3, 0.3),
                new THREE.MeshBasicMaterial({
                    map: scratchTex, transparent: true, depthWrite: false
                })
            );
            scratch.position.set(20 + i * 0.5, 1.2, -d/2 + 0.16);
            scene.add(scratch);
        }

        addInteract(scene, 'tunnel', 'tun_t1', -20, 1.4, 0, 1.5, 1.5, d, '查看墙上的字');
        addInteract(scene, 'tunnel', 'tun_t2', 0, 1.4, 0, 1.5, 1.5, d, '查看墙上的字');
        addInteract(scene, 'tunnel', 'tun_t3', 20, 1.4, 0, 1.5, 1.5, d, '查看墙上的刮痕');
    },

    colliders: [
        { minX: -40.3, maxX: -39.8, minZ: -1.5, maxZ: 1.5 },
        { minX: 39.8, maxX: 40.3, minZ: -1.5, maxZ: 1.5 },
        { minX: -40, maxX: 40, minZ: -1.8, maxZ: -1.3 },
        { minX: -40, maxX: 40, minZ: 1.3, maxZ: 1.8 }
    ],

    interactables: [],

    exits: [
        { x: -40, z: 0, w: 1.5, d: 2.5, to: 'turbine',
          pos: { x: 0, y: 0, z: 0 }, yaw: -Math.PI/2 },
        { x: 40, z: 0, w: 1.5, d: 2.5, to: 'chem_shop',
          pos: { x: -12, y: 0, z: 0 }, yaw: Math.PI/2 }
    ],

    onEnter: {
        name: '',
        text: '电缆隧道。\n\n很窄，只能一个人走。\n两侧是密密的电缆。\n\n墙上有很多字。'
    }
};
/* =========================================================
   场景 8：化工厂 · 车间
   ========================================================= */
window.MAPS.chem_shop = {
    name: '化工厂 · 车间',
    ambient: 'factory',

    build: function(scene) {
        const T = window.getTexture;
        const w = 30, d = 20, h = 8;

        const cementTex = T('cementFloor');
        cementTex.repeat.set(10, 7);
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(w, d),
            new THREE.MeshStandardMaterial({ map: cementTex, roughness: 0.95 })
        );
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);

        for (let i = 0; i < 10; i++) {
            const colorChoices = [0x0a1a0a, 0x1a0a0a, 0x1a1a08, 0x0a0a1a];
            const stain = new THREE.Mesh(
                new THREE.CircleGeometry(0.6 + Math.random() * 1.0, 20),
                new THREE.MeshBasicMaterial({
                    color: colorChoices[Math.floor(Math.random() * colorChoices.length)],
                    transparent: true, opacity: 0.5, depthWrite: false
                })
            );
            stain.rotation.x = -Math.PI / 2;
            stain.position.set((Math.random() - 0.5) * 25, 0.01, (Math.random() - 0.5) * 15);
            scene.add(stain);
        }

        const ceil = new THREE.Mesh(
            new THREE.PlaneGeometry(w, d),
            new THREE.MeshStandardMaterial({
                map: T('concrete'), roughness: 0.95, color: 0x252525,
                side: THREE.DoubleSide
            })
        );
        ceil.rotation.x = Math.PI / 2;
        ceil.position.y = h;
        scene.add(ceil);

        const beamMat = new THREE.MeshStandardMaterial({
            map: T('rustMetal'), roughness: 0.9, color: 0x4a3a2a, metalness: 0.6
        });
        for (let i = 0; i < 5; i++) {
            const beam = new THREE.Mesh(
                new THREE.BoxGeometry(w - 1, 0.35, 0.4),
                beamMat
            );
            beam.position.set(0, h - 0.5, -8 + i * 4);
            scene.add(beam);
        }

        for (let i = 0; i < 8; i++) {
            const x = -12 + (i % 4) * 8;
            const z = -5 + Math.floor(i / 4) * 10;
            const lit = Math.random() < 0.5;

            const base = new THREE.Mesh(
                new THREE.BoxGeometry(2, 0.15, 0.6),
                new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
            );
            base.position.set(x, h - 1, z);
            scene.add(base);

            const tube = new THREE.Mesh(
                new THREE.BoxGeometry(1.8, 0.08, 0.2),
                new THREE.MeshBasicMaterial({ color: lit ? 0xd8ffcc : 0x252525 })
            );
            tube.position.set(x, h - 1.1, z);
            scene.add(tube);

            if (lit) {
                const light = new THREE.PointLight(0xaaffaa, 0.5, 10);
                light.position.set(x, h - 2, z);
                scene.add(light);
            }
        }

        const wallTex = T('concrete');
        wallTex.repeat.set(10, 3);
        buildRoom(scene, 0, 0, w, d, h, wallTex, {
            doorWest: { w: 2, h: 2.5 },
            doorNorth: { w: 2, h: 2.5 },
            doorSouth: { w: 3, h: 3 }
        });

        const reactMat = new THREE.MeshStandardMaterial({
            map: T('rustMetal'), roughness: 0.85, metalness: 0.6, color: 0x6a5a4a
        });

        function buildReactor(x, z) {
            const group = new THREE.Group();

            const base = new THREE.Mesh(
                new THREE.CylinderGeometry(1.4, 1.5, 0.4, 20),
                reactMat
            );
            base.position.y = 0.2;
            group.add(base);

            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(1.2, 1.2, 4, 24),
                reactMat
            );
            body.position.y = 2.2;
            group.add(body);

            for (let i = 0; i < 3; i++) {
                const ring = new THREE.Mesh(
                    new THREE.TorusGeometry(1.25, 0.06, 6, 24),
                    new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.9, metalness: 0.5 })
                );
                ring.rotation.x = Math.PI / 2;
                ring.position.y = 1 + i * 1.2;
                group.add(ring);
            }

            const top = new THREE.Mesh(
                new THREE.SphereGeometry(1.2, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
                reactMat
            );
            top.position.y = 4.2;
            group.add(top);

            const flange = new THREE.Mesh(
                new THREE.CylinderGeometry(1.3, 1.3, 0.15, 24),
                new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.6, metalness: 0.7 })
            );
            flange.position.y = 4.3;
            group.add(flange);

            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const bolt = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.05, 0.05, 0.2, 6),
                    new THREE.MeshStandardMaterial({ color: 0x3a3a3a, metalness: 0.8 })
                );
                bolt.position.set(Math.cos(angle) * 1.15, 4.45, Math.sin(angle) * 1.15);
                group.add(bolt);
            }

            const pipeCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, 4.5, 0),
                new THREE.Vector3(0, 5.5, 0),
                new THREE.Vector3(0, 7, 0)
            ]);
            const pipe = new THREE.Mesh(
                new THREE.TubeGeometry(pipeCurve, 12, 0.13, 10, false),
                new THREE.MeshStandardMaterial({ map: T('rustyPipe'), roughness: 0.9, metalness: 0.5 })
            );
            group.add(pipe);

            const sidePipeCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(1.2, 3, 0),
                new THREE.Vector3(2, 3, 0),
                new THREE.Vector3(2.5, 4, 0)
            ]);
            const sidePipe = new THREE.Mesh(
                new THREE.TubeGeometry(sidePipeCurve, 12, 0.1, 10, false),
                new THREE.MeshStandardMaterial({ map: T('rustyPipe'), roughness: 0.9, metalness: 0.5 })
            );
            group.add(sidePipe);

            const valve = new THREE.Mesh(
                new THREE.TorusGeometry(0.15, 0.04, 6, 12),
                new THREE.MeshStandardMaterial({ color: 0x8a1a1a, roughness: 0.5, metalness: 0.6 })
            );
            valve.position.set(2, 3.5, 0);
            valve.rotation.y = Math.PI / 2;
            group.add(valve);

            const gauge = new THREE.Mesh(
                new THREE.CircleGeometry(0.15, 16),
                new THREE.MeshStandardMaterial({
                    color: 0xd8c898, roughness: 0.4,
                    emissive: 0x332200, emissiveIntensity: 0.3
                })
            );
            gauge.position.set(0, 3, 1.22);
            group.add(gauge);

            const needle = new THREE.Mesh(
                new THREE.PlaneGeometry(0.01, 0.12),
                new THREE.MeshBasicMaterial({ color: 0x1a1a1a })
            );
            needle.position.set(0, 3.02, 1.23);
            needle.rotation.z = (Math.random() - 0.5) * 1.5;
            group.add(needle);

            group.position.set(x, 0, z);
            scene.add(group);
        }

        [-6, -3, 3, 6].forEach(function(x) {
            buildReactor(x, -6);
            buildReactor(x, 6);
        });

        const mainPipeMat = new THREE.MeshStandardMaterial({
            map: T('rustyPipe'), roughness: 0.9, metalness: 0.5
        });
        const mainPipe = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.25, w - 2, 16),
            mainPipeMat
        );
        mainPipe.rotation.z = Math.PI / 2;
        mainPipe.position.set(0, 7, -6);
        scene.add(mainPipe);

        const mainPipe2 = mainPipe.clone();
        mainPipe2.position.set(0, 7, 6);
        scene.add(mainPipe2);

        const crossPipe = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.2, d - 2, 16),
            mainPipeMat
        );
        crossPipe.rotation.x = Math.PI / 2;
        crossPipe.position.set(0, 7, 0);
        scene.add(crossPipe);

        const deskMat = new THREE.MeshStandardMaterial({
            map: T('metalPlate'), roughness: 0.9, color: 0x505858
        });
        const desk = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 1.6), deskMat);
        desk.position.set(0, 0.5, 0);
        scene.add(desk);

        const paperMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(0.6, 0.8),
            new THREE.MeshStandardMaterial({
                color: 0xe8e0c8, roughness: 0.95, side: THREE.DoubleSide
            })
        );
        paperMesh.rotation.x = -Math.PI / 2;
        paperMesh.rotation.z = 0.2;
        paperMesh.position.set(0, 1.01, 0);
        scene.add(paperMesh);

        const pen = new THREE.Mesh(
            new THREE.CylinderGeometry(0.008, 0.008, 0.14, 6),
            new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
        );
        pen.rotation.z = Math.PI / 2;
        pen.position.set(0.4, 1.01, 0.1);
        scene.add(pen);

        const cabMat = new THREE.MeshStandardMaterial({
            map: T('rustMetal'), roughness: 0.9, color: 0x8a6a3a
        });
        const cab = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, 0.7), cabMat);
        cab.position.set(-12, 1.1, 8);
        scene.add(cab);

        const cabSeam = new THREE.Mesh(
            new THREE.BoxGeometry(0.02, 2.1, 0.02),
            new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
        );
        cabSeam.position.set(-12, 1.1, 8.36);
        scene.add(cabSeam);

        [-0.3, 0.3].forEach(function(dy) {
            const handle = new THREE.Mesh(
                new THREE.BoxGeometry(0.05, 0.15, 0.04),
                new THREE.MeshStandardMaterial({ color: 0x8a7a50, roughness: 0.4, metalness: 0.8 })
            );
            handle.position.set(-12 + 0.4, 1.1 + dy, 8.37);
            scene.add(handle);
        });

        const sloganCanvas = document.createElement('canvas');
        sloganCanvas.width = 512;
        sloganCanvas.height = 128;
        const sctx = sloganCanvas.getContext('2d');
        sctx.fillStyle = '#8a2a1a';
        sctx.fillRect(0, 0, 512, 128);
        sctx.fillStyle = '#f0e8c8';
        sctx.font = 'bold 60px sans-serif';
        sctx.textAlign = 'center';
        sctx.fillText('安全生产 人人有责', 256, 85);
        for (let i = 0; i < 60; i++) {
            sctx.fillStyle = 'rgba(120,80,50,' + (Math.random() * 0.3) + ')';
            sctx.fillRect(Math.random() * 512, Math.random() * 128, Math.random() * 40, Math.random() * 20);
        }
        const sloganTex = new THREE.CanvasTexture(sloganCanvas);

        const slogan = new THREE.Mesh(
            new THREE.PlaneGeometry(8, 2),
            new THREE.MeshStandardMaterial({ map: sloganTex, roughness: 0.9 })
        );
        slogan.position.set(0, 5, -d/2 + 0.16);
        scene.add(slogan);

        const speaker = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.32, 0.35, 14),
            new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.7 })
        );
        speaker.rotation.x = Math.PI / 2;
        speaker.position.set(0, 6, -d/2 + 0.4);
        scene.add(speaker);

        const bracket = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 0.05, 0.3),
            new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
        );
        bracket.position.set(0, 6.2, -d/2 + 0.25);
        scene.add(bracket);

        addInteract(scene, 'chem_shop', 'chem_letter', 0, 1, 0, 0.9, 0.4, 1.6, '查看举报信');
        addInteract(scene, 'chem_shop', 'chem_cab', -12, 1.1, 8, 1.4, 2.2, 0.7, '打开工具柜');
        addInteract(scene, 'chem_shop', 'chem_speaker', 0, 6, -9.6, 0.8, 0.8, 0.8, '听广播');
    },

    colliders: [
        { minX: -15.3, maxX: 15.3, minZ: -10.2, maxZ: -9.7 },
        { minX: -15.3, maxX: 15.3, minZ: 9.7, maxZ: 10.2 },
        { minX: -15.3, maxX: -14.8, minZ: -10.2, maxZ: 10.2 },
        { minX: 14.8, maxX: 15.3, minZ: -10.2, maxZ: 10.2 },
        { minX: -7.5, maxX: -4.5, minZ: -7.5, maxZ: -4.5 },
        { minX: -4.5, maxX: -1.5, minZ: -7.5, maxZ: -4.5 },
        { minX: 1.5, maxX: 4.5, minZ: -7.5, maxZ: -4.5 },
        { minX: 4.5, maxX: 7.5, minZ: -7.5, maxZ: -4.5 },
        { minX: -7.5, maxX: -4.5, minZ: 4.5, maxZ: 7.5 },
        { minX: -4.5, maxX: -1.5, minZ: 4.5, maxZ: 7.5 },
        { minX: 1.5, maxX: 4.5, minZ: 4.5, maxZ: 7.5 },
        { minX: 4.5, maxX: 7.5, minZ: 4.5, maxZ: 7.5 },
        { minX: -2.5, maxX: 2.5, minZ: -1.1, maxZ: 1.1 },
        { minX: -12.9, maxX: -11.1, minZ: 7.5, maxZ: 8.5 }
    ],

    interactables: [],

    exits: [
        { x: -15, z: 0, w: 1.5, d: 2.5, to: 'tunnel',
          pos: { x: 38, y: 0, z: 0 }, yaw: -Math.PI/2 },
        { x: 0, z: -10.5, w: 2, d: 1.5, to: 'warehouse',
          pos: { x: 0, y: 0, z: 5 }, yaw: 0 },
        { x: 0, z: 10.5, w: 3, d: 1.5, to: 'collapse',
          pos: { x: 0, y: 0, z: -6 }, yaw: Math.PI }
    ],

    onEnter: {
        name: '',
        text: '化工厂车间。\n\n管道纵横交错。\n空气中有一股怪味。'
    }
};

/* =========================================================
   场景 9：化工厂 · 仓库
   ========================================================= */
window.MAPS.warehouse = {
    name: '化工厂 · 仓库',
    ambient: 'warehouse',

    build: function(scene) {
        const T = window.getTexture;
        const w = 20, d = 14, h = 6;

        const cementTex = T('cementFloor');
        cementTex.repeat.set(6, 4);
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(w, d),
            new THREE.MeshStandardMaterial({ map: cementTex, roughness: 0.95 })
        );
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);

        for (let i = 0; i < 8; i++) {
            const dust = new THREE.Mesh(
                new THREE.CircleGeometry(0.4 + Math.random() * 0.5, 16),
                new THREE.MeshBasicMaterial({
                    color: 0x8a8578, transparent: true,
                    opacity: 0.3, depthWrite: false
                })
            );
            dust.rotation.x = -Math.PI / 2;
            dust.position.set((Math.random() - 0.5) * 16, 0.01, (Math.random() - 0.5) * 10);
            scene.add(dust);
        }

        const ceil = new THREE.Mesh(
            new THREE.PlaneGeometry(w, d),
            new THREE.MeshStandardMaterial({
                map: T('concrete'), roughness: 0.95, color: 0x2a2a2a,
                side: THREE.DoubleSide
            })
        );
        ceil.rotation.x = Math.PI / 2;
        ceil.position.y = h;
        scene.add(ceil);

        for (let i = 0; i < 4; i++) {
            const x = -6 + (i % 2) * 12;
            const z = -3 + Math.floor(i / 2) * 6;
            const lit = i === 1 || i === 2;

            const base = new THREE.Mesh(
                new THREE.BoxGeometry(1.6, 0.1, 0.4),
                new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
            );
            base.position.set(x, h - 0.1, z);
            scene.add(base);

            const tube = new THREE.Mesh(
                new THREE.BoxGeometry(1.4, 0.06, 0.15),
                new THREE.MeshBasicMaterial({ color: lit ? 0xfff0c0 : 0x252525 })
            );
            tube.position.set(x, h - 0.18, z);
            scene.add(tube);

            if (lit) {
                const light = new THREE.PointLight(0xffe8a0, 0.6, 9);
                light.position.set(x, h - 1, z);
                scene.add(light);
            }
        }

        const wallTex = T('wallInterior');
        wallTex.repeat.set(6, 2);
        buildRoom(scene, 0, 0, w, d, h, wallTex, {
            doorSouth: { w: 2, h: 2.5 }
        });

        const shelfMat = new THREE.MeshStandardMaterial({
            map: T('rustMetal'), roughness: 0.9, color: 0x5a4a3a
        });

        for (let i = 0; i < 4; i++) {
            const x = -6 + i * 4;
            const group = new THREE.Group();

            [[-1.4, -0.5], [1.4, -0.5], [-1.4, 0.5], [1.4, 0.5]].forEach(function(p) {
                const post = new THREE.Mesh(
                    new THREE.BoxGeometry(0.08, 3.2, 0.08),
                    shelfMat
                );
                post.position.set(p[0], 1.6, p[1]);
                group.add(post);
            });

            for (let level = 0; level < 3; level++) {
                const board = new THREE.Mesh(
                    new THREE.BoxGeometry(2.9, 0.06, 1.1),
                    new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.9, metalness: 0.4 })
                );
                board.position.set(0, 0.4 + level * 1.1, 0);
                group.add(board);
            }

            for (let level = 0; level < 3; level++) {
                const rail = new THREE.Mesh(
                    new THREE.BoxGeometry(2.9, 0.03, 0.03),
                    shelfMat
                );
                rail.position.set(0, 0.4 + level * 1.1 + 0.04, -0.55);
                group.add(rail);
                const rail2 = rail.clone();
                rail2.position.z = 0.55;
                group.add(rail2);
            }

            group.position.set(x, 0, -4);
            scene.add(group);
        }

        const bagMat = new THREE.MeshStandardMaterial({
            color: 0x8a8070, roughness: 1.0
        });

        for (let i = 0; i < 25; i++) {
            const bag = new THREE.Mesh(
                new THREE.BoxGeometry(0.65, 0.32, 0.42),
                bagMat
            );
            const x = -7 + Math.random() * 14;
            const z = -2 + Math.random() * 8;
            const layer = Math.floor(i / 8);
            bag.position.set(x, 0.16 + layer * 0.33, z);
            bag.rotation.y = (Math.random() - 0.5) * 0.6;
            bag.rotation.z = (Math.random() - 0.5) * 0.15;
            scene.add(bag);
        }

        const brokenBag = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.15, 0.4),
            new THREE.MeshStandardMaterial({ color: 0x6a6050, roughness: 1.0 })
        );
        brokenBag.position.set(4, 0.08, 4);
        brokenBag.rotation.z = 0.3;
        scene.add(brokenBag);

        const spill = new THREE.Mesh(
            new THREE.CircleGeometry(0.7, 16),
            new THREE.MeshBasicMaterial({
                color: 0x9a9080, transparent: true,
                opacity: 0.5, depthWrite: false
            })
        );
        spill.rotation.x = -Math.PI / 2;
        spill.position.set(4.3, 0.02, 4.2);
        scene.add(spill);

        const cupMat = new THREE.MeshStandardMaterial({
            color: 0xeee0c8, roughness: 0.55
        });
        const cup = new THREE.Mesh(
            new THREE.CylinderGeometry(0.085, 0.06, 0.16, 16),
            cupMat
        );
        cup.position.set(3, 0.08, 3);
        cup.rotation.z = Math.PI / 2.2;
        cup.rotation.y = 0.4;
        scene.add(cup);

        const cupTextCanvas = document.createElement('canvas');
        cupTextCanvas.width = 128;
        cupTextCanvas.height = 64;
        const cctx = cupTextCanvas.getContext('2d');
        cctx.fillStyle = '#eee0c8';
        cctx.fillRect(0, 0, 128, 64);
        cctx.fillStyle = '#b02020';
        cctx.font = 'bold 16px serif';
        cctx.textAlign = 'center';
        cctx.fillText('先进工作者', 64, 30);
        cctx.fillText('1989', 64, 55);
        const cupTextTex = new THREE.CanvasTexture(cupTextCanvas);
        const cupLabel = new THREE.Mesh(
            new THREE.PlaneGeometry(0.1, 0.06),
            new THREE.MeshStandardMaterial({ map: cupTextTex, roughness: 0.7 })
        );
        cupLabel.position.set(3.02, 0.08, 2.94);
        cupLabel.rotation.z = -0.2;
        scene.add(cupLabel);

        const paperMat = new THREE.MeshStandardMaterial({
            color: 0xd8d0b8, roughness: 0.95, side: THREE.DoubleSide
        });
        const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.1), paperMat);
        paper.rotation.x = -Math.PI / 2;
        paper.rotation.z = 0.3;
        paper.position.set(3.05, 0.01, 3.1);
        scene.add(paper);

        const oldBoxMat = new THREE.MeshStandardMaterial({
            map: T('rustMetal'), roughness: 0.9, color: 0x6a4a2a
        });
        const oldBox = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.5), oldBoxMat);
        oldBox.position.set(-8, 0.25, 5);
        scene.add(oldBox);

        const oldBox2 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.45), oldBoxMat);
        oldBox2.position.set(-8, 0.7, 5.1);
        oldBox2.rotation.y = 0.2;
        scene.add(oldBox2);

        addInteract(scene, 'warehouse', 'wh_cup', 3, 0.1, 3, 0.5, 0.3, 0.5, '查看搪瓷杯');
        addInteract(scene, 'warehouse', 'wh_shelf', -6, 1.5, -4, 3, 3, 1.2, '查看货架');
    },

    colliders: [
        { minX: -10.3, maxX: 10.3, minZ: -7.2, maxZ: -6.7 },
        { minX: -10.3, maxX: 10.3, minZ: 6.7, maxZ: 7.2 },
        { minX: -10.3, maxX: -9.8, minZ: -7.2, maxZ: 7.2 },
        { minX: 9.8, maxX: 10.3, minZ: -7.2, maxZ: 7.2 },
        { minX: -7.5, maxX: -4.5, minZ: -4.6, maxZ: -3.4 },
        { minX: -3.5, maxX: -0.5, minZ: -4.6, maxZ: -3.4 },
        { minX: 0.5, maxX: 3.5, minZ: -4.6, maxZ: -3.4 },
        { minX: 4.5, maxX: 7.5, minZ: -4.6, maxZ: -3.4 }
    ],

    interactables: [],

    exits: [
        { x: 0, z: 7.5, w: 2, d: 1.5, to: 'chem_shop',
          pos: { x: 0, y: 0, z: -8 }, yaw: Math.PI }
    ],

    onEnter: {
        name: '',
        text: '仓库。\n\n水泥袋堆到天花板。\n全是325号。'
    }
};

/* =========================================================
   场景 10：化工厂 · 塌陷区（结局场景）
   ========================================================= */
window.MAPS.collapse = {
    name: '化工厂 · 塌陷区',
    ambient: 'collapse',

    build: function(scene) {
        const T = window.getTexture;
        const w = 20, d = 16, h = 5;

        const rubbleMat = new THREE.MeshStandardMaterial({
            map: T('dirtGround'), roughness: 1.0, color: 0x6a6050
        });
        const ground = new THREE.Mesh(new THREE.PlaneGeometry(w, d), rubbleMat);
        ground.rotation.x = -Math.PI / 2;
        scene.add(ground);

        const pit = new THREE.Mesh(
            new THREE.CircleGeometry(3.5, 32),
            new THREE.MeshBasicMaterial({ color: 0x000000 })
        );
        pit.rotation.x = -Math.PI / 2;
        pit.position.y = 0.01;
        scene.add(pit);

        const edgeMat = new THREE.MeshStandardMaterial({
            map: T('concrete'), roughness: 0.95, color: 0x4a4538
        });
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const r = 3.5;
            const shard = new THREE.Mesh(
                new THREE.BoxGeometry(0.6 + Math.random() * 0.5, 0.15, 0.4 + Math.random() * 0.3),
                edgeMat
            );
            shard.position.set(
                Math.cos(angle) * r,
                0.075,
                Math.sin(angle) * r
            );
            shard.rotation.set(
                (Math.random() - 0.5) * 0.4,
                angle + (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.3
            );
            scene.add(shard);
        }

        const ceil = new THREE.Mesh(
            new THREE.PlaneGeometry(w, d),
            new THREE.MeshStandardMaterial({
                map: T('concrete'), roughness: 0.95, color: 0x2a2520,
                side: THREE.DoubleSide
            })
        );
        ceil.rotation.x = Math.PI / 2;
        ceil.position.y = h;
        scene.add(ceil);

        const hole = new THREE.Mesh(
            new THREE.CircleGeometry(4, 24),
            new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide })
        );
        hole.rotation.x = Math.PI / 2;
        hole.position.y = h - 0.01;
        scene.add(hole);

        const moonBeam = new THREE.SpotLight(0x8fa8d8, 1.2, 20, Math.PI / 8, 0.6, 1.0);
        moonBeam.position.set(0, h + 5, 0);
        moonBeam.target.position.set(0, 0, 0);
        scene.add(moonBeam);
        scene.add(moonBeam.target);

        const wallTex = T('concrete');
        wallTex.repeat.set(6, 2);
        buildRoom(scene, 0, 0, w, d, h, wallTex, {
            doorNorth: { w: 2.5, h: 3 }
        });

        for (let i = 0; i < 5; i++) {
            const crackCanvas = document.createElement('canvas');
            crackCanvas.width = 256;
            crackCanvas.height = 256;
            const cctx = crackCanvas.getContext('2d');
            cctx.strokeStyle = 'rgba(10,8,5,0.8)';
            cctx.lineWidth = 2;
            cctx.beginPath();
            let x = 128, y = 0;
            cctx.moveTo(x, y);
            for (let j = 0; j < 10; j++) {
                x += (Math.random() - 0.5) * 60;
                y += 25;
                cctx.lineTo(x, y);
            }
            cctx.stroke();
            const crackTex = new THREE.CanvasTexture(crackCanvas);
            const crack = new THREE.Mesh(
                new THREE.PlaneGeometry(2, 4),
                new THREE.MeshBasicMaterial({
                    map: crackTex, transparent: true, depthWrite: false
                })
            );
            const positions = [
                { x: -w/2 + 0.16, z: 0, ry: Math.PI / 2 },
                { x: w/2 - 0.16, z: 0, ry: -Math.PI / 2 },
                { x: 0, z: -d/2 + 0.16, ry: 0 },
                { x: 0, z: d/2 - 0.16, ry: 0 },
                { x: -w/2 + 0.16, z: 3, ry: Math.PI / 2 }
            ][i];
            crack.position.set(positions.x, 2.5, positions.z);
            crack.rotation.y = positions.ry;
            scene.add(crack);
        }

        const rockMat = new THREE.MeshStandardMaterial({
            map: T('concrete'), roughness: 0.95, color: 0x6a6a60
        });

        for (let i = 0; i < 50; i++) {
            const size = 0.15 + Math.random() * 0.7;
            const rock = new THREE.Mesh(
                new THREE.DodecahedronGeometry(size, 0),
                rockMat
            );
            const angle = Math.random() * Math.PI * 2;
            const r = 3.8 + Math.random() * 5;
            rock.position.set(Math.cos(angle) * r, size / 2, Math.sin(angle) * r);
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            scene.add(rock);
        }

        const rebarMat = new THREE.MeshStandardMaterial({
            map: T('rustMetal'), roughness: 0.9, color: 0x5a3a2a
        });
        for (let i = 0; i < 8; i++) {
            const rebar = new THREE.Mesh(
                new THREE.CylinderGeometry(0.03, 0.03, 0.8 + Math.random() * 0.6, 6),
                rebarMat
            );
            const angle = Math.random() * Math.PI * 2;
            const r = 3.5 + Math.random() * 0.8;
            rebar.position.set(
                Math.cos(angle) * r,
                0.4,
                Math.sin(angle) * r
            );
            rebar.rotation.z = (Math.random() - 0.5) * 0.8;
            rebar.rotation.x = (Math.random() - 0.5) * 0.5;
            scene.add(rebar);
        }

        const markCanvas = document.createElement('canvas');
        markCanvas.width = 256;
        markCanvas.height = 256;
        const mctx = markCanvas.getContext('2d');
        mctx.fillStyle = '#3a1010';
        mctx.fillRect(0, 0, 256, 256);
        mctx.fillStyle = '#c9a877';
        mctx.font = 'bold 140px monospace';
        mctx.textAlign = 'center';
        mctx.textBaseline = 'middle';
        mctx.fillText('47', 128, 128);
        const markTexture = new THREE.CanvasTexture(markCanvas);

        const markMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(0.9, 0.9),
            new THREE.MeshStandardMaterial({ map: markTexture, roughness: 0.9 })
        );
        markMesh.rotation.x = -Math.PI / 2;
        markMesh.position.set(-5, 0.02, 5);
        scene.add(markMesh);

        const ashMat = new THREE.MeshBasicMaterial({
            color: 0x3a3a3a, transparent: true, opacity: 0.7
        });
        const ash = new THREE.Mesh(new THREE.CircleGeometry(0.5, 24), ashMat);
        ash.rotation.x = -Math.PI / 2;
        ash.position.set(-5, 0.025, 5.6);
        scene.add(ash);

        for (let i = 0; i < 3; i++) {
            const incense = new THREE.Mesh(
                new THREE.CylinderGeometry(0.01, 0.01, 0.15, 6),
                new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.9 })
            );
            incense.position.set(-5 + (i - 1) * 0.15, 0.075, 5.55);
            incense.rotation.x = (Math.random() - 0.5) * 0.3;
            scene.add(incense);
        }

        for (let i = 0; i < 5; i++) {
            const paperMoney = new THREE.Mesh(
                new THREE.PlaneGeometry(0.08, 0.08),
                new THREE.MeshStandardMaterial({
                    color: 0xd8c878, roughness: 0.95, side: THREE.DoubleSide
                })
            );
            paperMoney.rotation.x = -Math.PI / 2;
            paperMoney.rotation.z = Math.random() * Math.PI;
            paperMoney.position.set(-5 + (Math.random() - 0.5) * 1.5, 0.02, 5.5 + (Math.random() - 0.5) * 1.5);
            scene.add(paperMoney);
        }

        const boneMat = new THREE.MeshStandardMaterial({
            color: 0xd8d0b8, roughness: 0.9
        });

        for (let i = 0; i < 5; i++) {
            const bone = new THREE.Mesh(
                new THREE.CylinderGeometry(0.04 + Math.random() * 0.02, 0.04 + Math.random() * 0.02, 0.25 + Math.random() * 0.35, 8),
                boneMat
            );
            bone.position.set(
                2 + (Math.random() - 0.5) * 0.8,
                0.08,
                2 + (Math.random() - 0.5) * 0.8
            );
            bone.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            scene.add(bone);
        }

        const skull = new THREE.Mesh(
            new THREE.SphereGeometry(0.13, 16, 12),
            boneMat
        );
        skull.scale.set(1, 0.95, 1.1);
        skull.position.set(2.4, 0.11, 2.2);
        skull.rotation.y = 0.5;
        scene.add(skull);

        [-0.05, 0.05].forEach(function(dx) {
            const socket = new THREE.Mesh(
                new THREE.SphereGeometry(0.04, 8, 8),
                new THREE.MeshStandardMaterial({ color: 0x1a1408, roughness: 0.9 })
            );
            socket.position.set(2.4 + dx, 0.13, 2.28);
            scene.add(socket);
        });

        const clothMat = new THREE.MeshStandardMaterial({
            map: T('skinOld'), roughness: 1.0, side: THREE.DoubleSide
        });
        for (let i = 0; i < 6; i++) {
            const cloth = new THREE.Mesh(
                new THREE.PlaneGeometry(0.4 + Math.random() * 0.3, 0.3 + Math.random() * 0.3),
                clothMat
            );
            cloth.rotation.x = -Math.PI / 2;
            cloth.rotation.z = Math.random() * Math.PI;
            cloth.position.set(
                2.1 + (Math.random() - 0.5) * 0.5,
                0.02 + i * 0.01,
                2.1 + (Math.random() - 0.5) * 0.5
            );
            scene.add(cloth);
        }

        const receiptCanvas = document.createElement('canvas');
        receiptCanvas.width = 256;
        receiptCanvas.height = 320;
        const rctx = receiptCanvas.getContext('2d');
        rctx.fillStyle = '#d8d0b0';
        rctx.fillRect(0, 0, 256, 320);
        for (let i = 0; i < 80; i++) {
            rctx.fillStyle = 'rgba(90,70,50,' + (Math.random() * 0.4) + ')';
            rctx.fillRect(Math.random() * 256, Math.random() * 320, Math.random() * 20, Math.random() * 15);
        }
        rctx.fillStyle = '#0a0808';
        rctx.beginPath();
        rctx.moveTo(160, 320);
        rctx.lineTo(256, 250);
        rctx.lineTo(256, 320);
        rctx.closePath();
        rctx.fill();
        rctx.fillStyle = 'rgba(60,40,20,0.85)';
        rctx.font = 'bold 24px serif';
        rctx.textAlign = 'center';
        rctx.fillText('汇款单', 128, 40);
        rctx.font = '18px serif';
        rctx.textAlign = 'left';
        rctx.fillText('收款人：', 30, 100);
        rctx.fillText('秀兰', 130, 100);
        rctx.fillText('地址：安徽省阜阳市', 30, 140);
        rctx.fillText('    陈庄村', 130, 175);
        rctx.fillText('金额：', 30, 220);
        rctx.fillText('六十元整', 130, 220);
        rctx.fillText('汇款人：', 30, 265);
        rctx.font = 'bold 22px 楷体,serif';
        rctx.fillText('陈广志', 130, 265);
        for (let i = 0; i < 40; i++) {
            rctx.fillStyle = 'rgba(140,120,90,' + (Math.random() * 0.3) + ')';
            rctx.fillRect(Math.random() * 256, Math.random() * 320, Math.random() * 30, Math.random() * 20);
        }
        const receiptTex = new THREE.CanvasTexture(receiptCanvas);

        const receipt = new THREE.Mesh(
            new THREE.PlaneGeometry(0.3, 0.38),
            new THREE.MeshStandardMaterial({
                map: receiptTex, roughness: 0.95, side: THREE.DoubleSide
            })
        );
        receipt.rotation.x = -Math.PI / 2;
        receipt.rotation.z = 0.3;
        receipt.position.set(1.7, 0.025, 2.5);
        scene.add(receipt);

        const dimLight = new THREE.PointLight(0x445566, 0.3, 12);
        dimLight.position.set(0, 4, 0);
        scene.add(dimLight);

        addInteract(scene, 'collapse', 'col_bones', 2, 0.15, 2.2, 1.2, 0.6, 1.2, '查看遗骨');
        addInteract(scene, 'collapse', 'col_mark', -5, 0.05, 5, 1.2, 0.4, 1.2, '查看桩位标记');
    },

    colliders: [
        { minX: -10.3, maxX: 10.3, minZ: -8.2, maxZ: -7.7 },
        { minX: -10.3, maxX: 10.3, minZ: 7.7, maxZ: 8.2 },
        { minX: -10.3, maxX: -9.8, minZ: -8.2, maxZ: 8.2 },
        { minX: 9.8, maxX: 10.3, minZ: -8.2, maxZ: 8.2 }
    ],

    interactables: [],

    exits: [
        { x: 0, z: -8.5, w: 2.5, d: 1.5, to: 'chem_shop',
          pos: { x: 0, y: 0, z: -3 }, yaw: 0 }
    ],

    onEnter: {
        name: '',
        text: '塌陷区。\n\n这里的地面陷下去了一大块。\n露出来的东西……'
    }
};