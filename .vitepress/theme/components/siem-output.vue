<template>
  <div :class="[siem]">
    <!-- You can actually customize padding on a select element now: -->
    <div class="flex justify-end">
      <select
        id="siem"
        v-model="siem"
        class="block w-32 rounded-lg border border-solid border-gray-300 bg-gray-50 p-2.5 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
      >
        <option selected value="splunk">Splunk</option>
        <option value="sumologic">Sumologic</option>
      </select>
    </div>
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";

let siem = ref("");

if (typeof window !== "undefined") {
  siem.value = localStorage.getItem("sigma_siem") ?? "splunk";

  watch(siem, () => {
    localStorage.setItem("sigma_siem", siem.value);
  });
}
</script>

<style scoped>
div[class^="language-"] {
  display: none;
}

.language-yaml,
.language-yaml-vue {
  display: block !important;
  border-bottom-left-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

div[class^="language-"]:not([class^="language-yaml"]):not(
    [class^="language-yaml-vue"]
  ) {
  /*border: 1px red solid !important;*/
  margin-top: -1rem !important;
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
  background-color: #212134;
}

.dark
  div[class^="language-"]:not([class^="language-yaml"]):not(
    [class^="language-yaml-vue"]
  ) {
  background-color: #32324a;
}

.splunk .language-splunk,
.sumologic .language-sumologic {
  display: block !important;
}

.vp-doc div[class*="language-"] + div[class*="language-"],
.vp-doc div[class$="-api"] + div[class*="language-"],
.vp-doc div[class*="language-"] + div[class$="-api"] > div[class*="language-"] {
  margin: 16px 0;
}

.dark select {
}
</style>
