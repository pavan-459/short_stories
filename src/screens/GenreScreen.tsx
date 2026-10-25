import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { genreById, GenreId, storiesFor } from '../content/library';
import { SceneView } from '../Scene';
import { Button, IconButton } from '../ui';
import { useLayout } from '../layout';
import { colors, font } from '../theme';

export function GenreScreen({
  genre,
  onBack,
  onRead,
  onBuild,
}: {
  genre: GenreId;
  onBack: () => void;
  onRead: (storyId: string) => void;
  onBuild: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { contentWidth, tablet } = useLayout();
  const g = genreById(genre);
  const list = storiesFor(genre);

  return (
    <View style={{ flex: 1, paddingTop: insets.top + 8 }}>
      <View style={styles.toolbar}>
        <IconButton label="‹" accessibilityLabel="Back" onPress={onBack} />
        <Text style={font.heading}>{g.name}</Text>
        <View style={{ width: 44 }} />
      </View>
      <FlatList
        data={list}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: insets.bottom + 32, width: contentWidth, alignSelf: 'center' }}
        ListHeaderComponent={<SceneView scene={g.scene} style={{ height: tablet ? 280 : 170 }} />}
        renderItem={({ item }) => (
          <Pressable onPress={() => onRead(item.id)} style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.98 }] }]} accessibilityLabel={`Read ${item.title}`}>
            <SceneView scene={{ ...item.pages[0].scene, motion: false }} style={tablet ? styles.thumbBig : styles.thumb} rounded={16} active={false} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={font.small} numberOfLines={2}>
                {item.blurb}
              </Text>
              <Text style={[font.small, { color: colors.accentDark, fontWeight: '700' }]}>{item.pages.length} pages · ▶ Read</Text>
            </View>
          </Pressable>
        )}
        ListFooterComponent={<Button title={`Make my own ${g.name.toLowerCase()} story`} kind="secondary" onPress={onBuild} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  card: { flexDirection: 'row', gap: 14, backgroundColor: colors.card, borderRadius: 22, padding: 10, alignItems: 'center' },
  thumb: { width: 104, height: 104 },
  thumbBig: { width: 160, height: 160 },
  title: { fontSize: 18, fontWeight: '800', color: colors.text },
});
