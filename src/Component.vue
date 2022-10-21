<script lang="ts">
import flatpickr from 'flatpickr';
import { excludedEvents, includedEvents } from './events.js';
import { camelToKebab, cloneObject, nullify } from './util.js';
// You have to import css yourself
import { h, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { PropType } from 'vue';

// Keep a copy of all events for later use
const allEvents = [
  ...includedEvents,
  ...excludedEvents,
];

type FlatpickrEventList = typeof allEvents;
type FlatpickrEvent = FlatpickrEventList[number];

// Passing these properties in `set()` method will cause flatpickr to trigger some callbacks
const configCallbacks = ['locale', 'showMonths'] as const;

export default {
  name: 'flat-pickr',
  compatConfig: {
    MODE: 3,
  },
  render() {
    return h('input', {
      type: 'text',
      'data-input': true,
      disabled: this.disabled,
      onInput: this.onInput,
      ref: 'root',
    });
  }
};
</script>

<script setup lang="ts">
// <{
//   (event: 'blur', value: string | null): void;
//   (event: 'update:modelValue', value: string | null): void;
//   (event: Kebab<FlatpickrEvent>, selectedDates: Date[], dateStr: string, instance: flatpickr.Instance, data?: any): void;
// }>
const emit = defineEmits([
  'blur',
  'update:modelValue',
  ...allEvents.map(camelToKebab),
]);

const props = defineProps({
  modelValue: {
    default: null,
    required: true,
    validator(value: unknown) {
      return (
        value === null ||
        value instanceof Date ||
        typeof value === 'string' ||
        value instanceof String ||
        value instanceof Array ||
        typeof value === 'number'
      );
    }
  } as {
    type: PropType<Date | string | number | null | (Date | string | number)[]>;
    default: null;
    required: true;
    validator(value: unknown): boolean;
  },
  // https://chmln.github.io/flatpickr/options/
  config: {
    type: Object as PropType<flatpickr.Options.Options>,
    default: () => ({
      wrap: false,
      defaultDate: null
    })
  },
  events: {
    type: Array as PropType<FlatpickrEventList>,
    default: () => includedEvents
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const root = ref<HTMLInputElement>();
const fp = ref<flatpickr.Instance | null>(null);

/**
   * Get the HTML node where flatpickr to be attached
   * Bind on parent element if wrap is true
   */
function getElem() {
  return props.config.wrap ? root.value!.parentNode : root.value;
}

/**
 * Watch for value changed by date-picker itself and notify parent component
 *
 * @param event
 */
function onInput(event: Event) {
  const input = event.target as HTMLInputElement;
  // Lets wait for DOM to be updated
  nextTick().then(() => {
    emit('update:modelValue', nullify(input.value));
  });
}

defineExpose({
  onInput,
});

/**
 * @return HTMLElement
 */
function fpInput() {
  return fp.value!.altInput || fp.value!.input;
}

/**
 * Blur event is required by many validation libraries
 *
 * @param event
 */
function onBlur(event: Event) {
  emit('blur', nullify((event.target as HTMLInputElement).value));
}

/**
 * flatpickr does not emit input event in some cases
 */
function onClose(selectedDates: Date[], dateStr: string) {
  emit('update:modelValue', dateStr);
}

/**
 * Watch for the disabled property and sets the value to the real input.
 *
 * @param newState
 */
function watchDisabled(newState: boolean) {
  if (newState) {
    fpInput().setAttribute('disabled', '');
  } else {
    fpInput().removeAttribute('disabled');
  }
}

onMounted(() => {
  // Return early if flatpickr is already loaded
  /* istanbul ignore if */
  if (fp.value) return;

  // Don't mutate original object on parent component
  let safeConfig = cloneObject(props.config);

  // Set initial date without emitting any event
  safeConfig.defaultDate = props.modelValue || safeConfig.defaultDate;

  const f = fp.value = flatpickr(getElem()!, safeConfig);

  for (const hook of props.events) {
    f.config[hook].push((...args) => emit(camelToKebab(hook), ...args));
  }

  f.config.onClose.push(onClose);

  // Attach blur event
  fpInput().addEventListener('blur', onBlur);

  // Immediate watch will fail before fp is set,
  // so need to start watching after mount
  watch(() => props.disabled, watchDisabled, { immediate: true });
});

/**
 * Watch for any config changes and redraw date-picker
 */
watch(() => props.config, (newConfig) => {
  if (!fp.value) {
    return;
  }

  let safeConfig = cloneObject(newConfig);
  // Workaround: Don't pass hooks to configs again otherwise
  // previously registered hooks will stop working
  // Notice: we are looping through all events
  // This also means that new callbacks can not be passed once component has been initialized
  allEvents.forEach((hook) => {
    delete safeConfig[hook];
  });
  fp.value.set(safeConfig);

  // Workaround: Allow to change locale dynamically
  configCallbacks.forEach((name) => {
    if (typeof safeConfig[name] !== 'undefined') {
      fp.value!.set(name, safeConfig[name]);
    }
  });
}, { deep: true });

/**
 * Watch for changes from parent component and update DOM
 *
 * @param newValue
 */
watch(() => props.modelValue, (newValue) => {
  // Prevent updates if v-model value is same as input's current value
  if (!root.value || newValue === nullify(root.value.value)) return;
  // Notify flatpickr instance that there is a change in value
  fp.value?.setDate(newValue ?? '', true);
});

/**
 * Free up memory
 */
onBeforeUnmount(() => {
  /* istanbul ignore else */
  if (fp.value) {
    fpInput().removeEventListener('blur', onBlur);
    fp.value.destroy();
    fp.value = null;
  }
});
</script>
<!-- 
<template>
  <input type="text" data-input :disabled="disabled" @input="onInput" ref="root">
</template> -->
