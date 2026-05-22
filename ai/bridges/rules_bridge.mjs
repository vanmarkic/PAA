#!/usr/bin/env node
/**
 * Python ↔ TypeScript bridge for the PAA json-rules-engine layer.
 *
 * Reads a JSON payload from stdin:
 *   { benefitType: 'agr', facts: { employmentStatus: 'part-time', ... } }
 *
 * Resolves the corresponding compiled rules module under `dist/rules/` (the
 * project must be built first: `npm run build`) and runs the eligibility
 * engine. Emits a JSON object on stdout:
 *   { eligible: boolean, amount: number|null, reason: string, ruleIds: string[] }
 *
 * Errors are written to stderr and the process exits with code 2. The Python
 * caller treats this as `unavailable=true`.
 *
 * Design note: this bridge is intentionally thin. All rule logic lives in the
 * TypeScript rules engine — never duplicate it here.
 */

import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

function findRepoRoot(start) {
  let dir = path.resolve(start);
  while (dir !== path.parse(dir).root) {
    if (existsSync(path.join(dir, 'package.json')) && existsSync(path.join(dir, 'src', 'rules'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return null;
}

function camelize(s) {
  return s.replace(/[-_]([a-z])/g, (_, c) => c.toUpperCase());
}

async function loadRules(repoRoot, benefitType) {
  const slug = camelize(benefitType.toLowerCase());
  const candidates = [
    path.join(repoRoot, 'dist', 'rules', `${slug}Rules.js`),
    path.join(repoRoot, 'dist', 'rules', `${benefitType}Rules.js`),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return await import(pathToFileURL(candidate).href);
    }
  }
  throw new Error(
    `No compiled rules module found for benefit '${benefitType}'. ` +
      `Tried: ${candidates.join(', ')}. Run 'npm run build' first.`,
  );
}

async function evaluate(benefitType, facts) {
  const repoRoot = findRepoRoot(process.cwd());
  if (!repoRoot) throw new Error('Could not locate PAA repo root');

  const mod = await loadRules(repoRoot, benefitType);

  // Conventional exports across PAA rule modules: an `Engine` instance and/or
  // a `check<Benefit>Eligibility` function. Try both shapes.
  const candidateFns = Object.values(mod).filter((v) => typeof v === 'function');
  const checker = candidateFns.find(
    (fn) => /eligib/i.test(fn.name) || /check/i.test(fn.name),
  );
  if (!checker) {
    throw new Error(
      `Rules module for '${benefitType}' has no eligibility-check function. ` +
        `Exports: ${Object.keys(mod).join(', ')}`,
    );
  }

  const result = await checker(facts);
  return {
    eligible: Boolean(result?.isEligible ?? result?.eligible),
    amount: result?.calculatedAmount ?? result?.amount ?? null,
    currency: result?.currency || 'EUR',
    reason: result?.reason || '',
    ruleIds: result?.firedRules || result?.ruleIds || [],
  };
}

(async () => {
  try {
    const raw = await readStdin();
    const payload = JSON.parse(raw);
    const out = await evaluate(payload.benefitType, payload.facts || {});
    process.stdout.write(JSON.stringify(out));
  } catch (err) {
    process.stderr.write(String(err?.stack || err));
    process.exit(2);
  }
})();
