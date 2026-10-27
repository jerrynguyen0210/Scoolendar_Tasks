import type { EventFormValues, EventPayload } from "../types/event";

export function toPayload(values: EventFormValues): EventPayload {
  const { privacy, communities, invites, ...shared } = values;

  if (privacy === "public") {
    return { ...shared, privacy, communities };
  }

  return {
    ...shared,
    privacy,
    invites: invites.map((email) => email.trim().toLowerCase()),
  };
}
