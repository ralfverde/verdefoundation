// Astro 4's Vercel adapter (@astrojs/vercel 7) only knows Node 18 and 20 and
// falls back to the retired nodejs18.x runtime on newer build images. This
// post-build step pins the serverless functions to a supported runtime.
// Override with VERCEL_NODE_RUNTIME (e.g. "nodejs20.x").
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const runtime = process.env.VERCEL_NODE_RUNTIME || 'nodejs22.x';
const root = '.vercel/output/functions';

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name === '.vc-config.json') {
      const cfg = JSON.parse(readFileSync(p, 'utf8'));
      if (cfg.runtime && cfg.runtime.startsWith('nodejs') && cfg.runtime !== runtime) {
        cfg.runtime = runtime;
        writeFileSync(p, JSON.stringify(cfg, null, 2));
        console.log(`[vercel-runtime] ${p} -> ${runtime}`);
      }
    }
  }
}

if (existsSync(root)) walk(root);
