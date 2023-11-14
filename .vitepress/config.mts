import {defineConfig} from 'vitepress'
import './syntax/syntax'
import footnote from 'markdown-it-footnote'

export default defineConfig({
    title: 'Sigma',
    titleTemplate: 'Sigma Website',
    description: 'A generic and open signature format that allows you to describe relevant log events in a straight-forward manner.',
    ignoreDeadLinks: true,
    head: [
        ['link', {
            media: "(prefers-color-scheme: dark)",
            rel: "apple-touch-icon-precomposed",
            sizes: "57x57",
            href: "/favicon/dark/apple-touch-icon-57x57.png"
        }],
        ['link', {
            media: "(prefers-color-scheme: dark)",
            rel: "apple-touch-icon-precomposed",
            sizes: "114x114",
            href: "/favicon/dark/apple-touch-icon-114x114.png"
        }],
        ['link', {
            media: "(prefers-color-scheme: dark)",
            rel: "apple-touch-icon-precomposed",
            sizes: "72x72",
            href: "/favicon/dark/apple-touch-icon-72x72.png"
        }],
        ['link', {
            media: "(prefers-color-scheme: dark)",
            rel: "apple-touch-icon-precomposed",
            sizes: "144x144",
            href: "/favicon/dark/apple-touch-icon-144x144.png"
        }],
        ['link', {
            media: "(prefers-color-scheme: dark)",
            rel: "apple-touch-icon-precomposed",
            sizes: "60x60",
            href: "/favicon/dark/apple-touch-icon-60x60.png"
        }],
        ['link', {
            media: "(prefers-color-scheme: dark)",
            rel: "apple-touch-icon-precomposed",
            sizes: "120x120",
            href: "/favicon/dark/apple-touch-icon-120x120.png"
        }],
        ['link', {
            media: "(prefers-color-scheme: dark)",
            rel: "apple-touch-icon-precomposed",
            sizes: "76x76",
            href: "/favicon/dark/apple-touch-icon-76x76.png"
        }],
        ['link', {
            media: "(prefers-color-scheme: dark)",
            rel: "apple-touch-icon-precomposed",
            sizes: "152x152",
            href: "/favicon/dark/apple-touch-icon-152x152.png"
        }],
        ['link', {
            media: "(prefers-color-scheme: dark)",
            rel: "icon",
            type: "image/png",
            href: "/favicon/dark/favicon-196x196.png",
            sizes: "196x196"
        }],
        ['link', {
            media: "(prefers-color-scheme: dark)",
            rel: "icon",
            type: "image/png",
            href: "/favicon/dark/favicon-96x96.png",
            sizes: "96x96"
        }],
        ['link', {
            media: "(prefers-color-scheme: dark)",
            rel: "icon",
            type: "image/png",
            href: "/favicon/dark/favicon-32x32.png",
            sizes: "32x32"
        }],
        ['link', {
            media: "(prefers-color-scheme: dark)",
            rel: "icon",
            type: "image/png",
            href: "/favicon/dark/favicon-16x16.png",
            sizes: "16x16"
        }],
        ['link', {
            media: "(prefers-color-scheme: dark)",
            rel: "icon",
            type: "image/png",
            href: "/favicon/dark/favicon-128.png",
            sizes: "128x128"
        }],
        ['link', {rel: "manifest", href: "/favicon/site.webmanifest"}],
        ['meta', {name: "theme-color", content: "#12141c"}],

        /* Opengraph https://ogp.me/ */
        ['meta', {property: "og:title", content: "Explore Sigma"}],
        ['meta', {
            property: "og:description",
            content: "A generic and open signature format that allows you to describe relevant log events in a straight-forward manner."
        }],
        ['meta', {property: "og:type", content: "website"}],
        ['meta', {property: "og:url", content: "https://sigmahq.io/"}],
        ['meta', {property: "og:image", content: "https://sigmahq.io/images/og_image.jpg"}],
        [
          'script',
          {
            async: true,
            src: 'https://www.googletagmanager.com/gtag/js?id=UA-288648316-1',
          },
        ],
        [
          'script',
          {},
          `window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'UA-288648316-1');`
        ]
    ],
    lastUpdated: true,
    themeConfig: {
        logo: {
            dark: '/images/logo.svg',
            light: '/images/logo_light.svg'
        },
        outline: [2, 4],
        nav: [
            {
                text: 'Documentation',
                activeMatch: '/docs/',
                link: '/docs/guide/getting-started.html'
            },
            // {
            //     text: 'Blog',
            //     activeMatch: '/blog/',
            //     link: '/blog/index.md'
            // },
            {
                text: 'Rules',
                activeMatch: '/rules/',
                link: '/rules/index.html'
            },
            {text: 'Blog', link: 'https://medium.com/sigma-hq'},
            {
                text: 'Misc',
                items: [
                    {text: 'Sigma Specification', link: 'https://github.com/SigmaHQ/sigma-specification/'},
                    {text: 'Changelog', link: 'https://github.com/SigmaHQ/sigmahq.github.io'},
                ]
            },
        ],
        sidebar: {
            '/': [
                {
                    text: 'Introduction',
                    items: [
                        // { text: 'New in v2', link: '/docs/guide/new-in-v2' },
                        {text: 'About Sigma', link: '/docs/guide/about'},
                        {text: 'Getting Started', link: '/docs/guide/getting-started'},
                        // { text: 'CLI Usage', link: '/docs/guide/usage' },
                    ]
                },
                {
                    text: 'Sigma Basics',
                    items: [
                        {text: 'Rules', link: '/docs/basics/rules'},   
                        {text: 'Modifiers', link: '/docs/basics/modifiers'},
                        {text: 'Conditions', link: '/docs/basics/conditions'},
                        // {text: 'Validation', link: '/docs/basics/validation'},
                        {text: 'Log Sources', link: '/docs/basics/log-sources'},

                    ]
                },
                // {
                //     text: 'Meta Rules',
                //     items: [
                //         { text: 'Filters',  },
                //         {text: 'Correlations', link: '/docs/digging-deeper/correlations'},
                //     ]
                // },
                {
                    text: 'Digging Deeper',
                    items: [
                        // { text: 'Structure', link: '/docs/digging-deeper/structure' },
                        {text: 'Backends', link: '/docs/digging-deeper/backends'},
                        {text: 'Pipelines', link: '/docs/digging-deeper/pipelines'},
                        {text: 'Contributing', link: '/docs/digging-deeper/contributing'},
                    ]
                },
                {
                    text: 'Backends',
                    items: [
                        {text: 'Splunk', link: 'https://github.com/SigmaHQ/pySigma-backend-splunk', rel: "_target"},
                        {text: 'InsightEDR', link: 'https://github.com/SigmaHQ/pySigma-backend-insightidr', rel: "_target"},
                        {text: 'ElasticSearch', link: 'https://github.com/SigmaHQ/pySigma-backend-elasticsearch', rel: "_target"},
                        {text: 'OpenSearch', link: 'https://github.com/SigmaHQ/pySigma-backend-opensearch', rel: "_target"},
                        {text: 'More  ›', link: '/docs/digging-deeper/backends.html'},
                    ]
                },
                {
                    text: 'Ecosystem',
                    collapsed: true,
                    items: [
                        {text: 'Sigma Main Repo', link: 'https://github.com/SigmaHQ/sigma'},
                        {text: 'pySigma', link: 'https://github.com/SigmaHQ/pySigma'},
                        {text: 'Sigma CLI', link: 'https://github.com/SigmaHQ/sigma-cli'},
                    ]
                },
                {
                    text: 'Specification',
                    collapsed: true,
                    items: [
                        {
                            text: 'Sigma',
                            link: 'https://github.com/SigmaHQ/sigma-specification/blob/main/Sigma_specification.md'
                        },
                        {
                            text: 'Sigma Tags',
                            link: 'https://github.com/SigmaHQ/sigma-specification/blob/main/Tags_specification.md'
                        },
                        {
                            text: 'Logsources & Fields',
                            link: 'https://github.com/SigmaHQ/sigma-specification/blob/main/Taxonomy_specification.md#log-sources'
                        },
                        {
                            text: 'Filename',
                            link: 'https://github.com/SigmaHQ/sigma-specification/blob/main/sigmahq/Sigmahq_filename_rule.md'
                        },
                        {
                            text: 'Rule Conventions',
                            link: 'https://github.com/SigmaHQ/sigma-specification/blob/main/sigmahq/sigmahq_conventions.md'
                        },
                    ]
                },
            ],
            '/rules/': [
                {
                    text: 'Types',
                    items: [
                        {text: 'Detection Rules', link: '/rules/detection/'},
                        {text: 'Threat Hunting Rules', link: '/rules/threat-hunting/'},
                        {text: 'Emerging Threats Rules', link: '/rules/emerging-threats/'},
                    ]
                },
                {
                    text: 'Operating System',
                    items: [
                        {text: 'Windows', link: '/rules/windows'},
                        {text: 'Linux', link: '/rules/linux'},
                        {text: 'MacOS', link: '/rules/macos'},
                    ]
                }
            ]
        },
        footer: {
            //message: 'Released under the GNU GPLv3 License.',
            copyright: 'Copyright © 2020-present SigmaHQ'
        },
        editLink: {
            pattern: 'https://github.com/SigmaHQ/sigmahq.github.io/edit/main/:path',
            text: 'Edit on GitHub'
        },
        socialLinks: [
            {icon: 'twitter', link: 'https://twitter.com/Sigma_HQ/'},
            {icon: 'github', link: 'https://github.com/SigmaHQ/sigma'},
        ],
        search: {
             provider: 'local',
        //     options: {
        //         _render(src, env, md) {
        //             const html = md.render(src, env)
        //             console.log(src)
        //             // return (env.frontmatter?.title)
        //             if (env.frontmatter?.title) {
        //                 return md.render(`# ${env.frontmatter.title}`) + html
        //             }
        //             if (env.frontmatter?.search === false) return ''
        //             if (env.relativePath.startsWith('docs/v1')) return ''
        //             return html
        //         }
        //     }
        }
    },
    markdown: {
        config: (md) => {
            // @ts-ignore
            md.use(footnote)
        }
    },
    srcExclude: [
        'README.md'
    ]
})
