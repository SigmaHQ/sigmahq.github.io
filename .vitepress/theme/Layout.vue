<script setup>
import { useData } from "vitepress/dist/client/theme-default/composables/data";
import Home from "./layouts/Home.vue";
import Docsv2 from "./layouts/Docsv2.vue";
import Resources from "./layouts/Resources.vue";

const { frontmatter } = useData();
</script>

<template>
  <Home v-if="frontmatter.layout === 'home'" />
  <Resources v-else-if="frontmatter.page === 'resources'" />
  <!--    <Blog v-else-if="frontmatter.layout === 'blog'" />-->
  <!--    <Article v-else-if="frontmatter.layout === 'article'" />-->
  <!--    <Docsv1 v-else-if="page.relativePath.includes('v1/')" />-->
  <Docsv2 v-else />
</template>
