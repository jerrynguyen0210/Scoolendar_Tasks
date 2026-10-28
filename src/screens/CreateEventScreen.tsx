import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm, useWatch, type SubmitErrorHandler } from 'react-hook-form';
import { Alert, Button, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import CommunityPicker from '../components/CommunityPicker';
import ImageField from '../components/ImageField';
import InviteList from '../components/InviteList';
import PrivacyToggle from '../components/PrivacyToggle';
import TextField from '../components/TextField';
import { COMMUNITIES, SAVED_EMAILS } from '../data/communities';
import type { EventFormInput, EventFormValues } from '../types/event';
import { toPayload } from '../utils/toPayload';
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
  const [successMessage, setSuccessMessage] = useState('');
  const [validationSummary, setValidationSummary] = useState('');
  const { control, trigger, clearErrors, handleSubmit, reset, formState: { isSubmitting, isValidating, errors } } = useForm<EventFormInput, unknown, EventFormValues>({
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
  const onInvalid: SubmitErrorHandler<EventFormInput> = (fieldErrors) => {
    const count = Object.keys(fieldErrors).length;
    const message = `Please fix ${count} ${count === 1 ? 'field' : 'fields'}`;
    setValidationSummary(message);
    Alert.alert('Check your event', message, [{ text: 'OK' }]);
  };
  const onSubmit = async (values: EventFormValues): Promise<void> => {
    const payload = toPayload(values);
    await new Promise<void>((resolve) => setTimeout(resolve, 500));
    console.log('Event payload:', payload);
    reset();
    setSuccessMessage('Event created');
    Alert.alert('Success', 'Event created successfully', [{ text: 'OK' }]);
  };

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
                  clearErrors(['communities', 'invites']);
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
            <Controller
              control={control}
              name="invites"
              render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                <InviteList
                  value={value}
                  savedEmails={SAVED_EMAILS}
                  onChange={(invites) => {
                    onChange(invites);
                    onBlur();
                  }}
                  error={error?.message}
                  itemErrors={Object.fromEntries(value.flatMap((_, index) => {
                    const message = errors.invites?.[index]?.message;
                    return message ? [[index, message]] : [];
                  }))}
                />
              )}
            />
          )}
          <Button
            title={isSubmitting ? 'Creating…' : 'Submit'}
            accessibilityLabel={isSubmitting ? 'Creating event' : 'Submit event'}
            disabled={isSubmitting || isValidating}
            onPress={() => {
              setSuccessMessage('');
              setValidationSummary('');
              void handleSubmit(onSubmit, onInvalid)();
            }}
          />
          <Text accessibilityLiveRegion="polite">{successMessage}</Text>
          <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>
            {validationSummary}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  error: { color: '#b00020', fontSize: 14 },
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
