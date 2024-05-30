<script setup>
import { useData, withBase } from "vitepress";
import { ArrowDownCircleIcon } from "@heroicons/vue/24/outline/index";
import { ArrowTopRightOnSquareIcon } from "@heroicons/vue/20/solid/index";
import {
  ArrowSmallRightIcon,
  BeakerIcon,
  BookOpenIcon,
  GiftIcon,
  PencilSquareIcon,
  RectangleGroupIcon,
  RectangleStackIcon,
  ChevronRightIcon,
} from "@heroicons/vue/24/solid/index";

import VPSkipLink from "vitepress/dist/client/theme-default/components/VPSkipLink.vue";
import VPNav from "vitepress/dist/client/theme-default/components/VPNav.vue";
import VPFooter from "vitepress/dist/client/theme-default/components/VPFooter.vue";
import Box from "../components/Boxes/Box.vue";
import CodeBox from "../components/Home/CodeBox.vue";
import RulesBox from "../components/Boxes/RulesBox.vue";

const { frontmatter } = useData();
</script>

<template>
  <slot name="layout-top" />
  <VPSkipLink />
  <VPNav>
    <template #nav-bar-title-after>
      <div
        class="absolute left-12 top-10 block text-[10pt] text-[var(--vp-c-brand-1)]"
      >
        Detection&nbsp;Format
      </div>
    </template>

    <template #nav-bar-content-before>
      <div class="hidden w-full md:block"></div>
    </template>
  </VPNav>

  <div class="overflow-x-hidden">
    <div
      id="shade"
      class="w-100 pointer-events-none absolute -left-0 bottom-0 right-0 top-0 -z-10 opacity-40 blur dark:opacity-[.20] lg:-top-80 lg:opacity-25"
      style="
        background: radial-gradient(
          circle at 0% 0%,
          rgba(69, 216, 255, 1) 0%,
          rgba(69, 216, 255, 0) 50%,
          rgba(69, 216, 255, 0) 100%
        );
      "
    ></div>

    <main
      class="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-6 md:py-24 lg:gap-20 lg:px-16 lg:py-48 xl:px-8 xl:py-56"
    >
      <section id="sigma">
        <div
          class="flex flex-col items-center gap-6 pb-20 md:flex-row lg:gap-12"
        >
          <div class="flex basis-1 flex-col gap-2 md:basis-3/5 xl:pr-5">
            <p class="mb-0.5 flex flex-wrap gap-2">
              <Badge
                class="!transform-none text-nowrap !leading-6"
                text="Open Source"
                type="tip"
              />
              <a
                class="group"
                href="https://blog.sigmahq.io/introducing-sigma-rule-packages-releases-76043ce42e81"
              >
                <div
                  class="inline-block items-center text-nowrap rounded-full bg-sigma-500/[.15] px-3 py-1 text-[12px] font-medium text-[--vp-c-brand-3] text-sigma-600 transition-all group-hover:underline dark:bg-sigma-700/20 dark:text-sigma-400"
                >
                  <div class="flex items-center">
                    <GiftIcon class="mr-2 h-3" />
                    Introducing new SigmaHQ Rule Packs

                    <ArrowSmallRightIcon
                      class="h-3 pl-1.5 transition-all group-hover:ml-1"
                    />
                  </div>
                </div>
              </a>
            </p>
            <h2>
              <small
                class="text-xl font-semibold text-[var(--vp-c-brand-1)] dark:text-[var(--vp-c-brand-3)]"
              >
                SIEM Detection Format
              </small>
            </h2>
            <h2 id="" class="text-4xl font-semibold md:text-5xl xl:text-[40pt]">
              <slot name="home-hero-text">
                <span class="hero-title"
                  >The shareable<br />detection format for </span
                ><br class="hidden lg:block" /><span
                  class="fill hero-title-highlighted bg-[var(--vp-c-brand-2)] bg-clip-text"
                  >security professionals</span
                >.
              </slot>
            </h2>
            <p class="text-balance text-slate-500">
              Get the most out of the Sigma ecosystem in your SIEM, and start
              using thousands of great security detections from the community
              and beyond.
            </p>
            <div class="mt-6 flex flex-wrap gap-2">
              <a
                :href="withBase('/docs/guide/getting-started.html')"
                class="flex w-full items-center justify-center rounded-full border border-[--vp-c-brand-3] bg-[var(--vp-c-brand-3)] p-2 px-4 text-sm font-semibold text-white shadow-md transition hover:border-[var(--vp-c-brand-1)] hover:bg-[var(--vp-c-brand-2)] hover:shadow-lg dark:border-[var(--vp-c-brand-1)] dark:bg-[var(--vp-c-brand-3)] dark:hover:bg-[var(--vp-c-brand-1)] sm:w-auto"
              >
                Get Started
              </a>
              <a
                class="group flex w-full items-center justify-center rounded-full border border-solid border-[#677389]/25 p-2 px-4 pl-3 text-sm font-semibold transition hover:border-sigma-600/50 hover:shadow-md hover:shadow-sigma-700/10 dark:border-[#677389]/40 dark:hover:border-sigma-700 sm:w-auto"
                href="https://github.com/SigmaHQ/sigma/releases"
              >
                <ArrowDownCircleIcon
                  class="mr-2.5 inline h-4 scale-125 text-slate-400 transition-all group-hover:text-[var(--vp-c-brand-3)]"
                />
                Download Sigma Rule Packages
              </a>
            </div>
          </div>
          <div class="w-full md:basis-3/5 lg:basis-2/5">
            <CodeBox></CodeBox>
          </div>
        </div>
      </section>
      <section id="whatis">
        <div class="flex flex-col items-center gap-4 md:flex-row md:gap-10">
          <div class="flex basis-2/5 flex-col gap-2">
            <h3>
              <small
                class="text-xl font-semibold text-[var(--vp-c-brand-1)] dark:text-[var(--vp-c-brand-3)]"
              >
                What is Sigma?
              </small>
            </h3>
            <h2 id="" class="text-3xl font-semibold md:text-4xl">
              Share detectable malicious behaviour.
            </h2>
            <p class="text-balance text-slate-500">
              Sigma is a generic, open, and structured detection format that
              allows security teams to detect relevant log events in a simple
              and shareable way.
            </p>
            <a href="/docs/guide/about" class="more text-sm text-sigma-500"
              >Learn more about Sigma
              <ChevronRightIcon class="inline-block h-3 w-3"
            /></a>
          </div>
          <div class="md:basis-3/5">
            <img
              alt=""
              class="hidden scale-110 dark:block xl:origin-left xl:scale-125"
              src="/images/Sigma_description_dark.png"
            />
            <img
              alt=""
              class="block scale-110 dark:hidden xl:origin-left xl:scale-125"
              src="/images/Sigma_description_light.png"
            />
          </div>
        </div>
      </section>
      <section id="learn">
        <h2
          class="mb-6 border-b border-slate-500/10 pb-4 text-2xl font-semibold"
        >
          Learn
        </h2>
        <div class="grid gap-4 md:grid-cols-3">
          <a :href="withBase('/docs/guide/getting-started.html')">
            <Box>
              <template #icon>
                <BookOpenIcon />
              </template>
              <template #heading>Documentation</template>
              <template #text
                >Learn more about how to use the Sigma detection
                format.</template
              >
            </Box>
          </a>
          <a :href="withBase('/resources/')">
            <Box>
              <template #icon>
                <RectangleGroupIcon />
              </template>
              <template #heading>Resources</template>
              <template #text
                >See many amazing resources – produced by SigmaHQ and the wider
                Sigma community.
              </template>
            </Box>
          </a>
          <a :href="withBase('/docs/basics/rules.html')">
            <RulesBox />
          </a>
        </div>
      </section>
      <section id="explore">
        <h2
          class="mb-6 border-b border-slate-500/10 pb-4 text-2xl font-semibold"
        >
          Explore the Sigma Ecosystem
        </h2>
        <div class="grid gap-4 md:grid-cols-3">
          <a href="https://github.com/SigmaHQ/sigma/" target="_blank">
            <Box>
              <template #icon>
                <RectangleStackIcon />
              </template>
              <template #heading
                >View Sigma Rules
                <ArrowTopRightOnSquareIcon
                  class="ml-1 inline h-[14px] w-[14px] text-slate-400 dark:text-white/30"
                />
              </template>
              <template #text
                >Explore the thousands of existing Sigma detections in
                SigmaHQ/sigma.
              </template>
            </Box>
          </a>
          <a href="https://medium.com/sigma-hq" target="_blank">
            <Box>
              <template #icon>
                <PencilSquareIcon />
              </template>
              <template #heading
                >SigmaHQ Blog
                <ArrowTopRightOnSquareIcon
                  class="ml-1 inline h-[14px] w-[14px] text-slate-400 dark:text-white/30"
                />
              </template>
              <template #text
                >See articles written by the Core SigmaHQ development
                team.</template
              >
            </Box>
          </a>
          <a
            href="https://github.com/SigmaHQ/sigma-specification/"
            target="_blank"
          >
            <Box>
              <template #icon>
                <BeakerIcon />
              </template>
              <template #heading>
                Specification
                <Badge text="In Dev" type="tip" />
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

      <div class="grid gap-16 md:grid-cols-2">
        <section id="guides" class="flex flex-col gap-2">
          <h2 class="text-2xl font-semibold">Projects</h2>
          <p
            class="mb-3 border-b border-slate-500/[.07] pb-3 text-sm text-slate-400"
          >
            The upcoming Sigma projects, developments and services.
          </p>

          <ul>
            <li>
              <a
                class="text-[var(--vp-c-brand-3)]"
                href="https://marketplace.visualstudio.com/items?itemName=humpalum.sigma"
                target="_blank"
              >
                Sigma VSCode Extension
                <ArrowTopRightOnSquareIcon
                  class="ml-1 inline h-[14px] w-[14px] text-slate-400 dark:text-cyan-300/30"
                />
              </a>
            </li>
            <li>
              <a
                class="text-[var(--vp-c-brand-3)]"
                href="https://github.com/SigmaHQ/pySigma"
                target="_blank"
              >
                pySigma Development
                <ArrowTopRightOnSquareIcon
                  class="ml-1 inline h-[14px] w-[14px] text-slate-400 dark:text-cyan-300/30"
                />
              </a>
            </li>
            <li>
              <a
                class="text-[var(--vp-c-brand-3)]"
                href="https://sigmasearchengine.com/"
                target="_blank"
              >
                Sigma Search Engine
                <ArrowTopRightOnSquareIcon
                  class="ml-1 inline h-[14px] w-[14px] text-slate-400 dark:text-cyan-300/30"
                />
              </a>
            </li>
            <li>
              <span class="opacity-30">Sigma Rule Detection Reference</span>
              <Badge text="Coming Soon" type="info" />
            </li>
          </ul>
        </section>
        <section
          id="community"
          class="border-1 -mx-6 flex flex-col gap-2 border bg-[#DAECF5]/10 p-6 dark:border-[#181A24] dark:bg-[#181A24]/40 md:-m-8 md:mr-0 md:rounded-xl md:p-8"
        >
          <h2 class="text-2xl font-semibold">Community</h2>
          <p
            class="mb-3 border-b border-slate-500/[.07] pb-3 text-sm text-slate-400"
          >
            Community project that use and extend the Sigma ecosystem.
          </p>
          <ul>
            <li>
              <a
                class="text-[var(--vp-c-brand-3)]"
                href="https://github.com/joesecurity/sigma-rules"
              >
                Joe Security Sigma Rules
                <ArrowTopRightOnSquareIcon
                  class="ml-1 inline h-[14px] w-[14px] text-slate-400 dark:text-cyan-300/30"
                />
              </a>
            </li>
            <li>
              <a
                class="text-[var(--vp-c-brand-3)]"
                href="https://sigconverter.io/"
              >
                Sigma Rule Converter
                <ArrowTopRightOnSquareIcon
                  class="ml-1 inline h-[14px] w-[14px] text-slate-400 dark:text-cyan-300/30"
                />
              </a>
            </li>
          </ul>
        </section>
      </div>

      <section id="guides" class="flex flex-col gap-2">
        <h2
          class="mb-3 border-b border-slate-500/10 pb-3 text-xl font-semibold"
        >
          Acknowledgements
        </h2>
        <p class="text-balance text-sm text-slate-400">
          Sigma would not be possible without the hard work and dedications of
          hundreds of online contributors through Github.<br />If you would like
          to support the project in any way, please visit our
          <a
            :href="withBase('/docs/guide/about.html#contributing')"
            class="text-[var(--vp-c-brand-3)]"
            >contribute guide on the sigma documentation page</a
          >.
        </p>
      </section>
    </main>
  </div>

  <VPFooter />
  <slot name="layout-bottom" />
</template>

<style>
.hero-title {
  background: transparent;
}

.dark .hero-title {
  background: linear-gradient(to bottom right, #a5c0d3 0%, #fff 50%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-title-highlighted {
  background: linear-gradient(
    to right,
    var(--vp-c-brand-1),
    var(--vp-c-brand-3)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
