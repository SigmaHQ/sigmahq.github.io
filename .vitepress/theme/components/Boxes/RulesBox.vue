<template>
  <Box>
    <template #icon>
      <DocumentMagnifyingGlassIcon />
    </template>
    <template #heading>Rules</template>
    <template #text
      >Learn more about how each Sigma rule is composed, and how to detect
      attackers.</template
    >
  </Box>
</template>

<script setup>
import Box from "./Box.vue";
import { DocumentMagnifyingGlassIcon } from "@heroicons/vue/24/solid";
</script>
