"use client";

import { useEffect, useRef } from "react";

/**
 * ParallaxBackground component renders three background layers that move at different speeds
 * based on scroll position, creating a depth illusion.
 * 
 * Layer 1 (back): slowest movement (0.2x scroll speed)
 * Layer 2 (middle): medium movement (0.5x scroll speed)
 * Layer 3 (front): fastest movement (0.8x scroll speed)
 */
export function ParallaxBackground() {
  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);
  const layer3Ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let ticking = false;

    const updateParallax = () => {
      const scrollY = window.scrollY;
      
      if (layer1Ref.current) {
        layer1Ref.current.style.transform = `translate3d(0, ${scrollY * 0.2}px, 0)`;
      }
      if (layer2Ref.current) {
        layer2Ref.current.style.transform = `translate3d(0, ${scrollY * 0.5}px, 0)`;
      }
      if (layer3Ref.current) {
        layer3Ref.current.style.transform = `translate3d(0, ${scrollY * 0.8}px, 0)`;
      }
      
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        rafRef.current = requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    // Initial position
    updateParallax();

    // Listen to scroll events
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Layer 1 - Background (slowest) */}
      <div
        ref={layer1Ref}
        className="absolute inset-0 w-full h-full opacity-30"
        style={{
          backgroundImage: "url('/parallax layer 1.png')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          willChange: "transform",
        }}
      />
      
      {/* Layer 2 - Middle (medium speed) */}
      <div
        ref={layer2Ref}
        className="absolute inset-0 w-full h-full opacity-40"
        style={{
          backgroundImage: "url('/Parallax layer 2.png')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          willChange: "transform",
        }}
      />
      
      {/* Layer 3 - Foreground (fastest) */}
      <div
        ref={layer3Ref}
        className="absolute inset-0 w-full h-full opacity-50"
        style={{
          backgroundImage: "url('/Parallax layer 3.png')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          willChange: "transform",
        }}
      />
    </div>
  );
}

