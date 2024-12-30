<template>
  <div
    class="box group mb-6 flex h-full w-full flex-col rounded-lg bg-[#DAECF5]/30 p-8 text-white outline outline-1 outline-[#C6D2ED]/40 transition-all dark:bg-[#252C3B]/25 dark:outline-[#383C5E]/50"
    @click="checked = !checked"
  >
    <div class="flex gap-4 md:gap-8">
      <span
        class="m-0 p-0 text-lg font-semibold text-[#161821] dark:text-white"
      >
        {{ number }}.
      </span>

      <div class="">
        <div
          class="m-0 mb-3 p-0 text-lg font-semibold text-[#161821] dark:text-white"
          v-html="heading"
        ></div>
        <div class="m-0 p-0 text-[#7280A0] dark:text-slate-500">
          <slot name="text"> Text Description </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

let checked = ref(false);

defineProps({
  number: Number,
  heading: String,
});
</script>

<style>
.vp-doc > div > a:hover {
  text-decoration: none !important;
}
</style>
