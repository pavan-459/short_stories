// Compiles every built-in story and the big story, failing on any bad scene or prompt:
//   npx tsx scripts/check-content.ts
import { genres, stories } from '../src/content/library';
import { sagas } from '../src/content/sagas';

let words = 0;
for (const g of genres) {
  const list = stories.filter((s) => s.genre === g.id);
  const pages = list.map((s) => s.pages.length);
  console.log(`${g.name.padEnd(12)} ${list.length} stories, pages: ${pages.join(', ')}`);
  for (const s of list) {
    if (s.pages.length < 15) console.warn(`  ! ${s.id} has only ${s.pages.length} pages`);
    for (const p of s.pages) words += p.text.split(/\s+/).length;
  }
}
for (const sg of sagas) console.log(`Saga ${sg.id}: ${sg.chapters.length} chapters`);
console.log(`Total: ${stories.length} stories, ${stories.reduce((n, s) => n + s.pages.length, 0)} pages, ~${words} words`);
for (const sg of sagas) for (const ch of sg.chapters) console.log(`  ${ch.title}: ${Object.entries(ch.tellings).map(([k, v]) => `${k} ${v.length}`).join(', ')}`);
