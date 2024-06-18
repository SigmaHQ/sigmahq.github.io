---
title: 'Correlations'
---

<script setup>
import { withBase } from 'vitepress'
</script>

# Sigma {{ $frontmatter.title }}

::: tip Correlations are in still in the early stages

<div class="flex items-center gap-4 py-2">
<p>
In 2024, Sigma introduced a new feature called Correlations. This feature is still fairly new and is currently only supported in <a href="https://docs.splunk.com/Documentation/Splunk/latest/Search/Aboutthesearchlanguage">Splunk's SPL</a> and <a href="https://www.elastic.co/blog/esql-elasticsearch-piped-query-language">Elasticsearch's ES|QL</a> query languages.
</p>
<img :src="withBase('/images/backend_logos/splunk.png')" class="w-14 h-14" alt="Splunk">
<img :src="withBase('/images/backend_logos/elastic.png')" class="w-14 h-14" alt="Elastic">
</div>

:::

Sigma Correlations add the long-awaited capability to express detections correlating multiple events in an open and vendor-agnostic way to Sigma. 

Correlation rules allow you to write more sophisticated and targeted detections by combining and analyzing relationships between events.

## Correlation Basics


::: warning Required Reference

Whilst [Sigma Filters](/docs/meta/filters) meta rules won't require you to supply the referenced Sigma rule, Sigma Correlations **will** enforce that the referenced Sigma rule is present either in the same Sigma file, or supplied as a separate Sigma rule file when converting.

It's recommended to keep the referenced Sigma rule in the same file as the correlation rule to ensure that the correlation rule can be easily shared and understood by others.

:::

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

Some tools like BloodHound can be detected by enumeration of certain high-privilege AD groups within a short time frame. This correlation rule shown below reliably detects BloodHound scans conducted with default options.

:::


### `temporal`

A temporal event correlation determines if multiple different event types occur in temporal proximity. Examples:

- A brute force or password spraying attack where failed logon events appear together with successful logons from the same source could mean that the attack was successful and should be handled with increased priority.
- Vulnerability exploitation by detecting a connection to a vulnerable API endpoint together with a process creation:

```yaml
...
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

## Considerations

Correlation rules enable powerful detections but should be used judiciously. Consider:

- Are single events already sufficient for detection?
- Could events be easily missed, allowing an attacker to evade detection?
- Does the correlation reduce false positives or increase false negatives compared to single event detections?

Used wisely, Sigma Correlations provide a flexible, open standard way to write sophisticated detections. As support grows, security teams can share and adapt correlation rules across different SIEM platforms, improving detection capabilities for the community.