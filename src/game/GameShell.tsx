/**
 * StudyVerse 10 — Full-Viewport 3D Game Shell & Academy Experience
 * Follows Game Craft Constitution:
 * - Isolated canvas mount container (React updates never reset Three.js loop)
 * - 60fps damped loop with clamped delta
 * - SciBuddy guide speech captions with audio toggle
 * - Collapsible bottom control dock
 * - Touch joystick + Desktop WASD controls
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Compass,
  RotateCcw,
  Sliders,
  X,
  ArrowRight,
  Lock,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { HubScene, CHAPTER_PORTALS_CONFIG } from './HubScene.ts';
import { PlayerAvatar } from './PlayerAvatar.ts';
import { SciBuddy } from './SciBuddy.ts';
import { ThirdPersonCamera } from './ThirdPersonCamera.ts';
import { TouchControls } from './TouchControls.tsx';
import { WebGLFallback } from './WebGLFallback.tsx';
import { audioSynth } from './audioSynth.ts';
import { ChapterPortalData, PlayerInputState, GameSettings } from './types.ts';

interface GameShellProps {
  onEnterChapter1: () => void;
  onOpenAdminStudio?: () => void;
}

export const GameShell: React.FC<GameShellProps> = ({ onEnterChapter1, onOpenAdminStudio }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable Game Engine References
  const hubSceneRef = useRef<HubScene | null>(null);
  const avatarRef = useRef<PlayerAvatar | null>(null);
  const sciBuddyRef = useRef<SciBuddy | null>(null);
  const cameraControllerRef = useRef<ThirdPersonCamera | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Input State Ref
  const inputState = useRef<PlayerInputState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    interact: false,
    respawn: false,
    joystickAngle: null,
    joystickMagnitude: 0,
  });

  // UI Reactive States
  const [nearbyPortal, setNearbyPortal] = useState<ChapterPortalData | null>(null);
  const [sciBuddyText, setSciBuddyText] = useState<string>(
    'Welcome Cadet! I am SciBuddy, your Class 10 Science guide. Walk to the Chapter 1 portal straight ahead to begin our chemical reactions mission!'
  );
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hudCollapsed, setHudCollapsed] = useState(false);
  const [webGlFailed, setWebGlFailed] = useState(false);
  const [settings, setSettings] = useState<GameSettings>({
    language: 'english',
    soundEnabled: true,
    captionsEnabled: true,
    graphicsQuality: 'balanced',
    reducedMotion: false,
  });

  // Multilingual SciBuddy dialogue bank
  const getDialogue = (key: 'welcome' | 'ch1_near' | 'locked_near') => {
    if (settings.language === 'hindi') {
      if (key === 'welcome') return 'नमस्ते कैडेट! मैं साई-बडी (SciBuddy) हूँ। रासायनिक अभिक्रियाओं की प्रयोगशाला शुरू करने के लिए सामने अध्याय 1 के पोर्टल पर चलें!';
      if (key === 'ch1_near') return 'यह अध्याय 1 है: रासायनिक अभिक्रियाएँ एवं समीकरण। प्रयोगशाला में प्रवेश करने के लिए [E] दबाएँ!';
      return 'यह अध्याय अभी तैयार हो रहा है। कृपया अध्याय 1 की रासायनिक प्रयोगशाला में चलें!';
    } else if (settings.language === 'hinglish') {
      if (key === 'welcome') return 'Welcome Cadet! Main hoon SciBuddy. Chemical reactions seekhne ke liye seedhe Chapter 1 portal ki taraf chalein!';
      if (key === 'ch1_near') return 'Yeh Chapter 1 hai: Chemical Reactions and Equations. Reaction Lab me enter karne ke liye [E] press karein!';
      return 'Yeh chapter abhi under academic review hai. Please Chapter 1 ki lab me explore karein!';
    } else {
      if (key === 'welcome') return 'Welcome Cadet! I am SciBuddy. Head straight to the glowing Chapter 1 portal ahead to begin our Chemical Reactions mission!';
      if (key === 'ch1_near') return 'You are at Chapter 1: Chemical Reactions & Equations. Press [E] or tap Interact to enter the safe 3D Reaction Lab!';
      return 'This chapter laboratory is locked and under academic development. Please explore Chapter 1!';
    }
  };

  useEffect(() => {
    // 1. Initialize Three.js Scene
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const hub = new HubScene(canvas, settings.graphicsQuality);
      hubSceneRef.current = hub;

      const avatar = new PlayerAvatar();
      avatarRef.current = avatar;
      hub.scene.add(avatar.group);

      const sciBuddy = new SciBuddy();
      sciBuddyRef.current = sciBuddy;
      hub.scene.add(sciBuddy.group);

      const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
      const cameraController = new ThirdPersonCamera(camera, avatar.getPosition());
      cameraControllerRef.current = cameraController;

      // Handle Resize
      const handleResize = () => {
        if (!canvas) return;
        const width = canvas.parentElement?.clientWidth || window.innerWidth;
        const height = canvas.parentElement?.clientHeight || window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        hub.renderer.setSize(width, height);
      };
      window.addEventListener('resize', handleResize);
      handleResize();

      // Keyboard Controls
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.repeat) return;
        const k = e.key.toLowerCase();
        if (k === 'w' || k === 'arrowup') inputState.current.forward = true;
        if (k === 's' || k === 'arrowdown') inputState.current.backward = true;
        if (k === 'a' || k === 'arrowleft') inputState.current.left = true;
        if (k === 'd' || k === 'arrowright') inputState.current.right = true;
        if (k === 'e' || k === ' ') handleInteract();
        if (k === 'r') handleRespawn();
        if (k === 'escape') setIsPaused((p) => !p);
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        const k = e.key.toLowerCase();
        if (k === 'w' || k === 'arrowup') inputState.current.forward = false;
        if (k === 's' || k === 'arrowdown') inputState.current.backward = false;
        if (k === 'a' || k === 'arrowleft') inputState.current.left = false;
        if (k === 'd' || k === 'arrowright') inputState.current.right = false;
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      // Mouse Orbit Drag
      let isDragging = false;
      let lastMouseX = 0;
      let lastMouseY = 0;

      const handleMouseDown = (e: MouseEvent) => {
        if (e.button === 0) {
          isDragging = true;
          lastMouseX = e.clientX;
          lastMouseY = e.clientY;
        }
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (isDragging && cameraControllerRef.current) {
          const dx = e.clientX - lastMouseX;
          const dy = e.clientY - lastMouseY;
          cameraControllerRef.current.handleDrag(dx, dy);
          lastMouseX = e.clientX;
          lastMouseY = e.clientY;
        }
      };

      const handleMouseUp = () => {
        isDragging = false;
      };

      canvas.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      // 2. Main Game Loop (60fps, clamped dt)
      let lastTime = performance.now();
      const clock = new THREE.Clock();

      const animate = () => {
        animFrameIdRef.current = requestAnimationFrame(animate);

        const delta = Math.min(clock.getDelta(), 0.05);

        if (!isPaused) {
          // Movement Calculation
          const moveSpeed = 6.5;
          let moveX = 0;
          let moveZ = 0;

          if (inputState.current.joystickAngle !== null && inputState.current.joystickMagnitude > 0) {
            // Touch joystick angle
            const angle = inputState.current.joystickAngle;
            moveX = Math.cos(angle) * inputState.current.joystickMagnitude;
            moveZ = Math.sin(angle) * inputState.current.joystickMagnitude;
          } else {
            // Keyboard WASD
            if (inputState.current.forward) moveZ -= 1;
            if (inputState.current.backward) moveZ += 1;
            if (inputState.current.left) moveX -= 1;
            if (inputState.current.right) moveX += 1;
          }

          const hasInput = moveX !== 0 || moveZ !== 0;

          if (hasInput) {
            // Orient movement relative to camera
            const camAngle = cameraController.camera.rotation.y;
            const targetRotation = Math.atan2(moveX, -moveZ);
            avatar.setRotation(targetRotation);

            const forwardDir = new THREE.Vector3(moveX, 0, moveZ).normalize().multiplyScalar(moveSpeed * delta);
            avatar.group.position.add(forwardDir);

            // Step sound
            if (Math.random() < 0.03) audioSynth.playFootstep();

            // Collision check with courtyard boundaries
            hub.enforceBoundaries(avatar.group.position);
          }

          // Update avatar limbs
          avatar.update(delta, hasInput, moveSpeed);

          // Update SciBuddy companion position and states
          sciBuddy.update(delta, avatar.getPosition());

          // Update scene animations (portal ring, central monument)
          hub.update(delta);

          // Update Camera Damping
          cameraController.update(delta, avatar.getPosition(), avatar.currentRotation);

          // Proximity Portal Detection
          const portal = hub.getNearbyPortal(avatar.getPosition());
          setNearbyPortal(portal);

          if (portal) {
            if (portal.status === 'active') {
              sciBuddy.setState('point');
              setSciBuddyText(getDialogue('ch1_near'));
            } else {
              sciBuddy.setState('think');
              setSciBuddyText(getDialogue('locked_near'));
            }
          } else {
            sciBuddy.setState('idle');
          }
        }

        // Render
        hub.renderer.render(hub.scene, cameraController.camera);
      };

      animate();

      return () => {
        if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        canvas.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        hub.dispose();
      };
    } catch (err) {
      console.error('WebGL initialization error:', err);
      setWebGlFailed(true);
    }
  }, [settings.graphicsQuality]);

  // Actions
  const handleInteract = () => {
    if (!nearbyPortal) return;
    if (nearbyPortal.status === 'active') {
      audioSynth.playInteract();
      sciBuddyRef.current?.setState('celebrate');
      onEnterChapter1();
    } else {
      audioSynth.playLocked();
      sciBuddyRef.current?.setState('retry');
    }
  };

  const handleRespawn = () => {
    audioSynth.playRespawn();
    if (avatarRef.current) {
      avatarRef.current.setPosition(0, 0, 0);
      avatarRef.current.setRotation(0);
    }
    cameraControllerRef.current?.resetOrientation();
    setSciBuddyText('Safely respawned at the Academy Courtyard center!');
  };

  if (webGlFailed) {
    return (
      <WebGLFallback
        onSelectChapter={() => onEnterChapter1()}
        onLockedChapterClick={() => audioSynth.playLocked()}
      />
    );
  }

  return (
    <div className="relative w-full h-full min-h-[600px] flex-1 bg-slate-950 overflow-hidden select-none">
      {/* Three.js Isolated Canvas Mount */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full touch-none" />

      {/* Top Status Overlay Clusters */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none flex flex-col space-y-2">
        <div className="flex items-center space-x-2 bg-slate-900/80 border border-slate-800/80 px-3 py-1.5 rounded-xl shadow-lg pointer-events-auto backdrop-blur-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-white tracking-wide">Central Academy Hub</span>
          <span className="text-[10px] text-cyan-400 font-mono">CBSE 10</span>
        </div>

        {/* Portal Proximity Indicator */}
        {nearbyPortal && (
          <div
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 border shadow-xl pointer-events-auto ${
              nearbyPortal.status === 'active'
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
                : 'bg-slate-900/90 border-amber-600/70 text-amber-200'
            }`}
          >
            {nearbyPortal.status === 'active' ? (
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <div className="space-y-0.5">
              <span className="font-bold block">
                Chapter {nearbyPortal.chapterNumber}: {nearbyPortal.title}
              </span>
              <span className="text-[10px] text-slate-300 font-normal">
                {nearbyPortal.status === 'active' ? 'Press [E] to Enter 3D Reaction Lab' : 'Locked — In Development'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* SciBuddy Speech Captions Overlay (Top Center) */}
      {settings.captionsEnabled && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 max-w-xl w-[90%] pointer-events-none">
          <div className="bg-slate-900/90 border border-cyan-800/80 p-3.5 rounded-2xl shadow-2xl flex items-start space-x-3 pointer-events-auto backdrop-blur-md">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 border border-cyan-500/40">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">SciBuddy Guide</span>
                <span className="text-[10px] font-mono text-slate-400 uppercase">{settings.language}</span>
              </div>
              <p className="text-xs text-slate-100 leading-relaxed">{sciBuddyText}</p>
            </div>
          </div>
        </div>
      )}

      {/* Touch Joystick & Mobile Buttons */}
      <TouchControls
        inputState={inputState}
        onInteract={handleInteract}
        onRespawn={handleRespawn}
        onPause={() => setIsPaused(true)}
        canInteract={nearbyPortal?.status === 'active'}
        interactLabel={nearbyPortal?.status === 'active' ? 'Enter Lab [E]' : 'Inspect [E]'}
      />

      {/* Collapsible Unified Bottom Control Dock (Zero Viewport Occlusion) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto transition-transform duration-300">
        <div className="flex flex-col items-center">
          <button
            onClick={() => setHudCollapsed((c) => !c)}
            className="px-3 py-1 rounded-t-lg bg-slate-900/90 border border-b-0 border-slate-700/80 text-[10px] font-semibold text-slate-400 hover:text-white flex items-center space-x-1 backdrop-blur-sm"
          >
            {hudCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{hudCollapsed ? 'Show Controls' : 'Hide Controls (H)'}</span>
          </button>

          {!hudCollapsed && (
            <div className="px-5 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 flex items-center space-x-4 shadow-2xl backdrop-blur-md text-xs text-slate-300">
              <span className="font-mono text-slate-400 hidden sm:inline">
                WASD / Joystick Move &middot; E Action &middot; R Respawn &middot; Mouse Drag Look
              </span>

              <div className="flex items-center space-x-2 border-l border-slate-700 pl-3">
                <button
                  onClick={() => {
                    const next = !settings.soundEnabled;
                    audioSynth.enabled = next;
                    setSettings((s) => ({ ...s, soundEnabled: next }));
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 transition"
                  title="Toggle Audio"
                >
                  {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                </button>

                <button
                  onClick={() => setShowSettings(true)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 transition"
                  title="Settings"
                >
                  <Sliders className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Academy & Audio Settings</span>
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Language Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Guide Explanation Language</label>
              <div className="grid grid-cols-3 gap-2">
                {(['english', 'hindi', 'hinglish'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSettings((s) => ({ ...s, language: lang }))}
                    className={`p-2 rounded-lg text-xs capitalize font-medium border transition ${
                      settings.language === lang
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Graphics Quality */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Graphics Quality</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSettings((s) => ({ ...s, graphicsQuality: 'low' }))}
                  className={`p-2 rounded-lg text-xs font-medium border transition ${
                    settings.graphicsQuality === 'low'
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Low (Fast / No Shadows)
                </button>
                <button
                  onClick={() => setSettings((s) => ({ ...s, graphicsQuality: 'balanced' }))}
                  className={`p-2 rounded-lg text-xs font-medium border transition ${
                    settings.graphicsQuality === 'balanced'
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Balanced (Soft Shadows)
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
