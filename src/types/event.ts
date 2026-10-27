export type Privacy = "public" | "private";

export type EventImage = {
  uri: string;
  mimeType?: string;
  fileName?: string | null;
};

export type Community = {
  id: string;
  name: string;
};

import type { z } from "zod";
import type { eventSchema } from "../validation/schema";

export type EventFormInput = z.input<typeof eventSchema>;
export type EventFormValues = z.infer<typeof eventSchema>;

type EventPayloadBase = Omit<
  EventFormValues,
  "privacy" | "communities" | "invites"
>;

export type EventPayload = EventPayloadBase & (
  | {
      privacy: "public";
      communities: EventFormValues["communities"];
      invites?: never;
    }
  | {
      privacy: "private";
      communities?: never;
      invites: EventFormValues["invites"];
    }
);
