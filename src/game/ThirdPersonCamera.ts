/**
 * StudyVerse 10 — Third-Person Damped Follow Camera
 * Frame-rate independent exponential damping tracking the student avatar.
 */

import * as THREE from 'three';

const _idealOffset = new THREE.Vector3();
const _idealLookAt = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3();

export class ThirdPersonCamera {
  public camera: THREE.PerspectiveCamera;
  private currentPosition = new THREE.Vector3();
  private yaw = 0;
  private pitch = 0.25;

  private distance = 6.0;
  private height = 2.8;

  constructor(camera: THREE.PerspectiveCamera, initialTarget: THREE.Vector3) {
    this.camera = camera;
    this.currentPosition.set(
      initialTarget.x,
      initialTarget.y + this.height,
      initialTarget.z + this.distance
    );
    this.camera.position.copy(this.currentPosition);
    _currentLookAt.copy(initialTarget);
    this.camera.lookAt(_currentLookAt);
  }

  public handleDrag(deltaX: number, deltaY: number) {
    this.yaw -= deltaX * 0.005;
    this.pitch = Math.max(-0.2, Math.min(0.85, this.pitch + deltaY * 0.005));
  }

  public update(delta: number, target: THREE.Vector3, playerRotation: number) {
    // Effective angle blends player rotation with user yaw offset
    const angle = playerRotation + this.yaw;

    // Calculate ideal position behind player
    _idealOffset.set(
      -Math.sin(angle) * this.distance * Math.cos(this.pitch),
      this.height + Math.sin(this.pitch) * this.distance,
      -Math.cos(angle) * this.distance * Math.cos(this.pitch)
    );
    _idealOffset.add(target);

    // Calculate ideal look-at point (player torso/head height)
    _idealLookAt.set(target.x, target.y + 1.2, target.z);

    // Exponential Damping (1 - Math.exp(-k * dt))
    const dampFactor = 1 - Math.exp(-6 * Math.min(delta, 0.05));
    this.currentPosition.lerp(_idealOffset, dampFactor);
    _currentLookAt.lerp(_idealLookAt, dampFactor * 1.5);

    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(_currentLookAt);
  }

  public resetOrientation() {
    this.yaw = 0;
    this.pitch = 0.25;
  }
}
