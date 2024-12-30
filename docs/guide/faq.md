---
title: "Frequently Asked Questions"
subtitle: "Guide"
---

# {{ $frontmatter.title }}

We've compiled a list of frequently asked questions to help you get started with Sigma. If your question isn't answered here, please reach out to us on [Discord](https://discord.gg/kQQBn5W2z5) or [GitHub](https://github.com/SigmaHQ/sigma).

## Conversion

- _**"Is it possible to convert queries from SIEM format X to Sigma?"**_<br />There isn't a straightforward way to do this. While it's possible to generate rules from queries using AI tools or other utilities, the results are often basic and may require significant rework or correction.

## Detection

- _**"Why should we use `category: process_creation` instead of `service: sysmon` when using Sysmon?"**_<br />You can actually use either! Sigma aims to provide platform-agnostic rules. The `process_creation` category works with Windows Security EventID 4688, Sysmon EventID 1, and even custom EDR logs.<br /><br />
- _**"Since we use ECS, why not write rules using ECS format?"**_<br />Sigma's scope extends beyond any single taxonomy, with ECS being just one of many available field naming schemes. We've discussed this topic in detail in our [Medium article](https://blog.sigmahq.io/why-does-sigma-has-its-own-taxonomy-28114c407e0a).<br /><br />While you're free to use ECS or any other field naming scheme for your custom rules, contributions to the main Sigma rules repository must follow the [Sigma Taxonomy](https://github.com/SigmaHQ/sigma-specification/blob/main/appendix/sigma-taxonomy-appendix.md).

## Correlation Rules

Below are examples of common correlation rule patterns. For detailed information, please refer to the [Correlation section](/docs/meta/correlations).<br /><br />

- "How do I write a rule where X triggers at least Y times in B minutes for the same field Z with different values for field A?"

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

- "How do I write a rule where X triggers at least Y times in B minutes for the same field Z?"

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

- "How do I write a rule where Rules X and Y trigger in the last B minutes for the same field Z?"

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

- "How do I write a rule where Rule X triggers followed by Rule Y within B minutes for the same field Z?"

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
