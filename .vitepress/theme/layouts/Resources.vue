<script setup>
import DefaultTheme from 'vitepress/theme'
import {useData} from "vitepress/dist/client/theme-default/composables/data";
import {ArrowTopRightOnSquareIcon, ChevronRightIcon} from "@heroicons/vue/20/solid";
import Docsv2 from "./Docsv2.vue";
import BlogPostLink from "../components/Resources/BlogPostLink.vue";
import { data } from '/.vitepress/theme/lib/blog.data'
import {BeakerIcon, DocumentCheckIcon, RectangleStackIcon} from "@heroicons/vue/24/solid";
import Box from "../components/Boxes/Box.vue";
import {ref} from "vue";
import {withBase} from "vitepress";

const { Layout } = DefaultTheme
const { frontmatter } = useData()

let repos = ref([
  {
    subtitle: 'Open Source',
    title: 'SigmaHQ Rules',
    description: 'The largest open-source collection of Sigma rules available today.',
    link: 'https://github.com/SigmaHQ/sigma/',
    og_image: 'https://opengraph.githubassets.com/b08dbe185bfa8602d17f3dffde462983ace431715451263787ba4363b3f44ed2/SigmaHQ/sigma',
    og_image_alt: 'Sigma Open Source Rule Repository'
  }
])

let tools = ref([
  {
    subtitle: 'Open Source',
    title: 'Sigma CLI',
    description: 'The official Sigma CLI tool for converting Sigma rules.',
    link: 'https://github.com/SigmaHQ/sigma-cli/',
    og_image: 'https://opengraph.githubassets.com/80a94aeec91ddf05d855a0bf131f0cbd9736bddaa8573e453b48a914a6f4246c/SigmaHQ/sigma-cli',
    og_image_alt: 'SigmaHQ Github Open Graph Image'
  },
  {
    subtitle: 'Open Source',
    title: 'pySigma',
    description: 'The Python library powering all Sigma conversions.',
    link: 'https://github.com/SigmaHQ/pySigma/',
    og_image: 'https://opengraph.githubassets.com/80a94aeec91ddf05d855a0bf131f0cbd9736bddaa8573e453b48a914a6f4246c/SigmaHQ/pySigma',
    og_image_alt: 'SigmaHQ Github Open Graph Image'
  },
  {
    subtitle: 'Open Source',
    title: 'sigconverter.io',
    description: 'An Open Source Sigma conversion tool.',
    link: 'https://sigconverter.io',
    og_image: withBase('/images/sigconvertor.png'),
    og_image_alt: 'Sigma Open Source Conversion Tool'
  }
])

</script>

<template>
    <Docsv2 class="resources-page">
        <template #doc-after>
            <div class="vp-doc flex flex-col gap-16 md:gap-22 justify-between">
                <section>
                    <h1 class="!text-4xl">Resources</h1>
                    <p class="text-slate-500 ">Explore all the resources around the Sigma standard, including guides, blog posts, tooling and more.</p>
                </section>
                <section id="rule-repos">
                    <span class="text-indigo-500 dark:text-indigo-400/80 text-sm font-semibold ">Sigma Rule Collections</span>
                    <h2 class="!border-0">Rule Repositories</h2>
                    <p class="text-slate-500 ">Find Sigma detections applicable to your organisation.</p>
                    <div class="grid gap-4 mt-5">
                        <a v-for="repo in repos" target="_blank" :href="repo.link" class="box hover:!no-underline !text-inherit py-6 md:py-7 px-6 md:px-8 w-full group !transition-all rounded-xl md:flex-row items-center overflow-hidden gap-4
 h-full relative z-10 p-6 outline outline-1 hover:outline-2 bg-[#E3F2FA]/40 outline-[#C6D2ED]/40 hover:bg-[#DEF5FC] hover:outline-[#AAD0EC] dark:outline-[#383C5E]/50 dark:bg-[#252C3B]/25 dark:hover:bg-[#37455E]/40 dark:hover:outline-[var(--vp-c-brand-1)] text-white flex flex-col group">
                            <div class="md:order-2">
                                <img :src="repo.og_image" :alt="repo.og_image_alt" class="w-full md:w-60 lg:w-80 rounded shadow-xl">
                            </div>
                            <div class="md:order-1 w-full">
                              <h3>{{ repo.title }}</h3>
                                    <div class="md:flex gap-2 items-baseline !mb-4">
                                      <p class="text-slate-500 inline">{{ repo.description }}</p>
                                      <Badge type="tip" :text="repo.subtitle" class="inline"/>
                                    </div>


                                <button class="text-sm rounded-lg bg-sky-400 dark:bg-sky-500 group-hover:bg-sky-500 group-hover:dark:bg-sky-600 dark:shadow transition-all text-white p-2 px-4 font-semibold">
                                    Explore <ChevronRightIcon class="w-5 h-5 inline-block"/>
                                </button>
                            </div>
                        </a>
                    </div>
                </section>
                <section id="tools">
                    <span class="text-indigo-500 dark:text-indigo-400/80 text-sm font-semibold ">Tools & Utilities</span>
                    <h2 class="!border-0 ">Tools</h2>
                    <p class="text-slate-500 ">Check out the many SigmaHQ and community tools.</p>
                    <div class="grid gap-4 mt-5">
                        <div class="grid gap-4">
                            <a v-for="tool in tools" target="_blank" :href="tool.link" class="box hover:!no-underline !text-inherit py-6 md:py-7 px-6 md:px-8 w-full group !transition-all rounded-xl md:flex-row items-center overflow-hidden gap-4 h-full relative z-10 p-6 outline outline-1 hover:outline-2 bg-[#E3F2FA]/40 outline-[#C6D2ED]/40 hover:bg-[#DEF5FC] hover:outline-[#AAD0EC] dark:outline-[#383C5E]/50 dark:bg-[#252C3B]/25 dark:hover:bg-[#37455E]/40 dark:hover:outline-[var(--vp-c-brand-1)] text-white flex flex-col group">
                                <div class="md:order-2">
                                    <img :src="tool.og_image" :alt="tool.og_image_alt" class="w-full md:w-60 lg:w-80 rounded shadow-xl">
                                </div>
                                <div class="md:order-1 w-full">

                                  <h3>{{ tool.title }}</h3>
                                    <div class="md:flex gap-2 items-baseline !mb-4">
                                      <p class="text-slate-500 inline">{{ tool.description }}</p>
                                      <Badge type="tip" :text="tool.subtitle" class="inline"/>
                                    </div>


                                    <button class="text-sm rounded-lg bg-sky-400 dark:bg-sky-500 group-hover:bg-sky-500 group-hover:dark:bg-sky-600 dark:shadow transition-all text-white p-2 px-4 font-semibold">
                                        Learn More <ChevronRightIcon class="w-5 h-5 inline-block"/>
                                    </button>
                                </div>
                            </a>
                        </div>
                    </div>
                </section>
                <section id="blog-posts">
                    <span class="text-indigo-500 dark:text-indigo-400/80 text-sm font-semibold ">Guides and Walkthroughs</span>
                    <h2 class="!border-0 ">Blog Posts</h2>
                    <p class="text-slate-500 ">Check out the many SigmaHQ and community blog posts.</p>
                    <div class="grid gap-4 md:grid-cols-2 mt-5">
                        <BlogPostLink v-for="post in data.posts"
                                      :href="post.requestUrl"
                                      :img_src="post.ogImage[0]?.url"
                                      :title="post.ogTitle"
                                      :description="post?.ogDescription || 'Check out this exciting new Sigma Blog Post...'"></BlogPostLink>
                    </div>
                </section>

                <section id="explore" class="flex flex-col gap-8">
                    <div class="flex flex-col ">
                    <h2 class="!border-0  text-2xl font-semibold mb-6 pb-4">
                        Explore the Docs
                    </h2>
                    <p class="text-slate-500">
                        Get the most out of the Sigma ecosystem in your SIEM, and start using thousands of
                        great security detections from the community and beyond.
                    </p>
                    </div>
                    <div class="grid md:grid-cols-3 gap-4">
                        <a target="_blank" href="https://github.com/SigmaHQ/sigma/">
                            <Box>
                                <template #icon><RectangleStackIcon /></template>
                                <template #heading>Rule Repository <ArrowTopRightOnSquareIcon class="text-slate-400 dark:text-white/30 ml-1 h-[14px] w-[14px] inline" /></template>
                                <template #text>Explore the thousands of existing Sigma detections in SigmaHQ/sigma.</template>
                            </Box>
                        </a>
                        <a target="_blank" href="https://github.com/SigmaHQ/sigma-specification">
                            <Box>
                                <template #icon><DocumentCheckIcon /></template>
                                <template #heading>Specification <ArrowTopRightOnSquareIcon class="text-slate-400 dark:text-white/30 ml-1 h-[14px] w-[14px] inline" /> </template>
                                <template #text>Learn more about how to use the Sigma detection format.</template>
                            </Box>
                        </a>
                        <a target="_blank" href="https://github.com/SigmaHQ/sigma-specification/tree/version_2">
                            <Box>
                                <template #icon><BeakerIcon /></template>
                                <template #heading>
                                    Specification (v2) <Badge type="tip" text="In Dev" /> <ArrowTopRightOnSquareIcon class="text-slate-400 dark:text-white/30 ml-1 h-[14px] w-[14px] inline" />
                                </template>
                                <template #text>Shape the future of the Sigma specification.</template>
                            </Box>
                        </a>
                    </div>
                </section>
            </div>
        </template>
    </Docsv2>
</template>

<style scoped>
h1, h2, h3, h4, h5, h6, p {
    margin: 0;
    padding: 0;
}
</style>

<style>
.resources-page .content-container {
    max-width: 940px;
}
</style>
