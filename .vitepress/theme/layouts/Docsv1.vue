<script setup>
import DefaultTheme from "vitepress/theme";
import DraftWarning from "../components/DraftWarning.vue";
import WideSigmav2Warning from "../components/WideSigmav2Warning.vue";
import OutdatedWarning from "../components/OutdatedWarning.vue";
import WideOutdatedWarning from "../components/WideOutdatedWarning.vue";

const { Layout } = DefaultTheme;
</script>

<template>
  <Layout>
    <template #nav-bar-title-after>
      <div
        class="block translate-x-[-60px] translate-y-[20px] text-[10pt] text-[var(--vp-c-brand-1)]"
      >
        Documentation&nbsp;v1
      </div>
    </template>

    <template #nav-bar-content-before>
      <div class="flex space-x-2 px-2">
        <!-- Draft -->
        <DraftWarning class="hidden md:block" />

        <!-- v1 -->
        <!--            <v1-warning class="hidden md:block translate-y-3"/>-->
      </div>
    </template>

    <template #doc-before>
      <div class="flex flex-col gap-4 pb-8">
        <!-- Draft -->
        <DraftWarning class="mb-0 block w-full md:hidden" />
        <OutdatedWarning class="mb-0 block w-full md:hidden" />
        <WideOutdatedWarning
          v-if="false"
          class="w-full lg:mx-auto"
        ></WideOutdatedWarning>
      </div>
    </template>

    <template #aside-bottom>
      <!-- Sigma v1 vs v2 -->
      <WideSigmav2Warning />
    </template>
  </Layout>
</template>

<style></style>
