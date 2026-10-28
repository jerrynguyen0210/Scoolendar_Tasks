import { useState } from 'react';
import { Button, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { addInviteEmails } from '../utils/addInviteEmails';

export type InviteListProps = {
  value: readonly string[];
  onChange: (value: string[]) => void;
  error?: string;
  itemErrors?: Readonly<Partial<Record<number, string>>>;
  savedEmails: readonly string[];
};

export default function InviteList({ value, onChange, error, itemErrors, savedEmails }: InviteListProps) {
  const [draft, setDraft] = useState('');
  const [draftError, setDraftError] = useState<string | null>(null);

  const addEmail = (candidate: string): boolean => {
    const result = addInviteEmails(value, candidate);
    setDraftError(result.error);
    if (result.emails.length === value.length) return false;
    onChange(result.emails);
    return true;
  };

  const addDraft = () => {
    if (addEmail(draft)) setDraft('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Invites</Text>
      <TextInput
        accessibilityLabel="Email address to invite"
        value={draft}
        onChangeText={(text) => {
          setDraft(text);
          setDraftError(null);
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={addDraft}
        placeholder="e.g. guest@example.com"
        placeholderTextColor="#767676"
        style={[styles.input, !!draftError && styles.invalid]}
      />
      {!!draftError && <Text accessibilityRole="alert" style={styles.error}>{draftError}</Text>}
      <Button title="Add" accessibilityLabel="Add invite email" onPress={addDraft} />
      {savedEmails.length > 0 && (
        <>
          <Text style={styles.label}>Saved emails</Text>
          <View style={styles.chips}>
            {savedEmails.map((email) => {
              const added = value.some((existing) =>
                existing.trim().toLowerCase() === email.trim().toLowerCase());
              return (
                <Pressable
                  key={email}
                  accessibilityRole="button"
                  accessibilityLabel={added ? `${email}, already added` : `Add ${email}`}
                  accessibilityState={{ disabled: added }}
                  disabled={added}
                  onPress={() => { addEmail(email); }}
                  style={({ pressed }) => [styles.chip, added && styles.addedChip, pressed && styles.pressed]}
                >
                  <Text style={styles.chipText}>{email}{added ? ' (Added)' : ''}</Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}
      {value.map((email, index) => (
        <View key={email}>
          <View style={styles.row}>
            <Text style={styles.email}>{email}</Text>
            <Button
              title="Remove"
              accessibilityLabel={`Remove ${email}`}
              onPress={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
            />
          </View>
          {!!itemErrors?.[index] && (
            <Text accessibilityRole="alert" style={styles.error}>{itemErrors[index]}</Text>
          )}
        </View>
      ))}
      {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: 'stretch', gap: 8 },
  label: { fontSize: 16, fontWeight: '600', color: '#222' },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#767676',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#222',
    backgroundColor: '#fff',
  },
  invalid: { borderColor: '#b00020' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: 48,
    maxWidth: '100%',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#767676',
    borderRadius: 24,
    backgroundColor: '#fff',
  },
  addedChip: { backgroundColor: '#e8e8e8' },
  chipText: { color: '#222', fontSize: 14 },
  pressed: { opacity: 0.7 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48 },
  email: { flex: 1, color: '#222', fontSize: 16 },
  error: { color: '#b00020', fontSize: 14 },
});
