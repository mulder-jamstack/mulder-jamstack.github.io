

import {
    HandledRoute,
    logWarn,
    registerPlugin,
    routeSplit,
    ScullyConfig,
    setPluginConfig,
} from "@scullyio/scully";
import '@scullyio/scully-plugin-puppeteer';
import '@k9n/scully-plugin-toc';

import 'prismjs/components/prism-java.js';
import 'prismjs/components/prism-visual-basic.js';
import 'prismjs/components/prism-yaml.js';
import 'prismjs/components/prism-bash.js';
import 'prismjs/components/prism-md.js';
import 'prismjs/components/prism-grammar.js';
import {
    TocConfig,
    TocPluginName,
  } from  '@k9n/scully-plugin-toc';

const _posts = require("./src/dynamicRoutes.json");

function dynamicMDRoutingPlugin(
    route?: string,
    _config = {}
): Promise<HandledRoute[]> {
    const { createPath } = routeSplit(route as string);
    const l: HandledRoute[] = [];
    _posts
        .filter((el: any) => {
            const r = el.path?.split("/");
            const r1 = r?.splice(2);
            const computedroute = createPath(...(r1 as string[]));
            return computedroute === el.path;
        })
        .forEach((el: any) => {
            l.push({
                route: el.path
            });
        });
        logWarn(l);
    return Promise.resolve(l);
}
const validator = async (_conf: any) => [];
registerPlugin("router", "dynamicMD", dynamicMDRoutingPlugin, validator);
setPluginConfig("md", { enableSyntaxHighlighting: true });

const tocOptions: TocConfig = {
    blogAreaSelector: "#blog-content", // where to search for TOC headings
    insertSelector: "#toc", // where to insert the TOC
    level: ["h1", "h2", "h3", "h4"], // what heading levels to include
    trailingSlash: true, // add trailing slash before the anker ('#')
    scrollIntoViewOnClick: true, // add event to each link that scrolls into view on click:
    // onclick="document.getElementById('target-id').scrollIntoView()"
};
setPluginConfig(TocPluginName, tocOptions);

export const config: ScullyConfig = {
    projectRoot: "./src",
    projectName: "mulder",
    outDir: "./dist/static",
    routes: {
        // tslint:disable-next-line:prettier
        '/d/:cat/:slug': {
            type: "dynamicMD",
        },
        // tslint:disable-next-line:prettier
        '/s/:slug': {
            type: "contentFolder",
            postRenderers: ["toc"],
            slug: {
                folder: "./content/static",
            },
        },
        "/blog/:slug": {
            type: "contentFolder",
            postRenderers: ["toc"],
            slug: {
                folder: "./content/blog",
            },
        },
    },
};
