<template>
  <Listbox
    :modelValue="modelValue"
    @update:modelValue="(value) => emit('update:modelValue', value)"
    by="id"
  >
    <div class="relative mt-1">
      <ListboxButton
        class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-white dark:bg-slate-800 dark:focus:ring-offset-slate-900 sm:text-sm"
      >
        <span class="block truncate">{{ modelValue.name }}</span>
        <span
          class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
        >
          <ChevronUpDownIcon aria-hidden="true" class="h-5 w-5 text-gray-400" />
        </span>
      </ListboxButton>

      <transition
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <ListboxOptions
          class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
        >
          <ListboxOption
            v-for="plugin in plugins"
            :key="plugin.name"
            v-slot="{ active, selected }"
            :value="plugin"
            as="template"
          >
            <div
              :class="[
                active ? 'bg-sky-100 text-sky-900' : 'text-gray-900',
                'relative cursor-default select-none py-2 pl-10 pr-4',
              ]"
            >
              <span
                :class="[
                  selected ? 'font-medium' : 'font-normal',
                  'block truncate',
                ]"
                >{{ plugin.name }}</span
              >
              <span
                v-if="selected"
                class="absolute inset-y-0 left-0 flex items-center pl-3 text-sky-600"
              >
                <CheckIcon aria-hidden="true" class="h-5 w-5" />
              </span>
            </div>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>

<script setup>
import { reactive } from "vue";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/vue";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/vue/20/solid";

const plugins = reactive([
  { id: "backend", name: "Backends" },
  { id: "pipeline", name: "Pipelines" },
]);

defineProps({
  modelValue: {
    type: Object,
    default() {
      return {
        name: "Backends",
      };
    },
  },
});
const emit = defineEmits(["update:modelValue"]);
</script>
