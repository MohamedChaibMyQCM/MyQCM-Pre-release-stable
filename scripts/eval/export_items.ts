/*
 Export MCQ items to CSV.
 Columns: item_id, kc_id, course_id, difficulty, type
 Usage:
   node -r ts-node/register -r tsconfig-paths/register scripts/eval/export_items.ts --outfile eval_out/items.csv
*/
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Mcq } from 'src/mcq/entities/mcq.entity';

function argVal(name: string, def?: string) {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  return def;
}

async function main() {
  const outfile = argVal('outfile', 'eval_out/items.csv')!;
  const outdir = path.dirname(outfile);
  fs.mkdirSync(outdir, { recursive: true });

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

  const repo = ds.getRepository(Mcq);
  const pageSize = 5000;
  let page = 0;
  const ws = fs.createWriteStream(outfile, { encoding: 'utf-8' });
  ws.write('item_id,kc_id,course_id,difficulty,type\n');
  while (true) {
    const rows = await repo
      .createQueryBuilder('m')
      .leftJoin('m.course', 'c')
      .orderBy('m.createdAt', 'ASC')
      .skip(page * pageSize)
      .take(pageSize)
      .select([
        'm.id as mcqId',
        'c.id as courseId',
        'm.difficulty as difficulty',
        'm.type as type',
      ])
      .getRawMany();
    if (!rows.length) break;
    for (const r of rows) {
      const line = [r.mcqId, '', r.courseId ?? '', r.difficulty ?? '', r.type ?? '']
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

