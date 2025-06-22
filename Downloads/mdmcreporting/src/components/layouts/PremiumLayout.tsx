import React, { useState, useRef, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import PremiumNavigationSidebar from '@/components/premium/PremiumSidebar';
import { usePremium } from '@/contexts/PremiumContext';

export default function PremiumLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isBackendConnected, backendStatus } = usePremium();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animation de particules en arrière-plan
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }> = [];
    
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.3 + 0.1
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 68, 68, ${particle.opacity})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Canvas d'arrière-plan */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-30"
      />
      
      {/* Arrière-plan glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 backdrop-blur-3xl" />
      
      {/* Layout Principal */}
      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Sidebar Premium */}
        <PremiumNavigationSidebar />
        
        {/* Contenu Principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header de Statut */}
          <header className="border-b border-white/10 backdrop-blur-xl bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  MDMC Reporting Premium
                </h1>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  isBackendConnected 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                  }`} />
                  <span>{backendStatus}</span>
                </div>
              </div>
            </div>
          </header>
          
          {/* Contenu des Pages */}
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
} 