<script setup>
import DefaultTheme from "vitepress/theme";
import { useData } from "vitepress/dist/client/theme-default/composables/data";
import {
  ArrowTopRightOnSquareIcon,
  ChevronRightIcon,
} from "@heroicons/vue/20/solid";
import Docsv2 from "./Docsv2.vue";
import BlogPostLink from "../components/Resources/BlogPostLink.vue";

const { Layout } = DefaultTheme;
const { frontmatter } = useData();

import { data } from "/.vitepress/theme/lib/blog.data";
import {
  BeakerIcon,
  DocumentCheckIcon,
  RectangleStackIcon,
} from "@heroicons/vue/24/solid";
import Box from "../components/Boxes/Box.vue";
import { ref } from "vue";
import { withBase } from "vitepress";

let repos = ref([
  {
    subtitle: "Open Source",
    title: "SigmaHQ Rules",
    description:
      "The largest open-source collection of Sigma rules available today.",
    link: "https://github.com/SigmaHQ/sigma/",
    og_image:
      "https://opengraph.githubassets.com/b08dbe185bfa8602d17f3dffde462983ace431715451263787ba4363b3f44ed2/SigmaHQ/sigma",
    og_image_alt: "Sigma Open Source Rule Repository",
  },
]);

let tools = ref([
  {
    subtitle: "Open Source",
    title: "Sigma CLI",
    description: "The official Sigma CLI tool for converting Sigma rules.",
    link: "https://github.com/SigmaHQ/sigma-cli/",
    og_image:
      "https://opengraph.githubassets.com/80a94aeec91ddf05d855a0bf131f0cbd9736bddaa8573e453b48a914a6f4246c/SigmaHQ/sigma-cli",
    og_image_alt: "SigmaHQ Github Open Graph Image",
  },
  {
    subtitle: "Open Source",
    title: "pySigma",
    description: "The Python library powering all Sigma conversions.",
    link: "https://github.com/SigmaHQ/pySigma/",
    og_image:
      "https://opengraph.githubassets.com/80a94aeec91ddf05d855a0bf131f0cbd9736bddaa8573e453b48a914a6f4246c/SigmaHQ/pySigma",
    og_image_alt: "SigmaHQ Github Open Graph Image",
  },
  {
    subtitle: "Open Source",
    title: "sigconverter.io",
    description: "An Open Source Sigma conversion tool.",
    link: "https://sigconverter.io",
    og_image: withBase("/images/sigconverter.png"),
    og_image_alt: "Sigma Open Source Conversion Tool",
  },
]);
</script>

<template>
  <Docsv2 class="resources-page">
    <template #doc-after>
      <div class="vp-doc md:gap-22 flex flex-col justify-between gap-16">
        <section>
          <h1 class="!text-4xl">Resources</h1>
          <p class="text-slate-500">
            Explore all the resources around the Sigma standard, including
            guides, blog posts, tooling and more.
          </p>
        </section>
        <section id="rule-repos">
          <span
            class="text-sm font-semibold text-indigo-500 dark:text-indigo-400/80"
            >Sigma Rule Collections</span
          >
          <h2 class="!border-0">Rule Repositories</h2>
          <p class="text-slate-500">
            Find Sigma detections applicable to your organisation.
          </p>
          <div class="mt-5 grid gap-4">
            <a
              v-for="repo in repos"
              target="_blank"
              :href="repo.link"
              class="box group relative z-10 flex h-full w-full flex-col items-center gap-4 overflow-hidden rounded-xl bg-[#E3F2FA]/40 p-6 px-6 py-6 !text-inherit text-white outline outline-1 outline-[#C6D2ED]/40 !transition-all hover:bg-[#DEF5FC] hover:!no-underline hover:outline-2 hover:outline-[#AAD0EC] dark:bg-[#252C3B]/25 dark:outline-[#383C5E]/50 dark:hover:bg-[#37455E]/40 dark:hover:outline-[var(--vp-c-brand-1)] md:flex-row md:px-8 md:py-7"
            >
              <div class="md:order-2">
                <img
                  :src="repo.og_image"
                  :alt="repo.og_image_alt"
                  class="w-full rounded shadow-xl md:w-60 lg:w-80"
                />
              </div>
              <div class="w-full md:order-1">
                <h3>{{ repo.title }}</h3>
                <div class="!mb-4 items-baseline gap-2 md:flex">
                  <p class="inline text-slate-500">{{ repo.description }}</p>
                  <Badge type="tip" :text="repo.subtitle" class="inline" />
                </div>

                <button
                  class="rounded-lg bg-sky-400 p-2 px-4 text-sm font-semibold text-white transition-all group-hover:bg-sky-500 dark:bg-sky-500 dark:shadow group-hover:dark:bg-sky-600"
                >
                  Explore <ChevronRightIcon class="inline-block h-5 w-5" />
                </button>
              </div>
            </a>
          </div>
        </section>
        <section id="tools">
          <span
            class="text-sm font-semibold text-indigo-500 dark:text-indigo-400/80"
            >Tools & Utilities</span
          >
          <h2 class="!border-0">Tools</h2>
          <p class="text-slate-500">
            Check out the many SigmaHQ and community tools.
          </p>
          <div class="mt-5 grid gap-4">
            <div class="grid gap-4">
              <a
                v-for="tool in tools"
                target="_blank"
                :href="tool.link"
                class="box group relative z-10 flex h-full w-full flex-col items-center gap-4 overflow-hidden rounded-xl bg-[#E3F2FA]/40 p-6 px-6 py-6 !text-inherit text-white outline outline-1 outline-[#C6D2ED]/40 !transition-all hover:bg-[#DEF5FC] hover:!no-underline hover:outline-2 hover:outline-[#AAD0EC] dark:bg-[#252C3B]/25 dark:outline-[#383C5E]/50 dark:hover:bg-[#37455E]/40 dark:hover:outline-[var(--vp-c-brand-1)] md:flex-row md:px-8 md:py-7"
              >
                <div class="md:order-2">
                  <img
                    :src="tool.og_image"
                    :alt="tool.og_image_alt"
                    class="w-full rounded shadow-xl md:w-60 lg:w-80"
                  />
                </div>
                <div class="w-full md:order-1">
                  <h3>{{ tool.title }}</h3>
                  <div class="!mb-4 items-baseline gap-2 md:flex">
                    <p class="inline text-slate-500">{{ tool.description }}</p>
                    <Badge type="tip" :text="tool.subtitle" class="inline" />
                  </div>

                  <button
                    class="rounded-lg bg-sky-400 p-2 px-4 text-sm font-semibold text-white transition-all group-hover:bg-sky-500 dark:bg-sky-500 dark:shadow group-hover:dark:bg-sky-600"
                  >
                    Learn More <ChevronRightIcon class="inline-block h-5 w-5" />
                  </button>
                </div>
              </a>
            </div>
          </div>
        </section>
        <section id="blog-posts">
          <span
            class="text-sm font-semibold text-indigo-500 dark:text-indigo-400/80"
            >Guides and Walkthroughs</span
          >
          <h2 class="!border-0">Blog Posts</h2>
          <p class="text-slate-500">
            Check out the many SigmaHQ and community blog posts.
          </p>
          <div class="mt-5 grid gap-4 md:grid-cols-2">
            <BlogPostLink
              v-for="post in data.posts"
              :href="post.requestUrl"
              :img_src="post.ogImage[0]?.url"
              :title="post.ogTitle"
              :description="
                post?.ogDescription ||
                'Check out this exciting new Sigma Blog Post...'
              "
            ></BlogPostLink>
          </div>
        </section>

        <section id="explore" class="flex flex-col gap-8">
          <div class="flex flex-col">
            <h2 class="mb-6 !border-0 pb-4 text-2xl font-semibold">
              Explore the Docs
            </h2>
            <p class="text-slate-500">
              Get the most out of the Sigma ecosystem in your SIEM, and start
              using thousands of great security detections from the community
              and beyond.
            </p>
          </div>
          <div class="grid gap-4 md:grid-cols-3">
            <a target="_blank" href="https://github.com/SigmaHQ/sigma/">
              <Box>
                <template #icon><RectangleStackIcon /></template>
                <template #heading
                  >Rule Repository
                  <ArrowTopRightOnSquareIcon
                    class="ml-1 inline h-[14px] w-[14px] text-slate-400 dark:text-white/30"
                /></template>
                <template #text
                  >Explore the thousands of existing Sigma detections in
                  SigmaHQ/sigma.</template
                >
              </Box>
            </a>
            <a
              target="_blank"
              href="https://github.com/SigmaHQ/sigma-specification"
            >
              <Box>
                <template #icon><DocumentCheckIcon /></template>
                <template #heading
                  >Specification
                  <ArrowTopRightOnSquareIcon
                    class="ml-1 inline h-[14px] w-[14px] text-slate-400 dark:text-white/30"
                  />
                </template>
                <template #text
                  >Learn more about how to use the Sigma detection
                  format.</template
                >
              </Box>
            </a>
            <a
              target="_blank"
              href="https://github.com/SigmaHQ/sigma-specification/tree/version_2"
            >
              <Box>
                <template #icon><BeakerIcon /></template>
                <template #heading>
                  Specification (v2) <Badge type="tip" text="In Dev" />
                  <ArrowTopRightOnSquareIcon
                    class="ml-1 inline h-[14px] w-[14px] text-slate-400 dark:text-white/30"
                  />
                </template>
                <template #text
                  >Shape the future of the Sigma specification.</template
                >
              </Box>
            </a>
          </div>
        </section>
      </div>
    </template>
  </Docsv2>
</template>

<style scoped>
h1,
h2,
h3,
h4,
h5,
h6,
p {
  margin: 0;
  padding: 0;
}
</style>

<style>
.resources-page .content-container {
  max-width: 940px;
}
</style>
