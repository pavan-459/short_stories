import type { Scene } from '../Scene';
import { CastMember, compilePages, Page, parseScene, StorySrc } from './dsl';
import { adventure } from './stories/adventure';
import { animals } from './stories/animals';
import { space } from './stories/space';
import { fairy } from './stories/fairy';
import { ocean } from './stories/ocean';
import { bedtime } from './stories/bedtime';

// Built-in stories that ship with the app, written in the notation from dsl.ts.

export type GenreId = 'adventure' | 'animals' | 'space' | 'fairy' | 'ocean' | 'bedtime';

export type Genre = { id: GenreId; name: string; tagline: string; color: string; scene: Scene };

export type LibPage = Page;

export type LibStory = { id: string; genre: GenreId; title: string; blurb: string; cast: CastMember[]; pages: LibPage[] };

const g = (id: GenreId, name: string, tagline: string, color: string, scene: string): Genre => ({ id, name, tagline, color, scene: parseScene(scene, {}, `genre ${id}`) });

export const genres: Genre[] = [
  g('adventure', 'Adventure', 'Maps, mountains and brave friends', '#FFE08A', 'meadow | kid@.3 walk, dog@.55 hop, map@.78 d.4 s.6 float'),
  g('animals', 'Animals', 'Furry, feathery, friendly tales', '#B8E8C4', 'forest | fox@.3 hop, rabbit@.62 d.2, owl@.85 d.6 s.7'),
  g('space', 'Space', 'Rockets, robots and starry skies', '#D7C4FF', 'space | rocket@.3 d.3 float, alien@.62 hop, planet@.85 d.8 s.6 float'),
  g('fairy', 'Fairy Tales', 'Castles, dragons and magic', '#FFB5D0', 'castle | castle@.72 d.8 s1.5 none, unicorn@.25 hop, dragon@.5 d.2'),
  g('ocean', 'Ocean', 'Deep blue sea adventures', '#A8DCFF', 'ocean | whale@.35 d.5 s1.2 float, octopus@.72 d.2 float, crab@.55 walk'),
  g('bedtime', 'Bedtime', 'Calm, cosy stories for sleepy eyes', '#C9CFF5', 'night | moon@.75 d.9 s.8 float, owl@.3, sheep@.55 d.2'),
];

function compile(src: StorySrc<GenreId>): LibStory {
  return {
    id: src.id,
    genre: src.genre,
    title: src.title,
    blurb: src.blurb,
    cast: Object.values(src.cast),
    pages: compilePages(src.id, src.cast, src.pages),
  };
}

export const stories: LibStory[] = [...adventure, ...animals, ...space, ...fairy, ...ocean, ...bedtime].map(compile);

export function storiesFor(genre: GenreId) {
  return stories.filter((st) => st.genre === genre);
}

export function genreById(id: GenreId) {
  return genres.find((x) => x.id === id)!;
}
