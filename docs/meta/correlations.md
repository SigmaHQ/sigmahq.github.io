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

Sigma Correlations add the long-awaited capability to express detections correlating multiple events in an open and vendor-agnostic way to Sigma. Correlation rules allow detection engineers to write more sophisticated and targeted detections by combining and analyzing relationships between events.

## Correlation Basics

Event correlation searches first match events that belong together in some way, such as failed logon events. These events are aggregated into buckets defined by a time frame where events are considered related. Additionally, field values can form additional grouping criteria. For example, failed logons could be grouped by source IP, target username, or both.

A condition must be defined to determine which event buckets are relevant. For instance, a SOC may not be concerned about a single failed logon but would find ten failed logons for a single user interesting as it could indicate a brute force attack. Similarly, failed logons for a hundred different users from the same source address could signify a password spraying attack.

Sigma Correlation rules aim to express such detections generically, allowing conversion into target query languages that support the required features. While the Sigma specification recommends a sliding time window, it's not a hard requirement. Some query languages and data analysis platforms can only slice time into static chunks like full minutes, which is also a legitimate implementation.

## Correlation Rule Example

A correlation rule shares many fields with basic Sigma rules, such as title, id, status, and others. Instead of defining a single event with logsource and detection attributes, a correlation element defines the properties of the correlation.

Key aspects of a correlation rule:

- Refers to other Sigma rules by name or id in the rules attribute
- Defines a timespan in which the relationship between events occurs
- Uses the group-by attribute to specify additional aggregation fields
- The condition attribute, along with other correlation attributes, defines the matching criteria

## Types of Correlations

Sigma currently supports four correlation types:

### `event_count`

The event count correlation simply counts the events in the aggregation bucket. This correlation type is usually chosen if it is just relevant if an event happens often or rarely in a given time frame. Some examples are:

- Brute force attacks where a logon failure count exceeds a given threshold. 
- Denial of Service attacks where a connection count threshold is exceeded. 
- Log source reliability issues, when the amount of events falls below a threshold.

```yaml
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