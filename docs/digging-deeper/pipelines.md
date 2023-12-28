---
title: 'Pipelines'
---

<script setup>
import DraftWarning from '../../.vitepress/theme/components/DraftWarning.vue';
</script>

<DraftWarning class="block! w-full mb-6" />

# {{ $frontmatter.title }}

Pipelines (or "processing pipelines") provide a more nuanced way to configure and fine-tune how Sigma rules get converted into their SIEM specific format. Pipelines are often used to ensure that the fields used within Sigma [are mapped correctly](#field-name-mapping) to the fields used in each SIEM, or to ensure that [the correct logsource](#change-logsource) is being inserted / updated.


## Basics

A processing pipeline defines a sequence of transformations that are applied to a Sigma rule before it is converted into the target query language. These transformations can be [field mappings](#field-name-mapping), [adding suffixes to field names](#field-name-suffix), or any of the others listed below.

Processing pipelines are written as **YAML files** – usually used by end-users, or as **Python code** – usually used by developers of Sigma backends. For this documentation we'll be solely focusing on YAML files.

Each Sigma backend also usually provide pre-defined pipelines Sigma CLI makes available during conversion – such as `splunk_windows`, `splunk_cim` and `splunk_sysmon_acceleration` pipelines for the [pySigma Splunk Backend](https://github.com/SigmaHQ/pySigma-backend-splunk).

## Writing Pipelines

Similar to creating a Sigma rule, constructing processing pipelines is done by creating a `.yml` file, usually in a folder called `config/` or `pipelines/`, adjacent to the `rules/` folder.

There often exists a lot of different standards on how to name the Event ID / Event Code field when dealing with Windows Event Log (`event_id`, `event_code`, `EventId`, `EventCode`, `evtid`, `code` etc), a good starting point would be to ensure is to ensure that all Sigma `EventID` fields are correctly mapped. 

```bash
# Create the pipelines folder
mkdir pipelines

# Create the pipeline for "Windows EventID / Event Code mapping"
vim pipelines/fix_windows_event_id_mapping.yml
```

::: code-group

```yaml [pipelines/fix_windows_event_id_mapping.yml]
name: Fixing the field naming mess
priority: 30
transformations:
- id: image_fail_path
  type: detection_item_failure
  message: Image must only contain file name without any further path components.
  field_name_conditions:
  - type: include_fields
    fields:
    - Image
  detection_item_conditions:
  - type: match_string
    cond: any
    pattern: "^\\*\\\\?[^\\\\]+$"
    negate: true
- id: image_file_only
  type: replace_string
  regex: "^\\*\\\\([^\\\\]+)$"
  replacement: "\\1"
  field_name_conditions:
  - type: include_fields
    fields:
    - Image
- id: field_mapping
  type: field_name_mapping
  mapping:
    EventID:
    - event_id
    - evtid
- id: windows_field_prefix
  type: field_name_prefix
  prefix: "win."
  field_name_cond_not: true
  field_name_conditions:
  - type: processing_item_applied
    processing_item_id: field_mapping
- id: index_condition
  type: add_condition
  conditions:
    index: windows
  rule_conditions:
  - type: logsource
    product: windows
```

:::

Pipelines can be chained in the order defined by their priority. A usual processing chain is:

1. Generic log sources are translated into specific log sources, (e.g. process creation Sigma rules into `Sysmon` `EventID: 1`).
2. Transformation of the log signatures into the taxonomy used by a backend.
3. Environment-specific transformations.

### Pipeline Usage

Invoking a pipeline is done by passing the `--pipeline` / `-p` parameter to the `sigma convert` command, and can either be a reference to a pre-defined pipeline, or a path to the specific `.yml` configuration file itself.

**Example: Predefined Pipelines**

```bash
sigma convert -t splunk -p sysmon rules/windows/process_creation/proc_creation_win_sysinternals_procdump.yml
```

```splunk
EventID=1 Image IN ("*\\procdump.exe", "*\\procdump64.exe")
```


## Priorities

During conversion, after all the backend and user-supplied pipelines have been gathered, priorities are used to sort the
pipelines into their order-of-execution.

Some standard conventions used for these priorities are listed below.

| Priority | Description                                                                                                                    |
|----------|--------------------------------------------------------------------------------------------------------------------------------|
| `10`       | Log source pipelines like for Sysmon                                                                                           |
| `20`       | Pipelines provided by backend packages that should be run before the backend pipeline.                                         |
| `50`       | Backend pipelines that are integrated in the backend and applied automatically.                                                |
| `60`       | Backend output format pipelines that are integrated in the backend and applied automatically for the associated output format. |


::: tip Tip:
Pipelines are executed from the lowest priority to the highest.
:::

::: info Note:

- Pipelines with the same priority are applied in the order they were provided.
- Pipelines without a priority are assumed to have the Priority 0.

:::

## Placeholders



## Conditions

Conditions can be attached transformations, so that a transformation may only trigger when a given logsource is present, or only if another transformation was applied previously during the conversion process.


### Rule-based Conditions

<Badge type="warning" text="WIP" class="relative -top-2" />

TODO

### Detection-based Conditions

<Badge type="warning" text="WIP" class="relative -top-2" />

TODO

### Field-based Conditions

<Badge type="warning" text="WIP" class="relative -top-2" />

TODO

## Transformations

<Badge type="warning" text="WIP" class="relative -top-2" />

TODO

### Field Name Mapping

Map a field name to on

::: code-group
```yaml [/pipelines/transformation_demo.yml]{4-7}
name: transformation_demo
priority: 100
transformations:
    - id: prefix_source_and_index_for_puppy_logs
      type: field_name_mapping
      mapping:
        field: field_name
```
:::

### Field Name Prefix Mapping

Map a field name prefix to on

::: code-group
```yaml [/pipelines/transformation_demo.yml]{4-6}
name: transformation_demo
priority: 100
transformations:
    - id: prefix_source_and_index_for_puppy_logs
      type: field_name_prefix_mapping
      mapping:
          
```
:::

### Drop Detection Item

Deletes detection items

::: code-group
```yaml [/pipelines/transformation_demo.yml]{4-6}
name: transformation_demo
priority: 100
transformations:
    - id: prefix_source_and_index_for_puppy_logs
      type: drop_detection_item
      mapping:
```
:::

### Field Name Suffix

Add a field name suffix.

::: code-group
```yaml [/pipelines/transformation_demo.yml]{4-6}
name: transformation_demo
priority: 100
transformations:
    - id: prefix_source_and_index_for_puppy_logs
      type: field_name_suffix
      mapping:
```
:::

### Field Name Prefix

Add a field name prefix.

::: code-group
```yaml [/pipelines/transformation_demo.yml]{4-6}
name: transformation_demo
priority: 100
transformations:
    - id: prefix_source_and_index_for_puppy_logs
      type: field_name_prefix
      mapping:
```
:::

### Wildcard Placeholders

Replaces placeholders with wildcards. This transformation is useful if remaining placeholders should be replaced with something meaningful to make conversion of rules possible without defining the placeholders content.

::: code-group
```yaml [/pipelines/transformation_demo.yml]{4-6}
name: transformation_demo
priority: 100
transformations:
    - id: prefix_source_and_index_for_puppy_logs
      type: wildcard_placeholders
      mapping:
```
:::

### Value Placeholders

Replaces placeholders with values contained in variables defined in the configuration.

::: code-group
```yaml [/pipelines/value_placeholders_test.yml]
name: value_placeholder_pipeline
vars:
    administrator_name: Administrator
transformations:
    - type: value_placeholders
```
```yaml [/rules/rule.yml]
title: Administrator Usage
logsource:
    product: windows
detection:
    selection:
        user|expand: "%administrator_name%"
    condition: selection
```
```splunk [Splunk Output]
user="Administrator"
```
:::

### Query Expression Placeholders

Replaces a placeholder with a plain query containing the placeholder or an identifier
mapped from the placeholder name. The main purpose is the generation of arbitrary
list lookup expressions which are passed to the resulting query.

**Parameters:**

- `expression`: string that contains query expression with {field} and {id} placeholder where placeholder identifier or a mapped identifier is inserted.
- `mapping`: Mapping between placeholders and identifiers that should be used in the expression. If no mapping is provided the placeholder name is used.

::: code-group
```yaml [/pipelines/transformation_demo.yml]{4-6}
name: transformation_demo
priority: 100
transformations:
    - id: prefix_source_and_index_for_puppy_logs
      type: query_expression_placeholders
      mapping:
```
:::

### Add Condition

Add and condition expression to rule conditions.

If template is set to True the condition values are interpreted as string templates and the following placeholders are replaced:

- `category`, `product` and `service`: with the corresponding values of the Sigma rule log source.

::: code-group
```yaml [/pipelines/transformation_demo.yml]{4-6}
name: transformation_demo
priority: 100
transformations:
    - id: prefix_source_and_index_for_puppy_logs
      type: add_condition
      mapping:
```
:::

### Change Logsource

Replace log source as defined in transformation parameters.

::: code-group
```yaml [/pipelines/transformation_demo.yml]{4-6}
name: transformation_demo
priority: 100
transformations:
    - id: prefix_source_and_index_for_puppy_logs
      type: change_logsource
      mapping:
```
:::

### Replace String

Replace string part matched by regular expression with replacement string that can reference
capture groups. It operates on the plain string representation of the SigmaString value.

This is basically an interface to `re.sub()` and can use all features available there.

::: code-group
```yaml [/pipelines/transformation_demo.yml]{4-6}
name: transformation_demo
priority: 100
transformations:
    - id: prefix_source_and_index_for_puppy_logs
      type: replace_string
      mapping:
```
:::

### Set State

Set pipeline state key to value.

::: code-group
```yaml [/pipelines/transformation_demo.yml]{4-6}
name: transformation_demo
priority: 100
transformations:
    - id: prefix_source_and_index_for_puppy_logs
      type: set_state
      mapping:
```
:::

### Rule Failure

Raise a SigmaTransformationError with the provided message. This enables transformation pipelines to signalize that a certain situation can't be handled, e.g. only a subset of values is allowed because the target data model doesn't offers all possibilities.

::: code-group
```yaml [/pipelines/transformation_demo.yml]{4-6}
name: transformation_demo
priority: 100
transformations:
    - id: prefix_source_and_index_for_puppy_logs
      type: rule_failure
      mapping:
```
:::

### Detection Item Failure

Raise a SigmaTransformationError with the provided message. This enables transformation pipelines to signalize that a certain situation can't be handled, e.g. only a subset of values is allowed because the target data model doesn't offers all possibilities.

::: code-group
```yaml [/pipelines/transformation_demo.yml]{4-6}
name: transformation_demo
priority: 100
transformations:
    - id: prefix_source_and_index_for_puppy_logs
      type: detection_item_failure
      mapping:
```
:::
