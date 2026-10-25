import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Genre, GenreId, genres } from '../content/library';
import { Saga, sagas } from '../content/sagas';
import { SceneView } from '../Scene';
import { AvatarView } from '../AvatarView';
import { parseScene, person, skins } from '../content/dsl';
import { Button } from '../ui';
import { ComingSoon } from '../ComingSoon';
import { cardWidth, useLayout } from '../layout';
import { colors, font } from '../theme';

const heroScene = parseScene(
  'castle | castle@.78 d.85 s1.5 none, unicorn@.22 d.1 hop, kid@.5 d.5 float, dragon@.78 d.15 bob flip | sparkles',
  { kid: { name: '', about: '', look: person('braids', '#E87A3A', '#8BE07A', skins.fair, ['wings', 'tiara']) } },
);

export function Home({
  myCount,
  onGenre,
  onSaga,
  onBuild,
  onMine,
}: {
  myCount: number;
  onGenre: (id: GenreId) => void;
  onSaga: (id: string) => void;
  onBuild: () => void;
  onMine: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { contentWidth, columns, tablet } = useLayout();
  const cardW = cardWidth(contentWidth - 40, columns, 12);
  return (
    <ScrollView
      contentContainerStyle={[styles.root, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32, width: contentWidth, alignSelf: 'center' }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={font.title}>Storypop</Text>
      <Text style={[font.small, { marginBottom: 14 }]}>Pick a world and jump into a story</Text>

      <SceneView scene={heroScene} style={{ height: tablet ? 300 : 190 }} />

      <View style={styles.row}>
        <Button title="Make a story" onPress={onBuild} style={{ flex: 1 }} />
        <Button title={`My stories${myCount ? ` (${myCount})` : ''}`} kind="secondary" onPress={onMine} style={{ flex: 1 }} />
      </View>

      <ComingSoon
        style={{ marginTop: 16 }}
        title="Tell us your idea, we'll write the story"
        body="Describe any story in your own words and watch it come to life. We're still building this one!"
      />

      {sagas.map((sg) => (
        <SagaCard key={sg.id} saga={sg} sceneHeight={tablet ? 240 : 150} onPress={() => onSaga(sg.id)} />
      ))}

      <ComingSoon
        style={{ marginTop: 20 }}
        title="Story Series: a new chapter every week"
        body="Long adventures told chapter by chapter, season after season. Follow your favourite heroes as their story unfolds."
      />

      <Text style={[font.heading, { marginTop: 24, marginBottom: 12 }]}>Genres</Text>
      <View style={styles.grid}>
        {genres.map((g) => (
          <GenreCard key={g.id} genre={g} width={cardW} onPress={() => onGenre(g.id)} />
        ))}
      </View>
    </ScrollView>
  );
}

function SagaCard({ saga, sceneHeight, onPress }: { saga: Saga; sceneHeight: number; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.saga, pressed && { transform: [{ scale: 0.98 }] }]} accessibilityLabel={`Read ${saga.title}`}>
      <SceneView scene={saga.scene} style={{ height: sceneHeight }} rounded={20} />
      <View style={{ padding: 14, gap: 4 }}>
        <Text style={styles.badge}>THE BIG STORY · {saga.povs.length} HEROES</Text>
        <Text style={font.heading}>{saga.title}</Text>
        <Text style={font.small}>{saga.blurb}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
          {saga.povs.map((p) => (
            <View key={p.id} style={[styles.pov, { backgroundColor: p.color }]}>
              <AvatarView look={p.look} size={22} />
              <Text style={{ fontSize: 14 }}>{p.name}</Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

function GenreCard({ genre, width, onPress }: { genre: Genre; width: number; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.genre, { width }, pressed && { transform: [{ scale: 0.96 }] }]} accessibilityLabel={genre.name}>
      <SceneView scene={genre.scene} style={{ height: width * 0.62 }} rounded={18} />
      <Text style={styles.genreName}>{genre.name}</Text>
      <Text style={[font.small, { paddingHorizontal: 8, paddingBottom: 8, marginTop: -6 }]} numberOfLines={2}>
        {genre.tagline}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: 20 },
  row: { flexDirection: 'row', gap: 12, marginTop: 16 },
  saga: { backgroundColor: colors.card, borderRadius: 24, marginTop: 20, overflow: 'hidden', padding: 6 },
  badge: { fontSize: 12, fontWeight: '800', color: colors.accentDark, letterSpacing: 0.5 },
  pov: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  genre: { backgroundColor: colors.card, borderRadius: 22, padding: 6 },
  genreName: { fontSize: 16, fontWeight: '800', color: colors.text, padding: 8 },
});
