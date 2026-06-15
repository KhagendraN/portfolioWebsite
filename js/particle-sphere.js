// 3D Particle Sphere rendering using HTML5 Canvas
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    window.addEventListener('resize', () => {
        width = canvas.offsetWidth;
        height = canvas.offsetHeight;
        canvas.width = width;
        canvas.height = height;
    });

    const particles = [];
    const particleCount = 450;
    const sphereRadius = Math.min(width, height) * 0.18 || 150;
    
    // Mouse coords relative to screen center
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    
    document.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const canvasX = e.clientX - rect.left - width / 2;
        const canvasY = e.clientY - rect.top - height / 2;
        mouse.targetX = canvasX;
        mouse.targetY = canvasY;
    });

    // Particle class
    class Particle {
        constructor() {
            // Generate uniform points on a sphere using Fibonacci lattice
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            
            this.x3d = sphereRadius * Math.sin(phi) * Math.cos(theta);
            this.y3d = sphereRadius * Math.sin(phi) * Math.sin(theta);
            this.z3d = sphereRadius * Math.cos(phi);
            
            this.baseSize = Math.random() * 1.5 + 1;
            this.color = Math.random() > 0.3 ? '#00827c' : '#cbfffc'; // Teal vs Cyan
        }

        rotate(angleX, angleY) {
            // Rotate around Y-axis
            let cosY = Math.cos(angleY);
            let sinY = Math.sin(angleY);
            let x1 = this.x3d * cosY - this.z3d * sinY;
            let z1 = this.z3d * cosY + this.x3d * sinY;

            // Rotate around X-axis
            let cosX = Math.cos(angleX);
            let sinX = Math.sin(angleX);
            let y2 = this.y3d * cosX - z1 * sinX;
            let z2 = z1 * cosX + this.y3d * sinX;

            this.x3d = x1;
            this.y3d = y2;
            this.z3d = z2;
        }

        draw(centerX, centerY) {
            // Perspective projection
            const fov = 400;
            const scale = fov / (fov + this.z3d);
            
            // Mouse interaction: push particles slightly away/towards mouse
            let targetX = this.x3d * scale;
            let targetY = this.y3d * scale;
            
            const dx = targetX - mouse.x * 0.15;
            const dy = targetY - mouse.y * 0.15;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 120) {
                const force = (120 - dist) / 120;
                targetX += (dx / dist) * force * 15;
                targetY += (dy / dist) * force * 15;
            }

            const size = this.baseSize * scale * 1.5;
            
            // Fade particles in the background
            const alpha = Math.max(0.1, ((this.z3d + sphereRadius) / (sphereRadius * 2)) * 0.8 + 0.2);

            ctx.beginPath();
            ctx.arc(centerX + targetX, centerY + targetY, size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = alpha;
            ctx.fill();
        }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    let angleX = 0.001;
    let angleY = 0.003;

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // Smooth mouse coords
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;
        
        const centerX = width / 2;
        const centerY = height / 2;

        // Dynamic rotation speeds matching mouse offsets
        const currentAngleX = angleX + mouse.y * 0.000005;
        const currentAngleY = angleY + mouse.x * 0.000005;

        // Sort particles by Z depth (render back particles first)
        particles.sort((a, b) => b.z3d - a.z3d);

        for (let p of particles) {
            p.rotate(currentAngleX, currentAngleY);
            p.draw(centerX, centerY);
        }

        requestAnimationFrame(animate);
    }
    
    animate();
});
