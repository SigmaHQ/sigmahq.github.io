---
title: "Frequently Asked Questions"
subtitle: "Guide"
---

# {{ $frontmatter.title }}

We've compiled a list of frequently asked questions to help you get started with Sigma. If you have any questions that are not answered here, please feel free to reach out to us on [Discord](https://discord.gg/kQQBn5W2z5) or [GitHub](https://github.com/SigmaHQ/sigma).

## Conversion

- _**"Can I convert a query in SIEM format X to Sigma?"**_<br />Sorry, there are no easy way. It is possible to generate rules from a query using AI tools or toolsets, but the result is basic. It is often necessary to rework or even correct the rule obtained.

## Detection

- _**"When using Sysmon, why would we use `category: process_creation` and not `service: sysmon`?"**_<br />You can use both! Sigma's aim is to provide agnostic rules, and as such, `process_creation` can be use on Windows with internal Security EventID 4688, or can also be used on Sysmon EventID 1, or even with custom EDR logs.<br /><br />
- _**"We use ECS so why not write the rule with ECS?"**_<br />Sigma extends beyond a one-size-fits-all taxonomy, and ECS is one of many available field naming schemes available. We wrote about this [topic quite a bit over on Medium](https://blog.sigmahq.io/why-does-sigma-has-its-own-taxonomy-28114c407e0a).<br /><br />For custom rules, you're free to use ECS, or any other field naming scheme you desire. However, in order to contribute back to the Sigma main rules repository, you need to adhere to the [Sigma Taxonomy](https://github.com/SigmaHQ/sigma-specification/blob/main/appendix/sigma-taxonomy-appendix.md).

## Correlation Rules

Please find an example of the new Sigma correlation rules below. We've also written a section of the documentation to help with this. Please see the [Correlation section](/docs/meta/correlations) for more information.<br /><br />

- "How write a Rule X triggers at least Y times in B minutes for the same field Z and with different values for field A?"

```yaml
correlation:
  type: value_count
  rules:
    - X
  group-by:
    - Z
  timespan: Bm
  condition:
    field: A
    gte: Y
```

- "How write Rule X triggers at least Y times in B minute for the same field Z?"

```yaml
correlation:
  type: value_count
  rules:
    - X
  group-by:
    - Z
  timespan: Bm
  condition:
    gte: Y
```

- "How write Rules X,Y triggers in the last B minute for the same field Z?"

```yaml
correlation:
  type: temporal
  rules:
    - X
    - Y
  group-by:
    - Z
  timespan: Bm
  condition:
    gte: Y
```

- "How write Rules X then Y triggers in the last B minute for the same field Z?"

```yaml
correlation:
  type: temporal_ordered
  rules:
    - X
    - Y
  group-by:
    - Z
  timespan: Bm
  condition:
    gte: Y
```
