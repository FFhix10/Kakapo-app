import sinon from 'sinon';
import { compose, path, length, keys } from 'ramda';
import { store } from 'stores/configureStore';
import { soundActions } from 'actions/';
import { stubFetchWith, kakapoRes } from '../helper';

const stubMatch = (stub, regex, data) =>
  stub
    .withArgs(sinon.match(regex))
    .returns(Promise.resolve(stubFetchWith(data)));

const currState = () => store.getState().sounds;

let defaultState;

test('[reducer/sounds] setup', () => {
  localStorage.setItem('version', false);
  localStorage.removeItem('sounds');
  const stubbedFetch = sinon.stub(global, 'fetch');
  stubMatch(stubbedFetch, /kakapo/, kakapoRes);
});

test('[reducer/sounds] init sounds', () => {
  expect.assertions(3);
  const action = store.dispatch(soundActions.soundsInit());
  action.then(data => {
    expect(data.type).toBe('SOUNDS_RECEIVED');
    expect(data.resp.length).toBe(14);
    expect(compose(length, keys)(currState())).toBe(14);
    defaultState = currState();
  });
});

test('[reducer/sounds] toggle play `on`', () => {
  expect.assertions(2);
  const action = store.dispatch(
    soundActions.soundsPlay(path(['wind'], currState()))
  );
  expect(action.type).toBe('SOUNDS_PLAY');
  expect(path(['wind', 'playing'], currState())).toBe(true);
});

test('[reducer/sounds] toggle play `off`', () => {
  expect.assertions(2);
  const action = store.dispatch(
    soundActions.soundsPlay(path(['wind'], currState()))
  );
  expect(action.type).toBe('SOUNDS_PLAY');
  expect(path(['wind', 'playing'], currState())).toBe(false);
});

test('[reducer/sounds] volume', () => {
  expect.assertions(3);
  expect(path(['wind', 'volume'], currState())).toBe(0.5);
  const action = store.dispatch(
    soundActions.soundsVolume(path(['wind'], currState()), 0.25)
  );
  expect(action.type).toBe('SOUNDS_VOLUME');
  expect(path(['wind', 'volume'], currState())).toBe(0.25);
});

test('[reducer/sounds] edit', () => {
  expect.assertions(2);
  const newData = { tags: 'newTag' };
  const action = store.dispatch(
    soundActions.soundsEdit(path(['wind'], currState()), newData)
  );
  expect(action.type).toBe('SOUNDS_EDIT');
  expect(path(['wind', 'tags'], currState())).toBe(newData.tags);
});

test('[reducer/sounds] remove', () => {
  expect.assertions(2);
  const action = store.dispatch(
    soundActions.soundsRemove(path(['wind'], currState()))
  );
  expect(action.type).toBe('SOUNDS_REMOVE');
  expect(path(['wind'], currState())).toBe(undefined);
});

test('[reducer/sounds] reset', () => {
  expect.assertions(2);
  const action = store.dispatch(soundActions.resetSounds(true));
  expect(action.type).toBe('SOUNDS_RESET');
  expect(currState()).toEqual({});
});

test('[reducer/sounds] clear', () => {
  expect.assertions(2);
  const action = store.dispatch(soundActions.resetSounds());
  expect(action.type).toBe('SOUNDS_RESET');
  expect(currState()).toEqual(defaultState);
});

test('[reducer/sounds] teardown', () => {
  global.fetch.restore();
});
