<template>
    <div class="relative">
        <div id="window-wrapper" class="md:absolute top-0 left-0 md:translate-y-[-50%]">
            <div class="line hidden lg:block"></div>
            <div id="window" class="overflow-hidden rounded-xl w-full p-4 md:p-8 md:pr-32 text-xs lg:text-sm">
                <div id="window-actions" class="h-3 md:h-6 flex gap-2">
                    <div class="h-3 w-3 bg-slate-400/20 rounded-full"></div>
                    <div class="h-3 w-3 bg-slate-400/20 rounded-full"></div>
                    <div class="h-3 w-3 bg-slate-400/20 rounded-full"></div>
                </div>

                <div class="glow-top"></div>
                <div class="glow-bottom"></div>
                <pre class="max-w-[526px] w-[calc(100vw-80px)] md:w-auto md:max-w-none lg:pl-8" v-html="highlighted"></pre>
            </div>

            <ThatSigmaBlur/>
        </div>
    </div>
</template>

<script setup>

import {onMounted, ref} from "vue";

import hljs from 'highlight.js/lib/core'
import yaml from 'highlight.js/lib/languages/yaml'
import ThatSigmaBlur from "../ThatSigmaBlur.vue";

let code = `
title: AWS Root Credentials
description: Detects AWS root account usage
logsource:
    product: aws
    service: cloudtrail
detection:
    selection:
        userIdentity.type: Root
    filter:
        eventType: AwsServiceEvent
    condition: selection and not filter
falsepositives:
    - AWS Tasks That Require Root User Credentials
level: medium
`

let highlighted = ref('')

// onMounted(() => {
hljs.registerLanguage('yaml', yaml);
highlighted.value = hljs.highlight(code, {language: 'yaml'}).value
// })

</script>

<style scoped>
#window {
    background-image: linear-gradient(290deg, hsla(210, 80%, 10%, 0.9) 0%, hsla(210, 50%, 18%, 0.9) 100%);
    border: 1px solid hsl(218, 26%, 6%);
    backdrop-filter: blur(40px);
    box-shadow: inset 0 0 30px rgba(0,0,0,0.2);
}

html.dark #window {
    background-image: linear-gradient(270deg, #12161F 0%, #101217 100%);
    border: 1px solid #1f2429;
    box-shadow: 0 20px 50px rgba(0,0,0,0.2);
}

.glow-top, .glow-bottom {
    position: absolute;
    height: 1px;
    top: 0px;
    left: 15px;
    right: 15px;
    z-index: 40;
    background: linear-gradient(to right, #00B0D600 20%, var(--vp-c-brand-1) 50%, #00B0D600 80%);
    opacity: .8;
    display: none;
}

html.dark .glow-top, html.dark .glow-bottom {
    display: block;
}

.glow-top:after, .glow-bottom:after {
    content: '';
    position: absolute;
    display: block;
    height: 10px;
    top: -5px;
    filter: blur(20px);
    left: 15px;
    right: 15px;
    z-index: 40;
    background: linear-gradient(to right, #1f2429 20%, var(--vp-c-brand-1) 50%, #1f2429 80%);
    opacity: .4;
}

.glow-bottom {
    top: auto;
    bottom: 0px;
}

pre {
    /*white-space: nowrap;*/
    text-overflow: ellipsis;
    overflow: hidden;
}

.line {
    height: 100%;
    width: 1px;
    background: linear-gradient(0deg, hsla(218, 26%, 40%, 1) 0%, hsla(218, 26%, 40%, 1) 84%, hsla(218, 26%, 40%, 0) 86%, hsla(218, 26%, 40%, 0) 95%);
    position: absolute;
    left: 35px;
    z-index: 2;
    opacity: .3;
}
html.dark .line {
    background: linear-gradient(0deg, rgba(31,36,41,1) 0%, rgba(31,36,41,1) 84%, rgba(31,36,41,0) 86%, rgba(31,36,41,0) 95%);
    opacity: .3;
}
</style>

<style>
.hljs-attr, .hljs-bullet {
    color: var(--vp-c-brand-1);
}

html:not(.dark) .hljs-string {
    color: #FFFFFF;
}
</style>