# Create Event Form

## Image picker configuration

Expo Go includes the image picker. Native development and production builds use
the `expo-image-picker` plugin in `app.json` to set the iOS photo-permission
message: "Allow photo access to add an image to your event." Rebuild the native
app after changing this configuration; restarting Metro does not apply it.

The picker uses `quality: 0.8` to request compression on Android and iOS,
balancing image quality and file size for future uploads. This is not a file-size
limit and does not guarantee a smaller file; iOS ignores it for PNG and BMP
images. The form currently stores the image URI and metadata, not image bytes.

The text fields use `mode: 'onBlur'` and `reValidateMode: 'onBlur'`. Each
`Controller` passes its `onBlur` handler through `TextField` to the native input,
so validation errors appear when the user leaves a field, rather than on the
first keystroke. Corrections are checked again on blur, including after submission.

Image changes explicitly trigger image validation for immediate feedback. Tapping
Remove sets the image to `null` and immediately shows "Please add an image",
because an event image is required.

## Validation

Run the TypeScript check at the end of every implementation step:

```bash
npm run typecheck
```

This checks for TypeScript errors without generating JavaScript files. A step is complete when this check passes.

Run the validation and payload regression checks from the project directory:

```bash
npm run test:validation
```

This script requires Node.js 22.18+ (or a newer major version with native
TypeScript type stripping enabled by default), because it imports `.ts` source
files directly. Node.js 22.6–22.17 requires the experimental flag instead:

```bash
node --experimental-strip-types test/scratch-validation.mjs
```

The script prints validation results, asserts the expected behavior, and exits
with a nonzero status if an expectation fails. A printed `FAIL` means that sample
was rejected by the schema; expected rejections are successful test cases.

### Text length limits

Limits apply after trimming leading and trailing whitespace. The named constants
at the top of `src/validation/schema.ts` define both the rules and their error
messages. Keep this table in sync when changing those constants.

| Field | Minimum characters | Maximum characters | Schema constants |
| --- | --- | --- | --- |
| `title` | 3 | 80 | `TITLE_MIN_LENGTH`, `TITLE_MAX_LENGTH` |
| `shortDescription` | 10 | 200 | `SHORT_DESCRIPTION_MIN_LENGTH`, `SHORT_DESCRIPTION_MAX_LENGTH` |
| `longDescription` | 20 | 2000 | `LONG_DESCRIPTION_MIN_LENGTH`, `LONG_DESCRIPTION_MAX_LENGTH` |

### Public communities

Public events require at least one selected community (`MIN_COMMUNITIES`). An
empty selection reports "Choose at least 1 community" on `communities`.
Private events skip this check, keeping community selections for switching back.

### Private invites

Private events require 1–20 invites (`MIN_INVITES` and `MAX_INVITES`). Each
invite must be a valid email address; format errors attach to `invites[index]`.
Public events skip invite count and email checks, so old invite entries do not
block submission. Both modes retain plain string arrays in the form state.
Emails are trimmed before validation. `toPayload` trims and lowercases private
invite emails without changing the form values.
Private invite duplicates are rejected in `superRefine`, comparing trimmed,
lowercase addresses. Each repeated entry gets an error at its own list index.
`InviteList` is currently a placeholder; duplicate blocking when adding an email
can be added when its UI is implemented.

## Privacy switching

Switching between Public and Private keeps all form values, including selected
communities and invite emails. Switching back restores the previous entries so
users do not lose their work. `toPayload` includes only communities for public
events or invites for private events; the inactive side is omitted from the
payload without clearing it from the form.

## Keyboard handling

The form uses `KeyboardAvoidingView` and a `ScrollView` without custom input
measurement or manual scrolling. Automatic iOS keyboard insets stay disabled
to avoid applying keyboard spacing twice. Dragging the outer form dismisses the
keyboard. Device verification is still needed for switching fields and scrolling
inside a long multiline description.
