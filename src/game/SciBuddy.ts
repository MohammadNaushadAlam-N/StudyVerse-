/**
 * StudyVerse 10 — SciBuddy 3D Guide Character
 * Full-body, low-poly friendly robotic science companion with animated states:
 * idle, point, explain, think, celebrate, retry.
 */

import * as THREE from 'three';
import { SciBuddyAnimationState } from './types.ts';

export class SciBuddy {
  public group: THREE.Group;
  public state: SciBuddyAnimationState = 'idle';

  private head: THREE.Mesh;
  private eyeVisor: THREE.Mesh;
  private torso: THREE.Mesh;
  private leftHand: THREE.Mesh;
  private rightHand: THREE.Mesh;
  private haloRing: THREE.Mesh;
  private thrusterGlow: THREE.PointLight;

  private floatTime = 0;
  private targetPosition = new THREE.Vector3(2.2, 1.4, 0.5);

  constructor() {
    this.group = new THREE.Group();

    // 1. Materials
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Crisp ceramic white
      roughness: 0.25,
      metalness: 0.2,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4, // Cyan science glow
      roughness: 0.2,
      metalness: 0.8,
    });
    const visorMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee, // Luminous digital eye visor
    });
    const bronzeMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.4,
      metalness: 0.6,
    });

    // 2. Spherical Floating Head
    const headGeo = new THREE.SphereGeometry(0.28, 16, 16);
    this.head = new THREE.Mesh(headGeo, chassisMat);
    this.head.castShadow = true;
    this.group.add(this.head);

    // Cute eye visor
    const visorGeo = new THREE.BoxGeometry(0.32, 0.1, 0.1);
    this.eyeVisor = new THREE.Mesh(visorGeo, visorMat);
    this.eyeVisor.position.set(0, 0.04, 0.23);
    this.head.add(this.eyeVisor);

    // Antenna & Halo Ring
    const antennaStem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.12), bronzeMat);
    antennaStem.position.y = 0.32;
    this.head.add(antennaStem);

    const haloGeo = new THREE.TorusGeometry(0.32, 0.02, 8, 24);
    this.haloRing = new THREE.Mesh(haloGeo, accentMat);
    this.haloRing.rotation.x = Math.PI / 2;
    this.haloRing.position.y = 0.38;
    this.head.add(this.haloRing);

    // 3. Compact Torso
    const torsoGeo = new THREE.CylinderGeometry(0.18, 0.12, 0.28, 16);
    this.torso = new THREE.Mesh(torsoGeo, chassisMat);
    this.torso.position.y = -0.32;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    // Chest Atom Insignia
    const insignia = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 6, 16), accentMat);
    insignia.position.set(0, 0, 0.18);
    this.torso.add(insignia);

    // 4. Floating Magnetic Hands
    const handGeo = new THREE.SphereGeometry(0.07, 12, 12);
    this.leftHand = new THREE.Mesh(handGeo, accentMat);
    this.leftHand.position.set(0.32, -0.2, 0.1);
    this.group.add(this.leftHand);

    this.rightHand = new THREE.Mesh(handGeo, accentMat);
    this.rightHand.position.set(-0.32, -0.2, 0.1);
    this.group.add(this.rightHand);

    // 5. Thruster Light & Glow
    this.thrusterGlow = new THREE.PointLight(0x06b6d4, 1.2, 2.5);
    this.thrusterGlow.position.set(0, -0.5, 0);
    this.group.add(this.thrusterGlow);

    this.group.position.copy(this.targetPosition);
  }

  public setState(newState: SciBuddyAnimationState) {
    this.state = newState;
  }

  public update(delta: number, playerPos: THREE.Vector3) {
    this.floatTime += delta * 2.5;

    // Follow player smoothly at hover offset
    const desiredPos = new THREE.Vector3(
      playerPos.x + Math.sin(playerPos.y) + 1.8,
      playerPos.y + 1.4 + Math.sin(this.floatTime) * 0.08,
      playerPos.z + 1.0
    );
    this.group.position.lerp(desiredPos, delta * 3.5);

    // Always look towards player
    this.group.lookAt(playerPos.x, playerPos.y + 1.2, playerPos.z);

    // Spin halo
    this.haloRing.rotation.z += delta * 1.5;

    // State Animations
    switch (this.state) {
      case 'idle':
        this.leftHand.position.set(0.3, -0.2 + Math.sin(this.floatTime * 1.2) * 0.03, 0.1);
        this.rightHand.position.set(-0.3, -0.2 - Math.sin(this.floatTime * 1.2) * 0.03, 0.1);
        this.head.rotation.z = Math.sin(this.floatTime * 0.8) * 0.05;
        break;

      case 'point':
        // Extend right hand outward in direction of Chapter 1
        this.rightHand.position.set(-0.45, 0.1, 0.45);
        this.leftHand.position.set(0.25, -0.2, 0.05);
        this.head.rotation.z = -0.15;
        break;

      case 'explain':
        // Both hands gesture rhythmically
        this.leftHand.position.set(0.28, -0.05 + Math.sin(this.floatTime * 3) * 0.06, 0.3);
        this.rightHand.position.set(-0.28, -0.05 + Math.cos(this.floatTime * 3) * 0.06, 0.3);
        this.head.rotation.x = Math.sin(this.floatTime * 2) * 0.08;
        break;

      case 'think':
        // Head tilted, hand touching chin
        this.head.rotation.z = 0.25;
        this.rightHand.position.set(-0.15, 0.15, 0.28);
        this.leftHand.position.set(0.25, -0.25, 0.05);
        break;

      case 'celebrate':
        // Excited spin and high hands
        this.leftHand.position.set(0.35, 0.3 + Math.sin(this.floatTime * 6) * 0.1, 0.1);
        this.rightHand.position.set(-0.35, 0.3 + Math.sin(this.floatTime * 6) * 0.1, 0.1);
        this.head.position.y = Math.sin(this.floatTime * 5) * 0.08;
        break;

      case 'retry':
        // Gentle comforting nod
        this.leftHand.position.set(0.2, -0.15, 0.2);
        this.rightHand.position.set(-0.2, -0.15, 0.2);
        this.head.rotation.x = Math.sin(this.floatTime * 2) * 0.12;
        break;
    }
  }
}
