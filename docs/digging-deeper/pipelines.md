---
title: "Processing Pipelines"
---

# {{ $frontmatter.title }}

Processing pipelines provide granular control over how Sigma rules are converted into SIEM-specific formats. They enable field mapping, log source transformations, and other customizations needed for accurate rule conversion.

## Overview

A processing pipeline defines an ordered sequence of transformations that are applied to a Sigma rule during conversion. Common use cases include:

- Mapping Sigma field names to SIEM-specific field names
- Transforming generic log sources into platform-specific ones
- Adding conditions or modifying rule structure for specific environments

Pipelines can be defined in two ways:
- **YAML files** - Used by end-users for configuration
- **Python code** - Used by backend developers

This documentation focuses on YAML-based pipeline configuration.

## Creating Pipelines

Pipelines are defined in YAML files, typically stored in a `config/` or `pipelines/` directory alongside your rules.

Here's an example pipeline that standardizes Windows Event ID field names:

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

#### Example: Predefined Pipelines

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
| -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `10`     | Log source pipelines like for Sysmon                                                                                           |
| `20`     | Pipelines provided by backend packages that should be run before the backend pipeline.                                         |
| `50`     | Backend pipelines that are integrated in the backend and applied automatically.                                                |
| `60`     | Backend output format pipelines that are integrated in the backend and applied automatically for the associated output format. |

::: tip Tip:
Pipelines are executed from the lowest priority to the highest.
:::

::: info Note:

- Pipelines with the same priority are applied in the order they were provided.
- Pipelines without a priority are assumed to have the Priority 0.

:::

## Pipeline Variables and State

Pipelines can define variables that are used during processing via the `vars` section:

## Placeholders

Additionally, pipelines maintain state that can be accessed and modified during processing through the set_state transformation.

Replace placeholders with predefined values:

```yaml
vars:
  admin_users:
    - "Administrator"
    - "Admin"
transformations:
  - type: value_placeholders
    include:
      - "admin_users"
```

Query Expression Placeholders

Insert query expressions with placeholder replacement:

```yaml
transformations:
  - type: query_expression_placeholders
    include:
      - "admin_users"
    expression: "[| inputlookup {id} | rename user as {field}]"
```

Wildcard Placeholders

Replace undefined placeholders with wildcards:

```yaml
transformations:
  - type: wildcard_placeholders
```

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

Map a field name in the sigma rule to a field name used in your logs.

**Parameters:**

- 'mapping': the fields that will be mapped (required)

::: code-group

```yaml [/pipelines/transformation_demo.yml]{5-9}
name: transformation_demo
priority: 100
transformations:
  - id: useragent_mapping
    type: field_name_mapping
    mapping:
      c-useragent: useragent
      cs-host: hostname
      c-ip: ip
    rule_conditions:
      - type: logsource
        category: proxy
```

:::

### Field Name Prefix Mapping

Map a field name prefix to replace it with another prefix.

**Parameters:**

- 'mapping': the fields that will be mapped (required)

::: code-group

```yaml [/pipelines/transformation_demo.yml]{5-7}
name: transformation_demo
priority: 100
transformations:
  - id: integritylevel_prefix_mapping
    type: field_name_prefix_mapping
    mapping:
      win.: proc.
    rule_conditions:
      - type: logsource
        product: windows
```

:::

### Drop Detection Item

Deletes detection items. Some sort of condition is recommended but not required.

**Parameters:**

- none

::: code-group

```yaml [/pipelines/transformation_demo.yml]{6-10}
name: transformation_demo
priority: 100
transformations:
  # Drops the Hashes field which is specific to Sysmon logs
  - id: hashes_drop_sysmon-specific-field
    type: drop_detection_item
    field_name_conditions:
      - type: include_fields
        fields:
          - Hashes
    rule_conditions:
      - type: logsource
        product: windows
        category: process_creation
```

:::

### Field Name Suffix

Add a field name suffix. field_name_conditions are not required, but are recommended.

**Parameters:**

- 'suffix': the suffix to be added (required)

::: code-group

```yaml [/pipelines/transformation_demo.yml]{5-6}
name: transformation_demo
priority: 100
transformations:
  - id: windows_field_suffix
    type: field_name_suffix
    suffix: ".win"
    field_name_conditions:
      - type: include_fields
        fields:
          - Hashes
```

:::

### Field Name Prefix

Add a field name prefix.

**Parameters:**

- 'prefix': the prefix to be added (required)

::: code-group

```yaml [/pipelines/transformation_demo.yml]{5-6}
name: transformation_demo
priority: 100
transformations:
  - id: windows_field_prefix
    type: field_name_prefix
    prefix: "win."
```

:::

### Wildcard Placeholders

Replaces placeholders with wildcards. This transformation is useful if remaining placeholders should be replaced with something meaningful to make conversion of rules possible without defining the placeholders content.

**Parameters:**

- none

::: code-group

```yaml [/pipelines/transformation_demo.yml]{5}
name: transformation_demo
priority: 100
transformations:
  - id: wildcard_placeholders_transformation
    type: wildcard_placeholders
```

:::

### Value Placeholders

Replaces placeholders with values contained in variables defined in the configuration.

**Parameters:**

- `include`: identify the specific placeholders you'd like to transform

::: code-group

```yaml [/pipelines/value_placeholders_test.yml]{2-10}
name: value_placeholder_pipeline
vars:
  administrator_name:
    - "Administrator"
    - "Admin"
    - "SysAdmin"
transformations:
  - type: value_placeholders
    include:
      - "administrator_name"
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
user IN ("Administrator", "Admin", "SysAdmin")
```

:::

### Query Expression Placeholders

Replaces a placeholder with a plain query containing the placeholder or an identifier
mapped from the placeholder name. The main purpose is the generation of arbitrary
list lookup expressions which are passed to the resulting query.

**Parameters:**

- `expression`: string that contains query expression with {field} and {id} placeholder where placeholder identifier or a mapped identifier is inserted.
- `include`:identify the specific placeholders you'd like to transform
- `mapping`: Mapping between placeholders and identifiers that should be used in the expression. If no mapping is provided the placeholder name is used.

::: code-group

```yaml [/pipelines/transformation_demo.yml]{5-8}
name: transformation_demo
priority: 100
transformations:
  - id: Admins_Workstations_query_expression_placeholder
    type: query_expression_placeholders
    include:
      - Admins_Workstations
    expression: "[| inputlookup {id} | rename user as {field}]"
```

For the rule: [User with Privileges Logon](https://github.com/SigmaHQ/sigma/blob/e1a713d264ac072bb76b5c4e5f41315a015d3f41/rules-placeholder/windows/builtin/security/win_security_admin_logon.yml#L30)

```splunk [Splunk Output]
EventID IN (4672, 4964) NOT (SubjectUserSid="S-1-5-18" OR [| inputlookup Admins_Workstations | rename user as SubjectUserName])
```

:::

### Add Condition

Add and condition expression to rule conditions.

If template is set to True the condition values are interpreted as string templates and the following placeholders are replaced:

- `category`, `product` and `service`: with the corresponding values of the Sigma rule log source.

**Parameters:**

- 'conditions': the string to be added to replace the logsource values

::: code-group

```yaml [/pipelines/transformation_demo.yml]{5-7}
name: transformation_demo
priority: 100
transformations:
  - id: index_condition
    type: add_condition
    conditions:
      index: winevent
    rule_conditions:
      - type: logsource
        product: windows
```

:::

### Change Logsource

Replace log source as defined in transformation parameters.

**Parameters:**

- 'category', 'product', 'service': the log source to be changed (requires at least one)

::: code-group

```yaml [/pipelines/transformation_demo.yml]{5-6}
name: transformation_demo
priority: 100
transformations:
  - id: change_logsource
    type: change_logsource
    category: security
    rule_conditions:
      - type: logsource
        category: process_creation
```

:::

### Replace String

Replace string part matched by regular expression with replacement string that can reference
capture groups. It operates on the plain string representation of the SigmaString value.

This is basically an interface to `re.sub()` and can use all features available there.

**Parameters:**

- `regex`: The regular expression to find the desired string
- `replacement`: The replacement string to be added

::: code-group

```yaml [/pipelines/transformation_demo.yml]{5-7}
name: transformation_demo
priority: 100
transformations:
  - id: image_file_only
    type: replace_string
    regex: "^\\*\\\\([^\\\\]+)$"
    replacement: "\\1"
    field_name_conditions:
      - type: include_fields
        fields:
          - Image
```

:::

### Set State

A variable that is set within the processing pipeline and can serve for different purposes:

- as variable in templates in post processing via the pipeline object exposed to the template engine.
- by backend like Splunk where data_model_set is used for the generated tstats queries as data model.
- a processing condition using this state is planned.
- the pipeline state is also used to initiate the conversion state for each rule conversion.

**Parameters:**

- `key`: The key to modified
- `val`: The values to assign to the key


::: code-group

```yaml [/pipelines/transformation_demo.yml]{5-7,9-14}
name: transformation_demo
priority: 100
transformations:
  - id: set_datamodel
    type: set_state
    key: "data_model_set"
    val: "Endpoint.Processes"
  - id: custom_process_dm
    type: set_state
    key: fields
    val:
      CommandLine:
      Image:
      OriginalFilename:
```

```splunk [Splunk Output]
| tstats summariesonly=false allow_old_summaries=true fillnull_value="null" count min(_time) as firstTime max(_time) as lastTime from datamodel=Endpoint.Processes where IntegrityLevel="System" User IN ("*AUTHORI*", "*AUTORI*") Image IN ("*\\calc.exe", "*\\wscript.exe", "*\\cscript.exe", "*\\hh.exe", "*\\mshta.exe", "*\\forfiles.exe", "*\\ping.exe") OR CommandLine IN ("* -NoP *", "* -W Hidden *", "* -decode *", "* /decode *", "* /urlcache *", "* -urlcache *", "* -e* JAB*", "* -e* SUVYI*", "* -e* SQBFAFgA*", "* -e* aWV4I*", "* -e* IAB*", "* -e* PAA*", "* -e* aQBlAHgA*", "*vssadmin delete shadows*", "*reg SAVE HKLM*", "* -ma *", "*Microsoft\\Windows\\CurrentVersion\\Run*", "*.downloadstring(*", "*.downloadfile(*", "* /ticket:*", "*dpapi::*", "*event::clear*", "*event::drop*", "*id::modify*", "*kerberos::*", "*lsadump::*", "*misc::*", "*privilege::*", "*rpc::*", "*sekurlsa::*", "*sid::*", "*token::*", "*vault::cred*", "*vault::list*", "* p::d *", "*;iex(*", "*MiniDump*", "*net user *") by CommandLine Image OriginalFilename | `drop_dm_object_name(Processes)` | convert timeformat="%Y-%m-%dT%H:%M:%S" ctime(firstTime) | convert timeformat="%Y-%m-%dT%H:%M:%S" ctime(lastTime)
```

:::

In this example above, we are demonstrating how the Splunk backend will apply a data model when used with the `data_model` output format with a Sigma CLI command like `sigma convert -p pipeline.yml -t splunk -f data_model rule.yml`. This will convert a query to use datamodels and form a tstats query such at this:

### Rule Failure

Raise a SigmaTransformationError with the provided message. This enables transformation pipelines to signalize that a certain situation can't be handled, e.g. only a subset of values is allowed because the target data model doesn't offers all possibilities. A transformation condition is not required, but is recommended.

**Parameters:**

- `message`: the message to present when the transformation failure state is met

::: code-group

```yaml [/pipelines/transformation_demo.yml]{5-6}
name: transformation_demo
priority: 100
transformations:
  - id: cs_drop_unsupported_logsource_sysmon_status
    type: rule_failure
    message: CrowdStrike logs do not support sysmon_status logs at this time.
    rule_conditions:
      - type: logsource
        product: windows
        category: sysmon_status
```

:::

### Detection Item Failure

Raise a SigmaTransformationError with the provided message. This enables transformation pipelines to signalize that a certain situation can't be handled, e.g. only a subset of values is allowed because the target data model doesn't offers all possibilities. A transformation condition is not required, but is recommended.

**Parameters:**

- `message`: the message to present when the transformation failure state is met

::: code-group

```yaml [/pipelines/transformation_demo.yml]{5-6}
name: transformation_demo
priority: 100
transformations:
  - id: cs_drop_eventid
    type: detection_item_failure
    message: CrowdStrike logs do not support the field EventID at this time.
    field_name_conditions:
      - type: include_fields
        fields:
          - EventID
    rule_conditions:
      - type: logsource
        product: windows
```

:::

### Detection Item Condition

A rule condition that matches if a detection item within the rule contains the specified field name and value.

::: code-group

```yaml [/pipelines/transformation_demo.yml]{15-17}
name: transformation_demo
priority: 100
transformations:
  - id: service_control_manager_drop
    type: drop_detection_item
    field_name_conditions:
      - type: include_fields
        fields:
          - EventID
          - Provider_Name
    rule_conditions:
      - type: logsource
        service: system
        product: windows
      - type: contains_detection_item
        field: "Provider_Name"
        value: "Service Control Manager"
```

:::

## Finalizers

Finalizers process the final query output after all transformations are complete. Common finalizers include:

Concatenate Queries
Join multiple queries with a separator:

```yaml
finalizers:
  - type: concat
    separator: " OR "
    prefix: "("
    suffix: ")"
```

JSON Output
Convert queries to JSON:

```yaml
finalizers:
  - type: json
    indent: 2
```

Template Output
Apply a Jinja2 template:

```yaml
finalizers:
  - type: template
    template: |
      {
        "query": {{ query | tojson }},
        "rule": {{ rule.title | tojson }}
      }
```
