---
title: 'About Sigma'
---

# {{ $frontmatter.title }}

<!--suppress ES6UnusedImports -->
<script setup>
import {withBase} from "vitepress";
import ThreeTypes from "/.vitepress/theme/components/Docs/About/ThreeTypes.vue";
</script>

You may have heard of Sigma rules before – especially around Security Operations Centres (SOCs),
Threat Hunting teams, and more generally around the cyber security landscape. 

While people often associate Sigma with the detection format,
it's important to understand the wider ecosystem of standards, tools, and rule collections.

There are three main aspects or components that make up this ecosystem.

- [The Sigma Format](#the-format)
- [Sigma Tools](#the-tools)
- [Sigma Rule Collections](#the-rules)

These three components work together to create a comprehensive ecosystem for SIEM detection that supports the creation,
management, and sharing of detection rules across different platforms and use cases.

<div id="the-format"></div>

<ThreeTypes class="mt-20 -mb-4" link_one="#the-format" link_two="#the-tools" link_three="#the-rules" active="format" /> 

### The Format

The "Sigma" format exists as a way to share detections of <u>malicious or dangerous behaviour</u> among security professionals.

It is built as an open-source standard so that a single Sigma detection rule can be used across the entire security landscape of **SIEMs** _(Eg. Splunk, Azure Sentinel and more)_, **logging platforms** _(Eg. greylog)_ and **databases** _(Eg. MySQL)_.

<span class="text-slate-800 dark:text-white text-xl max-w-[400px] block mx-auto my-14 first-letter:-ml-2 italic">“Sigma is for log files what Snort is for network traffic and YARA is for files.”</span>

The Sigma rule format is flexible, easy to write, and applicable to any type of log file.
The main purpose of this project is
to provide a structured form in which detection engineers, security researchers or security analysts can describe their own detection methods
and make them shareable with others.

::: code-group

```yaml [Example Sigma Rule]
title: AWS Root Credentials
description: Detects AWS root account usage
logsource:
    product: aws
    service: cloudtrail
detection:
    selection:
        userIdentity.type: Root
    filter:
        eventType: AwsServiceEvent
    condition: selection and not filter
falsepositives:
    - AWS Tasks That Require Root User Credentials
level: medium
``` 

:::

<i>Example: This Sigma rule looks for usage of AWS root credentials.</i>

::: info Learn more about Sigma rules
To learn more about Sigma rules and how to use them to detect within your SIEM, <br class="hidden md:inline" />visit the ["Sigma Rules"](/docs/basics/rules.md) page.
:::

<div id="the-tools"></div>

<ThreeTypes class="mt-20 -mb-4" link_one="#the-format" link_two="#the-tools" link_three="#the-rules" active="tools" />

### The Tools

Built around the Sigma detection format are amazing tools to help you make the most of it. 

The primary focus of the Sigma ecosystem is the **converter** – something that turns Sigma detection files into usable SIEM queries. In the past, this was completed by a tool called "sigmac".

In 2023, the ecosystem is moving to a new tool –> powered by pySigma, called [`sigma-cli`](https://github.com/SigmaHQ/sigma-cli).

You can jump straight in and convert to many popular existing SIEMs already.

:::tip Getting started!
Keen to start converting from Sigma format to your SIEM's queries? <br class="hidden md:inline" />Visit the ["Getting Started"](/docs/guide/getting-started) page.
:::

::: info Supported SIEMs

<div class="grid place-items-center justify-between gap-8 grid-cols-3 md:grid-cols-6 overflow-hidden py-4">
<img :src="withBase('/images/backend_logos/splunk.png')" class="w-14" alt="Splunk">
<img :src="withBase('/images/backend_logos/elastic.png')" class="w-14" alt="Elastic">
<img :src="withBase('/images/backend_logos/logpoint.jpg')" class="w-14" alt="Logpoint">
<img :src="withBase('/images/backend_logos/mdatp.png')" class="w-14" alt="Microsoft Advanced Threat Protection">
<img :src="withBase('/images/backend_logos/sumo.png')" class="w-14" alt="Sumologic">
<img :src="withBase('/images/backend_logos/sentinel.png')" class="w-14" alt="Azure Sentinel">
</div>

To learn more about the supported targets <i>(or "backends")</i> that Sigma supports, <br class="hidden md:inline" />visit the ["Sigma Backends"](/docs/digging-deeper/backends.md) page.
:::

<div id="the-rules"></div>

<ThreeTypes class="mt-20 -mb-4" link_one="#the-format" link_two="#the-tools" link_three="#the-rules" active="rules" />

### The Rules

Lastly, there exist many repositories that have collated Sigma detections to better help the community detect threat actors.

One of the most widely used rule collections is the [SigmaHQ/sigma](https://github.com/SigmaHQ/sigma/) repository,
hosted on GitHub, which contains a large and growing number of high-quality Sigma detection rules that security teams can immediately convert & deploy out to their SIEMs to start detecting malicious behaviour across their organisation.

In addition to the [SigmaHQ/sigma](https://github.com/SigmaHQ/sigma/) rule collection, there are also several other repositories maintained by different individuals and organizations that contain Sigma rules. These repositories can cover a wide range of threat types and attack scenarios, and can be useful for organizations looking to expand their detection capabilities or stay up to date with emerging threats.

## Why Sigma?

Here are some great reasons to start adopting Sigma within your security detection strategy.

- **Be technology-agnostic**<br />Sigma provides a way of managing detections without having to commit to one specific SIEM's query language. This means if you want to change SIEMs later on, or migrate detections over to another client using a different technology stack, you can effortlessly try those detections.
- **Start using thousands of existing detections**<br />Since it's inception, the Sigma community has already contributed over 15'000 rules and existing rule modifications to the Sigma repository. These are all free for you to use right away, and increasing your security detection coverage right away.
- **Bringing CI/CD to your detection workflow**<br />Because all Sigma rules are stored within `.yml` files, you can start using the communities'-made script to deploy out your detections straight from a GitHub, Gitlab, or any CI/CD pipeline, straight into your SIEM. This also provides version control over your detections, so you can deploy only when required, and see how your detection repositories change over time.

### Design Philosophy 

The Sigma standard was designed to support basic search queries, and only a few common correlations (Eg. sum / count), covering more tha 90% of the day-to-day needs of detection strategies. This trade off was made to ensure the ability to share detections across all sorts of security environments.  

## History

> Released by Florian Roth in 2017, Sigma (The Generic Signature Format for SIEM Systems) has paved the way for platform-agnostic search. With Sigma, defenders can harness the community's power to react promptly to critical threats and new adversary trade-craft. You get a fixed-language specification for the generic rule format, a tool for converting Sigma rules into various query formats and a repository of over one thousand rules for several attack techniques. <br /><br />Like YARA, or Snort Rules, Sigma is a tool for the open sharing and crowd-sourcing of threat intelligence, it focuses on SIEM instead of files or network traffic. What Snort is to network traffic, and YARA is to files, Sigma is to logs. <br /><br />Most attacks on IT systems and networks manifest themselves in event logs stored in the SIEM systems or other log storage and analysis solutions. This makes SIEM a crucial tool to detect and alert against intruders. SIEM detection rule-sets existed in the vendor or platform-specific databases in the earlier days. The growing demand for up-to-date detections and analytics to be secure today requires sharing detection intelligence between different stakeholders and vendors. Sigma solves this challenge to make the queries and rule-sets platform-agnostic.

From <https://fourcore.io/blogs/sigma-rules-open-source-threat-hunting-approach>

## Frequently Asked Questions

::: details Where do I find Sigma rules?

The biggest collections of Sigma rules are held in the following repositories, but there are many more.

- [SigmaHQ/sigma](https://github.com/SigmaHQ/sigma)
- [Joe Security Sigma Rules](https://github.com/joesecurity/sigma-rules)
- [SOCPrime - Threat Detection Marketplace](https://my.socprime.com/tdm/) <Badge type="danger" text="Paid" />

You'll also find Sigma rules attached to [Virus Total](https://support.virustotal.com/hc/en-us/articles/360015738658-Sigma-rules) signatures, as well as included in Threat Sharing Platforms like MISP.
:::

::: details Which SIEM / log management systems are supported?

Sigma is a generic signature format that can be converted manually or automatically into search expressions. For most target systems, it is an easy task to extend the list of backends and add a new one for your specific query language. Check the README of the project for a complete list of currently supported backends.
:::

::: details Why use YAML?

It is easy to read and write, flexible and provides all needed language elements. However it lacks a standardized schema language as XML provides it.
:::

::: details Isn't Sigma the same as OSSEC?

Sigma aims at being a generic signature format for all kinds of log data, whereas OSSEC covers host based detection very well in its own specific XML rule base. We could definitely convert the OSSEC rule base licensed under the GPL and provide those as rules in Sigma format so that the detections become available in any SIEM system.
:::

## Contributing

If you want to contribute to the project, you are more then welcome! There are numerous ways to help this project:

- **Provide Feedback**<br />Use Sigma and tell us what works, and what doesnt. This includes:
    - **False Positives** _(New Issues)_<br />Detections that don't detect the behaviour it's intended to, or
    - **True Negatives** _(New PRs)_<br />Detections that don't quite detect all the strategies intended.
    - **Bugs in Tooling** _(New Issues)_<br />If you encounter any errors in `sigma-cli`, or any other supported tool, please feel free to lodge a fully detailed issue (including stack trace and expected behaviour).<br/><br/>
- **Work on [Open Issues](https://github.com/SigmaHQ/sigma/issues?q=is%3Aissue+is%3Aopen+)**<br />The github issue tracker is a good place to start tackling some issues others raised to the project. It could be as easy as a review of the documentation.<br/><br/>

::: danger <Badge type="danger" text="Legacy" class="mr-2" /> Looking for `sigmac`?
If you're looking for the legacy tool `sigmac` and the surrounding ecosystem, please head over to [`legacy-sigmatools` Github repository.](https://github.com/SigmaHQ/legacy-sigmatools/issues). This legacy repo is no longer accepting new backends for SIEMs.
:::

## Specification

The entire Sigma specification, including outlines of each file format,  is documented within [the Sigma Specification repository](https://github.com/SigmaHQ/sigma-specification). If you believe that there should be a change to the standard, you can [submit an Feature Request](https://github.com/SigmaHQ/sigma-specification/issues/new), or a [Pull Request](https://github.com/SigmaHQ/sigma-specification/pulls) to the Sigma specification repository below.

<https://github.com/SigmaHQ/sigma-specification>


## Credits

The Sigma ecosystem is mainly developed by Florian Roth (https://github.com/Neo23x0/) and Thomas Patzke (https://github.com/thomaspatzke) with feedback from many fellow analysts and friends. Rules are our own or have been derived from blog posts, tweets or other public sources that are referenced in the rules.
