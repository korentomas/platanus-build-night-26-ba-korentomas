import * as THREE from 'three';

export function createBrickTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Base mortar color
  ctx.fillStyle = '#2a2018';
  ctx.fillRect(0, 0, size, size);

  const brickW = 64;
  const brickH = 28;
  const mortarGap = 4;
  const rows = Math.ceil(size / (brickH + mortarGap));
  const cols = Math.ceil(size / (brickW + mortarGap)) + 1;

  for (let row = 0; row < rows; row++) {
    const offset = row % 2 === 0 ? 0 : -(brickW / 2 + mortarGap / 2);
    for (let col = 0; col < cols; col++) {
      const x = col * (brickW + mortarGap) + offset;
      const y = row * (brickH + mortarGap);

      // Vary brick color
      const r = 100 + Math.random() * 40;
      const g = 45 + Math.random() * 20;
      const b = 30 + Math.random() * 15;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, y, brickW, brickH);

      // Subtle noise on each brick
      for (let i = 0; i < 30; i++) {
        const nx = x + Math.random() * brickW;
        const ny = y + Math.random() * brickH;
        const brightness = Math.random() * 30 - 15;
        ctx.fillStyle = `rgba(${brightness > 0 ? 255 : 0},${brightness > 0 ? 255 : 0},${brightness > 0 ? 255 : 0},${Math.abs(brightness) / 100})`;
        ctx.fillRect(nx, ny, 2, 2);
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.NearestFilter;
  return tex;
}

export function createStoneFloorTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Dark stone base
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, size, size);

  const slabSize = 64;
  const gap = 3;
  const slabs = size / slabSize;

  for (let row = 0; row < slabs; row++) {
    for (let col = 0; col < slabs; col++) {
      const x = col * slabSize;
      const y = row * slabSize;
      const g = 35 + Math.random() * 20;
      ctx.fillStyle = `rgb(${g},${g},${g + 2})`;
      ctx.fillRect(x + gap, y + gap, slabSize - gap * 2, slabSize - gap * 2);

      // Stone grain
      for (let i = 0; i < 40; i++) {
        const nx = x + gap + Math.random() * (slabSize - gap * 2);
        const ny = y + gap + Math.random() * (slabSize - gap * 2);
        const b = Math.random() * 20 - 10;
        ctx.fillStyle = `rgba(${b > 0 ? 200 : 0},${b > 0 ? 200 : 0},${b > 0 ? 200 : 0},${Math.abs(b) / 80})`;
        ctx.fillRect(nx, ny, 3, 1);
      }
    }
  }

  // Grout lines
  ctx.strokeStyle = '#0f0f0f';
  ctx.lineWidth = gap;
  for (let i = 0; i <= slabs; i++) {
    ctx.beginPath();
    ctx.moveTo(i * slabSize, 0);
    ctx.lineTo(i * slabSize, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * slabSize);
    ctx.lineTo(size, i * slabSize);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.NearestFilter;
  return tex;
}

export function createDoorTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Dark aged wood base
  ctx.fillStyle = '#3a2010';
  ctx.fillRect(0, 0, size, size);

  // 4 vertical planks with color variation and gaps
  const plankCount = 4;
  const gapWidth = 3;
  const plankWidth = (size - gapWidth * (plankCount + 1)) / plankCount;

  for (let i = 0; i < plankCount; i++) {
    const x = gapWidth + i * (plankWidth + gapWidth);
    // Slight color variation per plank
    const rBase = 58 + Math.random() * 16 - 8;
    const gBase = 32 + Math.random() * 10 - 5;
    const bBase = 16 + Math.random() * 8 - 4;
    ctx.fillStyle = `rgb(${rBase},${gBase},${bBase})`;
    ctx.fillRect(x, 0, plankWidth, size);

    // Wood grain: thin horizontal scratches
    for (let j = 0; j < 60; j++) {
      const gy = Math.random() * size;
      const gLen = 10 + Math.random() * (plankWidth - 10);
      const gx = x + Math.random() * (plankWidth - gLen);
      const bright = Math.random() > 0.5;
      ctx.fillStyle = bright
        ? `rgba(255,220,180,${0.03 + Math.random() * 0.05})`
        : `rgba(0,0,0,${0.05 + Math.random() * 0.08})`;
      ctx.fillRect(gx, gy, gLen, 1);
    }
  }

  // Dark mortar/gap lines between planks
  ctx.fillStyle = '#1a0d05';
  for (let i = 0; i <= plankCount; i++) {
    const x = i * (plankWidth + gapWidth);
    ctx.fillRect(x, 0, gapWidth, size);
  }

  // 2 horizontal iron bands
  const bandHeight = 12;
  const bandPositions = [size * 0.25, size * 0.72];
  for (const by of bandPositions) {
    ctx.fillStyle = '#333844';
    ctx.fillRect(0, by, size, bandHeight);

    // Band edge highlights
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(0, by, size, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(0, by + bandHeight - 1, size, 1);

    // Iron studs/rivets — 6 per band
    const studCount = 6;
    const studRadius = 3;
    for (let s = 0; s < studCount; s++) {
      const sx = (size / (studCount + 1)) * (s + 1);
      const sy = by + bandHeight / 2;
      ctx.beginPath();
      ctx.arc(sx, sy, studRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#2a2a30';
      ctx.fill();
      // Stud highlight
      ctx.beginPath();
      ctx.arc(sx - 1, sy - 1, studRadius * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fill();
    }
  }

  // Aged/weathered noise
  for (let i = 0; i < 200; i++) {
    const nx = Math.random() * size;
    const ny = Math.random() * size;
    const dark = Math.random() > 0.5;
    ctx.fillStyle = dark
      ? `rgba(0,0,0,${0.05 + Math.random() * 0.1})`
      : `rgba(180,140,100,${0.02 + Math.random() * 0.04})`;
    ctx.fillRect(nx, ny, 2 + Math.random() * 3, 1 + Math.random() * 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.NearestFilter;
  return tex;
}

export function createCeilingTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Very dark rough stone
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 600; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const g = Math.random() * 25;
    ctx.fillStyle = `rgba(${g},${g},${g},0.4)`;
    ctx.fillRect(x, y, 2 + Math.random() * 4, 1 + Math.random() * 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.NearestFilter;
  return tex;
}
