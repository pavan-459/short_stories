import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { deletePicture, newPage, Page, pictureUri, savePicture, Story } from '../storage';
import { SceneView } from '../Scene';
import { Button, IconButton } from '../ui';
import { useLayout } from '../layout';
import { colors, font } from '../theme';

const MAX_PAGES = 30;

export function Editor({
  story,
  onChange,
  onRead,
  onClose,
}: {
  story: Story;
  onChange: (patch: Partial<Story>) => void;
  onRead: () => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { contentWidth } = useLayout();
  const pages = story.pages;

  const setPages = (next: Page[]) => onChange({ pages: next });
  const updatePage = (id: string, patch: Partial<Page>) => setPages(pages.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const pick = async (page: Page, source: 'camera' | 'library') => {
    const perm =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        source === 'camera' ? 'Camera is off' : 'Photos are off',
        'You can turn access on for Storypop in the Settings app.',
      );
      return;
    }
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.7 };
    const result = source === 'camera' ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    if (result.canceled || !result.assets?.[0]) return;
    try {
      const name = await savePicture(result.assets[0].uri);
      deletePicture(page.image);
      updatePage(page.id, { image: name });
    } catch {
      Alert.alert("Couldn't save that picture", 'Please try another one.');
    }
  };

  const choosePicture = (page: Page) =>
    Alert.alert('Add a picture', undefined, [
      { text: 'Take a photo', onPress: () => pick(page, 'camera') },
      { text: 'Choose from photos', onPress: () => pick(page, 'library') },
      ...(page.image
        ? [{ text: 'Remove picture', style: 'destructive' as const, onPress: () => (deletePicture(page.image), updatePage(page.id, { image: null })) }]
        : []),
      { text: 'Cancel', style: 'cancel' as const },
    ]);

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= pages.length) return;
    const next = [...pages];
    [next[i], next[j]] = [next[j], next[i]];
    setPages(next);
  };

  const remove = (page: Page) =>
    Alert.alert('Delete this page?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deletePicture(page.image);
          const next = pages.filter((p) => p.id !== page.id);
          setPages(next.length ? next : [newPage()]);
        },
      },
    ]);

  const hasContent = pages.some((p) => p.image || p.scene || p.text.trim());

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.toolbar, { paddingTop: insets.top + 8 }]}>
        <IconButton label="‹" accessibilityLabel="Back to library" onPress={onClose} />
        <Text style={font.heading}>Make a story</Text>
        <Button title="▶ Read" kind="chip" onPress={onRead} disabled={!hasContent} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40, width: Math.min(contentWidth, 640), alignSelf: 'center' }]} keyboardShouldPersistTaps="handled">
        <TextInput
          value={story.title}
          onChangeText={(title) => onChange({ title })}
          placeholder="Story title"
          placeholderTextColor={colors.muted}
          style={styles.title}
          maxLength={60}
        />
        <TextInput
          value={story.author}
          onChangeText={(author) => onChange({ author })}
          placeholder="Written by…"
          placeholderTextColor={colors.muted}
          style={styles.author}
          maxLength={40}
        />

        {pages.map((page, i) => (
          <View key={page.id} style={styles.pageCard}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageNum}>Page {i + 1}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <IconButton label="↑" accessibilityLabel="Move page up" onPress={() => move(i, -1)} disabled={i === 0} style={styles.small} />
                <IconButton label="↓" accessibilityLabel="Move page down" onPress={() => move(i, 1)} disabled={i === pages.length - 1} style={styles.small} />
                <IconButton label="✕" accessibilityLabel="Delete page" onPress={() => remove(page)} style={styles.small} />
              </View>
            </View>

            <Pressable onPress={() => choosePicture(page)} style={[styles.picture, { backgroundColor: story.color }]} accessibilityLabel="Add or change picture">
              {page.image ? (
                <Image source={{ uri: pictureUri(page.image) }} style={StyleSheet.absoluteFill} />
              ) : page.scene ? (
                <>
                  <SceneView scene={page.scene} active={false} rounded={0} showReplay={false} style={StyleSheet.absoluteFill} />
                  <Text style={styles.swap}>Tap to use a photo instead</Text>
                </>
              ) : (
                <>
                  <Text style={[font.body, { fontWeight: '700', marginTop: 4 }]}>Add a picture</Text>
                </>
              )}
            </Pressable>

            <TextInput
              value={page.text}
              onChangeText={(text) => updatePage(page.id, { text })}
              placeholder={i === 0 ? 'Once upon a time…' : 'What happens next?'}
              placeholderTextColor={colors.muted}
              multiline
              maxLength={400}
              style={styles.text}
            />
          </View>
        ))}

        <Button
          title="＋  Add a page"
          kind="secondary"
          onPress={() => setPages([...pages, newPage()])}
          disabled={pages.length >= MAX_PAGES}
          style={{ marginTop: 4 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  scroll: { padding: 16, gap: 16 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, paddingVertical: 6 },
  author: { fontSize: 18, color: colors.text, paddingVertical: 4, marginTop: -8 },
  pageCard: { backgroundColor: colors.card, borderRadius: 24, padding: 14, gap: 12 },
  pageHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pageNum: { fontSize: 16, fontWeight: '800', color: colors.muted },
  small: { width: 36, height: 36, borderRadius: 18 },
  picture: {
    aspectRatio: 4 / 3,
    borderRadius: 18,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swap: {
    position: 'absolute',
    bottom: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
    color: '#fff',
    fontWeight: '700',
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    fontSize: 20,
    lineHeight: 28,
    color: colors.text,
    minHeight: 84,
    textAlignVertical: 'top',
    borderWidth: 2,
    borderColor: colors.track,
    borderRadius: 16,
    padding: 12,
  },
});
