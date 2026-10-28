import { z } from "zod";

export const TITLE_MIN_LENGTH = 3;
export const TITLE_MAX_LENGTH = 80;
export const SHORT_DESCRIPTION_MIN_LENGTH = 10;
export const SHORT_DESCRIPTION_MAX_LENGTH = 200;
export const LONG_DESCRIPTION_MIN_LENGTH = 20;
export const LONG_DESCRIPTION_MAX_LENGTH = 2000;
export const MIN_COMMUNITIES = 1;
export const MIN_INVITES = 1;
export const MAX_INVITES = 20;

const emailSchema = z.email();

export const imageSchema = z.object({
  uri: z.string().min(1, "Image URI is required"),
  mimeType: z.string().startsWith("image/", "Please choose an image file").optional(),
  fileName: z.string().nullable().optional(),
});

export const privacySchema = z.enum(["public", "private"], {
  error: "Choose public or private",
});

export const eventSchema = z.object({
  image: imageSchema.nullable().transform((image, ctx) => {
    if (image === null) {
      ctx.addIssue({ code: "custom", message: "Please add an image" });
      return z.NEVER;
    }
    return image;
  }),
  title: z.string().trim()
    .min(TITLE_MIN_LENGTH, `Title must be at least ${TITLE_MIN_LENGTH} characters`)
    .max(TITLE_MAX_LENGTH, `Title must be at most ${TITLE_MAX_LENGTH} characters`),
  shortDescription: z.string().trim()
    .min(SHORT_DESCRIPTION_MIN_LENGTH, `Short description must be at least ${SHORT_DESCRIPTION_MIN_LENGTH} characters`)
    .max(SHORT_DESCRIPTION_MAX_LENGTH, `Short description must be at most ${SHORT_DESCRIPTION_MAX_LENGTH} characters`)
    .regex(/^[\x20-\x7E\n\r]*$/, "Short description must be in English"),
  longDescription: z.string().trim()
    .min(LONG_DESCRIPTION_MIN_LENGTH, `Long description must be at least ${LONG_DESCRIPTION_MIN_LENGTH} characters`)
    .max(LONG_DESCRIPTION_MAX_LENGTH, `Long description must be at most ${LONG_DESCRIPTION_MAX_LENGTH} characters`),
  privacy: privacySchema.optional().pipe(privacySchema),
  communities: z.array(z.string()),
  invites: z.array(z.string()),
}).superRefine((values, ctx) => {
  if (values.privacy === "public") {
    if (values.communities.length < MIN_COMMUNITIES) {
      ctx.addIssue({
        code: "custom",
        path: ["communities"],
        message: `Choose at least ${MIN_COMMUNITIES} ${MIN_COMMUNITIES === 1 ? "community" : "communities"}`,
      });
    }
    return;
  }

  if (values.invites.length < MIN_INVITES) {
    ctx.addIssue({
      code: "custom",
      path: ["invites"],
      message: `Invite at least ${MIN_INVITES} person to a private event`,
    });
  }

  if (values.invites.length > MAX_INVITES) {
    ctx.addIssue({
      code: "custom",
      path: ["invites"],
      message: `Invite at most ${MAX_INVITES} people`,
    });
  }

  const seenEmails = new Set<string>();
  values.invites.forEach((email, index) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!emailSchema.safeParse(normalizedEmail).success) {
      ctx.addIssue({
        code: "custom",
        path: ["invites", index],
        message: "Enter a valid email address",
      });
      return;
    }

    if (seenEmails.has(normalizedEmail)) {
      ctx.addIssue({
        code: "custom",
        path: ["invites", index],
        message: "This email has already been invited",
      });
    }
    seenEmails.add(normalizedEmail);
  });
});
