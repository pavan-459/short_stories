import { ReactNode, useEffect, useRef, useState } from 'react';
import { Animated, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { pictureUri } from '../storage';
import { Scene, SceneView } from '../Scene';
import { AvatarView } from '../AvatarView';
import type { CastMember, Prompt } from '../content/dsl';
import { Button, IconButton } from '../ui';
import { useLayout } from '../layout';
import { colors, font } from '../theme';

export type ReadablePage = { image?: string | null; scene?: Scene; text: string; prompt?: Prompt };

type Slide = { kind: 'cover' } | { kind: 'cast' } | ({ kind: 'page' } & ReadablePage) | { kind: 'end' };

const promptStyle: Record<Prompt['kind'], { label: string; color: string; tint: string }> = {
  predict: { label: 'PREDICT', color: '#7C5CD6', tint: '#F1EBFF' },
  think: { label: 'THINK', color: '#2F8F6B', tint: '#E6F7EF' },
  imagine: { label: 'IMAGINE', color: '#E07A2E', tint: '#FFF1E3' },
  find: { label: 'FIND IT', color: '#2F7FC9', tint: '#E6F2FD' },
};

function promptSpeech(p: Prompt) {
  if (p.kind === 'think') return `${p.q} Is it: ${p.choices.join('? Or, ')}?`;
  return p.q;
}

export function Reader({
  title,
  author,
  color,
  coverScene,
  cast,
  pages,
  onClose,
  onShare,
  onRemix,
  remixLabel = 'Make my own version',
  header,
  endExtra,
  startAt = 0,
}: {
  title: string;
  author?: string;
  color: string;
  coverScene?: Scene | null;
  cast?: CastMember[];
  pages: ReadablePage[];
  onClose: () => void;
  onShare?: () => void;
  onRemix?: () => void;
  remixLabel?: string;
  header?: ReactNode; // extra toolbar content (e.g. point-of-view switcher)
  endExtra?: ReactNode;
  startAt?: number;
}) {
  const insets = useSafeAreaInsets();
  const { width, height, tablet } = useLayout();
  // Fit art to the window and leave room for the longer text below the picture.
  const maxW = Math.min(width - 40, 760);
  const picW = Math.min(maxW, height * (tablet ? 0.42 : 0.32) * (4 / 3));
  const coverW = Math.min(maxW, height * 0.42);
  const storyText = tablet ? { fontSize: 26, lineHeight: 38 } : { fontSize: 19, lineHeight: 27 };
  const list = useRef<FlatList<Slide>>(null);
  const scrollX = useRef(new Animated.Value(startAt * width)).current;
  const [index, setIndex] = useState(startAt);
  const [readAloud, setReadAloud] = useState(false);
  const [answered, setAnswered] = useState<Record<number, boolean>>({});

  const slides: Slide[] = [
    { kind: 'cover' },
    ...(cast?.length ? [{ kind: 'cast' as const }] : []),
    ...pages.filter((p) => p.image || p.scene || p.text.trim()).map((p) => ({ kind: 'page' as const, ...p })),
    { kind: 'end' },
  ];

  const goTo = (i: number) => {
    const clamped = Math.max(0, Math.min(slides.length - 1, i));
    list.current?.scrollToIndex({ index: clamped, animated: true });
    setIndex(clamped);
  };

  const current = slides[index];
  const waitingOnPrompt = current.kind === 'page' && !!current.prompt && !answered[index];

  // "Read to me": speak the page (and its question), then turn the page. Pages with a
  // question wait for an answer first, so reading aloud never skips the thinking.
  useEffect(() => {
    Speech.stop();
    if (!readAloud) return;
    const s = slides[index];
    let text = '';
    if (s.kind === 'cover') text = `${title}.${author?.trim() ? ` ${author.trim()}.` : ''}`;
    else if (s.kind === 'cast') text = `Meet the characters. ${cast!.map((c) => `${c.name}. ${c.about}`).join(' ')}`;
    else if (s.kind === 'page') text = s.prompt && !answered[index] ? `${s.text} ... ${promptSpeech(s.prompt)}` : s.text;
    else text = 'The end.';
    let timer: ReturnType<typeof setTimeout> | undefined;
    const next = () => {
      if (s.kind === 'page' && s.prompt && !answered[index]) return; // wait for the child
      if (index < slides.length - 1) timer = setTimeout(() => goTo(index + 1), 900);
      else setReadAloud(false);
    };
    Speech.speak(text, { rate: 0.9, pitch: 1.1, onDone: next });
    return () => {
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, readAloud]);

  useEffect(() => () => void Speech.stop(), []);

  const markAnswered = (i: number, say?: string) => {
    setAnswered((a) => ({ ...a, [i]: true }));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (readAloud) {
      Speech.stop();
      Speech.speak(say ?? 'Great thinking!', {
        rate: 0.9,
        pitch: 1.1,
        onDone: () => {
          if (i < slides.length - 1) setTimeout(() => goTo(i + 1), 900);
        },
      });
    }
  };

  const renderSlide = ({ item, index: i }: { item: Slide; index: number }) => {
    // 3D page turn: neighbouring pages swing away around the vertical axis
    const range = [(i - 1) * width, i * width, (i + 1) * width];
    const rotateY = scrollX.interpolate({ inputRange: range, outputRange: ['55deg', '0deg', '-55deg'], extrapolate: 'clamp' });
    const scale = scrollX.interpolate({ inputRange: range, outputRange: [0.82, 1, 0.82], extrapolate: 'clamp' });
    const opacity = scrollX.interpolate({ inputRange: range, outputRange: [0.4, 1, 0.4], extrapolate: 'clamp' });
    const active = i === index;

    let body: ReactNode = null;
    if (item.kind === 'cover') {
      body = coverScene ? (
        <View style={{ width: coverW, gap: 14 }}>
          <SceneView scene={coverScene} active={active} style={{ aspectRatio: 1 }} showReplay={false} />
          <Text style={styles.coverTitle}>{title}</Text>
          {!!author?.trim() && <Text style={styles.coverAuthor}>{author.trim()}</Text>}
        </View>
      ) : (
        <View style={[styles.coverCard, { backgroundColor: color, width: Math.min(maxW, height * 0.55 * 0.75) }]}>
          <Text style={styles.coverTitle}>{title}</Text>
          {!!author?.trim() && <Text style={styles.coverAuthor}>{author.trim()}</Text>}
          <Text style={[font.small, { color: colors.text, marginTop: 28 }]}>Swipe to start →</Text>
        </View>
      );
    } else if (item.kind === 'cast') {
      const size = tablet ? 120 : 84;
      body = (
        <ScrollView style={{ width: maxW }} contentContainerStyle={{ gap: 14, paddingVertical: 8 }} showsVerticalScrollIndicator={false}>
          <Text style={[font.title, { textAlign: 'center' }]}>Meet the characters</Text>
          {cast!.map((c) => (
            <View key={c.name} style={styles.castRow}>
              <View style={styles.castAvatar}>
                <AvatarView look={c.look} size={size} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.castName, tablet && { fontSize: 24 }]}>{c.name}</Text>
                <Text style={[font.body, { color: colors.muted }, tablet && { fontSize: 20 }]}>{c.about}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      );
    } else if (item.kind === 'page') {
      const p = item.prompt;
      const findHandler =
        p?.kind === 'find' && !answered[i]
          ? (a: { name?: string }) => {
              if (a.name === p.target) markAnswered(i, 'You found it!');
              else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
          : undefined;
      body = (
        <ScrollView style={{ width: maxW }} contentContainerStyle={{ alignItems: 'center', paddingVertical: 8, gap: 16 }} showsVerticalScrollIndicator={false}>
          {item.image ? (
            <Image source={{ uri: pictureUri(item.image) }} style={[styles.picture, { width: picW }]} resizeMode="cover" />
          ) : item.scene ? (
            <SceneView scene={item.scene} active={active} style={{ ...styles.picture, width: picW }} onActorPress={findHandler} />
          ) : null}
          {!!item.text.trim() && <Text style={[font.story, styles.text, storyText]}>{item.text}</Text>}
          {p && <PromptCard prompt={p} done={!!answered[i]} onDone={(say) => markAnswered(i, say)} big={tablet} />}
        </ScrollView>
      );
    } else {
      body = (
        <View style={{ alignItems: 'center', gap: 12, width: Math.min(maxW, 480) }}>
          <AvatarView look={{ kind: 'star' }} size={96} />
          <Text style={font.title}>The End</Text>
          {endExtra}
          <Button title="Read again" onPress={() => goTo(0)} style={{ alignSelf: 'stretch', marginTop: 8 }} />
          {onRemix && <Button title={remixLabel} kind="secondary" onPress={onRemix} style={{ alignSelf: 'stretch' }} />}
          {onShare && <Button title="Share as a picture book" kind="secondary" onPress={onShare} style={{ alignSelf: 'stretch' }} />}
        </View>
      );
    }

    return <Animated.View style={[styles.slide, { width, opacity, transform: [{ perspective: 900 }, { rotateY }, { scale }] }]}>{body}</Animated.View>;
  };

  return (
    <View style={{ flex: 1, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }}>
      <View style={styles.toolbar}>
        <IconButton label="✕" accessibilityLabel="Close story" onPress={onClose} />
        <View style={{ flex: 1, alignItems: 'center' }}>{header}</View>
        <Button
          title={readAloud ? 'Stop' : 'Read to me'}
          kind="chip"
          onPress={() => setReadAloud((r) => !r)}
          style={readAloud ? { backgroundColor: colors.sun, borderColor: colors.sun, paddingVertical: 8 } : { paddingVertical: 8 }}
        />
      </View>

      <Animated.FlatList
        ref={list}
        data={slides}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderSlide}
        extraData={`${index}-${Object.keys(answered).length}`}
        horizontal
        pagingEnabled
        initialScrollIndex={startAt}
        initialNumToRender={2}
        windowSize={3}
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          if (i !== index) {
            Haptics.selectionAsync();
            setIndex(i);
          }
        }}
      />

      <View style={styles.nav}>
        <IconButton label="‹" accessibilityLabel="Previous page" onPress={() => goTo(index - 1)} disabled={index === 0} style={styles.navBtn} />
        <View style={styles.progress}>
          <Text style={font.small}>
            {index + 1} / {slides.length}
          </Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${((index + 1) / slides.length) * 100}%` }]} />
          </View>
        </View>
        <IconButton
          label="›"
          accessibilityLabel="Next page"
          onPress={() => goTo(index + 1)}
          disabled={index === slides.length - 1}
          style={waitingOnPrompt ? { ...styles.navBtn, borderColor: colors.sun } : styles.navBtn}
        />
      </View>
    </View>
  );
}

// The thinking moment on a page. Kids can still swipe on, but read-aloud waits here.
function PromptCard({ prompt, done, onDone, big }: { prompt: Prompt; done: boolean; onDone: (say?: string) => void; big: boolean }) {
  const st = promptStyle[prompt.kind];
  const [wrong, setWrong] = useState<number | null>(null);
  const q = big ? { fontSize: 22, lineHeight: 30 } : { fontSize: 17, lineHeight: 24 };

  return (
    <View style={[styles.prompt, { backgroundColor: st.tint, borderColor: st.color }]}>
      <View style={[styles.promptTag, { backgroundColor: st.color }]}>
        <Text style={styles.promptTagText}>{st.label}</Text>
      </View>
      <Text style={[styles.promptQ, q]}>{prompt.q}</Text>

      {prompt.kind === 'think' &&
        prompt.choices.map((c, i) => {
          const right = done && i === prompt.answer;
          return (
            <Pressable
              key={i}
              disabled={done}
              onPress={() => {
                if (i === prompt.answer) onDone(`Yes! ${prompt.why}`);
                else {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                  setWrong(i);
                }
              }}
              style={[
                styles.choice,
                right && { borderColor: st.color, backgroundColor: '#FFFFFF' },
                !done && wrong === i && { borderColor: '#F0A0A0' },
                done && !right && { opacity: 0.45 },
              ]}
            >
              <Text style={[font.body, big && { fontSize: 20 }]}>{c}</Text>
            </Pressable>
          );
        })}
      {prompt.kind === 'think' && wrong !== null && !done && (
        <Text style={[font.small, { color: colors.text }]}>Hmm, not quite. Read the page again and have another think!</Text>
      )}
      {prompt.kind === 'think' && done && <Text style={[font.body, { color: st.color, fontWeight: '700' }]}>{prompt.why}</Text>}

      {prompt.kind === 'find' && (
        <Text style={[font.small, { color: done ? st.color : colors.text, fontWeight: done ? '800' : '400' }]}>
          {done ? 'You found it! Great looking!' : 'Tap it in the picture above.'}
        </Text>
      )}

      {(prompt.kind === 'predict' || prompt.kind === 'imagine') &&
        (done ? (
          <Text style={[font.body, { color: st.color, fontWeight: '700' }]}>
            {prompt.kind === 'predict' ? 'Great guess! Turn the page to find out.' : 'What a wonderful idea!'}
          </Text>
        ) : (
          <Pressable
            onPress={() => onDone(prompt.kind === 'predict' ? 'Great guess! Let’s find out.' : 'What a wonderful idea!')}
            style={[styles.thought, { backgroundColor: st.color }]}
          >
            <Text style={styles.thoughtText}>{prompt.kind === 'predict' ? 'I made my guess' : 'I thought about it'}</Text>
          </Pressable>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 8 },
  slide: { flex: 1, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  coverCard: { aspectRatio: 3 / 4, borderRadius: 28, alignItems: 'center', justifyContent: 'center', padding: 24 },
  coverTitle: { fontSize: 32, fontWeight: '900', color: colors.text, textAlign: 'center' },
  coverAuthor: { fontSize: 19, fontWeight: '600', color: colors.muted, textAlign: 'center' },
  castRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: 22, padding: 10 },
  castAvatar: { backgroundColor: '#FFF4F8', borderRadius: 18, padding: 4 },
  castName: { fontSize: 20, fontWeight: '800', color: colors.text },
  picture: { aspectRatio: 4 / 3, borderRadius: 24 },
  text: { textAlign: 'left', alignSelf: 'stretch' },
  prompt: { alignSelf: 'stretch', borderRadius: 20, borderWidth: 2, padding: 14, gap: 10, marginBottom: 8 },
  promptTag: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  promptTagText: { color: '#fff', fontWeight: '900', fontSize: 11, letterSpacing: 1 },
  promptQ: { fontWeight: '700', color: colors.text },
  choice: { borderRadius: 14, borderWidth: 2, borderColor: colors.track, backgroundColor: '#FFFFFFAA', padding: 12 },
  thought: { alignSelf: 'flex-start', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  thoughtText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  navBtn: { width: 56, height: 56, borderRadius: 28 },
  progress: { flex: 1, alignItems: 'center', gap: 6, paddingHorizontal: 12 },
  track: { height: 6, alignSelf: 'stretch', borderRadius: 3, backgroundColor: colors.track, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3, backgroundColor: colors.accent },
});
