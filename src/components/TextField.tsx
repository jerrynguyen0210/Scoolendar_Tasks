import { type ComponentRef, useRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  onFocus?: (input: ComponentRef<typeof TextInput>) => void;
  error?: string;
  maxLength?: number;
  multiline?: boolean;
  placeholder?: string;
  helperText?: string;
};

export default function TextField({
  label, value, onChange, onBlur, onFocus, error, maxLength,
  multiline = false, placeholder, helperText,
}: TextFieldProps) {
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={inputRef}
        onFocus={() => {
          if (inputRef.current) onFocus?.(inputRef.current);
        }}
        accessibilityLabel={label}
        accessibilityHint={error || helperText}
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        maxLength={maxLength}
        multiline={multiline}
        placeholder={placeholder}
        placeholderTextColor="#767676"
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.input, multiline && styles.multiline, error ? styles.invalid : undefined]}
      />
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
      ) : null}
      {maxLength !== undefined && (
        <Text
          style={styles.counter}
          accessibilityLabel={`${label}: ${value.length} of ${maxLength} characters`}
        >
          {value.length}/{maxLength}
        </Text>
      )}
      {!!helperText && <Text style={styles.helper}>{helperText}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: 'stretch', gap: 6 },
  label: { fontSize: 16, fontWeight: '600', color: '#222' },
  input: {
    minHeight: 48, borderWidth: 1, borderColor: '#767676', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 16,
    color: '#222', backgroundColor: '#fff',
  },
  multiline: { minHeight: 120 },
  invalid: { borderColor: '#b00020' },
  counter: { alignSelf: 'flex-end', color: '#555', fontSize: 14 },
  helper: { color: '#555', fontSize: 14 },
  error: { color: '#b00020', fontSize: 14 },
});
