import { emailSchema, MAX_INVITES } from '../validation/schema.ts';

export function addInviteEmails(value: readonly string[], input: string) {
  const emails = [...value];
  const seen = new Set(value.map((email) => email.trim().toLowerCase()));
  const skipped: string[] = [];
  const candidates = input.trim().split(/[,\s]+/).filter(Boolean);

  for (const candidate of candidates) {
    const email = candidate.toLowerCase();
    if (!emailSchema.safeParse(email).success) {
      skipped.push(`${candidate} (invalid email)`);
    } else if (seen.has(email)) {
      skipped.push(`${candidate} (already invited)`);
    } else if (emails.length >= MAX_INVITES) {
      skipped.push(`${candidate} (limit of ${MAX_INVITES} invites reached)`);
    } else {
      emails.push(email);
      seen.add(email);
    }
  }

  return {
    emails,
    error: candidates.length === 0
      ? 'Enter a valid email address'
      : skipped.length > 0 ? `Skipped: ${skipped.join('; ')}` : null,
  };
}
