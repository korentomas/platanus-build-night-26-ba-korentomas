export interface ProjectilePad {
  container: HTMLDivElement;
  toDataURL(): string;
  clear(): void;
  destroy(): void;
  show(): void;
  hide(): void;
}

export function createProjectilePad(parentElement: HTMLElement): ProjectilePad {
  const container = document.createElement('div');
  Object.assign(container.style, {
    position: 'absolute',
    bottom: '30px',
    right: '30px',
    transform: 'rotate(-12deg)',
    zIndex: '5',
    display: 'none',
  });

  // Parchment background wrapper
  const inner = document.createElement('div');
  Object.assign(inner.style, {
    background: '#f4e4c1',
    border: '2px solid #8b7355',
    borderRadius: '6px',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  });

  // Label
  const label = document.createElement('div');
  Object.assign(label.style, {
    color: '#2a1a0a',
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: '12px',
    fontWeight: '600',
  });
  label.textContent = 'Draw projectile';
  inner.appendChild(label);

  // Canvas
  const canvas = document.createElement('canvas');
  canvas.width = 150;
  canvas.height = 150;
  Object.assign(canvas.style, {
    width: '150px',
    height: '150px',
    cursor: 'crosshair',
    display: 'block',
    background: '#fff',
    borderRadius: '4px',
    border: '1px solid rgba(42, 26, 10, 0.3)',
  });
  inner.appendChild(canvas);

  const ctx = canvas.getContext('2d')!;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#2a1a0a';
  ctx.lineWidth = 2;

  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  function getPos(e: MouseEvent | Touch): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function onStart(e: MouseEvent | TouchEvent): void {
    e.preventDefault();
    e.stopPropagation();
    isDrawing = true;
    const pos = e instanceof MouseEvent ? e : (e as TouchEvent).touches[0];
    const { x, y } = getPos(pos);
    lastX = x;
    lastY = y;
  }

  function onMove(e: MouseEvent | TouchEvent): void {
    if (!isDrawing) return;
    e.preventDefault();
    e.stopPropagation();
    const pos = e instanceof MouseEvent ? e : (e as TouchEvent).touches[0];
    const { x, y } = getPos(pos);

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastX = x;
    lastY = y;
  }

  function onEnd(e?: Event): void {
    if (e) e.stopPropagation();
    isDrawing = false;
  }

  canvas.addEventListener('mousedown', onStart);
  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseup', onEnd);
  canvas.addEventListener('mouseleave', onEnd);
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  canvas.addEventListener('touchstart', onStart, { passive: false });
  canvas.addEventListener('touchmove', onMove, { passive: false });
  canvas.addEventListener('touchend', onEnd);
  canvas.addEventListener('touchcancel', onEnd);

  // Clear button
  const clearBtn = document.createElement('button');
  Object.assign(clearBtn.style, {
    background: 'none',
    border: 'none',
    color: '#8b7355',
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: '11px',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: '2px 4px',
  });
  clearBtn.textContent = 'Clear';
  clearBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
  inner.appendChild(clearBtn);

  container.appendChild(inner);
  parentElement.appendChild(container);

  function clear(): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function toDataURL(): string {
    return canvas.toDataURL('image/png');
  }

  function show(): void {
    container.style.display = 'block';
  }

  function hide(): void {
    container.style.display = 'none';
  }

  function destroy(): void {
    canvas.removeEventListener('mousedown', onStart);
    canvas.removeEventListener('mousemove', onMove);
    canvas.removeEventListener('mouseup', onEnd);
    canvas.removeEventListener('mouseleave', onEnd);
    canvas.removeEventListener('touchstart', onStart);
    canvas.removeEventListener('touchmove', onMove);
    canvas.removeEventListener('touchend', onEnd);
    canvas.removeEventListener('touchcancel', onEnd);
    container.remove();
  }

  return { container, toDataURL, clear, destroy, show, hide };
}
