<template>
    <div>
        <div class="p-1 border border-2 dark:border border-sky-500/[.1] dark:bg-sky-900/[.1] inline-block rounded-2xl dark:shadow-lg dark:shadow-none">
            <div class="flex gap-3">
                <a :href="link_one" class="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-sky-400/20 !transition-all dark:hover:bg-sky-700/20"
                    :class="{
                    'dark:border dark:border-2 border-white dark:border-sky-500 !bg-sky-400 dark:!bg-sky-600/30 dark:shadow-sky-500/10 dark:shadow-xl': active === 'format'
                }">
                    <DocumentTextIcon v-if="active === 'format'" class="h-5 w-5 text-white dark:text-sky-400"/>
                    <DocumentTextIconOutline v-else class="h-5 w-5 text-sky-400 dark:text-sky-900 "/>
                </a>
                <a :href="link_two" class="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-sky-400/20 !transition-all dark:hover:bg-sky-700/20"
                    :class="{
                    'dark:border dark:border-2 border-white dark:border-sky-500 !bg-sky-400 dark:!bg-sky-600/30 dark:shadow-sky-500/10 dark:shadow-xl': active === 'tools'
                    }">
                    <WrenchScrewdriverIcon v-if="active === 'tools'" class="h-5 w-5 text-white dark:text-sky-400"/>
                    <WrenchScrewdriverIconOutline v-else class="h-5 w-5 text-sky-400 dark:text-sky-900 "/>
                </a>
                <a :href="link_three" class="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-sky-400/20 !transition-all dark:hover:bg-sky-700/20"
                    :class="{
                    'dark:border dark:border-2 border-white dark:border-sky-500 !bg-sky-400 dark:!bg-sky-600/30 dark:shadow-sky-500/10 dark:shadow-xl': active === 'rules'
                }">
                    <FolderIcon v-if="active === 'rules'" class="h-5 w-5 text-white dark:text-sky-400"/>
                    <FolderIconOutline v-else class="h-5 w-5 text-sky-400 dark:text-sky-900 "/>
                </a>
            </div>
        </div>
    </div>
</template>

<script setup>
import {WrenchScrewdriverIcon, DocumentTextIcon, FolderIcon} from "@heroicons/vue/20/solid";
import {
    WrenchScrewdriverIcon as WrenchScrewdriverIconOutline,
    DocumentTextIcon as DocumentTextIconOutline,
    FolderIcon as FolderIconOutline
} from "@heroicons/vue/24/outline";

const props = defineProps({
    // format / tools / rules
    'active': {
        required: false,
        type: String,
        default: ''
    },
    'link_one': String,
    'link_two': String,
    'link_three': String
})
</script>
