<script setup>

import {useData, withBase} from 'vitepress';
import {ArrowRightIcon, ArrowTopRightOnSquareIcon} from '@heroicons/vue/20/solid/index';
import {
    BeakerIcon,
    BookOpenIcon,
    DocumentCheckIcon,
    RectangleGroupIcon,
    RectangleStackIcon,
    PencilSquareIcon
} from "@heroicons/vue/24/solid/index";

import VPSkipLink from 'vitepress/dist/client/theme-default/components/VPSkipLink.vue'
import VPNav from 'vitepress/dist/client/theme-default/components/VPNav.vue'
import VPFooter from 'vitepress/dist/client/theme-default/components/VPFooter.vue'
import Box from "../components/Boxes/Box.vue";
import CodeBox from "../components/Home/CodeBox.vue";
import RulesBox from "../components/Boxes/RulesBox.vue";

const {frontmatter} = useData()
</script>

<template>
    <slot name="layout-top"/>
    <VPSkipLink/>
    <VPNav>
        <template #nav-bar-title-after>
            <div class="block text-[10pt] text-[var(--vp-c-brand-1)] translate-x-[-60px] translate-y-[20px]">
                Detection&nbsp;Format
            </div>
        </template>
    </VPNav>

    <div class="overflow-x-hidden">
        <div id="shade"
             class="absolute opacity-40 lg:opacity-25 dark:opacity-[.20] blur pointer-events-none lg:-top-80 top-0 -left-0 right-0 bottom-0 w-100 -z-10"
             style="background:radial-gradient(circle at 0% 0%, rgba(69,216,255,1) 0%, rgba(69,216,255,0) 50%, rgba(69,216,255,0) 100%);"></div>

        <main class="max-w-6xl mx-auto px-6 py-12 lg:px-16 xl:px-8 flex flex-col gap-16 xl:gap-20" style="">
            <section id="sigma" class="md:pt-40">
                <div class="flex flex-col md:flex-row gap-6 lg:gap-12 items-center">
                    <div class="flex flex-col gap-2 order-last md:order-first basis-1 md:basis-2/3 xl:pr-5">
                        <p><Badge type="tip" text="Open Source" /></p>
                        <h2>
                            <small class="text-[var(--vp-c-brand-1)] dark:text-[var(--vp-c-brand-3)] font-semibold text-xl">
                                SIEM Detection Format
                            </small>
                        </h2>
                        <h2 class="font-semibold text-4xl md:text-5xl" id="hero-title">
                            <slot name="home-hero-text">
                                The shareable<br/>detection format for <br class="hidden md:block"/><span class="bg-[var(--vp-c-brand-2)] fill">security professionals</span>.
                            </slot>
                        </h2>
                        <p class="text-slate-500">
                            Get the most out of the Sigma ecosystem in your SIEM, and start using thousands of
                            great security detections from the community and beyond.
                        </p>
                        <div class="flex gap-2">
                            <a :href="withBase('/docs/guide/getting-started.html')"
                               class="text-sm
                                mt-4
                                border
                                bg-[var(--vp-c-brand-3)]
                                border-[--vp-c-brand-3]
                                hover:bg-[var(--vp-c-brand-2)]
                                hover:border-[var(--vp-c-brand-1)]
                                dark:bg-[var(--vp-c-brand-3)]
                                dark:border-[var(--vp-c-brand-1)]
                                dark:hover:bg-[var(--vp-c-brand-1)]
                                transition
                                rounded-full
                                p-2
                                px-4
                                flex
                                items-center
                                font-semibold
                                text-white
                                shadow-md
                                hover:shadow-lg">
                                Get Started
                            </a>
                            <a href="https://github.com/SigmaHQ/sigma/"
                               class="text-sm
                                    mt-4
                                    border
                                    border-solid
                                    border-[#677389]/25
                                    hover:border-[#677389]/50
                                    dark:border-[#677389]/40
                                    dark:hover:border-[#677389]/60
                                    transition
                                    rounded-full
                                    p-2
                                    px-4
                                    flex
                                    items-center
                                    font-semibold
                                    hover:shadow-md group">
                                View Sigma Rules
                                <ArrowRightIcon
                                    class="transition h-4 inline transition group-hover:text-[var(--vp-c-brand-3)] ml-1.5"/>
                            </a>
                        </div>
                    </div>
                    <div class="basis-1 md:basis-1/3">
                        <CodeBox></CodeBox>
                    </div>
                </div>
            </section>
            <section id="learn">
                <h2 class="text-2xl font-semibold mb-6 pb-4 border-b border-slate-500/10">
                    Learn
                </h2>
                <div class="grid md:grid-cols-3 gap-4">
                    <a :href="withBase('/docs/guide/getting-started.html')">
                        <Box>
                            <template #icon><BookOpenIcon /></template>
                            <template #heading>Documentation</template>
                            <template #text>Learn more about how to use the Sigma detection format.</template>
                        </Box>
                    </a>
                    <a :href="withBase('/resources/')">
                        <Box>
                            <template #icon><RectangleGroupIcon /></template>
                            <template #heading>Resources</template>
                            <template #text>See many amazing resources – produced by SigmaHQ and the wider Sigma community.</template>
                        </Box>
                    </a>
                    <a :href="withBase('/docs/basics/rules.html')">
                        <RulesBox />
                    </a>
                </div>
            </section>
            <section id="explore">
                <h2 class="text-2xl font-semibold mb-6 pb-4 border-b border-slate-500/10">
                    Explore the Sigma Ecosystem
                </h2>
                <div class="grid md:grid-cols-3 gap-4">
                    <a target="_blank" href="https://github.com/SigmaHQ/sigma/">
                        <Box>
                            <template #icon><RectangleStackIcon /></template>
                            <template #heading>View Sigma Rules <ArrowTopRightOnSquareIcon class="text-slate-400 dark:text-white/30 ml-1 h-[14px] w-[14px] inline" /></template>
                            <template #text>Explore the thousands of existing Sigma detections in SigmaHQ/sigma.</template>
                        </Box>
                    </a>
                    <a target="_blank" href="https://medium.com/sigma-hq">
                        <Box>
                            <template #icon><PencilSquareIcon /></template>
                            <template #heading>SigmaHQ Blog <ArrowTopRightOnSquareIcon class="text-slate-400 dark:text-white/30 ml-1 h-[14px] w-[14px] inline" /> </template>
                            <template #text>See articles written by the Core SigmaHQ development team.</template>
                        </Box>
                    </a>
                    <a target="_blank" href="https://github.com/SigmaHQ/sigma-specification/">
                        <Box>
                            <template #icon><BeakerIcon /></template>
                            <template #heading>
                                Specification <Badge type="tip" text="In Dev" /> <ArrowTopRightOnSquareIcon class="text-slate-400 dark:text-white/30 ml-1 h-[14px] w-[14px] inline" />
                            </template>
                            <template #text>Shape the future of the Sigma specification.</template>
                        </Box>
                    </a>
                </div>
            </section>

            <div class="grid md:grid-cols-2 gap-16">
                <section id="guides" class="flex flex-col gap-2">
                    <h2 class="text-2xl font-semibold">
                        Projects
                    </h2>
                    <p class="border-b border-slate-500/[.07] mb-3 pb-3 text-sm text-slate-400">
                        The upcoming Sigma projects, developments and services.
                    </p>

                    <ul>
                        <li>
                            <a target="_blank" class="text-[var(--vp-c-brand-3)]" href="https://marketplace.visualstudio.com/items?itemName=humpalum.sigma">
                                Sigma VSCode Extension <ArrowTopRightOnSquareIcon class="text-slate-400 dark:text-cyan-300/30 ml-1 h-[14px] w-[14px] inline" />
                            </a>
                        </li>
                        <li>
                            <a target="_blank" class="text-[var(--vp-c-brand-3)]" href="https://github.com/SigmaHQ/pySigma">
                                pySigma Development <ArrowTopRightOnSquareIcon class="text-slate-400 dark:text-cyan-300/30 ml-1 h-[14px] w-[14px] inline" />
                            </a>
                        </li>
                        <li>
                            <a target="_blank" class="text-[var(--vp-c-brand-3)]" href="https://sigmasearchengine.com/">
                                Sigma Search Engine <ArrowTopRightOnSquareIcon class="text-slate-400 dark:text-cyan-300/30 ml-1 h-[14px] w-[14px] inline" />
                            </a>
                        </li>
                        <li>
                                <span class="opacity-30">Sigma Rule Detection Reference</span>
                                <Badge text="Coming Soon" type="info"/>
                        </li>
                    </ul>
                </section>
                <section id="community"
                         class="bg-[#DAECF5]/10 dark:bg-[#181A24]/40 border border-1 dark:border-[#181A24] p-6 md:-m-8 md:p-8 md:mr-0 -mx-6 md:rounded-xl flex flex-col gap-2">
                    <h2 class="text-2xl font-semibold">
                        Community
                    </h2>
                    <p class="border-b border-slate-500/[.07] mb-3 pb-3 text-sm text-slate-400">
                        Community project that use and extend the Sigma ecosystem.</p>
                    <ul>
                        <li>
                            <a class="text-[var(--vp-c-brand-3)]" href="https://github.com/joesecurity/sigma-rules">
                                Joe Security Sigma Rules <ArrowTopRightOnSquareIcon class="text-slate-400 dark:text-cyan-300/30 ml-1 h-[14px] w-[14px] inline" />
                            </a>
                        </li>
                        <li>
                            <a class="text-[var(--vp-c-brand-3)]" href="https://sigconverter.io/">
                                Sigma Rule Converter<ArrowTopRightOnSquareIcon class="text-slate-400 dark:text-cyan-300/30 ml-1 h-[14px] w-[14px] inline" />
                            </a>
                        </li>
                    </ul>
                </section>
            </div>


            <section id="guides" class="flex flex-col gap-2">
                <h2 class="text-xl font-semibold border-b border-slate-500/10 mb-3 pb-3">
                    Acknowledgements
                </h2>
                <p class="text-sm text-slate-400">
                    Sigma would not be possible without the hard work and dedications of hundreds of online contributors through Github.<br />If you would like to support the project in any way, please visit our <a class="text-[var(--vp-c-brand-3)]" :href="withBase('/docs/guide/about.html#contributing')">contribute guide on the sigma documentation page</a>.
                </p>
            </section>
        </main>
    </div>


    <VPFooter/>
    <slot name="layout-bottom"/>
</template>

<style>
#hero-title {
    background: transparent;
}

.dark #hero-title {
    background: linear-gradient(to bottom right, #a5c0d3 0%, #fff 50%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

#hero-title span {
    background: linear-gradient(to right, var(--vp-c-brand-1), var(--vp-c-brand-3));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
</style>
