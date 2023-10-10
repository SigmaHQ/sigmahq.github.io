<script setup>

import {Content, useData} from 'vitepress';

import VPSkipLink from 'vitepress/dist/client/theme-default/components/VPSkipLink.vue'
import VPNav from 'vitepress/dist/client/theme-default/components/VPNav.vue'
import VPFooter from 'vitepress/dist/client/theme-default/components/VPFooter.vue'
import {ChevronLeftIcon} from "@heroicons/vue/24/solid";

const {frontmatter} = useData()

</script>

<template>
    <slot name="layout-top"/>
    <VPSkipLink/>
    <VPNav>
        <template #nav-bar-title-after>
            <div class="block text-[9pt] text-[var(--vp-c-brand-1)] translate-x-[-54px] translate-y-[16px]">
                Blog
            </div>
        </template>
    </VPNav>

    <main class="max-w-6xl mx-auto px-6 py-12 lg:px-16 xl:px-8 flex flex-col gap-16 xl:gap-20" style="">

        <article id="article" class="vp-doc lg:pt-40 max-w-3xl mx-auto">
            <a href="/blog/" class="mb-10 block"><ChevronLeftIcon class="w-4 h-4 inline-block mr-2 -translate-y-0.5" />Back</a>
            <section class="heading-section flex flex-col gap-4">
                <div class="flex items-center gap-4">
                    <img :src="$frontmatter.author.image_url" width="30" height="30" class="rounded-full" alt="">
                    <span class="font-semibold md:text-lg dark:text-slate-400">{{ $frontmatter.author.name }}</span> <span class="font-semibold md:text-lg text-slate-300 dark:text-slate-700">{{ $frontmatter.date }}</span>
                </div>
                <h1 class="text-5xl !m-0">{{ $frontmatter.title }}</h1>
                <h3 class="text-2xl !m-0 text-slate-500 dark:text-slate-500">{{ $frontmatter.subtitle }}</h3>
            </section>

            <Content id="content"/>
        </article>
    </main>

    <VPFooter/>
    <slot name="layout-bottom"/>
</template>

<style>
.heading-section h1 {
    font-size: 34pt;
    font-weight: bold;
    text-wrap: balance;
}

#content p > img {
    max-width: 1000px;
    width: 75vw;
    min-width: 100%;
    position: relative;
    transform: translateX(calc(50vw - 50%));
    margin: 4rem calc(50% - 50vw);
}
</style>