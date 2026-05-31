

## Finalizers

While [postprocessing](#postprocessing) acts on each query individually, **finalizers** act on the complete list of all generated queries once conversion is finished. They are defined under the top-level `finalizers:` key.

The available finalizer types are:

| `type`     | Purpose                                               |
| ---------- | ----------------------------------------------------- |
| `concat`   | Concatenate all queries into a single string.         |
| `json`     | Serialise the list of queries as JSON.                |
| `yaml`     | Serialise the list of queries as YAML.                |
| `template` | Render the list of queries through a Jinja2 template. |
| `nested`   | Apply a list of finalizers in sequence.               |

### Concatenate Queries

Join all queries with a separator and optionally wrap the result in a prefix and suffix.

**Parameters:**

- `separator`: _(Optional)_ string placed between queries. Defaults to a newline.
- `prefix`: _(Optional)_ string placed before the result. Defaults to `""`.
- `suffix`: _(Optional)_ string placed after the result. Defaults to `""`.

```yaml
finalizers:
  - type: concat
    separator: " OR "
    prefix: "("
    suffix: ")"
```

### JSON Output

Serialise the list of queries as a JSON document.

**Parameters:**

- `indent`: _(Optional)_ number of spaces to indent. Defaults to `null` (compact output).

```yaml
finalizers:
  - type: json
    indent: 2
```

### YAML Output

Serialise the list of queries as a YAML document.

**Parameters:**

- `indent`: _(Optional)_ number of spaces to indent.

```yaml
finalizers:
  - type: yaml
    indent: 2
```

### Template Output

Apply a Jinja2 template to the list of queries. The following variables are available in the template context:

- `queries`: the final query output as a list.
- `pipeline`: all the context provided to the processing pipeline, including `pipeline.state`.

```yaml
finalizers:
  - type: template
    template: |
      {
        "query": {{ queries[0] | tojson }}
      }
```

### Nested Finalizer

Apply a list of finalizers in sequence, where the output of one becomes the input of the next.

**Parameters:**

- `finalizers`: a list of finalizer items (each with its own `type`).

```yaml
finalizers:
  - type: nested
    finalizers:
      - type: concat
        separator: "\n"
      - type: template
        template: "{{ queries[0] }}"
```
