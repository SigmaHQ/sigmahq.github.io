<script setup>
import { useData } from "vitepress";

import VPSkipLink from "vitepress/dist/client/theme-default/components/VPSkipLink.vue";
import VPNav from "vitepress/dist/client/theme-default/components/VPNav.vue";
import VPFooter from "vitepress/dist/client/theme-default/components/VPFooter.vue";

const { frontmatter } = useData();
</script>

<template>
  <slot name="layout-top" />
  <VPSkipLink />
  <VPNav>
    <template #nav-bar-title-after>
      <div
        class="block translate-x-[-54px] translate-y-[16px] text-[9pt] text-[var(--vp-c-brand-1)]"
      >
        Blog
      </div>
    </template>
  </VPNav>

  <main
    class="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-12 lg:px-16 xl:gap-20 xl:px-8"
    style=""
  >
    <article id="article" class="lg:pt-40"></article>
  </main>

  <VPFooter />
  <slot name="layout-bottom" />
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
  background: linear-gradient(
    to right,
    var(--vp-c-brand-1),
    var(--vp-c-brand-3)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
