<template>
    <div
        class="w-full
        box
            h-full
            relative
            z-10
            p-6
            rounded-lg
            outline
            outline-2
            hover:outline-2
            hover:outline-offset-2
            bg-[#E3F2FA]/40
            outline-[#C6D2ED]/40
            hover:bg-[#DEF5FC]
            hover:outline-[#AAD0EC]
            dark:outline-[#383C5E]/50
            dark:bg-[#252C3B]/25
            dark:hover:bg-[#37455E]/40
            dark:hover:outline-[var(--vp-c-brand-1)]
            text-white
            flex
            flex-col
            transition-all
            group

">

            <span class="transition-all
            mb-4
            rounded-full
            w-10
            h-10
            flex
            items-center
            justify-center
            outline
            outline-1
            outline-[#C6D2ED]/70
            text-slate-700
            bg-transparent
            group-hover:bg-[var(--vp-c-brand-1)]
            group-hover:outline-[var(--vp-c-brand-1)]
            group-hover:text-white
            dark:outline-slate-400/30
            dark:text-[var(--vp-c-brand-1)]
            dark:group-hover:text-white
            box-icon
            ">
                <slot name="icon">
                    <BoltIcon></BoltIcon>
                </slot>
            </span>
        <span class="font-bold m-0 p-0 dark:text-white text-[#161821] text-d">
                <slot name="heading">
                    Logsources
                </slot>
            </span>
        <span class="m-0 p-0 text-sm dark:text-slate-500 text-[#7280A0] text-d">
                <slot name="text">
                    Learn how to tune your Sigma rules for specific sets of logs.
                </slot>
            </span>
    </div>
</template>

<script setup>
import {BoltIcon} from "@heroicons/vue/24/solid";</script>

<style>
.box .box-icon svg {
    @apply w-6 h-6;
}
div > a {
    text-decoration: none !important;
}
</style>

<style>

</style>