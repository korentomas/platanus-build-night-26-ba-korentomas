export interface EnemyForgeResult {
  riggedModelUrl: string;
  animations: {
    idle: string;
    walk: string;
    attack: string;
    death: string;
  };
}

export type ForgeStage = 'sketch' | 'mesh' | 'rigging' | 'animating' | 'done' | 'error';

export interface ForgeProgress {
  stage: ForgeStage;
  message: string;
}

export async function forgeEnemy(
  sketchDataUrl: string,
  onProgress?: (progress: ForgeProgress) => void
): Promise<EnemyForgeResult> {
  onProgress?.({ stage: 'mesh', message: 'Conjuring form...' });

  const res = await fetch('/api/forge-enemy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sketch: sketchDataUrl }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Forge failed (${res.status})`);
  }

  onProgress?.({ stage: 'done', message: 'Enemy forged!' });
  return res.json();
}
