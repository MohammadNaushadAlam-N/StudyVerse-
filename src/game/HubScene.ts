/**
 * StudyVerse 10 — Central Academy 3D Hub Scene
 * Source of Truth: StudyVerse 10 Science Blueprint Screen 2
 * 
 * Features:
 * - Real walkable low-poly academy courtyard with bounded ground.
 * - Central Science Monument (levitating atom sculpture).
 * - 13 Chapter Portals: Chapter 1 is active with animated energy rings; Chapters 2-13 are locked.
 * - PBR lighting, RoomEnvironment reflection map, and horizon fog.
 * - Collision perimeter boundaries and safe respawn at (0, 0, 0).
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ChapterPortalData } from './types.ts';

export const CHAPTER_PORTALS_CONFIG: ChapterPortalData[] = [
  {
    chapterId: 'ch01',
    chapterNumber: 1,
    title: 'Chemical Reactions and Equations',
    unitTitle: 'Unit I: Chemical Substances',
    status: 'active',
    position: [0, 0, -18],
    color: 0x10b981, // Emerald green
    description: 'Safe virtual reaction lab: predict observations, balance equations, and classify reactions.',
  },
  {
    chapterId: 'ch02',
    chapterNumber: 2,
    title: 'Acids, Bases and Salts',
    unitTitle: 'Unit I: Chemical Substances',
    status: 'locked',
    position: [8, 0, -16],
    color: 0x06b6d4,
    description: 'Locked — Coming Soon. pH Garden, indicators, and salt preparation.',
  },
  {
    chapterId: 'ch03',
    chapterNumber: 3,
    title: 'Metals and Non-metals',
    unitTitle: 'Unit I: Chemical Substances',
    status: 'locked',
    position: [15, 0, -10],
    color: 0xf59e0b,
    description: 'Locked — Coming Soon. Reactivity series and ionic bonding.',
  },
  {
    chapterId: 'ch04',
    chapterNumber: 4,
    title: 'Carbon and its Compounds',
    unitTitle: 'Unit I: Chemical Substances',
    status: 'locked',
    position: [18, 0, -2],
    color: 0x8b5cf6,
    description: 'Locked — Coming Soon. Covalent bonding and homologous series.',
  },
  {
    chapterId: 'ch05',
    chapterNumber: 5,
    title: 'Life Processes',
    unitTitle: 'Unit II: World of Living',
    status: 'locked',
    position: [16, 0, 7],
    color: 0x22c55e,
    description: 'Locked — Coming Soon. Nutrition, respiration, transportation, and excretion.',
  },
  {
    chapterId: 'ch06',
    chapterNumber: 6,
    title: 'Control and Coordination',
    unitTitle: 'Unit II: World of Living',
    status: 'locked',
    position: [11, 0, 14],
    color: 0xec4899,
    description: 'Locked — Coming Soon. Nervous system, reflex arc, and plant tropisms.',
  },
  {
    chapterId: 'ch07',
    chapterNumber: 7,
    title: 'How do Organisms Reproduce?',
    unitTitle: 'Unit II: World of Living',
    status: 'locked',
    position: [4, 0, 18],
    color: 0xf43f5e,
    description: 'Locked — Coming Soon. Flowering plants and age-appropriate human biology.',
  },
  {
    chapterId: 'ch08',
    chapterNumber: 8,
    title: 'Heredity',
    unitTitle: 'Unit II: World of Living',
    status: 'locked',
    position: [-4, 0, 18],
    color: 0xa855f7,
    description: 'Locked — Coming Soon. Mendel crosses and inheritance traits.',
  },
  {
    chapterId: 'ch09',
    chapterNumber: 9,
    title: 'Light — Reflection and Refraction',
    unitTitle: 'Unit III: Natural Phenomena',
    status: 'locked',
    position: [-11, 0, 14],
    color: 0x38bdf8,
    description: 'Locked — Coming Soon. Spherical mirrors, lenses, and ray optics.',
  },
  {
    chapterId: 'ch10',
    chapterNumber: 10,
    title: 'The Human Eye & Colourful World',
    unitTitle: 'Unit III: Natural Phenomena',
    status: 'locked',
    position: [-16, 0, 7],
    color: 0x0ea5e9,
    description: 'Locked — Coming Soon. Accommodation, defects, prism dispersion, and scattering.',
  },
  {
    chapterId: 'ch11',
    chapterNumber: 11,
    title: 'Electricity',
    unitTitle: 'Unit IV: Effects of Current',
    status: 'locked',
    position: [-18, 0, -2],
    color: 0xeab308,
    description: 'Locked — Coming Soon. Ohm law, series and parallel circuits, and heating effects.',
  },
  {
    chapterId: 'ch12',
    chapterNumber: 12,
    title: 'Magnetic Effects of Electric Current',
    unitTitle: 'Unit IV: Effects of Current',
    status: 'locked',
    position: [-15, 0, -10],
    color: 0x6366f1,
    description: 'Locked — Coming Soon. Field lines, solenoids, and domestic wiring safety.',
  },
  {
    chapterId: 'ch13',
    chapterNumber: 13,
    title: 'Our Environment',
    unitTitle: 'Unit V: Natural Resources',
    status: 'locked',
    position: [-8, 0, -16],
    color: 0x14b8a6,
    description: 'Locked — Coming Soon. Food chains, energy flow, and ozone depletion.',
  },
];

export class HubScene {
  public scene: THREE.Scene;
  public renderer: THREE.WebGLRenderer;
  private animTime = 0;

  // Visual Meshes for animation
  private activePortalRing: THREE.Mesh | null = null;
  private activePortalCore: THREE.Mesh | null = null;
  private monumentAtomRings: THREE.Mesh[] = [];
  private portalMeshes: THREE.Group[] = [];

  // Collision boundary
  public readonly boundaryRadius = 28;

  constructor(canvas: HTMLCanvasElement, quality: 'low' | 'balanced' = 'balanced') {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f1d);
    this.scene.fog = new THREE.FogExp2(0x0a0f1d, 0.018);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: quality === 'balanced',
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = quality === 'balanced';
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // PMREM Studio Environment
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    this.setupLighting(quality);
    this.buildCourtyardGround();
    this.buildCentralMonument();
    this.buildPortals();
    this.buildPerimeterDecorations();
  }

  private setupLighting(quality: 'low' | 'balanced') {
    // 1. Cool Sky / Ground Hemisphere Light
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 0.65);
    hemiLight.position.set(0, 50, 0);
    this.scene.add(hemiLight);

    // 2. Warm Directional Key Light with tight shadow frustum
    const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.4);
    dirLight.position.set(20, 35, 15);
    if (quality === 'balanced') {
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.near = 0.5;
      dirLight.shadow.camera.far = 80;
      const d = 32;
      dirLight.shadow.camera.left = -d;
      dirLight.shadow.camera.right = d;
      dirLight.shadow.camera.top = d;
      dirLight.shadow.camera.bottom = -d;
      dirLight.shadow.bias = -0.0005;
      dirLight.shadow.normalBias = 0.02;
    }
    this.scene.add(dirLight);

    // 3. Ambient plaza fill
    const ambientLight = new THREE.AmbientLight(0x1e1b4b, 0.4);
    this.scene.add(ambientLight);
  }

  private buildCourtyardGround() {
    // Procedural Cobblestone Texture via HTML5 Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 256, 256);

    // Cobblestone rings pattern
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    for (let r = 20; r < 250; r += 32) {
      ctx.beginPath();
      ctx.arc(128, 128, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    const groundTex = new THREE.CanvasTexture(canvas);
    groundTex.wrapS = THREE.RepeatWrapping;
    groundTex.wrapT = THREE.RepeatWrapping;
    groundTex.repeat.set(12, 12);
    groundTex.colorSpace = THREE.SRGBColorSpace;

    const groundGeo = new THREE.CircleGeometry(32, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.85,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Plaza Curb / Boundary Rim
    const curbGeo = new THREE.TorusGeometry(32.2, 0.45, 8, 48);
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 });
    const curb = new THREE.Mesh(curbGeo, curbMat);
    curb.rotation.x = Math.PI / 2;
    curb.position.y = 0.2;
    curb.receiveShadow = true;
    this.scene.add(curb);
  }

  private buildCentralMonument() {
    const monumentGroup = new THREE.Group();

    // Octagonal Raised Stone Base
    const baseGeo = new THREE.CylinderGeometry(3.6, 4.2, 0.6, 8);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7, metalness: 0.2 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.3;
    base.castShadow = true;
    base.receiveShadow = true;
    monumentGroup.add(base);

    // Central Pedestal Pillar
    const pillarGeo = new THREE.CylinderGeometry(0.8, 1.1, 1.8, 12);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.7 });
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.y = 1.5;
    pillar.castShadow = true;
    monumentGroup.add(pillar);

    // Levitating Science Atom Core
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
    });
    const coreMesh = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), coreMat);
    coreMesh.position.y = 3.2;
    monumentGroup.add(coreMesh);

    // 3 Orbiting Electron Rings
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      metalness: 0.8,
    });

    const ringAngles = [
      [Math.PI / 3, 0, 0],
      [0, Math.PI / 3, Math.PI / 4],
      [-Math.PI / 3, -Math.PI / 4, 0],
    ];

    ringAngles.forEach(([rx, ry, rz]) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.04, 8, 32), ringMat);
      ring.position.y = 3.2;
      ring.rotation.set(rx, ry, rz);
      this.monumentAtomRings.push(ring);
      monumentGroup.add(ring);
    });

    // Monument Glow Light
    const monumentLight = new THREE.PointLight(0x38bdf8, 2.0, 10);
    monumentLight.position.set(0, 3.2, 0);
    monumentGroup.add(monumentLight);

    this.scene.add(monumentGroup);
  }

  private buildPortals() {
    CHAPTER_PORTALS_CONFIG.forEach((data) => {
      const portalGroup = new THREE.Group();
      portalGroup.position.set(...data.position);

      // Face towards center (0, 0, 0)
      portalGroup.lookAt(0, 0, 0);

      // Two Stone Columns
      const columnGeo = new THREE.CylinderGeometry(0.35, 0.45, 4.5, 12);
      const columnMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
      const leftCol = new THREE.Mesh(columnGeo, columnMat);
      leftCol.position.set(-1.8, 2.25, 0);
      leftCol.castShadow = true;
      portalGroup.add(leftCol);

      const rightCol = new THREE.Mesh(columnGeo, columnMat);
      rightCol.position.set(1.8, 2.25, 0);
      rightCol.castShadow = true;
      portalGroup.add(rightCol);

      // Arch Lintle
      const archGeo = new THREE.BoxGeometry(4.2, 0.6, 0.8);
      const archMesh = new THREE.Mesh(archGeo, columnMat);
      archMesh.position.set(0, 4.4, 0);
      archMesh.castShadow = true;
      portalGroup.add(archMesh);

      // Badge Plaque
      const plaqueMat = new THREE.MeshStandardMaterial({
        color: data.status === 'active' ? 0x047857 : 0x1e293b,
        roughness: 0.3,
        metalness: 0.5,
      });
      const plaque = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.4, 0.1), plaqueMat);
      plaque.position.set(0, 4.4, 0.42);
      portalGroup.add(plaque);

      if (data.status === 'active') {
        // ACTIVE CHAPTER 1 PORTAL: Swirling energetic portal core
        const portalCoreGeo = new THREE.PlaneGeometry(3.0, 4.0);
        const coreMat = new THREE.MeshBasicMaterial({
          color: 0x10b981,
          transparent: true,
          opacity: 0.65,
          side: THREE.DoubleSide,
        });
        this.activePortalCore = new THREE.Mesh(portalCoreGeo, coreMat);
        this.activePortalCore.position.set(0, 2.1, 0);
        portalGroup.add(this.activePortalCore);

        // Glowing Energy Ring
        const ringGeo = new THREE.TorusGeometry(1.6, 0.08, 12, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
        this.activePortalRing = new THREE.Mesh(ringGeo, ringMat);
        this.activePortalRing.position.set(0, 2.1, 0.05);
        portalGroup.add(this.activePortalRing);

        // Active Portal Beacon Light
        const portalLight = new THREE.PointLight(0x10b981, 2.5, 8);
        portalLight.position.set(0, 2.5, 0.5);
        portalGroup.add(portalLight);
      } else {
        // LOCKED PORTALS: Heavy Brass Padlock and Chain Mesh
        const chainMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4, metalness: 0.8 });
        const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.8), chainMat);
        chain.rotation.z = Math.PI / 2;
        chain.position.set(0, 2.0, 0.1);
        portalGroup.add(chain);

        // Padlock body
        const lockBodyMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.8 });
        const lockBody = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.2), lockBodyMat);
        lockBody.position.set(0, 1.9, 0.2);
        portalGroup.add(lockBody);

        const shackle = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.04, 8, 16), chainMat);
        shackle.position.set(0, 2.2, 0.2);
        portalGroup.add(shackle);
      }

      this.portalMeshes.push(portalGroup);
      this.scene.add(portalGroup);
    });
  }

  private buildPerimeterDecorations() {
    // Perimeter Trees and Lanterns
    const treeGeo = new THREE.ConeGeometry(1.4, 4.0, 6);
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });

    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const x = Math.cos(angle) * 30;
      const z = Math.sin(angle) * 30;

      const tree = new THREE.Group();
      tree.position.set(x, 0, z);

      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.75;
      trunk.castShadow = true;
      tree.add(trunk);

      const foliage = new THREE.Mesh(treeGeo, foliageMat);
      foliage.position.y = 2.8;
      foliage.castShadow = true;
      tree.add(foliage);

      this.scene.add(tree);
    }
  }

  /**
   * Checks for nearest interactable portal within proximity radius (4.0m)
   */
  public getNearbyPortal(playerPos: THREE.Vector3): ChapterPortalData | null {
    for (const portal of CHAPTER_PORTALS_CONFIG) {
      const portalPos = new THREE.Vector3(...portal.position);
      const dist = playerPos.distanceTo(portalPos);
      if (dist <= 4.2) {
        return portal;
      }
    }
    return null;
  }

  /**
   * Collision boundary test: enforces player stays within academy circle
   */
  public enforceBoundaries(pos: THREE.Vector3): boolean {
    const distFromOrigin = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
    if (distFromOrigin > this.boundaryRadius) {
      const angle = Math.atan2(pos.z, pos.x);
      pos.x = Math.cos(angle) * this.boundaryRadius;
      pos.z = Math.sin(angle) * this.boundaryRadius;
      return true; // Clamped
    }
    // Prevent walking into central monument base
    if (distFromOrigin < 4.2) {
      const angle = Math.atan2(pos.z, pos.x);
      pos.x = Math.cos(angle) * 4.2;
      pos.z = Math.sin(angle) * 4.2;
      return true;
    }
    return false;
  }

  public update(delta: number) {
    this.animTime += delta;

    // Spin active portal energy ring
    if (this.activePortalRing) {
      this.activePortalRing.rotation.z += delta * 1.8;
      const pulse = 1 + Math.sin(this.animTime * 4) * 0.05;
      this.activePortalRing.scale.set(pulse, pulse, 1);
    }

    if (this.activePortalCore) {
      const mat = this.activePortalCore.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.5 + Math.sin(this.animTime * 3) * 0.2;
    }

    // Spin central monument atom rings
    this.monumentAtomRings.forEach((ring, i) => {
      ring.rotation.z += delta * (1.2 + i * 0.4);
      ring.rotation.y += delta * (0.8 + i * 0.3);
    });
  }

  public dispose() {
    this.renderer.dispose();
    this.scene.clear();
  }
}
