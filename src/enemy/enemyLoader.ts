import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export interface EnemyModel {
  group: THREE.Group;
  dispose: () => void;
}

export async function loadEnemyModel(glbBuffer: ArrayBuffer): Promise<EnemyModel> {
  const loader = new GLTFLoader();
  const gltf = await loader.parseAsync(glbBuffer, './');
  const model = gltf.scene;

  // Normalize to ~1.7 units tall, feet on ground
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const targetHeight = 1.7;
  const scale = targetHeight / Math.max(size.y, 0.01);
  model.scale.setScalar(scale);
  model.position.x = -center.x * scale;
  model.position.y = -box.min.y * scale;
  model.position.z = -center.z * scale;

  const group = new THREE.Group();
  group.add(model);

  function dispose(): void {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];
        for (const m of materials) {
          if ('map' in m && m.map) (m.map as THREE.Texture).dispose();
          m.dispose();
        }
      }
    });
  }

  return { group, dispose };
}
