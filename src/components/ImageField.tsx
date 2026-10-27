import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Button, Image, StyleSheet, Text, View } from 'react-native';

import type { EventImage } from '../types/event';

type ImageFieldProps = {
  value: EventImage | null;
  onChange: (image: EventImage | null) => void;
  error?: string;
};

export default function ImageField({ value, onChange, error }: ImageFieldProps) {
  const [pickerError, setPickerError] = useState<string | null>(null);

  const pickImage = async () => {
    setPickerError(null);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setPickerError('Allow photo access to add an image');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
      });

      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) {
        setPickerError('No image was returned. Please try again.');
        return;
      }

      onChange({
        uri: asset.uri,
        mimeType: asset.mimeType ?? undefined,
        fileName: asset.fileName,
      });
    } catch {
      setPickerError('Unable to open photos. Please try choosing an image again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text>Event image</Text>
      {value ? (
        <>
          <Image
            source={{ uri: value.uri }}
            style={styles.preview}
            resizeMode="cover"
            accessibilityLabel="Selected event image"
          />
          <Button title="Change" accessibilityLabel="Change event image" onPress={pickImage} />
          <Button title="Remove" accessibilityLabel="Remove event image" onPress={() => onChange(null)} />
        </>
      ) : (
        <View style={styles.placeholder}>
          <Text>No image selected</Text>
          <Button title="Add image" accessibilityLabel="Add event image" onPress={pickImage} />
        </View>
      )}
      {pickerError && <Text accessibilityRole="alert" style={styles.error}>{pickerError}</Text>}
      {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: 'stretch', gap: 8 },
  preview: { width: '100%', aspectRatio: 16 / 9, borderRadius: 8 },
  placeholder: {
    width: '100%',
    minHeight: 200,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#767676',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  error: { color: '#b00020' },
});
