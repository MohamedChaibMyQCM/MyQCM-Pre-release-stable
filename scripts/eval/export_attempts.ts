/*
 Export graded attempts to CSV for a time window.
 Columns: user_id, session_id, item_id, kc_id, correct, timestamp, locale, course_id, difficulty
 Usage:
   node -r ts-node/register -r tsconfig-paths/register scripts/eval/export_attempts.ts \
     --start "2025-08-27T00:00:00Z" --end "2025-09-03T00:00:00Z" --outfile eval_out/attempts.csv
*/
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Progress } from 'src/progress/entities/progress.entity';
import { Mcq } from 'src/mcq/entities/mcq.entity';
import { TrainingSession } from 'src/training-session/entities/training-session.entity';
import { Course } from 'src/course/entities/course.entity';
import { User } from 'src/user/entities/user.entity';

function argVal(name: string, def?: string) {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  return def;
}

async function main() {
  const startIso = argVal('start');
  const endIso = argVal('end');
  const outfile = argVal('outfile', 'eval_out/attempts.csv')!;
  if (!startIso || !endIso) {
    console.error('Missing --start or --end (ISO)');
    process.exit(1);
  }
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    console.error('Invalid ISO date(s)');
    process.exit(1);
  }
  const outdir = path.dirname(outfile);
  fs.mkdirSync(outdir, { recursive: true });

  // Build DataSource from env; mirror Nest config (entities glob)
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [path.join(__dirname, '../../**/*.entity{.ts,.js}')],
    ssl: process.env.DB_SSL_MODE === 'enable' ? { rejectUnauthorized: false } : undefined,
  } as any);
  await ds.initialize();

  const repo = ds.getRepository(Progress);
  const pageSize = 5000;
  let page = 0;
  let wroteHeader = false;
  const ws = fs.createWriteStream(outfile, { encoding: 'utf-8' });
  const header = 'user_id,session_id,item_id,kc_id,correct,timestamp,locale,course_id,difficulty\n';
  ws.write(header);

  const seenKey = new Set<string>();

  while (true) {
    const rows = await repo
      .createQueryBuilder('p')
      .leftJoin('p.mcq', 'm')
      .leftJoin('p.session', 's')
      .leftJoin('p.course', 'c')
      .leftJoin('p.user', 'u')
      .where('p.createdAt BETWEEN :start AND :end', { start, end })
      .andWhere('p.success_ratio IS NOT NULL')
      .orderBy('p.createdAt', 'ASC')
      .skip(page * pageSize)
      .take(pageSize)
      .select([
        'p.createdAt as ts',
        'p.success_ratio as sr',
        'u.id as userId',
        's.id as sessionId',
        'm.id as mcqId',
        'c.id as courseId',
        'm.difficulty as difficulty',
      ])
      .getRawMany();

    if (!rows.length) break;
    for (const r of rows) {
      const ts = new Date(r.ts).getTime();
      const key = `${r.userId}|${r.mcqId}|${Math.floor(ts / 1000)}`;
      if (seenKey.has(key)) continue; // de-dupe within same second
      seenKey.add(key);
      const correct = Number(r.sr >= 0.7); // use default threshold
      const line = [
        r.userId,
        r.sessionId ?? '',
        r.mcqId,
        '', // kc_id not modeled
        correct,
        new Date(r.ts).toISOString(),
        '', // locale not modeled
        r.courseId ?? '',
        r.difficulty ?? '',
      ]
        .map((v) => `${v}`.replaceAll('\n', ' ').replaceAll(',', ';'))
        .join(',');
      ws.write(line + '\n');
    }
    page++;
  }
  ws.end();
  await ds.destroy();
  console.log(`Wrote ${outfile}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

