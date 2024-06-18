---
title: "Correlations"
---

<script setup>
import { withBase } from 'vitepress'
</script>

# Sigma {{ $frontmatter.title }}

Sigma Correlations bring a brand-new standardised way to compose more sophisticated and targeted detections that analyze the relationships between events.

Correlations build on-top of the existing Sigma format, providing detection engineers with a very familiar experience, and finally bring first-party support for more complex relationship-based detection techniques.

::: danger SIEM / Backend support for Sigma Correlations

<div class="flex flex-col md:flex-row md:items-center gap-4 py-2">
  <p class="md:flex-grow md:pr-14">
    This feature is still fairly new and is currently only supported in <a href="https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutthesearchlanguage">Splunk's SPL</a> and <a href="https://www.elastic.co/blog/esql-elasticsearch-piped-query-language">Elasticsearch's ES|QL</a> query languages.
  </p>
  <div class="flex justify-start md:justify-end gap-4">
    <img :src="withBase('/images/backend_logos/splunk.png')" class="w-10 h-10" alt="Splunk">
    <img :src="withBase('/images/backend_logos/elastic.png')" class="w-10 h-10" alt="Elastic">
  </div>
</div>

:::

## Basic Structure

As mentioned on the [Meta Rules page](/docs/meta/), Sigma Correlations are defined by the `correlation` section in the Sigma rule instead of using the normal `detection` section.

::: tip Introduction of Meta Rules

If you're unfamiliar with new Sigma Meta Rules, it's recommended to read the [Meta Rules](/docs/meta/) page first.

:::

The `correlation` section has the following structure:

- `type`: The type of correlation to be used ([see types below](#types-of-correlations)).
- `rules`: A list of Sigma rules that are used for the correlation (either by name or ID).
- `group-by`: _(Optional)_ A list of fields to group the events by.
- `timespan`: The time frame in which the events are aggregated.
- `condition`: The condition that has to be met for the correlation to match.

Below is an example of a correlation rule that detects multiple failed logons for a single user within a 5-minute time frame.

```yaml
title: Multiple failed logons for a single user (possible brute force attack)
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

Whilst [Sigma Filters](/docs/meta/filters) meta rules won't require you to supply the referenced Sigma rule, <u>**Sigma Correlations will**</u> enforce that the referenced Sigma rule is present either in the same Sigma file, or supplied as a separate Sigma rule file when converting.

```text
Error: Error while conversion: Rule 'failed_logon' not found in rule collection
```

It's recommended to keep the referenced Sigma rule in the same file as the correlation rule to ensure that the correlation rule can be easily shared and understood by others.

:::

There are a few things to note when working with Sigma Correlations:

- Correlation Rules omits the `logsource` section, as they rely on referencing other Sigma rules to correlate events.
- Correlation rules will also inhibit the original "base" rule in the output query, as the correlation rule is the one that will be used to generate the query.

## Types of Correlations

Sigma currently supports four correlation types:

### `event_count`

The event count correlation simply counts the events in the aggregation bucket. This correlation type is usually chosen if it is just relevant if an event happens often or rarely in a given time frame. Some examples are:

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
source="WinEventLog:Security" EventCode IN (4625, 4771, 4772, 4776, 529, 530, 531, 532, 533, 534, 535, 539)
| bin _time span=5m
| stats count as event_count by _time TargetUserName TargetDomainName
| search event_count >= 10
```

In this example, events are aggregated in 5-minute slots and grouped by `TargetUserName` and `TargetDomainName`. It matches if more than 10 events with the same field values appear within the given timeframe, indicating a possible brute force attack on a specific user that should be investigated.

### `value_count`

Counts distinct values of a given field, useful for detecting a high or low number of unique entities

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
level: informational
falsepositives:
  - Administrative activity
  - Directory assessment tools
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
level: high
falsepositives:
  - Administrative activity
  - Directory assessment tools
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

A temporal event correlation determines if multiple different event types occur in temporal proximity. Examples:

- A brute force or password spraying attack where failed logon events appear together with successful logons from the same source could mean that the attack was successful and should be handled with increased priority.
- Vulnerability exploitation by detecting a connection to a vulnerable API endpoint together with a process creation:

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

### `ordered_temporal`

The ordered temporal correlation is similar to the former, but adds the order of the events as another condition. Generally, the usage of this correlation type should be considered very carefully because of various reasons:

- Often, the appearance of certain events in a specific time frame is already sufficient for the detection. E.g. the famous example of multiple failed logons followed by a successful one delivers mostly the same results if the failed and successful logon just appear within the same time frame.
- Compared to the temporal correlation the queries required to check the order are usually more complex and less efficient.
- Some backends don’t implement support for ordered temporal correlation or it’s even not possible to implement this within a query language.
- Especially when events appear very near to each other and events from different log sources are correlated, different time resolutions and clock skews can cause that the events appear in a different order as they occurred.

Altogether, this correlation type should only be used if really required.

Field aliases allow correlating fields with different names across log sources.

## Field Aliases

Sometimes it is required to correlate fields that have different names in their respective log sources. This can even happen in cases where field names are normalized. One example of such a situation is when the correlation rule must aggregate by source IP with the destination IP in another event type. This can be achieved with field aliases that form another attribute within the correlation attribute.

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

The `aliases` attribute defines a virtual field `ip` that is mapped from the field `src_ip` in the events matched by rule `rule_with_src_ip` and from `dest_ip` in the vents matched by the rule `rule_with_dest_ip`. The defined field `ip` is then used in the `group-by` field list as aggregation field name.
