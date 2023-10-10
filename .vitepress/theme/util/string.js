export const titleCase = (s) => s.replaceAll('-', ' ').replaceAll('_', ' ').split(' ').map((s) => {
    /**
     * Manual Replacements
     */
    if(s.toLowerCase() === 'carbonblack') { return 'CarbonBlack'}
    if(s.toLowerCase() === 'cortexxdr') { return 'CortexXDR'}
    if(s.toLowerCase() === 'ibm') { return 'IBM'}
    if(s.toLowerCase() === 'aql') { return 'AQL'}
    if(s.toLowerCase() === 'sentinelone') { return 'SentinelOne'}
    if(s.toLowerCase() === 'pq') { return 'PowerQuery'}
    if(s.toLowerCase() === 'insightidr') { return 'InsightIDR'}
    if(s.toLowerCase() === 'qradar') { return 'QRadar'}
    if(s.toLowerCase() === 'opensearch') { return 'OpenSearch'}
    if(s.toLowerCase() === 'ala') { return 'Azure Log Analytics'}
    if(s.toLowerCase() === 'crowdstrike') { return 'CrowdStrike'}
    if(s.toLowerCase() === 'ossem') { return 'OSSEM'}
    if(s.toLowerCase() === 'microsoft365defender') { return 'Microsoft 365 Defender'}
    if(s.toLowerCase() === 'powershell') { return 'PowerShell'}

    let letterToCapitalize = s.match(/\w/)[0];
    return s.replace(letterToCapitalize, letterToCapitalize.toUpperCase())
}).join(' ')

export const truncate = (str, max = 10) => {
    const array = str.trim().split(' ');
    const ellipsis = array.length > max ? '...' : '';

    return array.slice(0, max).join(' ') + ellipsis;
};