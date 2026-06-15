## Transformations

Transformations are the building blocks of a pipeline. Each entry under `transformations:` has a `type` that selects the transformation, an optional `id`, an optional set of [conditions](#conditions), and the parameters specific to that transformation.

The available transformation types are:

| `type`                          | Purpose                                                           |
| ------------------------------- | ----------------------------------------------------------------- |
| `field_name_mapping`            | Map a field name to one or more target field names.               |
| `field_name_prefix_mapping`     | Map a field name prefix to another prefix.                        |
| `field_name_transform`          | Transform field names using a (Python-defined) function.          |
| `field_name_suffix`             | Append a suffix to field names.                                   |
| `field_name_prefix`             | Prepend a prefix to field names.                                  |
| `add_field`                     | Add one or more fields to the rule's field list.                  |
| `remove_field`                  | Remove one or more fields from the rule's field list.             |
| `set_field`                     | Set the rule's field list.                                        |
| `drop_detection_item`           | Drop matching detection items.                                    |
| `add_condition`                 | Add a condition expression to the rule.                           |
| `change_logsource`              | Replace the log source of a rule.                                 |
| `replace_string`                | Replace values matched by a regular expression.                   |
| `map_string`                    | Map string values to other string values.                         |
| `regex`                         | Control how regular expressions are emitted (e.g. case handling). |
| `set_value`                     | Set a detection item value.                                       |
| `convert_type`                  | Convert detection item values between string and number.          |
| `set_state`                     | Set a pipeline state variable.                                    |
| `set_custom_attribute`          | Set a custom attribute on the rule.                               |
| `hashes_fields`                 | Split a `Hashes` field into individual hash-algorithm fields.     |
| `value_placeholders`            | Replace placeholders with values from `vars`.                     |
| `query_expression_placeholders` | Replace placeholders with a query expression.                     |
| `wildcard_placeholders`         | Replace remaining placeholders with wildcards.                    |
| `rule_failure`                  | Abort conversion of the rule with an error message.               |
| `detection_item_failure`        | Abort conversion when a matching detection item is present.       |
| `strict_field_mapping_failure`  | Abort conversion when a field is not covered by a field mapping.  |
| `nest`                          | Apply a nested list of transformations as a group.                |
| `case`                          | Change the case of detection item values.                         |

The most commonly used transformations are documented in detail below.

### Field Name Mapping

Map a field name in the sigma rule to a field name used in your logs.

**Parameters:**

- 'mapping': the fields that will be mapped (required)

<SigmaConverter>

::: code-group

```yaml [pipelines/transformation_demo.yml]{5-9}
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

```yaml [rules/proxy_access.yml]
title: Proxy access example
logsource:
  category: proxy
detection:
  selection:
    c-useragent: badbot
    cs-host: evil.com
    c-ip: 10.0.0.1
  condition: selection
```

:::

```splunk
useragent="badbot" hostname="evil.com" ip="10.0.0.1"
```

</SigmaConverter>

### Field Name Prefix Mapping

Map a field name prefix to replace it with another prefix.

**Parameters:**

- 'mapping': the fields that will be mapped (required)

<SigmaConverter>

::: code-group

```yaml [pipelines/transformation_demo.yml]{5-7}
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

```yaml [rules/windows_field.yml]
title: Windows field example
logsource:
  product: windows
detection:
  selection:
    win.Image: malware.exe
  condition: selection
```

:::

```splunk
proc.Image="malware.exe"
```

</SigmaConverter>

### Drop Detection Item

Deletes detection items. Some sort of condition is recommended but not required.

**Parameters:**

- none

<SigmaConverter>

::: code-group

```yaml [pipelines/transformation_demo.yml]{6-10}
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

```yaml [rules/process_creation_hashes.yml]
title: Process creation with hashes
logsource:
  product: windows
  category: process_creation
detection:
  selection:
    Hashes: "MD5=1234567890ABCDEF"
    CommandLine|contains: whoami
  condition: selection
```

:::

```splunk
CommandLine="*whoami*"
```

</SigmaConverter>

### Field Name Suffix

Add a field name suffix. field_name_conditions are not required, but are recommended.

**Parameters:**

- 'suffix': the suffix to be added (required)

<SigmaConverter>

::: code-group

```yaml [pipelines/transformation_demo.yml]{5-6}
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

```yaml [rules/hashes_field.yml]
title: Hashes field example
logsource:
  product: windows
  category: process_creation
detection:
  selection:
    Hashes: "MD5=1234567890ABCDEF1234567890ABCDEF"
  condition: selection
```

:::

```splunk
Hashes.win="MD5=1234567890ABCDEF1234567890ABCDEF"
```

</SigmaConverter>

### Field Name Prefix

Add a field name prefix.

**Parameters:**

- 'prefix': the prefix to be added (required)

<SigmaConverter>

::: code-group

```yaml [pipelines/transformation_demo.yml]{5-6}
name: transformation_demo
priority: 100
transformations:
  - id: windows_field_prefix
    type: field_name_prefix
    prefix: "win."
```

```yaml [rules/windows_image.yml]
title: Windows image example
logsource:
  product: windows
detection:
  selection:
    Image: malware.exe
  condition: selection
```

:::

```splunk
win.Image="malware.exe"
```

</SigmaConverter>

### Wildcard Placeholders

Replaces placeholders with wildcards. This transformation is useful if remaining placeholders should be replaced with something meaningful to make conversion of rules possible without defining the placeholders content.

**Parameters:**

- none

<SigmaConverter>

::: code-group

```yaml [pipelines/transformation_demo.yml]{5}
name: transformation_demo
priority: 100
transformations:
  - id: wildcard_placeholders_transformation
    type: wildcard_placeholders
```

```yaml [rules/admin_logon.yml]
title: Logon by any admin user
logsource:
  product: windows
  service: security
detection:
  selection:
    EventID: 4624
    user|expand: "%admin_users%"
  condition: selection
```

:::

```splunk
EventID=4624 user="*"
```

</SigmaConverter>

### Value Placeholders

Replaces placeholders with values contained in variables defined in the configuration.

**Parameters:**

- `include`: identify the specific placeholders you'd like to transform

<SigmaConverter :siems="['splunk']">

::: code-group

```yaml [pipelines/value_placeholders_test.yml]{2-10}
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

```yaml [rules/rule.yml]
title: Administrator Usage
logsource:
  product: windows
detection:
  selection:
    user|expand: "%administrator_name%"
  condition: selection
```

:::

```splunk
user IN ("Administrator", "Admin", "SysAdmin")
```

</SigmaConverter>

### Query Expression Placeholders

Replaces a placeholder with a plain query containing the placeholder or an identifier
mapped from the placeholder name. The main purpose is the generation of arbitrary
list lookup expressions which are passed to the resulting query.

**Parameters:**

- `expression`: string that contains query expression with {field} and {id} placeholder where placeholder identifier or a mapped identifier is inserted.
- `include`:identify the specific placeholders you'd like to transform
- `mapping`: Mapping between placeholders and identifiers that should be used in the expression. If no mapping is provided the placeholder name is used.

<SigmaConverter :siems="['splunk']">

::: code-group

```yaml [pipelines/transformation_demo.yml]{5-8}
name: transformation_demo
priority: 100
transformations:
  - id: Admins_Workstations_query_expression_placeholder
    type: query_expression_placeholders
    include:
      - Admins_Workstations
    expression: "[| inputlookup {id} | rename user as {field}]"
```

```yaml [rules/privileged_logon.yml]
title: Privileged logon example
logsource:
  product: windows
  service: security
detection:
  selection:
    EventID: 4672
    SubjectUserName|expand: "%Admins_Workstations%"
  condition: selection
```

:::

```splunk
EventID=4672 [| inputlookup Admins_Workstations | rename user as SubjectUserName]
```

</SigmaConverter>

### Add Condition

Adds an `AND` condition expression to the rule's conditions. This is most often used to add an index, source type, or other environment-specific constraint.

If `template` is set to `true`, the condition values are interpreted as string templates and the following placeholders are replaced:

- `category`, `product` and `service`: with the corresponding values of the Sigma rule log source.

**Parameters:**

- 'conditions': a mapping of field names to values that will be added to the rule's condition.
- 'template': _(Optional)_ when `true`, interpret the condition values as templates. Defaults to `false`.
- 'negated': _(Optional)_ when `true`, the added condition is negated (e.g. `NOT index="..."`). Defaults to `false`.

<SigmaConverter>

::: code-group

```yaml [pipelines/transformation_demo.yml]{5-7}
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

```yaml [rules/windows_image.yml]
title: Windows image example
logsource:
  product: windows
detection:
  selection:
    Image: malware.exe
  condition: selection
```

:::

```splunk
index="winevent" Image="malware.exe"
```

</SigmaConverter>

### Change Logsource

Replace the log source of a rule with the one defined in the transformation parameters. On its own this rewrite isn't visible in the query — but it lets _later_ transformations target the rewritten log source. In the example below the rule's generic `process_creation` source is rewritten to `service: sysmon`, and a second `add_condition` keyed on that new `service: sysmon` log source then fires, adding the Sysmon `source=` constraint.

**Parameters:**

- 'category', 'product', 'service': the log source to be changed (requires at least one)

<SigmaConverter>

::: code-group

```yaml [pipelines/transformation_demo.yml]{4-12}
name: transformation_demo
priority: 100
transformations:
  - id: rewrite_logsource
    type: change_logsource
    service: sysmon
    category: process_creation
    product: windows
    rule_conditions:
      - type: logsource
        category: process_creation
        product: windows
  - id: sysmon_source
    type: add_condition
    conditions:
      source: WinEventLog:Microsoft-Windows-Sysmon/Operational
    rule_conditions:
      - type: logsource
        service: sysmon
```

```yaml [rules/suspicious_whoami.yml]
title: Suspicious whoami execution
logsource:
  product: windows
  category: process_creation
detection:
  selection:
    CommandLine|contains: whoami
  condition: selection
```

:::

```splunk
source="WinEventLog:Microsoft-Windows-Sysmon/Operational" CommandLine="*whoami*"
```

</SigmaConverter>

### Replace String

Replace string part matched by regular expression with replacement string that can reference
capture groups. It operates on the plain string representation of the SigmaString value.

This is basically an interface to `re.sub()` and can use all features available there.

**Parameters:**

- `regex`: The regular expression to find the desired string
- `replacement`: The replacement string to be added

<SigmaConverter>

::: code-group

```yaml [pipelines/transformation_demo.yml]{5-7}
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

```yaml [rules/image_path.yml]
title: Image path example
logsource:
  product: windows
detection:
  selection:
    Image: '*\malware.exe'
  condition: selection
```

:::

```splunk
Image="malware.exe"
```

</SigmaConverter>

### Set State

Stores a key/value in the pipeline **state** — a shared bag of values that later transformations, [conditions](#conditions), templates, and the backend itself can read. Unlike most transformations, `set_state` doesn't change the rule directly; it leaves a value behind for something else to act on.

This is how several backends receive configuration that isn't part of the query expression. For example, the [Elasticsearch ES|QL recipe](/docs/digging-deeper/pipelines#elasticsearch-es-ql-set-the-index-via-state) sets the `index` key so the backend knows which index to put in the `FROM` clause, and the Splunk backend reads `data_model_set` to build `tstats` data-model queries.

**Parameters:**

- `key`: the state key to set.
- `val`: the value to assign.

<SigmaConverter :siems="['esql']">

::: code-group

```yaml [pipelines/esql_index.yml]{3-7}
name: esql_index
priority: 100
transformations:
  - id: set_index
    type: set_state
    key: index
    val: logs-windows-*
    rule_conditions:
      - type: logsource
        product: windows
```

```yaml [rules/process_creation.yml]
title: Process creation example
logsource:
  product: windows
  category: process_creation
detection:
  selection:
    CommandLine|contains: suspicious_command
  condition: selection
```

:::

```esql
from logs-windows-* metadata _id, _index, _version | where CommandLine like "*suspicious_command*"
```

</SigmaConverter>

::: details Backend-specific example: Splunk data models
Setting `data_model_set` lets the Splunk backend emit a `tstats` query when used with the `data_model` output format (`sigma convert -p pipeline.yml -t splunk -f data_model rule.yml`):

```yaml
transformations:
  - id: set_datamodel
    type: set_state
    key: "data_model_set"
    val: "Endpoint.Processes"
```

```splunk [Splunk Output]
| tstats summariesonly=false allow_old_summaries=true fillnull_value="null" count min(_time) as firstTime max(_time) as lastTime from datamodel=Endpoint.Processes where ... by CommandLine Image OriginalFilename | `drop_dm_object_name(Processes)`
```

:::

### Rule Failure

Raise a SigmaTransformationError with the provided message. This enables transformation pipelines to signalize that a certain situation can't be handled, e.g. only a subset of values is allowed because the target data model doesn't offers all possibilities. A transformation condition is not required, but is recommended.

**Parameters:**

- `message`: the message to present when the transformation failure state is met

::: code-group

```yaml [pipelines/transformation_demo.yml]{5-6}
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

```yaml [pipelines/transformation_demo.yml]{5-6}
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

### Map String

Replace whole string values with one or more other values. Unlike `replace_string`, this matches the entire value rather than a regular expression substring, and a single value can be mapped to a list of values.

**Parameters:**

- `mapping`: a mapping of source values to their replacement value(s).

<SigmaConverter>

::: code-group

```yaml [pipelines/transformation_demo.yml]{5-8}
name: transformation_demo
priority: 100
transformations:
  - id: severity_map
    type: map_string
    mapping:
      Informational: Info
      Critical:
        - Critical
        - High
    field_name_conditions:
      - type: include_fields
        fields:
          - Severity
```

```yaml [rules/severity.yml]
title: Severity example
logsource:
  product: windows
detection:
  selection:
    Severity: Informational
  condition: selection
```

:::

```splunk
Severity="Info"
```

</SigmaConverter>

### Set Value

Set a detection item to a fixed value, regardless of its original value. `force_type` can be used to coerce the value to a string or number.

**Parameters:**

- `value`: the value to set (string, number, or boolean).
- `force_type`: _(Optional)_ force the value's type, either `str` or `num`.

<SigmaConverter>

::: code-group

```yaml [pipelines/transformation_demo.yml]{5-6}
name: transformation_demo
priority: 100
transformations:
  - id: set_eventid
    type: set_value
    value: 4625
    field_name_conditions:
      - type: include_fields
        fields:
          - EventID
```

```yaml [rules/eventid.yml]
title: EventID example
logsource:
  product: windows
detection:
  selection:
    EventID: 1234
  condition: selection
```

:::

```splunk
EventID=4625
```

</SigmaConverter>

### Convert Type

Convert detection item values between strings and numbers. This is useful when your SIEM expects a specific type for a field.

**Parameters:**

- `target_type`: the type to convert to, either `str` or `num`.

<SigmaConverter>

::: code-group

```yaml [pipelines/transformation_demo.yml]{5-6}
name: transformation_demo
priority: 100
transformations:
  - id: port_to_string
    type: convert_type
    target_type: str
    field_name_conditions:
      - type: include_fields
        fields:
          - DestinationPort
```

```yaml [rules/port.yml]
title: Port example
logsource:
  product: windows
detection:
  selection:
    DestinationPort: 443
  condition: selection
```

:::

```splunk
DestinationPort="443"
```

</SigmaConverter>

### Case

Change the case of detection item values.

**Parameters:**

- `method`: one of `lower`, `upper`, or `snake_case`. Defaults to `lower`.

<SigmaConverter>

::: code-group

```yaml [pipelines/transformation_demo.yml]{5-6}
name: transformation_demo
priority: 100
transformations:
  - id: lowercase_user
    type: case
    method: lower
    field_name_conditions:
      - type: include_fields
        fields:
          - User
```

```yaml [rules/user.yml]
title: User example
logsource:
  product: windows
detection:
  selection:
    User: ADMIN
  condition: selection
```

:::

```splunk
User="admin"
```

</SigmaConverter>

### Regex

Control how regular expressions are emitted in the resulting query. This is mainly useful for handling case-insensitive matching in backends that expect a particular regex dialect.

**Parameters:**

- `method`: one of `plain`, `ignore_case_flag`, or `ignore_case_brackets`. Defaults to `ignore_case_brackets`.

<SigmaConverter>

::: code-group

```yaml [pipelines/transformation_demo.yml]{5-6}
name: transformation_demo
priority: 100
transformations:
  - id: regex_ci
    type: regex
    method: ignore_case_flag
```

```yaml [rules/regex_match.yml]
title: Regex example
logsource:
  product: windows
detection:
  selection:
    CommandLine|re: foo.*bar
  condition: selection
```

:::

```splunk
*
| regex CommandLine="foo.*bar"
```

</SigmaConverter>

### Hashes Fields

Split a combined `Hashes` field (as produced by Sysmon) into separate fields per hash algorithm, so each algorithm can be matched on its own field.

**Parameters:**

- `valid_hash_algos`: the list of hash algorithms to extract (e.g. `MD5`, `SHA1`, `SHA256`).
- `field_prefix`: _(Optional)_ a prefix to prepend to the generated field names. Defaults to `""`.
- `drop_algo_prefix`: _(Optional)_ when `true`, drop the algorithm prefix from the resulting field name. Defaults to `false`.

<SigmaConverter>

::: code-group

```yaml [pipelines/transformation_demo.yml]{5-8}
name: transformation_demo
priority: 100
transformations:
  - id: split_hashes
    type: hashes_fields
    valid_hash_algos:
      - MD5
      - SHA1
      - SHA256
    field_name_conditions:
      - type: include_fields
        fields:
          - Hashes
```

```yaml [rules/hashes_field.yml]
title: Hashes field example
logsource:
  product: windows
  category: process_creation
detection:
  selection:
    Hashes: "MD5=1234567890ABCDEF1234567890ABCDEF"
  condition: selection
```

:::

```splunk
MD5="1234567890ABCDEF1234567890ABCDEF"
```

</SigmaConverter>

### Add Field / Remove Field / Set Field

These transformations modify the rule's field list (the list of fields a backend may emit alongside the query, e.g. in a table or saved search), rather than the detection logic itself.

- `add_field` — add one or more fields. **Parameter:** `field` (string or list).
- `remove_field` — remove one or more fields. **Parameter:** `field` (string or list).
- `set_field` — replace the field list entirely. **Parameter:** `fields` (list).

<SigmaConverter>

::: code-group

```yaml [pipelines/transformation_demo.yml]{5-8}
name: transformation_demo
priority: 100
transformations:
  - id: add_output_fields
    type: add_field
    field:
      - User
      - ComputerName
```

```yaml [rules/process_creation.yml]
title: Process creation example
logsource:
  product: windows
  category: process_creation
detection:
  selection:
    CommandLine|contains: suspicious_command
  condition: selection
```

:::

```splunk
CommandLine="*suspicious_command*" | table User,ComputerName
```

</SigmaConverter>

### Set Custom Attribute

Set an arbitrary custom attribute on the rule. This is useful for carrying metadata through to an output format or finalizer.

**Parameters:**

- `attribute`: the attribute name to set.
- `value`: the value to assign.

::: code-group

```yaml [pipelines/transformation_demo.yml]{5-6}
name: transformation_demo
priority: 100
transformations:
  - id: tag_team
    type: set_custom_attribute
    attribute: team
    value: detection-engineering
```

:::

### Strict Field Mapping Failure

Raise a `SigmaTransformationError` when a field is encountered that is not covered by a field mapping. This is useful to enforce that every field in a rule has an explicit mapping for a given target, catching unmapped fields at conversion time.

**Parameters:**

- none

::: code-group

```yaml [pipelines/transformation_demo.yml]{5}
name: transformation_demo
priority: 100
transformations:
  - id: enforce_mapping
    type: strict_field_mapping_failure
    field_name_conditions:
      - type: processing_item_applied
        processing_item_id: field_mapping
    field_name_cond_not: true
```

:::

### Nest

Apply a list of transformations as a single grouped unit. The nested transformations share the conditions defined on the `nest` item, which is handy for applying the same set of conditions to several transformations without repeating them.

**Parameters:**

- `items`: a list of nested transformation items (each with its own `type`).

<SigmaConverter>

::: code-group

```yaml [pipelines/transformation_demo.yml]{5-12}
name: transformation_demo
priority: 100
transformations:
  - id: windows_group
    type: nest
    items:
      - id: prefix
        type: field_name_prefix
        prefix: "win."
      - id: suffix
        type: field_name_suffix
        suffix: ".keyword"
    rule_conditions:
      - type: logsource
        product: windows
```

```yaml [rules/windows_image.yml]
title: Windows image example
logsource:
  product: windows
detection:
  selection:
    Image: malware.exe
  condition: selection
```

:::

```splunk
win.Image.keyword="malware.exe"
```

</SigmaConverter>

## Backend-Specific Transformations

Backends may register their own transformation types on top of the core set above. These only work when converting with that backend, but are documented in their respective projects.

### Custom Pipelines: Set Custom Log Source

The [Grafana Loki backend](https://github.com/grafana/pySigma-backend-loki) adds a `set_custom_log_source` transformation that builds a Loki [stream selector](https://grafana.com/docs/loki/latest/query/log_queries/#log-stream-selector) (`{label="value"}`) from structured YAML. It's a good illustration of how a backend can extend the pipeline system with behaviour the core can't express.

**Parameters:**

- `selection`: a mapping of labels to values used to build the stream selector.
- `template`: _(Optional)_ when `true`, `category`/`product`/`service` placeholders are substituted from the rule's log source.

<SigmaConverter :siems="['loki']">

::: code-group

```yaml [pipelines/loki_custom.yml]{4-7}
name: loki_custom
priority: 100
transformations:
  - id: loki_custom_mapping
    type: set_custom_log_source
    selection:
      job: job-name
      app: loki
    rule_conditions:
      - type: logsource
        category: process_creation
        product: windows
```

```yaml [rules/process_creation_eventid.yml]
title: Process creation with event id
logsource:
  product: windows
  category: process_creation
detection:
  selection:
    EventID: 4688
    CommandLine|contains: suspicious_command
  condition: selection
```

:::

```logql
{job=`job-name`,app=`loki`} | json | EventID=4688 and CommandLine=~`(?i).*suspicious_command.*`
```

</SigmaConverter>
