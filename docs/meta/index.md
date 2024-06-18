---
title: 'Meta Rules'
---

<script setup>
import { withBase } from 'vitepress';
import Box from "/.vitepress/theme/components/Boxes/Box.vue";
import RulesBox from "/.vitepress/theme/components/Boxes/RulesBox.vue";
import { ChartBarIcon, FunnelIcon } from "@heroicons/vue/20/solid";

</script>

# Sigma {{ $frontmatter.title }}

Sigma Meta rules are an **extension** of the Sigma detection format. They allow for the definition of more advanced
detection techniques, such as [**correlations**](/docs/meta/correlations) and [**filters**](/docs/meta/filters).

<div class="grid md:grid-cols-2 gap-4">
    <a :href="withBase('/docs/meta/correlations')">
        <Box>
            <template #icon>
                <ChartBarIcon />
            </template>
            <template #heading>Correlations</template>
            <template #text>Learn how to write Sigma rules that correlate multiple events with more advanced detection techniques.</template>
        </Box>
    </a>
    <a :href="withBase('/docs/meta/filters')">
        <Box>
            <template #icon>
                <FunnelIcon />
            </template>
            <template #heading>Filters</template>
            <template #text>Learn how you can filter & exclude common false-positive detections from your logs.</template>
        </Box>
    </a>
</div>

They don't introduce any breaking changes to the existing Sigma format – meaning all your existing Sigma rules will
continue to work.

## Defining Meta Rules

Meta rules are defined in the same way as Sigma rules, but with a few special reserved words used in place
of `detection`.

```yaml
title: Sigma Rule Title
detection: // [!code --]
    selection:
        EventID: 4625
    condition: selection
```

[Sigma Correlations](/docs/meta/correlations) are designated by the special `correlation` keyword.

```yaml 
status: test
correlation: // [!code ++] // [!code focus:10]
    type: event_count
    rules:
        - failed_logon
    group-by:
        - TargetUserName
        - TargetDomainName
    timespan: 5m
    condition:
        gte: 10
level: medium
```

And [Sigma Filters](/docs/meta/filters) are designated by the special `filter` keyword.

```yaml
status: test
filter: // [!code ++] // [!code focus:8]
    rules:
        - 6f3e2987-db24-4c78-a860-b4f4095a7095
        - df0841c0-9846-4e9f-ad8a-7df91571771b
    selection:
        # Filter out Domain Controllers
        ComputerName|startswith: 'DC-'
    condition: not selection
level: low
```

## Referencing in Meta Rules

Both Sigma Correlations and Sigma Filters require you to reference an existing regular Sigma Rule. This is done by using
the `rules` keyword underneath the `correlation` or `filter` section.

This pattern allows you to reference an existing rule either by using it's `name` or `id`.

```yaml
filter:
    rules:
        - failed_logon # Referencing by name
        - df0841c0-9846-4e9f-ad8a-7df91571771b # Referencing by ID
```

::: warning Global References

When converting Sigma rules, it's important to remember that Sigma Correlations and Sigma Filters can reference any Sigma rule – not just those within the same file.

:::



## Learning More

To learn more about how to write Sigma Correlations and Sigma Filters, check out the dedicated pages for each below.


<div class="grid md:grid-cols-2 gap-4">
    <a :href="withBase('/docs/meta/correlations')">
        <Box>
            <template #icon>
                <ChartBarIcon />
            </template>
            <template #heading>Correlations</template>
            <template #text>Learn how to write Sigma rules that correlate multiple events with more advanced detection techniques.</template>
        </Box>
    </a>
    <a :href="withBase('/docs/meta/filters')">
        <Box>
            <template #icon>
                <FunnelIcon />
            </template>
            <template #heading>Filters</template>
            <template #text>Learn how you can filter & exclude common false-positive detections from your logs.</template>
        </Box>
    </a>
</div>
