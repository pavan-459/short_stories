import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from './theme';

export function Button({
  title,
  onPress,
  kind = 'primary',
  style,
  disabled,
}: {
  title: string;
  onPress: () => void;
  kind?: 'primary' | 'secondary' | 'ghost' | 'chip';
  style?: ViewStyle;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        styles[kind],
        pressed && { transform: [{ scale: 0.96 }] },
        disabled && { opacity: 0.4 },
        style,
      ]}
    >
      <Text style={[styles.text, kind !== 'primary' && { color: colors.text }]}>{title}</Text>
    </Pressable>
  );
}

// Round icon button (emoji or short label), used in toolbars.
export function IconButton({
  label,
  onPress,
  accessibilityLabel,
  style,
  disabled,
}: {
  label: string;
  onPress: () => void;
  accessibilityLabel: string;
  style?: ViewStyle;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={8}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => [
        styles.icon,
        pressed && { transform: [{ scale: 0.9 }] },
        disabled && { opacity: 0.3 },
        style,
      ]}
    >
      <Text style={styles.iconText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 18, paddingVertical: 16, paddingHorizontal: 20, alignItems: 'center' },
  primary: { backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.card, borderWidth: 2, borderColor: colors.track },
  ghost: { backgroundColor: 'transparent' },
  chip: { backgroundColor: colors.card, borderWidth: 2, borderColor: colors.track, paddingVertical: 10 },
  text: { color: '#fff', fontSize: 18, fontWeight: '700' },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.track,
  },
  iconText: { fontSize: 20, color: colors.text, fontWeight: '700' },
});
