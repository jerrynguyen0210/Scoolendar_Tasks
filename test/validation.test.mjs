import assert from "node:assert/strict";
import {
  eventSchema, MAX_INVITES, TITLE_MIN_LENGTH, TITLE_MAX_LENGTH,
  SHORT_DESCRIPTION_MIN_LENGTH, SHORT_DESCRIPTION_MAX_LENGTH,
  LONG_DESCRIPTION_MIN_LENGTH, LONG_DESCRIPTION_MAX_LENGTH,
} from "../src/validation/schema.ts";
import { toPayload } from "../src/utils/toPayload.ts";
import { addInviteEmails } from "../src/utils/addInviteEmails.ts";

const valid = {
  image: { uri: "file:///photo.jpg", mimeType: "image/jpeg" },
  title: "Community picnic",
  shortDescription: "Join our community picnic.",
  longDescription: "Bring your family for a picnic in the local park.",
  privacy: "public",
  communities: ["nature-explorers"],
  invites: [],
};

function check(label, values) {
  const result = eventSchema.safeParse(values);
  console.log(`\n${label}: ${result.success ? "PASS" : "FAIL"}`);
  if (!result.success) {
    console.table(result.error.issues.map(({ path, message }) => ({
      field: path.join("."),
      message,
    })));
  }
  return result;
}

const empty = check("Everything empty", {
  image: null,
  title: "",
  shortDescription: "",
  longDescription: "",
  privacy: undefined,
  communities: [],
  invites: [],
});
assert.equal(empty.success, false);
assert.equal(empty.error.issues.length, 5);
assert.deepEqual(empty.error.issues.map(({ path }) => path[0]).sort(),
  ["image", "title", "shortDescription", "longDescription", "privacy"].sort());

const noCommunities = check("Public with no communities", {
  ...valid,
  communities: [],
});
assert.equal(noCommunities.success, true);

const privateWithoutCommunities = check("Private with no communities", {
  ...valid,
  privacy: "private",
  communities: [],
  invites: ["guest@example.com"],
});
assert.equal(privateWithoutCommunities.success, true);
assert.equal(Object.hasOwn(toPayload(privateWithoutCommunities.data), "communities"), false);

const publicEvent = check("Public with leftover bad invite", {
  ...valid,
  invites: ["not-an-email"],
});
assert.equal(publicEvent.success, true);

const privateEvent = check("Private with zero invites", {
  ...valid,
  privacy: "private",
});
assert.equal(privateEvent.success, false);
assert.deepEqual(privateEvent.error.issues[0].path, ["invites"]);

const vietnamese = check("Vietnamese short description", {
  ...valid,
  shortDescription: "Mời mọi người tham gia sự kiện.",
});
assert.equal(vietnamese.success, false);
assert.ok(vietnamese.error.issues.some(({ path, message }) =>
  path[0] === "shortDescription" && message === "Short description must be in English"));

for (const lineBreak of ["\n", "\r", "\r\n"]) {
  const multiline = check(`Multiline descriptions (${JSON.stringify(lineBreak)})`, {
    ...valid,
    shortDescription: `Join our picnic.${lineBreak}Everyone is welcome!`,
    longDescription: `Bring your family for a picnic.${lineBreak}Meet us in the local park.`,
  });
  assert.equal(multiline.success, true);
}

const tab = check("Short description with an internal tab", {
  ...valid,
  shortDescription: "Join our\tpicnic today.",
});
assert.equal(tab.success, false);
assert.ok(tab.error.issues.some(({ path, message }) =>
  path[0] === "shortDescription" && message === "Short description must be in English"));

const paddedEmail = check("Private with padded, mixed-case emails", {
  ...valid,
  privacy: "private",
  invites: [" a@b.com", "Guest@Example.COM ", "  Other@Example.COM  "],
});
assert.equal(paddedEmail.success, true);
const originalInvites = [...paddedEmail.data.invites];
assert.deepEqual(toPayload(paddedEmail.data).invites,
  ["a@b.com", "guest@example.com", "other@example.com"]);
assert.deepEqual(paddedEmail.data.invites, originalInvites);
assert.equal(Object.hasOwn(toPayload(publicEvent.data), "invites"), false);

for (const email of ["   ", " invalid-email ", " a @b.com "]) {
  const invalidEmail = check("Private with invalid email", {
    ...valid,
    privacy: "private",
    invites: [email],
  });
  assert.equal(invalidEmail.success, false);
  assert.deepEqual(invalidEmail.error.issues[0].path, ["invites", 0]);
}

const duplicates = ["Guest@Example.com", " guest@example.COM ", "other@example.com", "guest@example.com"];
const duplicateResult = check("Private with duplicate emails", {
  ...valid,
  privacy: "private",
  invites: duplicates,
});
assert.equal(duplicateResult.success, false);
assert.deepEqual(duplicateResult.error.issues.map(({ path }) => path),
  [["invites", 1], ["invites", 3]]);
assert.ok(duplicateResult.error.issues.every(({ message }) =>
  message === "This email has already been invited"));
assert.equal(eventSchema.safeParse({ ...valid, invites: duplicates }).success, true);
assert.equal(eventSchema.safeParse({
  ...valid,
  privacy: "private",
  invites: ["one@example.com", "two@example.com"],
}).success, true);

const emptyUri = check("Image with an empty URI", {
  ...valid,
  image: { uri: "" },
});
assert.equal(emptyUri.success, false);
assert.deepEqual(emptyUri.error.issues[0].path, ["image", "uri"]);
assert.equal(emptyUri.error.issues[0].message, "Image URI is required");

const existing = Object.freeze(["alex@example.com"]);
const outlookBatch = addInviteEmails([], " Alex@Example.com;sam@example.com; taylor@example.com; ");
assert.deepEqual(outlookBatch.emails,
  ["alex@example.com", "sam@example.com", "taylor@example.com"]);
assert.equal(outlookBatch.error, null);
const single = addInviteEmails(existing, "  SAM@Example.COM  ");
assert.deepEqual(single.emails, ["alex@example.com", "sam@example.com"]);
assert.equal(single.error, null);
const badSingle = addInviteEmails(existing, "not-an-email");
assert.deepEqual(badSingle.emails, existing);
assert.match(badSingle.error, /invalid email/);
const duplicateSingle = addInviteEmails(existing, " ALEX@EXAMPLE.COM ");
assert.deepEqual(duplicateSingle.emails, existing);
assert.match(duplicateSingle.error, /already invited/);
const batch = addInviteEmails(existing,
  " NEW@Example.com, invalid alex@example.com\nother@example.com new@example.com ");
assert.deepEqual(batch.emails, ["alex@example.com", "new@example.com", "other@example.com"]);
assert.match(batch.error, /invalid \(invalid email\)/);
assert.match(batch.error, /alex@example.com \(already invited\)/);
assert.match(batch.error, /new@example.com \(already invited\)/);
assert.deepEqual(existing, ["alex@example.com"]);
const nearlyFull = Array.from({ length: 19 }, (_, index) => `guest${index}@example.com`);
const limited = addInviteEmails(nearlyFull, "last@example.com overflow@example.com");
assert.equal(limited.emails.length, 20);
assert.equal(limited.emails[19], "last@example.com");
assert.match(limited.error, /overflow@example.com \(limit of 20 invites reached\)/);
assert.equal(addInviteEmails([], " , \n ").error, "Enter a valid email address");

// Text limits apply to trimmed values, including exact boundaries.
for (const [field, min, max] of [
  ["title", TITLE_MIN_LENGTH, TITLE_MAX_LENGTH],
  ["shortDescription", SHORT_DESCRIPTION_MIN_LENGTH, SHORT_DESCRIPTION_MAX_LENGTH],
  ["longDescription", LONG_DESCRIPTION_MIN_LENGTH, LONG_DESCRIPTION_MAX_LENGTH],
]) {
  for (const length of [min, max]) {
    const result = eventSchema.safeParse({ ...valid, [field]: `  ${"a".repeat(length)}  ` });
    assert.equal(result.success, true, `${field}: accepts trimmed length ${length}`);
    assert.equal(result.data[field], "a".repeat(length));
  }
  for (const text of ["a".repeat(min - 1), "a".repeat(max + 1), "   "]) {
    const result = eventSchema.safeParse({ ...valid, [field]: text });
    assert.equal(result.success, false, `${field}: rejects invalid length`);
    assert.ok(result.error.issues.some(({ path }) => path[0] === field));
  }
}

for (const privacy of [undefined, null, "", "friends"]) {
  const result = eventSchema.safeParse({ ...valid, privacy });
  assert.equal(result.success, false);
  assert.ok(result.error.issues.some(({ path }) => path[0] === "privacy"));
}

const fullInvites = Array.from({ length: MAX_INVITES }, (_, index) => `person${index}@example.com`);
assert.equal(eventSchema.safeParse({ ...valid, privacy: "private", invites: fullInvites }).success, true);
const tooMany = eventSchema.safeParse({
  ...valid, privacy: "private", invites: [...fullInvites, "extra@example.com"],
});
assert.equal(tooMany.success, false);
assert.ok(tooMany.error.issues.some(({ path, message }) =>
  path.join(".") === "invites" && message === `Invite at most ${MAX_INVITES} people`));
assert.equal(eventSchema.safeParse({
  ...valid, invites: [...fullInvites, "not-an-email"],
}).success, true, "Public events ignore inactive invite constraints");

const multipleBadEmails = eventSchema.safeParse({
  ...valid, privacy: "private", invites: ["bad", "valid@example.com", "also-bad"],
});
assert.equal(multipleBadEmails.success, false);
assert.deepEqual(multipleBadEmails.error.issues.map(({ path }) => path), [["invites", 0], ["invites", 2]]);

for (const image of [null, { uri: "file:///document.pdf", mimeType: "application/pdf" }]) {
  const result = eventSchema.safeParse({ ...valid, image });
  assert.equal(result.success, false);
  assert.ok(result.error.issues.some(({ path }) => path[0] === "image"));
}
assert.equal(eventSchema.safeParse({ ...valid, image: { uri: "file:///photo.jpg" } }).success, true);

const parsedPublic = eventSchema.parse(valid);
assert.deepEqual(toPayload(parsedPublic), {
  image: valid.image, title: valid.title, shortDescription: valid.shortDescription,
  longDescription: valid.longDescription, privacy: "public", communities: valid.communities,
});
const snapshot = structuredClone(paddedEmail.data);
toPayload(paddedEmail.data);
assert.deepEqual(paddedEmail.data, snapshot, "Payload conversion preserves form values");

const fullBatch = addInviteEmails(Object.freeze(fullInvites), "extra@example.com");
assert.deepEqual(fullBatch.emails, fullInvites);
assert.match(fullBatch.error, /limit of/);
const mixedSeparators = addInviteEmails([], ";, FIRST@example.com\r\n second@example.com\tthird@example.com ;;,");
assert.deepEqual(mixedSeparators.emails, ["first@example.com", "second@example.com", "third@example.com"]);
assert.equal(mixedSeparators.error, null);
const allRejected = addInviteEmails(existing, "bad; ALEX@example.com");
assert.deepEqual(allRejected.emails, existing);
assert.match(allRejected.error, /invalid email/);
assert.match(allRejected.error, /already invited/);
assert.equal(addInviteEmails([], "first.last+event@example.com").error, null);

console.log("\nAll validation and payload expectations passed.");
