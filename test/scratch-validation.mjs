import assert from "node:assert/strict";
import { eventSchema } from "../src/validation/schema.ts";

const valid = {
  image: { uri: "file:///photo.jpg", mimeType: "image/jpeg" },
  title: "Community picnic",
  shortDescription: "Join our community picnic.",
  longDescription: "Bring your family for a picnic in the local park.",
  privacy: "public",
  communities: [],
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

console.log("\nAll four expectations passed.");
