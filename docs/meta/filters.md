---
title: "Filters"
---

# Sigma {{ $frontmatter.title }}

When deploying Sigma rules out to your organization, you may find that some Sigma rules are noisier than others, or that to apply a Sigma rule to your environment you need to update the Sigma rule to have it only apply to a certain subset of `hosts` or `user` accounts.

Sigma Filters are a new way to build lists of these "exclusions" without having to modify the Sigma rule itself – meaning keeping each Sigma rule can now remain in its original state. This makes updating from Sigma's build-in [rule-packs](https://github.com/SigmaHQ/sigma/releases) even easier.

::: tip Filters are in `ALPHA`
In 2024, Sigma Introduced a new feature called Filters. This feature is still in `ALPHA`. However, filters should work in most backends out of the box, without backend-specific support required.

If you find any issues with Filters, please [open an issue here](https://github.com/SigmaHQ/sigma-specification/issues/new?assignees=&labels=bug&template=bug_report.md&title=).
:::

## Overview

Sigma Filters resemble Sigma rules in their structure, but use the `filter` keyword in place of `detection`.

```yaml
title: Filter Out Domain Controllers
description: Filter out events from Domain Controllers
logsource:
    product: windows
filter: // [!code ++] // [!code focus:7]
  rules:
    - 6f3e2987-db24-4c78-a860-b4f4095a7095 # Data Compressed - rar.exe
    - df0841c0-9846-4e9f-ad8a-7df91571771b # Login on jump host
  selection:
    ComputerName|startswith: "DC-"
  condition: not selection
```

Writing Sigma Filters is nearly identical to writing Sigma, but allow you to split out your exclusions into separate files – as well as target multiple rules using the same filter.

Filters are used to define a set of conditions that can be applied to Sigma rules to exclude or include specific events based on the conditions defined in the filter.

## Usage

When applying Filters in your "detection-as-code" strategy, filters can be applied recursively when converting your Sigma rules for use in your SIEM.

::: code-group

```yaml [./filters/win_filter_admins.yml]
title: Filter Out Administrator accounts
description: Filters out administrator accounts that start with adm_
logsource:
  category: process_creation
  product: windows
filter:
  rules:
    - 6f3e2987-db24-4c78-a860-b4f4095a7095 # Data Compressed - rar.exe
    - df0841c0-9846-4e9f-ad8a-7df91571771b # Login on jump host
  selection:
    User|startswith: "adm_"
  condition: not selection
```

```yaml [./rules/windows/process_creation/proc_creation_win_sc_create_service.yml]
title: New Service Creation Using Sc.EXE
id: 85ff530b-261d-48c6-a441-facaa2e81e48
related:
  - id: c02e96b7-c63a-4c47-bd83-4a9f74afcfb2 # Using PowerShell
    type: similar
status: test
description: Detects the creation of a new service using the "sc.exe" utility.
references:
  - https://github.com/redcanaryco/atomic-red-team/blob/f339e7da7d05f6057fdfcdd3742bfcf365fee2a9/atomics/T1543.003/T1543.003.md
author: Timur Zinniatullin, Daniil Yugoslavskiy, oscd.community
date: 2023/02/20
tags:
  - attack.persistence
  - attack.privilege_escalation
  - attack.t1543.003
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    Image|endswith: '\sc.exe'
    CommandLine|contains|all:
      - "create"
      - "binPath"
  condition: selection
falsepositives:
  - Legitimate administrator or user creates a service for legitimate reasons.
  - Software installation
level: low
```

:::

To apply a filter when converting a Sigma rule, use the `--filter` option in Sigma CLI, followed by the path to the filter folder or file. You can apply multiple filters by specifying a directory containing multiple filter files.

Here's an example of running the Sigma rule with the filter:

```bash
sigma convert -t splunk --pipeline splunk_windows \
  --filter ./filters/win_filter_admins.yml \
  ./rules/windows/process_creation/proc_creation_win_sc_create_service.yml
```

The resulting Splunk query will include the filter condition:

```splunk
Image="*\\sc.exe" \
  CommandLine="*create*" \
  CommandLine="*binPath*" \
  NOT User="adm_*" // [!code ++]
```

::: info Filters and Field Mapping

Every field that is used in Filters also gets mapped according to any supplied pipelines.

:::

## Design

If you've been using Sigma for detections, it's likely that you've come across this pattern to filter out known false-positives at the detection stage.

```yaml
detection:
  selection:
    Image|endswith: '\rundll32.exe'
  registry:
    TargetObject|contains: '\Control Panel\Desktop\SCRNSAVE.EXE'
    Details|endswith: ".scr"
  filter:
    Details|contains:
      - 'C:\Windows\System32\'
      - 'C:\Windows\SysWOW64\'
  condition: selection and registry and not filter // [!code focus]
falsepositives:
  - Legitimate use of screen saver
```

During the conversion process, Sigma Filters complete a similar process, which will append to each referenced Sigma rule's `condition` field, allowing you to exclude or include specific events based on the conditions defined in the filter.

```yaml

detection:
    ...
    condition: selection and (filter)
#              |             |
#              |_Sigma Rule  |
#                            |_Sigma Filter

```

This allows Sigma Filters to either be used to exclude specific events – such as to tune your Sigma rule for false-positives or known-safe alerts, or to include **_only_** specific events.

The advantage of using Sigma Filters is that you can now build a set of exclusions that can be applied to multiple Sigma rules, without having to modify the Sigma rule itself – making it easier to update from Sigma's build-in rule-packs.

**Example of Exclusion:**

::: code-group

```yaml[./filters/exclude_something.yml]
filter:
    filter_out:
        field: value
    # This will exclude events where field equals value
    condition: not filter_out
```

:::

**Example of Inclusion:**

::: code-group

```yaml[./filters/include_something.yml]
filter:
    filter_only:
        field: value
    # This will scope the detection to only include events where field equals value
    condition: filter_only
```

:::

## Filters and Logsources

Filters can be applied to any Sigma rule, but only where the `logsource` field matches the `logsource` field in the filter.
