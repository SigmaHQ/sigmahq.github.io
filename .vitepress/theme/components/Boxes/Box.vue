<template>
  <div
    class="box group relative z-10 flex h-full w-full flex-col rounded-lg bg-[#E3F2FA]/40 p-6 text-white outline outline-2 outline-[#C6D2ED]/40 transition-all hover:bg-[#DEF5FC] hover:outline-2 hover:outline-offset-2 hover:outline-[#AAD0EC] dark:bg-[#252C3B]/25 dark:outline-[#383C5E]/50 dark:hover:bg-[#37455E]/40 dark:hover:outline-[var(--vp-c-brand-1)]"
  >
    <span
      class="box-icon mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-slate-700 outline outline-1 outline-[#C6D2ED]/70 transition-all group-hover:bg-[var(--vp-c-brand-1)] group-hover:text-white group-hover:outline-[var(--vp-c-brand-1)] dark:text-[var(--vp-c-brand-1)] dark:outline-slate-400/30 dark:group-hover:text-white"
    >
      <slot name="icon">
        <BoltIcon></BoltIcon>
      </slot>
    </span>
    <span class="text-d m-0 p-0 font-bold text-[#161821] dark:text-white">
      <slot name="heading"> Logsources </slot>
    </span>
    <span class="text-d m-0 p-0 text-sm text-[#7280A0] dark:text-slate-500">
      <slot name="text">
        Learn how to tune your Sigma rules for specific sets of logs.
      </slot>
    </span>
  </div>
</template>

<script setup>
import { BoltIcon } from "@heroicons/vue/24/solid";
</script>

<style>
.box .box-icon svg {
  @apply h-6 w-6;
}
div > a {
  text-decoration: none !important;
}
</style>

<style></style>
