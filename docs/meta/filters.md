---
title: 'Filters'
---

# Sigma {{ $frontmatter.title }}

::: tip Filters are in `ALPHA`
In 2024, Sigma Introduced a new feature called Filters. This feature is still in `ALPHA`. However, filters should work in most backends out of the box, without backend-specific support required.
:::

When deploying Sigma rules out to your organization, you may find that some Sigma rules are noisier than others, or that to apply a Sigma rule to your environment you need to update the Sigma rule to have it only apply to a certain subset of `hosts` or `user` accounts.

Sigma Filters are a new way to build lists of these "exclusions" without having to modify the Sigma rule itself – meaning keeping each Sigma rule can now remain in its original state. This makes updating from Sigma's build-in [rule-packs](https://github.com/SigmaHQ/sigma/releases) even easier.

## Overview

Sigma Filters resemble Sigma rules in their structure, but use the `filter` keyword in place of `detection`.

```yaml
title: Filter Out Domain Controllers
description: Filter out events from Domain Controllers
logsource:
    product: windows
filter:
  rules:
    - 6f3e2987-db24-4c78-a860-b4f4095a7095 # Data Compressed - rar.exe
    - df0841c0-9846-4e9f-ad8a-7df91571771b # Login on jump host
  selection:
      ComputerName|startswith: 'DC-'
  condition: not selection
```

This makes writing Sigma Filters nearly identical to writing Sigma, but allow you to split out your exclusions into separate files. This not only makes your Sigma Rules arguably more maintainable, but also allow you to apply the same filter to multiple Sigma rules.

Filters are used to define a set of conditions that can be applied to Sigma rules to exclude or include specific events based on the conditions defined in the filter.



## Usage

When applying Filters in your "detection-as-code" strategy, filters can be applied recursively when converting your Sigma rules for use in your SIEM.


::: code-group

```yaml [./filters/win_filter_admins.yml]
title: Filter Administrator account
description: The valid administrator account start with adm_
logsource:
    category: process_creation
    product: windows
filter:
  rules:
    - 6f3e2987-db24-4c78-a860-b4f4095a7095 # Data Compressed - rar.exe
    - df0841c0-9846-4e9f-ad8a-7df91571771b # Login on jump host
  selection:
      User|startswith: 'adm_'
  condition: selection
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
            - 'create'
            - 'binPath'
    condition: selection
falsepositives:
    - Legitimate administrator or user creates a service for legitimate reasons.
    - Software installation
level: low
```
:::

## Applying Filters

To apply a filter when converting a Sigma rule, use the `--filter` option in Sigma CLI, followed by the path to the filter folder or file. You can apply multiple filters by specifying a directory containing multiple filter files.

Here's an example of running the Sigma rule with the filter:

```bash
sigma convert -t splunk --pipeline splunk_windows \
  --filter ./filters/win_filter_admins.yml \
  ./rules/windows/process_creation/proc_creation_win_sc_create_service.yml
```
The resulting Splunk query will include the filter condition:

```splunk
Image="*\\sc.exe" CommandLine="*create*" CommandLine="*binPath*" \
User="adm_*"
```

## Best Practices

### Sharing Sigma Filters

Whist Sigma Filters are a fantastic way to share exclusions across multiple Sigma rules, it's recommended to use Sigma Filters as a way to "tune" your alerts to your own organisation, and to update the Sigma rules themselves to include any filters you believe would benefit the community.





- When naming / using Filters, use the term "filter in" or "filter out" to easily identify the purpose of the filter. For example, "filter_out_domain_controllers.yml" or "filter_in_administrators.yml
- Keep filters in a separate directory from your Sigma rules for better organization and maintainability.
- Use descriptive names for your filter files to easily identify their purpose.
- ..