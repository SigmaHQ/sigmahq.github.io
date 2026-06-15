## Conditions

Conditions can be attached transformations, so that a transformation may only trigger when a given logsource is present, or only if another transformation was applied previously during the conversion process. Conditions also support a conditional logic system implemented in PySigma version v0.11.19 that perform similar to how the detection logic in a Sigma rule itself works allowing you to assign an identifier to a transformation and perform logical operations against those identifiers.

<SigmaConverter :siems="['splunk']">

::: code-group

```yaml [pipelines/m365.yml]
name: m365
priority: 20
transformations:
  - id: atp_index
    type: add_condition
    conditions:
      index: microsoft_atp
    rule_conditions:
      - type: logsource
        product: m365
        service: threat_detection
  - id: defender_index
    type: add_condition
    conditions:
      index: "microsoft_defender"
    rule_conditions:
      logsource_cond:
        type: logsource
        product: m365
      logsource_cond2:
        type: processing_item_applied
        processing_item_id: atp_index
    rule_cond_expr: logsource_cond and not logsource_cond2
```

```yaml [rules/m365_threat_detection.yml]
title: Suspicious m365 threat detection alert
date: 2025-06-01
tags:
  - attack.discovery
logsource:
  product: m365
  service: threat_detection
detection:
  selection:
    Severity: Informational
    CommandLine|contains: whoami
  condition: selection
```

:::

```splunk
index="microsoft_atp" Severity="Informational" CommandLine="*whoami*"
```

</SigmaConverter>

### Combining Conditions

Each transformation can carry up to three groups of conditions, evaluated against different parts of the rule:

- `rule_conditions` — matched against the rule as a whole ([rule-based conditions](#rule-based-conditions)).
- `detection_item_conditions` — matched against individual detection items ([detection-based conditions](#detection-based-conditions)).
- `field_name_conditions` — matched against field names ([field-based conditions](#field-based-conditions)).

By default, **all** conditions within a group must match. This can be controlled per group:

| Key                        | Description                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| `rule_cond_op`             | How `rule_conditions` are combined: `and` (default) or `or`.                                |
| `rule_cond_not`            | When `true`, negate the result of the `rule_conditions` group. Defaults to `false`.         |
| `rule_cond_expr`           | A boolean expression referencing named conditions (mutually exclusive with `rule_cond_op`). |
| `detection_item_cond_op`   | As above, for `detection_item_conditions`.                                                  |
| `detection_item_cond_not`  | As above, for `detection_item_conditions`.                                                  |
| `detection_item_cond_expr` | As above, for `detection_item_conditions`.                                                  |
| `field_name_cond_op`       | As above, for `field_name_conditions`.                                                      |
| `field_name_cond_not`      | As above, for `field_name_conditions`.                                                      |
| `field_name_cond_expr`     | As above, for `field_name_conditions`.                                                      |

When using a `*_cond_expr` expression (as in the `m365.yml` example above), the conditions in that group must be supplied as a **mapping** of identifiers to conditions, rather than a list, so each can be referenced by name in the expression.

### Rule-based Conditions

| Identifier                |
| ------------------------- |
| logsource                 |
| contains_detection_item   |
| contains_field            |
| processing_item_applied   |
| processing_state          |
| is_sigma_rule             |
| is_sigma_correlation_rule |
| rule_attribute            |
| tag                       |

#### logsource

Matches log source on rule. Not specified log source fields are ignored. For Correlation rules, the condition returns true if any of the associated rules have the required log source fields.

**Parameters:**

- 'category': the category field in the sigma rule logsource section
- 'product': the product field in the sigma rule logsource section
- 'service': the service field in the sigma rule logsource section

<SigmaConverter :siems="['splunk']">

::: code-group

```yaml [pipelines/transformation_demo.yml]
name: transformation_demo
priority: 100
transformations:
  - id: atp_index
    type: add_condition
    conditions:
      index: microsoft_atp
    rule_conditions:
      - type: logsource
        product: m365
        service: threat_detection
```

```yaml [rules/m365_threat_detection.yml]
title: Suspicious m365 threat detection alert
date: 2025-06-01
tags:
  - attack.discovery
logsource:
  product: m365
  service: threat_detection
detection:
  selection:
    Severity: Informational
    CommandLine|contains: whoami
  condition: selection
```

:::

```splunk
index="microsoft_atp" Severity="Informational" CommandLine="*whoami*"
```

</SigmaConverter>

#### contains_detection_item

Returns True if rule contains a detection item that matches the given field name and value.

**Parameters:**

- 'field': The field you'd like to match on.
- 'value': The value you'd like to match on.

<SigmaConverter :siems="['splunk']">

::: code-group

```yaml [pipelines/transformation_demo.yml]
name: transformation_demo
priority: 100
transformations:
  - id: atp_index
    type: add_condition
    conditions:
      index: microsoft_atp
    rule_conditions:
      - type: contains_detection_item
        field: Severity
        value: Informational
```

```yaml [rules/m365_threat_detection.yml]
title: Suspicious m365 threat detection alert
date: 2025-06-01
tags:
  - attack.discovery
logsource:
  product: m365
  service: threat_detection
detection:
  selection:
    Severity: Informational
    CommandLine|contains: whoami
  condition: selection
```

:::

```splunk
index="microsoft_atp" Severity="Informational" CommandLine="*whoami*"
```

</SigmaConverter>

#### contains_field

Returns True if the rule contains a detection item that uses the given field name, regardless of its value.

**Parameters:**

- 'field': The field name you'd like to match on.

<SigmaConverter :siems="['splunk']">

::: code-group

```yaml [pipelines/transformation_demo.yml]
name: transformation_demo
priority: 100
transformations:
  - id: atp_index
    type: add_condition
    conditions:
      index: microsoft_atp
    rule_conditions:
      - type: contains_field
        field: CommandLine
```

```yaml [rules/m365_threat_detection.yml]
title: Suspicious m365 threat detection alert
date: 2025-06-01
tags:
  - attack.discovery
logsource:
  product: m365
  service: threat_detection
detection:
  selection:
    Severity: Informational
    CommandLine|contains: whoami
  condition: selection
```

:::

```splunk
index="microsoft_atp" Severity="Informational" CommandLine="*whoami*"
```

</SigmaConverter>

#### processing_item_applied

Checks whether an earlier processing item (referenced by its `id`) was applied. Useful for chaining transformations — e.g. only adding a prefix to fields that a previous mapping step did _not_ touch.

**Parameters:**

- `processing_item_id`: the identifier of the processing item to match on.

```yaml
rule_conditions:
  - type: processing_item_applied
    processing_item_id: field_mapping
```

#### processing_state

Matches against a value stored in the [pipeline state](#pipeline-variables-and-state) (see [`set_state`](#set-state)).

**Parameters:**

- `key`: the state key.
- `val`: the value to match.

```yaml
rule_conditions:
  - type: processing_state
    key: backend
    val: splunk
```

::: tip Available in every condition group
`processing_item_applied` and `processing_state` work identically as `rule_conditions`, `detection_item_conditions`, or `field_name_conditions` — only the context they evaluate against differs.
:::

#### is_sigma_rule

Checks if rule is a SigmaRule.

**Parameters:**

- N/A

<SigmaConverter :siems="['splunk']">

::: code-group

```yaml [pipelines/transformation_demo.yml]
name: transformation_demo
priority: 100
transformations:
  - id: atp_index
    type: add_condition
    conditions:
      index: microsoft_atp
    rule_conditions:
      - type: is_sigma_rule
```

```yaml [rules/m365_threat_detection.yml]
title: Suspicious m365 threat detection alert
date: 2025-06-01
tags:
  - attack.discovery
logsource:
  product: m365
  service: threat_detection
detection:
  selection:
    Severity: Informational
    CommandLine|contains: whoami
  condition: selection
```

:::

```splunk
index="microsoft_atp" Severity="Informational" CommandLine="*whoami*"
```

</SigmaConverter>

#### is_sigma_correlation_rule

Checks if rule is a SigmaRule.

**Parameters:**

- N/A

<SigmaConverter :siems="['splunk']">

::: code-group

```yaml [pipelines/transformation_demo.yml]
name: transformation_demo
priority: 100
transformations:
  - id: atp_index
    type: add_condition
    conditions:
      index: microsoft_atp
    rule_conditions:
      - type: is_sigma_correlation_rule
```

```yaml [rules/m365_threat_detection.yml]
title: Suspicious m365 threat detection alert
date: 2025-06-01
tags:
  - attack.discovery
logsource:
  product: m365
  service: threat_detection
detection:
  selection:
    Severity: Informational
    CommandLine|contains: whoami
  condition: selection
```

:::

```splunk
Severity="Informational" CommandLine="*whoami*"
```

</SigmaConverter>

::: info Condition not met
The rule above is a plain Sigma rule, **not** a correlation rule, so
`is_sigma_correlation_rule` does not match and the `index` condition is _not_
added. Engage the editor and swap in a correlation rule to see it apply.
:::

#### rule_attribute

Generic match on rule attributes with supported types:

- strings (exact matches)
- UUIDs (exact matches)
- numbers (relations: eq, ne, gte, ge, lte, le)
- dates (relations: eq, ne, gte, ge, lte, le)
- Rule severity levels (relations: eq, ne, gte, ge, lte, le)
- Rule statuses (relations: eq, ne, gte, ge, lte, le)
- Fields that contain lists of values, maps or other complex data structures are not supported and raise a SigmaConfigurationError. If the type of the value doesn’t allows a particular relation, the condition also raises a SigmaConfigurationError on match.

**Parameters:**

- 'attribute': The attribute to match on.
- 'value': The value to match on.
- 'op': The relational comparison type to match on. One of `eq` (equals), `ne` (not equals), `gte` (greater than or equals), `gt` (greater than), `lte` (less than or equals), `lt` (less than), `in` (value is in a list) or `not_in` (value is not in a list). Defaults to `eq`.

<SigmaConverter :siems="['splunk']">

::: code-group

```yaml [pipelines/transformation_demo.yml]
name: transformation_demo
priority: 100
transformations:
  - id: atp_index
    type: add_condition
    conditions:
      index: microsoft_atp
    rule_conditions:
      - type: rule_attribute
        attribute: date
        value: "2025-01-01"
        op: gte
```

```yaml [rules/m365_threat_detection.yml]
title: Suspicious m365 threat detection alert
date: 2025-06-01
tags:
  - attack.discovery
logsource:
  product: m365
  service: threat_detection
detection:
  selection:
    Severity: Informational
    CommandLine|contains: whoami
  condition: selection
```

:::

```splunk
index="microsoft_atp" Severity="Informational" CommandLine="*whoami*"
```

</SigmaConverter>

#### tag

Matches if rule is tagged with a specific tag.

**Parameters:**

- 'tag': The tag to match on.

<SigmaConverter :siems="['splunk']">

::: code-group

```yaml [pipelines/transformation_demo.yml]
name: transformation_demo
priority: 100
transformations:
  - id: atp_index
    type: add_condition
    conditions:
      index: microsoft_atp
    rule_conditions:
      - type: tag
        tag: attack.discovery
```

```yaml [rules/m365_threat_detection.yml]
title: Suspicious m365 threat detection alert
date: 2025-06-01
tags:
  - attack.discovery
logsource:
  product: m365
  service: threat_detection
detection:
  selection:
    Severity: Informational
    CommandLine|contains: whoami
  condition: selection
```

:::

```splunk
index="microsoft_atp" Severity="Informational" CommandLine="*whoami*"
```

</SigmaConverter>

### Detection-based Conditions

| Identifier              |
| ----------------------- |
| match_string            |
| match_value             |
| contains_wildcard       |
| is_null                 |
| processing_item_applied |
| processing_state        |

#### match_string

Match string values with a regular expression ‘pattern’. The parameter ‘cond’ determines for detection items with multiple values if any or all strings must match. Generally, values which aren’t strings are skipped in any mode or result in a false result in all match mode.

**Parameters:**

- 'cond': 'any' or 'all'
- 'pattern': The pattern to match on
- 'negate': Default to false, but can be changed to True to make a negated condition

<SigmaConverter :siems="['splunk']">

::: code-group

```yaml [pipelines/transformation_demo.yml]
name: transformation_demo
priority: 100
transformations:
  - id: atp_index
    type: add_condition
    conditions:
      index: microsoft_atp
    detection_item_conditions:
      - type: match_string
        cond: any
        pattern: informational
        negate: False
```

```yaml [rules/m365_threat_detection.yml]
title: Suspicious m365 threat detection alert
date: 2025-06-01
tags:
  - attack.discovery
logsource:
  product: m365
  service: threat_detection
detection:
  selection:
    Severity: Informational
    CommandLine|contains: whoami
  condition: selection
```

:::

```splunk
index="microsoft_atp" Severity="Informational" CommandLine="*whoami*"
```

</SigmaConverter>

#### match_value

Match detection item values against a plain value (no regular expression). The parameter ‘cond’ determines, for detection items with multiple values, whether any or all values must match.

**Parameters:**

- 'cond': 'any' or 'all'
- 'value': The value to match on (string, number or boolean).

<SigmaConverter :siems="['splunk']">

::: code-group

```yaml [pipelines/transformation_demo.yml]
name: transformation_demo
priority: 100
transformations:
  - id: atp_index
    type: add_condition
    conditions:
      index: microsoft_atp
    detection_item_conditions:
      - type: match_value
        cond: any
        value: Informational
```

```yaml [rules/m365_threat_detection.yml]
title: Suspicious m365 threat detection alert
date: 2025-06-01
tags:
  - attack.discovery
logsource:
  product: m365
  service: threat_detection
detection:
  selection:
    Severity: Informational
    CommandLine|contains: whoami
  condition: selection
```

:::

```splunk
index="microsoft_atp" Severity="Informational" CommandLine="*whoami*"
```

</SigmaConverter>

#### contains_wildcard

Matches if a detection item value contains a wildcard character. The parameter ‘cond’ determines, for detection items with multiple values, whether any or all values must contain a wildcard.

**Parameters:**

- 'cond': 'any' or 'all'

<SigmaConverter :siems="['splunk']">

::: code-group

```yaml [pipelines/transformation_demo.yml]
name: transformation_demo
priority: 100
transformations:
  - id: atp_index
    type: add_condition
    conditions:
      index: microsoft_atp
    detection_item_conditions:
      - type: contains_wildcard
        cond: any
```

```yaml [rules/m365_threat_detection.yml]
title: Suspicious m365 threat detection alert
date: 2025-06-01
tags:
  - attack.discovery
logsource:
  product: m365
  service: threat_detection
detection:
  selection:
    Severity: Informational
    CommandLine|contains: whoami
  condition: selection
```

:::

```splunk
index="microsoft_atp" Severity="Informational" CommandLine="*whoami*"
```

</SigmaConverter>

#### is_null

Match null values. The parameter ‘cond’ determines for detection items with multiple values if any or all strings must match. Generally, values which aren’t strings are skipped in any mode or result in a false result in all match mode.

**Parameters:**

- 'cond': 'any' or 'all'

<SigmaConverter :siems="['splunk']">

::: code-group

```yaml [pipelines/transformation_demo.yml]
name: transformation_demo
priority: 100
transformations:
  - id: atp_index
    type: add_condition
    conditions:
      index: microsoft_atp
    detection_item_conditions:
      - type: is_null
        cond: any
```

```yaml [rules/m365_threat_detection.yml]
title: Rule with a null field
logsource:
  product: m365
  service: threat_detection
detection:
  selection:
    Severity: Informational
    CommandLine: null
  condition: selection
```

:::

```splunk
index="microsoft_atp" Severity="Informational" NOT CommandLine=*
```

</SigmaConverter>

#### processing_item_applied / processing_state

Also available here as detection-item conditions — see the [shared description above](#processing-item-applied). Use them under `detection_item_conditions:` instead of `rule_conditions:`.

### Field-based Conditions

| Identifier              |
| ----------------------- |
| include_fields          |
| exclude_fields          |
| processing_item_applied |
| processing_state        |

#### include_fields

Matches on field name if it is contained in fields list. The parameter ‘mode’ determines if field names are matched as plain string (“plain”) or regular expressions (“re”).

**Parameters:**

- 'fields': The fields to match on
- 'mode': Plain match or regex match using 'plain' or 're'. Defaults to 'plain'.

<SigmaConverter :siems="['splunk']">

::: code-group

```yaml [pipelines/include_fields_demo.yml]
name: include_fields_demo
priority: 100
transformations:
  - id: atp_index
    type: drop_detection_item
    field_name_conditions:
      - type: include_fields
        fields:
          - name
          - type
```

```yaml [rules/proc_with_fields.yml]
title: Suspicious process with name and type fields
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    name: malware.exe
    type: create
    value: 1
  condition: selection
```

:::

```splunk
value=1
```

</SigmaConverter>

#### exclude_fields

Matches on field name if it is **not** contained in the fields list.

**Parameters:**

- 'fields': The fields to match on
- 'mode': Plain match or regex match using 'plain' or 're'. Defaults to 'plain'.

<SigmaConverter :siems="['splunk']">

::: code-group

```yaml [pipelines/exclude_fields_demo.yml]
name: transformation_demo
priority: 100
transformations:
  - id: atp_index
    type: drop_detection_item
    field_name_conditions:
      - type: exclude_fields
        fields:
          - name
          - value
```

```yaml [rules/proc_with_fields.yml]
title: Suspicious process with name and type fields
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    name: malware.exe
    type: create
    value: 1
  condition: selection
```

:::

```splunk
name="malware.exe" value=1
```

</SigmaConverter>

#### processing_item_applied / processing_state

Also available here as field-name conditions — see the [shared description above](#processing-item-applied). Use them under `field_name_conditions:` instead of `rule_conditions:`.

#### Field-based processing_item_applied

Checks if processing item was applied to detection item.

**Parameters:**

- 'processing_item_id': The identifier of the processing item you'd like to match on

<SigmaConverter :siems="['splunk']">

::: code-group

```yaml [pipelines/processing_item_applied_demo.yml]
name: transformation_demo
priority: 100
transformations:
  - id: test_id
    type: add_condition
    conditions:
      hello: world
  - id: atp_index
    type: add_condition
    conditions:
      index: microsoft_atp
    field_name_conditions:
      - type: processing_item_applied
        processing_item_id: test_id
```

```yaml [rules/proc_with_fields.yml]
title: Suspicious process with name and type fields
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    name: malware.exe
    type: create
    value: 1
  condition: selection
```

:::

```splunk
index="microsoft_atp" hello="world" name="malware.exe" type="create" value=1
```

</SigmaConverter>

#### Field-based processing_state

Matches on processing pipeline state.

**Parameters:**

- 'key': The key for the processing state.
- 'val': The value for the processing state key.

<SigmaConverter :siems="['splunk']">

::: code-group

```yaml [pipelines/processing_state_demo.yml]
name: transformation_demo
priority: 100
transformations:
  - id: atp_index
    type: add_condition
    conditions:
      index: microsoft_atp
    field_name_conditions:
      - type: processing_state
        key: key-test
        val: val-test
```

```yaml [rules/proc_with_fields.yml]
title: Suspicious process with name and type fields
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    name: malware.exe
    type: create
    value: 1
  condition: selection
```

:::

```splunk
index="microsoft_atp" name="malware.exe" type="create" value=1
```

</SigmaConverter>
