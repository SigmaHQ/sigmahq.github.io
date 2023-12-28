<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import {useData} from "vitepress/dist/client/theme-default/composables/data";
import {BookOpenIcon, RectangleGroupIcon} from "@heroicons/vue/20/solid";
import {useRoute, useRouter, withBase} from "vitepress";

const { Layout } = DefaultTheme
const { frontmatter } = useData()

function active_link(link: string) {
    return useRoute().data.relativePath.includes(link)
}
</script>

<template>
    <Layout>
        <template #nav-bar-title-after>
            <div class="block text-[10pt] text-[var(--vp-c-brand-1)] translate-x-[-60px] translate-y-[20px]">
                Documentation
            </div>
        </template>


        <template #nav-bar-content-before>
            <div class="hidden xl:block w-full"></div>
        </template>

<!--        <template #doc-before>-->
<!--            <div class="flex flex-col gap-4 pb-8">-->
<!--                &lt;!&ndash; Draft &ndash;&gt;-->
<!--                <DraftWarning class="block md:hidden w-full mb-0"/>-->
<!--            </div>-->
<!--            <slot name="doc-before" />-->
<!--        </template>-->

        <template #sidebar-nav-before>
            <div class="flex flex-col gap-2 pt-6 pb-4 group">
                <a :href="withBase('/docs/guide/getting-started.html')"
                   class="rounded-xl transition-all hover:bg-sky-400/10 dark:hover:bg-sky-400/20 p-1.5 -m-1.5 text-sm flex gap-3 items-center text-sky-500 dark:text-sky-200 font-semibold"
                   :class="{
                        'bg-sky-400/[0.08] group-hover:bg-transparent hover:!bg-sky-400/10': active_link('docs/'),
                        '': !active_link('docs/')
                    }">
                    <span
                        class="box block w-7 h-7 rounded-lg bg-sky-400/20 dark:bg-sky-500/20 flex items-center justify-center">
                        <BookOpenIcon class="h-4 h-4 text-sky-500 dark:text-sky-400"/>
                    </span>
                    Documentation
                </a>
                <a :href="withBase('/resources/')"
                   class="rounded-xl transition-all hover:bg-indigo-400/10 dark:hover:bg-indigo-400/20 p-1.5 -m-1.5 text-sm flex gap-3 items-center text-indigo-500 dark:text-indigo-200 font-semibold"
                   :class="{
                        'bg-indigo-400/[0.08] group-hover:bg-transparent hover:!bg-indigo-400/10': active_link('resources/'),
                        '': !active_link('resources/')
                    }">
                    <span
                        class="box block w-7 h-7 rounded-lg bg-indigo-400/20 dark:bg-indigo-500/20 flex items-center justify-center">
                        <RectangleGroupIcon class="h-4 h-4 text-indigo-500 dark:text-indigo-400"/>
                    </span>
                    Resources
                </a>
            </div>
        </template>

        <template #sidebar-nav-after>
            <div class="text-slate-400 dark:text-slate-700 text-xs transition-all pt-6 block border-t border-1 w-full border-[var(--vp-c-divider)]">
                <div class="font-semibold mb-0.5">Copyright &copy; <a href="https://sigmahq.io/">SigmaHQ</a> {{ new Date().getFullYear() }}</div>
                <div class="flex gap-2">
                  <a href="https://github.com/SigmaHQ/" class="hover:text-cyan-600" target="_blank">Github</a>
                  <span class="opacity-30">|</span>
                  <a href="https://twitter.com/Sigma_HQ/" class="hover:text-cyan-600" target="_blank">X.com</a>
                </div>
            </div>
        </template>

        <template #nav-bar-title-before><slot name="nav-bar-title-before" /></template>
<!--        <template #nav-bar-title-after><slot name="nav-bar-title-after" /></template>-->
<!--        <template #nav-bar-content-before><slot name="nav-bar-content-before" /></template>-->
        <template #nav-bar-content-after><slot name="nav-bar-content-after" /></template>
        <template #nav-screen-content-before><slot name="nav-screen-content-before" /></template>
        <template #nav-screen-content-after><slot name="nav-screen-content-after" /></template>
<!--        <template #sidebar-nav-before><slot name="sidebar-nav-before" /></template>-->
<!--        <template #sidebar-nav-after><slot name="sidebar-nav-after" /></template>-->
        <template #page-top><slot name="page-top" /></template>
        <template #page-bottom><slot name="page-bottom" /></template>
        <template #not-found><slot name="not-found" /></template>
        <template #home-hero-before><slot name="home-hero-before" /></template>
        <template #home-hero-info><slot name="home-hero-info" /></template>
        <template #home-hero-image><slot name="home-hero-image" /></template>
        <template #home-hero-after><slot name="home-hero-after" /></template>
        <template #home-features-before><slot name="home-features-before" /></template>
        <template #home-features-after><slot name="home-features-after" /></template>
        <template #doc-footer-before><slot name="doc-footer-before" /></template>
<!--        <template #doc-before><slot name="doc-before" /></template>-->
        <template #doc-after><slot name="doc-after" /></template>
        <template #doc-top><slot name="doc-top" /></template>
        <template #doc-bottom><slot name="doc-bottom" /></template>
        <template #aside-top><slot name="aside-top" /></template>
        <template #aside-bottom><slot name="aside-bottom" /></template>
        <template #aside-outline-before><slot name="aside-outline-before" /></template>
        <template #aside-outline-after><slot name="aside-outline-after" /></template>
        <template #aside-ads-before><slot name="aside-ads-before" /></template>
        <template #aside-ads-after><slot name="aside-ads-after" /></template>
    </Layout>
</template>
