# Security Policy

## Supported versions

Only the live site, built from the `main` branch, is supported.

## Reporting a vulnerability

**Please do not open a public issue, discussion or pull request for a security problem.**

Report it privately through GitHub: **Security → Advisories → "Report a vulnerability"** on this repository (<https://github.com/SigmaHQ/sigmahq.github.io/security/advisories/new>).
If you cannot use GitHub, open a public issue that says only that you have a security report and asks for a private contact. Do not include any details in that issue.

Please include:

- the affected page or build step, and the steps or input that reproduce the problem;
- the impact you see (see the scope below) and, if you have one, a proposed fix.

## What we treat as a vulnerability

This repository builds the Sigma project website (sigmahq.io) with VitePress and publishes it through GitHub Pages. The following are in scope:

- **Cross-site scripting or content injection** on the published site, including through rendered Markdown, embedded rule content or client-side scripts.
- **Build and deployment integrity:** weaknesses in the build scripts, dependencies or the GitHub Actions deployment workflow that could let an outsider change the published site.
- **Domain and hosting:** takeover of the site's domain, subdomains or linked resources.

**Out of scope (report publicly as bugs):**

- Broken links, typos, outdated documentation, and missing hardening headers that GitHub Pages does not allow the project to set.

Vulnerabilities in the Sigma tooling documented on the site belong in the respective tool's repository.

## Our process

| Step                                                                          | Target                                        |
| ----------------------------------------------------------------------------- | --------------------------------------------- |
| Acknowledge the report                                                        | within 5 working days                         |
| Initial assessment and severity (CVSS 3.1)                                    | within 14 days                                |
| Fix developed in the advisory's temporary private fork                        | as soon as practical, normally within 90 days |
| Coordinated release, then GitHub Security Advisory published (CVE via GitHub) | at the fix release                            |

- We credit reporters in the advisory unless they ask not to be credited.
- When a fix affects other SigmaHQ projects, we may coordinate their releases.
- We ask reporters to keep details private until the advisory is published or 90 days have passed, whichever comes first, unless agreed otherwise.
