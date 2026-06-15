## Postprocessing

While transformations operate on the Sigma rule _before_ conversion, **query postprocessing** operates on the converted query string for each individual rule. Postprocessing items are defined under the top-level `postprocessing:` key and, like transformations, support the same [conditions](#conditions) (`rule_conditions`, etc.).

The available postprocessing types are:

| `type`            | Purpose                                                                    |
| ----------------- | -------------------------------------------------------------------------- |
| `embed`           | Wrap the query in a prefix and/or suffix.                                  |
| `simple_template` | Insert the query into a Python `str.format()` template.                    |
| `template`        | Insert the query into a Jinja2 template.                                   |
| `json`            | Embed the query into a JSON template by replacing a `%QUERY%` placeholder. |
| `replace`         | Replace parts of the query matched by a regular expression.                |
| `nest`            | Apply a nested list of postprocessing items.                               |

### Embed Query

Wrap each query in a prefix and/or suffix string.

**Parameters:**

- `prefix`: _(Optional)_ text to prepend. Defaults to `""`.
- `suffix`: _(Optional)_ text to append. Defaults to `""`.

<SigmaConverter :siems="['splunk']">

::: code-group

```yaml [pipelines/postprocessing_demo.yml]{3-6}
name: postprocessing_demo
priority: 100
postprocessing:
  - type: embed
    prefix: "search "
    suffix: " | head 100"
```

```yaml [rules/win_logon_failure.yml]
title: Windows logon failure
logsource:
  product: windows
  service: security
detection:
  selection:
    EventID: 4625
  condition: selection
```

:::

```splunk
search EventID=4625 | head 100
```

</SigmaConverter>

### Simple Template

Insert the query into a Python `str.format()` template. The available placeholders are `{query}`, `{rule}`, and `{pipeline}`.

**Parameters:**

- `template`: the template string.

<SigmaConverter :siems="['splunk']">

::: code-group

```yaml [pipelines/postprocessing_demo.yml]{3-5}
name: postprocessing_demo
priority: 100
postprocessing:
  - type: simple_template
    template: |
      [{rule.title}]
      {query}
```

```yaml [rules/win_logon_failure.yml]
title: Windows logon failure
logsource:
  product: windows
  service: security
detection:
  selection:
    EventID: 4625
  condition: selection
```

:::

```splunk
[Windows logon failure]
EventID=4625
```

</SigmaConverter>

### Template (Jinja2)

Insert the query into a Jinja2 template. The available context variables are `query`, `rule`, and `pipeline`.

**Parameters:**

- `template`: the Jinja2 template string (or, when `path` is set, a relative path to a template file).

<SigmaConverter :siems="['splunk']">

::: code-group

```yaml [pipelines/postprocessing_demo.yml]{3-9}
name: postprocessing_demo
priority: 100
postprocessing:
  - type: template
    template: |
      {
        "name": {{ rule.title | tojson }},
        "query": {{ query | tojson }}
      }
```

```yaml [rules/win_logon_failure.yml]
title: Windows logon failure
logsource:
  product: windows
  service: security
detection:
  selection:
    EventID: 4625
  condition: selection
```

:::

```json
{
  "name": "Windows logon failure",
  "query": "EventID=4625"
}
```

</SigmaConverter>

### JSON

Embed the query into a JSON template by replacing the literal placeholder `%QUERY%` with the query string.

**Parameters:**

- `json_template`: the JSON template containing `%QUERY%`.

<SigmaConverter :siems="['splunk']">

::: code-group

```yaml [pipelines/postprocessing_demo.yml]{3-4}
name: postprocessing_demo
priority: 100
postprocessing:
  - type: json
    json_template: '{"query": "%QUERY%"}'
```

```yaml [rules/win_logon_failure.yml]
title: Windows logon failure
logsource:
  product: windows
  service: security
detection:
  selection:
    EventID: 4625
  condition: selection
```

:::

```json
{ "query": "EventID=4625" }
```

</SigmaConverter>

### Replace

Replace parts of the query matched by a regular expression.

**Parameters:**

- `pattern`: the regular expression to find.
- `replacement`: the replacement string.

<SigmaConverter :siems="['splunk']">

::: code-group

```yaml [pipelines/postprocessing_demo.yml]{3-5}
name: postprocessing_demo
priority: 100
postprocessing:
  - type: replace
    pattern: "EventID="
    replacement: "event_id="
```

```yaml [rules/win_logon_failure.yml]
title: Windows logon failure
logsource:
  product: windows
  service: security
detection:
  selection:
    EventID: 4625
  condition: selection
```

:::

```splunk
event_id=4625
```

</SigmaConverter>
