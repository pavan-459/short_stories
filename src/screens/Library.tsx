import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { coverPicture, coverScene, displayTitle, pictureUri, Story } from '../storage';
import { SceneView } from '../Scene';
import { AvatarView } from '../AvatarView';
import { Button, IconButton } from '../ui';
import { cardWidth, useLayout } from '../layout';
import { colors, font } from '../theme';

export function Library({
  stories,
  onNew,
  onRead,
  onEdit,
  onDelete,
  onBack,
}: {
  stories: Story[];
  onBack: () => void;
  onNew: () => void;
  onRead: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const { contentWidth, columns } = useLayout();
  const coverW = cardWidth(contentWidth - 40, columns, 14);
  const sorted = [...stories].sort((a, b) => b.updatedAt - a.updatedAt);

  const openMenu = (s: Story) =>
    Alert.alert(displayTitle(s), undefined, [
      { text: 'Read', onPress: () => onRead(s.id) },
      { text: 'Edit', onPress: () => onEdit(s.id) },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Delete this story?', 'Its pages and pictures will be removed from this device.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => onDelete(s.id) },
          ]),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12, width: contentWidth, alignSelf: 'center' }]}>
      <View style={styles.header}>
        <IconButton label="‹" accessibilityLabel="Back" onPress={onBack} />
        <View>
          <Text style={font.title}>My stories</Text>
          <Text style={font.small}>Stories made by you</Text>
        </View>
      </View>

      {sorted.length === 0 ? (
        <View style={styles.empty}>
          <AvatarView look={{ kind: 'book' }} size={120} />
          <Text style={[font.heading, { textAlign: 'center' }]}>No stories yet</Text>
          <Text style={[font.body, styles.emptyText]}>
            Snap your own photos, write a line on each page, and turn it into a storybook. Stories you make or remix show up here too.
          </Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(s) => s.id}
          key={columns}
          numColumns={columns}
          columnWrapperStyle={{ gap: 14 }}
          contentContainerStyle={{ gap: 14, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <Cover width={coverW} story={item} onPress={() => onRead(item.id)} onLongPress={() => openMenu(item)} onEdit={() => onEdit(item.id)} />}
        />
      )}

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Button title="New photo story" onPress={onNew} />
      </View>
    </View>
  );
}

function Cover({
  width,
  story,
  onPress,
  onLongPress,
  onEdit,
}: {
  width: number;
  story: Story;
  onPress: () => void;
  onLongPress: () => void;
  onEdit: () => void;
}) {
  const pic = coverPicture(story);
  const scene = pic ? null : coverScene(story);
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [{ width }, pressed && { transform: [{ scale: 0.97 }] }]}
      accessibilityLabel={`Read ${displayTitle(story)}`}
    >
      <View style={[styles.coverArt, { backgroundColor: story.color }]}>
        {pic ? (
          <Image source={{ uri: pictureUri(pic) }} style={StyleSheet.absoluteFill} />
        ) : scene ? (
          <SceneView scene={{ ...scene, motion: false }} active={false} rounded={0} showReplay={false} style={StyleSheet.absoluteFill} />
        ) : (
          <AvatarView look={{ kind: 'book' }} size={80} />
        )}
        <Pressable onPress={onEdit} hitSlop={10} style={styles.editChip} accessibilityLabel="Edit story">
          <Text style={{ fontSize: 11, fontWeight: '800', color: colors.text }}>Edit</Text>
        </Pressable>
      </View>
      <Text numberOfLines={2} style={styles.coverTitle}>
        {displayTitle(story)}
      </Text>
      <Text style={font.small}>
        {story.pages.length} {story.pages.length === 1 ? 'page' : 'pages'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 100 },
  emptyArt: { fontSize: 72, marginBottom: 12 },
  emptyText: { textAlign: 'center', color: colors.muted, marginTop: 8, maxWidth: 300 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  coverArt: {
    aspectRatio: 3 / 4,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  editChip: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  footer: { position: 'absolute', left: 20, right: 20, bottom: 0 },
});
