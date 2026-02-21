import * as THREE from 'three';
import { createDoorTexture } from '../utils/proceduralTextures';

// Cached door texture — created once, reused for all doors
let doorTexture: THREE.CanvasTexture | null = null;

function getDoorTexture(): THREE.CanvasTexture {
  if (!doorTexture) {
    doorTexture = createDoorTexture();
  }
  return doorTexture;
}

// Lazy singleton for shared geometries
let sharedGeo: {
  panel: THREE.BoxGeometry;
  frameSide: THREE.BoxGeometry;
  frameTop: THREE.BoxGeometry;
  frameThreshold: THREE.BoxGeometry;
  ring: THREE.TorusGeometry;
} | null = null;

// Lazy singleton for shared materials
let sharedMat: {
  wood: THREE.MeshStandardMaterial;
  stone: THREE.MeshStandardMaterial;
  iron: THREE.MeshStandardMaterial;
} | null = null;

function ensureShared(): void {
  if (!sharedGeo) {
    sharedGeo = {
      panel: new THREE.BoxGeometry(3, 4.5, 0.15),
      frameSide: new THREE.BoxGeometry(0.2, 4.5, 0.3),
      frameTop: new THREE.BoxGeometry(3.4, 0.3, 0.3),
      frameThreshold: new THREE.BoxGeometry(3.4, 0.1, 0.3),
      ring: new THREE.TorusGeometry(0.1, 0.02, 6, 8),
    };
  }
  if (!sharedMat) {
    sharedMat = {
      wood: new THREE.MeshStandardMaterial({
        color: 0x5c3317,
        roughness: 0.9,
        map: getDoorTexture(),
      }),
      stone: new THREE.MeshStandardMaterial({
        color: 0x555555,
        roughness: 0.95,
      }),
      iron: new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.8,
        roughness: 0.3,
      }),
    };
  }
}

export function createDoorModel(orientation: 'ns' | 'ew'): THREE.Group {
  ensureShared();

  const group = new THREE.Group();

  // Inner pivot group — rotating this animates door opening
  const pivot = new THREE.Group();

  const panel = new THREE.Mesh(sharedGeo!.panel, sharedMat!.wood);
  // Offset pivot so door swings from its edge, not center
  panel.position.set(1.5, 4.5 / 2, 0);
  pivot.add(panel);

  // Iron ring handle on the panel (slightly offset from center)
  const ring = new THREE.Mesh(sharedGeo!.ring, sharedMat!.iron);
  ring.position.set(1.5 + 0.5, 4.5 / 2, 0.15 / 2 + 0.02);
  ring.rotation.x = Math.PI / 2;
  pivot.add(ring);

  // Shift pivot so door is centered on the cell
  pivot.position.set(-1.5, 0, 0);
  group.add(pivot);

  // Door frame — attached to group (stays fixed, doesn't swing)
  const leftPillar = new THREE.Mesh(sharedGeo!.frameSide, sharedMat!.stone);
  leftPillar.position.set(-1.6, 4.5 / 2, 0);
  group.add(leftPillar);

  const rightPillar = new THREE.Mesh(sharedGeo!.frameSide, sharedMat!.stone);
  rightPillar.position.set(1.6, 4.5 / 2, 0);
  group.add(rightPillar);

  const topBeam = new THREE.Mesh(sharedGeo!.frameTop, sharedMat!.stone);
  topBeam.position.set(0, 4.5, 0);
  group.add(topBeam);

  const threshold = new THREE.Mesh(sharedGeo!.frameThreshold, sharedMat!.stone);
  threshold.position.set(0, 0, 0);
  group.add(threshold);

  // Rotate based on orientation:
  // 'ns' = corridor runs north-south, door panel spans east-west (default)
  // 'ew' = corridor runs east-west, door panel spans north-south (rotate 90°)
  if (orientation === 'ew') {
    group.rotation.y = Math.PI / 2;
  }

  return group;
}

export function setDoorLocked(doorGroup: THREE.Group, locked: boolean): void {
  // Door structure: group > pivot (children[0]) > panel (children[0])
  const pivot = doorGroup.children[0] as THREE.Group;
  if (!pivot) return;
  const panel = pivot.children[0] as THREE.Mesh;
  if (!panel) return;

  const mat = panel.material as THREE.MeshStandardMaterial;

  if (locked) {
    // Clone material on first lock so we don't affect other doors
    if (mat === sharedMat?.wood) {
      const cloned = mat.clone();
      panel.material = cloned;
      cloned.emissive.set(0xff2222);
      cloned.emissiveIntensity = 0.5;
    } else {
      mat.emissive.set(0xff2222);
      mat.emissiveIntensity = 0.5;
    }
  } else {
    mat.emissive.set(0x000000);
    mat.emissiveIntensity = 0;
  }
}

export function disposeDoorShared(): void {
  if (sharedGeo) {
    sharedGeo.panel.dispose();
    sharedGeo.frameSide.dispose();
    sharedGeo.frameTop.dispose();
    sharedGeo.frameThreshold.dispose();
    sharedGeo.ring.dispose();
    sharedGeo = null;
  }
  if (sharedMat) {
    sharedMat.wood.dispose();
    sharedMat.stone.dispose();
    sharedMat.iron.dispose();
    sharedMat = null;
  }
  if (doorTexture) {
    doorTexture.dispose();
    doorTexture = null;
  }
}
