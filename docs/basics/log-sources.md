---
title: "Logsources"
---

# {{ $frontmatter.title }}

For each [Sigma rule](/docs/basics/rules.md) to be effective at detection, it is important to identify what type of logs your SIEM is required to search over. This is important not only for efficiency of detections, but also for ensuring detection is happening against the correct set of fields and values applied.

Each logsource definition within a Sigma rule is made up of **three** separate fields. These fields, when used in combination, define a given logsource.

- `category`
- `product`
- `service`

Each Sigma logsource is then usually (depending on your SIEM) prepended to the start of a detection query, in order for that query to target only those specific set of logs relevant to that detection. See this example below:

## Logsource Basics

Before Sigma queries can be used effectively within an organisation's SIEM or Alerting tooling, it's important to identify whether the detection can search over the appropriate types of logs that the Sigma detection requires.

Because each logsource will look fairly similar – especially in Sigma rules targeting Microsoft Windows&trade; domain – it's important to know when Sigma rules will match again a logsource, as any mismatches in logsource can render the detection ineffective.

::: info Sigma Specification for Logsources

The Sigma Specification repository outlines a [standard set of logsources](https://github.com/SigmaHQ/sigma-specification/blob/main/Taxonomy_specification.md#log-sources), that is supported across the community in the Sigma rule collection.

:::

### Logsource Types

The `category` value is used to select all log files written by a certain group of products, like firewalls or web server logs.

The `product` value is used to select all log outputs of a certain product. For example, all Windows Eventlog types including "Security", "System", "Application" and the new log types like "AppLocker" and "Windows Defender".

Use the `service` value to select only a subset of a product's logs, like the "sshd" on Linux or the "Security" Eventlog on Windows systems.

### Definition Field

You may also see a `definition` field within logsource description. This can also provide more information about how to onboard the log data source correctly, and doesn't get included when completing logsource matching.

```yaml{7}
tags:
  - attack.privilege_escalation
  - attack.t1548
logsource: // [!code focus:4]
  product: windows
  category: ps_script
  definition: Script Block Logging must be enabled
detection:
  selection:
    ScriptBlockText|contains: 'Invoke-Nightmare'
```

## Available Logsources

### Standard Logsources

Below is a list of standard Sigma logsources. These are the logsources used within the sigma/rules repository.

<!--suppress ES6UnusedImports -->
<script setup>
import PipelinesBox from "/.vitepress/theme/components/Boxes/PipelinesBox.vue";
import {reactive, onMounted} from "vue";
import { data } from '/.vitepress/theme/lib/logsources.v2.data';
import {withBase} from "vitepress";

</script>

<div v-for="logsource in data.logsources ?? []" class="">

<h4 id="" class="truncate">{{logsource.title}}</h4>

[//]: # '<span class="truncate overflow-hidden">'

<Badge type="info" v-for="tag in logsource.tags">{{tag}}</Badge>

[//]: # "</span>"

```yaml-vue
{{ logsource.yaml.trim() }}
```

</div>

### Custom Logsources

Sigma does not restrict what a Sigma logsource can be defined as, meaning you can use Sigma for just about any kind of logsource within your SIEM.

With the use of [Pipelines](/docs/digging-deeper/pipelines), you can specify granular field-mapping, and logsource-mapping to ensure that your Sigma rules are correct right after the conversion process.

<a :href="withBase('/docs/digging-deeper/pipelines')">
<PipelinesBox />
</a>

You can also see a basic example of logsource and field-mapping within the [Getting Started](/docs/guide/getting-started.html#custom-field-source-mapping) page.
