import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { beats, Cast, friends, genreGoal, heroes, Line, places } from '../content/builder';
import { GenreId, genres } from '../content/library';
import { backdrops, Scene, SceneView } from '../Scene';
import type { Look } from '../avatars';
import { AvatarView } from '../AvatarView';
import { Button, IconButton } from '../ui';
import { ComingSoon } from '../ComingSoon';
import { cardWidth, useLayout } from '../layout';
import { colors, font } from '../theme';

export type BuiltPage = { text: string; scene: Scene };

// Guided story maker: pick a cast and a world, then choose (or write) what happens in five beats.
export function Builder({
  initialGenre,
  onClose,
  onDone,
}: {
  initialGenre?: GenreId;
  onClose: () => void;
  onDone: (title: string, pages: BuiltPage[]) => void;
}) {
  const insets = useSafeAreaInsets();
  const { contentWidth, columns, tablet } = useLayout();
  const placeW = cardWidth(Math.min(contentWidth, 640) - 40, Math.min(columns, 4), 10);
  const [step, setStep] = useState(0);
  const [cast, setCast] = useState<Cast>(() => {
    const genre = initialGenre ?? 'adventure';
    return { genre, hero: heroes[0], heroName: '', friend: friends[0], friendName: '', place: genreGoal[genre].place };
  });
  // chosen line per beat: index into suggestions, or -1 for "my own"
  const [picks, setPicks] = useState<{ choice: number; own: string }[]>(beats.map(() => ({ choice: 0, own: '' })));

  const named: Cast = {
    ...cast,
    heroName: cast.heroName.trim() || 'Sunny',
    friendName: cast.friendName.trim() || 'Pip',
  };
  const placeLabel = backdrops[cast.place].label.toLowerCase();
  const totalSteps = 2 + beats.length;

  const lineFor = (b: number): Line => {
    const pick = picks[b];
    const options = beats[b].lines(named, placeLabel);
    return pick.choice === -1 ? { text: pick.own.trim() } : options[pick.choice];
  };

  const finish = () => {
    const pages = beats.map((beat, b) => {
      const line = lineFor(b);
      return { text: line.text, scene: beat.scene(named, line.prop) };
    });
    onDone(`${named.heroName}’s ${genreGoal[cast.genre].title}`, pages);
  };

  const canNext = step < 2 || picks[step - 2].choice !== -1 || picks[step - 2].own.trim().length > 0;
  const next = () => (step === totalSteps - 1 ? finish() : setStep(step + 1));
  const back = () => (step === 0 ? onClose() : setStep(step - 1));

  let body;
  if (step === 0) {
    body = (
      <>
        <ComingSoon title="Story writer helper" body="Soon you'll be able to describe a story and get a brand new one. For now, build it step by step below." />
        <Text style={font.heading}>What kind of story?</Text>
        <View style={styles.wrap}>
          {genres.map((g) => (
            <Chip
              key={g.id}
              label={g.name}
              on={cast.genre === g.id}
              onPress={() => setCast({ ...cast, genre: g.id, place: genreGoal[g.id].place })}
            />
          ))}
        </View>
        <Text style={font.heading}>Who is the hero?</Text>
        <AvatarRow items={heroes} value={cast.hero} onPick={(hero) => setCast({ ...cast, hero })} />
        <TextInput value={cast.heroName} onChangeText={(heroName) => setCast({ ...cast, heroName })} placeholder="Hero’s name (e.g. your name!)" placeholderTextColor={colors.muted} style={styles.input} maxLength={20} />
        <Text style={font.heading}>And their friend?</Text>
        <AvatarRow items={friends} value={cast.friend} onPick={(friend) => setCast({ ...cast, friend })} />
        <TextInput value={cast.friendName} onChangeText={(friendName) => setCast({ ...cast, friendName })} placeholder="Friend’s name" placeholderTextColor={colors.muted} style={styles.input} maxLength={20} />
      </>
    );
  } else if (step === 1) {
    body = (
      <>
        <Text style={font.heading}>Where does it happen?</Text>
        <View style={styles.wrap}>
          {places.map((p) => (
            <Pressable key={p} onPress={() => (Haptics.selectionAsync(), setCast({ ...cast, place: p }))} style={[styles.place, { width: placeW }, cast.place === p && styles.placeOn]} accessibilityLabel={backdrops[p].label}>
              <SceneView scene={{ bg: p, actors: [{ look: cast.hero, x: 0.5, anim: 'none' }] }} active={false} style={{ height: placeW * 0.6 }} rounded={14} />
              <Text style={styles.placeLabel}>{backdrops[p].label}</Text>
            </Pressable>
          ))}
        </View>
      </>
    );
  } else {
    const b = step - 2;
    const options = beats[b].lines(named, placeLabel);
    const pick = picks[b];
    const setPick = (p: Partial<{ choice: number; own: string }>) => setPicks(picks.map((x, i) => (i === b ? { ...x, ...p } : x)));
    body = (
      <>
        <SceneView key={`${b}-${pick.choice}`} scene={beats[b].scene(named, lineFor(b).prop)} style={{ height: tablet ? 300 : 180 }} />
        <Text style={font.heading}>{beats[b].title}</Text>
        {options.map((o, i) => (
          <Pressable key={i} onPress={() => (Haptics.selectionAsync(), setPick({ choice: i }))} style={[styles.line, pick.choice === i && styles.lineOn]}>
            <Text style={font.body}>{o.text}</Text>
          </Pressable>
        ))}
        <Pressable onPress={() => setPick({ choice: -1 })} style={[styles.line, pick.choice === -1 && styles.lineOn]}>
          <Text style={[font.body, { fontWeight: '700' }]}>Write my own</Text>
          {pick.choice === -1 && (
            <TextInput value={pick.own} onChangeText={(own) => setPick({ own })} placeholder="What happens?" placeholderTextColor={colors.muted} multiline autoFocus maxLength={300} style={[styles.input, { marginTop: 8, minHeight: 70 }]} />
          )}
        </Pressable>
      </>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.toolbar, { paddingTop: insets.top + 8 }]}>
        <IconButton label="‹" accessibilityLabel="Back" onPress={back} />
        <View style={styles.progress}>
          {Array.from({ length: totalSteps }, (_, i) => (
            <View key={i} style={[styles.dot, i <= step && styles.dotOn]} />
          ))}
        </View>
        <IconButton label="✕" accessibilityLabel="Close" onPress={onClose} />
      </View>
      <ScrollView contentContainerStyle={[styles.scroll, { width: Math.min(contentWidth, 640), alignSelf: 'center' }]} keyboardShouldPersistTaps="handled">
        {body}
      </ScrollView>
      <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 12, width: Math.min(contentWidth, 640), alignSelf: 'center' }}>
        <Button title={step === totalSteps - 1 ? 'Make my story!' : 'Next'} onPress={next} disabled={!canNext} />
      </View>
    </KeyboardAvoidingView>
  );
}

function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={() => (Haptics.selectionAsync(), onPress())} style={[styles.chip, on && styles.chipOn]}>
      <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>{label}</Text>
    </Pressable>
  );
}

function AvatarRow({ items, value, onPick }: { items: Look[]; value: Look; onPick: (l: Look) => void }) {
  return (
    <View style={styles.wrap}>
      {items.map((l, i) => (
        <Pressable key={i} onPress={() => (Haptics.selectionAsync(), onPick(l))} style={[styles.emoji, value === l && styles.chipOn]} accessibilityLabel={l.kind}>
          <AvatarView look={l} size={58} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 8 },
  progress: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.track },
  dotOn: { backgroundColor: colors.accent },
  scroll: { padding: 20, gap: 14, paddingBottom: 40 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { borderRadius: 16, borderWidth: 2, borderColor: colors.track, backgroundColor: colors.card, paddingHorizontal: 12, paddingVertical: 8 },
  chipOn: { borderColor: colors.accent, backgroundColor: '#FFE3EE' },
  emoji: { width: 68, height: 68, borderRadius: 18, borderWidth: 2, borderColor: colors.track, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  input: { borderWidth: 2, borderColor: colors.track, borderRadius: 16, padding: 12, fontSize: 18, color: colors.text, backgroundColor: colors.card },
  place: { borderRadius: 18, borderWidth: 3, borderColor: 'transparent', backgroundColor: colors.card, padding: 4 },
  placeOn: { borderColor: colors.accent },
  placeLabel: { fontWeight: '800', color: colors.text, padding: 6, textAlign: 'center' },
  line: { backgroundColor: colors.card, borderRadius: 18, borderWidth: 2, borderColor: colors.track, padding: 14 },
  lineOn: { borderColor: colors.accent, backgroundColor: '#FFF0F6' },
});
