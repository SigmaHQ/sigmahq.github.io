---
title: "Convert"
subtitle: "Tools"
---

# {{ $frontmatter.title }} Sigma rules in your browser

Paste a Sigma rule below and convert it into a SIEM query without installing
anything. The conversion runs entirely in your browser using
[pySigma](https://github.com/SigmaHQ/pySigma) compiled to WebAssembly via
[Pyodide](https://pyodide.org/), powered by the
[`@northsh/pysigma-node`](https://github.com/northsh/detection.studio/tree/main/packages/pysigma-node)
package.

::: warning Large one-time download
The example below is a **static** code block until you click
**“Engage live editor”**. Engaging downloads the pySigma engine (Pyodide /
WebAssembly), which is a **~10&nbsp;MB+** one-time download. Everything runs
locally — your rules never leave your browser.
:::

The block below shows a sample Sigma rule. Engage the editor to make it
editable and convert it to a SIEM query of your choice — input on top, the
generated query directly beneath.

<SigmaConverter>

```yaml
title: Whoami Execution
status: test
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    Image|endswith: '\whoami.exe'
  condition: selection
level: high
```

```splunk
Image="*\\whoami.exe"
```

</SigmaConverter>

## How it works

1. **On demand only.** Nothing is fetched until you press the button, so opening
   this page stays fast.
2. **Pyodide bootstraps.** The first load downloads the Pyodide runtime and the
   real upstream pySigma library, then installs the backend for your selected
   target via `micropip`.
3. **Conversion runs in a Web Worker.** Work is offloaded to a Web Worker so the
   page UI stays responsive. The first conversion for a given target takes a few
   seconds while its backend installs; subsequent conversions are fast.

## Supported targets

A range of common targets ship out of the box, including Splunk,
Elasticsearch (ES|QL / Lucene / EQL), Grafana Loki, Microsoft Kusto (KQL),
Panther, Google SecOps, SentinelOne, SQLite, SurrealQL, QuickWit,
CrowdStrike Logscale, DataDog, NetWitness, Carbon Black and uberAgent.

For programmatic conversion in Node.js, Bun, Deno or your own web app, see the
[`@northsh/pysigma-node` documentation](https://github.com/northsh/detection.studio/tree/main/packages/pysigma-node).
For the broader conversion ecosystem, see the [Backends](/docs/digging-deeper/backends)
and [Pipelines](/docs/digging-deeper/pipelines) pages.
