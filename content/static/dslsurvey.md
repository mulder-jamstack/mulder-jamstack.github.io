---
published: true
title: DSL1, a domain-specific markup syntax for surveyjs
slug: dslsurvey
backgroundImage: 'url(assets/img/florian-olivo-4hbJ-eymZ1o-unsplash.jpg)'
---

## Scenario

There are many closed-source services for making online questionnaires with no or little code. For open-source solutions, the industry standard is [LimeSurvey](https://www.limesurvey.org/). Getting started with a simple questionnaire is rather quick, but you still need hosting for LimeSurvey. If you are a data scientist, you are unlikely to want to play with the administration of a large system just to collect the necessary data.
However, it is possible to use simple static applications and free tools for this purpose.

[SurveyJS Library](https://github.com/surveyjs/survey-library) is an open-source library for building fully customizable surveys, forms and quizzes. It facilitates integrating surveys into websites or web applications.

The best thing about this library is that you can design a questionnaire in JavaScript, create its logic and other features and integrate it with your website nearly seamless.
Another advantage is it has versions for several popular JavaScript Frameworks, like Angular, jQuery, Knockout, React and Vue.js.

## Creating a survey (the need for a domain-specific markup language)

In the beginning, you could use online [SurveyJS Creator](https://surveyjs.io/create-survey). You can use it on their website for free (only integrating it with your website needs payment).

SurveyJS Creator is a *no code* tool for building your surveys. It is convenient and allows you to generate a json descriptor file used to set up the survey and configure its behaviour. In practice, users often write the json file directly by hand. The json structure becomes a de facto DSL for survey construction. SurveyJS is also extensible allowing to define own widgets easily. It also offers the possibility of directly editing html elements in the json file to obtain a look and feel adapted to these needs. It is therefore natural to want to benefit from a language derived from markdown to define your own surveys.


The syntax could look like :

```md
# (c) Dans une architecture REST, Si l’on utilise JAXRS, modifiez une données côté serveur sur l’appel d’un GET crée
- [ ] une erreur de compilation
- [ ] un warning
- [ ] rien du tout
- [ ] cela dépend des types de modifications effectuées en base

----

# (c)
\`\`\`java
// MyData est une simple classe Java de données (POJO avec getter et setter)
@GET
@Path("/")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_XML)
public List<TODOListItem> getTodoByD(Mydata d) {
    ...
}
\`\`\`

Le code ci dessus est:
- [ ] Valide
- [ ] Invalide car le @GET devrait être un @POST ou un @PUT
- [ ] Invalide car le service devrait renvoyait du json MediaType.APPLICATION_JSON
- [ ] invalide car le nom de la méthode ne devrait pas commencer par get

----

# (ck)
Test ck
- [ ] reponse

----

# (r)

Sélectionnez le nom de classe de contrôle de formulaire correct, défini sur true via [(ngModel)] chaque fois que la valeur est modifiée.

- [ ] .ng-invalid
- [ ] .ng-pending
- [ ] .ng-pristine
- [ ] .ng-dirty

```

The advantages of this markdown extension could be the following:

- It remains compatible with markdown preview tools, 
- It allows for the inclusion of code snippets,
- it provides a set of guidelines within markdown for the different types of questions. 

Now let's create the grammar associated with this language. We will use xtext because it has the advantage of generating an LSP server skeleton that allows us to easily include this language in eclipse, intelliJ, vscode or monaco if we wish to offer an online editor for future users of this DSL. 

Below is an extract of this grammar (*to be consolidated*) 

```bnf

grammar org.xtext.example.markdown.Markdown with org.eclipse.xtext.common.Terminals

generate markdown "http://www.xtext.org/example/markdown/Markdown"

Markdown:
    content+=Question*
;

Question:
    entity=(Text
    | Radio
    | Dropdown
    | Checkboxes
    | ImagePicker
    | BooleanEntry
    | SignaturePad
    | Multipletext
    | Rating
    | StaticImage
    | Html
    | File
    | Datepicker
    | Barrating
    | SortableJS
    | Nouislider
    | IPaddress
    | Email
    | CKEditor
    | EmotionsRatings
    | UML)
     (QuestionSeparator | PageSeparator)
;

Text:
    entity=(' # (t) '  ) QuestionContent
;

...

QuestionContent:
    entity=(title=TextOrCode response+=QuestionItem+)
    
QuestionItem:
'[ ] ' value=TextOrCode
;


TextOrCode:
    entity=(TextBlock|CodeBlock)
    NEWLINE
;

TextBlock:
	text += (PlainText|Italic|Bold)+
;

PlainText:
	value = TEXT
;

CodeBlock:
	('\`\`\`' value +=(PlainText)+ '\`\`\`')
;

Italic:
	('*' value +=(PlainText|Bold)+ '*')|('_' value +=(PlainText|Bold)+ '_')
;

Bold:
	('**' value += (PlainText|Italic)+'**') | ('__' value +=(PlainText|Italic)+ '__')
;

ListItem:
('* ' value=TextBlock) | ('- ' value=TextBlock)) 
;


terminal TEXT:
	('a'..'å' | 'A'..'Å')(ID|WS)+
;

terminal WS:
    (' ' | '\t')+
;

terminal NEWLINE:
    '\r'? '\n'
;

terminal QuestionSeparator:
    '----\n'
;

terminal PageSeparator:
    '---\n'
;

terminal ID: ('a'..'å'|'A'..'Å') ('a'..'å'|'A'..'Å'|'0'..'9'|'!'|'?')*;
```

In parallel, I have built by hand the AST in TS and the combinatorial parser for this textual syntax. A generator is underway so that these two artefacts can be generated from the definition of the xtext grammar. 

Below is an extract of the AST in TypeScript. 

```ts
export class Text {
    type = "Text" as const;
    constructor(public desc: string) {}
}
export class Radio {
    type = "Radio" as const;
    constructor(public desc: string) {}
}
export class Dropdown {
    type = "Dropdown" as const;
    constructor(public desc: string) {}
}
export class Checkboxes {
    type = "Checkboxes" as const;
    constructor(public desc: string) {}
}
export class ImagePicker {
    type = "ImagePicker" as const;
    constructor(public desc: string) {}
}
export class BooleanEntry {
    type = "BooleanEntry" as const;
    constructor(public desc: string) {}
}
export class SignaturePad {
    type = "SignaturePad" as const;
    constructor(public desc: string) {}
}
export class Multipletext {
    type = "Multipletext" as const;
    constructor(public desc: string) {}
}
export class Rating {
    type = "Rating" as const;
    constructor(public desc: string) {}
}
export class StaticImage {
    type = "StaticImage" as const;
    constructor(public desc: string) {}
}
export class Html {
    type = "Html" as const;
    constructor(public desc: string) {}
}
export class File {
    type = "File" as const;
    constructor(public desc: string) {}
}
export class Datepicker {
    type = "Datepicker" as const;
    constructor(public desc: string) {}
}
export class Barrating {
    type = "Barrating" as const;
    constructor(public desc: string) {}
}
export class SortableJS {
    type = "SortableJS" as const;
    constructor(public desc: string) {}
}
export class Nouislider {
    type = "Nouislider" as const;
    constructor(public desc: string) {}
}
export class IPaddress {
    type = "IPaddress" as const;
    constructor(public desc: string) {}
}
export class Email {
    type = "Email" as const;
    constructor(public desc: string) {}
}
export class CKEditor {
    type = "CKEditor" as const;
    constructor(public desc: string) {}
}
export class EmotionsRatings {
    type = "EmotionsRatings" as const;
    constructor(public desc: string) {}
}
export class UML {
    type = "UML" as const;
    constructor(public desc: string) {}
}

export class Question {
    type = "Question" as const;
    constructor(public desc: string, public last: boolean) {}
}
export class QuestionSeparator {
    type = "QuestionSeparator" as const;
    constructor() {}
}
export class PageSeparator {
    type = "PageSeparator" as const;
    constructor() {}
}

export type Sentence =
    | Text
    | Radio
    | Dropdown
    | Checkboxes
    | ImagePicker
    | BooleanEntry
    | SignaturePad
    | Multipletext
    | Rating
    | StaticImage
    | Html
    | File
    | Datepicker
    | Barrating
    | SortableJS
    | Nouislider
    | IPaddress
    | Email
    | CKEditor
    | EmotionsRatings
    | UML
    | Question
    | QuestionSeparator
    | PageSeparator;

// Pattern matching on model (this part is generic to any AST)

export type SentenceType = Sentence["type"];
export type SentenceMap<U> = {
    [K in SentenceType]: U extends { type: K } ? U : never;
};
export type SentenceTypeMap = SentenceMap<Sentence>;
export type Pattern<T> = {
    [K in keyof SentenceTypeMap]: (shape: SentenceTypeMap[K]) => T;
};

export function matcher<T>(pattern: Pattern<T>): (sentence: Sentence) => T {
    return (sentence) => pattern[sentence.type](sentence as any);
}
```


The generic operators of the parser combinator are the following. do not hesitate to read the [Combinator parser Wikipedia page](https://en.wikipedia.org/wiki/Parser_combinator).  

```ts
// From https://github.com/sigma-engineering/blog-combinators/blob/b80054037f96c4d1b7fa87a243d247f1dc69c1a1/index.ts

//// Partie parser Combinatoire

// every parsing function will have this signature
export type Parser<T> = (ctx: Context) => Result<T>;

// to track progress through our input string.
// we should make this immutable, because we can.
export type Context = Readonly<{
    text: string; // the full input string
    index: number; // our current position in it
}>;

// our result types
export type Result<T> = Success<T> | Failure;

// on success we'll return a value of type T, and a new Ctx
// (position in the string) to continue parsing from
export type Success<T> = Readonly<{
    success: true;
    value: T;
    ctx: Context;
}>;

// when we fail we want to know where and why
export type Failure = Readonly<{
    success: false;
    expected: string;
    ctx: Context;
}>;

// some convenience methods to build `Result`s for us
export function success<T>(ctx: Context, value: T): Success<T> {
    return { success: true, value, ctx };
}

export function failure(ctx: Context, expected: string): Failure {
    return { success: false, expected, ctx };
}

export function str(match: string): Parser<string> {
    return (ctx) => {
        const endIdx = ctx.index + match.length;
        if (ctx.text.substring(ctx.index, endIdx) === match) {
            return success({ ...ctx, index: endIdx }, match);
        } else {
            return failure(ctx, match);
        }
    };
}

// match a regexp or fail
export function regex(re: RegExp, expected: string): Parser<string> {
    return (ctx) => {
        re.lastIndex = ctx.index;
        const res = re.exec(ctx.text);
        if (res && res.index === ctx.index) {
            return success(
                { ...ctx, index: ctx.index + res[0].length },
                res[0]
            );
        } else {
            return failure(ctx, expected);
        }
    };
}

// try each matcher in order, starting from the same point in the input. return the first one that succeeds.
// or return the failure that got furthest in the input string.
// which failure to return is a matter of taste, we prefer the furthest failure because.
// it tends be the most useful / complete error message.
export function any<T>(parsers: Parser<T>[]): Parser<T> {
    return (ctx) => {
        let furthestRes: Result<T> | null = null;
        for (const parser of parsers) {
            const res = parser(ctx);
            if (res.success) return res;
            if (!furthestRes || furthestRes.ctx.index < res.ctx.index)
                furthestRes = res;
        }
        // tslint:disable-next-line:no-non-null-assertion
        return furthestRes!;
    };
}

// match a parser, or succeed with null
export function optional<T>(parser: Parser<T>): Parser<T | null> {
    return any([parser, (ctx) => success(ctx, null)]);
}

// look for 0 or more of something, until we can't parse any more. note that this function never fails, it will instead succeed with an empty array.
export function many<T>(parser: Parser<T>): Parser<T[]> {
    return (ctx) => {
        const values: T[] = [];
        let nextCtx = ctx;
        while (true) {
            const res = parser(nextCtx);
            if (!res.success) break;
            values.push(res.value);
            nextCtx = res.ctx;
        }
        return success(nextCtx, values);
    };
}

// look for an exact sequence of parsers, or fail
export function sequence<T>(parsers: Parser<T>[]): Parser<T[]> {
    return (ctx) => {
        const values: T[] = [];
        let nextCtx = ctx;
        for (const parser of parsers) {
            const res = parser(nextCtx);
            if (!res.success) return res;
            values.push(res.value);
            nextCtx = res.ctx;
        }
        return success(nextCtx, values);
    };
}

// a convenience method that will map a Success to callback, to let us do common things like build AST nodes from input strings.
export function map<A, B>(parser: Parser<A>, fn: (val: A) => B): Parser<B> {
    return (ctx) => {
        const res = parser(ctx);
        return res.success ? success(res.ctx, fn(res.value)) : res;
    };
}
```

The use of these operators on our quizz dsl example to define our combinatorial parser in Typerscript is the following. 

```ts
import * as parser from "./genericcombinatorialparser";
import * as model from "./model";
export function str2(
    beginmatch: string,
    nextToken: string[],
    f: (s: string, lasttokenval: string) => model.Sentence
): parser.Parser<model.Sentence> {
    return (ctx) => {
        const endIdx = ctx.index + beginmatch.length;
        if (ctx.text.substring(ctx.index, endIdx) === beginmatch) {
            let endIdx1 = -1;
            let tokenmatch = "";
            nextToken.forEach((t, i) => {
                const endIdx2 = ctx.text.indexOf(nextToken[i], endIdx);
                if (endIdx2 !== -1) {
                    if (endIdx1 === -1 || endIdx2 < endIdx1) {
                        endIdx1 = endIdx2;
                        tokenmatch = nextToken[i];
                    }
                }
            });

            const value = ctx.text.substring(endIdx + 1, endIdx1 - 1);
            return parser.success(
                { ...ctx, index: endIdx1 },
                f(value, tokenmatch)
            );
        } else {
            return parser.failure(ctx, beginmatch);
        }
    };
}

/* Text | Radio | Dropdown | Checkboxes |ImagePicker |BooleanEntry |
  SignaturePad | Multipletext | Rating | StaticImage | Html | File |
  Datepicker | Barrating  | SortableJS | Nouislider |IPaddress | Email |
  CKEditor | EmotionsRatings | UML |Question | QuestionSeparator | PageSeparator*/

const text = str2("# (t)", ["- [ ]"], (s) => new model.Text(s));
const radio = str2("# (r)", ["- [ ]"], (s) => new model.Radio(s));
const dropdown = str2("# (d)", ["- [ ]"], (s) => new model.Dropdown(s));
const checkboxes = str2("# (c)", ["- [ ]"], (s) => new model.Checkboxes(s));
const imagePicker = str2("# (i)", ["- [ ]"], (s) => new model.ImagePicker(s));
const booleanEntry = str2(
    "# (b)",
    ["- [ ]", "----", "---"],
    (s) => new model.BooleanEntry(s)
);
const signaturePad = str2(
    "# (si)",
    ["- [ ]", "----", "---"],
    (s) => new model.SignaturePad(s)
);
const multipletext = str2(
    "# (mt)",
    ["- [ ]"],
    (s) => new model.Multipletext(s)
);
const rating = str2("# (rating)", ["- [ ]"], (s) => new model.Rating(s));
const staticImage = str2(
    "# (statim)",
    ["- [ ]", "----", "---"],
    (s) => new model.StaticImage(s)
);
const html = str2(
    "# (htm)",
    ["- [ ]", "----", "---"],
    (s) => new model.Html(s)
);
const file = str2(
    "# (file)",
    ["- [ ]", "----", "---"],
    (s) => new model.File(s)
);
const datepicker = str2(
    "# (dp)",
    ["- [ ]", "----", "---"],
    (s) => new model.Datepicker(s)
);
const barrating = str2(
    "# (barrating)",
    ["- [ ]"],
    (s) => new model.Barrating(s)
);
const sortableJS = str2("# (sort)", ["- [ ]"], (s) => new model.SortableJS(s));
const nouislider = str2(
    "# (slide)",
    ["- [ ]", "----", "---"],
    (s) => new model.Nouislider(s)
);
const iPaddress = str2(
    "# (ip)",
    ["- [ ]", "----", "---"],
    (s) => new model.IPaddress(s)
);
const email = str2(
    "# (mail)",
    ["- [ ]", "----", "---"],
    (s) => new model.Email(s)
);
const cKEditor = str2(
    "# (ck)",
    ["- [ ]", "----", "---"],
    (s) => new model.CKEditor(s)
);
const emotionsRatings = str2(
    "# (erating)",
    ["- [ ]"],
    (s) => new model.EmotionsRatings(s)
);
const uml = str2("# (uml)", ["- [ ]", "----", "---"], (s) => new model.UML(s));

const question = str2(
    "- [ ]",
    ["- [ ]", "----", "---"],
    (s: string, lasttokenval: string) => {
        if (lasttokenval === "----" || lasttokenval === "---") {
            return new model.Question(s, true);
        } else {
            return new model.Question(s, false);
        }
    }
);
const sepratorquestion = str2(
    "----",
    [
        "# (t)",
        "# (r)",
        "# (d)",
        "# (c)",
        "# (i)",
        "# (b)",
        "# (si)",
        "# (mt)",
        "# (rating)",
        "# (statim)",
        "# (htm)",
        "# (file)",
        "# (dp)",
        "# (barrating)",
        "# (sort)",
        "# (slide)",
        "# (ip)",
        "# (mail)",
        "# (ck)",
        "# (erating)",
        "# (uml)",
    ],
    () => new model.QuestionSeparator()
);
const sepratorpage = str2(
    "---",
    [
        "# (t)",
        "# (r)",
        "# (d)",
        "# (c)",
        "# (i)",
        "# (b)",
        "# (si)",
        "# (mt)",
        "# (rating)",
        "# (statim)",
        "# (htm)",
        "# (file)",
        "# (dp)",
        "# (barrating)",
        "# (sort)",
        "# (slide)",
        "# (ip)",
        "# (mail)",
        "# (ck)",
        "# (erating)",
        "# (uml)",
    ],
    () => new model.PageSeparator()
);

// sep = sepratorquestion | sepratorpage
function sep(ctx: parser.Context): parser.Result<model.Sentence> {
    return parser.any<model.Sentence>([sepratorquestion, sepratorpage])(ctx);
}

function title(ctx: parser.Context): parser.Result<model.Sentence> {
    return parser.any<model.Sentence>([
        text,
        radio,
        dropdown,
        checkboxes,
        imagePicker,
        booleanEntry,
        signaturePad,
        multipletext,
        rating,
        staticImage,
        html,
        file,
        datepicker,
        barrating,
        sortableJS,
        nouislider,
        iPaddress,
        email,
        cKEditor,
        emotionsRatings,
        uml,
    ])(ctx);
}

// const parseCowSentence1 = sequence([cow, space, says, space, moo]);
const quizzdslq = parser.map(
    parser.sequence<any>([title, parser.many(question), sep]),
    // we combine the first argument and the trailing arguments into a single array
    ([arg1, rest, arg2]): model.Sentence[] => [arg1, ...rest, arg2]
);

export const quizzdsl = parser.many(quizzdslq);
```


It is really important to keep in mind that part 1 and 3 can be generated from the xtext description, part 2 is generic. 

It remains to visit the model thus built by the parser to generate the json file expected by surveyjs. This is the role of the **SuerveyJSPrinter** class. It is just a concrete visitor to the AST (a pure pretty printer).

```ts
import { Result, Success } from "./genericcombinatorialparser";
import {
    Barrating,
    BooleanEntry,
    Checkboxes,
    CKEditor,
    Datepicker,
    Dropdown,
    Email,
    EmotionsRatings,
    File,
    Html,
    ImagePicker,
    IPaddress,
    matcher,
    Multipletext,
    Nouislider,
    PageSeparator,
    Question,
    QuestionSeparator,
    Radio,
    Rating,
    Sentence,
    SignaturePad,
    SortableJS,
    StaticImage,
    Text,
    UML,
} from "./model";
import { quizzdsl } from "./quizzdsl";

class StringIdGenerator {
    nextId = [0];
    constructor(private chars: string = "abcdefghijklmnopqrstuvwxyz") {}

    next() {
        const r = [];
        for (const char of this.nextId) {
            r.unshift(this.chars[char]);
        }
        this._increment();
        return r.join("");
    }

    _increment() {
        for (let i = 0; i < this.nextId.length; i++) {
            const val = ++this.nextId[i];
            if (val >= this.chars.length) {
                this.nextId[i] = 0;
            } else {
                return;
            }
        }
        this.nextId.push(0);
    }

    *[Symbol.iterator]() {
        while (true) {
            yield this.next();
        }
    }
}

export class SuerveyJSPrinter {
    questionNumber = 0;
    choiceLetter = new StringIdGenerator();
    isChoice = false;
    isImage = false;
    isMultipleItem = false;
    numberquestion = 0;
    isSimpleChoice = false;
    isRating = false;
    isText = false;
    constructor(
        private titre: string,
        private consigne: string,
        private tmpsenseconde: number,
        private questionsOrder?: string,
        private choicesOrder?: string,
        private completedhtml?: string
    ) {}

    printer = matcher<string>({
        Text: (t) => this.visitText(t),
        Radio: (t) => this.visitRadio(t),
        Dropdown: (t) => this.visitDropdown(t),
        Checkboxes: (t) => this.visitCheckboxes(t),
        ImagePicker: (t) => this.visitImagePicker(t),
        BooleanEntry: (t) => this.visitBooleanEntry(t),
        SignaturePad: (t) => this.visitSignaturePad(t),
        Multipletext: (t) => this.visitMultipletext(t),
        Rating: (t) => this.visitRating(t),
        StaticImage: (t) => this.visitStaticImage(t),
        Html: (t) => this.visitHtml(t),
        File: (t) => this.visitFile(t),
        Datepicker: (t) => this.visitDatepicker(t),
        Barrating: (t) => this.visitBarrating(t),
        SortableJS: (t) => this.visitSortableJS(t),
        Nouislider: (t) => this.visitNouislider(t),
        IPaddress: (t) => this.visitIPaddress(t),
        Email: (t) => this.visitEmail(t),
        CKEditor: (t) => this.visitCKEditor(t),
        EmotionsRatings: (t) => this.visitEmotionsRatings(t),
        UML: (t) => this.visitUML(t),
        Question: (q) => this.visitQuestion(q),
        QuestionSeparator: (s) => this.visitQuestionSeparator(s),
        PageSeparator: (s) => this.visitPageSeparator(s),
    });
    print(res: string): string {
        return this.printParse(
            quizzdsl({
                text: res,
                index: 0,
            })
        );
    }

    private printParse(res: Result<Sentence[][]>): string {
        let result = "";
        if (res.success) {
            const t = res as Success<Sentence[][]>;
            result = `var exam = {
      "locale": "fr",
      "title" : "${this.titre}",
      "showProgressBar": "bottom",
      "showTimerPanel": "top",
      "maxTimeToFinish": "${this.tmpsenseconde}",
      "firstPageIsStarted": true,
      "startSurveyText": "Démarrer l'examen",
      "questionsOrder": "${this.questionsOrder}",
      "completedHtml": "${this.completedhtml}",
      "pages": [
        {
          "questions": [
            {
              "type": "html",
              "html": \`${this.consigne}\`
          },
          {
            "name": "photo",
            "type": "photocapture",
            "title": "Prenez une jolie photo que l' on sache que c'est vous",
            "isRequired:": true
        }

      ]
  },
  {
    "questionsOrder": "${this.questionsOrder}",
    "questions": [`;
            t.value.forEach((t1, index1) => {
                t1.forEach((t2, index2) => {
                    if (
                        !(
                            index1 === t.value.length - 1 &&
                            index2 === t1.length - 1
                        )
                    ) {
                        result = result + this.printer(t2);
                    } else {
                        result =
                            result +
                            `]
        }
        ]
        }
      ]
    }`;
                    }
                });
            });
            result = result + "\n JSON.stringify(exam);";
        }
        return result;
    }

    private visitText(t: Text): string {
        this.isText = true;
        const find = "`";
        const re = new RegExp(find, "g");
        const desc = t.desc.replace(re, "\\`");

        this.questionNumber = this.questionNumber + 1;
        return `{
"type": "text",
"isRequired": false,
"showQuestionNumbers": true,
"name": "Q${this.questionNumber}",
"title": \`${desc}\`,
placeHolder : `;
    }
    private visitRadio(t: Radio): string {
        this.isChoice = true;
        const find = "`";
        const re = new RegExp(find, "g");
        const desc = t.desc.replace(re, "\\`");

        this.questionNumber = this.questionNumber + 1;
        return `{
  "type": "radiogroup",
  "isRequired": false,
  "choicesOrder": "${this.choicesOrder}",
  "showClearButton": true,
  "showQuestionNumbers": true,
  "name": "Q${this.questionNumber}",
  "title": \`${desc}\`,
  "choices": [
  `;
    }
    private visitDropdown(t: Dropdown): string {
        this.isChoice = true;
        const find = "`";
        const re = new RegExp(find, "g");
        const desc = t.desc.replace(re, "\\`");

        this.questionNumber = this.questionNumber + 1;
        return `{
  "type": "dropdown",
  "isRequired": false,
  "choicesOrder": "${this.choicesOrder}",
  "showClearButton": true,
  "showQuestionNumbers": true,
  "name": "Q${this.questionNumber}",
  "title": \`${desc}\`,
  "choices": [
  `;
    }

    private visitCheckboxes(t: Checkboxes): string {
        this.isChoice = true;
        const find = "`";
        const re = new RegExp(find, "g");
        const desc = t.desc.replace(re, "\\`");

        this.questionNumber = this.questionNumber + 1;
        return `{
"type": "checkbox",
"isRequired": false,
"choicesOrder": "${this.choicesOrder}",
"showClearButton": true,
"showQuestionNumbers": true,
"name": "Q${this.questionNumber}",
"title": \`${desc}\`,
"choices": [
`;
    }
    private visitImagePicker(t: ImagePicker): string {
        this.isChoice = true;
        this.isImage = true;
        const find = "`";
        const re = new RegExp(find, "g");
        const desc = t.desc.replace(re, "\\`");

        this.questionNumber = this.questionNumber + 1;
        return `{
  "type": "imagepicker",
  "isRequired": false,
  "choicesOrder": "${this.choicesOrder}",
  "showClearButton": true,
  "showQuestionNumbers": true,
  "imageWidth":500,
  "imageHeight": 500,
  "name": "Q${this.questionNumber}",
  "title": \`${desc}\`,
  "choices": [
  `;
    }
    private visitBooleanEntry(t: BooleanEntry): string {
        this.isChoice = true;
        this.isSimpleChoice = true;

        const find = "`";
        const re = new RegExp(find, "g");
        const desc = t.desc.replace(re, "\\`");

        this.questionNumber = this.questionNumber + 1;
        return `{
"type": "boolean",
"isRequired": false,
"showClearButton": true,
"showQuestionNumbers": true,
"name": "Q${this.questionNumber}",
"title": \`${desc}\`,
"ignores" : [ `;
    }
    private visitSignaturePad(t: SignaturePad): string {
        this.isChoice = true;
        this.isSimpleChoice = true;

        const find = "`";
        const re = new RegExp(find, "g");
        const desc = t.desc.replace(re, "\\`");

        this.questionNumber = this.questionNumber + 1;
        return `{
"type": "signaturepad",
"isRequired": false,
"showQuestionNumbers": true,
"name": "Q${this.questionNumber}",
"title": \`${desc}\`,
"ignores" : [`;
    }
    private visitMultipletext(t: Multipletext): string {
        this.isChoice = true;
        this.isMultipleItem = true;
        const find = "`";
        const re = new RegExp(find, "g");
        const desc = t.desc.replace(re, "\\`");

        this.questionNumber = this.questionNumber + 1;
        return `{
"type": "multipletext",
"isRequired": false,
"showClearButton": true,
"showQuestionNumbers": true,
"name": "Q${this.questionNumber}",
"title": \`${desc}\`,
"items": [
`;
    }
    private visitRating(t: Rating): string {
        this.isRating = true;
        const find = "`";
        const re = new RegExp(find, "g");
        const desc = t.desc.replace(re, "\\`");

        this.questionNumber = this.questionNumber + 1;
        return `{
"type": "rating",
"isRequired": false,
"showQuestionNumbers": true,
"name": "Q${this.questionNumber}",
"title": \`${desc}\`,
"minRateDescription": `;
    }
    private visitStaticImage(t: StaticImage): string {
        this.isChoice = true;
        this.isSimpleChoice = true;

        const find = "`";
        const re = new RegExp(find, "g");
        const desc = t.desc.replace(re, "\\`");
        return `{
"type": "image",
"isRequired": false,
"imageWidth": "500px",
"imageHeight": "300px",
"imageLink": \`${desc}\`,
"ignores" : [`;
    }

    private visitHtml(t: Html): string {
        this.isChoice = true;
        this.isSimpleChoice = true;

        const find = "`";
        const re = new RegExp(find, "g");
        const desc = t.desc.replace(re, "\\`");
        return `{
"type": "html",
"isRequired": false,
"html": \`${desc}\`,
"ignores" : [`;
    }
    private visitFile(t: File): string {
        this.isChoice = true;
        this.isSimpleChoice = true;

        const find = "`";
        const re = new RegExp(find, "g");
        const desc = t.desc.replace(re, "\\`");
        this.questionNumber = this.questionNumber + 1;

        return `{
"type": "file",
"isRequired": false,
"name": "Q${this.questionNumber}",
"title": \`${desc}\`,
"storeDataAsText": true,
"showPreview": true,
"maxSize": 1024000,
"ignore" : [`;
    }
    private visitDatepicker(t: Datepicker): string {
        this.isChoice = true;
        this.isSimpleChoice = true;

        const find = "`";
        const re = new RegExp(find, "g");
        const desc = t.desc.replace(re, "\\`");
        this.questionNumber = this.questionNumber + 1;

        return `{
"type": "datepicker",
"isRequired": false,
"inputType": "date",
"name": "Q${this.questionNumber}",
"title": \`${desc}\`,
"dateFormat": "mm/dd/yy",
"ignores" : [`;
    }
    private visitBarrating(t: Barrating): string {
        this.isChoice = true;
        this.isSimpleChoice = true;

        const find = "`";
        const re = new RegExp(find, "g");
        const desc = t.desc.replace(re, "\\`");
        this.questionNumber = this.questionNumber + 1;

        return `{
"type": "barrating",
"isRequired": false,
"ratingTheme": "fontawesome-stars",
"name": "Q${this.questionNumber}",
"title": \`${desc}\`,
"choices": [ `;
    }
    private visitSortableJS(t: SortableJS): string {
        this.isChoice = true;
        this.isSimpleChoice = true;

        const find = "`";
        const re = new RegExp(find, "g");
        const desc = t.desc.replace(re, "\\`");
        this.questionNumber = this.questionNumber + 1;

        return `{
"type": "sortablelist",
"isRequired": false,
"choicesOrder": "${this.choicesOrder}",
"name": "Q${this.questionNumber}",
"title": \`${desc}\`,
"choices": [ `;
    }
    private visitNouislider(t: Nouislider): string {
        this.isChoice = true;
        this.isSimpleChoice = true;

        const find = "`";
        const re = new RegExp(find, "g");
        const desc = t.desc.replace(re, "\\`");

        this.questionNumber = this.questionNumber + 1;
        return `{
"type": "nouislider",
"isRequired": false,
"showQuestionNumbers": true,
"name": "Q${this.questionNumber}",
"title": \`${desc}\`,
"ignores" : [`;
    }
    private visitIPaddress(t: IPaddress): string {
        this.isChoice = true;
        this.isSimpleChoice = true;

        const find = "`";
        const re = new RegExp(find, "g");
        const desc = t.desc.replace(re, "\\`");

        this.questionNumber = this.questionNumber + 1;
        return `{
"type": "text",
"inputMask": "ip",
"isRequired": false,
"showQuestionNumbers": true,
"name": "Q${this.questionNumber}",
"title": \`${desc}\`,
"ignores" : [`;
    }
    private visitEmail(t: Email): string {
        this.isChoice = true;
        this.isSimpleChoice = true;
        const find = "`";
        const re = new RegExp(find, "g");
        const desc = t.desc.replace(re, "\\`");

        this.questionNumber = this.questionNumber + 1;
        return `{
"type": "text",
"inputMask": "email",
"isRequired": false,
"showQuestionNumbers": true,
"name": "Q${this.questionNumber}",
"title": \`${desc}\`,
"ignores": [`;
    }
    private visitCKEditor(t: CKEditor): string {
        this.isChoice = true;
        this.isSimpleChoice = true;
        const find = "`";
        const re = new RegExp(find, "g");
        const desc = t.desc.replace(re, "\\`");

        this.questionNumber = this.questionNumber + 1;
        return `{
"type": "editor",
"isRequired": false,
"showQuestionNumbers": true,
"name": "Q${this.questionNumber}",
"title": \`${desc}\`,
"ignores": [`;
    }
    private visitEmotionsRatings(t: EmotionsRatings): string {
        this.isChoice = true;
        this.isSimpleChoice = true;

        const find = "`";
        const re = new RegExp(find, "g");
        const desc = t.desc.replace(re, "\\`");
        this.questionNumber = this.questionNumber + 1;

        return `{
"type": "emotionsratings",
"isRequired": false,
"name": "Q${this.questionNumber}",
"title": \`${desc}\`,
"choices": [ `;
    }
    private visitUML(t: UML): string {
        this.isChoice = true;
        this.isSimpleChoice = true;

        const find = "`";
        const re = new RegExp(find, "g");
        const desc = t.desc.replace(re, "\\`");

        this.questionNumber = this.questionNumber + 1;
        return `{
"type": "uml",
"isRequired": false,
"showQuestionNumbers": true,
"name": "Q${this.questionNumber}",
"title": \`${desc}\`,
"ignores" : [`;
    }
    private visitQuestion(t: Question): string {
        this.numberquestion = this.numberquestion + 1;
        const find = "`";
        const re = new RegExp(find, "g");
        const desc = t.desc.replace(re, "\\`");
        let res = "";
        let comma = "";
        if (this.isChoice) {
            if (this.isImage) {
                res = `{
        "value": "${this.choiceLetter.next()}",
        "imageLink": \`${desc}\`
        }
        `;
            } else if (this.isMultipleItem) {
                res = `{
          "name": "${this.choiceLetter.next()}",
          "title": \`${desc}\`
          }
          `;
            } else if (this.isSimpleChoice) {
                res = `\`${desc}\``;
            } else {
                res = `{
          "value": "${this.choiceLetter.next()}",
          "text": \`${desc}\`
          }
          `;
            }
        } else {
            if (this.isRating) {
                if (t.last) {
                    res = `"maxRateDescription": \`${desc}\``;
                } else {
                    res = `\`${desc}\`\n`;
                }
            } else if (this.isText) {
                if (t.last) {
                    res = `\`${desc}\``;
                }
            } else {
                res = `\`${desc}\`\n`;
            }
        }
        if (!t.last && !this.isText) {
            comma = ",\n";
        } else {
            this.choiceLetter = new StringIdGenerator();
        }

        return res + comma;
    }
    private visitQuestionSeparator(t: QuestionSeparator): string {
        let colcount = "";
        if (this.isMultipleItem) {
            colcount = `,\ncolCount: ${this.numberquestion}\n`;
        }
        this.numberquestion = 0;
        this.isRating = false;
        this.isText = false;

        if (this.isChoice) {
            this.isChoice = false;
            this.isImage = false;
            this.isMultipleItem = false;
            this.isSimpleChoice = false;

            return "] " + colcount + "},";
        } else {
            return "},";
        }
    }
    private visitPageSeparator(t: PageSeparator): string {
        let colcount = "";
        if (this.isMultipleItem) {
            colcount = `,\ncolCount: ${this.numberquestion}\n`;
        }
        const res = `
  }
  ]
  },
  {
    "questionsOrder": "${this.questionsOrder}",
    "questions":
      [`;

        this.numberquestion = 0;
        this.isRating = false;
        this.isText = false;

        if (this.isChoice) {
            this.isChoice = false;
            this.isImage = false;
            this.isMultipleItem = false;
            this.isSimpleChoice = false;

            return "]" + colcount + res;
        } else {
            return res;
        }
    }
}
```


## Step 4, Let's use it within mulder

Within *mulder*, we then created a simple angular component able to consume a remote or local resource of this Domain-Specific Markdown language, parse the content, transform the content into json, apply a md2html transformation if some items were themselves written in md, display the content dynamically. This component is configurable at instatiation in order to be able to use it during exams (given time), to use a particular backend url to 
- save an answer from a candidate, 
- save answers saves after each page transition...

An example of the use of this component can be seen below.  


```html
<mulder-layout>
    <mulder-main-header backgroundImage='url("assets/img/dolphins4.jpg")' heading="DemoSurveyJS"
        subHeading="Show the use of a DSL to configure a survey" [siteHeading]="true">
    </mulder-main-header>
    <div class="container">
        <survey [json]="json" (submitSurvey)="sendData($event)" (submitFinalSurvey)="sendFinalData($event)"></survey>
    </div>
</mulder-layout>
```

```ts
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
} from "@angular/core";
import { SuerveyJSPrinter } from "@app/surveyplugin/quizzdsl/prettyprinter";

@Component({
    selector: "mulder-surveydemo",
    templateUrl: "./surveydemo.component.html",
    styleUrls: ["surveydemo.component.scss"],
})
export class SurveyDemoComponent implements OnInit, OnDestroy {
    json: any = {};
    private titre!: string;
    private consigne!: string;
    private tmpsenseconde: number;
    private questionsOrder?: string;
    private choicesOrder?: string;
    private pageOrder?: string;
    private completedhtml?: string;

    private httpOptions = {
        headers: new HttpHeaders({
            Accept: "text/html, application/xhtml+xml, */*",
        }),
        responseType: "text" as "json",
    };

    constructor(private http: HttpClient) {
        this.titre = "Exam 2020";
        this.consigne = "Demo of what you have to do";
        this.tmpsenseconde = 3600;
        this.questionsOrder = "random";
        this.choicesOrder = "random";
        this.pageOrder = "random";
        this.completedhtml =
            "<p><h4>Thanks for completing this form</h4></p>";


    }

    // canbesaved = true;

    shuffleArray(array: Array<any>) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    ngOnInit(): void {
        const p = new SuerveyJSPrinter(
            this.titre,
            this.consigne,
            3600,
            this.questionsOrder,
            this.choicesOrder,
            this.completedhtml
        );
        this.http
            .get(
                "https://raw.githubusercontent.com/mulder-jamstack/mulder-jamstack.github.io/src/content/survey/demo.md",
                this.httpOptions
            )
            .subscribe((res) => {
                console.log(res);
                const s1 = p.print(res as string);

                const s = JSON.parse(eval(s1));

                // Random pages
                if (this.pageOrder === "random") {
                    const init = s.pages.shift();
                    this.shuffleArray(s.pages);
                    s.pages = [init, ...s.pages];
                }
                this.json = s;
                console.log(this.json);
            });
    }

    sendData(result: any) {
        console.log(result);
        /*const formData = new FormData();
        const dataStr = new Blob([JSON.stringify(result)], {
            type: "application/json",
        });
        // var dataStr = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result));

        formData.append("upload[]", dataStr, "result.json");

        this.http.post("/upload", formData).subscribe(
            (res: any) => {},
            (err: any) => {}
        );*/
    }

    sendFinalData(result: any) {
        console.log(result);
    }

    ngOnDestroy() {}
}
```