---
title: 'Contributing'
---

# {{ $frontmatter.title }}

One of the best features about the Sigma format how easy anyone can start sharing detections with the wider security community. However, each community will enforce some guidelines around how to best contribute to each Sigma Rule repository online.

::: info SigmaHQ Rule Repository

If you haven't already checked it out, visit the [SigmaHQ Rule Repository](https://github.com/SigmaHQ/sigma) to check out the hundreds of available detections.

:::

## Submission to SigmaHQ

### Checklist

The best way to get your Sigma rule accepted within SigmaHQ's rule repository, is follow the below checklist to ensure it adheres to the standards the community has set for those rules.

<!--suppress ES6UnusedImports -->
<script setup>
import ChecklistItem from "/.vitepress/theme/components/ChecklistItem.vue"; 
import {ChevronRightIcon} from "@heroicons/vue/20/solid";
</script>


<ChecklistItem :number="1" heading="Your rule <u>must</u> adhere to the correct layout." class="">
<template #text class="">
Whilst the Sigma format allows you to set your own fields and values for use within your own environments, when sharing throughout the community – it's required that each rule being submitted adheres to the <a href="https://github.com/SigmaHQ/sigma-specification/blob/main/sigmahq/sigmahq_conventions.md" class="text-[var(--vp-c-brand)]">SigmaHQ Rule Conventions</a>. This covers thing such as
<a href="https://github.com/SigmaHQ/sigma-specification/blob/main/sigmahq/sigmahq_conventions.md" class="block mt-4 text-[var(--vp-c-brand)]">See the detailed requirements on Github <ChevronRightIcon class="w-4 h-4 inline-block" /></a>
</template>
</ChecklistItem>




<ChecklistItem :number="2" heading="Your rule <u>must</u> adhere the file naming scheme." class="">
<template #text class="">
For each logsource, SigmaHQ enforces a naming scheme for how rule files are to be named. Ensure your rule is named correctly by following the <a href="https://github.com/SigmaHQ/sigma-specification/blob/main/sigmahq/Sigmahq_filename_rule.md" class="text-[var(--vp-c-brand)]">SigmaHQ Filename Normalisation</a> guide on Github.
<a href="https://github.com/SigmaHQ/sigma-specification/blob/main/sigmahq/Sigmahq_filename_rule.md" class="block mt-4 text-[var(--vp-c-brand)]">See the detailed file-name requirements on Github <ChevronRightIcon class="w-4 h-4 inline-block" /></a>
</template>
</ChecklistItem>



<ChecklistItem :number="3" heading="You're ready to open up a PR for your rule." class="">
<template #text class="">
If you've finished writing your Sigma rule, and it adheres to points #1 and #2, you're ready to open up a Pull Request under the SigmaHQ repository.
<button class="block w-full p-2 bg-green-400/30 outline outline-1 outline-green-400/50 !text-white rounded-lg mt-4 text-center">Open a new PR on SigmaHQ <ChevronRightIcon class="w-4 h-4 inline-block" /></button>
</template>
</ChecklistItem>


