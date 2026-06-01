---
title: "Correlations"
---

<script setup>
import { withBase } from 'vitepress'
</script>

# Sigma {{ $frontmatter.title }}

Sigma Correlations bring a brand-new standardised way to compose more sophisticated and targeted detections that analyze the relationships between events.

Correlations build on-top of the existing Sigma format, providing detection engineers with a very familiar experience, and finally provides first-party support for more complex relationship-based detection techniques.

::: warning SIEM / Backend support for Sigma Correlations

<div class="flex flex-col md:flex-row md:items-center gap-4 py-2">
  <p class="md:flex-grow md:pr-14">
    This feature is still fairly new and is currently only supported in <a href="https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutthesearchlanguage">Splunk's SPL</a>,  <a href="https://www.elastic.co/blog/esql-elasticsearch-piped-query-language">Elasticsearch's ES|QL</a>, and <a href="https://grafana.com/docs/loki/latest/query/metric_queries/#log-range-aggregations">Grafana's Loki</a> query languages.
  </p>
  <div class="flex justify-start md:justify-end gap-4">
    <img :src="withBase('/images/backend_logos/splunk.png')" class="w-10 h-10" alt="Splunk">
    <img :src="withBase('/images/backend_logos/elastic.png')" class="w-10 h-10" alt="Elastic">
    <img :src="withBase('/images/backend_logos/loki.png')" class="w-10 h-10" alt="Loki">
  </div>
</div>

:::

## Basic Structure

Sigma Correlations are defined inside of the new `correlation` section, instead of the typically used `detection` section.

::: tip Introduction of Meta Rules

If you're unfamiliar with new Sigma Meta Rules, it's recommended to read the [Meta Rules](/docs/meta/) page first.

:::

The `correlation` section has the following structure:

- `type`: The type of correlation to be used ([see types below](#types-of-correlations)).
- `rules`: A list of Sigma rules that are used for the correlation, referenced by their `name` or `id` (UUID).
- `timespan`: The time frame in which the events are aggregated (e.g. `5m`, `1h`, `7d`). See [Timespan](#timespan) for the supported units.
- `condition`: The condition that has to be met for the correlation to match. Required for all types except [`temporal`](#temporal) and [`temporal_ordered`](#temporal_ordered).
- `group-by`: _(Optional)_ A list of fields to group the events by.
- `aliases`: _(Optional)_ Field aliases used to correlate fields with different names across log sources ([see Field Aliases](#field-aliases)).
- `generate`: _(Optional)_ Whether to also emit the queries for the referenced "base" rules ([see Retaining the Base Conversion](#retaining-the-base-conversion)). Defaults to `false`.

::: warning Use `group-by`, not `group_by`
The key is spelled with a hyphen (`group-by`). An underscore (`group_by`) is silently ignored, which is a common source of confusion.
:::

Below is an example of a correlation rule that detects multiple failed logons for a single user within a 5-minute time frame.

```yaml
title: Multiple failed logons for a single user (possible brute force attack)
status: test
correlation: # [!code focus:10]
  type: event_count
  rules:
    - failed_logon
  group-by:
    - TargetUserName
    - TargetDomainName
  timespan: 5m
  condition:
    gte: 10
tags:
  - brute_force
  - attack.t1110
```

Because this correlation rule references another Sigma rule called `failed_logon`, a rule with the field `name: failed_logon` needs to be supplied alongside this rule when we're converting the correlation rule for our SIEM.

Therefore, it's common to place this "base" Sigma rule in the same file as the correlation rule, using the `---` separator to separate the two rules.

::: code-group

```yaml:line-numbers [rules/windows_failed_login_single_user.yml]
title: Windows Failed Logon Event
name: failed_logon # Rule Reference // [!code ++]
description: Detects failed logon events on Windows systems.
logsource:
    product: windows
    service: security
detection:
    selection:
        EventID: 4625
    condition: selection
---
title: Multiple failed logons for a single user (possible brute force attack)
correlation:
    type: event_count
    rules:
        - failed_logon # Referenced here  // [!code highlight]
    group-by:
        - TargetUserName
        - TargetDomainName
    timespan: 5m
    condition:
        gte: 10
```

:::

Converting the above "Multiple failed logons for a single user" Sigma rule to Splunk SPL would yield the following query:

```bash
sigma convert -t splunk -p splunk_windows \
    rules/windows_failed_login_single_user.yml
```

```splunk
source="WinEventLog:Security" EventCode=4625
| bin _time span=5m
| stats count as event_count by _time TargetUserName TargetDomainName
| search event_count >= 10
```

::: warning Required Reference

<u>**Sigma Correlations will**</u> enforce that the referenced Sigma rule is present either in the same Sigma file, or supplied as a separate Sigma rule file when converting.

```text
Error: Error while conversion: Rule 'failed_logon' not found in rule collection
```

If the "base" rule being used is only being used to support the correlation rule, it's recommended to keep the referenced Sigma rule in the same file as the correlation rule, to ensure that the correlation rule can be easily shared and understood by others.

:::

There are a few things to note when working with Sigma Correlations:

- Correlation rules omit the `logsource` section, as they rely on referencing other Sigma rules to correlate events.
- By default, correlation rules suppress the output of the referenced "base" rule, as the correlation rule is the one used to generate the query. This can be changed with `generate: true` ([see below](#retaining-the-base-conversion)).

### Retaining the Base Conversion

By default, the correlation rule omits the original "base" rule in the output query.

If you want to retain the original "base" rule in the output query, you should add `generate: true` to the correlation section within your correlation rule. This will ensure that each of the referenced "base" rules will be included in the output query.

```yaml
title: Multiple failed logons for a single user (possible brute force attack)
correlation:
  type: event_count
  rules:
    - failed_logon
  group-by:
    - TargetUserName
    - TargetDomainName
  timespan: 5m
  condition:
    gte: 10
  generate: true # Retain the base rule in the output query // [!code ++]
```

## Timespan

The `timespan` defines the window over which events are aggregated. It is written as an integer count followed by a single-character unit, for example `30s`, `5m`, `1h` or `7d`.

The following units are supported:

| Unit | Meaning            |
| ---- | ------------------ |
| `s`  | seconds            |
| `m`  | minutes            |
| `h`  | hours              |
| `d`  | days               |
| `w`  | weeks              |
| `M`  | months (uppercase) |
| `y`  | years              |

::: warning `m` vs `M`
The unit is case-sensitive: lowercase `m` means **minutes**, while uppercase `M` means **months**. An invalid unit (or a missing count) raises `Timespan '<value>' is invalid.`
:::

## Condition

The `condition` describes the threshold that must be met for the correlation to fire. It contains exactly one comparison operator mapped to a count:

```yaml
condition:
  gte: 10
```

The supported operators are:

| Operator | Meaning               |
| -------- | --------------------- |
| `gt`     | greater than          |
| `gte`    | greater than or equal |
| `lt`     | less than             |
| `lte`    | less than or equal    |
| `eq`     | equal                 |
| `neq`    | not equal             |

In addition to the operator, the `condition` may contain:

- `field`: The field to aggregate on. Required for `value_count`, `value_sum`, `value_avg`, `value_median` and `value_percentile`.
- `percentile`: The percentile to compute, used together with `field` for the `value_percentile` type.

Any other key inside `condition` is rejected with `Sigma correlation condition contains invalid items`.

## Types of Correlations

Sigma supports eight correlation types. The four most commonly used are described in detail below — `event_count`, `value_count`, `temporal`, and `temporal_ordered`.

The remaining four are aggregation variants that behave like `value_count`, but apply a different aggregation function to the field referenced by `condition.field`:

| Type               | Aggregation                                                                                                                  |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `value_sum`        | Sum of the values of the referenced field.                                                                                   |
| `value_avg`        | Average (mean) of the values of the referenced field.                                                                        |
| `value_median`     | Median of the values of the referenced field.                                                                                |
| `value_percentile` | Percentile of the values of the referenced field. Set the percentile with an additional `percentile` key inside `condition`. |

::: warning Backend support for aggregation types
The `value_sum`, `value_avg`, `value_median`, and `value_percentile` types are newer additions and are not yet implemented by every backend. Test your conversion before relying on them.
:::

### `event_count`

The event count correlation simply counts the events in the aggregation bucket. This correlation type is typically chosen when the frequency of an event within a given time frame is relevant. Some examples are:

- Brute force attacks where a logon failure count exceeds a given threshold.
- Denial of Service attacks where a connection count threshold is exceeded.
- Log source reliability issues, when the amount of events falls below a threshold.

```yaml
title: Windows Failed Logon Event
name: failed_logon
status: test
description: Detects failed logon events on Windows systems.
logsource:
  product: windows
  service: security
detection:
  selection:
    EventID: 4625
  filter:
    SubjectUserName|endswith: $
  condition: selection and not filter
---
title: Multiple failed logons for a single user (possible brute force attack)
status: test
correlation:
  type: event_count
  rules:
    - failed_logon
  group-by:
    - TargetUserName
    - TargetDomainName
  timespan: 5m
  condition:
    gte: 10
```

```splunk
source="WinEventLog:Security" EventCode=4625 NOT SubjectUserName="*$"
| bin _time span=5m
| stats count as event_count by _time TargetUserName TargetDomainName
| search event_count >= 10
```

In this example, events are aggregated in 5-minute slots and grouped by `TargetUserName` and `TargetDomainName`. It matches if more than 10 events with the same field values appear within the given timeframe, indicating a possible brute force attack on a specific user that should be investigated.

### `value_count`

The value_count correlation type counts distinct values of a given field. It is useful for detecting a high or low number of unique entities. For example:

Unlike `event_count`, the `value_count` type requires a `field` key inside the `condition`, naming the field whose distinct values are counted. Omitting it raises `Value count correlation rule without field reference`. The same requirement applies to the `value_sum`, `value_avg`, `value_median`, and `value_percentile` types.

```yaml
title: High-privilege group enumeration
name: privileged_group_enumeration
status: stable
logsource:
  product: windows
  service: security
detection:
  selection:
    EventID: 4799
    CallerProcessId: 0x0
    TargetUserName:
      - Administrators
      - Remote Desktop Users
      - Remote Management Users
      - Distributed COM Users
  condition: selection
---
title: Enumeration of multiple high-privilege groups by tools like BloodHound
status: stable
correlation:
  type: value_count
  rules:
    - privileged_group_enumeration
  group-by:
    - SubjectUserName
  timespan: 15m
  condition:
    gte: 4
    field: TargetUserName
```

```splunk
source="WinEventLog:Security" EventCode=4799 CallerProcessId=0 TargetUserName IN ("Administrators", "Remote Desktop Users", "Remote Management Users", "Distributed COM Users")
| bin _time span=15m
| stats dc(TargetUserName) as value_count by _time SubjectUserName
| search value_count >= 4
```

::: tip Detecting BloodHound Enumeration

Some tools like BloodHound can be detected by enumeration of certain high-privilege AD groups within a short time frame. This correlation rule shown above reliably detects BloodHound scans conducted with default options.

:::

### `temporal`

A temporal event correlation determines if multiple different event types occur close together in time. This type is useful for identifying related events that happen within a specified timeframe. Examples include:

- A brute force or password spraying attack where failed logon events appear together with successful logons from the same source could mean that the attack was successful and should be handled with increased priority.
- Vulnerability exploitation by detecting a connection to a vulnerable API endpoint together with a process creation:

For `temporal` correlations, the `condition` is optional. When omitted, it defaults to requiring that **all** of the referenced rules match within the timespan — i.e. `gte` with a count equal to the number of rules in the `rules` list. The example below references two rules, so it implicitly requires both to appear within `10s`.

```yaml
---
title: CVE-2023-22518 Exploit Chain
description: Access to endpoint vulnerable to CVE-2023-22518 with suspicious process creation.
status: experimental
correlation:
  type: temporal
  rules:
    - a902d249-9b9c-4dc4-8fd0-fbe528ef965c
    - 1ddaa9a4-eb0b-4398-a9fe-7b018f9e23db
  timespan: 10s
level: high
```

```splunk
| multisearch
  [ search "cs-method"="POST" "cs-uri-query" IN ("*/json/setup-restore-local.action*", "*/json/setup-restore-progress.action*", "*/json/setup-restore.action*", "*/server-info.action*", "*/setup/setupadministrator.action*") "sc-status" IN (200, 302, 405) | eval event_type="a902d249-9b9c-4dc4-8fd0-fbe528ef965c" ]
  [ search ParentImage IN ("*\\tomcat8.exe", "*\\tomcat9.exe", "*\\tomcat10.exe") ParentCommandLine="*confluence*" Image IN ("*\\cmd.exe", "*\\powershell.exe") OR OriginalFileName IN ("Cmd.Exe", "PowerShell.EXE") | eval event_type="1ddaa9a4-eb0b-4398-a9fe-7b018f9e23db" ]
| bin _time span=10s
| stats dc(event_type) as event_type_count by _time
| search event_type_count >= 2
```

### `temporal_ordered`

The temporal ordered correlation is similar to the former, but adds the order of the events as another condition. This correlation type should be used cautiously due to several factors:

- Often, the appearance of certain events in a specific time frame is already sufficient for the detection. E.g. the famous example of multiple failed logons followed by a successful one delivers mostly the same results if the failed and successful logon just appear within the same time frame.
- Compared to the temporal correlation the queries required to check the order are usually more complex and less efficient.
- Some backends don’t implement support for temporal ordered correlation or it’s even not possible to implement this within a query language.
- Especially when events appear very near to each other and events from different log sources are correlated, different time resolutions and clock skews can cause that the events appear in a different order as they occurred.

The events are expected to occur in the same order as the rules are listed in the `rules` section. Like `temporal`, the `condition` is optional and defaults to requiring all referenced rules to match within the timespan.

Altogether, this correlation type should only be used if really required.

## Field Aliases

Sometimes it is required to correlate fields that have different names in their respective log sources. This can even happen in cases where field names are normalized. One example of such a situation is when the correlation rule must aggregate by source IP with the destination IP in another event type.

This can be achieved using field aliases, which are defined as an additional attribute within the correlation section.

```yaml
correlation:
  type: temporal
  rules:
    - rule_with_src_ip
    - rule_with_dest_ip
  aliases:
    ip:
      rule_with_src_ip: src_ip
      rule_with_dest_ip: dest_ip
  group-by:
    - ip
  timespan: 5m
```

The `aliases` attribute defines a virtual field `ip` that is mapped from the field `src_ip` in the events matched by rule `rule_with_src_ip` and from `dest_ip` in the events matched by the rule `rule_with_dest_ip`. The defined field `ip` is then used in the `group-by` field list as aggregation field name.

## Chaining Correlations

A correlation rule can reference another correlation rule. Because correlation rules can carry their own `name` (or `id`), they can be listed in the `rules` section of a second correlation rule, allowing detections to be composed in stages.

```yaml
title: Failed logons followed by a successful logon
name: failed_then_successful_logon # [!code highlight]
correlation:
  type: temporal_ordered
  rules:
    - failed_logon
    - successful_logon
  group-by:
    - TargetUserName
  timespan: 1h
---
title: Repeated successful-after-failure logon bursts
correlation:
  type: event_count
  rules:
    - failed_then_successful_logon # references the correlation above // [!code highlight]
  group-by:
    - TargetUserName
  timespan: 24h
  condition:
    gte: 3
```

::: warning Backend support for chained correlations
Chaining is supported by the Sigma data model, but not every backend can convert nested correlations into a single query. Test your conversion before relying on this.
:::
