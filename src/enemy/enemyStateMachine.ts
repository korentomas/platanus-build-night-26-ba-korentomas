import * as THREE from 'three';

export type EnemyState = 'idle' | 'walk' | 'attack' | 'death';

export interface EnemyStateMachine {
  readonly currentState: EnemyState;
  readonly isDead: boolean;
  update(delta: number, time: number): void;
  transition(newState: EnemyState): void;
}

// Transform-based animation: no skeleton, just move/rotate/scale the group
export function createEnemyStateMachine(
  group: THREE.Group
): EnemyStateMachine {
  let currentState: EnemyState = 'idle';
  let isDead = false;
  let stateTime = 0; // time since entering current state
  const baseY = group.position.y;

  function transition(newState: EnemyState): void {
    if (isDead && newState !== 'death') return;
    if (newState === currentState) return;
    currentState = newState;
    stateTime = 0;
    if (newState === 'death') isDead = true;
  }

  function update(delta: number, time: number): void {
    stateTime += delta;

    switch (currentState) {
      case 'idle':
        // Gentle hover bob + slow rotation
        group.position.y = baseY + Math.sin(time * 1.5) * 0.08;
        group.rotation.y = Math.sin(time * 0.3) * 0.15;
        break;

      case 'walk':
        // Faster bob + forward tilt to look like marching
        group.position.y = baseY + Math.abs(Math.sin(time * 5)) * 0.12;
        group.rotation.x = Math.sin(time * 5) * 0.06;
        group.rotation.y = 0; // face forward
        break;

      case 'attack':
        // Quick lunge forward + wobble
        if (stateTime < 0.3) {
          // Wind up — lean back
          group.rotation.x = -stateTime * 2;
        } else if (stateTime < 0.6) {
          // Strike — lunge forward
          group.rotation.x = (stateTime - 0.3) * 6 - 0.6;
          group.position.y = baseY + (0.6 - stateTime) * 0.5;
        } else if (stateTime < 1.0) {
          // Recovery
          const t = (stateTime - 0.6) / 0.4;
          group.rotation.x = (1 - t) * 1.2;
          group.position.y = baseY;
        } else {
          // Done — return to idle
          group.rotation.x = 0;
          group.position.y = baseY;
          transition('idle');
        }
        break;

      case 'death':
        if (stateTime < 1.5) {
          // Topple over + sink
          const t = Math.min(stateTime / 1.5, 1);
          group.rotation.x = t * (Math.PI / 2);
          group.position.y = baseY - t * 0.8;
          // Fade out via scale shrink
          const fadeScale = 1 - t * 0.3;
          group.scale.setScalar(fadeScale);
        }
        break;
    }
  }

  return {
    get currentState() { return currentState; },
    get isDead() { return isDead; },
    update,
    transition,
  };
}
