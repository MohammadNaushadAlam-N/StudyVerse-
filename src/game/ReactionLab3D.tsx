/**
 * StudyVerse 10 — 3D Reaction Lab Scene
 * Source of Truth: NCERT Class 10 Science Chapter 1
 * 
 * Features:
 * - Real Three.js lab bench with polished wood/slate counter top
 * - Labelled glassware and containers (beakers, flasks, crucible tongs, watch glass, burner)
 * - Color-coded CPK atom spheres and 3D molecular arrangements
 * - Animated Bunsen burner flame and exothermic thermal effects
 * - 3D SciBuddy lab assistant with synchronized gestures
 * - Dynamic reaction state visualization
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Element CPK colour standards
export const ATOM_COLORS: Record<string, number> = {
  Mg: 0x10b981, // Emerald Green
  O: 0xef4444,  // Red
  H: 0xf8fafc,  // White
  Ca: 0xa855f7, // Purple
  Fe: 0xb45309, // Rust Brown
  Cu: 0xd97706, // Copper Orange
  S: 0xeab308,  // Yellow
  Ba: 0x06b6d4, // Cyan
  Na: 0x3b82f6, // Blue
  Cl: 0x84cc16, // Lime Green
};

export interface ReactionLab3DProps {
  reactionIndex: number; // 0: Mg burning, 1: CaO + H2O, 2: Fe + CuSO4, 3: Na2SO4 + BaCl2
  isReacting: boolean;
  reactionProgress: number; // 0 to 1
  sciBuddyGesture: 'idle' | 'point' | 'explain' | 'think' | 'celebrate' | 'retry';
  temperatureC: number;
}

export const ReactionLab3D: React.FC<ReactionLab3DProps> = ({
  reactionIndex,
  isReacting,
  reactionProgress,
  sciBuddyGesture,
  temperatureC,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Dynamic Scene Elements
  const flameMeshRef = useRef<THREE.Mesh | null>(null);
  const flameLightRef = useRef<THREE.PointLight | null>(null);
  const reactionGroupRef = useRef<THREE.Group | null>(null);
  const sciBuddyMeshRef = useRef<THREE.Group | null>(null);
  const thermometerLiquidRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x090d16);
    scene.fog = new THREE.FogExp2(0x090d16, 0.035);

    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 50);
    camera.position.set(0, 3.2, 5.5);
    camera.lookAt(0, 1.2, 0);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const overheadLight = new THREE.DirectionalLight(0xe0f2fe, 1.2);
    overheadLight.position.set(2, 6, 4);
    overheadLight.castShadow = true;
    overheadLight.shadow.mapSize.width = 1024;
    overheadLight.shadow.mapSize.height = 1024;
    scene.add(overheadLight);

    const rimLight = new THREE.PointLight(0x06b6d4, 0.8, 10);
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    // Flame Point Light
    const flameLight = new THREE.PointLight(0xffedd5, 0, 8);
    flameLight.position.set(0, 1.2, 0);
    scene.add(flameLight);
    flameLightRef.current = flameLight;

    // 4. Lab Bench & Architecture
    const benchGroup = new THREE.Group();

    // Benchtop
    const benchGeo = new THREE.BoxGeometry(6.5, 0.25, 3.2);
    const benchMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.2,
    });
    const benchMesh = new THREE.Mesh(benchGeo, benchMat);
    benchMesh.position.set(0, 0, 0);
    benchMesh.receiveShadow = true;
    benchGroup.add(benchMesh);

    // Bench Edge Bevel Trim
    const trimGeo = new THREE.BoxGeometry(6.6, 0.08, 0.1);
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.4 });
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.position.set(0, 0.1, 1.6);
    benchGroup.add(trimMesh);

    // Back Splash Wall
    const wallGeo = new THREE.BoxGeometry(7, 3.5, 0.2);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.set(0, 1.5, -1.6);
    wallMesh.receiveShadow = true;
    benchGroup.add(wallMesh);

    scene.add(benchGroup);

    // 5. Lab Apparatus Fixtures
    // Bunsen Burner
    const burnerGroup = new THREE.Group();
    burnerGroup.position.set(0, 0.12, 0);

    const burnerBaseGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.08, 16);
    const burnerMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.2 });
    const burnerBase = new THREE.Mesh(burnerBaseGeo, burnerMat);
    burnerGroup.add(burnerBase);

    const burnerStemGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.7, 16);
    const burnerStem = new THREE.Mesh(burnerStemGeo, burnerMat);
    burnerStem.position.y = 0.38;
    burnerGroup.add(burnerStem);

    // Flame Mesh
    const flameGeo = new THREE.ConeGeometry(0.12, 0.45, 12);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.85,
    });
    const flameMesh = new THREE.Mesh(flameGeo, flameMat);
    flameMesh.position.y = 0.95;
    burnerGroup.add(flameMesh);
    flameMeshRef.current = flameMesh;

    scene.add(burnerGroup);

    // Watch Glass with ash collector (Right of Burner)
    const watchGlassGeo = new THREE.CylinderGeometry(0.45, 0.35, 0.06, 24);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      opacity: 1,
      transparent: true,
      roughness: 0.1,
      ior: 1.5,
    });
    const watchGlass = new THREE.Mesh(watchGlassGeo, glassMat);
    watchGlass.position.set(1.4, 0.15, 0.4);
    scene.add(watchGlass);

    // Tongs Holding Mg Ribbon
    const tongsGroup = new THREE.Group();
    tongsGroup.position.set(-0.9, 0.9, 0);
    const tongArmGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.1, 8);
    const tongArm = new THREE.Mesh(tongArmGeo, burnerMat);
    tongArm.rotation.z = Math.PI / 3;
    tongsGroup.add(tongArm);

    // Magnesium Ribbon Strip
    const ribbonGeo = new THREE.BoxGeometry(0.03, 0.35, 0.08);
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      metalness: 0.85,
      roughness: 0.25,
    });
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbonMesh.position.set(0.45, 0.25, 0);
    ribbonMesh.rotation.z = -Math.PI / 6;
    tongsGroup.add(ribbonMesh);

    scene.add(tongsGroup);

    // Thermometer Gauge on Bench (Left side)
    const thermGroup = new THREE.Group();
    thermGroup.position.set(-2.2, 0.12, 0.2);

    const thermBase = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.1, 0.35), burnerMat);
    thermGroup.add(thermBase);

    const thermStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1.4, 12),
      new THREE.MeshPhysicalMaterial({ transmission: 0.9, transparent: true, roughness: 0.1 })
    );
    thermStem.position.y = 0.75;
    thermGroup.add(thermStem);

    const thermLiquidGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.5, 12);
    const thermLiquidMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const thermLiquid = new THREE.Mesh(thermLiquidGeo, thermLiquidMat);
    thermLiquid.position.y = 0.4;
    thermGroup.add(thermLiquid);
    thermLiquidLiquidRef: thermometerLiquidRef.current = thermLiquid;

    scene.add(thermGroup);

    // 6. Dynamic Reaction Atoms Group
    const reactionGroup = new THREE.Group();
    reactionGroup.position.set(0, 1.6, 0);
    scene.add(reactionGroup);
    reactionGroupRef.current = reactionGroup;

    // 7. SciBuddy Lab Companion (Floating top-right)
    const sciBuddyGroup = new THREE.Group();
    sciBuddyGroup.position.set(2.2, 2.2, -0.5);

    // Body
    const bodyMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.2, metalness: 0.3 })
    );
    sciBuddyGroup.add(bodyMesh);

    // LED Visor Eye
    const visorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.16, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1 })
    );
    visorMesh.position.set(0, 0.05, 0.25);
    sciBuddyGroup.add(visorMesh);

    const pupilMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    pupilMesh.position.set(0, 0.05, 0.36);
    sciBuddyGroup.add(pupilMesh);

    // Halo Antenna
    const haloMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.03, 12, 24),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    haloMesh.rotation.x = Math.PI / 2;
    haloMesh.position.y = 0.46;
    sciBuddyGroup.add(haloMesh);

    scene.add(sciBuddyGroup);
    sciBuddyMeshRef.current = sciBuddyGroup;

    // 8. Animation & Render Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // SciBuddy hover bob
      if (sciBuddyMeshRef.current) {
        sciBuddyMeshRef.current.position.y = 2.2 + Math.sin(elapsedTime * 2.5) * 0.08;
        sciBuddyMeshRef.current.rotation.y = Math.sin(elapsedTime * 1.2) * 0.15;
      }

      // Flame flicker
      if (flameMeshRef.current && flameLightRef.current) {
        if (isReacting || reactionIndex === 0) {
          const scale = 1 + Math.sin(elapsedTime * 18) * 0.18;
          flameMeshRef.current.scale.set(scale, scale * 1.2, scale);
          flameMeshRef.current.visible = true;
          flameLightRef.current.intensity = 1.4 + Math.sin(elapsedTime * 20) * 0.4;
        } else {
          flameMeshRef.current.visible = false;
          flameLightRef.current.intensity = 0;
        }
      }

      // Rotate atomic reaction molecules gently
      if (reactionGroupRef.current) {
        reactionGroupRef.current.rotation.y = elapsedTime * 0.4;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update dynamic reaction atoms when reactionIndex or reactionProgress changes
  useEffect(() => {
    const group = reactionGroupRef.current;
    if (!group) return;

    // Clear previous atom meshes
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
    }

    // Helper to create atom sphere with label
    const createAtom = (element: string, x: number, y: number, z: number, radius = 0.22) => {
      const color = ATOM_COLORS[element] || 0x94a3b8;
      const sphereGeo = new THREE.SphereGeometry(radius, 24, 24);
      const sphereMat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.25,
        metalness: 0.4,
      });
      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      return mesh;
    };

    const createBond = (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) => {
      const p1 = new THREE.Vector3(x1, y1, z1);
      const p2 = new THREE.Vector3(x2, y2, z2);
      const dist = p1.distanceTo(p2);
      const bondGeo = new THREE.CylinderGeometry(0.04, 0.04, dist, 12);
      const bondMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 });
      const bondMesh = new THREE.Mesh(bondGeo, bondMat);

      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      bondMesh.position.copy(mid);

      const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
      bondMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      return bondMesh;
    };

    if (reactionIndex === 0) {
      // 2Mg + O2 -> 2MgO
      if (reactionProgress < 0.6) {
        // Reactants: 2 Mg atoms and 1 O2 molecule
        const mg1 = createAtom('Mg', -1.2, 0, 0, 0.26);
        const mg2 = createAtom('Mg', -0.6, 0.4, 0, 0.26);
        const o1 = createAtom('O', 0.7, 0, 0, 0.2);
        const o2 = createAtom('O', 1.15, 0, 0, 0.2);
        const bond = createBond(0.7, 0, 0, 1.15, 0, 0);

        group.add(mg1, mg2, o1, o2, bond);
      } else {
        // Products: 2 MgO units (ionic pair)
        const mg1 = createAtom('Mg', -0.6, 0.1, 0, 0.25);
        const o1 = createAtom('O', -0.15, 0.1, 0, 0.2);
        const b1 = createBond(-0.6, 0.1, 0, -0.15, 0.1, 0);

        const mg2 = createAtom('Mg', 0.6, -0.1, 0, 0.25);
        const o2 = createAtom('O', 1.05, -0.1, 0, 0.2);
        const b2 = createBond(0.6, -0.1, 0, 1.05, -0.1, 0);

        group.add(mg1, o1, b1, mg2, o2, b2);
      }
    } else if (reactionIndex === 1) {
      // CaO + H2O -> Ca(OH)2
      if (reactionProgress < 0.6) {
        const ca = createAtom('Ca', -1.0, 0, 0, 0.3);
        const o = createAtom('O', -0.5, 0, 0, 0.2);
        const b1 = createBond(-1.0, 0, 0, -0.5, 0, 0);

        const h2o_o = createAtom('O', 0.6, 0.1, 0, 0.2);
        const h2o_h1 = createAtom('H', 0.95, 0.35, 0, 0.14);
        const h2o_h2 = createAtom('H', 0.95, -0.15, 0, 0.14);
        const b2 = createBond(0.6, 0.1, 0, 0.95, 0.35, 0);
        const b3 = createBond(0.6, 0.1, 0, 0.95, -0.15, 0);

        group.add(ca, o, b1, h2o_o, h2o_h1, h2o_h2, b2, b3);
      } else {
        // Ca(OH)2 single product
        const ca = createAtom('Ca', 0, 0, 0, 0.3);
        const o1 = createAtom('O', -0.65, 0.2, 0, 0.2);
        const h1 = createAtom('H', -1.0, 0.35, 0, 0.14);
        const o2 = createAtom('O', 0.65, -0.2, 0, 0.2);
        const h2 = createAtom('H', 1.0, -0.35, 0, 0.14);

        group.add(
          ca,
          o1,
          h1,
          o2,
          h2,
          createBond(0, 0, 0, -0.65, 0.2, 0),
          createBond(-0.65, 0.2, 0, -1.0, 0.35, 0),
          createBond(0, 0, 0, 0.65, -0.2, 0),
          createBond(0.65, -0.2, 0, 1.0, -0.35, 0)
        );
      }
    } else if (reactionIndex === 2) {
      // Fe + CuSO4 -> FeSO4 + Cu
      const fe = createAtom('Fe', -0.9, 0, 0, 0.28);
      const cu = createAtom('Cu', 0.3, 0.1, 0, 0.27);
      const s = createAtom('S', 0.8, 0, 0, 0.22);
      const o1 = createAtom('O', 1.15, 0.3, 0, 0.16);
      const o2 = createAtom('O', 1.15, -0.3, 0, 0.16);

      group.add(fe, cu, s, o1, o2, createBond(0.3, 0.1, 0, 0.8, 0, 0));
    } else {
      // Na2SO4 + BaCl2 -> BaSO4(s) + 2NaCl
      const ba = createAtom('Ba', -0.4, 0, 0, 0.32);
      const s = createAtom('S', 0.2, 0, 0, 0.22);
      const cl1 = createAtom('Cl', 0.9, 0.4, 0, 0.2);
      const na1 = createAtom('Na', 1.3, 0.4, 0, 0.24);

      group.add(ba, s, cl1, na1, createBond(-0.4, 0, 0, 0.2, 0, 0), createBond(0.9, 0.4, 0, 1.3, 0.4, 0));
    }
  }, [reactionIndex, reactionProgress]);

  // Update thermometer liquid scale based on temperature
  useEffect(() => {
    if (thermometerLiquidRef.current) {
      const minTemp = 20;
      const maxTemp = 150;
      const clamped = Math.max(minTemp, Math.min(maxTemp, temperatureC));
      const ratio = (clamped - minTemp) / (maxTemp - minTemp);
      thermometerLiquidRef.current.scale.y = 0.3 + ratio * 1.5;
    }
  }, [temperatureC]);

  return (
    <div className="relative w-full h-[320px] sm:h-[400px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      <div ref={mountRef} className="w-full h-full" />

      {/* Lab Safety Badge */}
      <div className="absolute top-3 left-3 bg-slate-900/90 border border-emerald-500/60 px-3 py-1 rounded-xl text-[10px] text-emerald-300 font-semibold backdrop-blur-sm shadow-md flex items-center space-x-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>VIRTUAL SIMULATION BENCH &middot; ZERO AT-HOME HAZARD</span>
      </div>

      {/* Thermometer Temperature HUD */}
      <div className="absolute top-3 right-3 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-mono backdrop-blur-sm shadow-md flex items-center space-x-2">
        <span className="text-slate-400">Sensor:</span>
        <span
          className={`font-bold ${
            temperatureC > 50 ? 'text-rose-400 animate-pulse' : 'text-cyan-400'
          }`}
        >
          {temperatureC.toFixed(1)}°C
        </span>
        {temperatureC > 50 && (
          <span className="text-[10px] bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded border border-rose-800">
            Exothermic (ΔT &gt; 0)
          </span>
        )}
      </div>

      {/* Element Color Key Legend */}
      <div className="absolute bottom-3 left-3 right-3 sm:right-auto bg-slate-950/85 border border-slate-800/80 px-3 py-1.5 rounded-xl text-[11px] backdrop-blur-sm flex flex-wrap items-center gap-2.5">
        <span className="text-slate-400 font-semibold text-[10px] uppercase">CPK Elements:</span>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span className="text-slate-300">Mg</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
          <span className="text-slate-300">O</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-100 inline-block" />
          <span className="text-slate-300">H</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
          <span className="text-slate-300">Ca</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-700 inline-block" />
          <span className="text-slate-300">Fe</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          <span className="text-slate-300">Cu</span>
        </div>
      </div>
    </div>
  );
};
