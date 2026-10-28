import assert from "node:assert/strict";
import { eventSchema } from "../src/validation/schema.ts";
import { toPayload } from "../src/utils/toPayload.ts";

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
assert.equal(noCommunities.success, false);
assert.deepEqual(noCommunities.error.issues[0].path, ["communities"]);
assert.equal(noCommunities.error.issues[0].message, "Choose at least one community");

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

console.log("\nAll validation and payload expectations passed.");
