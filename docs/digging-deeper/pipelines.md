---
title: "Processing Pipelines"
---

# {{ $frontmatter.title }}

Processing pipelines control _how_ a Sigma rule is converted into a query for your SIEM. They let you map field names, point rules at the right index or log stream, and apply environment-specific tweaks — all without touching the original rule.

A pipeline is just a YAML file with an ordered list of **transformations**. You pass it to `sigma convert` with `-p` / `--pipeline`:

```bash
sigma convert -t splunk -p ./pipelines/my_pipeline.yml ./rules/
```

You can pass several pipelines at once; they run in order of their [`priority`](#priorities).

## Quick Start

The same Sigma rule can be converted for very different backends just by swapping the pipeline. Each recipe below does the two things almost every pipeline needs: **tell the backend where the data lives** and **map a rule field onto the field name your data uses**. Notice how the mechanism for "where the data lives" differs per backend, while the field mapping stays the same.

We'll convert this rule throughout. It matches on two fields, `EventID` and `CommandLine`:

```yaml [rules/proc_creation_win_example.yml]
title: Suspicious Command
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    EventID: 4688
    CommandLine|contains: suspicious_command
  condition: selection
```

### Splunk — prefix an index and source

Splunk scopes a search to data by adding `index=` and `source=` terms. The [`add_condition`](#add-condition) transformation prepends them to the query. The [`field_name_mapping`](#field-name-mapping) step then renames the rule's `CommandLine` field to the `Process_Command_Line` field used in this index.

::: code-group

```yaml [pipelines/splunk_example.yml]
name: Example Splunk Pipeline
priority: 100
transformations:
  - id: set_index_and_source
    type: add_condition
    conditions:
      index: windows_logs
      source: WinEventLog:Security
  - id: map_commandline
    type: field_name_mapping
    mapping:
      CommandLine: Process_Command_Line
```

```splunk [Splunk Output]
index="windows_logs" source="WinEventLog:Security" EventID=4688 Process_Command_Line="*suspicious_command*"
```

:::

### Elasticsearch ES|QL — set the source index

ES|QL queries begin with `FROM <index>`, which isn't part of the search expression, so it can't be added with `add_condition`. Instead, the Elasticsearch backend reads the index from [pipeline state](#pipeline-variables-and-state) under the `index` key, which you set with [`set_state`](#set-state). The field mapping works exactly as in the Splunk recipe.

::: code-group

```yaml [pipelines/esql_example.yml]
name: Example ESQL Pipeline
priority: 100
transformations:
  - id: set_index
    type: set_state
    key: index
    val: logs-windows-*
  - id: map_commandline
    type: field_name_mapping
    mapping:
      CommandLine: process.command_line
```

```sql [ES|QL Output]
from logs-windows-* metadata _id, _index, _version | where EventID==4688 and process.command_line like "*suspicious_command*"
```

:::

### Grafana Loki — select a log stream

Loki selects data with a `{label="value"}` stream selector. The Loki backend ships its own [`set_custom_log_source`](#custom-pipelines-set-custom-log-source) transformation to build that selector from structured YAML — a good example of a backend extending the pipeline system with its own transformation type. The field mapping is unchanged.

::: code-group

```yaml [pipelines/loki_example.yml]
name: Example Loki Pipeline
priority: 100
transformations:
  - id: set_logsource
    type: set_custom_log_source
    selection:
      job: windows
  - id: map_commandline
    type: field_name_mapping
    mapping:
      CommandLine: process_command_line
```

```logql [Loki Output]
{job=`windows`} | json | EventID=4688 and process_command_line=~`(?i).*suspicious_command.*`
```

:::

::: tip Use a predefined pipeline first
Most backends and log sources already have a maintained pipeline you can use directly. List what's installed with `sigma list pipelines`, and only write your own when you need environment-specific behaviour. The [`sysmon`](#pipeline-usage) pipeline, for example, turns generic `process_creation` rules into `Sysmon` `EventID: 1` queries.
:::

## How a Pipeline Works

A pipeline file has a handful of top-level keys, the most important being `transformations`:

| Key                | Description                                                                           |
| ------------------ | ------------------------------------------------------------------------------------- |
| `name`             | _(Optional)_ A human-readable name for the pipeline.                                  |
| `priority`         | _(Optional)_ The execution priority. Defaults to `0`. See [Priorities](#priorities).  |
| `vars`             | _(Optional)_ Variables made available to transformations (e.g. for placeholders).     |
| `transformations`  | The list of [transformations](#transformations) applied to rules before conversion.   |
| `postprocessing`   | _(Optional)_ A list of [postprocessing](#postprocessing) steps applied to each query. |
| `finalizers`       | _(Optional)_ A list of [finalizers](#finalizers) applied to the full set of queries.  |
| `allowed_backends` | _(Optional)_ A set of backend identifiers this pipeline may be used with.             |

::: warning Unknown keys are rejected
Any top-level key outside this set causes the pipeline to fail to load with an `Unknown keys` error. For example, there is no top-level `id` key.
:::

Each entry under `transformations` selects a transformation by `type`, takes an optional `id`, an optional set of [conditions](#conditions) controlling _when_ it applies, and the parameters for that transformation. A typical chain looks like:

1. Generic log sources are translated into specific ones (e.g. `process_creation` → `Sysmon` `EventID: 1`).
2. Field names are mapped into the taxonomy used by the backend.
3. Environment-specific tweaks (indexes, stream selectors, dropped fields) are applied.

### Pipeline Usage

Invoking a pipeline is done with `-p` / `--pipeline`, which accepts either the name of a predefined pipeline or a path to a `.yml` file. For example, the predefined `sysmon` pipeline:

::: code-group

```bash [Terminal]
sigma convert \
  -t splunk \
  -p sysmon rules/windows/process_creation/proc_creation_win_sysinternals_procdump.yml
```

```splunk [Splunk Output]
EventID=1 Image IN ("*\\procdump.exe", "*\\procdump64.exe")
```

:::

You can also supply several pipelines at once, in which case they run in order of their `priority` (lowest first). For example, you might have a `mapping` pipeline that maps field names, and a `splunk_prefix` pipeline that adds `index=` and `source=` conditions. If both have the default priority of `0`, the order they run in is undefined. Setting `priority: 100` on the `splunk_prefix` pipeline ensures it runs after the mapping:

```bash
sigma convert \
  -t splunk \
  -p mapping.yml \
  -p splunk_prefix.yml \
  rules/windows/process_creation/proc_creation_win_sysinternals_procdump.yml
```

<!--@include: ./pipelines/_priorities.md-->

<!--@include: ./pipelines/_vars_state.md-->

<!--@include: ./pipelines/_placeholders.md-->

<!--@include: ./pipelines/_transformations.md-->

<!--@include: ./pipelines/_postprocessing.md-->

<!--@include: ./pipelines/_finalizers.md-->

<!--@include: ./pipelines/_conditions.md-->

<style>
.vp-doc p:has(+ ul) {
    margin-bottom: 0px !important;
}
</style>
