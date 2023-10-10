<script setup>
import DefaultTheme from 'vitepress/theme'
import DraftWarning from "../components/DraftWarning.vue";
import WideSigmav2Warning from "../components/WideSigmav2Warning.vue";
import OutdatedWarning from "../components/OutdatedWarning.vue";
import WideOutdatedWarning from "../components/WideOutdatedWarning.vue";
import {useData} from "vitepress/dist/client/theme-default/composables/data";

const { Layout } = DefaultTheme
const { frontmatter } = useData()
</script>

<template>
    <Layout>
        <template #nav-bar-title-after>
            <div class="block text-[10pt] text-[var(--vp-c-brand-1)] translate-x-[-60px] translate-y-[20px]">
                Documentation&nbsp;v1
            </div>
        </template>

        <template #nav-bar-content-before>
            <div class="flex space-x-2 px-2">
                <!-- Draft -->
                <DraftWarning class="hidden md:block"/>

                <!-- v1 -->
                <!--            <v1-warning class="hidden md:block translate-y-3"/>-->
            </div>
        </template>

        <template #doc-before>
            <div class="flex flex-col gap-4 pb-8">
                <!-- Draft -->
                <DraftWarning class="block md:hidden w-full mb-0"/>
                <OutdatedWarning class="block md:hidden w-full mb-0"/>
                <WideOutdatedWarning v-if="false" class="lg:mx-auto w-full"></WideOutdatedWarning>
            </div>

        </template>

        <template #aside-bottom>
            <!-- Sigma v1 vs v2 -->
            <WideSigmav2Warning/>
        </template>
    </Layout>
</template>

<style>

</style>
