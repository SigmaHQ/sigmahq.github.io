---
title: 'Backends'
---

# Sigma {{ $frontmatter.title }}

Sigma backends are the _"drivers"_ of the Sigma conversion process, and implements the conversion capability that converts each Sigma rule file into a SIEM compatible query.

The newly developed [**pySigma**](https://github.com/SigmaHQ/pySigma/) framework provides an API for each Sigma backend to perform conversion, transformation and formatting of every Sigma rules.

<div style="padding-bottom: 40px;">
<img class="hidden dark:block" src="/images/v2/guide/sigma_to_query_diagram_dark.png" alt="Conversion Diagram - showing the conversion from Sigma Rule Files (top) through pySigma, and down to the final stage where the rule files have been converted to string SIEM queries" height="700" style="max-height: 700px; margin: 0 auto;">
<img class="block dark:hidden" src="/images/v2/guide/sigma_to_query_diagram_light.png" alt="Conversion Diagram - showing the conversion from Sigma Rule Files (top) through pySigma, and down to the final stage where the rule files have been converted to string SIEM queries" height="700" style="max-height: 700px; margin: 0 auto;">
</div>

::: tip Developing a backend for the Sigma ecosystem

If developing a pySigma backend interests you in bringing Sigma support your SIEM language, first ensure one isn't already available on GitHub. 

Still the best guide on how to create a pySigma compatible backend is Micah Babinski's Blog Post on [Creating a Sigma Backend for Fun (and no Profit)](https://micahbabinski.medium.com/creating-a-sigma-backend-for-fun-and-no-profit-ed16d20da142). We're working hard on writing an official guide for this, but until then, a big thank you to Micah for writing this guide.

:::

## Working with Backends

To investigate available pySigma backends that you can use,
ensure you have the `sigma-cli` tool installed,
then run the following commands to view all available backends in a table.

```bash
sigma plugin list -t backend
```

```
+----------------------+---------+---------+--------------------------------------------------------------+
| Identifier           | Type    | State   | Description                                                  |
+----------------------+---------+---------+--------------------------------------------------------------+
| splunk               | backend | stable  | Splunk backend for conversion into SPL and tstats data model |
| insightidr           | backend | stable  | Rapid7 InsightIDR backend that generates LEQL queries.       |
| qradar               | backend | stable  | IBM QRadar backend for conversion into AQL and extension     |
| ...                  | ...     | ...     | ...                                                          |
+----------------------+---------+---------+--------------------------------------------------------------+
```

Once you've found the Sigma backend you want to use, you can install it using the `sigma plugin install` command.

```bash
sigma plugin install splunk
```

If you for whatever reason need to remove a Sigma plugin, you can also uninstall it using the same method.

```bash
sigma plugin uninstall splunk
```

## Components

The `sigma` CLI (powered by [**pySigma**](https://github.com/SigmaHQ/pySigma/)) also allows backends to do more with their conversion process, including providing added output formats, such as [Splunk Saved Search format](https://docs.splunk.com/Documentation/Splunk/9.0.4/Admin/Savedsearchesconf) for the Splunk pySigma backend.

For every backend, there exist **4 components** – that perform or aid the conversion process. 

- [Targets](#targets)
- [Pipelines](#pipelines)
- [Output Formats](#output-formats)
- [Validators](#validators)

### Targets

Targets represent the type of query language you want to output the Sigma format in. This will usually be mapped one-to-one with every SIEM product.

```bash
# List all locally available Sigma backends
sigma list targets
```

::: warning Make sure to install plugins

If you're not seeing any available targets, make sure you install the relevant Sigma plugin for your target SIEM. For a full list of installable backends, [click here to view all Available Backends](#available).

```bash
# List available Sigma plugins
sigma plugin list

# Install the desired plugin
sigma plugin install {plugin}
```

:::

[//]: # (TODO Finish this section off )

### Output Formats

To explore Output Formats in more detail, start by listing the available Output Formats by running the following command:

```bash
sigma list formats {backend}
```

```
+---------------+----------------------------------------+
| Format        | Description                            |
+---------------+----------------------------------------+
| default       | Plain SIEM Queries                     |
| file_format   | Plain SIEM Queries in file_format.conf |
| macro_exam    | Completely different SIEM Format       |
+---------------+----------------------------------------+
```

Once you've found which output format works best for your conversion workflows, you can invoke it over the command line like so.

```bash
sigma convert -t {target} -f {output_format} ./rules
```

### Pipelines

<Badge type="warning" text="WIP" class="relative -top-2" />

Pipelines are the method by which pySigma allows fine-tuning to be applied to conversion. This documentation outlines what pipelines are, and how to use them in more detail over on [the Pipelines documentation page](/docs/digging-deeper/pipelines.md).   

Pipelines control things like field-mapping (mapping Sigma fields, to fields within your SIEM), logsource mapping (mapping Sigma logsources to logsources in your SIEM) & other operations.

To view all available pipelines – that are provided specifically by the backend, you can run `sigma list pipelines`.

```bash
sigma list pipelines
```

You can specify multiple pipelines when converting Sigma rules, to perform more than one operation on  

[//]: # (TODO Finish this section off )
[//]: # ()
[//]: # (### Validators)

[//]: # ()
[//]: # (To explore Validators in more detail, start by listing the available Validators by running the following command:)

[//]: # ()
[//]: # (```bash)

[//]: # (sigma list validators)

[//]: # (```)

[//]: # (TODO Finish this section off )

<br />

## Available Plugin { #available }

Below is a list of available Sigma Backends and Pipelines. If you come across any issues using any specific Sigma plugin, 
file an issue on the relevant Sigma Plugin's project page. 

<!--suppress ES6UnusedImports -->
<script setup lang="ts">
import {reactive, onMounted, computed, ref, watch, watchEffect} from "vue"; 
import {titleCase} from "/.vitepress/theme/util/string";
import { data } from '/.vitepress/theme/lib/backends.v2.data'; 
import ListBox from "../../.vitepress/theme/components/ListBox.vue";
const get_title = (plugin) => titleCase(plugin.id);
const pluginType = ref({id: 'backend', name: 'Backends'});
const backends = computed(
  () => Object.values(data.plugins)
    .filter(plugin => plugin?.type === pluginType.value.id)
    .sort((a, b) => a.id < b.id ? -1 : 1)
)

</script>

<label class="-mx-4 md:mx-0 block p-4 dark:bg-sky-400/[5%] bg-sky-400/[15%] rounded-xl">
<span class="text-slate-500 text-sm font-semibold">Plugin Type:</span>
<ListBox v-model="pluginType"></ListBox>
</label>

<div v-for="plugin in backends ?? []">

<h3 :id="plugin.id" class="inline-block pr-2">{{ get_title(plugin) }}</h3>

<Badge v-if="plugin.state == 'devel'" type="danger" text="Development" />
<Badge v-if="plugin.state == 'testing'" type="warning" text="Testing" />
<Badge v-if="plugin.state == 'stable'" type="tip" text="Stable" />

<i>{{ plugin.description }}</i>

<span class="text-sm">
<a :href="plugin['project-url']">Project Website</a> <span class="opacity-20">&nbsp;|&nbsp;</span> <a :href="plugin['report-issue-url']">File an Issue</a>
</span>

```bash-vue
# Run the following to install the {{get_title(plugin)}} backend into Sigma CLI.
sigma plugin install {{plugin.id}}
```

</div>
