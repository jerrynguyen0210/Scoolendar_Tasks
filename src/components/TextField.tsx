import { StyleSheet, Text, TextInput, View } from 'react-native';

export type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  onFocus?: () => void;
  onEditingLayoutChange?: () => void;
  error?: string;
  maxLength?: number;
  multiline?: boolean;
  placeholder?: string;
  helperText?: string;
};

export default function TextField({
  label, value, onChange, onBlur, onFocus, onEditingLayoutChange, error, maxLength,
  multiline = false, placeholder, helperText,
}: TextFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputBox, error ? styles.invalid : undefined]}>
        <TextInput
          accessibilityLabel={label}
          accessibilityHint={helperText}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          onSelectionChange={onEditingLayoutChange}
          onContentSizeChange={onEditingLayoutChange}
          scrollEnabled={multiline}
          maxLength={maxLength}
          multiline={multiline}
          placeholder={placeholder}
          placeholderTextColor="#767676"
          textAlignVertical={multiline ? 'top' : 'center'}
          style={[styles.input, multiline && styles.multiline]}
        />
        {maxLength !== undefined && (
          <Text
            style={styles.counter}
            accessibilityLabel={`${label}: ${value.length} of ${maxLength} characters`}
          >
            {value.length}/{maxLength}
          </Text>
        )}
      </View>
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
      ) : null}
      {!!helperText && <Text style={styles.helper}>{helperText}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: 'stretch', gap: 6 },
  label: { fontSize: 16, fontWeight: '600', color: '#222' },
  inputBox: {
    borderWidth: 1, borderColor: '#767676', borderRadius: 8,
    backgroundColor: '#fff', overflow: 'hidden',
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 16,
    color: '#222', backgroundColor: '#fff',
  },
  multiline: { height: 120 },
  invalid: { borderColor: '#b00020' },
  counter: { alignSelf: 'flex-end', paddingHorizontal: 12, paddingBottom: 10, color: '#555', fontSize: 14 },
  helper: { color: '#555', fontSize: 14 },
  error: { color: '#b00020', fontSize: 14 },
});
