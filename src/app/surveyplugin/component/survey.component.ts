import { HttpClient } from "@angular/common/http";
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from "@angular/core";
import {marked} from "marked";
import prism from "prismjs";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-css";
import "prismjs/components/prism-java";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-markup";
import * as Survey from "survey-angular";
import * as SurveyCore from "survey-core";
import * as SurveyPDF from "survey-pdf";
import * as widgets from "surveyjs-widgets";

// import 'prismjs/components/prism-visualbasic';
import { Text } from "../quizzdsl/model";

import { init as initCustomWidget } from "./customwidget";
import * as photocapture from "./photocapturewidget";
import * as uml from "./umlwidget";

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
    gfm: false,
    headerIds: true,
    breaks: false,
    mangle: true,
    sanitize: false,
    smartLists: false,
    smartypants: false,
    xhtml: false,
});

widgets.icheck(Survey);
widgets.select2(Survey);
widgets.inputmask(Survey);
widgets.jquerybarrating(Survey);
widgets.jqueryuidatepicker(Survey);
widgets.nouislider(Survey);
widgets.select2tagbox(Survey);
// widgets.signaturepad(Survey);
widgets.sortablejs(Survey);
widgets.ckeditor(Survey);
widgets.autocomplete(Survey);
widgets.bootstrapslider(Survey);
widgets.prettycheckbox(Survey);
// widgets.emotionsratings(Survey);
initCustomWidget(Survey);

widgets.icheck(SurveyCore);
widgets.select2(SurveyCore);
widgets.inputmask(SurveyCore);
widgets.jquerybarrating(SurveyCore);
widgets.jqueryuidatepicker(SurveyCore);
widgets.nouislider(SurveyCore);
widgets.select2tagbox(SurveyCore);
// widgets.signaturepad(SurveyCore);
widgets.sortablejs(SurveyCore);
widgets.ckeditor(SurveyCore);
widgets.autocomplete(SurveyCore);
widgets.bootstrapslider(SurveyCore);
widgets.prettycheckbox(SurveyCore);

photocapture.default(Survey);
uml.default(Survey, (window as any).$);

Survey.JsonObject.metaData.addProperty("questionbase", "popupdescription:text");
Survey.JsonObject.metaData.addProperty("page", "popupdescription:text");

Survey.StylesManager.applyTheme("bootstrapmaterial");

@Component({
    // tslint:disable-next-line:component-selector
    selector: "survey",
    template: `<div class="survey-container contentcontainer codecontainer">
        <div id="surveyElement"></div>
    </div>`,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class SurveyComponent implements OnInit, OnChanges {
    @Output() submitSurvey = new EventEmitter<any>();
    @Output() submitFinalSurvey = new EventEmitter<any>();
    @Input()
    @Input()
    get json(): any {
        return this._json;
    }
    set json(json: any) {
        this._json = json;
    }

    _json!: object;
    result: any;
    constructor(private http: HttpClient) {}
    ngOnChanges(changes: SimpleChanges): void {
        this.initFromJSON();
    }

    ngOnInit() {
        this.initFromJSON();
    }

    initFromJSON() {
        const surveyModel = new Survey.Model();
        surveyModel.onTextMarkdown.add((survey:any, options:any) => {
            // convert the mardown text to html
            // console.log(options);

            let str = marked(options.text) as string;
            // remove root paragraphs <p></p>
            options.str = str;
            if (!str.startsWith("<p>")) {
            } else {
                str = str.substring(3);
                if (str.substring(str.length - 4, str.length) === "</p>") {
                    str = str.substring(0, str.length - 4);
                } else if (
                    str.substring(str.length - 5, str.length - 1) === "</p>"
                ) {
                    str = str.substring(0, str.length - 5);
                }
            }
            // set html*/
            options.html = str;
        });

        surveyModel.onAfterRenderQuestion.add((survey:any, options:any) => {
            if (!options.question.popupdescription) {
                return;
            }
            // Add a button;
            const btn = document.createElement("button");
            btn.className = "btn btn-info btn-xs";
            btn.innerHTML = "More Info";
            btn.onclick = () => {
                // showDescription(question);
                alert(options.question.popupdescription);
            };
            const header = options.htmlElement.querySelector("h5");
            const span = document.createElement("span");
            span.innerHTML = "  ";
            header.appendChild(span);
            header.appendChild(btn);
        });
        surveyModel.onComplete.add((result:any, options:any) => {
            this.submitFinalSurvey.emit(result.data);
            this.result = result.data;
        });
        surveyModel.onCurrentPageChanged.add((result:any, options:any) => {
            this.submitSurvey.emit(result.data);
            this.result = result.data;
        });
        // Survey.SurveyNG.locale="fr";
        surveyModel.fromJSON(this.json);
        Survey.SurveyNG.render("surveyElement", { model: surveyModel });
    }
    savePDF() {
        const options = {
            fontSize: 14,
            margins: {
                left: 10,
                right: 10,
                top: 10,
                bot: 10,
            },
        };
        const surveyPDF = new SurveyPDF.SurveyPDF(this.json, options);
        surveyPDF.data = this.result;
        surveyPDF.save("survey PDF example");
    }
}
