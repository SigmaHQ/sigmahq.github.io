<template>
    <a target="_blank" :href="href" class="box w-full bg-sky-400/10 hover:bg-sky-400/20 dark:bg-slate-600/10 hover:dark:bg-slate-600/20  rounded-lg flex flex-col hover:!no-underline hover:outline-2 outline outline-1 hover:outline-2 bg-[#E3F2FA]/40 outline-[#C6D2ED]/40 hover:bg-[#DEF5FC] hover:outline-[#AAD0EC] dark:outline-[#383C5E]/50 dark:bg-[#252C3B]/25 dark:hover:bg-[#37455E]/40 dark:hover:outline-[var(--vp-c-brand-1)] dark:shadow-lg !transition-all">
        <div class="h-32 md:h-44 bg-cover rounded-lg rounded-b-none bg-center" v-if="img_src" :style="{backgroundImage: 'url(' + img_src + ')'}">

        </div>
        <div class="flex flex-col gap-2 py-3 md:py-5 px-3 md:px-6">
        <span class="text-slate-800 dark:text-white text-lg md:text-xl line-clamp-2">{{ truncate(title, 10) }}</span>
        <span class="text-slate-500 dark:text-slate-500 text-sm">{{ truncate(description, 15) }}</span>
        </div>
    </a>
</template>

<script setup>
import {truncate} from "/.vitepress/theme/util/string";

const props = defineProps(['href', 'title', 'description', 'img_src'])

</script>

<style scoped>

</style>