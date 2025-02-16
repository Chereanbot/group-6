"use client";

import { useEffect, useRef } from 'react';

interface MatrixSymbol {
  x: number;
  y: number;
  z: number;
  value: string;
  speed: number;
  opacity: number;
  scale: number;
  rotationSpeed: number;
}

interface Hammer3D {
  x: number;
  y: number;
  z: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scale: number;
  speed: number;
}

interface Text3D {
  x: number;
  y: number;
  z: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scale: number;
}

const MatrixBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth * 2; // Double the width
      canvas.height = window.innerHeight * 2; // Double the height
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Matrix symbols configuration
    const fontSize = 28; // Doubled from 14
    const columns = Math.ceil(canvas.width / fontSize);
    const symbols: MatrixSymbol[] = [];
    const hammers: Hammer3D[] = [];
    const text3D: Text3D = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      z: 0,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      scale: 2 // Doubled scale
    };

    // Generate katakana characters and numbers
    const katakana = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const legalSymbols = '§¶†‡';
    const chars = katakana + latin + nums + legalSymbols;

    // Initialize symbols with 3D properties
    for (let i = 0; i < columns; i++) {
      symbols.push({
        x: i * fontSize,
        y: Math.random() * canvas.height,
        z: Math.random() * 1000, // Increased depth
        value: chars[Math.floor(Math.random() * chars.length)],
        speed: 2 + Math.random() * 6, // Doubled speed
        opacity: Math.random(),
        scale: 1 + Math.random(), // Increased scale
        rotationSpeed: (Math.random() - 0.5) * 0.2 // Doubled rotation
      });
    }

    // Initialize 3D hammers
    for (let i = 0; i < 10; i++) { // Doubled number of hammers
      hammers.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 2000, // Doubled depth
        rotationX: Math.random() * Math.PI * 2,
        rotationY: Math.random() * Math.PI * 2,
        rotationZ: Math.random() * Math.PI * 2,
        scale: 1 + Math.random() * 3, // Doubled scale
        speed: 1 + Math.random() * 4 // Doubled speed
      });
    }

    // Draw 3D hammer
    const drawHammer = (ctx: CanvasRenderingContext2D, hammer: Hammer3D) => {
      const perspective = 2000; // Doubled perspective
      const scale = perspective / (perspective + hammer.z) * hammer.scale;
      
      ctx.save();
      ctx.translate(hammer.x, hammer.y);
      ctx.scale(scale, scale);
      ctx.rotate(hammer.rotationZ);

      // Draw hammer head (doubled size)
      ctx.fillStyle = 'rgba(180, 160, 120, 0.6)';
      ctx.fillRect(-40, -20, 80, 40);
      
      // Draw handle (doubled size)
      ctx.fillStyle = 'rgba(120, 80, 40, 0.6)';
      ctx.fillRect(-10, 20, 20, 120);

      ctx.restore();
    };

    // Draw 3D text
    const draw3DText = (ctx: CanvasRenderingContext2D, text3D: Text3D) => {
      const perspective = 2000; // Doubled perspective
      const scale = perspective / (perspective + text3D.z) * text3D.scale;
      
      ctx.save();
      ctx.translate(text3D.x, text3D.y);
      ctx.scale(scale, scale);
      
      // Apply 3D rotations
      const cos = Math.cos;
      const sin = Math.sin;
      const rx = text3D.rotationX;
      const ry = text3D.rotationY;
      const rz = text3D.rotationZ;
      
      // 3D transformation matrix
      ctx.transform(
        cos(ry) * cos(rz),
        cos(rx) * sin(rz) + sin(rx) * sin(ry) * cos(rz),
        sin(rx) * sin(rz) - cos(rx) * sin(ry) * cos(rz),
        -cos(ry) * sin(rz),
        cos(rx) * cos(rz) - sin(rx) * sin(ry) * sin(rz),
        sin(rx) * cos(rz) + cos(rx) * sin(ry) * sin(rz)
      );

      // Draw "3D" text (doubled size)
      ctx.font = '240px Arial Black';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('3D', 0, 0);

      ctx.restore();
    };

    // Animation loop
    const draw = () => {
      // Semi-transparent black background for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw symbols with 3D effect
      symbols.forEach(symbol => {
        // Random chance to change symbol
        if (Math.random() < 0.02) {
          symbol.value = chars[Math.floor(Math.random() * chars.length)];
        }

        const perspective = 2000; // Doubled perspective
        const scale = perspective / (perspective + symbol.z) * symbol.scale;
        
        // Set color and opacity with depth-based intensity
        const green = Math.floor(symbol.opacity * 165);
        const depthFactor = 1 - (symbol.z / 2000); // Adjusted for doubled depth
        ctx.fillStyle = `rgba(159, ${green + 90}, 0, ${symbol.opacity * depthFactor})`;
        ctx.font = `${fontSize * scale}px monospace`;

        // Draw the symbol
        ctx.save();
        ctx.translate(symbol.x, symbol.y);
        ctx.rotate(symbol.rotationSpeed);
        ctx.fillText(symbol.value, 0, 0);
        ctx.restore();

        // Move symbol down and adjust z
        symbol.y += symbol.speed;
        symbol.z += Math.sin(Date.now() * 0.001) * 4; // Doubled z movement

        // Reset position if symbol goes off screen
        if (symbol.y > canvas.height) {
          symbol.y = 0;
          symbol.opacity = Math.random();
          symbol.speed = 2 + Math.random() * 6; // Doubled speed
          symbol.z = Math.random() * 1000;
        }
      });

      // Update and draw hammers
      hammers.forEach(hammer => {
        hammer.rotationZ += 0.04; // Doubled rotation speed
        hammer.y += hammer.speed;
        hammer.z += Math.sin(Date.now() * 0.001) * 10; // Doubled z movement

        if (hammer.y > canvas.height + 200) { // Doubled offset
          hammer.y = -200;
          hammer.x = Math.random() * canvas.width;
          hammer.z = Math.random() * 2000;
        }

        drawHammer(ctx, hammer);
      });

      // Update and draw 3D text
      text3D.rotationX = Math.sin(Date.now() * 0.001) * 1.0; // Doubled rotation
      text3D.rotationY = Math.cos(Date.now() * 0.001) * 1.0;
      text3D.rotationZ = Math.sin(Date.now() * 0.0005) * 0.6;
      text3D.z = Math.sin(Date.now() * 0.001) * 400; // Doubled z movement
      draw3DText(ctx, text3D);
    };

    // Run animation
    const interval = setInterval(draw, 33); // Approximately 30 FPS

    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="matrix-bg"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.15
      }}
    />
  );
};

export default MatrixBackground;