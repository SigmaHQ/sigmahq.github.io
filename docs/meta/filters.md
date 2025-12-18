---
title: "Filters"
---

# Sigma {{ $frontmatter.title }}

When deploying Sigma rules out to your organization, you may find that some Sigma rules are noisier than others, or that a Sigma rule needs to be updated to only detect upon a given set of `host` computers, or `user` accounts.

**Sigma Filters** are a new way to build lists of these "exclusions" without having to modify the Sigma rule itself – meaning keeping each Sigma rule can now remain in its original state. This makes updating from Sigma's built-in [rule-packs](https://github.com/SigmaHQ/sigma/releases) even easier.

## Overview

Sigma Filters resemble Sigma rules in their structure, but use the `filter` keyword in place of `detection`.

Writing Sigma Filters is nearly identical to writing Sigma, but allow you to split out your exclusions into separate files – as well as target multiple rules using the same filter.

::: code-group

```yaml [./filters/win_filter_domain_controllers.yml]
title: Filter Out Domain Controllers
description: Filter out events from Domain Controllers
logsource:
  product: windows
filter: # [!code highlight]
  rules:
    - files_added_to_an_archive_using_rar_exe
    - login_on_jump_host
  selection:
    ComputerName|startswith: "DC-"
  condition: not selection
```

:::

Filters are used to define a set of conditions that can be applied to Sigma rules to exclude or include specific events based on the conditions defined in the filter.

## Referencing rules by `name` / `ID`

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
    - proc_creation_win_sc_create_service # [!code highlight]
  selection:
    User|startswith: "adm_"
  condition: not selection
```

```yaml [./rules/windows/process_creation/proc_creation_win_sc_create_service.yml]
title: New Service Creation Using Sc.EXE
name: proc_creation_win_sc_create_service # [!code highlight]
description: Detects the creation of a new service using the "sc.exe" utility.
author: Timur Zinniatullin, Daniil Yugoslavskiy, oscd.community
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
```

:::

In the example above, the `win_filter_admins.yml` filter is applied to the `proc_creation_win_sc_create_service.yml` Sigma rule. The filter will exclude any events where the `User` field starts with `adm_`. The filter references the Sigma rule in the `rules` list under `filter` section, using the `name` field within the Sigma rule.

To apply a filter when converting a Sigma rule, use the `--filter` option in Sigma CLI, followed by the path to the filter folder or file. You can apply multiple filters by specifying a directory containing multiple filter files.

Here's an example of running the Sigma rule with the filter:

```bash
sigma convert -t splunk --pipeline splunk_windows \
  --filter ./filters/win_filter_admins.yml \ # [!code highlight]
  ./rules/windows/process_creation/proc_creation_win_sc_create_service.yml
```

The resulting Splunk query will include the filter condition:

```splunk
Image="*\\sc.exe" \
  CommandLine="*create*" \
  CommandLine="*binPath*" \
  NOT User="adm_*" # [!code ++]
```

## Referencing all rules within a logsource

You can also create filters that apply to all rules matching a specific logsource using the `rules: any` configuration:

::: code-group

```yaml [./filters/win_filter_all_domain_controllers.yml]
title: Filter Out Domain Controller Events
description: Filters out events from all Domain Controllers across all Windows rules
logsource:
  product: windows
filter:
  rules: any # [!code highlight]
  selection:
    ComputerName|startswith: "DC-"
  condition: not selection
```

:::

This filter will be applied to **all** Sigma rules that have a logsource matching `product: windows`, effectively filtering out events from Domain Controllers across your entire rule set without having to specify each individual rule.

::: info Filters and Field Mapping

Every field that is used in Filters also gets mapped according to any supplied pipelines.

:::

Filters support referencing the initial rule using the `id` or `name` field.

## Design of Inclusion vs Exclusion

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
  condition: selection and registry and not filter # [!code focus]
falsepositives:
  - Legitimate use of screen saver
```

During the conversion process, Sigma Filters complete a similar process, which will append to each referenced Sigma rule's `condition` field, allowing you to exclude or include specific events based on the conditions defined in the filter.

```yaml

detection:
    ...
    condition: selection and (filter)
#              |             |
#              | Sigma Rule  |
#                            | Sigma Filter

```

This allows Sigma Filters to either be used to exclude specific events – such as to tune your Sigma rule for false-positives or known-safe alerts, or to include **_only_** specific events.

The advantage of using Sigma Filters is that you can now build a set of exclusions that can be applied to multiple Sigma rules, without having to modify the Sigma rule itself – making it easier to update from Sigma's built-in rule-packs.

**Examples of Exclusion:**

::: code-group

```yaml [./filters/exclusion.yml]
title: ...
logsource:
  product: example-product
filter:
  rules: any
  exclude_these_matches:
    field: value
  # This will exclude events where field equals value
  condition: not exclude_these_matches # [!code highlight]
```

**Example of Inclusion:**

::: code-group

```yaml [./filters/inclusion.yml]
title: ...
logsource:
  product: example-product
filter:
  rules: any
  include_these_matches:
    field: value
  # This will scope the detection to only include events where field equals value
  condition: include_these_matches # [!code highlight]
```

:::

## Filters Logsource Matching

Filters can be applied to any Sigma rule, but only where the `logsource` field is an exact match the `logsource` field in the filter.

::: info Logsource Matching Behaviour

Currently, you can specify a logsource of a lower specificity in the filter than in the Sigma rule, but this behaviour isn't guaranteed and may change in the coming releases.

This is to facilitate the use of filters across multiple Sigma rules of "similar" log sources – such as all Windows logs, or all logs from a specific product.

```yaml
# Filter
logsource:
  product: windows

# Sigma Rule
logsource:
  category: process_creation
  product: windows
```

The SigmaHQ team will be assessing this going forward to determine if this behaviour is beneficial or not.

:::
