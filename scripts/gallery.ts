// Renders every avatar kind into one SVG sheet for a quick visual check:
//   npx tsx scripts/gallery.ts out.svg && qlmanage -t -s 1600 -o . out.svg
import { writeFileSync } from 'node:fs';
import { avatarSvg, kindNames, Look } from '../src/avatars';

const extra: Look[] = [
  { kind: 'kid', hairStyle: 'long', hair: '#3B2A20', outfit: '#7CC8FF' },
  { kind: 'kid', hairStyle: 'curly', skin: '#8D5A3B', hair: '#2B1B14', outfit: '#FFD45C' },
  { kind: 'kid', hairStyle: 'bun', skin: '#E8B48A', acc: ['crown'], outfit: '#B47CE0' },
  { kind: 'kid', acc: ['helmet', 'cape'], outfit: '#7F8A96' },
  { kind: 'kid', acc: ['wizard'], hairStyle: 'spiky', hair: '#E8C35A', outfit: '#6C4CC4' },
  { kind: 'kid', acc: ['astronaut'], outfit: '#E9EEF5', skin: '#C68B5E' },
  { kind: 'kid', acc: ['wings', 'tiara'], hairStyle: 'braids', hair: '#E87A3A', outfit: '#8BE07A' },
  { kind: 'kid', acc: ['glasses', 'explorer'], outfit: '#C49A5A' },
];
const looks: Look[] = [...kindNames.map((kind) => ({ kind })), ...extra];
const cols = 8, cell = 160;
const cells = looks.map((l, i) => {
  const x = (i % cols) * cell, y = Math.floor(i / cols) * cell;
  const svg = avatarSvg(l, `a${i}`, 130).replace('<svg ', `<svg x="${x + 15}" y="${y + 5}" `);
  return `${svg}<text x="${x + cell / 2}" y="${y + 152}" font-size="13" text-anchor="middle" font-family="Helvetica">${l.kind}</text>`;
});
const W = cols * cell, H = Math.ceil(looks.length / cols) * cell;
writeFileSync(process.argv[2] ?? 'gallery.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#FFF4F8"/>${cells.join('')}</svg>`);
