import ogs from "open-graph-scraper";

const urls = [
    'https://github.com/SigmaHQ/sigmahq.github.io/',
    'https://www.nextron-systems.com/2023/03/13/private-sigma-rule-feed-in-valhalla-and-partnership-with-soc-prime/',
    'https://www.nextron-systems.com/2023/03/24/demystifying-sigma-log-sources/',
    'https://micahbabinski.medium.com/creating-a-sigma-backend-for-fun-and-no-profit-ed16d20da142'

]

async function fetch_og_data(url) {
    let result = (await ogs({url})).result

    if(result?.ogImage[0]?.url?.startsWith('/')) {
        let hostname = new URL(result.requestUrl)?.hostname
        let path = result?.ogImage?.url
        result.ogImage.url = new URL('https://'+hostname+path)?.href
    }

    return result
}

export default {
    async load() {
        return {
            posts: await Promise.all(urls.slice(0,4).map(await (url => fetch_og_data(url))))
        }
    }
}