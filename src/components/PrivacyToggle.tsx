import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Privacy } from '../types/event';

export type PrivacyToggleProps = {
  value: Privacy;
  onChange: (value: Privacy) => void;
  error?: string;
};

export default function PrivacyToggle({ value, onChange, error }: PrivacyToggleProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Privacy</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel="Privacy" style={styles.options}>
        {(['public', 'private'] as const).map((option) => {
          const selected = value === option;
          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityLabel={`${option === 'public' ? 'Public' : 'Private'} event`}
              accessibilityState={{ selected }}
              onPress={() => onChange(option)}
              style={({ pressed }) => [
                styles.option,
                selected && styles.selectedOption,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.optionText, selected && styles.selectedText]}>
                {option === 'public' ? 'Public' : 'Private'}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.helper}>
        {value === 'public'
          ? 'Shared with the selected communities.'
          : 'Invite only.'}
      </Text>
      {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: 'stretch', gap: 6 },
  label: { fontSize: 16, fontWeight: '600', color: '#222' },
  options: { flexDirection: 'row', gap: 8 },
  option: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#767676',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  selectedOption: { backgroundColor: '#2456a6', borderColor: '#2456a6' },
  optionText: { fontSize: 16, fontWeight: '600', color: '#222' },
  selectedText: { color: '#fff' },
  pressed: { opacity: 0.7 },
  helper: { color: '#555', fontSize: 14 },
  error: { color: '#b00020', fontSize: 14 },
});
