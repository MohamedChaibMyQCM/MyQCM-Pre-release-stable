/*
 Filter attempts.csv by sessions list.
 Usage:
  node -r ts-node/register scripts/eval/filter_attempts_by_sessions.ts \
    --attempts eval_out/attempts.csv --sessions eval_out/session_legacy.txt --outfile eval_out/attempts_legacy.csv
*/
import * as fs from 'fs';

function argVal(name: string, def?: string) {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  return def;
}

async function main() {
  const attempts = argVal('attempts') as string;
  const sessionsPath = argVal('sessions') as string;
  const outfile = argVal('outfile') as string;
  if (!attempts || !sessionsPath || !outfile) {
    console.error('Missing args');
    process.exit(1);
  }
  const sessionSet = new Set(
    fs
      .readFileSync(sessionsPath, 'utf-8')
      .split(/\r?\n/)
      .filter((x) => x.trim()),
  );
  const lines = fs.readFileSync(attempts, 'utf-8').split(/\r?\n/);
  const header = lines.shift();
  const out: string[] = [header!];
  for (const line of lines) {
    if (!line.trim()) continue;
    const cols = line.split(',');
    const sessionId = cols[1];
    if (sessionSet.has(sessionId)) out.push(line);
  }
  fs.writeFileSync(outfile, out.join('\n'));
  console.log(`Wrote ${outfile} (${out.length - 1} rows)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

