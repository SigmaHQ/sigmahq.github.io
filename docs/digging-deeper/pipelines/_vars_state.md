## Pipeline Variables and State

Pipelines can define variables in the top-level `vars` section. These are most commonly consumed by the placeholder transformations to inject predefined values into rules at conversion time.

<SigmaConverter :siems="['splunk']">

::: code-group

```yaml [pipelines/vars_demo.yml]
name: vars_demo
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

In addition to `vars`, pipelines maintain a **state** that can be read and modified during processing through the [`set_state`](#set-state) transformation. The state is used by some backends (for example, the Splunk backend reads `data_model_set` when generating `tstats` queries) and is also exposed to templates in [postprocessing](#postprocessing) and [finalizers](#finalizers) via the `pipeline` object.
