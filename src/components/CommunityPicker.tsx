import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Community } from '../types/event';

export type CommunityPickerProps = {
  value: readonly string[];
  onChange: (value: string[]) => void;
  error?: string;
  options: readonly Community[];
};

export default function CommunityPicker({ value, onChange, error, options }: CommunityPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Communities (optional)</Text>
      {options.map((community) => {
        const checked = value.includes(community.id);
        return (
          <Pressable
            key={community.id}
            accessibilityRole="checkbox"
            accessibilityLabel={community.name}
            accessibilityState={{ checked }}
            onPress={() => onChange(checked
              ? value.filter((id) => id !== community.id)
              : [...value, community.id])}
            style={({ pressed }) => [
              styles.option,
              checked && styles.selectedOption,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.optionText, checked && styles.selectedText]}>
              {community.name}
            </Text>
            {checked && <Text style={styles.selectedText}>Selected</Text>}
          </Pressable>
        );
      })}
      <Text style={styles.count} accessibilityLiveRegion="polite">
        {value.length === 0 ? 'None selected: visible to everyone' : `${value.length} selected`}
      </Text>
      {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: 'stretch', gap: 8 },
  label: { fontSize: 16, fontWeight: '600', color: '#222' },
  option: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#767676',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  selectedOption: { backgroundColor: '#2456a6', borderColor: '#2456a6' },
  optionText: { flex: 1, fontSize: 16, color: '#222' },
  selectedText: { color: '#fff' },
  pressed: { opacity: 0.7 },
  count: { color: '#555', fontSize: 14 },
  error: { color: '#b00020', fontSize: 14 },
});
