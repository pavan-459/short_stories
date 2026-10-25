import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';
import { coverColors } from './theme';
import type { Scene } from './Scene';

const KEY = 'storypop/state/v1';

export type Page = {
  id: string;
  // file name inside the pictures folder, or null if the page has no picture yet.
  // Only the name is stored: on iOS the app's container path changes between installs/updates.
  image: string | null;
  // drawn scene, used when there's no photo (built-in stories, remixes, the story builder)
  scene?: Scene;
  text: string;
};

export type Story = {
  id: string;
  title: string;
  author: string;
  color: string;
  pages: Page[];
  createdAt: number;
  updatedAt: number;
};

export type AppState = {
  stories: Story[];
};

export const defaultState: AppState = { stories: [] };

export async function loadState(): Promise<AppState> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState;
  } catch {
    return defaultState;
  }
}

export async function saveState(state: AppState) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // non-fatal: state stays in memory
  }
}

export function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function newPage(): Page {
  return { id: newId(), image: null, text: '' };
}

export function newStory(existing: number, init: Partial<Pick<Story, 'title' | 'author' | 'pages'>> = {}): Story {
  const now = Date.now();
  return {
    id: newId(),
    title: '',
    author: '',
    color: coverColors[existing % coverColors.length],
    pages: [newPage()],
    createdAt: now,
    updatedAt: now,
    ...init,
  };
}

// ---- pictures ----

function picturesDir() {
  const dir = new Directory(Paths.document, 'pictures');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

export function pictureUri(name: string) {
  return new File(picturesDir(), name).uri;
}

// Copies a picked/captured photo (which lives in a temporary cache) into permanent storage.
export async function savePicture(sourceUri: string): Promise<string> {
  const src = new File(sourceUri);
  const ext = src.extension || '.jpg';
  const name = `${newId()}${ext}`;
  await src.copy(new File(picturesDir(), name));
  return name;
}

export function deletePicture(name: string | null) {
  if (!name) return;
  try {
    const f = new File(picturesDir(), name);
    if (f.exists) f.delete();
  } catch {
    // ignore: a missing picture shouldn't block anything
  }
}

export async function pictureBase64(name: string) {
  return new File(picturesDir(), name).base64();
}

export function coverPicture(story: Story) {
  return story.pages.find((p) => p.image)?.image ?? null;
}

export function coverScene(story: Story) {
  return story.pages.find((p) => p.scene)?.scene ?? null;
}

export function displayTitle(story: Story) {
  return story.title.trim() || 'Untitled story';
}
