<template>
  <a
    target="_blank"
    :href="href"
    class="box flex w-full flex-col rounded-lg bg-[#E3F2FA]/40 bg-sky-400/10 outline outline-1 outline-[#C6D2ED]/40 !transition-all hover:bg-[#DEF5FC] hover:bg-sky-400/20 hover:!no-underline hover:outline-2 hover:outline-[#AAD0EC] dark:bg-[#252C3B]/25 dark:bg-slate-600/10 dark:shadow-lg dark:outline-[#383C5E]/50 dark:hover:bg-[#37455E]/40 hover:dark:bg-slate-600/20 dark:hover:outline-[var(--vp-c-brand-1)]"
  >
    <div
      class="h-32 rounded-lg rounded-b-none bg-cover bg-center md:h-44"
      v-if="img_src"
      :style="{ backgroundImage: 'url(' + img_src + ')' }"
    ></div>
    <div class="flex flex-col gap-2 px-3 py-3 md:px-6 md:py-5">
      <span
        class="line-clamp-2 text-lg text-slate-800 dark:text-white md:text-xl"
        >{{ truncate(title, 10) }}</span
      >
      <span class="text-sm text-slate-500 dark:text-slate-500">{{
        truncate(description, 15)
      }}</span>
    </div>
  </a>
</template>

<script setup>
import { truncate } from "/.vitepress/theme/util/string";

const props = defineProps(["href", "title", "description", "img_src"]);
</script>

<style scoped></style>
