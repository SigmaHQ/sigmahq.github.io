<template>
  <div>
    <div
      class="inline-block rounded-2xl border border-2 border-sky-500/[.1] p-1 dark:border dark:bg-sky-900/[.1] dark:shadow-lg dark:shadow-none"
    >
      <div class="flex gap-3">
        <a
          :href="link_one"
          class="flex h-9 w-9 items-center justify-center rounded-xl !transition-all hover:bg-sky-400/20 dark:hover:bg-sky-700/20"
          :class="{
            'border-white !bg-sky-400 dark:border dark:border-2 dark:border-sky-500 dark:!bg-sky-600/30 dark:shadow-xl dark:shadow-sky-500/10':
              active === 'format',
          }"
        >
          <DocumentTextIcon
            v-if="active === 'format'"
            class="h-5 w-5 text-white dark:text-sky-400"
          />
          <DocumentTextIconOutline
            v-else
            class="h-5 w-5 text-sky-400 dark:text-sky-900"
          />
        </a>
        <a
          :href="link_two"
          class="flex h-9 w-9 items-center justify-center rounded-xl !transition-all hover:bg-sky-400/20 dark:hover:bg-sky-700/20"
          :class="{
            'border-white !bg-sky-400 dark:border dark:border-2 dark:border-sky-500 dark:!bg-sky-600/30 dark:shadow-xl dark:shadow-sky-500/10':
              active === 'tools',
          }"
        >
          <WrenchScrewdriverIcon
            v-if="active === 'tools'"
            class="h-5 w-5 text-white dark:text-sky-400"
          />
          <WrenchScrewdriverIconOutline
            v-else
            class="h-5 w-5 text-sky-400 dark:text-sky-900"
          />
        </a>
        <a
          :href="link_three"
          class="flex h-9 w-9 items-center justify-center rounded-xl !transition-all hover:bg-sky-400/20 dark:hover:bg-sky-700/20"
          :class="{
            'border-white !bg-sky-400 dark:border dark:border-2 dark:border-sky-500 dark:!bg-sky-600/30 dark:shadow-xl dark:shadow-sky-500/10':
              active === 'rules',
          }"
        >
          <FolderIcon
            v-if="active === 'rules'"
            class="h-5 w-5 text-white dark:text-sky-400"
          />
          <FolderIconOutline
            v-else
            class="h-5 w-5 text-sky-400 dark:text-sky-900"
          />
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  FolderIcon,
} from "@heroicons/vue/20/solid";
import {
  WrenchScrewdriverIcon as WrenchScrewdriverIconOutline,
  DocumentTextIcon as DocumentTextIconOutline,
  FolderIcon as FolderIconOutline,
} from "@heroicons/vue/24/outline";

defineProps({
  // format / tools / rules
  active: {
    required: false,
    type: String,
    default: "",
  },
  link_one: String,
  link_two: String,
  link_three: String,
});
</script>
