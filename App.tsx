import { useEffect, useState } from 'react';
import { Alert, BackHandler, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppState, coverScene, defaultState, deletePicture, displayTitle, loadState, newId, newStory, saveState, Story } from './src/storage';
import { shareStoryAsPdf } from './src/share';
import { GenreId, stories as libraryStories } from './src/content/library';
import { sagas } from './src/content/sagas';
import { ParentGate } from './src/ParentGate';
import { Home } from './src/screens/Home';
import { GenreScreen } from './src/screens/GenreScreen';
import { SagaScreen } from './src/screens/SagaScreen';
import { Builder, BuiltPage } from './src/screens/Builder';
import { Library } from './src/screens/Library';
import { Editor } from './src/screens/Editor';
import { Reader } from './src/screens/Reader';
import { colors } from './src/theme';

type Screen =
  | { name: 'home' }
  | { name: 'genre'; genre: GenreId }
  | { name: 'libRead'; id: string } // built-in story
  | { name: 'saga'; id: string }
  | { name: 'build'; genre?: GenreId }
  | { name: 'mine' }
  | { name: 'edit'; id: string } // user's story
  | { name: 'read'; id: string };

export default function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [stack, setStack] = useState<Screen[]>([{ name: 'home' }]);
  const [shareId, setShareId] = useState<string | null>(null);
  const screen = stack[stack.length - 1];

  useEffect(() => {
    loadState().then(setState);
  }, []);

  const push = (s: Screen) => setStack((st) => [...st, s]);
  const replace = (s: Screen) => setStack((st) => [...st.slice(0, -1), s]);

  const update = (fn: (s: AppState) => AppState) =>
    setState((s) => {
      const next = fn(s ?? defaultState);
      saveState(next);
      return next;
    });

  const patchStory = (id: string, patch: Partial<Story>) =>
    update((s) => ({
      ...s,
      stories: s.stories.map((st) => (st.id === id ? { ...st, ...patch, updatedAt: Date.now() } : st)),
    }));

  const deleteStory = (id: string) =>
    update((s) => {
      s.stories.find((st) => st.id === id)?.pages.forEach((p) => deletePicture(p.image));
      return { ...s, stories: s.stories.filter((st) => st.id !== id) };
    });

  const addStory = (init: Parameters<typeof newStory>[1]) => {
    const st = newStory(state?.stories.length ?? 0, init);
    update((s) => ({ ...s, stories: [...s.stories, st] }));
    return st;
  };

  // Leaving the editor with a story that's still completely blank discards it.
  const back = () => {
    if (screen.name === 'edit') {
      const st = state?.stories.find((x) => x.id === screen.id);
      const blank = st && !st.title.trim() && st.pages.every((p) => !p.image && !p.scene && !p.text.trim());
      if (blank) deleteStory(st.id);
    }
    setStack((st) => (st.length > 1 ? st.slice(0, -1) : st));
  };

  // Android back button pops a screen instead of closing the app.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length === 1) return false;
      back();
      return true;
    });
    return () => sub.remove();
  });

  const share = async (id: string) => {
    setShareId(null);
    const st = state?.stories.find((x) => x.id === id);
    if (!st) return;
    try {
      await shareStoryAsPdf(st);
    } catch {
      Alert.alert("Couldn't make the picture book", 'Please try again.');
    }
  };

  const remix = (libId: string) => {
    const src = libraryStories.find((x) => x.id === libId)!;
    const st = addStory({
      title: `My ${src.title.replace(/^The /, '')}`,
      pages: src.pages.map((p) => ({ id: newId(), image: null, scene: p.scene, text: p.text })),
    });
    replace({ name: 'edit', id: st.id });
  };

  const built = (title: string, pages: BuiltPage[]) => {
    const st = addStory({ title, pages: pages.map((p) => ({ id: newId(), image: null, scene: p.scene, text: p.text })) });
    replace({ name: 'read', id: st.id });
  };

  let content = null;
  if (state) {
    const mine = 'id' in screen ? state.stories.find((s) => s.id === screen.id) : undefined;
    switch (screen.name) {
      case 'home':
        content = (
          <Home
            myCount={state.stories.length}
            onGenre={(genre) => push({ name: 'genre', genre })}
            onSaga={(id) => push({ name: 'saga', id })}
            onBuild={() => push({ name: 'build' })}
            onMine={() => push({ name: 'mine' })}
          />
        );
        break;
      case 'genre':
        content = (
          <GenreScreen
            genre={screen.genre}
            onBack={back}
            onRead={(id) => push({ name: 'libRead', id })}
            onBuild={() => push({ name: 'build', genre: screen.genre })}
          />
        );
        break;
      case 'libRead': {
        const st = libraryStories.find((x) => x.id === screen.id)!;
        content = (
          <Reader
            title={st.title}
            color={colors.card}
            coverScene={st.pages[0].scene}
            cast={st.cast}
            pages={st.pages}
            onClose={back}
            onRemix={() => remix(st.id)}
          />
        );
        break;
      }
      case 'saga':
        content = <SagaScreen saga={sagas.find((x) => x.id === screen.id)!} onClose={back} />;
        break;
      case 'build':
        content = <Builder initialGenre={screen.genre} onClose={back} onDone={built} />;
        break;
      case 'mine':
        content = (
          <Library
            stories={state.stories}
            onBack={back}
            onNew={() => push({ name: 'edit', id: addStory({}).id })}
            onRead={(id) => push({ name: 'read', id })}
            onEdit={(id) => push({ name: 'edit', id })}
            onDelete={deleteStory}
          />
        );
        break;
      case 'edit':
        if (mine)
          content = (
            <Editor
              story={mine}
              onChange={(patch) => patchStory(mine.id, patch)}
              onRead={() => replace({ name: 'read', id: mine.id })}
              onClose={back}
            />
          );
        break;
      case 'read':
        if (mine)
          content = (
            <Reader
              title={displayTitle(mine)}
              author={mine.author}
              color={mine.color}
              coverScene={coverScene(mine)}
              pages={mine.pages}
              onClose={back}
              onRemix={() => replace({ name: 'edit', id: mine.id })}
              remixLabel="Edit this story"
              onShare={() => setShareId(mine.id)}
            />
          );
        break;
    }
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>{content}</View>
      <ParentGate
        visible={!!shareId}
        reason="Sharing sends this story outside the app."
        onPass={() => shareId && share(shareId)}
        onCancel={() => setShareId(null)}
      />
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
