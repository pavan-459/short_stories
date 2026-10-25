import { Acc, HairStyle, isKind, Look } from '../avatars';
import type { Actor, Backdrop, Fx, Scene } from '../Scene';

// Compact notation for writing hundreds of story pages.
//
// Scene:   "forest | fern@.3 hop, bun@.7 flip, tree@.5 d.6 s1.5 none | motion sparkles"
//          backdrop | actors | flags
// Actor:   name@x[->to] [dN depth 0-1] [sN size] [anim] [flip]
//          name is a cast id from the story, or any avatar kind (optionally kind#hexcolour).
// Prompt:  "find:chest Can you find the treasure chest?"
//          "predict: What do you think is inside?"
//          "imagine: Where would your map lead?"
//          "think: Why did Fern feel sad? | She was hungry | *She hurt her friend >> Feelings tell us..."
//          (* marks the right answer; text after >> is said after answering)

export type CastMember = { name: string; about: string; look: Look };
export type Cast = Record<string, CastMember>;

export type Prompt =
  | { kind: 'think'; q: string; choices: string[]; answer: number; why: string }
  | { kind: 'predict' | 'imagine'; q: string }
  | { kind: 'find'; q: string; target: string };

export type PageSrc = [text: string, scene: string, prompt?: string];

export type StorySrc<G extends string = string> = {
  id: string;
  genre: G;
  title: string;
  blurb: string;
  cast: Cast;
  pages: PageSrc[];
};

export type Page = { text: string; scene: Scene; prompt?: Prompt };

export const skins = { light: '#F5C8A0', fair: '#E8B48A', tan: '#C68B5E', brown: '#8D5A3B', deep: '#6B4430' };

export function person(hairStyle: HairStyle, hair: string, outfit: string, skin = skins.light, acc?: Acc[]): Look {
  return { kind: 'kid', hairStyle, hair, outfit, skin, acc };
}

const BACKDROPS = ['meadow', 'forest', 'ocean', 'space', 'castle', 'night', 'snow', 'desert'];
const FX = ['stars', 'snow', 'bubbles', 'sparkles'];
const ANIMS = ['bob', 'hop', 'spin', 'float', 'walk', 'none'];

export function parseScene(src: string, cast: Cast, where = ''): Scene {
  const [bgPart, actorPart = '', flagPart = ''] = src.split('|').map((p) => p.trim());
  if (!BACKDROPS.includes(bgPart)) throw new Error(`${where}: unknown backdrop "${bgPart}"`);
  const flags = flagPart.split(/\s+/).filter(Boolean);
  for (const f of flags) if (f !== 'motion' && !FX.includes(f)) throw new Error(`${where}: unknown flag "${f}"`);

  const actors: Actor[] = actorPart
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .map((tok) => {
      const [head, ...mods] = tok.split(/\s+/);
      const m = head.match(/^([a-zA-Z]+)(?:#([0-9A-Fa-f]{6}))?@(-?[\d.]+)(?:->(-?[\d.]+))?$/);
      if (!m) throw new Error(`${where}: bad actor "${tok}"`);
      const [, name, hex, x, to] = m;
      let look: Look;
      if (cast[name]) look = hex ? { ...cast[name].look, color: `#${hex}` } : cast[name].look;
      else if (isKind(name)) look = { kind: name, color: hex ? `#${hex}` : undefined };
      else throw new Error(`${where}: unknown actor "${name}"`);
      const a: Actor = { look, name, x: Number(x) };
      if (to !== undefined) a.to = Number(to);
      for (const mod of mods) {
        if (mod === 'flip') a.flip = true;
        else if (ANIMS.includes(mod)) a.anim = mod as Actor['anim'];
        else if (/^d[\d.]+$/.test(mod)) a.depth = Number(mod.slice(1));
        else if (/^s[\d.]+$/.test(mod)) a.size = Number(mod.slice(1));
        else throw new Error(`${where}: bad modifier "${mod}" in "${tok}"`);
      }
      return a;
    });

  const scene: Scene = { bg: bgPart as Backdrop, actors };
  const fx = flags.find((f) => FX.includes(f));
  if (fx) scene.fx = fx as Fx;
  if (flags.includes('motion')) scene.motion = true;
  return scene;
}

export function parsePrompt(src: string, scene: Scene, where = ''): Prompt {
  const m = src.match(/^(find|predict|imagine|think)(?::(\w+))?:?\s*(.+)$/s);
  if (!m) throw new Error(`${where}: bad prompt "${src}"`);
  const [, kind, target, rest] = m;
  if (kind === 'find') {
    if (!target || !scene.actors.some((a) => a.name === target)) throw new Error(`${where}: find target "${target}" not in scene`);
    return { kind, target, q: rest.trim() };
  }
  if (kind === 'think') {
    const [qa, why = ''] = rest.split('>>').map((s) => s.trim());
    const [q, ...opts] = qa.split('|').map((s) => s.trim());
    const answer = opts.findIndex((o) => o.startsWith('*'));
    if (opts.length < 2 || answer < 0) throw new Error(`${where}: think prompt needs choices and one *answer`);
    return { kind, q, choices: opts.map((o) => o.replace(/^\*/, '')), answer, why };
  }
  return { kind: kind as 'predict' | 'imagine', q: rest.trim() };
}

export function compilePages(id: string, cast: Cast, pages: PageSrc[]): Page[] {
  return pages.map(([text, sceneSrc, promptSrc], i) => {
    const where = `${id} p${i + 1}`;
    const scene = parseScene(sceneSrc, cast, where);
    return { text, scene, prompt: promptSrc ? parsePrompt(promptSrc, scene, where) : undefined };
  });
}
