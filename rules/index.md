---
title: 'SigmaHQ Rules'
subtitle: 'Detection'
---

<!--suppress ES6UnusedImports -->
<script setup>
import {withBase} from "vitepress";

import DefaultTheme from 'vitepress/theme'
import {useData} from "vitepress/dist/client/theme-default/composables/data";
import {ArrowTopRightOnSquareIcon, ChevronRightIcon} from "@heroicons/vue/20/solid";

const { Layout } = DefaultTheme
const { frontmatter } = useData()

import { data } from '/.vitepress/theme/lib/blog.data'
import {BeakerIcon, DocumentCheckIcon, RectangleStackIcon} from "@heroicons/vue/24/solid";
import Box from "/.vitepress/theme/components/Boxes/Box.vue";
import {ref} from "vue";

let ruleTypes = ref([
    {
        title: 'Detection Rules',
        description: 'Threat agnostic rules. their aim is to detect a behavior or an implementation of a technique or procedure that was, can or will be used by a potential threat actor.',
        link: '/rules/detection/',
        og_image: withBase('/images/detection_rules.png'),
        og_image_alt: 'Sigma Open Source Conversion Tool'
    },
    {
        title: 'Emerging Threats Rules',
        description: 'Rules that cover specific threats, that are timely and relevant for certain periods of time. These threats include specific APT campaigns, exploitation of Zero-Day vulnerabilities, specific malware used during an attack,...etc.',
        link: '/rules/emerging-threats/',
        og_image: withBase('/images/emerging_threats.png'),
        og_image_alt: 'Sigma Open Source Conversion Tool'
    },
    {
        title: 'Threat Hunting Rules',
        description: 'Are broader in scope and are meant to give the analyst a starting point to hunt for potential suspicious or malicious activity',
        link: '/rules/threat-hunting/',
        og_image: withBase('/images/threat_hunting.png'),
        og_image_alt: 'Sigma Open Source Conversion Tool'
    }
])

</script>

# {{ $frontmatter.title }}

The place where detection engineers, threat hunters and all defensive security practitioners collaborate on detection rules. The repository offers more than 3000 detection rules of different type and aims to make reliable detections accessible to all at no cost.


<section id="rule-ruleTypes">
    <h2 class="!border-0">Explore Sigma Rules</h2>
    <p class="text-slate-500 ">Find Sigma detections applicable to your organisation.</p>
    <div class="grid gap-4 mt-5">
        <a v-for="rtype in ruleTypes" target="_blank" :href="rtype.link" class="box hover:!no-underline !text-inherit py-6 md:py-7 px-6 md:px-8 w-full group !transition-all rounded-xl md:flex-row items-center overflow-hidden gap-4 h-full relative z-10 p-6 outline outline-1 hover:outline-2 bg-[#E3F2FA]/40 outline-[#C6D2ED]/40 hover:bg-[#DEF5FC] hover:outline-[#AAD0EC] dark:outline-[#383C5E]/50 dark:bg-[#252C3B]/25 dark:hover:bg-[#37455E]/40 dark:hover:outline-[var(--vp-c-brand-1)] text-white flex flex-col group">
            <div class="md:order-2">
                <img :src="rtype.og_image" :alt="rtype.og_image_alt" class="w-full md:w-60 lg:w-80 rounded shadow-xl">
            </div>
            <div class="md:order-1 w-full">
                <h3>{{ rtype.title }}</h3>
                <div class="md:flex gap-2 items-baseline !mb-4">
                    <p class="text-slate-500 inline">{{ rtype.description }}</p>
                </div>
                <button class="text-sm rounded-lg bg-sky-400 dark:bg-sky-500 group-hover:bg-sky-500 group-hover:dark:bg-sky-600 dark:shadow transition-all text-white p-2 px-4 font-semibold">
                    Explore <ChevronRightIcon class="w-5 h-5 inline-block"/>
                </button>
            </div>
        </a>
    </div>
</section>
