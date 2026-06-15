## Placeholders

Placeholders let a rule defer part of its value definition to the pipeline. A rule marks a value as a placeholder using the `|expand` modifier (e.g. `user|expand: "%admin_users%"`), and a placeholder transformation then resolves it during conversion.

Three placeholder transformations are available, each documented in detail under [Transformations](#transformations):

- [`value_placeholders`](#value-placeholders) — replace placeholders with values supplied in the pipeline `vars`.
- [`query_expression_placeholders`](#query-expression-placeholders) — replace placeholders with a query expression, typically a list lookup.
- [`wildcard_placeholders`](#wildcard-placeholders) — replace any remaining (undefined) placeholders with wildcards, so rules can convert without defining every placeholder's content.

The most common case — injecting a list of values defined in `vars` — looks like this:

<SigmaConverter :siems="['splunk']">

::: code-group

```yaml [pipelines/placeholder_demo.yml]
name: placeholder_demo
priority: 100
vars:
  admin_users:
    - "Administrator"
    - "Admin"
transformations:
  - type: value_placeholders
    include:
      - "admin_users"
```

```yaml [rules/admin_logon.yml]
title: Logon by admin users
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
EventID=4624 user IN ("Administrator", "Admin")
```

</SigmaConverter>
