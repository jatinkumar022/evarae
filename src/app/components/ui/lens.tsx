'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LensProps {
  children: React.ReactNode;
  zoomFactor?: number; // how much to zoom in
  lensSize?: number; // size of the lens circle
  position?: { x: number; y: number }; // for static mode
  isStatic?: boolean; // true → fixed lens
  hovering?: boolean; // external hover control
  setHovering?: (hover: boolean) => void;
}

export const Lens: React.FC<LensProps> = ({
  children,
  zoomFactor = 1.8,
  lensSize = 180,
  isStatic = false,
  position = { x: 200, y: 150 },
  hovering,
  setHovering,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [localHovering, setLocalHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 100, y: 100 });

  const isHovering = hovering ?? localHovering;
  const setIsHovering = setHovering ?? setLocalHovering;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
  };

  const lensMask = (x: number, y: number) =>
    `radial-gradient(circle ${
      lensSize / 2
    }px at ${x}px ${y}px, black 100%, transparent 100%)`;

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-lg z-10"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
    >
      {children}

      {/* Static lens mode */}
      {isStatic ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{
            maskImage: lensMask(position.x, position.y),
            WebkitMaskImage: lensMask(position.x, position.y),
            transformOrigin: `${position.x}px ${position.y}px`,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              transform: `scale(${zoomFactor})`,
              transformOrigin: `${position.x}px ${position.y}px`,
            }}
          >
            {children}
          </div>
        </motion.div>
      ) : (
        // Hover lens mode
        <AnimatePresence>
          {isHovering && (
            <motion.div
              key="lens"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="absolute inset-0 overflow-hidden pointer-events-none z-50"
              style={{
                maskImage: lensMask(mousePosition.x, mousePosition.y),
                WebkitMaskImage: lensMask(mousePosition.x, mousePosition.y),
                transformOrigin: `${mousePosition.x}px ${mousePosition.y}px`,
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  transform: `scale(${zoomFactor})`,
                  transformOrigin: `${mousePosition.x}px ${mousePosition.y}px`,
                }}
              >
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};
