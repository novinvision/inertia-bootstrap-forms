import { reactive } from 'vue';

/**
 * Shared state between <VoiceRecorderInput> and any number of <VoiceRecorderResultArea> components.
 * A recorder publishes its list of recordings and its current problem under a "channel" key
 * (its `channel` prop, or its `name`); a result area with `for="<key>"` displays them anywhere on the page.
 *
 * The recorder registers itself in onMounted and removes itself on unmount, so nothing is shared between
 * server-side requests and nothing is leaked between pages.
 */
export const voiceChannels = reactive({});
export const voiceAreaCounts = reactive({});

export function registerVoiceChannel(key, entry) {
  voiceChannels[key] = entry;
}

export function unregisterVoiceChannel(key, owner) {
  if (voiceChannels[key]?.owner === owner) delete voiceChannels[key];
}

/** Counts the (non-internal) result areas attached to a channel; returns the release function. */
export function retainVoiceArea(key) {
  voiceAreaCounts[key] = (voiceAreaCounts[key] || 0) + 1;
  return () => {
    voiceAreaCounts[key] = Math.max(0, (voiceAreaCounts[key] || 1) - 1);
  };
}

const pad = (n) => String(Math.floor(n)).padStart(2, '0');
export const formatTime = (s) => `${pad(s / 60)}:${pad(s % 60)}`;
