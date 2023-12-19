---
title: 'Conditions'
---

# Sigma {{ $frontmatter.title }}

To enable Sigma to represent more complex boolean operations found in Log Query Languages (such as `NOT`, `AND`, & `OR` operations), Sigma rules are equipped with a `condition` field – as part of the `detection` section. This enables Sigma detections to logically be organised into different sections, as well as perform functions like filtering for known false-positives.

## Basic Conditions

### not

The `not` expression allows the completion of an inverse search.

In the example below, we're searching for all events where the `id.orig_h` (Connecting IP) IP address does not come from an internal network.

```yaml
detection:
    selection:
        id.orig_h|cidr:
            - '10.0.0.0/8'
            - '172.16.0.0/12'
            - '192.168.0.0/24'
    condition: not selection // [!code ++]
    # NOT (id.orig_h == "10.*" OR ... OR id.orig_h == "192.168.*") 
```

### and

The `and` expression combines two selections into one by joining them with an **AND** statement.

```yaml
detection:
    selection_1:
        EventID: 4663
    selection_2:
        ObjectName: '\Device\CdRom0\setup.exe'
    condition: selection_1 and selection_2 // [!code ++]
```

::: tip Filters

You can effectively use the `and` and `not` selection conditions to filter our unwanted or known false-positives in your Sigma rule.

```yaml
detection:
    selection:
        Image|endswith: '/bin/bash'
    filter:
        DestinationIp:
            - '127.0.0.1'
            - '0.0.0.0'
    condition: selection and not filter // [!code ++]
```

:::

### or

The `or` expression combines two selections into an "either" by joining them with an **OR** statement.

```yaml
detection:
    selection1:
        eventSource: sts.amazonaws.com
        eventName: AssumeRoleWithSAML
    selection2:
        eventSource: iam.amazonaws.com
        eventName: UpdateSAMLProvider
    condition: selection1 or selection2 // [!code ++]
```

### `brackets`

Where more complex operations need to take place, the brackets operator allows for the grouping of different operations, and will translate to use the brackets inside your detection environment.

Brackets also help remove ambiguity around order of operations between the `and`, `or` and `not` conditions.

```yaml
detection:
    selection:
        Image: 'werfault.exe'
    filter1:
        ParentImage: 'svchost.exe'
    filter2:
        DestinationIp|cidr:
            - '10.0.0.0/8'
            - '172.16.0.0/12'
            - '192.168.0.0/24'
    filter3:
        DestinationHostname|contains:
            - '*.windowsupdate.com'
            - '*.microsoft.com'
    condition: selection and not ( filter1 or filter2 or filter3 ) // [!code ++]
```

## Advanced Conditions

### 1 of (search pattern)

The `1 of (search pattern)` statement combines all of the above conditions together in an `or` statement. The `(search pattern)` can be replaced with a regex statement that describes the name of the selection group.

```yaml
title: DEWMODE Webshell Access
description: Detects access to DEWMODE webshell as described in FIREEYE report
logsource:
    category: webserver
detection:
    selection1:
        c-uri|contains|all:
            - '?dwn='
            - '&fn='
            - '.html?'
    selection2:
        c-uri|contains|all:
            - '&dwn='
            - '?fn='
            - '.html?'
    condition: 1 of selection*
```

### all of (search pattern)

The `all of (search pattern)` statement combines all of the above conditions together in an `and` statement. The `(search pattern)` can be replaced with a regex statement that describes the name of the selection group.

```yaml
detection:
    selection_base:
        eventService: admin.googleapis.com
        eventName:
            - ENFORCE_STRONG_AUTHENTICATION
            - ALLOW_STRONG_AUTHENTICATION
    selection_eventValue:
        new_value: 'false'
    condition: all of selection* // [!code ++]
```

### 1 of them

The `1 of them` statement combines all of the above conditions together in an `or` statement.

::: danger WARNING
It's advised not to use `1 of them` or `all of them` as it's not generally accepted when sharing rules with the `SigmaHQ/sigma` repository & community.
:::

```yaml
detection:
    selection_file_creation:
        EventID: 11
        TargetFilename|contains:
            - '.dmp'  # dump process memory
            - 'Desktop\how'  # Ransomware
            - 'Desktop\decrypt'  # Ransomware
    selection_registry_modifications:
        EventID:
            - 12
            - 13
        TargetObject|contains:
            - 'UserInitMprLogonScript'  # persistence
    selection_registry_run:
        EventID:
            - 12
            - 13
        TargetObject|contains:
            - '\Microsoft\Windows\CurrentVersion\Run\'  # persistence
    condition: 1 of them // [!code ++]
    #  which means selection_file_creation or 
    #              selection_registry_modifications or 
    #              selection_registry_run
```

### all of them

The `all of them` statement combines all of the above conditions together in an `and` statement.

::: danger WARNING
It's advised not to use `1 of them` or `all of them` as it's not generally accepted when sharing rules with the `SigmaHQ/sigma` repository abd community.
:::

```yaml
detection:
    selection_file_creation:
        EventID: 11
        TargetFilename|contains:
            - '.dmp'  # dump process memory
            - 'Desktop\how'  # Ransomware
            - 'Desktop\decrypt'  # Ransomware
    selection_registry_modifications:
        EventID:
            - 12
            - 13
        TargetObject|contains:
            - 'UserInitMprLogonScript'  # persistence
    selection_registry_run:
        EventID:
            - 12
            - 13
        TargetObject|contains:
            - '\Microsoft\Windows\CurrentVersion\Run\'  # persistence
    condition: all of them // [!code ++]
    #  which means selection_file_creation and 
    #              selection_registry_modifications and 
    #              selection_registry_run
```
