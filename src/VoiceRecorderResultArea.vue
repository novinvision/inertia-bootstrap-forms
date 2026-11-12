<script>
import {computed, defineComponent, onBeforeUnmount, onMounted, ref} from 'vue';
import {formatTime, retainVoiceArea, voiceChannels} from './composables/useVoiceChannel.js';

/**
 * Shows the recordings (Bootstrap list-group with players) and/or the errors of a <VoiceRecorderInput>
 * anywhere on the page:
 *
 *   <VoiceRecorderInput name="voice" />
 *   ...
 *   <VoiceRecorderResultArea for="voice" />
 *
 * `for` is the `channel` (or, when it is not set, the `name`) of the recorder. As soon as an area is attached
 * the recorder stops showing its own results (see its `inline-results` prop).
 */
export default defineComponent({
  name: 'VoiceRecorderResultArea',
  props: {
    /** channel / name of the recorder to display. */
    for: {type: String, required: true},
    showList: {type: Boolean, default: true},
    showProblem: {type: Boolean, default: true},
    /** Extra classes of the list-group. */
    listClass: {type: [String, Array, Object], default: null},
    /** Classes of the error alert. */
    alertClass: {type: [String, Array, Object], default: 'alert theme-danger mb-2'},
    /** Used by the recorder itself for its built-in output; does not count as an external area. */
    internal: {type: Boolean, default: false},
  },
  setup(props) {
    const root = ref(null);
    const channel = computed(() => voiceChannels[props.for] ?? null);
    let release = null;

    onMounted(() => {
      if (!props.internal) release = retainVoiceArea(props.for);
    });
    onBeforeUnmount(() => release?.());

    const t = (key) => channel.value?.t?.(key) ?? key;

    // only one player at a time
    function onPlay(event) {
      root.value?.querySelectorAll('audio').forEach((audio) => {
        if (audio !== event.target) audio.pause();
      });
    }

    return {root, channel, t, onPlay, formatTime};
  },
});
</script>

<template>
  <div
      v-if="channel && ((showProblem && channel.problem) || (showList && channel.items.length))"
      ref="root"
      class="voice-recorder-results"
  >
    <div v-if="showProblem && channel.problem" :class="alertClass" role="alert" :data-code="channel.problem.code">
      {{ channel.problem.message }}
    </div>

    <ul v-if="showList && channel.items.length" class="list-group" :class="listClass">
      <li v-for="item in channel.items" :key="item.id" class="list-group-item">
        <slot
            name="item"
            :item="item"
            :time="item.seconds !== null ? formatTime(item.seconds) : null"
            :locked="channel.locked"
            :remove="() => channel.remove(item)"
            :retry="() => channel.retry(item)"
        >
          <div class="row gx-3 align-items-center">
            <div class="col-12 sm:col-4">
              <audio class="flex-grow-1 w-100" controls preload="metadata" :src="item.src" @play="onPlay"></audio>
            </div>
            <div class="col-auto" v-if="item.seconds !== null">
              <span class="fg-secondary fanum" dir="ltr">{{ formatTime(item.seconds) }}</span>
            </div>
            <div class="col">
              <div v-if="item.status === 'uploading'" class="progress" role="progressbar" :aria-valuenow="item.percent" aria-valuemin="0" aria-valuemax="100">
                <div class="progress-bar" :style="{ width: item.percent + '%' }"></div>
              </div>
              <div v-if="item.status === 'error'" class="fg-danger" role="alert">{{ item.error }}</div>
            </div>
            <div class="col-auto" v-if="item.status === 'error'">
              <button type="button" class="btn-text theme-secondary btn-icon" :aria-label="t('retry')" @click="channel.retry(item)">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                     aria-hidden="true">
                  <path d="M13.5 3v3.5H10"/>
                  <path d="M3.2 6.5A5.5 5.5 0 0 1 13 6.5M12.8 9.5A5.5 5.5 0 0 1 3 9.5M2.5 13V9.5H6"/>
                </svg>
              </button>
            </div>
            <div class="col-auto">
              <button v-if="!channel.locked" type="button" class="btn-text theme-danger btn-icon" :aria-label="t('remove')" @click="channel.remove(item)">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                     aria-hidden="true">
                  <path d="M2.5 4.5h11M6 4.5V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M4 4.5l.6 8.1a1 1 0 0 0 1 .9h4.8a1 1 0 0 0 1-.9l.6-8.1"/>
                </svg>
              </button>
            </div>
          </div>
        </slot>
      </li>
    </ul>
  </div>
</template>
