// Characters and props drawn as simple shapes. Every "shaded" shape gets a radial gradient
// (light top-left, dark rim), which gives a soft clay/3D look. This file is pure data so the
// same drawings render in the app (AvatarView) and in the shared PDF (avatarSvg).
// All drawings use a 100×100 box with the feet/base near y=96.

export type Shape =
  | { t: 'e'; cx: number; cy: number; rx: number; ry: number; c: string; s?: boolean; r?: number; o?: number; k?: string; w?: number }
  | { t: 'p'; d: string; c: string; s?: boolean; o?: number; k?: string; w?: number; dash?: string };

export type HairStyle = 'short' | 'long' | 'bun' | 'curly' | 'spiky' | 'braids' | 'none';
export type Acc = 'crown' | 'wizard' | 'helmet' | 'astronaut' | 'glasses' | 'bow' | 'explorer' | 'wings' | 'cape' | 'tiara';

export type Look = {
  kind: Kind;
  color?: string; // main colour (fur, body, object)
  skin?: string;
  hair?: string;
  hairStyle?: HairStyle;
  outfit?: string;
  acc?: Acc[];
};

export function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v + amt * 255)));
  const r = c(n >> 16), g = c((n >> 8) & 255), b = c(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

const INK = '#2B2238';
const BLUSH = '#FF8FA8';
const CREAM = '#FFF4E6';

const ball = (cx: number, cy: number, rx: number, ry: number, c: string, r = 0): Shape => ({ t: 'e', cx, cy, rx, ry, c, s: true, r });
const flat = (cx: number, cy: number, rx: number, ry: number, c: string, r = 0, o?: number): Shape => ({ t: 'e', cx, cy, rx, ry, c, r, o });
const path = (d: string, c: string, s = true, o?: number): Shape => ({ t: 'p', d, c, s, o });
const line = (d: string, k: string, w: number, o?: number, dash?: string): Shape => ({ t: 'p', d, c: 'none', k, w, o, dash });

function eye(cx: number, cy: number, r: number): Shape[] {
  return [
    flat(cx, cy, r, r * 1.12, '#FFFFFF'),
    flat(cx + r * 0.08, cy + r * 0.14, r * 0.64, r * 0.72, INK),
    flat(cx + r * 0.32, cy - r * 0.16, r * 0.25, r * 0.25, '#FFFFFF'),
  ];
}
const eyes = (x: number, y: number, dx: number, r: number) => [...eye(x - dx, y, r), ...eye(x + dx, y, r)];
const blush = (x: number, y: number, dx: number) => [flat(x - dx, y, 4, 2.6, BLUSH, 0, 0.55), flat(x + dx, y, 4, 2.6, BLUSH, 0, 0.55)];
const smile = (x: number, y: number, w: number) => line(`M${x - w} ${y} Q${x} ${y + w} ${x + w} ${y}`, INK, 2.2);
const face = (x: number, y: number, dx: number, r: number, cheekDx = dx + 4.5) => [...eyes(x, y, dx, r), ...blush(x, y + 7, cheekDx), smile(x, y + 8.5, 3.2)];
const feet = (c: string, y = 93, dx = 8, rx = 6, ry = 4.5) => [ball(50 - dx, y, rx, ry, c), ball(50 + dx, y, rx, ry, c)];
const star = (cx: number, cy: number, R: number, r: number) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 ? r : R;
    return `${(cx + rad * Math.cos(a)).toFixed(1)} ${(cy + rad * Math.sin(a)).toFixed(1)}`;
  });
  return `M${pts.join(' L')} Z`;
};
const rrect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y} h${w - 2 * r} a${r} ${r} 0 0 1 ${r} ${r} v${h - 2 * r} a${r} ${r} 0 0 1 -${r} ${r} h-${w - 2 * r} a${r} ${r} 0 0 1 -${r} -${r} v-${h - 2 * r} a${r} ${r} 0 0 1 ${r} -${r} Z`;

// ---------- people ----------

function kid(l: Look): Shape[] {
  const skin = l.skin ?? '#F5C8A0';
  const hair = l.hair ?? '#5A3A2A';
  const out = l.outfit ?? '#FF6FA5';
  const style = l.hairStyle ?? 'short';
  const acc = l.acc ?? [];
  const has = (a: Acc) => acc.includes(a);
  const cap = path('M27 46 Q26 22 50 22 Q74 22 73 46 Q70 33 58 31 Q50 36 40 31 Q30 34 27 46 Z', hair);
  const s: Shape[] = [];

  if (has('wings')) s.push(ball(27, 64, 11, 16, '#CDEBFF', -28), ball(73, 64, 11, 16, '#CDEBFF', 28));
  if (has('cape')) s.push(path('M34 66 Q50 60 66 66 L76 96 Q50 100 24 96 Z', '#C0392B'));
  if (style === 'long' || style === 'braids') s.push(ball(50, 52, 25, 25, hair));
  s.push(...feet('#4A4060'));
  s.push(ball(32, 78, 5.5, 8.5, out, 25), ball(68, 78, 5.5, 8.5, out, -25));
  s.push(ball(50, 79, 17, 15, out));
  s.push(flat(50, 70, 7, 2.5, shade(out, -0.12)));
  s.push(ball(29, 85, 4, 4, skin), ball(71, 85, 4, 4, skin));
  s.push(ball(28.5, 48, 3.5, 5, skin), ball(71.5, 48, 3.5, 5, skin));
  s.push(ball(50, 46, 22, 20.5, skin));

  if (!has('helmet') && !has('astronaut')) {
    if (style === 'short' || style === 'long') s.push(cap);
    if (style === 'bun') s.push(cap, ball(50, 21, 9, 8, hair));
    if (style === 'braids') s.push(cap, ball(25, 64, 5, 10, hair), ball(75, 64, 5, 10, hair), flat(25, 74, 3, 2, '#FF6FA5'), flat(75, 74, 3, 2, '#FF6FA5'));
    if (style === 'curly') s.push(ball(31, 38, 8, 8, hair), ball(39, 28, 9, 8, hair), ball(50, 24, 10, 8, hair), ball(61, 28, 9, 8, hair), ball(69, 38, 8, 8, hair));
    if (style === 'spiky') s.push(path('M27 44 L29 25 L37 31 L41 17 L50 27 L58 16 L63 30 L71 23 L73 44 Q62 32 50 33 Q38 32 27 44 Z', hair));
  }
  s.push(...face(50, 48, 8, 4.3, 12.5));

  if (has('glasses')) s.push(line('M36.5 48 a5.5 5.5 0 1 0 11 0 a5.5 5.5 0 1 0 -11 0 M52.5 48 a5.5 5.5 0 1 0 11 0 a5.5 5.5 0 1 0 -11 0 M47.5 47 L52.5 47', INK, 1.6));
  if (has('crown')) s.push(path('M35 29 L37 13 L44 21 L50 9 L56 21 L63 13 L65 29 Z', '#FFC93C'), ball(50, 23, 2.4, 2.4, '#FF5C8A'));
  if (has('tiara')) s.push(path('M37 27 Q50 18 63 27 L58 28 L50 20 L42 28 Z', '#FFD45C'), ball(50, 21, 2, 2, '#7CC8FF'));
  if (has('bow')) s.push(ball(62, 25, 6, 4, '#FF5C8A', 30), ball(72, 30, 6, 4, '#FF5C8A', -40), ball(67, 27.5, 2.4, 2.4, '#E04F8A'));
  if (has('explorer')) s.push(ball(50, 26, 28, 5, '#C49A5A'), ball(50, 22, 16, 9, '#D9B06E'), flat(50, 26, 16, 2, '#8B5A3C'));
  if (has('wizard')) s.push(path('M28 31 Q50 37 72 31 L55 1 Q50 -1 46 3 Z', '#6C4CC4'), ball(50, 31, 27, 5, '#5A3DAE'), path(star(52, 18, 4, 1.8), '#FFD45C'));
  if (has('helmet')) s.push(ball(50, 36, 24, 17, '#B8C2CC'), path('M31 37 L69 37 L69 41 L31 41 Z', '#6F7B88', false), ball(50, 16, 4, 8, '#E74C3C'));
  if (has('astronaut')) s.push(ball(50, 26, 20, 5, '#E9EEF5'), { t: 'e', cx: 50, cy: 46, rx: 28, ry: 27, c: '#BFE6FF', o: 0.28, k: '#FFFFFF', w: 2.5 }, flat(38, 32, 6, 3, '#FFFFFF', -30, 0.7));
  return s;
}

// ---------- animals ----------

function fox(l: Look): Shape[] {
  const c = l.color ?? '#F0883A';
  return [
    ball(74, 80, 15, 8, c, -35), ball(84, 72, 6, 5, CREAM, -35),
    ...feet('#5A3426'),
    ball(50, 80, 15, 13.5, c), flat(50, 83, 8.5, 8, CREAM),
    path('M30 40 L27 15 L46 30 Z', c), path('M70 40 L73 15 L54 30 Z', c),
    path('M32 34 L30.5 21 L40 30 Z', '#5A3426', false), path('M68 34 L69.5 21 L60 30 Z', '#5A3426', false),
    ball(50, 47, 21, 18, c),
    path('M29 50 Q36 64 50 62 Q64 64 71 50 Q62 58 50 57 Q38 58 29 50 Z', CREAM, false),
    flat(50, 57, 8, 5.5, CREAM), ball(50, 53.5, 3, 2.2, INK),
    ...eyes(50, 45, 8, 3.8), smile(50, 58.5, 2.5),
  ];
}

function rabbit(l: Look): Shape[] {
  const c = l.color ?? '#F2EEF5';
  return [
    ball(41, 19, 5.5, 15, c, -8), ball(59, 19, 5.5, 15, c, 8),
    flat(41, 20, 2.8, 11, '#FFB6C8', -8), flat(59, 20, 2.8, 11, '#FFB6C8', 8),
    ball(67, 86, 5, 5, '#FFFFFF'),
    ...feet(c, 94, 8, 7, 4),
    ball(50, 80, 15, 14, c), flat(50, 83, 9, 9, '#FFFFFF'),
    ball(50, 48, 20, 18, c),
    flat(50, 56, 6.5, 4.2, '#FFFFFF'), ball(50, 53, 2.4, 1.8, '#FF8FA8'),
    path('M48.6 58.5 h2.8 v3 h-2.8 Z', '#FFFFFF', false),
    ...eyes(50, 46, 7.5, 3.8), ...blush(50, 53, 12), smile(50, 57.5, 2.2),
  ];
}

function bear(l: Look): Shape[] {
  const c = l.color ?? '#A0704C';
  const m = shade(c, 0.25);
  return [
    ball(31, 30, 7.5, 7.5, c), ball(69, 30, 7.5, 7.5, c), flat(31, 30, 4, 4, m), flat(69, 30, 4, 4, m),
    ...feet(shade(c, -0.1)),
    ball(32, 78, 6, 8.5, c, 25), ball(68, 78, 6, 8.5, c, -25),
    ball(50, 80, 16, 14.5, c), flat(50, 83, 9.5, 9, m),
    ball(50, 47, 22, 19, c),
    flat(50, 55, 9, 6.5, m), ball(50, 51.5, 3.6, 2.6, INK),
    ...eyes(50, 44, 9, 3.6), ...blush(50, 52, 14), smile(50, 57, 2.6),
  ];
}

function cat(l: Look): Shape[] {
  const c = l.color ?? '#F5A623';
  return [
    line('M64 88 Q86 86 80 66', c, 6),
    ...feet(c, 93, 8, 6, 4),
    ball(50, 80, 15, 13.5, c), flat(50, 83, 8, 8, CREAM),
    path('M31 39 L30 17 L46 30 Z', c), path('M69 39 L70 17 L54 30 Z', c),
    path('M33 33 L32.5 22 L41 30 Z', '#FFB6C8', false), path('M67 33 L67.5 22 L59 30 Z', '#FFB6C8', false),
    ball(50, 48, 21, 18, c),
    line('M44 30 L45 37 M50 29 L50 36 M56 30 L55 37', shade(c, -0.18), 2.2),
    flat(50, 55, 7, 4.6, CREAM), path('M47.5 52 L52.5 52 L50 55 Z', '#FF8FA8', false),
    line('M27 54 L38 55 M27 58.5 L38 57.5 M73 54 L62 55 M73 58.5 L62 57.5', INK, 1, 0.55),
    ...eyes(50, 46, 8, 3.8), smile(50, 57, 2.2),
  ];
}

function dog(l: Look): Shape[] {
  const c = l.color ?? '#D9A066';
  const ear = shade(c, -0.25);
  return [
    ball(70, 80, 4, 9, c, -40),
    ...feet(c),
    ball(50, 80, 15, 14, c), flat(50, 83, 8.5, 8.5, '#F5DEC0'),
    ball(50, 46, 21, 19, c), flat(60, 39, 6, 5, ear),
    ball(29, 48, 6, 12.5, ear, 15), ball(71, 48, 6, 12.5, ear, -15),
    flat(50, 55, 9, 6.5, '#F5DEC0'), ball(50, 51.5, 4, 3, INK),
    flat(50, 60.5, 2.6, 3, '#FF7B93'),
    ...eyes(50, 44, 8.5, 3.8), smile(50, 57.5, 2.8),
  ];
}

function owl(l: Look): Shape[] {
  const c = l.color ?? '#9C6B4A';
  return [
    path('M30 38 L27 20 L41 32 Z', c), path('M70 38 L73 20 L59 32 Z', c),
    ball(26, 66, 7, 16, shade(c, -0.12), 15), ball(74, 66, 7, 16, shade(c, -0.12), -15),
    ball(50, 62, 25, 31, c), flat(50, 72, 15, 17, '#E8D2B4'),
    line('M44 68 l3 3 l3 -3 M50 76 l3 3 l3 -3 M42 80 l3 3 l3 -3', shade(c, -0.1), 1.5),
    flat(39, 48, 10.5, 10.5, '#F3E6D3'), flat(61, 48, 10.5, 10.5, '#F3E6D3'),
    ...eye(39, 48, 6), ...eye(61, 48, 6),
    path('M46 55 L54 55 L50 63 Z', '#F2A33A'),
    flat(42, 94, 5, 2.5, '#F2A33A'), flat(58, 94, 5, 2.5, '#F2A33A'),
  ];
}

function penguin(l: Look): Shape[] {
  const c = l.color ?? '#2E3448';
  return [
    ball(42, 94, 6, 3, '#F7A23B'), ball(58, 94, 6, 3, '#F7A23B'),
    ball(28, 66, 5, 14, c, 20), ball(72, 66, 5, 14, c, -20),
    ball(50, 62, 22, 32, c), flat(50, 70, 15, 23, '#FFFFFF'),
    flat(43, 43, 7.5, 7.5, '#FFFFFF'), flat(57, 43, 7.5, 7.5, '#FFFFFF'),
    ...eyes(50, 43, 7, 3.4),
    path('M45 50 Q50 47 55 50 L50 56 Z', '#F7A23B'),
    ...blush(50, 52, 13),
  ];
}

function dragon(l: Look): Shape[] {
  const c = l.color ?? '#5DBB63';
  const belly = '#F6E27A';
  return [
    ball(75, 86, 14, 6, c, -20), path('M86 78 L95 74 L90 84 Z', shade(c, -0.15)),
    path('M34 66 Q12 48 16 72 Q23 67 30 74 Z', shade(c, -0.15)), path('M66 66 Q88 48 84 72 Q77 67 70 74 Z', shade(c, -0.15)),
    ...feet(c),
    ball(50, 79, 16, 15, c), flat(50, 82, 9, 11, belly),
    line('M44 77 h12 M44 82 h12 M45 87 h10', shade(belly, -0.15), 1.2),
    path('M36 32 L31 14 L43 28 Z', belly), path('M64 32 L69 14 L57 28 Z', belly),
    path('M46 27 L50 19 L54 27 Z', shade(c, -0.2), false),
    ball(50, 46, 22, 19, c),
    ball(50, 55, 12.5, 8, shade(c, 0.06)),
    flat(45.5, 53.5, 1.5, 1.1, INK), flat(54.5, 53.5, 1.5, 1.1, INK),
    ...eyes(50, 42, 9, 4), ...blush(50, 52, 15), smile(50, 58.5, 3.2),
  ];
}

function mouse(l: Look): Shape[] {
  const c = l.color ?? '#B8B4C6';
  return [
    line('M64 90 Q88 94 84 74', '#FFB6C8', 2.5),
    ball(30, 32, 11, 11, c), ball(70, 32, 11, 11, c), flat(30, 32, 7, 7, '#FFB6C8'), flat(70, 32, 7, 7, '#FFB6C8'),
    ...feet('#FFB6C8', 94, 7, 5, 3),
    ball(50, 80, 14, 13, c), flat(50, 83, 8, 8, '#EEEAF4'),
    ball(50, 51, 19, 17, c),
    ball(50, 59, 2.6, 2.1, '#FF8FA8'),
    line('M30 57 L41 58 M30 61 L41 60 M70 57 L59 58 M70 61 L59 60', INK, 1, 0.5),
    ...eyes(50, 48, 7, 3.4), smile(50, 62, 2.2),
  ];
}

function frog(l: Look): Shape[] {
  const c = l.color ?? '#6CC24A';
  return [
    ball(31, 92, 10, 4, c), ball(69, 92, 10, 4, c),
    ball(50, 78, 20, 16, c), flat(50, 82, 13, 10, '#D6F2B0'),
    ball(38, 39, 9, 9, c), ball(62, 39, 9, 9, c),
    ball(50, 53, 25, 16, c),
    ...eye(38, 38, 5.2), ...eye(62, 38, 5.2),
    line('M37 57 Q50 66 63 57', INK, 2.2), ...blush(50, 56, 17),
  ];
}

function turtle(l: Look): Shape[] {
  const skin = '#8FD07A';
  const shell = l.color ?? '#3E8E5A';
  return [
    ball(24, 74, 11, 10, skin),
    ball(32, 90, 6, 5, skin), ball(70, 90, 6, 5, skin), ball(86, 84, 5, 3, skin, -20),
    path('M28 86 Q28 52 56 52 Q84 52 84 86 Z', shell),
    flat(56, 64, 8, 6, shade(shell, 0.15)), flat(42, 75, 6.5, 5, shade(shell, 0.15)), flat(70, 75, 6.5, 5, shade(shell, 0.15)), flat(56, 79, 6, 4, shade(shell, 0.15)),
    ball(56, 86, 30, 4, '#E9D9A6'),
    ...eye(19, 71, 3.3), ...eye(28, 71, 3),
    line('M17 79 Q21 82 26 79', INK, 1.8), flat(20, 77, 2.6, 1.6, BLUSH, 0, 0.6),
  ];
}

function whale(l: Look): Shape[] {
  const c = l.color ?? '#4A90D9';
  return [
    path('M78 62 Q90 46 97 50 Q90 58 93 70 Q86 64 78 70 Z', c),
    ball(46, 66, 36, 22, c),
    path('M14 72 Q46 96 80 74 Q46 84 14 72 Z', '#CFE6FA', false),
    ball(48, 82, 7, 4, shade(c, -0.15), 25),
    ...eye(28, 62, 3.8),
    line('M16 72 Q24 78 34 74', INK, 2), flat(34, 70, 4, 2.4, BLUSH, 0, 0.55),
  ];
}

function octopus(l: Look): Shape[] {
  const c = l.color ?? '#B47CE0';
  return [
    ball(28, 86, 6, 11, c, 30), ball(41, 90, 6, 10, c, 12), ball(59, 90, 6, 10, c, -12), ball(72, 86, 6, 11, c, -30),
    ball(50, 52, 26, 29, c),
    flat(39, 36, 3.5, 3.5, shade(c, 0.2)), flat(61, 31, 4.5, 4.5, shade(c, 0.2)), flat(66, 46, 2.6, 2.6, shade(c, 0.2)),
    ...face(50, 58, 9, 4.6, 15),
  ];
}

function fish(l: Look): Shape[] {
  const c = l.color ?? '#FF9F43';
  return [
    path('M68 60 L92 44 L87 60 L92 76 Z', c),
    path('M38 44 Q50 28 64 44 Z', shade(c, -0.1)),
    ball(46, 60, 27, 19, c),
    line('M48 43 Q42 60 48 77', '#FFFFFF', 4, 0.9),
    ball(50, 72, 6, 3.5, shade(c, -0.1), 30),
    ...eye(30, 56, 4.6),
    flat(21, 64, 2.2, 1.7, INK), flat(32, 65, 3.5, 2.2, BLUSH, 0, 0.55),
  ];
}

function crab(l: Look): Shape[] {
  const c = l.color ?? '#F0524F';
  return [
    line('M33 77 L20 87 M35 81 L24 93 M67 77 L80 87 M65 81 L76 93', c, 3.5),
    line('M32 70 L22 62 M68 70 L78 62', c, 4),
    ball(18, 56, 9, 7.5, c, -25), ball(82, 56, 9, 7.5, c, 25),
    path('M11 52 L19 56 L12 60 Z', '#FFE3E0', false), path('M89 52 L81 56 L88 60 Z', '#FFE3E0', false),
    line('M43 64 L40 48 M57 64 L60 48', c, 3),
    ball(50, 74, 22, 14, c),
    ...eye(40, 46, 4.6), ...eye(60, 46, 4.6),
    smile(50, 76, 3.5), ...blush(50, 74, 13),
  ];
}

function unicorn(l: Look): Shape[] {
  const body = '#F8F4FF';
  return [
    ball(68, 84, 5, 11, '#B48CFF', -30),
    ...feet(body, 93, 8, 5, 5),
    ball(50, 80, 16, 13, body),
    path('M33 34 L34 18 L43 30 Z', body), path('M67 34 L66 18 L57 30 Z', body),
    ball(50, 48, 20, 18, body),
    path('M46 31 L50 7 L54 31 Z', '#FFD45C'), line('M47 25 L53 23 M48 18 L52 16', '#E8B53A', 1.4),
    ball(31, 40, 7, 8, '#FF9AC8'), ball(36, 30, 6, 6, '#B48CFF'), ball(67, 34, 7, 8, '#7CC8FF'), ball(70, 46, 6, 7, '#FF9AC8'),
    ball(50, 57, 10, 7, '#F0E6FB'),
    flat(46.5, 57, 1.3, 1, INK), flat(53.5, 57, 1.3, 1, INK),
    ...eyes(50, 46, 8, 3.8), ...blush(50, 53, 13),
  ];
}

function alien(l: Look): Shape[] {
  const c = l.color ?? '#8BE07A';
  return [
    line('M40 27 L33 10 M60 27 L67 10', c, 2.5), ball(33, 10, 3.5, 3.5, '#FFD45C'), ball(67, 10, 3.5, 3.5, '#FFD45C'),
    ...feet(shade(c, -0.15), 93, 7, 5, 4),
    ball(33, 80, 4.5, 7, c, 25), ball(67, 80, 4.5, 7, c, -25),
    ball(50, 82, 13, 12, c), flat(50, 84, 6, 6, shade(c, 0.2)),
    ball(50, 46, 25, 21, c),
    flat(40, 46, 6.5, 8.5, INK, -10), flat(60, 46, 6.5, 8.5, INK, 10),
    flat(42, 42, 2.3, 2.3, '#FFFFFF'), flat(62, 42, 2.3, 2.3, '#FFFFFF'),
    smile(50, 57, 3.5), ...blush(50, 55, 16),
  ];
}

function robot(l: Look): Shape[] {
  const c = l.color ?? '#B8C4D6';
  return [
    line('M50 24 L50 12', INK, 2), ball(50, 10, 4, 4, '#FF5C5C'),
    ...feet('#7F8A9C', 94, 8, 6, 4),
    ball(23, 76, 5, 9, c, 15), ball(77, 76, 5, 9, c, -15),
    path(rrect(28, 64, 44, 28, 7), c), ball(50, 76, 3.2, 3.2, '#FFD45C'),
    ball(18, 42, 4, 7, shade(c, -0.1)), ball(82, 42, 4, 7, shade(c, -0.1)),
    path(rrect(20, 24, 60, 38, 10), c),
    path(rrect(27, 31, 46, 24, 7), '#2B3A55', false),
    ball(39, 41, 4.2, 4.6, '#7CF2FF'), ball(61, 41, 4.2, 4.6, '#7CF2FF'),
    line('M44 48 Q50 52 56 48', '#7CF2FF', 2),
  ];
}

function sheep(l: Look): Shape[] {
  const wool = l.color ?? '#F7F5F0';
  const f = '#4A4060';
  return [
    ball(40, 93, 4, 5, f), ball(60, 93, 4, 5, f),
    ball(33, 74, 12, 11, wool), ball(67, 74, 12, 11, wool), ball(50, 67, 15, 12, wool), ball(41, 83, 12, 9, wool), ball(59, 83, 12, 9, wool),
    ball(35, 47, 7, 3.5, f, 20), ball(65, 47, 7, 3.5, f, -20),
    ball(50, 48, 13, 15, f),
    ball(50, 34, 11, 7, wool), ball(42, 36, 6, 5, wool), ball(58, 36, 6, 5, wool),
    ...eye(45, 48, 3.3), ...eye(55, 48, 3.3),
    flat(43, 55, 2.6, 1.6, BLUSH, 0, 0.6), flat(57, 55, 2.6, 1.6, BLUSH, 0, 0.6), line('M47.5 57 Q50 59 52.5 57', '#FFFFFF', 1.5),
  ];
}

function goat(l: Look): Shape[] {
  const c = l.color ?? '#E8D8C0';
  return [
    ...feet(shade(c, -0.3), 93, 8, 4, 5),
    ball(50, 79, 16, 13, c),
    line('M38 32 Q30 20 22 26 M62 32 Q70 20 78 26', '#8A7560', 4),
    ball(30, 46, 7, 3.5, c, 25), ball(70, 46, 7, 3.5, c, -25),
    ball(50, 47, 17, 19, c),
    path('M45 62 L50 74 L55 62 Z', shade(c, -0.1)),
    flat(50, 58, 7, 5, shade(c, 0.08)), flat(47.5, 57, 1.3, 1, INK), flat(52.5, 57, 1.3, 1, INK),
    ...eyes(50, 45, 7, 3.4), ...blush(50, 52, 12),
  ];
}

function bird(l: Look): Shape[] {
  const c = l.color ?? '#5AB0F0';
  return [
    line('M44 86 L42 95 M56 86 L58 95', '#F2A33A', 2),
    path('M66 66 L84 58 L80 72 Z', shade(c, -0.12)),
    ball(50, 64, 19, 20, c), flat(48, 72, 11, 10, '#EAF6FF'),
    ball(62, 66, 8, 12, shade(c, -0.12), -25),
    ball(46, 46, 15, 14, c),
    path('M30 47 L36 44 L36 50 Z', '#F2A33A'),
    ...eye(42, 44, 3.6), flat(40, 51, 3, 2, BLUSH, 0, 0.6),
  ];
}

function butterfly(l: Look): Shape[] {
  const c = l.color ?? '#FF9AC8';
  const c2 = shade(c, -0.08);
  return [
    ball(32, 42, 17, 14, c, -20), ball(68, 42, 17, 14, c, 20), ball(36, 66, 11, 10, c2, 20), ball(64, 66, 11, 10, c2, -20),
    flat(30, 40, 5, 5, '#FFFFFF', 0, 0.6), flat(70, 40, 5, 5, '#FFFFFF', 0, 0.6),
    ball(50, 56, 4.5, 20, '#4A4060'),
    line('M48 37 Q44 26 40 24 M52 37 Q56 26 60 24', '#4A4060', 1.5),
    ...eyes(50, 40, 2.4, 1.8),
  ];
}

function jellyfish(l: Look): Shape[] {
  const c = l.color ?? '#FFA8D8';
  return [
    line('M36 60 Q32 72 37 82 Q41 90 36 96 M46 62 Q43 74 47 84 M54 62 Q57 74 53 84 M64 60 Q68 72 63 82 Q59 90 64 96', c, 3, 0.85),
    flat(50, 50, 30, 30, c, 0, 0.18),
    path('M24 60 Q24 28 50 28 Q76 28 76 60 Q70 56 63 60 Q57 56 50 60 Q43 56 37 60 Q30 56 24 60 Z', c),
    ...face(50, 46, 8, 3.8, 13),
  ];
}

// ---------- props ----------

function tree(l: Look): Shape[] {
  const c = l.color ?? '#5DBB63';
  return [
    path('M44 96 L46 58 L54 58 L56 96 Z', '#8B5A3C'),
    ball(33, 52, 15, 13, shade(c, -0.08)), ball(67, 52, 15, 13, shade(c, -0.08)),
    ball(50, 38, 23, 21, c), ball(50, 22, 14, 11, shade(c, 0.05)),
  ];
}
function pine(l: Look): Shape[] {
  const c = l.color ?? '#2F7A55';
  return [path('M46 96 L46 82 L54 82 L54 96 Z', '#8B5A3C'), path('M50 34 L80 84 L20 84 Z', c), path('M50 18 L74 60 L26 60 Z', shade(c, 0.06)), path('M50 4 L67 36 L33 36 Z', shade(c, 0.12))];
}
function bush(l: Look): Shape[] {
  const c = l.color ?? '#5DBB63';
  return [ball(30, 80, 16, 14, shade(c, -0.06)), ball(70, 80, 16, 14, shade(c, -0.06)), ball(50, 72, 22, 20, c), flat(40, 70, 2.5, 2.5, '#FF5C8A'), flat(60, 78, 2.5, 2.5, '#FF5C8A')];
}
function flower(l: Look): Shape[] {
  const c = l.color ?? '#FF8FB8';
  const petals = Array.from({ length: 6 }, (_, i) => {
    const a = (i * Math.PI) / 3;
    return ball(50 + 11 * Math.cos(a), 46 + 11 * Math.sin(a), 8, 8, c);
  });
  return [line('M50 96 Q47 76 50 56', '#4FA83A', 3.5), ball(42, 80, 8, 3.5, '#5DBB63', -30), ball(58, 74, 8, 3.5, '#5DBB63', 30), ...petals, ball(50, 46, 7, 7, '#FFD45C')];
}
function mushroom(l: Look): Shape[] {
  const c = l.color ?? '#E2574C';
  return [ball(50, 82, 11, 14, CREAM), path('M18 66 Q18 30 50 30 Q82 30 82 66 Q50 72 18 66 Z', c), flat(36, 46, 5, 4, '#FFFFFF'), flat(58, 40, 6, 5, '#FFFFFF'), flat(68, 56, 4, 3.5, '#FFFFFF'), flat(46, 60, 3.5, 3, '#FFFFFF')];
}
function rock(l: Look): Shape[] {
  const c = l.color ?? '#9A9AA8';
  return [path('M14 94 Q10 70 30 60 Q44 46 64 54 Q88 58 88 80 Q90 96 70 95 Z', c), line('M48 60 L52 70 L46 78', shade(c, -0.2), 1.5)];
}
function mountain(l: Look): Shape[] {
  const c = l.color ?? '#8C9DB5';
  return [path('M4 96 L50 12 L96 96 Z', c), path('M37 36 L50 12 L63 36 Q57 31 50 38 Q43 31 37 36 Z', '#FFFFFF', false)];
}
function cloud(l: Look): Shape[] {
  const c = l.color ?? '#FFFFFF';
  return [ball(50, 68, 34, 13, c), ball(32, 60, 16, 13, c), ball(52, 50, 21, 18, c), ball(70, 60, 15, 12, c)];
}
function storm(): Shape[] {
  return [path('M48 64 L40 82 L50 80 L44 98 L62 74 L52 76 L58 64 Z', '#FFD45C'), ...cloud({ kind: 'cloud', color: '#7D869C' })];
}
function castle(l: Look): Shape[] {
  const c = l.color ?? '#E9D8F5';
  const roof = '#B47CE0';
  return [
    path('M22 50 h56 v46 h-56 Z', c),
    path('M10 34 h20 v62 h-20 Z', shade(c, -0.04)), path('M70 34 h20 v62 h-20 Z', shade(c, -0.04)), path('M40 26 h20 v30 h-20 Z', shade(c, 0.03)),
    path('M7 35 L20 8 L33 35 Z', roof), path('M67 35 L80 8 L93 35 Z', roof), path('M37 27 L50 2 L63 27 Z', roof),
    path('M20 8 L20 1 L27 4 Z', '#FF5C8A', false), path('M80 8 L80 1 L87 4 Z', '#FF5C8A', false),
    path('M41 96 V80 a9 9 0 0 1 18 0 V96 Z', '#8B5A3C'),
    path(rrect(16, 48, 8, 11, 4), '#5A4A7A', false), path(rrect(76, 48, 8, 11, 4), '#5A4A7A', false), path(rrect(46, 36, 8, 11, 4), '#5A4A7A', false),
  ];
}
function house(l: Look): Shape[] {
  const c = l.color ?? '#FFE3B3';
  return [
    path('M64 40 h8 v16 h-8 Z', '#B85C4A'),
    path('M22 54 h56 v42 h-56 Z', c), path('M14 57 L50 24 L86 57 Z', '#E2574C'),
    path('M43 96 V80 a7 7 0 0 1 14 0 V96 Z', '#8B5A3C'),
    path(rrect(27, 64, 12, 11, 2), '#FFE07A', false), path(rrect(61, 64, 12, 11, 2), '#FFE07A', false),
    line('M33 64 V75 M27 69.5 H39 M67 64 V75 M61 69.5 H73', '#8B5A3C', 1.4),
  ];
}
function rocket(): Shape[] {
  return [
    ball(50, 92, 6, 8, '#FFB347'), flat(50, 90, 3, 5, '#FFE07A'),
    path('M35 68 L22 90 L39 84 Z', '#E2574C'), path('M65 68 L78 90 L61 84 Z', '#E2574C'),
    ball(50, 54, 16, 34, '#F4F6FA'),
    path('M36.5 34 Q50 4 63.5 34 Q50 29 36.5 34 Z', '#E2574C'),
    ball(50, 50, 7.5, 7.5, '#7CC8FF'), { t: 'e', cx: 50, cy: 50, rx: 8.5, ry: 8.5, c: 'none', k: '#B8C2CC', w: 2.5 },
  ];
}
function starKind(l: Look): Shape[] {
  return [path(star(50, 54, 42, 19), l.color ?? '#FFD45C'), ...face(50, 56, 7, 3.2, 11)];
}
function moon(l: Look): Shape[] {
  const c = l.color ?? '#FFF1A8';
  return [flat(50, 50, 46, 46, c, 0, 0.25), ball(50, 50, 38, 38, c), flat(33, 34, 6, 5, shade(c, -0.06)), flat(68, 66, 8, 6, shade(c, -0.06)), flat(70, 32, 4, 3, shade(c, -0.06)), ...face(50, 50, 11, 4.4, 17)];
}
function planet(l: Look): Shape[] {
  const c = l.color ?? '#FFB86B';
  return [ball(50, 52, 28, 28, c), flat(40, 44, 6, 3, shade(c, 0.15), -15), { t: 'e', cx: 50, cy: 54, rx: 44, ry: 9, c: 'none', k: '#FFE1BD', w: 4, r: -15 }];
}
function chest(): Shape[] {
  return [
    flat(50, 52, 34, 22, '#FFE07A', 0, 0.35),
    path('M20 62 h60 v32 h-60 Z', '#A0683C'),
    path('M18 64 Q18 42 50 42 Q82 42 82 64 Z', '#B87A47'),
    path('M30 43 h6 v51 h-6 Z M64 43 h6 v51 h-6 Z', '#FFC93C', false),
    ball(50, 66, 5, 6, '#FFC93C'), flat(50, 67, 1.5, 2.5, INK),
  ];
}
function map(): Shape[] {
  return [
    path('M14 30 L84 24 L88 80 L18 86 Z', '#F3E3BE'),
    line('M26 72 Q38 50 52 60 T74 38', '#C0392B', 2.2, 1, '4 3'),
    line('M70 30 L80 40 M80 30 L70 40', '#C0392B', 3.2),
    flat(30, 40, 6, 4, '#9CCB7A'), flat(58, 74, 8, 4, '#7CC8FF'),
  ];
}
function boat(): Shape[] {
  return [line('M50 72 V18', '#6B4A2E', 3), path('M52 20 L52 66 L82 64 Z', '#FFFFFF'), path('M48 26 L48 64 L26 62 Z', '#FFB6C8'), path('M10 70 L90 70 L76 92 L24 92 Z', '#A0683C'), line('M18 78 H82', '#8B5A3C', 1.5)];
}
function shell(): Shape[] {
  return [path('M18 82 Q50 26 82 82 Q50 92 18 82 Z', '#FFC9D9'), line('M50 40 V86 M36 48 L42 85 M64 48 L58 85 M26 64 L34 84 M74 64 L66 84', '#F59BB6', 1.4), flat(50, 70, 15, 15, '#FFFFFF', 0, 0.35), ball(50, 72, 9, 9, '#F4F1FF')];
}
function pearl(): Shape[] {
  return [flat(50, 56, 34, 34, '#FFFFFF', 0, 0.3), ball(50, 56, 22, 22, '#F4F1FF'), flat(42, 46, 6, 4, '#FFFFFF', -30)];
}
function lantern(l: Look): Shape[] {
  const c = l.color ?? '#FFD45C';
  return [flat(50, 60, 36, 36, c, 0, 0.25), line('M50 20 V10 M42 10 H58', INK, 2), path('M38 22 h24 v6 h-24 Z', '#6B4A2E'), ball(50, 58, 15, 26, c), line('M40 40 V78 M60 40 V78', '#6B4A2E', 1.6), path('M38 86 h24 v6 h-24 Z', '#6B4A2E')];
}
function jar(): Shape[] {
  return [
    flat(50, 60, 38, 38, '#FFF2A0', 0, 0.35),
    path(rrect(26, 32, 48, 62, 12), '#CFEFFF'),
    path('M30 24 h40 v10 h-40 Z', '#8B5A3C'),
    flat(40, 52, 3, 3, '#FFE860'), flat(58, 46, 3, 3, '#FFE860'), flat(52, 66, 3, 3, '#FFE860'), flat(38, 76, 3, 3, '#FFE860'), flat(62, 78, 3, 3, '#FFE860'),
    flat(34, 46, 3, 10, '#FFFFFF', 0, 0.6),
  ];
}
function book(l: Look): Shape[] {
  const c = l.color ?? '#E2574C';
  return [path('M10 72 Q30 62 50 70 Q70 62 90 72 L90 90 Q70 82 50 90 Q30 82 10 90 Z', c), path('M14 68 Q32 58 50 66 Q68 58 86 68 L86 84 Q68 76 50 84 Q32 76 14 84 Z', '#FFFFFF'), line('M50 66 V84 M22 68 Q32 64 42 68 M22 73 Q32 69 42 73 M58 68 Q68 64 78 68 M58 73 Q68 69 78 73', '#B8B0C8', 1.2)];
}
function bed(): Shape[] {
  return [path('M10 60 h8 v36 h-8 Z M82 70 h8 v26 h-8 Z', '#A0683C'), path('M14 70 h74 v18 h-74 Z', '#C9A27A'), ball(28, 66, 12, 7, '#FFFFFF'), path('M36 62 Q62 56 88 64 L88 80 L36 80 Z', '#7CC8FF')];
}
function crystal(l: Look): Shape[] {
  const c = l.color ?? '#7FE3F0';
  return [flat(50, 54, 34, 40, c, 0, 0.25), path('M50 8 L70 40 L50 94 L30 40 Z', c), line('M30 40 H70 M50 8 L44 40 L50 94 M50 8 L56 40', '#FFFFFF', 1.2, 0.6)];
}
function blocks(): Shape[] {
  return [path(rrect(18, 70, 26, 26, 4), '#FF6FA5'), path(rrect(52, 70, 26, 26, 4), '#7CC8FF'), path(rrect(34, 44, 26, 26, 4), '#FFD45C'), path(rrect(40, 18, 24, 26, 4), '#8BE07A')];
}
function balloon(l: Look): Shape[] {
  const c = l.color ?? '#FF5C8A';
  return [line('M50 58 Q46 76 52 96', INK, 1.2), path('M47 58 L53 58 L50 54 Z', shade(c, -0.15)), ball(50, 34, 19, 23, c), flat(43, 24, 4, 7, '#FFFFFF', -20, 0.5)];
}
function kite(l: Look): Shape[] {
  const c = l.color ?? '#FF6FA5';
  return [line('M50 70 Q40 82 48 96', INK, 1.2), path('M50 8 L74 36 L50 70 L26 36 Z', c), path('M50 8 L74 36 L50 36 Z', '#FFD45C', false), path('M26 36 L50 36 L50 70 Z', '#7CC8FF', false), flat(44, 82, 3, 2, '#FF5C8A', 30), flat(46, 90, 3, 2, '#FFD45C', -30)];
}
function note(): Shape[] {
  return [line('M40 76 V30 L70 22 V68', INK, 3), ball(34, 78, 8, 6, '#B47CE0', -20), ball(64, 70, 8, 6, '#B47CE0', -20)];
}
function heart(l: Look): Shape[] {
  return [path('M50 88 Q14 62 18 38 Q22 18 40 22 Q48 24 50 34 Q52 24 60 22 Q78 18 82 38 Q86 62 50 88 Z', l.color ?? '#FF5C8A')];
}
function sparkle(l: Look): Shape[] {
  return [path('M50 10 Q54 46 90 50 Q54 54 50 90 Q46 54 10 50 Q46 46 50 10 Z', l.color ?? '#FFE07A')];
}
function snowman(): Shape[] {
  return [ball(50, 78, 22, 19, '#FFFFFF'), ball(50, 46, 16, 15, '#FFFFFF'), path('M50 49 L66 52 L50 53 Z', '#F7A23B'), ...eyes(50, 43, 6, 2.8), path('M34 58 h32 v6 h-32 Z', '#E2574C'), flat(50, 74, 2, 2, INK), flat(50, 84, 2, 2, INK), path('M36 32 h28 v4 h-28 Z M40 14 h20 v20 h-20 Z', '#3A3350')];
}
function cactus(): Shape[] {
  const c = '#5DAA5A';
  return [path(rrect(40, 18, 20, 78, 10), c), path(rrect(18, 40, 12, 30, 6), c), path('M24 64 h18 v8 h-18 Z', c, false), path(rrect(70, 30, 12, 28, 6), c), path('M58 52 h18 v8 h-18 Z', c, false), ball(50, 18, 5, 4, '#FF8FB8')];
}
function pyramid(): Shape[] {
  return [path('M6 96 L50 18 L94 96 Z', '#E8B96A'), path('M50 18 L94 96 L60 96 Z', '#C9964C', false)];
}
function cone(): Shape[] {
  return [path('M18 92 h64 v6 h-64 Z', '#E2574C'), path('M30 92 L46 10 L54 10 L70 92 Z', '#FF8A3D'), path('M38 58 h24 l2 10 h-28 Z M42 34 h16 l2 9 h-20 Z', '#FFFFFF', false)];
}
function wand(): Shape[] {
  return [line('M30 92 L58 40', '#6B4A2E', 4), path(star(62, 32, 18, 8), '#FFD45C'), flat(62, 32, 26, 26, '#FFF3B0', 0, 0.3)];
}
function sword(): Shape[] {
  return [path('M47 14 L53 14 L53 70 L50 76 L47 70 Z', '#D8DEE6'), path('M36 70 h28 v6 h-28 Z', '#FFC93C'), path('M47 76 h6 v14 h-6 Z', '#8B5A3C'), ball(50, 92, 4, 4, '#FFC93C')];
}
function egg(l: Look): Shape[] {
  const c = l.color ?? '#F7F1E3';
  return [ball(50, 62, 24, 30, c), flat(40, 50, 3, 3, '#D9C9A6'), flat(58, 66, 4, 3, '#D9C9A6'), flat(48, 78, 2.5, 2.5, '#D9C9A6')];
}
function bridge(): Shape[] {
  return [path('M4 66 Q50 30 96 66 L96 76 Q50 42 4 76 Z', '#A0683C'), line('M14 60 V36 M32 48 V26 M50 42 V20 M68 48 V26 M86 60 V36 M14 36 Q50 6 86 36', '#6B4A2E', 2)];
}
function compass(): Shape[] {
  return [ball(50, 56, 32, 32, '#FFC93C'), flat(50, 56, 26, 26, '#FFF6DA'), path('M50 34 L56 56 L50 78 L44 56 Z', '#E2574C', false), path('M50 56 L56 56 L50 78 L44 56 Z', '#4A4060', false), ball(50, 56, 3, 3, INK), ball(50, 22, 5, 4, '#FFC93C')];
}
function cake(): Shape[] {
  return [path(rrect(18, 56, 64, 38, 8), '#FFD6E4'), path('M18 64 Q26 72 34 64 Q42 72 50 64 Q58 72 66 64 Q74 72 82 64 V60 H18 Z', '#FFFFFF', false), line('M50 56 V38', '#7CC8FF', 4), ball(50, 34, 3, 5, '#FFB347'), flat(32, 80, 3, 3, '#FF5C8A'), flat(68, 80, 3, 3, '#FF5C8A')];
}
function tent(): Shape[] {
  return [path('M8 94 L50 18 L92 94 Z', '#FF8A3D'), path('M50 18 L66 94 L34 94 Z', '#C85A20', false), line('M50 18 V8', INK, 2), path('M50 8 L60 11 L50 14 Z', '#7CC8FF', false)];
}
function sock(l: Look): Shape[] {
  const c = l.color ?? '#FF6FA5';
  return [path('M38 12 h24 v46 Q62 70 74 74 Q86 80 80 92 Q74 98 60 92 L42 84 Q36 80 38 70 Z', c), path('M38 12 h24 v10 h-24 Z', '#FFFFFF', false), line('M38 34 h24 M38 46 h24', '#FFFFFF', 3, 0.8)];
}
function comet(): Shape[] {
  return [path('M60 46 Q30 40 6 18 Q34 56 58 62 Z', '#FFE9A8', true, 0.8), path(star(66, 56, 24, 11), '#FFD45C'), ...eyes(66, 57, 5, 2.4)];
}
function shipwreck(): Shape[] {
  return [path('M8 76 L84 60 L76 88 L18 94 Z', '#7A5636'), line('M44 70 L36 24', '#5A3E26', 3), path('M38 28 L60 34 L46 56 Z', '#D9D2C2', true, 0.8), flat(60, 76, 5, 4, '#3E2A18')];
}
function seaweed(): Shape[] {
  return [line('M40 96 Q30 76 40 58 Q50 40 40 22', '#3FA36B', 6), line('M60 96 Q70 80 60 64 Q52 50 62 36', '#56BE80', 5)];
}

const kinds = {
  kid, fox, rabbit, bear, cat, dog, owl, penguin, dragon, mouse, frog, turtle, whale, octopus, fish, crab, unicorn, alien, robot, sheep, goat, bird, butterfly, jellyfish,
  tree, pine, bush, flower, mushroom, rock, mountain, cloud, storm, castle, house, rocket, star: starKind, moon, planet, chest, map, boat, shell, pearl, lantern, jar, book, bed,
  crystal, blocks, balloon, kite, note, heart, sparkle, snowman, cactus, pyramid, cone, wand, sword, egg, bridge, compass, cake, tent, sock, comet, shipwreck, seaweed,
} satisfies Record<string, (l: Look) => Shape[]>;

export type Kind = keyof typeof kinds;
export const kindNames = Object.keys(kinds) as Kind[];
export const isKind = (k: string): k is Kind => k in kinds;

export function draw(look: Look): Shape[] {
  return kinds[look.kind]?.(look) ?? [];
}

// Colours that need a shading gradient, in first-use order.
export function shadedColors(shapes: Shape[]) {
  const out: string[] = [];
  for (const s of shapes) if (s.s && s.c !== 'none' && !out.includes(s.c)) out.push(s.c);
  return out;
}

export const gradientStops = (c: string) => [
  { offset: '0', color: shade(c, 0.24) },
  { offset: '0.55', color: c },
  { offset: '1', color: shade(c, -0.24) },
];

// SVG markup for the PDF export. `id` keeps gradient ids unique within one HTML page.
export function avatarSvg(look: Look, id: string, size: number, flip = false) {
  const shapes = draw(look);
  const cols = shadedColors(shapes);
  const defs = cols
    .map((c, i) => `<radialGradient id="${id}g${i}" cx="35%" cy="30%" r="75%">${gradientStops(c).map((s) => `<stop offset="${s.offset}" stop-color="${s.color}"/>`).join('')}</radialGradient>`)
    .join('');
  const fill = (s: Shape) => (s.c === 'none' ? 'none' : s.s ? `url(#${id}g${cols.indexOf(s.c)})` : s.c);
  const common = (s: Shape) =>
    `fill="${fill(s)}"${s.o !== undefined ? ` opacity="${s.o}"` : ''}${s.k ? ` stroke="${s.k}" stroke-width="${s.w ?? 1}" stroke-linecap="round" stroke-linejoin="round"` : ''}`;
  const body = shapes
    .map((s) =>
      s.t === 'e'
        ? `<ellipse cx="${s.cx}" cy="${s.cy}" rx="${s.rx}" ry="${s.ry}" ${common(s)}${s.r ? ` transform="rotate(${s.r} ${s.cx} ${s.cy})"` : ''}/>`
        : `<path d="${s.d}" ${common(s)}${s.dash ? ` stroke-dasharray="${s.dash}"` : ''}/>`,
    )
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100"${flip ? ' style="transform:scaleX(-1)"' : ''}><defs>${defs}</defs>${body}</svg>`;
}
