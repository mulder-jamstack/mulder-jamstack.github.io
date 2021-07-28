import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
} from "@angular/core";
import { SuerveyJSPrinter } from "@app/surveyplugin/quizzdsl/prettyprinter";
import yaml from "js-yaml";

@Component({
    selector: "mulder-surveydemo",
    templateUrl: "./surveydemo.component.html",
    styleUrls: ["surveydemo.component.scss"],
})
export class SurveyDemoComponent implements OnInit, OnDestroy {
    json: any = {};
    private titre!: string;
    private showphotocapture = false;
    private consigne!: string;
    private tmpsenseconde: number;
    private questionsOrder!: string;
    private choicesOrder!: string;
    private pageOrder!: string;
    private completedhtml!: string;
    private startSurveyText!: string;
    private locale!: string;
    private urlendpoint?: string;
    private urlendpointcontentType!: string;

    private httpOptions = {
        headers: new HttpHeaders({
            Accept: "text/html, application/xhtml+xml, */*",
        }),
        responseType: "text" as "json",
    };

    constructor(private http: HttpClient) {
        this.titre = "Exam 2020";
        this.consigne = "Demo of what you have to do";
        this.tmpsenseconde = 0;
        this.questionsOrder = "none"; // "random";
        this.choicesOrder = "none";
        this.pageOrder = "none";
        this.completedhtml = "<p><h4>Thanks for completing this form</h4></p>";
        this.startSurveyText = "Start Survey";
        this.locale = "en";
        this.urlendpointcontentType = "application/json";
    }

    // canbesaved = true;

    shuffleArray(array: Array<any>) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    ngOnInit(): void {
        this.http
            .get(
                "https://raw.githubusercontent.com/mulder-jamstack/mulder-jamstack.github.io/src/content/survey/demo.md",
                this.httpOptions
            )
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
                    if ((metadata as any)?.titre !== undefined) {
                        this.titre = (metadata as any)?.titre;
                    }
                    if ((metadata as any)?.showphotocapture !== undefined) {
                        this.showphotocapture = (metadata as any)?.showphotocapture;
                    }
                    if ((metadata as any)?.consigne !== undefined) {
                        this.consigne = (metadata as any)?.consigne;
                    }
                    if ((metadata as any)?.tmpsenseconde !== undefined) {
                        this.tmpsenseconde = (metadata as any)?.tmpsenseconde;
                    }
                    if ((metadata as any)?.questionsOrder !== undefined) {
                        this.questionsOrder = (metadata as any)?.questionsOrder;
                    }
                    if ((metadata as any)?.choicesOrder !== undefined) {
                        this.choicesOrder = (metadata as any)?.choicesOrder;
                    }
                    if ((metadata as any)?.pageOrder !== undefined) {
                        this.pageOrder = (metadata as any)?.pageOrder;
                    }
                    if ((metadata as any)?.completedhtml !== undefined) {
                        this.completedhtml = (metadata as any)?.completedhtml;
                    }
                    if ((metadata as any)?.startSurveyText !== undefined) {
                        this.startSurveyText = (metadata as any)?.startSurveyText;
                    }
                    if ((metadata as any)?.locale !== undefined) {
                        this.locale = (metadata as any)?.locale;
                    }
                    if ((metadata as any)?.urlendpoint !== undefined) {
                        this.urlendpoint = (metadata as any)?.urlendpoint;
                    }
                    if (
                        (metadata as any)?.urlendpointcontentType !== undefined
                    ) {
                        this.urlendpointcontentType = (metadata as any)?.urlendpointcontentType;
                    }

                    const p = new SuerveyJSPrinter(
                        this.titre,
                        this.showphotocapture,
                        this.consigne,
                        this.tmpsenseconde,
                        this.questionsOrder,
                        this.choicesOrder,
                        this.completedhtml,
                        this.startSurveyText,
                        this.locale
                    );

                    const s1 = p.print(res as string);

                    // tslint:disable-next-line:no-eval
                    const s = JSON.parse(eval(s1));

                    // Random pages
                    if (this.pageOrder === "random") {
                        const init = s.pages.shift();
                        this.shuffleArray(s.pages);
                        s.pages = [init, ...s.pages];
                    }
                    this.json = s;
                }
            });
    }

    sendData(result: any) {}

    sendFinalData(result: any) {
        if (this.urlendpoint !== undefined) {
            const options = {
                headers: new HttpHeaders().set(
                    "Content-Type",
                    this.urlendpointcontentType
                ),
            };
            this.http.post(this.urlendpoint, result, options).subscribe(
                (res: any) => {
                    console.log(res);
                },
                (err: any) => {
                    console.log(err);
                }
            );
        }
    }

    ngOnDestroy() {}
}
