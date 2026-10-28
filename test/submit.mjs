import assert from 'node:assert/strict';
import { createFormControl } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventSchema } from '../src/validation/schema.ts';
import { toPayload } from '../src/utils/toPayload.ts';

const valid = {
  image: { uri: 'file:///photo.jpg' },
  title: '  Community picnic  ',
  shortDescription: 'Join our community picnic.',
  longDescription: 'Bring your family for a picnic in the local park.',
  privacy: 'private',
  communities: ['nature-explorers'],
  invites: [' Guest@Example.COM '],
};

function form(values) {
  return createFormControl({ defaultValues: values, resolver: zodResolver(eventSchema) });
}

// A deferred request proves submitting stays true until the async callback ends.
const success = form(valid);
const states = [];
const unsubscribe = success.subscribe({
  formState: { isSubmitting: true, isSubmitSuccessful: true },
  callback: (state) => states.push({ ...state }),
});
let finishRequest;
const request = new Promise((resolve) => { finishRequest = resolve; });
let receivedPayload;
let markStarted;
const started = new Promise((resolve) => { markStarted = resolve; });
const submission = success.handleSubmit(async (values) => {
  assert.equal(values.title, 'Community picnic', 'Submit receives parsed, trimmed values');
  receivedPayload = toPayload(values);
  markStarted();
  await request;
}, () => assert.fail('Valid form must not call onInvalid'))();
await started;
assert.equal(states.at(-1).isSubmitting, true);
assert.equal(states.some((state) => state.isSubmitSuccessful), false);
assert.equal(receivedPayload.privacy, 'private');
assert.deepEqual(receivedPayload.invites, ['guest@example.com']);
assert.equal(Object.hasOwn(receivedPayload, 'communities'), false);
finishRequest();
await submission;
assert.equal(states.at(-1).isSubmitting, false);
assert.equal(states.at(-1).isSubmitSuccessful, true);
unsubscribe();

for (const [label, values, expectedField] of [
  ['Private with no invites', { ...valid, invites: [] }, 'invites'],
  ['Public with no communities', { ...valid, privacy: 'public', communities: [] }, 'communities'],
  ['Invalid email', { ...valid, invites: ['bad-email'] }, 'invites'],
  ['Missing image', { ...valid, image: null }, 'image'],
]) {
  let invalidCalled = false;
  await form(values).handleSubmit(
    () => assert.fail(`${label}: invalid data must not reach onSubmit`),
    (errors) => {
      invalidCalled = true;
      assert.ok(errors[expectedField], `${label}: expected field error`);
    },
  )();
  assert.equal(invalidCalled, true, `${label}: calls onInvalid`);
}

const publicForm = form({ ...valid, privacy: 'public', invites: ['bad-email'] });
await publicForm.handleSubmit((values) => {
  const payload = toPayload(values);
  assert.deepEqual(payload.communities, ['nature-explorers']);
  assert.equal(Object.hasOwn(payload, 'invites'), false);
}, () => assert.fail('Inactive invalid invites must not block public submission'))();

console.log('All submit lifecycle expectations passed.');
