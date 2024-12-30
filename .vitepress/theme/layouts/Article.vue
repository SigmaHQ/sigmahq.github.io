<script setup>
import { Content } from "vitepress";

import VPSkipLink from "vitepress/dist/client/theme-default/components/VPSkipLink.vue";
import VPNav from "vitepress/dist/client/theme-default/components/VPNav.vue";
import VPFooter from "vitepress/dist/client/theme-default/components/VPFooter.vue";
import { ChevronLeftIcon } from "@heroicons/vue/24/solid";
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
    <article id="article" class="vp-doc mx-auto max-w-3xl lg:pt-40">
      <a href="/blog/" class="mb-10 block"
        ><ChevronLeftIcon
          class="mr-2 inline-block h-4 w-4 -translate-y-0.5"
        />Back</a
      >
      <section class="heading-section flex flex-col gap-4">
        <div class="flex items-center gap-4">
          <img
            :src="$frontmatter.author.image_url"
            width="30"
            height="30"
            class="rounded-full"
            alt=""
          />
          <span class="font-semibold dark:text-slate-400 md:text-lg">{{
            $frontmatter.author.name
          }}</span>
          <span
            class="font-semibold text-slate-300 dark:text-slate-700 md:text-lg"
            >{{ $frontmatter.date }}</span
          >
        </div>
        <h1 class="!m-0 text-5xl">{{ $frontmatter.title }}</h1>
        <h3 class="!m-0 text-2xl text-slate-500 dark:text-slate-500">
          {{ $frontmatter.subtitle }}
        </h3>
      </section>

      <Content id="content" />
    </article>
  </main>

  <VPFooter />
  <slot name="layout-bottom" />
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
