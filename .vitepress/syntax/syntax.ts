import {BUNDLED_LANGUAGES} from 'shiki'

// @ts-ignore
import splunk_syntax from './splunk.tmLanguage.json'
// @ts-ignore
import sumo_syntax from './sumologic.tmLanguage.json'
// @ts-ignore
import bash_syntax from './bash.tmLanguage.json'

// @ts-ignore
BUNDLED_LANGUAGES.push({
    id: "splunk",
    scopeName: 'source.splunk',
    aliases: [],
    grammar: splunk_syntax,
})

// @ts-ignore
BUNDLED_LANGUAGES.push({
    id: "sumologic",
    scopeName: 'source.sumologic',
    aliases: [],
    grammar: sumo_syntax,
})

// @ts-ignore
BUNDLED_LANGUAGES.push({
    id: "shell",
    scopeName: 'source.shell',
    aliases: ['bash'],
    grammar: bash_syntax,
})


// @ts-ignore
BUNDLED_LANGUAGES.find(lang => lang.id === 'yaml').aliases.push('yaml-vue');

// @ts-ignore
BUNDLED_LANGUAGES.find(lang => lang.id === 'shell').aliases.push('bash-vue');

// @ts-ignore
BUNDLED_LANGUAGES.find(lang => lang.id === 'sumologic').aliases.push('sumologic-vue');

// @ts-ignore
BUNDLED_LANGUAGES.find(lang => lang.id === 'splunk').aliases.push('splunk-vue');