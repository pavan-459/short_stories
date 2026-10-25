import type { Look } from '../avatars';
import type { Backdrop, Scene } from '../Scene';
import { person, skins } from './dsl';
import type { GenreId } from './library';

// Ingredients for the guided "Make a story" builder. Each beat offers three ready-made
// story lines (filled in with the child's hero, friend and place); kids tap one or write their own.

export const heroes: Look[] = [
  person('long', '#3B2A20', '#FF6FA5', skins.fair),
  person('short', '#1E1410', '#5AB0F0', skins.brown),
  person('curly', '#2B1B14', '#FFD45C', skins.deep),
  person('braids', '#C0602A', '#8BE07A', skins.light),
  person('bun', '#1E1410', '#B47CE0', skins.tan, ['crown']),
  person('short', '#5A3A2A', '#7F8A96', skins.fair, ['helmet', 'cape']),
  person('spiky', '#E8C35A', '#6C4CC4', skins.light, ['wizard']),
  person('short', '#1E1410', '#E9EEF5', skins.tan, ['astronaut']),
  person('braids', '#E87A3A', '#8BE07A', skins.fair, ['wings', 'tiara']),
  { kind: 'cat' },
  { kind: 'unicorn' },
  { kind: 'dragon' },
];
export const friends: Look[] = [
  { kind: 'rabbit' }, { kind: 'fox' }, { kind: 'bear' }, { kind: 'owl' }, { kind: 'frog' }, { kind: 'turtle' },
  { kind: 'penguin' }, { kind: 'robot' }, { kind: 'alien' }, { kind: 'octopus' }, { kind: 'dog' }, { kind: 'mouse' },
];
export const places: Backdrop[] = ['meadow', 'forest', 'ocean', 'space', 'castle', 'night', 'snow', 'desert'];

export const genreGoal: Record<GenreId, { goal: string; title: string; place: Backdrop }> = {
  adventure: { goal: 'find the hidden treasure', title: 'Treasure Hunt', place: 'desert' },
  animals: { goal: 'find the way back home', title: 'Way Home', place: 'forest' },
  space: { goal: 'visit a faraway planet', title: 'Space Trip', place: 'space' },
  fairy: { goal: 'wake the sleepy kingdom', title: 'Sleepy Spell', place: 'castle' },
  ocean: { goal: 'find the shiny pearl', title: 'Shiny Pearl', place: 'ocean' },
  bedtime: { goal: 'catch a falling dream', title: 'Falling Dream', place: 'night' },
};

export type Cast = { hero: Look; heroName: string; friend: Look; friendName: string; place: Backdrop; genre: GenreId };
export type Line = { text: string; prop?: Look };
export type Beat = { title: string; lines: (c: Cast, placeLabel: string) => Line[]; scene: (c: Cast, prop?: Look) => Scene };

export const beats: Beat[] = [
  {
    title: 'How does it begin?',
    lines: (c, p) => {
      const g = genreGoal[c.genre].goal;
      return [
        { text: `Once upon a time, ${c.heroName} lived in the ${p}. More than anything, ${c.heroName} wanted to ${g}.` },
        { text: `${c.heroName} woke up with a big idea: today was the day to ${g}!` },
        { text: `Nobody in the ${p} believed ${c.heroName} could ${g}. But ${c.heroName} was going to try.` },
      ];
    },
    scene: (c) => ({ bg: c.place, actors: [{ look: c.hero, x: 0.5, anim: 'bob' }] }),
  },
  {
    title: 'Who do they meet?',
    lines: (c) => [
      { text: `On the way, ${c.heroName} met ${c.friendName}. “Can I come too?” asked ${c.friendName}.` },
      { text: `${c.friendName} was stuck and needed help. ${c.heroName} helped, and they became friends.` },
      { text: `${c.friendName} jumped out from behind a rock! “Boo! I mean… hello!”` },
    ],
    scene: (c) => ({ bg: c.place, motion: true, actors: [{ look: c.hero, x: 0.3 }, { look: c.friend, x: 1.05, to: 0.7, anim: 'hop' }] }),
  },
  {
    title: 'Uh oh! What goes wrong?',
    lines: (c) => [
      { text: `Suddenly, a big storm rolled in. Whoosh! ${c.heroName} and ${c.friendName} held on tight.`, prop: { kind: 'storm' } },
      { text: `Oh no! The path was blocked by a giant, grumpy rock.`, prop: { kind: 'rock' } },
      { text: `${c.heroName} and ${c.friendName} got lost. Every way looked the same.`, prop: { kind: 'pine' } },
    ],
    scene: (c, prop) => ({
      bg: c.place,
      actors: [{ look: c.hero, x: 0.25, anim: 'walk' }, { look: c.friend, x: 0.75, anim: 'walk' }, ...(prop ? [{ look: prop, x: 0.5, depth: 0.5, size: 1.1, anim: 'float' as const }] : [])],
    }),
  },
  {
    title: 'How do they fix it?',
    lines: (c) => [
      { text: `${c.friendName} had an idea: “Let’s work together!” And it worked!` },
      { text: `${c.heroName} took a deep breath and remembered: be brave, and be kind.` },
      { text: `They sang the silliest song ever, and the trouble just… went away!` },
    ],
    scene: (c) => ({ bg: c.place, fx: 'sparkles', actors: [{ look: c.hero, x: 0.35, anim: 'hop' }, { look: c.friend, x: 0.65, anim: 'hop' }] }),
  },
  {
    title: 'How does it end?',
    lines: (c) => [
      { text: `At last, they did it! ${c.heroName} and ${c.friendName} danced all the way home.` },
      { text: `It was the best day ever. And tomorrow? A brand new adventure.` },
      { text: `${c.heroName} learned that big dreams are easier with a friend. The end.` },
    ],
    scene: (c) => ({ bg: c.place, motion: true, fx: 'sparkles', actors: [{ look: c.hero, x: 0.15, to: 0.45, anim: 'hop' }, { look: c.friend, x: 0.4, to: 0.7, anim: 'hop' }] }),
  },
];
