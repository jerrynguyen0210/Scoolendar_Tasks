# Create Event Form

## Validation

Run the TypeScript check at the end of every implementation step:

```bash
npm run typecheck
```

This checks for TypeScript errors without generating JavaScript files. A step is complete when this check passes.

### Text length limits

Limits apply after trimming leading and trailing whitespace. The named constants
at the top of `src/validation/schema.ts` define both the rules and their error
messages. Keep this table in sync when changing those constants.

| Field | Minimum characters | Maximum characters | Schema constants |
| --- | --- | --- | --- |
| `title` | 3 | 80 | `TITLE_MIN_LENGTH`, `TITLE_MAX_LENGTH` |
| `shortDescription` | 10 | 200 | `SHORT_DESCRIPTION_MIN_LENGTH`, `SHORT_DESCRIPTION_MAX_LENGTH` |
| `longDescription` | 20 | 2000 | `LONG_DESCRIPTION_MIN_LENGTH`, `LONG_DESCRIPTION_MAX_LENGTH` |

### Private invites

Private events require 1–20 invites (`MIN_INVITES` and `MAX_INVITES`). Each
invite must be a valid email address; format errors attach to `invites[index]`.
Public events skip invite count and email checks, so old invite entries do not
block submission. Both modes retain plain string arrays in the form state.
