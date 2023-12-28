---
title: 'Modifiers'
---

# Sigma {{ $frontmatter.title }}

Introduced in [2019](https://patzke.org/introducing-sigma-value-modifiers.html), Sigma modifiers was brought into the Sigma specification to allow detection engineers to perform more complex operations on Sigma rules that we're supported in most SIEMs, such as Regex, Boolean logic, and `cidr` notation.

## Overview

The values of given fields contained within Sigma rules can be changed using Value Modifiers. Value modifiers (or more simply, "modifiers") are appended after the field name with a pipe character `|` to each field you want to modify.

_Example:_

```yaml{3}
detection:
    selection:
        TargetFilename|endswith: '.cmdline'
```

```splunk
TargetFilename="*.cmdline"
```

Modifiers can also be chained together to perform more complex operations.

[//]: # (TODO)

## Available Field Modifiers

Below is a list of available field modifiers.

<ul class="columns-2 lg:columns-3 pb-8 pb-8 block">
    <li><a href="#all"><code>all</code></a></li>
    <li><a href="#base64-base64offset"><code>base64</code> / <code>base64offset</code></a></li>
    <li><a href="#cidr"><code>cidr</code></a></li>
    <li><a href="#contains"><code>contains</code></a></li>
    <li><a href="#endswith"><code>endswith</code></a></li>
    <li><a href="#expand"><code>expand</code></a></li>
    <li><a href="#gt"><code>gt</code></a></li>
    <li><a href="#gte"><code>gte</code></a></li>
    <li><a href="#lt"><code>lt</code></a></li>
    <li><a href="#lte"><code>lte</code></a></li>
    <li><a href="#startswith"><code>startswith</code></a></li>
    <li><a href="#wide"><code>utf16</code> / <code>utf16le</code> / <code>utf16be</code> / <code>wide</code></a></li>
    <li><a href="#windash"><code>windash</code></a></li>
</ul>

---

### all

::: code-group

```yaml [/rules/web/web_cve_2020_0688_exchange_exploit.yml]
detection:
    selection:
        c-uri|contains|all:
            - '/ecp/default.aspx'
            - '__VIEWSTATEGENERATOR='
            - '__VIEWSTATE='
    condition: selection
```

```splunk [Splunk Output]
"c-uri"="*/ecp/default.aspx*" \
    "c-uri"="*__VIEWSTATEGENERATOR=*" \
    "c-uri"="*__VIEWSTATE=*"
```

:::

Normally, lists of values are linked with `OR` in the generated query.<br />The `all` modifier changes this to `AND`.

This modifier is useful if you want to express a command line invocation with different parameters where the order may vary and removes the need for some cumbersome workarounds.

::: info Note:

Single item values are not allowed to have an `all` modifier as some backends cannot support it. If you use it as a workaround to duplicate a field in a selection, use a new selection instead.

:::

---

### base64 / base64offset

::: code-group

```yaml [/rules/base64_shell_usage_http_traffic.yaml]
title: Base64 shell usage in HTTP web traffic
...
detection:
    selection:
        fieldname|base64offset|contains: 
            - /bin/bash 
            - /bin/sh 
            - /bin/zsh
    condition: selection
```

```splunk [Splunk Output]
fieldname="*L2Jpbi9iYXNo*" \
    OR fieldname="*9iaW4vYmFza*" \
    OR fieldname="*vYmluL2Jhc2*" \
    OR fieldname="*L2Jpbi9za*" \
    OR fieldname="*9iaW4vc2*" \
    OR fieldname="*vYmluL3No*" \
    OR fieldname="*L2Jpbi96c2*" \
    OR fieldname="*9iaW4venNo*" \
    OR fieldname="*vYmluL3pza*"
```

:::

The `base64` modifier-set will encode the provided values as base64 encoded strings. Often used alongside `contains` to identify malicious injection into applications. 

This technique is often used by malicious actors to hide behaviour by executing commands, or sending HTTP parameters, using base64, sometimes preventing traditional detection methods.

::: tip Tip:

The `base64offset` modifier is usually preferred over the `base64` modifier, because an ASCII value encoded into `base64` can have 3 different offsets (or shifts) that can occur when completing the encoding process.

:::

---

### cidr

::: code-group

```yaml [/rules/needle_in_haystack.yaml]
detection:
    selection:
        first_ip_address|cidr: 192.0.0.0/8
        second_ip_address|cidr: 192.168.0.0/23 
```

```splunk [Splunk Output]
*
| where cidrmatch("192.0.0.0/8", first_ip_address)
| where cidrmatch("192.168.0.0/23", second_ip_address)
```

:::

::: code-group

```yaml [/rules/needle_in_haystack.yaml]
detection:
    selection:
        ipaddress|cidr: 2a03:2880:f132:83:face:b00c::/96 
```

```splunk [Splunk Output]
*
| where cidrmatch("2a03:2880:f132:83:face:b00c::/96", ipaddress)
```

:::

The `cidr` modifier allows for CIDR-formatted subnets to be used as field values, where any IPv4 or IPv6 addresses are supported.

---

### contains

::: code-group

```yaml [/rules/needle_in_haystack.yaml]
detection:
    selection:
        fieldname|contains: needle
```

```splunk [Splunk Output]
fieldname="*needle*"
```

:::

The `contains` modifier will insert a wildcard token (usually `*`) around the provided value(s), such that the value is matched anywhere in the field.

---

### startswith

::: code-group

```yaml [/rules/needle_in_start_of_haystack.yaml]
detection:
    selection:
        fieldname|startswith: needle
```

```splunk [Splunk Output]
fieldname="needle*"
```

:::

The `startswith` modifier will insert a wildcard token (usually `*`) at the start of the provided value(s), such that the value is matched at the beginning of the field.

---

### endswith

::: code-group

```yaml [/rules/needle_in_end_of_haystack.yaml]
detection:
    selection:
        fieldname|endswith: needle
```

```splunk [Splunk Output]
fieldname="*needle"
```

:::

The `endswith` modifier will insert a wildcard token (usually `*`) at the end of the provided value(s), such that the value is matched at the end of the field.

---

### expand


::: code-group
```yaml [/rules/rule.yml]
title: Administrator Usage
logsource:
    product: windows
detection:
    selection:
        user|expand: "%administrator_name%"
    condition: selection
```
```yaml [/pipelines/value_placeholders_test.yml]
name: value_placeholder_pipeline
vars:
    administrator_name: Administrator
transformations:
    - type: value_placeholders
```
```splunk [Splunk Output]
user="Administrator"
```
:::

The `expand` modifier can be used with Sigma Pipelines in order to replace placeholder values with another value common across that processing pipeline.

---

### gt

::: code-group

```yaml [/rules/needle_in_end_of_haystack.yaml]
detection:
    selection:
        fieldname|gt: 15
```

```splunk [Splunk Output]
fieldname>15
```

:::

The `gt` modifier will provide a search where the value of `fieldname` is greater than the value provided.

---

### gte

::: code-group

```yaml [/rules/needle_in_end_of_haystack.yaml]
detection:
    selection:
        fieldname|gte: 15
```

```splunk [Splunk Output]
fieldname>=15
```

:::

The `gte` modifier will provide a search where the value of `fieldname` is greater than or equal to the value provided.

---

### lt

::: code-group

```yaml [/rules/needle_in_end_of_haystack.yaml]
detection:
    selection:
        fieldname|lt: 15
```

```splunk [Splunk Output]
fieldname<15
```

:::

The `lt` modifier will provide a search where the value of `fieldname` is less than the value provided.

---

### lte

::: code-group

```yaml [/rules/needle_in_end_of_haystack.yaml]
detection:
    selection:
        fieldname|lte: 15
```

```splunk [Splunk Output]
fieldname<=15
```

:::

The `lte` modifier will provide a search where the value of `fieldname` is less than or equal to the value provided.

---

### utf16 / utf16le / utf16be / wide {#wide}

::: code-group

```yaml [/rules/needle_in_end_of_haystack.yaml]
detection:
    selection:
        CommandLine|wide|base64offset|contains: "ping"
```

```splunk [Splunk Output]
CommandLine="*cABpAG4AZw*" \
  OR CommandLine="*AAaQBuAGcA*" \
  OR CommandLine="*wAGkAbgBnA*"
```

:::

Prepends a byte order mark and encodes UTF16, (only used in combination with base64 modifiers)

::: warning Don't end with `utf16`, `utf16le`, `utf16be` or `wide`

The value modifier chain must not end with character set encoding modifiers (`utf16`, `utf16le`, `utf16be` and `wide`). The resulting values are internally represented as byte sequences instead of text strings and contain null characters which are usually difficult to handle in queries. Therefore the should be followed by an encoding modifier (base64, base64offset)

:::

---

### windash

::: code-group

```yaml [/rules/needle_in_end_of_haystack.yaml]
detection:
    selection:
        fieldname|windash|contains:
            - " -param-name "
            - " -f "
```

```splunk [Splunk Output]
fieldname="* -param-name *" OR fieldname="* /param-name *" \
OR fieldname="* -f *" OR fieldname="* /f *"
```

:::

The windash modifier will convert any provided command-line arguments or flags to use both `-`, as well as `/`. 

This is incredibly useful in the the Windows ecosystem, where Windows has [two standards for passing arguments to commands](https://learn.microsoft.com/en-us/powershell/scripting/learn/shell/running-commands?view=powershell-7.3#passing-arguments-to-native-commands), usually `-` for PowerShell (e.g. `-a`), and `/` for `cmd.exe` (e.g. `/a`), but a large number of commands will commonly accept both.
