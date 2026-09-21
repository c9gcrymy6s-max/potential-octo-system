/* =========================================================
   engine.js · v6
   出口检测：圆形距离 + 移动距离武装
   ========================================================= */

const ENGINE = {
    state: {
        sceneId: null,
        clues: {},
        flags: {},
        dialogue: null,
        dialogueQueue: [],
        started: false,
        frozen: false,
        paused: false,
        currentInteractable: null,
        lastStepTime: 0,
        moveSpeed: 3.2,
        sprintSpeed: 5.4,
        endingStarted: false,
        pendingTransition: null
    },

    scene: null,
    camera: null,
    renderer: null,
    clock: null,
    raycaster: null,
    ambientLight: null,
    hemiLight: null,
    moonLight: null,
    flashlight: null,
    flashlightTarget: null,
    flashlightOn: true,

    _tmpDir: null,
    _raycastCounter: 0,
    _sceneChangeToken: 0,
    _lastExitTime: 0,
    _movedDist: 0,
    _lastX: 0,
    _lastZ: 0,
    _currentPuzzleId: null,

    player: {
        position: null,
        yaw: 0,
        pitch: 0,
        keys: {},
        height: 1.7,
        radius: 0.35,
        bobPhase: 0
    },

    interactables: [],
    colliders: [],
    dom: {},

    sceneTransitions: {
        'gate_iron':      { to: 'main_hall', pos: { x: 0, y: 0, z: 2 },    yaw: 0 },
        'turbine_tunnel': { to: 'tunnel',    pos: { x: -35, y: 0, z: 0 },  yaw: Math.PI / 2 },
        'hall_stair':     { to: 'turbine',   pos: { x: 0, y: 0, z: 5 },    yaw: 0 }
    },

    init: function() {
        this._tmpDir = new THREE.Vector3();
        this.player.position = new THREE.Vector3(0, 1.7, 0);

        this.cacheDom();
        this.initThree();
        this.bindInput();

        var self = this;
        this.dom.title_screen.addEventListener('click', function() {
            self.start();
        });
    },

    cacheDom: function() {
        var ids = [
            'three-container', 'crosshair', 'interact-hint', 'interact-key', 'interact-text',
            'hud-scene', 'hud-clues', 'hud-light',
            'dialogue', 'dialogue-name', 'dialogue-text', 'dialogue-more',
            'inventory', 'inventory-list', 'inventory-detail',
            'inventory-detail-title', 'inventory-detail-body',
            'puzzle', 'puzzle-title', 'puzzle-hint', 'puzzle-input', 'puzzle-error',
            'docview', 'docview-content',
            'ending', 'ending-content',
            'scene-fade', 'title-screen'
        ];
        var self = this;
        ids.forEach(function(id) {
            self.dom[id.replace(/-/g, '_')] = document.getElementById(id);
        });
    },

    initThree: function() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x0a0d14, 0.010);

        this.camera = new THREE.PerspectiveCamera(
            70, window.innerWidth / window.innerHeight, 0.1, 200
        );
        this.camera.rotation.order = 'YXZ';

        this.renderer = new THREE.WebGLRenderer({
            antialias: false,
            powerPreference: 'high-performance',
            stencil: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(1);
        this.renderer.shadowMap.enabled = false;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.15;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.dom.three_container.appendChild(this.renderer.domElement);

        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();

        this.ambientLight = new THREE.AmbientLight(0x2a3040, 0.6);
        this.scene.add(this.ambientLight);

        this.hemiLight = new THREE.HemisphereLight(0x3a4a6a, 0x15100a, 0.55);
        this.scene.add(this.hemiLight);

        this.moonLight = new THREE.DirectionalLight(0x9ab4e0, 0.5);
        this.moonLight.position.set(-40, 80, -30);
        this.scene.add(this.moonLight);

        this.scene.add(this.camera);

        this.flashlight = new THREE.SpotLight(0xffe0b0, 2.5, 25, Math.PI / 7, 0.55, 1.2);
        this.flashlight.position.set(0, 0, 0);
        this.scene.add(this.flashlight);

        this.flashlightTarget = new THREE.Object3D();
        this.flashlightTarget.position.set(0, 1.7, -10);
        this.scene.add(this.flashlightTarget);
        this.flashlight.target = this.flashlightTarget;

        var self = this;
        window.addEventListener('resize', function() { self.onResize(); });
    },

    onResize: function() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    },

    bindInput: function() {
        var self = this;

        document.addEventListener('keydown', function(e) {
            var k = e.key.toLowerCase();
            self.player.keys[k] = true;

            if (!self.state.started) { self.start(); return; }
            if (self.state.frozen || self.state.endingStarted) return;

            if (self.state.dialogue) {
                if (k === 'e' || k === ' ' || k === 'enter') self.advanceDialogue();
                return;
            }

            if (k === 'e') self.tryInteract();
            if (k === 'i' || k === 'tab') { e.preventDefault(); self.toggleInventory(); }
            if (k === 'f') self.toggleFlashlight();
            if (k === 'escape') {
                if (!self.dom.inventory.classList.contains('hidden')) self.toggleInventory();
                if (!self.dom.puzzle.classList.contains('hidden')) self.closePuzzle();
                if (!self.dom.docview.classList.contains('hidden')) self.closeDoc();
            }
        });

        document.addEventListener('keyup', function(e) {
            self.player.keys[e.key.toLowerCase()] = false;
        });

        this.dom.three_container.addEventListener('click', function() {
            if (!self.state.started) return;
            if (self.state.frozen || self.state.dialogue || self.state.endingStarted) return;
            if (!self.dom.inventory.classList.contains('hidden')) return;
            if (!self.dom.puzzle.classList.contains('hidden')) return;
            if (!self.dom.docview.classList.contains('hidden')) return;
            if (document.pointerLockElement !== self.renderer.domElement) {
                self.renderer.domElement.requestPointerLock();
            }
        });

        document.addEventListener('mousemove', function(e) {
            if (document.pointerLockElement !== self.renderer.domElement) return;
            if (self.state.frozen || self.state.paused) return;
            var sens = 0.002;
            self.player.yaw -= e.movementX * sens;
            self.player.pitch -= e.movementY * sens;
            var maxPitch = Math.PI / 2 - 0.05;
            self.player.pitch = Math.max(-maxPitch, Math.min(maxPitch, self.player.pitch));
        });

        document.addEventListener('pointerlockchange', function() {
            var locked = document.pointerLockElement === self.renderer.domElement;
            self.state.paused = !locked;
        });
    },

    start: function() {
        if (this.state.started) return;
        this.state.started = true;
        this.dom.title_screen.classList.add('hidden');

        var sceneId = (window.STORY && window.STORY.startScene) || 'road';
        var pos = (window.STORY && window.STORY.startPos) || { x: 0, y: 0, z: 0 };
        var yaw = (window.STORY && window.STORY.startYaw) || 0;

        this.loadScene(sceneId, pos, yaw);
        this.loop();

        var self = this;
        setTimeout(function() {
            self.renderer.domElement.requestPointerLock();
        }, 100);
    },

    loadScene: function(sceneId, pos, yaw) {
        var sceneData = window.MAPS && window.MAPS[sceneId];
        if (!sceneData) { console.error('场景不存在:', sceneId); return; }
        this.state.sceneId = sceneId;

        this.interactables = [];
        if (sceneData.interactables) {
            sceneData.interactables.length = 0;
        } else {
            sceneData.interactables = [];
        }

        this.clearScene();
        sceneData.build(this.scene);

        this.player.position.set(pos.x || 0, this.player.height + (pos.y || 0), pos.z || 0);
        this.player.yaw = yaw || 0;
        this.player.pitch = 0;

        this.colliders = sceneData.colliders ? sceneData.colliders.slice() : [];
        this.interactables = sceneData.interactables;

        this.dom.hud_scene.textContent = sceneData.name || '';

        if (sceneData.ambient && window.playAmbient) playAmbient(sceneData.ambient);

        this._lastExitTime = performance.now();
        this._movedDist = 0;
        this._lastX = this.player.position.x;
        this._lastZ = this.player.position.z;

        if (sceneData.onEnter && !this.state.flags['entered_' + sceneId]) {
            this.state.flags['entered_' + sceneId] = true;
            var self = this;
            setTimeout(function() {
                self.showDialogue('', sceneData.onEnter.text);
            }, 400);
        }

        this.updateClueCount();
    },

    clearScene: function() {
        var self = this;
        var toRemove = [];
        this.scene.traverse(function(obj) {
            if (obj === self.camera) return;
            if (obj === self.flashlight) return;
            if (obj === self.flashlightTarget) return;
            if (obj === self.ambientLight) return;
            if (obj === self.hemiLight) return;
            if (obj === self.moonLight) return;
            if (obj.parent === self.scene) toRemove.push(obj);
        });
        toRemove.forEach(function(obj) {
            self.scene.remove(obj);
            if (obj.geometry) {
                try { obj.geometry.dispose(); } catch (e) {}
            }
        });
    },

    changeScene: function(sceneId, pos, yaw) {
        var fade = this.dom.scene_fade;
        fade.classList.add('active');
        var self = this;
        var token = ++this._sceneChangeToken;

        setTimeout(function() {
            if (token !== self._sceneChangeToken) return;
            self.loadScene(sceneId, pos, yaw);
            setTimeout(function() {
                if (token !== self._sceneChangeToken) return;
                fade.classList.remove('active');
            }, 250);
        }, 400);
    },

    loop: function() {
        var self = this;
        requestAnimationFrame(function() { self.loop(); });
        var dt = Math.min(this.clock.getDelta(), 0.05);
        if (this.state.started && !this.state.frozen && !this.state.dialogue && !this.state.paused && !this.state.endingStarted) {
            this.update(dt);
        }
        this.render();
    },

    update: function(dt) {
        this.updateMovement(dt);
        this.updateCamera();

        this._raycastCounter++;
        if (this._raycastCounter >= 3) {
            this._raycastCounter = 0;
            this.updateInteraction();
        }

        this.updateFlashlight();
        this.checkExits();
    },

    /* ---------- 出口检测 v6：圆形距离 + 移动距离武装 ---------- */
    checkExits: function() {
        var sceneData = window.MAPS[this.state.sceneId];
        if (!sceneData || !sceneData.exits) return;

        var now = performance.now();
        if (now - this._lastExitTime < 1200) return;

        var p = this.player.position;

        // 累计移动距离
        var mdx = p.x - this._lastX;
        var mdz = p.z - this._lastZ;
        this._movedDist += Math.sqrt(mdx * mdx + mdz * mdz);
        this._lastX = p.x;
        this._lastZ = p.z;

        // 没走够 2 米不检测
        if (this._movedDist < 2.0) return;

        for (var i = 0; i < sceneData.exits.length; i++) {
            var e = sceneData.exits[i];
            var dx = p.x - e.x;
            var dz = p.z - e.z;
            var dist = Math.sqrt(dx * dx + dz * dz);

            // 触发半径 2.5 米（覆盖墙厚 + 玩家半径）
            if (dist < 2.5) {
                this._lastExitTime = now;
                this._movedDist = 0;
                this.changeScene(e.to, e.pos, e.yaw);
                return;
            }
        }
    },

    updateMovement: function(dt) {
        var keys = this.player.keys;
        var p = this.player;

        var forward = 0, strafe = 0;
        if (keys['w'] || keys['arrowup']) forward += 1;
        if (keys['s'] || keys['arrowdown']) forward -= 1;
        if (keys['d'] || keys['arrowright']) strafe += 1;
        if (keys['a'] || keys['arrowleft']) strafe -= 1;

        var sprinting = keys['shift'];
        var speed = sprinting ? this.state.sprintSpeed : this.state.moveSpeed;

        var sinY = Math.sin(p.yaw);
        var cosY = Math.cos(p.yaw);

        var dx = 0, dz = 0;
        if (forward !== 0) {
            dx -= sinY * forward * speed * dt;
            dz -= cosY * forward * speed * dt;
        }
        if (strafe !== 0) {
            dx += cosY * strafe * speed * dt;
            dz -= sinY * strafe * speed * dt;
        }

        if (dx !== 0 || dz !== 0) {
            var newX = p.position.x + dx;
            if (!this.checkCollision(newX, p.position.z)) p.position.x = newX;
            var newZ = p.position.z + dz;
            if (!this.checkCollision(p.position.x, newZ)) p.position.z = newZ;

            var now = performance.now();
            var interval = sprinting ? 260 : 380;
            if (now - this.state.lastStepTime > interval) {
                this.state.lastStepTime = now;
                if (window.playSfx) playSfx('step');
            }
            p.bobPhase += dt * (sprinting ? 14 : 9);
        } else {
            p.bobPhase = 0;
        }
    },

    checkCollision: function(x, z) {
        var p = this.player;
        var r = p.radius;
        for (var i = 0; i < this.colliders.length; i++) {
            var c = this.colliders[i];
            if (x + r > c.minX && x - r < c.maxX &&
                z + r > c.minZ && z - r < c.maxZ) return true;
        }
        return false;
    },

    updateCamera: function() {
        var p = this.player;
        var bobY = Math.sin(p.bobPhase) * 0.025;
        var bobX = Math.cos(p.bobPhase * 0.5) * 0.01;

        this.camera.position.set(
            p.position.x + bobX * Math.cos(p.yaw),
            p.position.y + bobY,
            p.position.z + bobX * Math.sin(p.yaw)
        );
        this.camera.rotation.y = p.yaw;
        this.camera.rotation.x = p.pitch;
    },

    updateFlashlight: function() {
        if (!this.flashlight || !this.flashlightTarget) return;
        this.flashlight.position.copy(this.camera.position);
        this.camera.getWorldDirection(this._tmpDir);
        this.flashlightTarget.position.copy(this.camera.position);
        this.flashlightTarget.position.addScaledVector(this._tmpDir, 10);
    },

    updateInteraction: function() {
        if (!this.interactables || this.interactables.length === 0) {
            this.setInteractHint(null);
            this.state.currentInteractable = null;
            return;
        }
        this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
        this.raycaster.far = 4.0;

        var meshes = [];
        for (var i = 0; i < this.interactables.length; i++) {
            var item = this.interactables[i];
            if (item.mesh) {
                item.mesh.userData.__interactId = item.id;
                meshes.push(item.mesh);
            }
        }

        var hits = this.raycaster.intersectObjects(meshes, false);

        if (hits.length > 0) {
            var id = hits[0].object.userData.__interactId;
            if (id) {
                for (var j = 0; j < this.interactables.length; j++) {
                    if (this.interactables[j].id === id) {
                        this.setInteractHint(this.interactables[j]);
                        this.state.currentInteractable = this.interactables[j];
                        return;
                    }
                }
            }
        }
        this.setInteractHint(null);
        this.state.currentInteractable = null;
    },

    setInteractHint: function(item) {
        if (item) {
            this.dom.interact_hint.classList.remove('hidden');
            this.dom.interact_text.textContent = item.label || '查看';
            this.dom.crosshair.classList.add('active');
        } else {
            this.dom.interact_hint.classList.add('hidden');
            this.dom.crosshair.classList.remove('active');
        }
    },

    tryInteract: function() {
        var item = this.state.currentInteractable;
        if (!item) return;

        var storyObj = (window.STORY && window.STORY.objects && window.STORY.objects[item.id]) || null;
        var transition = this.sceneTransitions[item.id];

        if (storyObj) {
            if (storyObj.clue && !this.state.clues[item.id]) {
                this.state.clues[item.id] = true;
                this.updateClueCount();
                if (window.playSfx) playSfx('pickup');
            }

            if (storyObj.dialogue) {
                this.showDialogue(storyObj.name || item.label || '', storyObj.dialogue);
            }

            if (storyObj.onInteract) storyObj.onInteract(this.state, this);

            if (storyObj.isEnding) {
                var self = this;
                setTimeout(function() { self.startEnding(); }, 2200);
                return;
            }

            if (transition && storyObj.dialogue) {
                this.state.pendingTransition = transition;
                return;
            }
        } else {
            if (item.defaultDialogue) this.showDialogue(item.label || '', item.defaultDialogue);
            else this.showDialogue(item.label || '', '什么也没有。');
        }

        if (transition && !storyObj) {
            this.changeScene(transition.to, transition.pos, transition.yaw);
        }
    },

    showDialogue: function(name, text) {
        this.state.dialogue = { name: name, text: text };
        this.dom.dialogue_name.textContent = name;
        this.dom.dialogue_text.textContent = text;
        this.dom.dialogue.classList.remove('hidden');
        this.dom.dialogue_more.classList.remove('hidden');
        if (document.pointerLockElement) document.exitPointerLock();
    },

    advanceDialogue: function() {
        if (this.state.dialogueQueue.length > 0) {
            var next = this.state.dialogueQueue.shift();
            this.showDialogue(next.name, next.text);
            return;
        }
        this.state.dialogue = null;
        this.dom.dialogue.classList.add('hidden');

        if (this.state.pendingTransition) {
            var t = this.state.pendingTransition;
            this.state.pendingTransition = null;
            var self = this;
            setTimeout(function() {
                self.changeScene(t.to, t.pos, t.yaw);
            }, 200);
            return;
        }

        if (this.state.started && !this.state.frozen && !this.state.endingStarted) {
            var self2 = this;
            setTimeout(function() {
                self2.renderer.domElement.requestPointerLock();
            }, 50);
        }
    },

    toggleInventory: function() {
        this.dom.inventory.classList.toggle('hidden');
        if (!this.dom.inventory.classList.contains('hidden')) {
            this.renderInventory();
            if (document.pointerLockElement) document.exitPointerLock();
            this.state.paused = true;
        } else {
            this.dom.inventory_detail.classList.add('hidden');
            if (this.state.started && !this.state.frozen) {
                var self = this;
                setTimeout(function() {
                    self.renderer.domElement.requestPointerLock();
                }, 50);
            }
        }
    },

    renderInventory: function() {
        var keys = Object.keys(this.state.clues);
        if (keys.length === 0) {
            this.dom.inventory_list.innerHTML = '<li class="empty">还没有找到任何线索</li>';
            return;
        }
        var clueData = (window.STORY && window.STORY.clues) || {};
        var html = '';
        keys.forEach(function(k, i) {
            var c = clueData[k];
            if (!c) return;
            html += '<li data-clue="' + k + '">' +
                '<span>' + c.name + '</span>' +
                '<span class="clue-index">' + String(i + 1).padStart(2, '0') + '</span>' +
                '</li>';
        });
        this.dom.inventory_list.innerHTML = html;
        var self = this;
        this.dom.inventory_list.querySelectorAll('li[data-clue]').forEach(function(li) {
            li.addEventListener('click', function() {
                self.showInventoryDetail(li.dataset.clue);
            });
        });
    },

    showInventoryDetail: function(clueId) {
        var c = (window.STORY && window.STORY.clues && window.STORY.clues[clueId]);
        if (!c) return;
        this.dom.inventory_detail_title.textContent = c.name;
        this.dom.inventory_detail_body.textContent = c.desc;
        this.dom.inventory_detail.classList.remove('hidden');
    },

    closeInventoryDetail: function() {
        this.dom.inventory_detail.classList.add('hidden');
    },

    updateClueCount: function() {
        var total = Object.keys((window.STORY && window.STORY.clues) || {}).length;
        var found = Object.keys(this.state.clues).length;
        this.dom.hud_clues.textContent = '线索 ' + found + '/' + total;
    },

    toggleFlashlight: function() {
        this.flashlightOn = !this.flashlightOn;
        this.flashlight.intensity = this.flashlightOn ? 2.5 : 0;
        this.dom.hud_light.classList.toggle('on', this.flashlightOn);
        if (window.playSfx) playSfx('switch');
    },

    showPuzzle: function(id, title, hint) {
        this.dom.puzzle.classList.remove('hidden');
        this.dom.puzzle_title.textContent = title || '';
        this.dom.puzzle_hint.textContent = hint || '';
        this.dom.puzzle_error.textContent = '';
        this.dom.puzzle_input.value = '';
        this._currentPuzzleId = id;
        if (document.pointerLockElement) document.exitPointerLock();
        var self = this;
        setTimeout(function() { self.dom.puzzle_input.focus(); }, 50);
    },

    submitPuzzle: function() {
        var id = this._currentPuzzleId;
        var val = (this.dom.puzzle_input.value || '').trim();
        var puzzle = (window.STORY && window.STORY.puzzles && window.STORY.puzzles[id]) || null;
        if (!puzzle) { this.closePuzzle(); return; }
        if (val === puzzle.answer) {
            this.closePuzzle();
            if (puzzle.onSolve) puzzle.onSolve(this.state, this);
        } else {
            this.dom.puzzle_error.textContent = '答案不对。';
            if (window.playSfx) playSfx('error');
        }
    },

    closePuzzle: function() {
        this.dom.puzzle.classList.add('hidden');
        this._currentPuzzleId = null;
        if (this.state.started && !this.state.frozen) {
            var self = this;
            setTimeout(function() {
                self.renderer.domElement.requestPointerLock();
            }, 50);
        }
    },

    showDoc: function(html) {
        this.dom.docview.classList.remove('hidden');
        this.dom.docview_content.innerHTML = html;
        if (document.pointerLockElement) document.exitPointerLock();
    },

    closeDoc: function() {
        this.dom.docview.classList.add('hidden');
        if (this.state.started && !this.state.frozen) {
            var self = this;
            setTimeout(function() {
                self.renderer.domElement.requestPointerLock();
            }, 50);
        }
    },

    startEnding: function() {
        if (this.state.endingStarted) return;
        this.state.endingStarted = true;
        this.state.frozen = true;
        if (document.pointerLockElement) document.exitPointerLock();
        if (window.stopAmbient) stopAmbient();

        var lines = (window.STORY && window.STORY.ending) || [];
        this.dom.ending.classList.remove('hidden');
        this.dom.ending_content.innerHTML = '';

        if (window.playSfx) playSfx('ending');

        var self = this;
        var delay = 800;
        lines.forEach(function(line) {
            var wait = line.pause || 800;
            var el = null;
            if (line.text) {
                el = document.createElement('div');
                el.className = line.big ? 'big' : (line.num ? 'num' : 'line');
                el.style.opacity = '0';
                el.textContent = line.text;
                self.dom.ending_content.appendChild(el);
            }
            setTimeout(function() {
                if (el) {
                    el.style.transition = 'opacity 1.2s ease';
                    el.style.opacity = '1';
                }
            }, delay);
            delay += wait;
        });
    },

    render: function() {
        this.renderer.render(this.scene, this.camera);
    }
};

window.ENGINE = ENGINE;

window.toggleInventory = function() { ENGINE.toggleInventory(); };
window.closeInventoryDetail = function() { ENGINE.closeInventoryDetail(); };
window.toggleFlashlight = function() { ENGINE.toggleFlashlight(); };
window.submitPuzzle = function() { ENGINE.submitPuzzle(); };
window.closePuzzle = function() { ENGINE.closePuzzle(); };
window.closeDoc = function() { ENGINE.closeDoc(); };

window.addEventListener('load', function() {
    ENGINE.init();
});