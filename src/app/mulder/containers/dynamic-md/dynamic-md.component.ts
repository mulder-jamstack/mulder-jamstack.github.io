import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
    AfterViewChecked,
    AfterViewInit,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    Renderer2,
    ViewChild,
} from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { DynamicRoute } from "@app/navigation/models";
import yaml from "js-yaml";
import {marked} from "marked";
import prism from "prismjs";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-css";
import "prismjs/components/prism-java";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-markup";

import * as _posts from "../../../../dynamicRoutes.json";
// import 'prismjs/components/prism-visualbasic';

// loadLanguages(['javascript', 'java', 'visualbasic', 'jsx', 'css', 'markup', 'bash', 'json']);

marked.setOptions({
    highlight(code, lang) {
        if (prism.languages[lang]) {
            return prism.highlight(code, prism.languages[lang], lang);
        } else {
            return code;
        }
    },
    pedantic: false,
    gfm: true,
    headerIds: true,
    breaks: false,
    mangle: true,
    sanitize: false,
    smartLists: true,
    smartypants: true,
    xhtml: true,
});

@Component({
    selector: "mulder-dynamic-md",
    templateUrl: "./dynamic-md.component.html",
    styleUrls: ["./dynamic-md.component.scss"],
})
export class DynamicMdComponent
    implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {
    @ViewChild("content")
    content!: ElementRef;
    posts!: DynamicRoute[];
    title!: string;
    subTitle!: string;
    meta!: string[];
    siteHeading = true;
    backgroundImage!: string;

    post!: any;
    defaultBackground = 'url("assets/img/home-bg.jpg")';
    mdContent: any;
    private httpOptions = {
        headers: new HttpHeaders({
            Accept: "text/html, application/xhtml+xml, */*",
        }),
        responseType: "text" as "json",
    };

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private http: HttpClient,
        private sanitized: DomSanitizer,
        private renderer: Renderer2
    ) {}

    public removeEventListener: (() => void) | undefined;
    public anchors!: any[];
    ngOnInit(): void {
        this.posts = (_posts as any).default as DynamicRoute[];

        this.activatedRoute.url.subscribe((f) => {
            const selectedPost = this.posts.filter(
                (p) => p.path === "/" + f.join("/")
            );
            if (selectedPost.length > 0) {
                this.post = selectedPost[0];
            }
            if (this?.post?.mdsource != null) {
                this.http
                    .get(this.post.mdsource + "/download", this.httpOptions)
                    .subscribe((r) => {
                        let res = r as string;
                        let res1 = "";
                        if (res.startsWith("---")) {
                            const lines = res.split("\n");
                            lines.shift();
                            for (const line of lines) {
                                if (line.startsWith("---")) {
                                    break;
                                }
                                res1 = res1 + line + "\n";
                            }
                            res = res.replace("---\n" + res1 + "---\n", "");
                            const metadata = yaml.load(res1);
                            this.title = (metadata as any)?.title;
                            this.subTitle = (metadata as any)?.subTitle;
                            this.meta = (metadata as any)?.meta;
                            if ((metadata as any)?.siteHeading !== undefined) {
                                this.siteHeading = (metadata as any)?.siteHeading;
                            }

                            this.backgroundImage = (metadata as any)?.backgroundImage;
                        } else {
                            this.title = this?.post?.title;
                            this.subTitle = this?.post?.subTitle;
                            this.meta = this?.post?.meta;
                            if (this?.post?.siteHeading !== undefined) {
                                this.siteHeading = this?.post?.siteHeading;
                            }
                            this.backgroundImage = this?.post?.backgroundImage;
                        }

                        const parser = new DOMParser();
                        const doc = parser.parseFromString(
                            marked(res as string),
                            "text/html"
                        );
                        const tocInsertPointSelector = "#toc";
                        const insertPoint = doc.querySelector(
                            tocInsertPointSelector
                        );
                        // in case <div id="toc"></div> is not on the site
                        if (insertPoint) {
                            /**
                             * get headings for toc generation
                             */
                            const levels =
                                this.post && this.post.tocselector
                                    ? this.post.tocselector
                                    : ["h2", "h3"];

                            const selector = levels.join(", ");

                            let headers = Array.from(
                                doc.querySelectorAll(selector)
                            );
                            const queryroot =
                                this.post && this.post.tocrootselector
                                    ? doc.querySelector(
                                          this.post.tocrootselector
                                      )
                                    : null;
                            let indexheadertostart = -1;
                            for (const [index, h] of headers.entries()) {
                                if (h === queryroot) {
                                    indexheadertostart = index;
                                    break;
                                }
                            }
                            if (indexheadertostart > 0) {
                                headers = headers.splice(indexheadertostart);
                            }

                            /**
                             * build nested ul, li list
                             */
                            let previousTag: number | null;
                            let toc = "";
                            headers.forEach((c: any) => {
                                const level = this.headingLevel(c.tagName);
                                const route = window.location.origin;
                                const trailingSlash = "/";

                                const baseLiEl = `<li><a href="${route}${trailingSlash}#${c.id}">${c.textContent}</a></li>`;
                                if (
                                    previousTag &&
                                    level &&
                                    level > previousTag
                                ) {
                                    toc += '<ul style="margin-bottom: 0px">';
                                }
                                if (
                                    previousTag &&
                                    level &&
                                    level < previousTag
                                ) {
                                    for (
                                        let j = 0;
                                        j < previousTag - level;
                                        j++
                                    ) {
                                        toc += "</ul>";
                                    }
                                }
                                toc += baseLiEl;
                                previousTag = level;
                            });

                            /**
                             * append toc as child
                             */
                            const plantitle = doc.createElement("h2");
                            plantitle.textContent =
                                this.post && this.post.toctitle
                                    ? this.post.toctitle
                                    : "Plan";
                            const list = doc.createElement("ul");
                            list.innerHTML = toc;
                            insertPoint?.appendChild(plantitle);
                            insertPoint?.appendChild(list);
                        }
                        this.mdContent = this.sanitized.bypassSecurityTrustHtml(
                            doc.body.innerHTML
                        );
                    });
            }
        });
    }

    public ngAfterViewInit() {}

    public ngOnDestroy() {
        // Cleanup by removing the event listeners on destroy
        this.anchors.forEach((anchor: HTMLAnchorElement) => {
            anchor.removeEventListener("click", this.handleAnchorClick);
        });
    }

    public handleAnchorClick = (event: Event) => {
        // Prevent opening anchors the default way
        event.preventDefault();
        const anchor = event.target as HTMLAnchorElement;
        const el = this.content.nativeElement.querySelector(
            decodeURI(anchor.href)
                .replace(window.location.origin + "/", "")
                .toLowerCase()
        );
        el?.scrollIntoView();
        // alert(`You are trying to navigate to ${anchor.href}`);
    };
    ngAfterViewChecked(): void {
        // Solution for catching click events on anchors using querySelectorAll:
        this.anchors = this.content.nativeElement.querySelectorAll("a");
        this.anchors.forEach((anchor: HTMLAnchorElement) => {
            if (anchor.href.startsWith(window.location.origin + "/#"))
                anchor.addEventListener("click", this.handleAnchorClick);
        });
    }
    headingLevel(tag: string): number | null {
        const match = tag.match(/(?!h)[123456]/g);
        return match && match.length ? Number(match[0]) : null;
    }
}
