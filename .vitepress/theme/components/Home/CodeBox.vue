<template>
    <div class="relative">
        <div id="window-wrapper" class="md:absolute top-0 left-0 md:translate-y-[-50%] flex flex-col gap-2 lg:gap-4">

            <div id="window" class=" rounded-xl w-full p-4 md:p-8 md:pr-32 text-xs lg:text-sm">
                <div class="line hidden lg:block"></div>
                <div id="window-actions" class="h-3 md:h-6 flex gap-2">
                    <div class="h-3 w-3 bg-slate-400/20 rounded-full"></div>
                    <div class="h-3 w-3 bg-slate-400/20 rounded-full"></div>
                    <div class="h-3 w-3 bg-slate-400/20 rounded-full"></div>
                </div>

                <div class="glow-top"></div>
                <div class="glow-bottom"></div>
                <div class="absolute text-xs text-slate-400/60 w-full text-center left-0 top-6 hidden md:block">aws_root_account_usage.yml</div>
                <pre class="lg:pl-8 text-wrap md:text-nowrap break-all" v-html="sigma_rule_hl"></pre>
            </div>
            <div class="flex w-full justify-center md:justify-start lg:justify-center gap-2">
<!--                <div class="absolute w-3 bg-[var(&#45;&#45;vp-c-brand-2)] -z-10 h-[200px] -translate-y-[50%]"></div>-->
                <pre class="rounded text-sm bg-slate-900 dark:bg-[#0d0e13] text-slate-300 inline-block py-1.5 px-2.5 text-wrap md:text-nowrap relative"><span class="text-[var(--vp-c-brand)]">$ </span>sigma convert <span class="text-slate-500">&#8209;t</span> splunk <span class="text-slate-500">&#8209;p</span>&nbsp;./config.yml</pre>
                <a class="w-12 md:w-8 bg-slate-700 dark:bg-slate-400/20 rounded flex items-center justify-center hover:bg-sigma-500 transition-all outline outline-transparent outline-2 outline-offset-2 hover:outline-sigma-500" target="_blank"
                   href="https://sigconverter.io/#backend=splunk&format=default&pipeline=&rule=dGl0bGU6IEFXUyBSb290IENyZWRlbnRpYWxzCmRlc2NyaXB0aW9uOiBEZXRlY3RzIEFXUyByb290IGFjY291bnQgdXNhZ2UKbG9nc291cmNlOgogICAgcHJvZHVjdDogYXdzCiAgICBzZXJ2aWNlOiBjbG91ZHRyYWlsCmRldGVjdGlvbjoKICAgIHNlbGVjdGlvbjoKICAgICAgICB1c2VySWRlbnRpdHkudHlwZTogUm9vdAogICAgZmlsdGVyOgogICAgICAgIGV2ZW50VHlwZTogQXdzU2VydmljZUV2ZW50CiAgICBjb25kaXRpb246IHNlbGVjdGlvbiBhbmQgbm90IGZpbHRlcgpmYWxzZXBvc2l0aXZlczoKICAgIC0gQVdTIFRhc2tzIFRoYXQgUmVxdWlyZSBSb290IFVzZXIgQ3JlZGVudGlhbHMKbGV2ZWw6IG1lZGl1bQ%3D%3D&pipelineYml=bmFtZTogRXhhbXBsZSBQaXBlbGluZQpwcmlvcml0eTogMzAKdHJhbnNmb3JtYXRpb25zOgotIGlkOiBzb3VyY2V0eXBlX2NvbmRpdGlvbgogIHR5cGU6IGFkZF9jb25kaXRpb24KICBjb25kaXRpb25zOgogICAgc291cmNldHlwZTogImF3czpjbG91ZHRyYWlsIgogIHJ1bGVfY29uZGl0aW9uczoKICAtIHR5cGU6IGxvZ3NvdXJjZQogICAgcHJvZHVjdDogYXdzCiAgICBzZXJ2aWNlOiBjbG91ZHRyYWls" >
                    <ArrowUturnLeftIcon class="h-4 w-4 text-white inline-block -scale-y-100" />
                </a>
            </div>
            <div id="splunk-output" class="rounded-xl w-full p-4 md:p-4 text-xs lg:text-sm">
                <div class="glow-top splunk"></div>
                <div class="glow-bottom splunk"></div>
                <div class="flex items-center gap-4 w-full">
                    <div class="splunk-icon shrink">
                        <img src="/images/backend_logos/splunk.png" alt="" class="" width="38" height="38">
                    </div>
                    <pre class="text-green-100 text-wrap" v-html="splunk_output_hl"></pre>
                </div>
            </div>

            <p class="text-center w-full text-xs dark:text-slate-500 hidden md:block">... or <a class="font-medium text-[var(--vp-c-brand-1)] dark:font-normal dark:text-[var(--vp-c-brand-3)]" href="/docs/digging-deeper/backends#available">any supported SIEM</a>.</p>

            <ThatSigmaBlur/>
        </div>
    </div>
</template>

<script setup>

import {onMounted, ref} from "vue";

import hljs from 'highlight.js/lib/core'
import yaml from 'highlight.js/lib/languages/yaml'
import splunk from 'highlightjs-spl'
import ThatSigmaBlur from "../ThatSigmaBlur.vue";
import {ArrowLongDownIcon} from "@heroicons/vue/24/solid/index.js";
import {ArrowUturnLeftIcon} from "@heroicons/vue/20/solid/index.js";

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

let output = `sourcetype="aws:cloudtrail" userIdentity.type="Root" NOT eventType="AwsServiceEvent"`

let sigma_rule_hl = ref('')
let splunk_output_hl = ref('')

// onMounted(() => {
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('spl', splunk);
sigma_rule_hl.value = hljs.highlight(code, {language: 'yaml'}).value
splunk_output_hl.value = hljs.highlight(output, {language: 'spl'}).value
// })

</script>

<style scoped>
#window {
    background-image: linear-gradient(290deg, hsla(210, 80%, 10%, 0.9) 0%, hsla(210, 50%, 18%, 0.9) 100%);
    border: 1px solid hsl(218, 26%, 6%);
    backdrop-filter: blur(40px);
    box-shadow: inset 0 0 30px rgba(0,0,0,0.2);
}

#splunk-output {
    background-image: linear-gradient(290deg, hsla(170, 100%, 8%, 0.9) 0%, hsla(160, 100%, 10%, 0.9) 100%);
    border: 1px solid hsl(140, 26%, 6%);
    backdrop-filter: blur(40px);
    box-shadow: inset 0 0 30px rgba(0,0,0,0.2);
}

html.dark #window {
    background-image: linear-gradient(270deg, #12161F 0%, #101217 100%);
    border: 1px solid #1f2429;
    box-shadow: 0 20px 50px rgba(0,0,0,0.2);
}

html.dark #splunk-output {
    background-image: linear-gradient(270deg, hsl(160, 27%, 10%) 0%, hsl(170, 18%, 8%) 100%);
    border: 1px solid hsl(160, 30%, 20%);
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

.glow-top.splunk, .glow-bottom.splunk {
    top: -1px;
    z-index: 50;
    background: linear-gradient(to right, hsla(191, 100%, 42%, 0) 20%, hsl(91, 50%, 60%) 50%, hsla(191, 100%, 42%, 0) 80%);
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

.glow-top.splunk:after, .glow-bottom.splunk:after {
    background: linear-gradient(to right, #1f2429 20%, hsl(91, 39%, 46%) 50%, #1f2429 80%);
}

.glow-bottom {
    top: auto;
    bottom: 0;
}

.glow-bottom.splunk {
    top: auto;
    bottom: -1px;
}

pre {
    /*white-space: nowrap;*/
    /*text-overflow: ellipsis;*/
    /*overflow: hidden;*/
}

.line {
    height: 100%;
    bottom: 0;
    top: 0;
    width: 1px;
    background: linear-gradient(0deg, hsla(218, 26%, 40%, 1) 0%, hsla(218, 26%, 40%, 1) 60%, hsla(218, 26%, 40%, 0) 86%, hsla(218, 26%, 40%, 0) 95%);
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

#splunk-output .hljs-literal {
    @apply text-orange-400;
}

#splunk-output .hljs-string {
    @apply text-green-300;
}
</style>