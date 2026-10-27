import type { z } from "zod";
import type { eventSchema, imageSchema } from "../validation/schema";

export type Privacy = "public" | "private";

export type EventImage = z.infer<typeof imageSchema>;

export type Community = {
  id: string;
  name: string;
};

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
