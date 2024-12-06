---
title: "Rules"
---

<script setup lang="ts">
import {withBase} from "vitepress";
import LogsourceBox from "/.vitepress/theme/components/Boxes/LogsourceBox.vue";
</script>

# Sigma {{ $frontmatter.title }}

Sigma rules are `YAML` files that contain all the information required to detect odd, bad or malicious behaviour when inspecting log files – usually within the context of a [SIEM](https://en.wikipedia.org/wiki/Security_information_and_event_management?useskin=vector).

To make the most out of the Sigma rules, it is important to understand how Sigma rules are used in detection, what all the different fields mean, and how to start writing and sharing your own Sigma detection rules.

::: tip Are you new to Sigma?
If you're unfamiliar with what the Sigma Detection format is, or why it might be useful, visit the [About Sigma](/docs/guide/about.md) page to learn more about the project & available toolsets.
:::

## Starting Example

Below shows a full example of an in-use Sigma rule.
<br />This example detects an "Okta User Account Locked Out" event. [^source]

[^source]:
    Rule sourced from SigmaHQ/sigma repository 8 Dec
    2022: <https://github.com/SigmaHQ/sigma/blob/master/rules/cloud/okta/okta_user_account_locked_out.yml>

```yaml:line-numbers
# ./rules/cloud/okta/okta_user_account_locked_out.yml
title: Okta User Account Locked Out
id: 14701da0-4b0f-4ee6-9c95-2ffb4e73bb9a
status: test
description: Detects when a user account is locked out.
references:
    - https://developer.okta.com/docs/reference/api/system-log/
    - https://developer.okta.com/docs/reference/api/event-types/
author: Austin Songer @austinsonger
date: 2021-09-12
modified: 2022-10-09
tags:
    - attack.impact
logsource:
    product: okta
    service: okta
detection:
    selection:
        displaymessage: Max sign in attempts exceeded
    condition: selection
falsepositives:
    - Unknown
level: medium
```

### Components

To help understand what the above code snippet accomplishes, this Sigma rule will be separated into three main components:

- **[Detection](#detection)**<br />_What malicious behaviour the rule searching for._
- **[Logsource](#logsources)**<br />_What types of logs this detection should search over._
- **[Metadata](#metadata)**<br />_Other information about the detection._

## Detection

<Badge type="danger" text="Required" class="relative -top-2" />

The detection section is the most important component of any Sigma rule. It specifies exactly what the rule is looking for across relevant logs.

```yaml
    product: okta
    service: okta
detection: // [!code focus:4]
    selection:
        displaymessage: Max sign in attempts exceeded
    condition: selection
falsepositives:
    - Unknown
```

This specific detection above is searching for anywhere an Okta User's account has been locked out, due to the maximum number of sign-in attempts being reached.

### Principles

The Sigma detection format can be quite daunting and confusing for newcomers, as some Sigma rules can be complex in how they construct detections. It's important to understand the following guiding principles:

#### Selections

Each Sigma detection is categorised & split up into groups called "`selections`". Each "`selection`" contains the definition for the detection itself.

```yaml
detection:
    selection: // [!code focus:2]
        displaymessage: Max sign in attempts exceeded
    condition: selection
```

Sigma use "selection" groups to organise detections for readability & filtering, which becomes important when exploring [Conditions](/docs/basics/conditions).

#### And / Or

The other main consideration, is that Sigma completes **"AND"** and **"OR"** operations by using YAML Lists and Dictionaries.

- The `list` syntax to represent an **"OR"** operation, and

```yaml
detection:
  selection:
    field_name:
      - this # or
      - that
  condition: selection
```

- The `dictionary`/`object` syntax to represent an **"AND"** operation.

```yaml
detection:
  selection:
    field_name: this # and
    other_field_name: that
  condition: selection
```

#### Detection Methods

With both of those topics in mind, explore below on how Sigma composes detections with 3 main patterns.

- [by Keyword](#detection-keyword)
- [by Field Value](#detection-and)
- [by Multiple Field Values (List)](#detection-or)

### by Keyword {#detection-keyword}

One of the most basic and easy-to-understand ways to detect malicious behaviour using Sigma is by using keywords. **Keyword**-based searches look over a given logsource for any text matching any of the provided keywords.
This corresponds to searching for a string into the raw log.

Each item in the "`keywords`" list is effectively separated by a logical **"OR"** operator.

The below example Sigma rule uses a keyword-based search to detect when users might be covering their tracks – by purging that user's `.bash_history`.

```yaml
logsource:
    product: linux
detection:// [!code focus:8]
    keywords:
        - 'rm *bash_history'
        - 'echo "" > *bash_history'
        - 'truncate -s0 *bash_history'
        - 'history -c'
        - 'history -w'
    condition: keywords
falsepositives:
    - Unknown
```

This example tells Sigma to generate a SIEM query that searches for any of the following keywords:

- `rm *bash_history` <i class="opacity-50 pl-2">or</i>
- `echo "" > *bash_history` <i class="opacity-50 pl-2">or</i>
- `truncate -s0 *bash_history` <i class="opacity-50 pl-2">or</i>
- `history -c` <i class="opacity-50 pl-2">or</i>
- `history -w`

<br />

::: info Naming of `keywords`
The naming of the field "`keywords`" under the `detection` and `selection` fields in this example is arbitrary. However, you should use it as a standard when creating your own Sigma rules.  
:::

When we convert the rule into Splunk Query Language (for example) using [the `sigma-cli` tool](https://github.com/SigmaHQ/sigma-cli), the resulting query after conversion will be the following.

```splunk
"rm *bash_history" OR "echo \"\" > *bash_history" OR "truncate -s0 *bash_history" OR "history -c" OR "history -w"
```

::: warning A note on efficiency
Keep in mind that while keyword-based searches are easy to write, most SIEMs will usually perform vastly better when using [field-based searches](#detection-and).
:::

---

### by Field {#detection-and}

Next, Sigma rules can also be used to complete field-value searches.

To do this, represent the fields as a YAML "object" with their respective names and values.

```yaml
detection:
  selection:
    Username: "Administrator"
  condition: selection
```

You can also see where **multiple** fields appear together, by adding more field-value pairs to the YAML object.

For instance, to detect when a USB device is inserted into a machine, you may need to consider the following events triggered within the Windows Event Logging system:

- [`EventID: 6416`](https://www.ultimatewindowssecurity.com/securitylog/encyclopedia/event.aspx?eventid=6416) A new external device was recognised by the system <i class="opacity-50 pl-1">
  and</i>
- where the class of drive was a "DiskDrive"

To search for where both of these occur, place both together within the `selection` object, as shown below.

```yaml
title: External Disk Drive Or USB Storage Device
description: >
    Detects external diskdrives or plugged in USB devices,
    EventID 6416 on windows 10 or later
logsource:
    product: windows
    service: security
detection: // [!code focus:5]
    selection:
        EventID: 6416  # and where
        ClassName: 'DiskDrive'
    condition: selection
falsepositives:
    - Legitimate administrative activity
```

The resulting query after conversion will be the following <br/><i class="opacity-50">(Splunk Query Language used as an example):</i>

```splunk
source="WinEventLog:Security" EventCode=6416 ClassName="DiskDrive"
```

---

### by Field List {#detection-or}

The "by Field List" detection method is similar to the ["by Field"](#detection-and) method. It is useful when you have to search for multiple values of a field.

For example, you might want to search `Windows\Security` logs and detect when:

- [`EventID: 4728`](https://www.ultimatewindowssecurity.com/securitylog/encyclopedia/event.aspx?eventid=4728) A user is added to a Security Group (eg. Administrators) <i class="opacity-50 pl-1">
  or</i>
- [`EventID: 4729`](https://www.ultimatewindowssecurity.com/securitylog/encyclopedia/event.aspx?eventid=4729) A user is removed from a Security Group <i class="opacity-50 pl-1">
  or</i>
- [`EventID: 4730`](https://www.ultimatewindowssecurity.com/securitylog/encyclopedia/event.aspx?eventid=4730) A Security Group was
  deleted

You can represent this in Sigma by using a YAML list, where each field value is prepended by a newline, followed by a "`-`".

```yaml
title: Group Modification Logging
description: Triggers when an account is added to or removed from any group assigned administrative privileges.
logsource:
    product: windows
    service: system
detection: // [!code focus:7]
    selection:
        EventID:
            - 4728  # or where
            - 4729  # or where
            - 4730
    condition: selection
falsepositives:
    - Unknown
```

The resulting query after conversion will be the following <br/><i class="opacity-50">(Splunk Query Language used as an example):</i>

```splunk
source="WinEventLog:System" EventCode IN (4728, 4729, 4730)
```

### Conditions

The Sigma `detection` section can consist of one or more detections, or "selection" groups. Each selection group must be
present in the condition field at the bottom of the detection section.

The default name given to this group is `selection`, but it is often given more descriptive information about what it's
attempting to detect.

```yaml
detection:
  selection:
    field: value
  condition: selection
```

::: info Conditions
It's worth noting that conditions can be used to organize various selection groups, as well as combine or negate with other selection groups to perform powerful detection operations within the SIEM. For instance:

```yaml
condition: (selection_one or selection_two) and not filter
```

If you want to learn more about combining different "selection groups",
[you can check out the Conditions section of the documentation](/docs/basics/conditions.md).
:::

## Logsources

<Badge type="danger" text="Required" class="relative -top-2" />

The `logsource` section in Sigma rules is used to specify what log data should be searched by the rule. By specifying the appropriate log type in the logsource field, Sigma rules can target a specific variety of logs, rather than searching over all types of logs within a SIEM.

It splits up each defined logsource into three distinct fields - `category`, `product`, and `service`.

- **Category**<br />This describes a category of products.<br />(Eg. `webserver`, `firewall` or `edr`)<br /><br />
- **Product**<br />This describes a specific product.<br />(Eg. `windows`, `linux`, `cisco`)<br /><br />
- **Service**<br />This describes a service running within a given product<br />(Eg. `kerberos`, `defender` etc).<br /><br />

```yaml
author: Austin Songer @austinsonger
date: 2021-09-12
logsource: // [!code focus:3]
    product: okta
    service: okta
detection:
    selection:
```

Sigma rules usually use [a standard combination](/docs/basics/log-sources.md#standard-logsources) of these fields to
target a specific log source.

::: info Logsource `definition`

The `definition` field within logsource can also provide more information about how to onboard the log data source
correctly.

```yaml
tags:
  - attack.privilege_escalation
  - attack.t1548
logsource: // [!code focus:4]
  product: windows
  category: ps_script
  definition: Script Block Logging must be enabled
detection:
  selection:
    ScriptBlockText|contains: 'Invoke-Nightmare'
```

:::

<a :href="withBase('/docs/basics/log-sources.html')">
    <LogsourceBox />
</a>

## Metadata

<Badge type="tip" text="Optional" class="relative -top-2" />

Everything else that you can see around the [logsource](#logsources) and [detection](#detection) sections is what Sigma calls "Metadata", and can include fields such as `tags`, `level`, `references`, `description` and more.

::: info Sigma Specification
There is a [defined Sigma specification](https://github.com/SigmaHQ/sigma-specification/) that outlines what Sigma considers to be "standard" fields, but it's important to note that Sigma rules can contain any amount of Metadata fields you like.
:::

### Available Sigma metadata Fields

Below is a list of standard Sigma metadata fields.

<ul class="columns-2 lg:columns-3 pb-8 pb-8 block">
    <li><a href="#metadata-title">Title</a></li>
    <li><a href="#metadata-id">ID</a></li>
    <li><a href="#metadata-status">Status</a></li>
    <li><a href="#metadata-description">Description</a></li>
    <li><a href="#metadata-license">License</a></li>
    <li><a href="#metadata-author">Author</a></li>
    <li><a href="#metadata-date-modified">Date / Modified</a></li>
    <li><a href="#metadata-references">References</a></li>
    <li><a href="#metadata-tags">Tags</a></li>
    <li><a href="#metadata-false-positives">False Positives</a></li>
    <li><a href="#metadata-level">Level</a></li>
</ul>

---

#### Title { #metadata-title }

<Badge type="danger" text="Required" class="mt-2"/>

The `title` field is used to give a very short summary of what the rule is trying to achieve.

```yaml
title: Okta User Account Locked Out
```

::: tip Hint on writing good Alert titles

Try to keep your alert titles as short as possible, and avoid prefixes like "Detects when ...".

:::

---

#### ID { #metadata-id }

The `id` field should be generated whenever you create a Sigma rule, and globally identifies the Sigma rules against all
others. For this reason, Sigma recommends using randomly generated UUIDs (version 4).

You can generate your own UUIDv4 by [following the link here](https://www.uuidgenerator.net/version4).

```yaml
id: 12345678-bef0-4204-a928-ef5e620d6fcc
```

::: info Rule ID changes
Rule identifiers should only change for the following reasons:

- Major changes in the rule. (E.g. a different rule logic.)
- Derivation of a new rule from an existing or refinement of a rule in a way that both are kept active.
- Merge of rules.
  :::

[//]: # "::: tip Correlations"
[//]: # "Sigma IDs are heavily used in [Sigma Correlations](/docs/digging-deeper/correlations.md), so make sure you include one when making your Sigma rule."
[//]: # ":::"

---

#### Status { #metadata-status }

The `status` field advertises the current state of the Sigma rules as in-development, in-testing or ready for use.

> Values: `stable` | `test` | `experimental` | `deprecated` | `unsupported`

```yaml
status: stable
```

---

#### Description { #metadata-description }

The `description` field gives some explanation of the reason why the rule is in existence, how to best use it, and when it will trigger.

```yaml
description: This rule detects Windows RDP administrative logon
```

::: warning Writing Good Descriptions

Descriptions are often used by other products and services to help susinctly explain what the rule is trying to achieve. Try to avoid using:

- "Detects when ..." or "Detects if ..."
- "This rule will ..."

:::

---

#### License { #metadata-license }

<Badge type="info" text="Optional" class="mt-2"/>

The `license` field optionally specifies a SPDX IDs reference on how the Sigma rule can be used by others within the community.

```yaml
license: MIT
# OR
license: GPL-2.0-or-later
```

::: warning Publishing Sigma Rules

When contributing rules to the community, some repositories will usually have a `LICENSE` file that outlines the license of the entire repository, and all the detection rules pertained inside of it.

Remember to discuss the topic of any possible conflicting licenses with the repository owner before contributing any rules.

:::

---

#### Author { #metadata-author }

The `author` field specifies the singular author of the Sigma rule. It can also include a Twitter handle, email, or
other way to contact the author.

```yaml
author: Sirens [sirens@sigma.hq]
```

---

#### Date / Modified { #metadata-date-modified }

The `date` / `modified` field states the creation / last modified date of the rule.

```yaml
date: 2023-01-01
modified: 2023-01-02
```

:::info Date Format

The `date` and `modified` fields should be standardised to use the ISO 8601 date with separator format : YYYY-MM-DD.

:::

::: tip When to change the `modified` date?

You should only change the modified date when you:

- change the `title`,
- change the `detection` section,
- change the `level` <i class="opacity-50 pl-1">or</i>
- change the `logsource`

:::

---

#### References { #metadata-references }

The `references` field provides a URL, list of URLs or other text references how, or why the Sigma rule was created by
the author.

```yaml
references: https://learn.microsoft.com/en-us/windows/security/threat-protection/auditing/event-6416

# OR

references:
    - Plain Text (Eg. CVE-2025-22222)
    - https://www.trendmicro.com/vinfo/hk-en/security/news/cybercrime-and-digital-threats/malicious-spam-campaign-uses-iso-image-files-to-deliver-lokibot-and-nanocore
    - https://www.proofpoint.com/us/blog/threat-insight/threat-actor-profile-ta2719-uses-colorful-lures-deliver-rats-local-languages
    - https://twitter.com/MsftSecIntel/status/1257324139515269121
```

---

#### Tags { #metadata-tags }

The `tags` field applies is used to categorize or map Sigma rules into a variety of different security frameworks and
availability standards. These include, but are not limited to:

- [MITRE ATT&CK Framework](https://attack.mitre.org/)
- [MITRE Cyber Analytics Repository (CAR)](https://car.mitre.org/)
- [Traffic Light Protocol (TLP)](https://www.cisa.gov/news-events/news/traffic-light-protocol-tlp-definitions-and-usage)
- [Common Vulnerabilities and Exposures (CVE)](https://cve.mitre.org/cve/)

```yaml
tags:
  # MITRE ATT&CK framework references
  - attack.discovery
  - attack.t1012

  # MITRE Cyber Analytics Repository (CAR)
  - car.2016-04-005
  - car-2016-04-005

  # Traffic Light Protocol
  - tlp.amber
  - tlp.green

  # CVE
  - cve.2022-27925
```

::: tip Tags Naming Convention

The Sigma team have defined a tag naming convention under the Sigma Specification repository. You can find more
information about
this [here on the `sigma-specification` repo](https://github.com/SigmaHQ/sigma-specification/blob/main/appendix/sigma-tags-appendix.md).

:::

---

#### False Positives { #metadata-false-positives }

The `falsepositives` field outlines a list of possible known false positives that may occur.

```yaml
falsepositives:
  - This rule can sometimes create false-positives when a user forefully restarts their workstation
```

::: tip False Positives vs Filters

False-positives are not parsed by the Sigma convertors, and are simply there to help the detection-engineer or analyst to triage the alert as to when the rule might trigger in a non-malicious context.

If you want to filter out certain events, you should use the `condition` field in combination with a `filter` condition in the `detection` section, or use the [newly published Sigma Filters feature](/docs/meta/filters) to help tune your alerts.

:::

---

#### Level { #metadata-level }

The `level` field describes the criticality of a triggered rule.

While low and medium level events have an informative character, events with high and critical level should lead to immediate reviews by security analysts.

```yaml
level: low
```

> Values: `critical` | `high` | `medium` | `low` | `informational`

The five existing levels are divided into two categories.

- Rules that have informative character and should be displayed in a list or bar chart<br />(`informational`,`low`, `medium`)<br /><br />
- Rules that should trigger a dedicated alert<br />(`high`, `critical`)<br /><br />

Apply the following guidelines when setting a level:

- Rules of level `critical` should never trigger a false positive and be of high relevance
- Rules of level `high` trigger on threats of high relevance that have to be reviewed manually (rare false positives > baselining required)
- Rules of level `high` and `critical` indicate an incident (if not a false positive)
- Rules of level `low` and `medium` indicate suspicious activity and policy violations
- Rules of level `informational` have informative character and are often used for compliance or correlation purposes
