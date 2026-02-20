import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export interface EnemyModel {
  group: THREE.Group;
  mixer: THREE.AnimationMixer;
  clips: {
    idle: THREE.AnimationClip;
    walk: THREE.AnimationClip;
    attack: THREE.AnimationClip;
    death: THREE.AnimationClip;
  };
  dispose: () => void;
}

export async function loadEnemyModel(animationUrls: {
  idle: string;
  walk: string;
  attack: string;
  death: string;
}): Promise<EnemyModel> {
  const loader = new GLTFLoader();

  const [idleGltf, walkGltf, attackGltf, deathGltf] = await Promise.all([
    loader.loadAsync(animationUrls.idle),
    loader.loadAsync(animationUrls.walk),
    loader.loadAsync(animationUrls.attack),
    loader.loadAsync(animationUrls.death),
  ]);

  const model = idleGltf.scene;

  // Normalize to ~1.7 units tall, feet on ground
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const targetHeight = 1.7;
  const scale = targetHeight / size.y;
  model.scale.setScalar(scale);
  model.position.x = -center.x * scale;
  model.position.y = -box.min.y * scale;
  model.position.z = -center.z * scale;

  const group = new THREE.Group();
  group.add(model);

  const mixer = new THREE.AnimationMixer(model);

  const clips = {
    idle: idleGltf.animations[0],
    walk: walkGltf.animations[0],
    attack: attackGltf.animations[0],
    death: deathGltf.animations[0],
  };
  clips.idle.name = 'idle';
  clips.walk.name = 'walk';
  clips.attack.name = 'attack';
  clips.death.name = 'death';

  function dispose(): void {
    mixer.stopAllAction();
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];
        for (const m of materials) {
          if ('map' in m && m.map) m.map.dispose();
          m.dispose();
        }
      }
    });
  }

  return { group, mixer, clips, dispose };
}
