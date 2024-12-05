---
title: "Getting Started"
subtitle: "Guide"
---

<!--suppress ES6UnusedImports -->
<script setup>
import {withBase} from "vitepress";  
import RulesBox from "/.vitepress/theme/components/Boxes/RulesBox.vue";
import LogsourceBox from "/.vitepress/theme/components/Boxes/LogsourceBox.vue";
import BackendBox from "/.vitepress/theme/components/Boxes/BackendBox.vue";

</script>

# {{ $frontmatter.title }}

This guide provides step-by-step instructions on how to set up Sigma and convert its rules into different SIEM formats. It also includes some basic configuration tips to help you make the most of Sigma's features. The guide is suitable for both experienced users and beginners, and it aims to provide clear and concise information to help you successfully work with Sigma and its ecosystem.

## Installation

The Sigma ecosystem offers several tools for your use. This documentation will mainly focus on the primary Sigma converter, called `sigma-cli`, which converts all Sigma rules into usable SIEM queries for your security environment(s).

### Requirements

To use `sigma-cli` (the Sigma Rule Converter) & the underlying library, you must have Python >= `3.8` installed.

---

### Using `pip`

The main conversion tool for Sigma is `sigma-cli`. The easiest way to install `sigma-cli` is through the Python 3 package manager _`pip`_.

```bash
pip3 install sigma-cli
```

::: tip
Be sure that you’ve added Python's binary location (usually `~/.local/bin`) to your PATH, so you can run `sigma-cli` straight from your CLI. [Visit Python's website for Windows and more info.](https://packaging.python.org/en/latest/tutorials/installing-packages/#installing-to-the-user-site)
:::

### From Source

If you don't want to use `pip`, or if you instead want to download and install `sigma-cli` from source, first install [Poetry](https://python-poetry.org/docs/basic-usage/) on your system, then clone and install the required dependencies using Poetry.

```bash
git clone https://github.com/SigmaHQ/sigma-cli.git
cd sigma-cli
poetry install && poetry shell
sigma --version
```

## Install your SIEM plugin

<div class="-mt-3"><Badge  type="tip" text="New" /></div>

Once you've [installed `sigma-cli`](#installation), you will need to install your backend plugin through `sigma-cli`.

Newly introduced, the `sigma-cli` tool now offers a selection of **installable [backends](/docs/digging-deeper/backends.html)** – through a plugin system, each designed to target a specific SIEM commonly used by users. To see which backend plugins are available, run the `sigma plugin list` command from the command line.

```bash
sigma plugin list
+----------------------+----------+---------+--------------------------------------------------------------+-------------+
| Identifier           | Type     | State   | Description                                                  | Compatible? |
+----------------------+----------+---------+--------------------------------------------------------------+-------------+
| splunk               | backend  | stable  | Splunk backend for conversion into SPL ...                   | yes         |
...
+----------------------+----------+---------+--------------------------------------------------------------+-------------+
```

To install a backend plugin, use the `sigma plugin install` command, followed by the backend identifier.

```bash
sigma plugin install splunk
```

Throughout this guide, Splunk will be used as the SIEM conversion example.

## Converting Sigma Rules

### Basic Example

Once you have installed the `sigma-cli` tool and the associated SIEM backend plugin, create a directory that will
contain your Sigma rules and function as your **"detection-as-code"** repository. Consolidating your rules in one place
is considered best practice and simplifies the deployment process.

Next, to create a Sigma rule that will detect when someone tries to <u>disable</u> **Windows Defender's Threat
Protection**, create a [`YAML`](https://yaml.org/) file called `windows_defender_threat_detection_disabled.yml` and fill
it with the example Sigma detection shown below.

```bash
# Create a test repository to store your detections-as-code
mkdir sigma_test_repo && cd sigma_test_repo
mkdir ./rules

# Create a new Sigma rule
vim ./rules/windows_defender_threat_detection_disabled.yml
```

::: code-group

```yaml:line-numbers [windows_defender_threat_detection_disabled.yml]
title: Windows Defender Threat Detection Disabled
logsource:
    # Windows Defender
    product: windows
    service: windefend
detection:
    selection:
        # The detection itself
        EventID:
            - 5001
            - 5010
            - 5012
            - 5101
    condition: selection
```

:::

Quickly running through this rule, we can describe it as detecting when the field `EventID` matches the following cases:

- A user has disabled Windows Defender's Real-time protection <i class="opacity-50 pl-1">or</i> <br />[`EventID: 5001`](https://learn.microsoft.com/en-us/microsoft-365/security/defender-endpoint/troubleshoot-microsoft-defender-antivirus?view=o365-worldwide)
- A user has disabled Windows Defender's Anti-Spyware protection <i class="opacity-50 pl-1">or</i> <br />[`EventID: 5010`](https://learn.microsoft.com/en-us/microsoft-365/security/defender-endpoint/troubleshoot-microsoft-defender-antivirus?view=o365-worldwide)
- A user has disabled Windows Defender's Anti-Virus protection <i class="opacity-50 pl-1">or</i> <br />[`EventID: 5012`](https://learn.microsoft.com/en-us/microsoft-365/security/defender-endpoint/troubleshoot-microsoft-defender-antivirus?view=o365-worldwide)
- Windows Defender's Antimalware platform has expired <br />[`EventID: 5101`](https://learn.microsoft.com/en-us/microsoft-365/security/defender-endpoint/troubleshoot-microsoft-defender-antivirus?view=o365-worldwide)

<br />

After saving the file and closing vim (or your preferred editor), you can use the `sigma convert` command to convert this Sigma rule into a Splunk query. It's important to set the correct parameters to ensure a valid query is produced for the SIEM being used in your environment.

- **Set the Target SIEM** &nbsp;&nbsp;<br class="md:hidden" />`--target splunk`<br /><br class="md:hidden" />Use this option to instruct Sigma to convert the Sigma files under the `./rules/` directory to Splunk&nbsp;SPL.<br />[See the full list of supported backends here ->](/docs/digging-deeper/backends.md)<br /><br />
- **Set the SIEM Pipeline** &nbsp;&nbsp;<br class="md:hidden" />`--pipeline splunk_windows`<br /><br class="md:hidden" />Use this option to instruct Sigma to use the `splunk_windows` default field- and source-mapping pipeline.<br />[Learn more about Sigma pipelines here ->](/docs/digging-deeper/pipelines.html)<br /><br />

```bash
sigma convert \
    --target splunk \
    --pipeline splunk_windows \
    ./rules
```

```splunk
source="WinEventLog:Microsoft-Windows-Windows Defender/Operational" \
EventCode IN (5001, 5010, 5012, 5101)
```

Once events are populated under the `WinEventLog:Microsoft-Windows-Windows Defender/Operational` source within your SIEM – this example being Splunk, you can easily use this query to set up a detection and alert when someone disables Windows Defender within your monitored environment.

Congratulations, you're now ready to start detecting security threats using Sigma! 🎉

::: tip Next Steps

One of the best features of the Sigma format is taking advantage of the 1000's of existing detections for many popular enterprise OS's, Software and Systems, including Microsoft Windows, Microsoft 365, Okta, and many more.

[Visit the SigmaHQ/sigma rule repository](https://github.com/SigmaHQ/sigma/)

:::

### Adding Contextual Information

While the previous example demonstrated a simple detection, in practice, Sigma rules contain additional metadata to provide context for the detection. This metadata may include severity (called "level" within Sigma), references, false-positives, tags (such as MITRE Attack mapping), and a rationale for the detection.

To better illustrate this point, let's take a look at a more complex Sigma rule, taken from the `SigmaHQ/sigma` repository written by [Austin Songer](https://twitter.com/TheAustinSonger).

::: code-group

```yaml:line-numbers [okta_user_account_locked_out.yml]
# ./rules/cloud/okta/okta_user_account_locked_out.yml
title: Okta User Account Locked Out
id: 14701da0-4b0f-4ee6-9c95-2ffb4e73bb9a
status: test
description: Detects when an user account is locked out.
references:
    - https://developer.okta.com/docs/reference/api/system-log/
    - https://developer.okta.com/docs/reference/api/event-types/
author: Austin Songer @TheAustinSonger
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

:::

It's worth noting that Sigma rules often contain fantastic metadata about a detection, which is highly useful when investigating a security incident.

::: info Learn more about Rules
To learn more about the fields above and how they are used in Sigma, <br />[visit the Rules section of the documentation](/docs/basics/rules.md).
:::

Converting this rule using the Splunk backend, and using the Splunk pipelines outputs the following query.

```bash{4}
sigma convert \
    --target splunk \
    --pipeline splunk_windows \
    ./rules/cloud/okta/okta_user_account_locked_out.yml
```

```splunk
displaymessage="Max sign in attempts exceeded"
```

### Outputting to Different Formats

Notice that adding the metadata to this Sigma rule hasn't changed the output of this query – using the default output format. Sigma supports outputting to multiple formats, unique to each backend.

We can see this metadata being used if we change the output format to `savedsearches`.

```bash{3}
# Convert to Splunk savedsearches format
sigma convert \
    --format savedsearches \
    --target splunk \
    --pipeline splunk_windows \
    ./rules/cloud/okta/okta_user_account_locked_out.yml
```

::: code-group

```conf [Output (savedsearches format)]
[default]
dispatch.earliest_time = -30d
dispatch.latest_time = now

[Okta User Account Locked Out]
description = Detects when an user account is locked out.
search = displaymessage="Max sign in attempts exceeded"
```

:::

### Custom Field & Source Mapping

Although many logsources in enterprise IT environments are similar, it is essential to recognize that each SIEM is uniquely configured, particularly in its usage of field names, data types, and log formats.

To address these variances, `sigma-cli` provides end-users with the ability to perform field-mapping when converting rules. This function ensures any fields found in Sigma rules correctly map to users' fields found within their SIEM.

To best illustrate the adaptability of the Sigma format, we will onboard a custom logsource (in this example, an internal production service called `puppy_app_production`) and its corresponding detection rule, into our detections-as-code repository.

```bash
# Inside of sigma_test_repo, create a pipelines directory
mkdir ./pipelines

# Create a new Sigma pipeline file
vim ./pipelines/puppy_app_production_config.yml
```

::: code-group

```yaml [puppy_app_production_config.yml]{8-9,17-19}
# ./pipelines/puppy_app_production_config.yml
name: Puppy Application – Splunk Log Source Configuration
priority: 100
transformations:
  - id: prefix_source_and_index_for_puppy_logs
    type: add_condition
    conditions:
      index: "puppy_prod"
      source: "PuppyApp/App"
    rule_conditions:
      - type: logsource
        product: puppy
        service: app
  - id: map_fields_for_puppies
    type: field_name_mapping
    mapping:
      status: "puppy.status"
      dog_name: "puppy.name"
      dog_breed: "puppy.breed"
    rule_conditions:
      - type: logsource
        product: puppy
        service: app
```

```yaml [sad_puppy.yml]
# ./rules/sad_puppy.yml
title: Sad Puppy in Dog Supply Line
id: 469b8469-508d-42d0-98a1-0c7e937ca7a3
status: experimental
description: >
  Detects whenever a sad puppy is logged to the Dog Supply Line (DSL) log stream output.
  See wiki on how to triage with treats and/or walks.
references:
  - https://wiki.example.com/DOG/Sad+Puppy+Playbook+(2023)
author: Toto <toto@example.com>
date: 2023-04-06
logsource:
  product: puppy
  service: app
detection:
  selection:
    status: "sad"
  condition: selection
fields:
  - dog_name
  - dog_breed
  - status
falsepositives:
  - sometimes sad dogs are reported as guilting owners for walks, treats etc.
level: high
```

:::

::: tip Explainer

In this configuration example, any rules that have a match on the following:<br />
`product: puppy` and `service: app`

Sigma will apply `index='puppy_prod' source='PuppyApp/App'` to the resultant SIEM query output, and map each field across, for example `status` to `puppy.status`, `dog_name` to `puppy.name` etc.

:::

We can combine this configuration example with the custom `sad_puppy.yml` detection rule, that will detect whenever our log source detects a sad puppy in our SIEM.

```bash{3}
sigma convert \
    -t splunk \
    -p ./pipelines/puppy_app_production_config.yml \
    ./rules/sad_puppy.yml
```

```splunk
index="puppy_prod" source="PuppyApp/App" Status="sad"
| table dog_name,dog_breed,Status
```

::: info Learn more about Logsources & Field Mapping

Each supported SIEM should have its own configuration already pre-defined, with most fields and logsources mapped for you.

This is completed via a feature in pySigma called processing pipelines. If you're an end-user however, you'll find the documentation on Logsources more relevant to mapping your Sigma rules to your logsources.

[You can read more in here in Log Sources.](/docs/basics/log-sources.md)
:::

## What's Next?

From here, you've understood the basics of Sigma. It's time to dive deeper into learning more about [Logsources](/docs/basics/log-sources.md), [Rules](/docs/basics/rules.md) and [Backends](/docs/digging-deeper/backends.md).

<div class="grid gap-4 grid-cols-1 md:grid-cols-2 items-stretch">
    <a :href="withBase('/docs/basics/rules.html')">
        <RulesBox />
    </a>
    <a :href="withBase('/docs/basics/log-sources.html')">
        <LogsourceBox />
    </a>
    <a :href="withBase('/docs/digging-deeper/backends.html')">
        <BackendBox />
    </a>
</div>
