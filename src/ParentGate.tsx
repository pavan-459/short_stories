import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Button } from './ui';
import { AvatarView } from './AvatarView';
import { colors, font } from './theme';

// Apple's Kids guidelines (1.3) and Google's Families policy want anything that leaves the app
// (sharing, links, purchases) behind a gate a young child can't pass. Numbers are written as
// words so pre-readers can't just guess digits.
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

function makeQuestion() {
  const a = 3 + Math.floor(Math.random() * 7);
  const b = 3 + Math.floor(Math.random() * 7);
  return { text: `${WORDS[a]} times ${WORDS[b]}`, answer: a * b };
}

export function ParentGate({
  visible,
  reason,
  onPass,
  onCancel,
}: {
  visible: boolean;
  reason: string;
  onPass: () => void;
  onCancel: () => void;
}) {
  const [q, setQ] = useState(makeQuestion);
  const [value, setValue] = useState('');
  const [wrong, setWrong] = useState(false);

  useEffect(() => {
    if (visible) {
      setQ(makeQuestion());
      setValue('');
      setWrong(false);
    }
  }, [visible]);

  const check = () => {
    if (Number(value) === q.answer) {
      onPass();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setWrong(true);
      setValue('');
      setQ(makeQuestion());
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.card}>
          <View style={{ alignItems: 'center' }}>
            <AvatarView look={{ kind: 'owl' }} size={72} />
          </View>
          <Text style={[font.heading, { textAlign: 'center' }]}>Grown-ups only</Text>
          <Text style={[font.small, { textAlign: 'center', marginTop: 6 }]}>{reason}</Text>
          <Text style={[font.body, styles.question]}>What is {q.text}?</Text>
          <TextInput
            value={value}
            onChangeText={(t) => setValue(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            maxLength={3}
            autoFocus
            onSubmitEditing={check}
            style={styles.input}
            accessibilityLabel="Answer"
          />
          {wrong && <Text style={styles.wrong}>Not quite. Try this one.</Text>}
          <Button title="Continue" onPress={check} disabled={!value} style={{ marginTop: 12 }} />
          <Button title="Cancel" kind="ghost" onPress={onCancel} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(30,20,45,0.5)', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: colors.card, borderRadius: 28, padding: 24, width: '100%', maxWidth: 440, alignSelf: 'center' },
  emoji: { fontSize: 40, textAlign: 'center', marginBottom: 6 },
  question: { textAlign: 'center', marginTop: 20, fontWeight: '700' },
  input: {
    marginTop: 12,
    borderWidth: 2,
    borderColor: colors.track,
    borderRadius: 16,
    fontSize: 28,
    textAlign: 'center',
    paddingVertical: 10,
    color: colors.text,
  },
  wrong: { color: colors.danger, textAlign: 'center', marginTop: 8 },
});
