import { useEffect, useRef } from "react";
import { Music, Music2, Music3, Music4 } from "lucide-react";

const MusicBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Music notes particles
    const notes: Array<{
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
      rotation: number;
      rotationSpeed: number;
    }> = [];

    // Create initial notes
    for (let i = 0; i < 25; i++) {
      notes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 25 + 15,
        speed: Math.random() * 0.8 + 0.3,
        opacity: Math.random() * 0.4 + 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      notes.forEach((note, index) => {
        // Update position
        note.y -= note.speed;
        note.rotation += note.rotationSpeed;
        note.opacity = Math.sin(Date.now() * 0.001 + index) * 0.2 + 0.4;

        // Reset if off screen
        if (note.y < -note.size) {
          note.y = canvas.height + note.size;
          note.x = Math.random() * canvas.width;
        }

        // Draw music note
        ctx.save();
        ctx.translate(note.x, note.y);
        ctx.rotate(note.rotation);
        ctx.globalAlpha = note.opacity;

        // Draw simple music note shape
        ctx.fillStyle = "#0A2540";
        ctx.beginPath();
        
        // Note head (circle)
        ctx.arc(0, 0, note.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Note stem
        ctx.fillRect(note.size * 0.25, -note.size * 0.3, note.size * 0.15, note.size * 0.6);
        
        // Note flag (if needed)
        if (note.size > 15) {
          ctx.beginPath();
          ctx.moveTo(note.size * 0.4, -note.size * 0.3);
          ctx.quadraticCurveTo(
            note.size * 0.6, -note.size * 0.4,
            note.size * 0.5, -note.size * 0.6
          );
          ctx.fill();
        }

        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.7 }}
    />
  );
};

export default MusicBackground;

