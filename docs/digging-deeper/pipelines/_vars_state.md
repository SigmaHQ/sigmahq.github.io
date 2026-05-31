

## Pipeline Variables and State

Pipelines can define variables in the top-level `vars` section. These are most commonly consumed by the placeholder transformations to inject predefined values into rules at conversion time.

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

In addition to `vars`, pipelines maintain a **state** that can be read and modified during processing through the [`set_state`](#set-state) transformation. The state is used by some backends (for example, the Splunk backend reads `data_model_set` when generating `tstats` queries) and is also exposed to templates in [postprocessing](#postprocessing) and [finalizers](#finalizers) via the `pipeline` object.
