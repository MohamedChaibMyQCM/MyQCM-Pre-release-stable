/*
 Label sessions by cohort (legacy vs corrected) based on flag rollout signals.
 Fallback: random 50/50 split if no external mapping available.
 Usage:
   node -r ts-node/register scripts/eval/label_cohort.ts \
     --in eval_out/attempts.csv --legacy-out eval_out/session_legacy.txt --corrected-out eval_out/session_corrected.txt
 Optional:
   --random true|false (default true)
*/
import * as fs from 'fs';

function argVal(name: string, def?: string) {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  return def;
}

async function main() {
  const infile = argVal('in') as string;
  const legacyOut = argVal('legacy-out', 'eval_out/session_legacy.txt')!;
  const correctedOut = argVal('corrected-out', 'eval_out/session_corrected.txt')!;
  const randomSplit = (argVal('random', 'true') || 'true').toLowerCase() === 'true';
  if (!infile || !fs.existsSync(infile)) {
    console.error('Missing --in attempts.csv');
    process.exit(1);
  }
  const sessions = new Set<string>();
  const rs = fs.readFileSync(infile, 'utf-8').split(/\r?\n/);
  const header = rs.shift();
  for (const line of rs) {
    if (!line.trim()) continue;
    const cols = line.split(',');
    const sessionId = cols[1];
    if (sessionId) sessions.add(sessionId);
  }

  const legacy: string[] = [];
  const corrected: string[] = [];

  // Try external mapping file if present
  const mapPath = 'eval_out/ff_switches.json';
  if (fs.existsSync(mapPath)) {
    const map = JSON.parse(fs.readFileSync(mapPath, 'utf-8')) as Record<string, boolean>;
    sessions.forEach((s) => (map[s] ? corrected.push(s) : legacy.push(s)));
  } else if (randomSplit) {
    sessions.forEach((s) => (Math.random() < 0.5 ? legacy.push(s) : corrected.push(s)));
  } else {
    sessions.forEach((s) => legacy.push(s));
  }

  fs.writeFileSync(legacyOut, legacy.join('\n'));
  fs.writeFileSync(correctedOut, corrected.join('\n'));
  console.log(`Wrote ${legacyOut} (${legacy.length}) and ${correctedOut} (${corrected.length})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

