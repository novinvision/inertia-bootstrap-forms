<script>
import {computed, defineComponent, onMounted, reactive, ref, watch} from 'vue';
import {fieldProps, useField} from './composables/useField.js';
import {useDisposables} from './composables/useDisposables.js';
import {formatTime, registerVoiceChannel, unregisterVoiceChannel, voiceAreaCounts} from './composables/useVoiceChannel.js';
import {useI18n} from './i18n.js';
import {laravelHeaders} from './utils/http.js';
import VoiceRecorderResultArea from './VoiceRecorderResultArea.vue';

const MESSAGES = {
  en: {
    start: 'Record voice',
    stop: 'Stop recording',
    idle: 'Click the microphone to record',
    starting: 'Waiting for microphone permission…',
    recording: 'Recording…',
    uploading: 'Uploading…',
    retry: 'Retry',
    remove: 'Remove',
    denied: 'Microphone access is blocked. Allow the microphone for this site (lock icon in the address bar, or the browser settings) and try again.',
    noDevice: 'No microphone was found on this device. Connect a microphone and try again.',
    busy: 'The microphone cannot be used. It may be in use by another app or tab. Close it and try again.',
    insecure: 'Voice recording only works on secure pages (HTTPS).',
    unsupported: 'This browser does not support voice recording.',
    recorder: 'Recording failed. Please try again.',
    disconnected: 'The microphone was disconnected. The audio recorded so far was kept.',
    tooShort: 'The recording is too short.',
    unknown: 'Could not start the recording.',
    uploadFailed: 'Upload failed',
  },
  fa: {
    start: 'ضبط صدا',
    stop: 'پایان ضبط',
    idle: 'برای ضبط روی میکروفن بزنید',
    starting: 'در انتظار اجازه دسترسی به میکروفن…',
    recording: 'در حال ضبط…',
    uploading: 'در حال ارسال…',
    retry: 'تلاش مجدد',
    remove: 'حذف',
    denied: 'دسترسی به میکروفن مسدود است. از آیکن قفل کنار آدرس (یا تنظیمات مرورگر) اجازه استفاده از میکروفن را برای این سایت فعال کنید و دوباره تلاش کنید.',
    noDevice: 'میکروفنی روی این دستگاه پیدا نشد. یک میکروفن وصل کنید و دوباره تلاش کنید.',
    busy: 'امکان استفاده از میکروفن نیست. ممکن است برنامه یا تب دیگری از آن استفاده کند. آن را ببندید و دوباره تلاش کنید.',
    insecure: 'ضبط صدا فقط در صفحه‌های امن (HTTPS) کار می‌کند.',
    unsupported: 'این مرورگر از ضبط صدا پشتیبانی نمی‌کند.',
    recorder: 'ضبط با خطا مواجه شد. دوباره تلاش کنید.',
    disconnected: 'میکروفن قطع شد. صدایی که تا این لحظه ضبط شده بود نگه داشته شد.',
    tooShort: 'مدت ضبط خیلی کوتاه است.',
    unknown: 'شروع ضبط ممکن نشد.',
    uploadFailed: 'خطا در ارسال',
  },
};

// Opus is the lightest speech codec every browser can record; the container depends on the browser
// (Firefox: ogg, Chrome / Edge: webm, Safari: mp4)
const MIME_CANDIDATES = ['audio/ogg;codecs=opus', 'audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg'];

let counter = 0;

function pickMime() {
  if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) return '';
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type)) || '';
}

function extensionOf(type = '') {
  if (/ogg/.test(type)) return 'ogg';
  if (/webm/.test(type)) return 'webm';
  if (/mp4|aac|m4a/.test(type)) return 'm4a';
  if (/mpeg|mp3/.test(type)) return 'mp3';
  if (/wav/.test(type)) return 'wav';
  return 'audio';
}

/** Maps getUserMedia / MediaRecorder errors to one of our message keys. */
function classify(error) {
  switch (error?.name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return 'denied';
    case 'SecurityError':
      return typeof window !== 'undefined' && window.isSecureContext === false ? 'insecure' : 'denied';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
    case 'OverconstrainedError':
    case 'ConstraintNotSatisfiedError':
      return 'noDevice';
    case 'NotReadableError':
    case 'TrackStartError':
    case 'AbortError':
      return 'busy';
    default:
      return 'unknown';
  }
}

/**
 * Voice recorder.
 *  - variant="box"    a full-width Bootstrap card with the record button, status and timer
 *  - variant="button" a single button that takes your own classes (`button-class`, `recording-class`, `problem-class`)
 * Every recording is uploaded to `url` and the result is stored in the form. No extra libraries: it uses the
 * browser's MediaRecorder (needs HTTPS).
 *
 * Where the recordings (list-group with players) and the errors are shown:
 *  - by default right inside / under the recorder
 *  - anywhere you like with <VoiceRecorderResultArea for="<name or channel>" /> (the built-in output hides itself)
 *  - inside any element of the page with `result-target="#my-div"`
 *
 * Endpoint contract (same as FileInput): POST multipart `file` → JSON { data: { path } } (or { path });
 * DELETE with the raw `path` as request body.
 */
export default defineComponent({
  name: 'VoiceRecorderInput',
  components: {VoiceRecorderResultArea},
  emits: ['update:modelValue', 'change', 'start', 'stop', 'recorded', 'progress', 'uploaded', 'removed', 'error'],
  props: {
    ...fieldProps,
    /** box | button */
    variant: {type: String, default: 'box', validator: (v) => ['box', 'button'].includes(v)},
    url: {type: String, default: '/upload'},
    /** Name of the multipart field. */
    fieldName: {type: String, default: 'file'},
    multiple: {type: Boolean, default: false},
    headers: {type: Object, default: () => ({})},
    /** Stop automatically after this many seconds. */
    maxDuration: {type: Number, default: null},
    /** Bitrate of the recording; 32 kbps opus is plenty for speech and keeps files tiny. */
    audioBitsPerSecond: {type: Number, default: 32000},
    audioConstraints: {type: Object, default: () => ({echoCancellation: true, noiseSuppression: true, autoGainControl: true})},
    /** Classes of the button (idle) … */
    buttonClass: {type: [String, Array, Object], default: 'btn-solid theme-inverse'},
    /** … while there is a problem to show … */
    problemClass: {type: [String, Array, Object], default: 'btn-solid theme-danger'},
    /** … and while recording. */
    recordingClass: {type: [String, Array, Object], default: 'btn-solid theme-danger'},
    /** Show the list of recordings (in the built-in output, in `result-target` and in the result areas). */
    showList: {type: Boolean, default: true},
    /** Ask the server to delete the file (DELETE {url}) when a recording is removed. */
    deleteOnRemove: {type: Boolean, default: true},
    /** (storedValue) => playable URL — used for recordings that come from the form data (edit pages). */
    playbackUrl: {type: Function, default: (value) => value},
    /**
     * Key that <VoiceRecorderResultArea for="…"> uses to find this recorder. Defaults to `name`.
     * Set it when two recorders share the same name or have no name.
     */
    channel: {type: String, default: null},
    /** CSS selector (or element) the list and errors are moved into, e.g. "#voice-results". It must exist in the page. */
    resultTarget: {type: [String, Object], default: null},
    /** Force the built-in output on / off. null = automatic: hidden while a <VoiceRecorderResultArea> is attached. */
    inlineResults: {type: Boolean, default: null},
    startText: {type: String, default: null},
    stopText: {type: String, default: null},
    locale: {type: String, default: null},
  },
  setup(props, {emit, expose}) {
    const field = useField(props, emit);
    const {locale} = useI18n(() => props.locale);
    const d = useDisposables();

    const t = (key) => (MESSAGES[locale.value] || MESSAGES.en)[key] ?? MESSAGES.en[key] ?? key;

    const uid = `voice-${++counter}`;
    const channelKey = props.channel ?? props.name ?? uid;

    const root = ref(null);
    const items = ref([]);
    const recording = ref(false);
    const starting = ref(false);
    const seconds = ref(0);
    const problem = ref(null); // { code, message }
    const supported = ref(true);
    const mounted = ref(false);

    const requests = new Map();
    let recorder = null;
    let stream = null;
    let chunks = [];
    let ticker = null;
    let startedAt = 0;
    let discard = false;

    const locked = computed(() => props.readonly || field.isDisabled.value);
    const time = computed(() => formatTime(seconds.value));
    const uploading = computed(() => items.value.some((i) => i.status === 'uploading'));
    const blocked = computed(() => !supported.value || locked.value);

    // where the results go
    const externalArea = computed(() => (voiceAreaCounts[channelKey] || 0) > 0);
    const showInline = computed(() => !props.resultTarget && (props.inlineResults ?? !externalArea.value));
    const stateClass = computed(() =>
        recording.value ? props.recordingClass : problem.value ? props.problemClass : props.buttonClass
    );

    const statusText = computed(() => {
      if (starting.value) return t('starting');
      if (recording.value) return t('recording');
      if (uploading.value) return t('uploading');
      return t('idle');
    });
    const buttonLabel = computed(() =>
        recording.value ? props.stopText ?? t('stop') : props.startText ?? t('start')
    );

    // ---------- problems ----------
    function fail(code, original, item = null) {
      problem.value = {code, message: t(code)};
      emit('error', {code, message: problem.value.message, error: original ?? null, item});
    }

    const clearProblem = () => {
      problem.value = null;
    };

    // ---------- model ----------
    const modelPaths = () => {
      const v = field.model.value;
      if (props.multiple) return Array.isArray(v) ? v : v ? [v] : [];
      return v ? [v] : [];
    };

    function publish(event) {
      const paths = items.value.filter((i) => i.path).map((i) => i.path);
      const next = props.multiple ? paths : (paths[0] ?? null);
      field.model.value = next;
      field.emitChange(next, event);
    }

    function updateFormProgress() {
      const form = field.form.value;
      if (!form) return;
      const active = items.value.filter((i) => i.status === 'uploading');
      form.uploading = active.length
          ? Math.min(99, Math.round(active.reduce((s, i) => s + i.percent, 0) / active.length))
          : null;
    }

    function release(item) {
      if (item.local && item.src) URL.revokeObjectURL(item.src);
    }

    // recordings that come from the form data (edit pages) and external resets
    function syncFromModel() {
      const paths = modelPaths();

      if (!paths.length && items.value.some((i) => i.path)) {
        items.value.filter((i) => i.path).forEach(release);
        items.value = items.value.filter((i) => !i.path);
      }

      const known = new Set(items.value.map((i) => i.path).filter(Boolean));
      paths.forEach((path) => {
        if (known.has(path)) return;
        items.value.push(
            reactive({id: `v${++counter}`, path, src: props.playbackUrl(path), status: 'done', percent: 100, seconds: null, error: '', local: false, file: null})
        );
      });
    }

    onMounted(() => {
      mounted.value = true;

      // publish the list / errors so that <VoiceRecorderResultArea for="…"> can show them anywhere
      registerVoiceChannel(channelKey, {owner: uid, items, problem, locked, t, remove, retry: upload});
      d.add(() => unregisterVoiceChannel(channelKey, uid));

      supported.value =
          typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';

      if (!supported.value) {
        fail(typeof window !== 'undefined' && window.isSecureContext === false ? 'insecure' : 'unsupported');
      } else {
        watchPermission();
      }
      syncFromModel();
    });
    watch(() => field.model.value, syncFromModel, {deep: true});

    // tell the user up-front when the microphone is already blocked, and react when they unblock it
    async function watchPermission() {
      try {
        const status = await navigator.permissions?.query({name: 'microphone'});
        if (!status || d.isDisposed()) return;

        const apply = () => {
          if (status.state === 'denied') fail('denied');
          else if (problem.value?.code === 'denied') clearProblem();
        };
        apply();
        status.addEventListener('change', apply);
        d.add(() => status.removeEventListener('change', apply));
      } catch (e) {
        /* the Permissions API does not know "microphone" in every browser */
      }
    }

    // ---------- recording ----------
    function stopTracks() {
      stream?.getTracks().forEach((track) => track.stop());
      stream = null;
    }

    function tick() {
      seconds.value = (Date.now() - startedAt) / 1000;
      if (props.maxDuration && seconds.value >= props.maxDuration) stop();
    }

    async function start() {
      if (recording.value || starting.value || blocked.value) return;
      clearProblem();

      starting.value = true;
      let media;
      try {
        media = await navigator.mediaDevices.getUserMedia({
          audio: Object.keys(props.audioConstraints || {}).length ? props.audioConstraints : true,
        });
      } catch (error) {
        starting.value = false;
        return fail(classify(error), error);
      }
      starting.value = false;

      if (d.isDisposed()) {
        media.getTracks().forEach((track) => track.stop());
        return;
      }

      const mimeType = pickMime();
      let rec;
      try {
        rec = new MediaRecorder(media, {...(mimeType ? {mimeType} : {}), audioBitsPerSecond: props.audioBitsPerSecond});
      } catch (e) {
        try {
          rec = new MediaRecorder(media);
        } catch (error) {
          media.getTracks().forEach((track) => track.stop());
          return fail('recorder', error);
        }
      }

      stream = media;
      recorder = rec;
      chunks = [];
      discard = false;

      rec.ondataavailable = (event) => {
        if (event.data?.size) chunks.push(event.data);
      };
      rec.onerror = (event) => {
        discard = true;
        fail('recorder', event.error);
        stop();
      };
      rec.onstop = () => finish(rec);

      // microphone unplugged / revoked while recording: keep what we have
      media.getAudioTracks().forEach((track) =>
          track.addEventListener('ended', () => {
            if (recording.value) {
              fail('disconnected');
              stop();
            }
          })
      );

      rec.start(500);
      startedAt = Date.now();
      seconds.value = 0;
      recording.value = true;
      ticker = setInterval(tick, 250);
      emit('start');
    }

    function stop() {
      clearInterval(ticker);
      ticker = null;
      if (recorder && recorder.state !== 'inactive') {
        try {
          recorder.stop();
        } catch (e) {
          finish(recorder);
        }
      }
      recording.value = false;
    }

    function finish(rec) {
      clearInterval(ticker);
      ticker = null;
      recording.value = false;
      const length = (Date.now() - startedAt) / 1000;
      const data = chunks;
      chunks = [];
      stopTracks();
      recorder = null;

      if (discard) return;
      emit('stop', length);

      const type = rec.mimeType || pickMime() || 'audio/webm';
      const blob = new Blob(data, {type});
      if (!blob.size || length < 0.4) return fail('tooShort');

      add(blob, length);
    }

    function toggle() {
      return recording.value ? stop() : start();
    }

    // ---------- list + upload ----------
    function add(blob, length) {
      // single mode: the new recording replaces the previous one
      if (!props.multiple) items.value.slice().forEach((old) => remove(old, false));

      const file = new File([blob], `voice-${Date.now()}.${extensionOf(blob.type)}`, {type: blob.type});
      const item = reactive({
        id: `v${++counter}`,
        file,
        src: URL.createObjectURL(file),
        seconds: Math.round(length),
        status: 'uploading',
        percent: 0,
        path: null,
        error: '',
        local: true,
      });

      items.value = [...items.value, item];
      emit('recorded', item);
      upload(item);
    }

    function upload(item) {
      item.status = 'uploading';
      item.percent = 0;
      item.error = '';
      updateFormProgress();

      const body = new FormData();
      body.append(props.fieldName, item.file, item.file.name);

      const xhr = new XMLHttpRequest();
      requests.set(item.id, xhr);
      xhr.open('POST', props.url);
      Object.entries(laravelHeaders(props.headers)).forEach(([k, v]) => xhr.setRequestHeader(k, v));

      xhr.upload.onprogress = (e) => {
        if (!e.lengthComputable) return;
        item.percent = Math.round((e.loaded / e.total) * 100);
        emit('progress', item, item.percent);
        updateFormProgress();
      };

      const failUpload = (message) => {
        requests.delete(item.id);
        item.status = 'error';
        item.error = message || t('uploadFailed');
        updateFormProgress();
        fail('uploadFailed', null, item);
        problem.value = {code: 'uploadFailed', message: item.error};
      };

      xhr.onerror = () => failUpload();
      xhr.onload = () => {
        let json = null;
        try {
          json = JSON.parse(xhr.responseText);
        } catch (e) { /* not json */
        }

        if (xhr.status < 200 || xhr.status >= 300) {
          const first = json?.errors ? Object.values(json.errors)[0] : null;
          return failUpload(json?.message || (Array.isArray(first) ? first[0] : first));
        }

        const result = json?.data ?? json;
        const stored = result?.path ?? result?.url;
        if (!stored) return failUpload();

        requests.delete(item.id);
        item.path = stored;
        item.status = 'done';
        item.percent = 100;
        updateFormProgress();
        clearProblem();
        publish();
        emit('uploaded', item, json);
      };

      xhr.send(body);
    }

    async function remove(item, notify = true) {
      requests.get(item.id)?.abort();
      requests.delete(item.id);
      release(item);
      items.value = items.value.filter((i) => i.id !== item.id);
      updateFormProgress();

      if (item.path) {
        publish();
        if (props.deleteOnRemove) {
          try {
            await fetch(props.url, {
              method: 'DELETE',
              headers: laravelHeaders(props.headers),
              credentials: 'same-origin',
              body: item.path,
            });
          } catch (e) { /* the recording is already detached from the form */
          }
        }
      }
      if (notify) emit('removed', item);
    }

    // ---------- cleanup ----------
    d.add(() => {
      discard = true;
      clearInterval(ticker);
      if (recorder && recorder.state !== 'inactive') {
        try {
          recorder.stop();
        } catch (e) { /* noop */
        }
      }
      stopTracks();
      requests.forEach((xhr) => xhr.abort());
      requests.clear();
      items.value.forEach(release);
      if (field.form.value) field.form.value.uploading = null;
    });

    expose({start, stop, toggle, channel: channelKey});

    return {
      ...field,
      t,
      root,
      items,
      recording,
      starting,
      seconds,
      time,
      problem,
      supported,
      blocked,
      mounted,
      channelKey,
      showInline,
      stateClass,
      statusText,
      buttonLabel,
      toggle,
      formatTime,
    };
  },
});
</script>

<template>
  <div ref="root" class="voice-recorder" :id="inputId" :class="{ 'is-invalid': isInvalid }">
    <!-- variant: box (full-width Bootstrap card) -->
    <div v-if="variant === 'box'" class="voice-recorder-box p-5">
      <div class="card-body">
        <div class="row gx-5">
          <div class="col-auto mx-auto" v-if="showInline && problem">
            <VoiceRecorderResultArea
                :for="channelKey"
                internal
                :show-list="false"
                alert-class="alert theme-danger p-1 text-center mb-4"
            />
          </div>
          <div class="col-12 text-center">
            <div class="btn btn-subtle mx-auto p-3" @click="toggle">
              <div class="row gx-5 align-items-center">
                <div class="col-auto">
                  <button
                      type="button"
                      class="btn"
                      :class="stateClass"
                      :disabled="blocked || starting"
                      :aria-label="buttonLabel"
                      :aria-pressed="recording"
                  >
                    <span v-if="starting" class="spinner-border spinner-sm" role="status" aria-hidden="true"></span>
                    <svg v-else-if="recording" width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                      <rect x="3.5" y="3.5" width="9" height="9" rx="1.5"/>
                    </svg>
                    <svg v-else width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                         stroke-linejoin="round"
                         aria-hidden="true">
                      <rect x="5.5" y="1.5" width="5" height="8" rx="2.5"/>
                      <path d="M3 7.5a5 5 0 0 0 10 0M8 12.5v2"/>
                    </svg>
                  </button>
                </div>
                <div class="col">
                  <div class="flex-grow-1 text-center">
                    <div class="fw-semibold" role="status" aria-live="polite">{{ statusText }}</div>
                    <div class="fg-secondary fanum" dir="ltr">{{ time }}
                      <template v-if="maxDuration"> / {{ formatTime(maxDuration) }}</template>
                    </div>
                  </div>
                </div>
                <div class="col-auto" v-if="recording">
                  <span class="spinner-grow spinner-sm fg-danger" role="status" aria-hidden="true"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <VoiceRecorderResultArea
            v-if="showInline && showList"
            class="d-block mt-2"
            :for="channelKey"
            internal
            :show-problem="false"
        />
      </div>
    </div>

    <!-- variant: button (your own classes) -->
    <template v-else>
      <button type="button" :disabled="blocked || starting" :aria-pressed="recording" :class="stateClass" @click="toggle">
        <slot :recording="recording" :starting="starting" :seconds="seconds" :time="time">
          <span v-if="starting" class="spinner-border spinner-sm me-2" role="status" aria-hidden="true"></span>
          <svg v-else-if="recording" class="me-2" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <rect x="3.5" y="3.5" width="9" height="9" rx="1.5"/>
          </svg>
          <svg v-else class="me-2" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
               stroke-linejoin="round" aria-hidden="true">
            <rect x="5.5" y="1.5" width="5" height="8" rx="2.5"/>
            <path d="M3 7.5a5 5 0 0 0 10 0M8 12.5v2"/>
          </svg>
          {{ buttonLabel }}
          <span v-if="recording" class="ms-2 fanum" dir="ltr">{{ time }}</span>
        </slot>
      </button>
      <VoiceRecorderResultArea v-if="showInline" class="d-block mt-2" :for="channelKey" internal :show-list="showList" />
    </template>

    <!-- result-target="#some-div": list and errors are rendered inside that element -->
    <Teleport v-if="resultTarget && mounted" :to="resultTarget">
      <VoiceRecorderResultArea :for="channelKey" internal :show-list="showList" />
    </Teleport>
  </div>
</template>
<style>
.voice-recorder-box{
  display: block;
  background-color: var(--bg-1);
  border-radius: var(--border-radius);
  border: 2px dashed var(--border-color);
}

.voice-recorder-box audio{
  vertical-align: middle;;
}
</style>