/*
Language: SPL
Author: Wei Su <swsoyee@gmail.com>
Description: language definition for Splunk search processing language (SPL)
Category: enterprise
*/

// === Start ===
// Functions from highlight.js/lib/regex.js
// Source: https://github.com/highlightjs/highlight.js/blob/main/src/lib/regex.js
/**
 * @param {RegExp | string } re
 * @returns {string}
 */
function source(re) {
    if (!re) return null;
    if (typeof re === "string") return re;

    return re.source;
}

/**
 * @param {...(RegExp | string) } args
 * @returns {string}
 */
function concat(...args) {
    const joined = args.map((x) => source(x)).join("");
    return joined;
}

/**
 * Any of the passed expresssions may match
 *
 * Creates a huge this | this | that | that match
 * @param {(RegExp | string)[] } args
 * @returns {string}
 */
function either(...args) {
    const joined = '(' + args.map((x) => source(x)).join("|") + ")";
    return joined;
}
// === End ===

/** @type LanguageFn */
export default function(hljs) {
    const HASH_COMMENT_MODE = hljs.COMMENT('```', '```');

    // List of evaluation functions from Splunk Enterprise 8.1.3 - Alphabetical list of functions
    // https://docs.splunk.com/Documentation/Splunk/8.1.3/SearchReference/CommonEvalFunctions#Alphabetical_list_of_functions
    const EVAL_FUNCTIONS = [
        "abs",
        "acos",
        "acosh",
        "asin",
        "asinh",
        "atan",
        "atan2",
        "atanh",
        "case",
        "cidrmatch",
        "ceiling",
        "coalesce",
        "commands",
        "cos",
        "cosh",
        "exact",
        "exp",
        "false",
        "floor",
        "hypot",
        "if",
        "in",
        "isbool",
        "isint",
        "isnotnull",
        "isnull",
        "isnum",
        "isstr",
        "json_object",
        "json_array",
        "json_extract",
        "json_keys",
        "json_set",
        "json_valid",
        "len",
        "like",
        "log",
        "lookup",
        "ln",
        "lower",
        "ltrim",
        "match",
        "max",
        "md5",
        "min",
        "mvappend",
        "mvcount",
        "mvdedup",
        "mvfilter",
        "mvfind",
        "mvindex",
        "mvjoin",
        "mvmap",
        "mvrange",
        "mvsort",
        "mvzip",
        "now",
        "null",
        "nullif",
        "pi",
        "pow",
        "printf",
        "random",
        "relative_time",
        "replace",
        "round",
        "rtrim",
        "searchmatch",
        "sha1",
        "sha256",
        "sha512",
        "sigfig",
        "sin",
        "sinh",
        "spath",
        "split",
        "sqrt",
        "strftime",
        "strptime",
        "substr",
        "tan",
        "tanh",
        "time",
        "tonumber",
        "tostring",
        "trim",
        "true",
        "typeof",
        "upper",
        "urldecode",
        "validate"
    ];

    // List of statistical and charting functions from Splunk Enterprise 8.1.3 - Alphabetical list of functions
    // https://docs.splunk.com/Documentation/Splunk/8.1.3/SearchReference/CommonEvalFunctions#Alphabetical_list_of_functions
    const TRANSFORMING_FUNCTIONS = [
        "avg",
        "count",
        "distinct_count",
        "earliest",
        "earliest_time",
        "estdc",
        "estdc_error",
        "first",
        "last",
        "latest",
        "latest_time",
        "list",
        "max",
        "mean",
        "median",
        "min",
        "mode",
        "percentile",
        "per_day",
        "per_hour",
        "per_minute",
        "per_second",
        "range",
        "rate",
        "rate_avg",
        "rate_sum",
        "stdev",
        "stdevp",
        "sum",
        "sumsq",
        "values",
        "var",
        "varp"
    ];

    const FUNCTIONS = [
        ...EVAL_FUNCTIONS,
        ...TRANSFORMING_FUNCTIONS
    ];

    const FUNCTION_CALL = {
        className: 'function',
        begin: concat(/\b/, either(...FUNCTIONS), /\s*\(/),
        keywords: {
            keyword: FUNCTIONS
        }
    };

    // List of search command from Splunk Enterprise 8.1.3 - Search Commands
    // https://docs.splunk.com/Documentation/Splunk/8.1.3/SearchReference/WhatsInThisManual
    const BUILT_IN = [
        "abstract",
        "accum",
        "addcoltotals",
        "addinfo",
        "addtotals",
        "analyzefields",
        "anomalies",
        "anomalousvalue",
        "anomalydetection",
        "append",
        "appendcols",
        "appendpipe",
        "arules",
        "associate",
        "audit",
        "autoregress",
        "awssnsalert",
        "bin",
        "bucket",
        "bucketdir",
        "cefout",
        "chart",
        "cluster",
        "cofilter",
        "collect",
        "concurrency",
        "contingency",
        "convert",
        "correlate",
        "ctable",
        "datamodel",
        "datamodelsimple",
        "dbinspect",
        "dbxquery",
        "dedup",
        "delete",
        "delta",
        "diff",
        "entitymerge",
        "erex",
        "eval",
        "eventcount",
        "eventstats",
        "extract",
        "fieldformat",
        "fields",
        "fieldsummary",
        "filldown",
        "fillnull",
        "findtypes",
        "folderize",
        "foreach",
        "format",
        "from",
        "gauge",
        "gentimes",
        "geom",
        "geomfilter",
        "geostats",
        "head",
        "highlight",
        "history",
        "iconify",
        "inputcsv",
        "inputintelligence",
        "inputlookup",
        "iplocation",
        "join",
        "kmeans",
        "kvform",
        "loadjob",
        "localize",
        "localop",
        "lookup",
        "makecontinuous",
        "makemv",
        "makeresults",
        "map",
        "mcollect",
        "metadata",
        "metasearch",
        "meventcollect",
        "mpreview",
        "msearch",
        "mstats",
        "multikv",
        "multisearch",
        "mvcombine",
        "mvexpand",
        "nomv",
        "outlier",
        "outputcsv",
        "outputlookup",
        "outputtext",
        "overlap",
        "pivot",
        "predict",
        "rangemap",
        "rare",
        "redistribute",
        "regex",
        "relevancy",
        "reltime",
        "rename",
        "replace",
        "require",
        "rest",
        "return",
        "reverse",
        "rex",
        "rtorder",
        "run",
        "savedsearch",
        "script",
        "scrub",
        "search",
        "searchtxn",
        "selfjoin",
        "sendemail",
        "set",
        "setfields",
        "sichart",
        "sirare",
        "sistats",
        "sitimechart",
        "sitop",
        "snowincident",
        "snowincidentstream",
        "snowevent",
        "snoweventstream",
        "sort",
        "spath",
        "stats",
        "strcat",
        "streamstats",
        "table",
        "tags",
        "tail",
        "timechart",
        "timewrap",
        "top",
        "transaction",
        "transpose",
        "trendline",
        "tscollect",
        "tstats",
        "typeahead",
        "typelearner",
        "typer",
        "union",
        "uniq",
        "untable",
        "walklex",
        "where",
        "x11",
        "xmlkv",
        "xmlunescape",
        "xpath",
        "xsDisplayConcept",
        "xsDisplayContext",
        "xsFindBestConcept",
        "xsListConcepts",
        "xsListContexts",
        "xsUpdateDDContext",
        "xsWhere",
        "xyseries"
    ];

    const LITERALS = [
        "NOT",
        "true",
        "false"
    ];

    const KEYWORDS = [
        "as",
        "by",
        "or",
        "and",
        "over",
        "where",
        "output",
        "outputnew"
    ];

    const OPERATOR = {
        className: "operator",
        match: /\|/
    };

    const QUOTE_STRING = {
        className: 'string',
        begin: /"/,
        end: /"/,
        contains: [ hljs.BACKSLASH_ESCAPE ]
    };

    return {
        name: 'SPL',
        aliases: [
            'spl',
            'splunk'
        ],
        case_insensitive: true,
        keywords: {
            $pattern: /\b[\w\.]+\b/,
            keyword: KEYWORDS,
            built_in: BUILT_IN,
            literal: LITERALS
        },
        contains: [
            HASH_COMMENT_MODE,
            hljs.NUMBER_MODE,
            OPERATOR,
            FUNCTION_CALL,
            QUOTE_STRING
        ],
        illegal: /[{}]|<\//
    };
}