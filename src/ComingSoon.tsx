import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from './theme';
import { AvatarView } from './AvatarView';

// "Under construction" teaser for features that aren't built yet (AI story writing).
// Deliberately not tappable: App Review rejects buttons that lead nowhere (guideline 2.1).
export function ComingSoon({ title, body, style }: { title: string; body: string; style?: ViewStyle }) {
  return (
    <View style={[styles.card, style]} accessible accessibilityLabel={`Coming soon. ${title}. ${body}`}>
      <Tape />
      <View style={styles.inner}>
        <AvatarView look={{ kind: 'cone' }} size={52} />
        <View style={{ flex: 1, gap: 2 }}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>COMING SOON</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
        </View>
      </View>
      <Tape />
    </View>
  );
}

// Yellow-and-black hazard stripes
function Tape() {
  return (
    <View style={styles.tape}>
      {Array.from({ length: 40 }, (_, i) => (
        <View key={i} style={styles.stripe} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF6D6', borderRadius: 20, overflow: 'hidden' },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  emoji: { fontSize: 40 },
  pill: { alignSelf: 'flex-start', backgroundColor: colors.text, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  pillText: { color: colors.sun, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  title: { fontSize: 17, fontWeight: '800', color: colors.text },
  body: { fontSize: 14, color: colors.muted },
  tape: { height: 10, flexDirection: 'row', backgroundColor: colors.sun, overflow: 'hidden' },
  stripe: { width: 10, height: 30, marginLeft: 14, marginTop: -10, backgroundColor: colors.text, transform: [{ rotate: '45deg' }] },
});
