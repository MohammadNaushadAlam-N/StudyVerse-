/**
 * StudyVerse 10 — Mobile Virtual Joystick & Touch HUD
 * Ergonomic, touch-friendly virtual thumbstick and large interact buttons.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, RotateCcw, Pause, Compass } from 'lucide-react';
import { PlayerInputState } from './types.ts';

interface TouchControlsProps {
  inputState: React.MutableRefObject<PlayerInputState>;
  onInteract: () => void;
  onRespawn: () => void;
  onPause: () => void;
  canInteract: boolean;
  interactLabel?: string;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  inputState,
  onInteract,
  onRespawn,
  onPause,
  canInteract,
  interactLabel = 'Interact [E]',
}) => {
  const [touchActive, setTouchActive] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const stickBaseRef = useRef<HTMLDivElement | null>(null);
  const touchIdRef = useRef<number | null>(null);

  const maxRadius = 45; // Max knob radius in pixels

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setTouchActive(true);
    updateJoystick(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        updateJoystick(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setTouchActive(false);
        setKnobPos({ x: 0, y: 0 });
        inputState.current.joystickAngle = null;
        inputState.current.joystickMagnitude = 0;
        inputState.current.forward = false;
        inputState.current.backward = false;
        inputState.current.left = false;
        inputState.current.right = false;
        break;
      }
    }
  };

  const updateJoystick = (clientX: number, clientY: number) => {
    if (!stickBaseRef.current) return;
    const rect = stickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    setKnobPos({
      x: Math.cos(angle) * clampedDist,
      y: Math.sin(angle) * clampedDist,
    });

    const magnitude = clampedDist / maxRadius;
    inputState.current.joystickAngle = angle;
    inputState.current.joystickMagnitude = magnitude;

    // Map angle to forward/backward/left/right
    inputState.current.forward = dy < -15;
    inputState.current.backward = dy > 15;
    inputState.current.left = dx < -15;
    inputState.current.right = dx > 15;
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-20">
      {/* Top Header Buttons */}
      <div className="absolute top-4 right-4 flex items-center space-x-2 pointer-events-auto">
        <button
          onClick={onRespawn}
          className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white active:scale-95 transition shadow-lg backdrop-blur-sm"
          title="Safe Respawn (Courtyard Center)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={onPause}
          className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white active:scale-95 transition shadow-lg backdrop-blur-sm"
          title="Pause & Settings"
        >
          <Pause className="w-4 h-4" />
        </button>
      </div>

      {/* Virtual Joystick (Bottom Left) */}
      <div className="absolute bottom-6 left-6 pointer-events-auto touch-none">
        <div
          ref={stickBaseRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          className={`w-32 h-32 rounded-full border-2 flex items-center justify-center transition-colors relative ${
            touchActive
              ? 'bg-cyan-950/40 border-cyan-400/80 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-900/40 border-slate-700/60'
          }`}
        >
          <Compass className="w-6 h-6 text-slate-500/40 absolute" />
          <div
            className={`w-14 h-14 rounded-full shadow-md transition-transform duration-75 flex items-center justify-center ${
              touchActive ? 'bg-cyan-400 text-slate-950 font-bold' : 'bg-slate-700/80 text-slate-300'
            }`}
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
            }}
          >
            <div className="w-4 h-4 rounded-full bg-white/40" />
          </div>
        </div>
      </div>

      {/* Action Button: Interact (Bottom Right) */}
      <div className="absolute bottom-8 right-6 pointer-events-auto flex flex-col items-end space-y-3">
        <button
          onClick={onInteract}
          className={`px-6 py-4 rounded-2xl font-bold text-sm tracking-wide flex items-center space-x-2 transition-all shadow-xl active:scale-95 ${
            canInteract
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 ring-4 ring-emerald-500/30 shadow-emerald-500/40 animate-pulse'
              : 'bg-slate-900/80 border border-slate-700/80 text-slate-400'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>{interactLabel}</span>
        </button>
      </div>
    </div>
  );
};
