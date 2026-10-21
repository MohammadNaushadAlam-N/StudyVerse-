/**
 * StudyVerse 10 — Procedural Student Avatar
 * Composed 8-part procedural Three.js hierarchy (Head, Torso, Arms, Legs, Backpack, Shadow)
 * Replaceable with rigged GLB asset in future phases.
 */

import * as THREE from 'three';

export class PlayerAvatar {
  public group: THREE.Group;
  
  // Limbs for animation
  private head: THREE.Mesh;
  private torso: THREE.Mesh;
  private leftArm: THREE.Group;
  private rightArm: THREE.Group;
  private leftLeg: THREE.Group;
  private rightLeg: THREE.Group;
  private backpack: THREE.Mesh;
  private shadow: THREE.Mesh;

  private walkCycle = 0;
  private isMoving = false;
  public velocity = new THREE.Vector3();
  public currentRotation = 0;

  constructor() {
    this.group = new THREE.Group();

    // 1. Materials with contrasting PBR roughness/metalness
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xdeb887,
      roughness: 0.7,
      metalness: 0.05,
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x2c1d11,
      roughness: 0.9,
      metalness: 0.1,
    });
    const blazerMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a, // Academy navy blazer
      roughness: 0.5,
      metalness: 0.15,
    });
    const pantsMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Slate grey trousers
      roughness: 0.6,
      metalness: 0.1,
    });
    const shoeMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.4,
    });
    const backpackMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Energetic amber backpack
      roughness: 0.6,
      metalness: 0.2,
    });

    // 2. Head (Head + Hair + Visor)
    const headGroup = new THREE.Group();
    const headGeo = new THREE.SphereGeometry(0.24, 16, 16);
    this.head = new THREE.Mesh(headGeo, skinMat);
    this.head.castShadow = true;
    headGroup.add(this.head);

    const hairGeo = new THREE.SphereGeometry(0.26, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.position.y = 0.02;
    headGroup.add(hairMesh);

    // Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const eyeGeo = new THREE.SphereGeometry(0.035, 8, 8);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(0.08, 0.02, 0.21);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(-0.08, 0.02, 0.21);
    headGroup.add(leftEye, rightEye);

    headGroup.position.y = 1.35;
    this.group.add(headGroup);

    // 3. Torso (Blazer + Shirt Tie Accent)
    const torsoGeo = new THREE.BoxGeometry(0.44, 0.55, 0.26);
    this.torso = new THREE.Mesh(torsoGeo, blazerMat);
    this.torso.position.y = 0.95;
    this.torso.castShadow = true;
    this.torso.receiveShadow = true;
    this.group.add(this.torso);

    // Tie / Badge Accent
    const badgeMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.2, metalness: 0.8 });
    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.02), badgeMat);
    badge.position.set(0.12, 0.08, 0.14);
    this.torso.add(badge);

    // 4. Backpack (Attached to back of Torso)
    const backpackGeo = new THREE.BoxGeometry(0.32, 0.42, 0.16);
    this.backpack = new THREE.Mesh(backpackGeo, backpackMat);
    this.backpack.position.set(0, 0, -0.19);
    this.backpack.castShadow = true;
    this.torso.add(this.backpack);

    // 5. Left & Right Arms (Pivoted at Shoulders)
    const armGeo = new THREE.BoxGeometry(0.12, 0.45, 0.12);
    armGeo.translate(0, -0.18, 0); // Offset pivot to top shoulder

    this.leftArm = new THREE.Group();
    const leftArmMesh = new THREE.Mesh(armGeo, blazerMat);
    leftArmMesh.castShadow = true;
    this.leftArm.add(leftArmMesh);
    this.leftArm.position.set(0.3, 1.15, 0);
    this.group.add(this.leftArm);

    this.rightArm = new THREE.Group();
    const rightArmMesh = new THREE.Mesh(armGeo, blazerMat);
    rightArmMesh.castShadow = true;
    this.rightArm.add(rightArmMesh);
    this.rightArm.position.set(-0.3, 1.15, 0);
    this.group.add(this.rightArm);

    // 6. Left & Right Legs (Pivoted at Hips)
    const legGeo = new THREE.BoxGeometry(0.15, 0.55, 0.15);
    legGeo.translate(0, -0.25, 0); // Pivot at hip top

    this.leftLeg = new THREE.Group();
    const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
    leftLegMesh.castShadow = true;
    const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.22), shoeMat);
    leftShoe.position.set(0, -0.52, 0.03);
    leftLegMesh.add(leftShoe);
    this.leftLeg.add(leftLegMesh);
    this.leftLeg.position.set(0.12, 0.65, 0);
    this.group.add(this.leftLeg);

    this.rightLeg = new THREE.Group();
    const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
    rightLegMesh.castShadow = true;
    const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.22), shoeMat);
    rightShoe.position.set(0, -0.52, 0.03);
    rightLegMesh.add(rightShoe);
    this.rightLeg.add(rightLegMesh);
    this.rightLeg.position.set(-0.12, 0.65, 0);
    this.group.add(this.rightLeg);

    // 7. Soft Radial Contact Shadow beneath feet
    const shadowGeo = new THREE.PlaneGeometry(0.9, 0.9);
    let shadowMat: THREE.Material;

    if (typeof document !== 'undefined') {
      const shadowCanvas = document.createElement('canvas');
      shadowCanvas.width = 64;
      shadowCanvas.height = 64;
      const ctx = shadowCanvas.getContext('2d')!;
      const grad = ctx.createRadialGradient(32, 32, 4, 32, 32, 30);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
      grad.addColorStop(0.6, 'rgba(0, 0, 0, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
      const shadowTex = new THREE.CanvasTexture(shadowCanvas);

      shadowMat = new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
      });
    } else {
      shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      });
    }
    this.shadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = 0.02; // Flush with ground
    this.group.add(this.shadow);
  }

  /**
   * Update animation loop (arms/legs swing, subtle bobbing)
   */
  public update(delta: number, isMoving: boolean, moveSpeed: number) {
    this.isMoving = isMoving;

    if (isMoving) {
      this.walkCycle += delta * moveSpeed * 8;

      // Limb swings opposite
      const swing = Math.sin(this.walkCycle) * 0.65;
      this.leftLeg.rotation.x = swing;
      this.rightLeg.rotation.x = -swing;
      this.leftArm.rotation.x = -swing * 0.8;
      this.rightArm.rotation.x = swing * 0.8;

      // Subtle torso bobbing
      this.torso.position.y = 0.95 + Math.abs(Math.sin(this.walkCycle * 2)) * 0.04;
    } else {
      // Damped return to idle
      this.leftLeg.rotation.x *= 0.85;
      this.rightLeg.rotation.x *= 0.85;
      this.leftArm.rotation.x *= 0.85;
      this.rightArm.rotation.x *= 0.85;

      // Breathing idle
      this.walkCycle += delta * 2;
      this.torso.position.y = 0.95 + Math.sin(this.walkCycle) * 0.015;
    }
  }

  public setRotation(angle: number) {
    this.currentRotation = angle;
    this.group.rotation.y = angle;
  }

  public getPosition(): THREE.Vector3 {
    return this.group.position;
  }

  public setPosition(x: number, y: number, z: number) {
    this.group.position.set(x, y, z);
  }
}
