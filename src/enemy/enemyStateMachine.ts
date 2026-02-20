import * as THREE from 'three';

export type EnemyState = 'idle' | 'walk' | 'attack' | 'death';

export interface EnemyStateMachine {
  readonly currentState: EnemyState;
  readonly isDead: boolean;
  update(delta: number): void;
  transition(newState: EnemyState): void;
}

export function createEnemyStateMachine(
  mixer: THREE.AnimationMixer,
  clips: Record<EnemyState, THREE.AnimationClip>
): EnemyStateMachine {
  const actions: Record<EnemyState, THREE.AnimationAction> = {
    idle: mixer.clipAction(clips.idle),
    walk: mixer.clipAction(clips.walk),
    attack: mixer.clipAction(clips.attack),
    death: mixer.clipAction(clips.death),
  };

  actions.idle.setLoop(THREE.LoopRepeat, Infinity);
  actions.walk.setLoop(THREE.LoopRepeat, Infinity);
  actions.attack.setLoop(THREE.LoopOnce, 1);
  actions.attack.clampWhenFinished = true;
  actions.death.setLoop(THREE.LoopOnce, 1);
  actions.death.clampWhenFinished = true;

  let currentState: EnemyState = 'idle';
  let isDead = false;

  actions.idle.play();

  mixer.addEventListener('finished', (e) => {
    const event = e as unknown as { action: THREE.AnimationAction };
    if (event.action === actions.attack && !isDead) {
      transition('idle');
    }
  });

  function transition(newState: EnemyState): void {
    if (isDead && newState !== 'death') return;
    if (newState === currentState) return;

    const oldAction = actions[currentState];
    const newAction = actions[newState];

    newAction.reset();
    newAction.play();
    oldAction.crossFadeTo(newAction, 0.3, true);

    currentState = newState;
    if (newState === 'death') isDead = true;
  }

  function update(delta: number): void {
    mixer.update(delta);
  }

  return {
    get currentState() { return currentState; },
    get isDead() { return isDead; },
    update,
    transition,
  };
}
