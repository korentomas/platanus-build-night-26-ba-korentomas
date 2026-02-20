# CLAUDE.md

## Project

DungeonSlopper — Three.js dungeon splash screen. Vite + vanilla TypeScript, no React.

## Tech Stack

- **Vite** (dev server + bundler)
- **Three.js** (3D rendering, post-processing)
- **vite-plugin-glsl** (GLSL shader imports)
- **lil-gui** (debug tuning panel)
- **TypeScript** (strict mode)

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Type-check + production build (`tsc && vite build`)
- `npm run preview` — Preview production build
- `npx tsc --noEmit` — Type-check only

## Parallel Agents

Use parallel Task subagents whenever the work involves 2+ independent tasks that don't depend on each other. This applies to:

- **Research**: spawn multiple agents searching different topics simultaneously
- **Implementation**: use teams (TeamCreate) when building features across multiple files/systems that can be worked on independently
- **Testing & validation**: run tests, linting, and type-checking in parallel after changes
- **Code review**: review multiple files or subsystems concurrently

Default to parallel execution. Only run sequentially when there's a real data dependency between tasks.

## Git Workflow

### Branch Naming

- `feature/<name>` — New features
- `fix/<name>` — Bug fixes
- `chore/<name>` — Maintenance, config, docs
- `refactor/<name>` — Code restructuring

### Commit Messages

- Use imperative mood: "Add feature" not "Added feature"
- First line: concise summary (< 72 chars)
- Body: explain **why**, not just what
- Always include `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>` when AI-assisted

### Branch Rules

- Never commit directly to `main` — always use feature branches
- Always use worktrees for isolation (`.worktrees/` directory)
- Rebase or merge from `main` before creating a PR
- Delete branches after merging

## Pull Request Standards

### PR Title

- Short, imperative, < 70 chars
- Prefix with type if helpful: "Add ...", "Fix ...", "Refactor ..."

### PR Body Format

Every PR must follow this template:

```markdown
## Summary
- Bullet points describing what changed and why (1-3 bullets)

## Test Plan
- [ ] Specific verification steps reviewers should follow
- [ ] Include manual testing steps for visual/UI changes
- [ ] Include command to run for automated checks

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### PR Checklist (enforced)

Before creating a PR, verify ALL of the following:

1. **TypeScript compiles**: `npx tsc --noEmit` passes with zero errors
2. **Build succeeds**: `npm run build` completes without errors
3. **No console errors**: Dev server runs without runtime errors in browser console
4. **Resize works**: Window resize doesn't break layout/rendering
5. **No regressions**: Existing features still work after changes

### PR Review Requirements

- At least 1 approval required before merging
- All CI checks must pass
- No unresolved review comments

## Testing Standards

### Required Verification Before Every Commit

1. `npx tsc --noEmit` — Must pass with zero errors
2. `npm run build` — Must produce a clean build
3. Manual smoke test in browser when touching rendering code

### What to Test

- **Rendering**: Corridor renders, torches flicker, text displays, shaders apply
- **Performance**: No frame drops, no memory leaks from corridor recycling
- **Resize**: Camera aspect ratio updates, composer resizes, no clipping
- **Build**: Production build works and runs correctly

### When Adding Tests

If a test framework is added later (e.g., Vitest):

- Unit test utility functions (procedural textures, font loader)
- Snapshot test shader output
- Integration test the animate loop setup
- Run `npm test` before every commit

## Code Standards

### File Organization

```
src/
  main.ts                     # Entry point, animate loop, hover detection
  debugPanel.ts               # lil-gui tuning panel with clipboard export
  scene/
    createScene.ts            # Scene, camera, renderer, fog
    corridor.ts               # Infinite corridor with segment pooling
    torches.ts                # Torch meshes + distance-culled PointLights
    titleText.ts              # "DungeonSlopper" arched 3D text
    menuItems.ts              # Menu items (Start, Settings, Credits) with hover
  postprocessing/
    setupComposer.ts          # EffectComposer chain (RenderPass + Bloom + RetroPass)
    retroShaderPass.ts        # Combined retro shader (grain + CRT + color grade)
  shaders/
    retroComposite.glsl       # Single combined fragment shader for all retro effects
  utils/
    proceduralTextures.ts     # Canvas-based brick/stone textures
    fontLoader.ts             # Shared font cache + loader (single source of truth)
```

### TypeScript

- Strict mode enabled — no `any` types without justification
- Export interfaces for public module contracts
- Use `const` by default, `let` only when reassignment needed

### Three.js Conventions

- Dispose geometries and materials when removing objects
- Use object pooling for repeated elements (corridor segments)
- Keep draw calls low — reuse materials and geometries
- Share geometries/materials across instances (never duplicate per-mesh)
- Centralize font/texture caches — never duplicate caches across modules

### Three.js Performance Rules

These rules were learned from profiling and must be followed:

- **Limit active PointLights to 6 max** — distance-cull the rest (set `visible = false`). 40 PointLights caused severe frame drops
- **Never enable `renderer.shadowMap`** unless something actually casts shadows
- **Combine simple shader passes** — film grain + CRT + color grade should be a single ShaderPass, not 3 separate full-screen draws
- **Halve bloom resolution** — pass `width/2, height/2` to UnrealBloomPass
- **Cap pixel ratio** — `Math.min(window.devicePixelRatio, 2)` prevents 3x+ retina rendering
- **Sync EffectComposer pixel ratio** — call `composer.setPixelRatio(renderer.getPixelRatio())`
- **Never allocate in the animate loop** — cache arrays, raycast targets, etc. outside `requestAnimationFrame`
- **Pass time as parameter** — don't call `performance.now()` redundantly in multiple modules
