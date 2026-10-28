import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Button, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import CommunityPicker from '../components/CommunityPicker';
import ImageField from '../components/ImageField';
import PrivacyToggle from '../components/PrivacyToggle';
import TextField from '../components/TextField';
import { COMMUNITIES } from '../data/communities';
import type { EventFormInput, EventFormValues } from '../types/event';
import {
  eventSchema,
  TITLE_MIN_LENGTH,
  TITLE_MAX_LENGTH,
  SHORT_DESCRIPTION_MIN_LENGTH,
  SHORT_DESCRIPTION_MAX_LENGTH,
  LONG_DESCRIPTION_MIN_LENGTH,
  LONG_DESCRIPTION_MAX_LENGTH,
} from '../validation/schema';

export default function CreateEventScreen() {
  const [imageValid, setImageValid] = useState<boolean | null>(null);
  const { control, trigger, formState: { isValidating } } = useForm<EventFormInput, unknown, EventFormValues>({
    resolver: zodResolver(eventSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      image: null,
      title: '',
      shortDescription: '',
      longDescription: '',
      privacy: 'public',
      communities: [],
      invites: [],
    },
  });
  const privacy = useWatch({ control, name: 'privacy' });

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
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
                  void trigger('image');
                }}
                error={error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="title"
            render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
              <TextField
                label="Title"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                error={error?.message}
                maxLength={TITLE_MAX_LENGTH}
                placeholder="e.g. Nature walk at the park"
                helperText={`${TITLE_MIN_LENGTH}–${TITLE_MAX_LENGTH} characters.`}
              />
            )}
          />
          <Controller
            control={control}
            name="shortDescription"
            render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
              <TextField
                label="Short description"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                error={error?.message}
                maxLength={SHORT_DESCRIPTION_MAX_LENGTH}
                multiline
                placeholder="e.g. Join a relaxed walk and discover local wildlife."
                helperText={`${SHORT_DESCRIPTION_MIN_LENGTH}–${SHORT_DESCRIPTION_MAX_LENGTH} characters. English only.`}
              />
            )}
          />
          <Controller
            control={control}
            name="longDescription"
            render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
              <TextField
                label="Long description"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                error={error?.message}
                maxLength={LONG_DESCRIPTION_MAX_LENGTH}
                multiline
                placeholder="e.g. Meet at the park entrance at 10 am. Bring water, comfortable shoes and a hat."
                helperText={`${LONG_DESCRIPTION_MIN_LENGTH}–${LONG_DESCRIPTION_MAX_LENGTH} characters.`}
              />
            )}
          />
          <Controller
            control={control}
            name="privacy"
            render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
              <PrivacyToggle
                value={value ?? 'public'}
                onChange={(mode) => {
                  onChange(mode);
                  onBlur();
                }}
                error={error?.message}
              />
            )}
          />
          {privacy === 'public' ? (
            <Controller
              control={control}
              name="communities"
              render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                <CommunityPicker
                  value={value}
                  options={COMMUNITIES}
                  onChange={(communities) => {
                    onChange(communities);
                    onBlur();
                  }}
                  error={error?.message}
                />
              )}
            />
          ) : (
            <View key="invites" testID="invites-placeholder" />
          )}
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  scroll: { flex: 1 },
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
});
