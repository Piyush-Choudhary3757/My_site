// ---- 3D Neural Network Background (Three.js) ----
// Creates a living, breathing neural network mesh behind the portfolio

(function () {
    'use strict';

    function initNeuralBackground() {
        if (typeof THREE === 'undefined') return;

        const canvas = document.getElementById('neural-canvas');
        if (!canvas) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 30;
        camera.position.y = 2;

        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);

        // Neural network node data
        const nodeCount = Math.min(80, Math.floor(window.innerWidth * 0.04));
        const nodes = [];
        const nodeGeometry = new THREE.SphereGeometry(0.08, 8, 8);

        // Create nodes in a 3D space
        const nodeGroup = new THREE.Group();
        for (let i = 0; i < nodeCount; i++) {
            const material = new THREE.MeshBasicMaterial({
                color: i % 3 === 0 ? 0x64ffda : (i % 3 === 1 ? 0xa78bfa : 0x38bdf8),
                transparent: true,
                opacity: 0.6 + Math.random() * 0.4
            });

            const mesh = new THREE.Mesh(nodeGeometry, material);
            mesh.position.set(
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 35,
                (Math.random() - 0.5) * 30
            );

            nodes.push({
                mesh,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.005,
                    (Math.random() - 0.5) * 0.005,
                    (Math.random() - 0.5) * 0.003
                ),
                pulse: Math.random() * Math.PI * 2,
                baseScale: 0.8 + Math.random() * 1.5
            });

            nodeGroup.add(mesh);
        }
        scene.add(nodeGroup);

        // Create connections (lines between nearby nodes)
        const connectionMaterial = new THREE.LineBasicMaterial({
            color: 0x64ffda,
            transparent: true,
            opacity: 0.08
        });

        const connections = [];
        const maxConnectionDist = 12;

        function updateConnections() {
            // Remove old connections
            connections.forEach(line => scene.remove(line));
            connections.length = 0;

            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dist = nodes[i].mesh.position.distanceTo(nodes[j].mesh.position);
                    if (dist < maxConnectionDist) {
                        const opacity = (1 - dist / maxConnectionDist) * 0.12;
                        const mat = new THREE.LineBasicMaterial({
                            color: i % 2 === 0 ? 0x64ffda : 0xa78bfa,
                            transparent: true,
                            opacity: opacity
                        });
                        const geometry = new THREE.BufferGeometry().setFromPoints([
                            nodes[i].mesh.position.clone(),
                            nodes[j].mesh.position.clone()
                        ]);
                        const line = new THREE.Line(geometry, mat);
                        connections.push(line);
                        scene.add(line);
                    }
                }
            }
        }

        // Mouse tracking for interaction
        const mouse = { x: 0, y: 0 };
        window.addEventListener('mousemove', (e) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        // Data pulse particles
        const pulseParticles = [];
        const pulseGeometry = new THREE.SphereGeometry(0.04, 6, 6);

        function createDataPulse() {
            if (connections.length === 0 || pulseParticles.length > 15) return;

            const connIdx = Math.floor(Math.random() * Math.min(connections.length, 20));
            const conn = connections[connIdx];
            if (!conn) return;

            const positions = conn.geometry.attributes.position.array;
            const start = new THREE.Vector3(positions[0], positions[1], positions[2]);
            const end = new THREE.Vector3(positions[3], positions[4], positions[5]);

            const pulseMat = new THREE.MeshBasicMaterial({
                color: Math.random() > 0.5 ? 0x64ffda : 0xa78bfa,
                transparent: true,
                opacity: 1
            });
            const pulseMesh = new THREE.Mesh(pulseGeometry, pulseMat);
            pulseMesh.position.copy(start);
            scene.add(pulseMesh);

            pulseParticles.push({
                mesh: pulseMesh,
                start, end,
                progress: 0,
                speed: 0.008 + Math.random() * 0.012
            });
        }

        let frame = 0;
        let connectionUpdateTimer = 0;

        function animate() {
            requestAnimationFrame(animate);
            frame++;

            // Rotate the entire neural network slowly
            nodeGroup.rotation.y += 0.0003;
            nodeGroup.rotation.x += 0.0001;

            // Subtle camera movement based on mouse
            camera.position.x += (mouse.x * 3 - camera.position.x) * 0.01;
            camera.position.y += (mouse.y * 2 + 2 - camera.position.y) * 0.01;
            camera.lookAt(0, 0, 0);

            // Update nodes
            nodes.forEach(node => {
                node.mesh.position.add(node.velocity);
                node.pulse += 0.02;

                // Pulse scale
                const scale = node.baseScale + Math.sin(node.pulse) * 0.3;
                node.mesh.scale.setScalar(scale);

                // Boundary check
                ['x', 'y', 'z'].forEach(axis => {
                    const limit = axis === 'z' ? 15 : 25;
                    if (Math.abs(node.mesh.position[axis]) > limit) {
                        node.velocity[axis] *= -1;
                    }
                });
            });

            // Update connections periodically
            connectionUpdateTimer++;
            if (connectionUpdateTimer > 30) {
                updateConnections();
                connectionUpdateTimer = 0;
            }

            // Create data pulses
            if (frame % 60 === 0) {
                createDataPulse();
            }

            // Update data pulses
            for (let i = pulseParticles.length - 1; i >= 0; i--) {
                const p = pulseParticles[i];
                p.progress += p.speed;

                if (p.progress >= 1) {
                    scene.remove(p.mesh);
                    p.mesh.geometry.dispose();
                    p.mesh.material.dispose();
                    pulseParticles.splice(i, 1);
                } else {
                    p.mesh.position.lerpVectors(p.start, p.end, p.progress);
                    p.mesh.material.opacity = 1 - p.progress;
                    const pulseScale = 1 + Math.sin(p.progress * Math.PI) * 2;
                    p.mesh.scale.setScalar(pulseScale);
                }
            }

            renderer.render(scene, camera);
        }

        // Handle resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Initial connection build
        updateConnections();
        animate();
    }

    // Wait for Three.js to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initNeuralBackground, 100);
        });
    } else {
        setTimeout(initNeuralBackground, 100);
    }
})();
