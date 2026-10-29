# Create Event Form

An Expo/React Native event form built with TypeScript, React Hook Form, and Zod.
Supports image selection, public communities, and private email invites.

## Setup and run

### Manual setup

With Node.js installed (22.18+ within the 22.x release line), run from the repository root:

```bash
npm ci
npm start
```

Scan the QR code with Expo Go (SDK 58) on the same network. An Expo account is
optional for local development; run `npx expo login` only if your setup asks
for it. Alternatively, run `npm run ios` (macOS with Xcode) / `npm run android`
(configured Android emulator or connected device).
Install mobile apps and native development tools separately. No `.env` or backend
configuration is required.

### Fresh-device setup (optional)

On macOS or Linux (Windows: use WSL), the setup script can install Node.js/npm for you:

```bash
bash scripts/setup.sh
```

It reuses working Node.js/npm installations or installs Node.js 22 and compatible
npm through nvm, then installs dependencies and runs all checks. Requires Bash,
internet access, and `curl` when installing nvm. A new nvm installation updates
your Bash/Zsh profile; open a new terminal to use Node there, then run `npm start`. Add `--start` to also launch Expo after setup.

## Form rules

| Field | Requirement |
| --- | --- |
| Image | Required; choose, replace, or remove a photo |
| Title | 3–80 characters |
| Short description | 10–200 characters; printable ASCII and line breaks only |
| Long description | 20–2000 characters |
| Privacy | Select Public or Private |
| Public communities | Optional; none selected means visible to everyone |
| Private invites | 1–20 valid, unique email addresses |

Invites support saved-email shortcuts and bulk paste separated by commas,
semicolons, or whitespace. Invalid, duplicate, and excess entries are skipped
with feedback. Email comparisons ignore case and surrounding whitespace.

Submission normalizes invite emails,
simulates a 500 ms request, logs the payload, shows success, and resets the form.
The submit button is disabled during validation and submission.

Permission denial shows “Allow photo access to add an image”, with an **Open Settings** button when permission cannot be requested again; picker failures show a retry message.

## Decisions

- **Stack:** Expo with TypeScript for straightforward native setup and typed code;
  React Hook Form with Zod for form state and centralized schema validation.
- **Navigation/UI:** No navigation library for a single screen; plain React Native
  components without a UI kit keep dependencies and styling simple.
- **Privacy:** Starts unselected to require an explicit choice. Both lists are
  preserved when switching; only the active list is validated and sent.
- **Communities:** Optional for public events. Selecting none means the event is
  visible to everyone; selecting some targets those communities. Private events
  hide communities and leave them out of the payload.
- **Validation:** First blur, then change, to avoid premature errors while giving
  immediate correction feedback. Image changes validate immediately.
- **Images:** Request compression at `quality: 0.8` to balance quality and size;
  this does not enforce a file-size limit.
- **Lengths:** After trimming, title 3–80, short description 10–200, and long
  description 20–2000 characters balance useful detail with concise input.
  Limits live in [`src/validation/schema.ts`](src/validation/schema.ts).

## Payload examples

Public events include `communities` (an empty array means visible to everyone) and omit `invites`:

```json
{
  "image": { "uri": "file:///photo.jpg", "mimeType": "image/jpeg", "fileName": "photo.jpg" },
  "title": "Park picnic",
  "shortDescription": "Join our picnic.",
  "longDescription": "Bring a blanket and lunch to the park.",
  "privacy": "public",
  "communities": ["nature-explorers"]
}
```

Private events include normalized `invites` and omit `communities`:

```json
{
  "image": { "uri": "file:///photo.jpg", "mimeType": "image/jpeg", "fileName": "photo.jpg" },
  "title": "Park picnic",
  "shortDescription": "Join our picnic.",
  "longDescription": "Bring a blanket and lunch to the park.",
  "privacy": "private",
  "invites": ["guest@example.com"]
}
```

## Project structure

- `src/components/` — Form fields, image picker, privacy toggle, and audience selectors.
- `src/data/` — Mock communities and saved email addresses.
- `src/screens/` — Create-event screen and form submission flow.
- `src/types/` — Shared event, form, and payload types.
- `src/utils/` — Invite-email processing and payload conversion.
- `src/validation/` — Zod schemas and validation limits.

## Checks

```bash
npm run typecheck
npm run test:validation
npm run test:submit
```

Tests cover schema boundaries, privacy rules, email additions, payload conversion,
and submission callbacks/state. Nonzero exit status indicates failure; the
validation suite also prints `FAIL` for intentionally rejected samples.

### Manual device / integration testing

Use [Create-Event-Form-Device-Tests-Result.xlsx](test/Create-Event-Form-Device-Tests-Result.xlsx)
to run and record manual integration tests on a device or simulator. The workbook
covers setup, image permissions, field validation, privacy switching, communities,
invites, submission, keyboard/layout behaviour, and accessibility. It is a manual
test checklist and results log; the npm test commands do not execute its cases or
update the workbook. Submission uses the app's simulated request.

1. Run the checks above, then `npm start` and open the app in Expo Go.
2. Open the workbook in Excel. In **Summary**, fill in the test-run details:
   tester, device, OS, Expo Go and Node.js versions, commit SHA/tag, and test date.
3. In **Test Cases**, follow each row's **Preconditions** and **Steps**, then
   compare the app's behaviour with **Expected result**. Keep the Metro console
   available for cases that inspect the submitted payload.
4. Record **Actual result**, **Device/OS**, **Tested on**, and any **Notes / bug link**.
   Set **Status** to `Pass`, `Fail`, `Blocked`, `Not run`, or `N/A`; explain blocked
   or non-applicable cases in the notes. Leave untested cases as `Not run`.
5. Record failures in **Bugs**, including the linked test ID, reproduction steps,
   severity, and status. After a fix, record the fix commit and rerun the case.
6. Review **Summary**, whose formulas calculate status counts and pass rates,
   and save the workbook. Check remaining `Not run` and `Blocked` cases before
   treating the test run as complete.

## Tested on

- Device: IOS simulator - Iphone 16 pro / physical device iphone 13
- Expo Go: 58.1.15
- Node.js: v26.12.1

## Limitations

- Communities and saved emails are mock data. Community IDs are not validated
  against the options list.
- No backend: events are not persisted, invitations are not sent, and images are
  not uploaded. Payloads contain local image URIs and metadata only.
- Node tests do not render the UI. Verify photo permissions, keyboard scrolling,
  privacy switching, success/reset behavior, and accessibility on a device or simulator.
- Native photo-permission configuration is in `app.json`; rebuild native apps
  after changing it.
