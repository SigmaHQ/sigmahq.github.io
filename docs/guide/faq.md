---
title: "Frequently Asked Question"
subtitle: "Guide"
---

<!--suppress ES6UnusedImports -->
<script setup>
import {withBase} from "vitepress";  
import RulesBox from "/.vitepress/theme/components/Boxes/RulesBox.vue";
import LogsourceBox from "/.vitepress/theme/components/Boxes/LogsourceBox.vue";
import BackendBox from "/.vitepress/theme/components/Boxes/BackendBox.vue";

</script>

# {{ $frontmatter.title }}

This is a simple Frequently Asked Question.

## Convertion

- I want a tools to automatically convert query in language X to a sigma rule

Sorry, there are no easy way.  
It is possible to generate rules from a query using AI tools or toolsets, but the result is basic.  
It is often necessary to rework or even correct the rule obtained.

## Detection

- We use sysmon so why use `category: process_creation` and not `service: sysmon` ?

Sigma's aim is to provide agnostic rules.  
For `process_creation` can be use on Windows with internal Security EventID 4688 or Sysmon EventID 1 even with EDR.

- We use ECS so why not write the rule with ?

Sigma is open, you can use the ECS taxonomy for your internal rules.  
Just keep in mind, the day you change your detection technology, you'll have to rewrite all your rules.

## Correlation

- How write a Rule X triggers at least Y times in B minutes for the same field Z and with different values for field A ?

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

- How write Rule X triggers at least Y times in B minute for the same field Z ?

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

- How write Rules X,Y triggers in the last B minute for the same field Z ?

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

- How write Rules X then Y triggers in the last B minute for the same field Z ?

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
