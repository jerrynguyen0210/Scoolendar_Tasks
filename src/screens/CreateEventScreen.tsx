import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, StyleSheet, Text, View } from 'react-native';

import ImageField from '../components/ImageField';
import type { EventFormInput, EventFormValues } from '../types/event';
import { eventSchema } from '../validation/schema';

export default function CreateEventScreen() {
  const [imageValid, setImageValid] = useState<boolean | null>(null);
  const { control, trigger, formState: { isValidating } } = useForm<EventFormInput, unknown, EventFormValues>({
    resolver: zodResolver(eventSchema),
    mode: 'onChange',
    defaultValues: {
      image: null,
      title: '',
      shortDescription: '',
      longDescription: '',
      communities: [],
      invites: [],
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create event</Text>
      <Controller
        control={control}
        name="image"
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <ImageField
            value={value}
            onChange={(image) => {
              setImageValid(null);
              onChange(image);
            }}
            error={error?.message}
          />
        )}
      />
      <Button
        title="Validate"
        accessibilityLabel="Validate event image"
        disabled={isValidating}
        onPress={async () => setImageValid(await trigger('image'))}
      />
      {imageValid !== null && (
        <Text accessibilityLiveRegion="polite">
          {imageValid ? 'Image validation passed.' : 'Image validation failed.'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
});
