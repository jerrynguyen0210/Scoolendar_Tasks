import { zodResolver } from '@hookform/resolvers/zod';
import { type ComponentRef, useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import ImageField from '../components/ImageField';
import TextField from '../components/TextField';
import type { EventFormInput, EventFormValues } from '../types/event';
import { TITLE_MAX_LENGTH, SHORT_DESCRIPTION_MAX_LENGTH, LONG_DESCRIPTION_MAX_LENGTH, eventSchema } from '../validation/schema';

export default function CreateEventScreen() {
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const focusedInput = useRef<ComponentRef<typeof TextInput> | null>(null);
  const scrollOffset = useRef(0);
  const revealFocusedInput = useCallback(() => {
    const input = focusedInput.current;
    const scroll = scrollRef.current;
    if (!input?.isFocused() || !scroll) return;
    scroll.measureInWindow((_x, viewportY, _width, viewportHeight) => {
      input.measureInWindow((_inputX, inputY, _inputWidth, inputHeight) => {
        if (!input.isFocused() || viewportHeight <= 0) return;
        const bottomOverflow = inputY + inputHeight - (viewportY + viewportHeight - 16);
        const topOverflow = inputY - (viewportY + 16);
        const adjustment = topOverflow < 0 ? topOverflow : Math.max(0, bottomOverflow);
        if (adjustment !== 0) {
          scroll.scrollTo({ y: Math.max(0, scrollOffset.current + adjustment), animated: true });
        }
      });
    });
  }, []);
  const handleInputFocus = (input: ComponentRef<typeof TextInput>) => {
    focusedInput.current = input;
    requestAnimationFrame(revealFocusedInput);
  };

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      requestAnimationFrame(revealFocusedInput);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, [revealFocusedInput]);

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
      communities: [],
      invites: [],
    },
  });

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollRef}
          onLayout={revealFocusedInput}
          onScroll={(event) => { scrollOffset.current = event.nativeEvent.contentOffset.y; }}
          scrollEventThrottle={16}
          style={styles.scroll}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onScrollBeginDrag={Keyboard.dismiss}
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
                onFocus={handleInputFocus}
                error={error?.message}
                maxLength={TITLE_MAX_LENGTH}
                multiline={false}
                placeholder="Enter Title"
                helperText="3–80 characters."
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
                onFocus={handleInputFocus}
                error={error?.message}
                maxLength={SHORT_DESCRIPTION_MAX_LENGTH}
                multiline={true}
                placeholder="Enter Short description"
                helperText="English only"
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
                onFocus={handleInputFocus}
                error={error?.message}
                maxLength={LONG_DESCRIPTION_MAX_LENGTH}
                multiline={true}
                placeholder="Enter Long description"
                helperText="20–2000 characters."
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
        </ScrollView>
        {keyboardVisible ? (
          <View style={styles.keyboardToolbar}>
            <Button
              title="Hide keyboard"
              accessibilityLabel="Hide keyboard"
              onPress={Keyboard.dismiss}
            />
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  scroll: { flex: 1 },
  keyboardToolbar: {
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
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
