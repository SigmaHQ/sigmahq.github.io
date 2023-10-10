<template>
    <div
        class="w-full
        box
            h-full
            p-8
            mb-6
            rounded-lg
            outline
            outline-1
            bg-[#DAECF5]/30
            outline-[#C6D2ED]/40
            dark:outline-[#383C5E]/50
            dark:bg-[#252C3B]/25
            text-white
            flex
            flex-col
            transition-all
            group"
        @click="checked = !checked">


        <div class="flex gap-4 md:gap-8">

            <span class="font-semibold text-lg m-0 p-0 dark:text-white text-[#161821]">
                {{ number }}.
            </span>

            <div class="">
                <div class="font-semibold text-lg m-0 p-0 dark:text-white text-[#161821] mb-3" v-html="heading">

                </div>
                <div class="m-0 p-0 dark:text-slate-500 text-[#7280A0]">
                    <slot name="text">
                        Text Description
                    </slot>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref} from "vue";

let checked = ref(false)

const props = defineProps({
    number: Number,
    heading: String
})
</script>

<style>
.vp-doc > div > a:hover {
    text-decoration: none !important;
}
</style>