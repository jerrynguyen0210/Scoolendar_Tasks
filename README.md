# Create Event Form

An Expo/React Native event form built with TypeScript, React Hook Form, and Zod.
Supports image selection, public communities, and private email invites.

## Setup and run

From the repository root on macOS or Linux (Windows: use WSL):

```bash
bash scripts/setup.sh
```

Setup reuses working Node.js/npm installations, or installs Node.js 22 and a
compatible npm version through nvm if either is missing or unusable. It then
installs locked dependencies and runs all checks. Requires Bash,
internet access, and `curl` when installing nvm. A new nvm installation updates
your Bash/Zsh profile; open a new terminal to use Node there.
After logging in, use `bash scripts/setup.sh --start` to also start Expo on future runs.

For manual setup, use Node.js 22.18+ within the 22.x release line:

```bash
npm ci
npx expo login
npm start
```

Log in to your Expo account in a compatible Expo Go app before scanning the QR
code. Alternatively, run `npm run ios` (macOS with Xcode) / `npm run android`
(configured Android emulator or connected device).
Install mobile apps and native development tools separately. No `.env` or backend
configuration is required.

## Form rules

| Field | Requirement |
| --- | --- |
| Image | Required; choose, replace, or remove a photo |
| Title | 3–80 characters |
| Short description | 10–200 characters; printable ASCII and line breaks only |
| Long description | 20–2000 characters |
| Privacy | Select Public or Private |
| Public communities | Select at least one community |
| Private invites | 1–20 valid, unique email addresses |

Text lengths apply after trimming. Text fields validate on first blur, then on
change. Image changes validate immediately. Rules live in
[`src/validation/schema.ts`](src/validation/schema.ts).

Invites support saved-email shortcuts and bulk paste separated by commas,
semicolons, or whitespace. Invalid, duplicate, and excess entries are skipped
with feedback. Email comparisons ignore case and surrounding whitespace.

Switching privacy preserves both lists, validates only the active list, and
includes only that list in the payload. Submission normalizes invite emails,
simulates a 500 ms request, logs the payload, shows success, and resets the form.
The submit button is disabled during validation and submission.

## Checks

```bash
npm run typecheck
npm run test:validation
npm run test:submit
```

Tests cover schema boundaries, privacy rules, email additions, payload conversion,
and submission callbacks/state. Nonzero exit status indicates failure; the
validation suite also prints `FAIL` for intentionally rejected samples.

## Limitations

- Communities and saved emails are mock data. Community IDs are not validated
  against the options list.
- No backend: events are not persisted, invitations are not sent, and images are
  not uploaded. Payloads contain local image URIs and metadata only.
- Node tests do not render the UI. Verify photo permissions, keyboard scrolling,
  privacy switching, success/reset behavior, and accessibility on a device or simulator.
- Native photo-permission configuration is in `app.json`; rebuild native apps
  after changing it.
