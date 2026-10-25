import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Saga } from '../content/sagas';
import { SceneView } from '../Scene';
import { AvatarView } from '../AvatarView';
import { Button, IconButton } from '../ui';
import { Reader } from './Reader';
import { useLayout } from '../layout';
import { colors, font } from '../theme';

// The big story: pick whose eyes to see it through, read a chapter, then carry on or
// replay the same chapter from another hero's point of view.
export function SagaScreen({ saga, onClose }: { saga: Saga; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { contentWidth, tablet } = useLayout();
  const [pov, setPov] = useState<string | null>(null);
  const [chapter, setChapter] = useState(0);

  if (!pov) {
    return (
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24, paddingHorizontal: 20, gap: 14, width: Math.min(contentWidth, 640), alignSelf: 'center' }}>
        <IconButton label="‹" accessibilityLabel="Back" onPress={onClose} />
        <SceneView scene={saga.scene} style={{ height: tablet ? 320 : 200 }} />
        <Text style={font.title}>{saga.title}</Text>
        <Text style={font.body}>{saga.blurb}</Text>
        <Text style={[font.heading, { marginTop: 8 }]}>Whose story do you want to hear?</Text>
        {saga.povs.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => {
              Haptics.selectionAsync();
              setChapter(0);
              setPov(p.id);
            }}
            style={({ pressed }) => [styles.povCard, { backgroundColor: p.color }, pressed && { transform: [{ scale: 0.97 }] }]}
            accessibilityLabel={`Read as ${p.name}`}
          >
            <AvatarView look={p.look} size={72} />
            <View style={{ flex: 1 }}>
              <Text style={styles.povName}>{p.name}</Text>
              <Text style={[font.small, { color: colors.text }]}>{p.tagline}</Text>
            </View>
            <Text style={styles.povGo}>▶</Text>
          </Pressable>
        ))}
        <Text style={[font.small, { textAlign: 'center' }]}>
          {saga.chapters.length} chapters · switch heroes any time
        </Text>
      </ScrollView>
    );
  }

  const ch = saga.chapters[chapter];
  const me = saga.povs.find((p) => p.id === pov)!;
  const others = saga.povs.filter((p) => p.id !== pov);
  const last = chapter === saga.chapters.length - 1;
  const pages = ch.tellings[pov];

  const switcher = (
    <View style={styles.switcher}>
      {saga.povs.map((p) => (
        <Pressable
          key={p.id}
          onPress={() => {
            Haptics.selectionAsync();
            setPov(p.id);
          }}
          style={[styles.switchChip, p.id === pov && { backgroundColor: p.color, borderColor: p.color }]}
          accessibilityLabel={`Switch to ${p.name}`}
        >
          <AvatarView look={p.look} size={32} />
        </Pressable>
      ))}
    </View>
  );

  const endExtra = (
    <View style={{ alignSelf: 'stretch', gap: 10 }}>
      {last ? (
        <Text style={[font.body, { textAlign: 'center' }]}>You finished {me.name}’s story! Now try it through someone else’s eyes:</Text>
      ) : (
        <Button title={`▶  Chapter ${chapter + 2}: ${saga.chapters[chapter + 1].title}`} onPress={() => setChapter(chapter + 1)} />
      )}
      {others.map((p) => (
        <Button
          key={p.id}
          kind="chip"
          title={last ? `Read as ${p.name}` : `What did ${p.name} see?`}
          onPress={() => {
            if (last) setChapter(0);
            setPov(p.id);
          }}
        />
      ))}
    </View>
  );

  return (
    <Reader
      key={`${pov}-${chapter}`}
      title={`Chapter ${chapter + 1}: ${ch.title}`}
      author={`as told by ${me.name}`}
      color={me.color}
      coverScene={pages[0]?.scene}
      pages={pages}
      onClose={() => setPov(null)}
      header={switcher}
      endExtra={endExtra}
    />
  );
}

const styles = StyleSheet.create({
  povCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 22, padding: 14 },
  povName: { fontSize: 20, fontWeight: '800', color: colors.text },
  povGo: { fontSize: 22, color: colors.text, fontWeight: '800' },
  switcher: { flexDirection: 'row', gap: 8 },
  switchChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.track,
    backgroundColor: colors.card,
  },
});
