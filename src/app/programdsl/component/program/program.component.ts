import { HttpClient, HttpHeaders, HttpXhrBackend } from "@angular/common/http";
import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
    TemplateRef,
} from "@angular/core";
import { DomSanitizer, SafeStyle } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

// import data from "./data.json";
import { Day, Event, Paper, SessionGroup, Type } from "./programtype";
import { evaluate } from "./visitor";

@Component({
    selector: "mulder-confprogram",
    templateUrl: "./program.component.html",
    styleUrls: ["program.component.scss"],
})
export class ProgramComponent implements OnInit, OnChanges {
    constructor(
        private domSanitizer: DomSanitizer,
        private modalService: NgbModal
    ) {}
    hiddenTypes = [
        "Poster",
        "SRC",
        "DoctoralSymposium",
        "Clinic",
        "EducatorSymposium",
        "Reception",
        "Opening",
    ];
    hiddenModalsAndStars = ["Lunch", "CoffeeBreak", "Reception"];
    data: Day[] = [];
    showFavorites = false;
    favoriteTalks: any = {};
    selectedTalk: Paper | Event = {};
    selectedTalkDate: any;

    ngOnChanges(changes: SimpleChanges): void {}
    ngOnInit() {
        const httpOptions = {
            headers: new HttpHeaders({
                Accept: "text/html, application/xhtml+xml, */*",
            }),
            responseType: "text" as "json",
        };

        const httpClient = new HttpClient(
            new HttpXhrBackend({ build: () => new XMLHttpRequest() })
        );
        httpClient
            .get(
                "https://raw.githubusercontent.com/mulder-jamstack/mulder-jamstack.github.io/src/content/agenda/models.md", // Mettre le md dans le repo
                httpOptions
            )
            .subscribe((r: any) => {
                const res = r as string;
                const json = evaluate(res);
                this.preprocessData(json);
            });
    }

    getMailTo(email: string): string {
        return "mailto:" + email;
    }
    preprocessData(da: any) {
        ////// Preprocess data //////
        this.data = da;
        ////// Favorites /////

        try {
            if (typeof localStorage !== "undefined") {
                this.showFavorites =
                    localStorage.getItem("showFavorites") === "true";
            } else {
                this.showFavorites = false;
            }

            // Retrieve favorite talks from local storage
            if (
                typeof Storage !== "undefined" &&
                typeof localStorage !== "undefined"
            ) {
                this.favoriteTalks = JSON.parse(
                    localStorage.getItem("favoriteTalks") as string
                );
                if (this.favoriteTalks === null) {
                    this.favoriteTalks = {};
                }
            } else {
                this.favoriteTalks = {};
            }
        } catch (error) {
            // console.error(error);
            // expected output: ReferenceError: nonExistentFunction is not defined
            // Note - error messages will vary depending on browser
            this.favoriteTalks = {};
        }

        this.data.forEach((day: Day) => {
            day.sessionGroups.forEach((sessionGroup) => {
                sessionGroup.forEach((session, roomIndex) => {
                    if (typeof session.events !== "undefined") {
                        session.events.forEach((event) => {
                            if (typeof event.papers === "undefined") {
                                event.selected = this.favoriteTalks[
                                    event.title + session.icalStart
                                ] as boolean;
                            } else {
                                event.papers.forEach((talk) => {
                                    talk.selected = this.favoriteTalks[
                                        // tslint:disable-next-line:no-non-null-assertion
                                        talk.title + talk.icalStart!
                                    ] as boolean;
                                });
                            }
                        });
                    }
                });
            });
        });
        //          this.show = true;
    }

    open(content: TemplateRef<any>) {
        this.modalService
            .open(content, { ariaLabelledBy: "modal-basic-title" })
            .result.then(
                (result) => {},
                (reason) => {}
            );
    }

    parseTime(time: string) {
        const splittedTime = time.split(":");
        return {
            // tslint:disable-next-line:radix
            hour: parseInt(splittedTime[0]),
            // tslint:disable-next-line:radix
            minutes: parseInt(splittedTime[1]),
        };
    }

    getStartOfSessionGroup(sessionGroup: SessionGroup[]) {
        return sessionGroup[0].start;
    }
    getEndOfSessionGroup(sessionGroup: any[]) {
        let maxEnd = "00:00";
        sessionGroup.forEach((session: { end: string }) => {
            if (typeof session.end !== "undefined") {
                const parsedSessionEnd = this.parseTime(session.end);
                const parsedMaxEnd = this.parseTime(maxEnd);
                if (
                    parsedSessionEnd.hour > parsedMaxEnd.hour ||
                    (parsedSessionEnd.hour === parsedMaxEnd.hour &&
                        parsedSessionEnd.minutes > parsedMaxEnd.minutes)
                ) {
                    maxEnd = session.end;
                }
            }
        });
        return maxEnd;
    }

    hideType(talkType: Type) {
        return (
            typeof talkType === "undefined" ||
            this.hiddenTypes.indexOf(talkType) !== -1
        );
    }
    showModalAndStar(talkType: Type) {
        return (
            typeof talkType !== "undefined" &&
            this.hiddenModalsAndStars.indexOf(talkType) === -1
        );
    }

    toggleFavorites(e: any) {
        console.log(e.currentTarget.checked);
        this.showFavorites = e.currentTarget.checked;
        try {
            if (typeof localStorage !== "undefined") {
                // TODO check
                localStorage.setItem("showFavorites", "" + this.showFavorites);
            }
        } catch (error) {}
    }
    toggleFavoriteTalk(talk: Paper | Event, date: any) {
        talk.selected = !talk.selected;
        this.favoriteTalks[talk.title + date] = talk.selected;
        try {
            if (
                typeof Storage !== "undefined" &&
                typeof localStorage !== "undefined"
            ) {
                localStorage.setItem(
                    "favoriteTalks",
                    JSON.stringify(this.favoriteTalks)
                );
            }
        } catch (error) {}
    }
    showColor(event: { papers: Paper[]; selected: boolean }) {
        let atLeastOneSelected = false;
        if (typeof event.papers !== "undefined") {
            event.papers.forEach((talk: Paper) => {
                // tslint:disable-next-line:no-non-null-assertion
                atLeastOneSelected = atLeastOneSelected || talk.selected!;
            });
        } else {
            atLeastOneSelected = event.selected;
        }

        return (
            !this.showFavorites || (this.showFavorites && atLeastOneSelected)
        );
    }

    ///// Export to iCal /////
    hash(s: string) {
        let hash = 0;
        if (s.length === 0) return hash;
        for (let i = 0; i < s.length; i++) {
            const charI = s.charCodeAt(i);
            // tslint:disable-next-line:no-bitwise
            hash = (hash << 5) - hash + charI;
            // tslint:disable-next-line:no-bitwise
            hash = hash & hash;
        }
        return hash;
    }

    hasPapers(events: any[]): boolean {
        return events.every(
            (e) => e.title !== undefined && e.papers !== undefined
        );
    }

    createEvent(
        calendar: any,
        edate: any,
        start: any,
        end: any,
        title: string,
        description: string,
        location: string,
        event1: any
    ) {
        calendar.push("BEGIN:VEVENT");
        //        calendar.push("DTSTART;TZID=Europe/Paris:" + toITCFormat(edate,start));
        calendar.push("DTSTART:" + this.toITCFormat(edate, start));
        calendar.push("DTEND:" + this.toITCFormat(edate, end));
        calendar.push("DTSTAMP:" + this.toITCFormat(edate, start));
        //        calendar.push("DTEND;TZID=Europe/Paris:" + toITCFormat(edate,end));
        //        calendar.push("DTSTAMP;TZID=Europe/Paris:" + toITCFormat(edate,start));
        calendar.push(
            "ORGANIZER;CN=icpe2021-gc@inria.fr:mailto:icpe2021-gc@inria.fr"
        );
        calendar.push(
            "UID:" +
                this.toITCFormat(edate, end) +
                "-" +
                this.hash(title) +
                "@icpe2021.irisa.fr"
        );

        /* if (event1.papers != undefined) {
            event1.papers.forEach(function (talk, talkIndex) {
                console.log(talk);
        });
    }*/

        const regex = /\n/g;
        let longdesc = "";
        let shortdesc = "";
        if (event1.description !== undefined) {
            //            longdesc = converter.makeHtml(event1.description);
            longdesc = event1.description;
            shortdesc = event1.description;
        } else if (event1.program !== undefined) {
            // longdesc = converter.makeHtml(event1.program);
            longdesc = event1.program;

            shortdesc = event1.program;
        } else if (event1.papers !== undefined) {
            /*papers: [{
            authors: [{
                    name: "Axel Busch",
                },
                {
                    name: "Martin Kammerer",
                },
            ],
            title: "Network Performance Influences of Software-defined Networks on Micro-service Architectures",
            type: "REGULAR INDUSTRY",

        },*/
            event1.papers.forEach(
                (
                    paper: { title: string; authors: any[]; type: string },
                    talkIndex: any
                ) => {
                    longdesc =
                        longdesc +
                        "<b>" +
                        paper.title +
                        "</b> - " +
                        paper.authors
                            .map((a: { name: any }) => a.name)
                            .join(", ") +
                        ". <i>" +
                        paper.type +
                        "</i>. <br>";
                    shortdesc =
                        shortdesc +
                        " - " +
                        paper.title +
                        " - " +
                        paper.authors
                            .map((a: { name: any }) => a.name)
                            .join(", ") +
                        ". " +
                        paper.type +
                        "\n";
                }
            );
        } else {
            longdesc = description;
            shortdesc = description;
        }

        calendar.push(
            "DESCRIPTION:" +
                shortdesc.replace(regex, "\n ").replace(/(.{75})/g, "$1\n ")
        ); // TODO : max line is 75 characters
        calendar.push(
            "X-ALT-DESC;FMTTYPE=text/html:" +
                longdesc.replace(regex, "\n ").replace(/(.{75})/g, "$1\n ")
        ); // TODO : max line is 75 characters

        calendar.push("LOCATION:" + location);
        calendar.push("SUMMARY:" + title); // TODO : max line is 75 characters
        calendar.push("END:VEVENT");
    }

    exportToCal(favoritesOnly: any) {
        // Create calendar
        const calendar: string[] = [];
        calendar.push("BEGIN:VCALENDAR");
        calendar.push("VERSION:2.0");
        calendar.push("PRODID:-//ICPE2021//Program");

        this.data.forEach((day: { sessionGroups: any[] }) => {
            day.sessionGroups.forEach((sessionGroup: any[]) => {
                if (sessionGroup.length > 0) {
                    sessionGroup.forEach(
                        (
                            session: {
                                events: any[];
                                date: any;
                                start: any;
                                end: any;
                                room: any;
                            },
                            roomIndex: any
                        ) => {
                            if (typeof session.events !== "undefined") {
                                session.events.forEach(
                                    (
                                        event: {
                                            selected: boolean;
                                            title: any;
                                        },
                                        eventIndex: any
                                    ) => {
                                        if (
                                            !favoritesOnly ||
                                            (typeof event.selected !==
                                                "undefined" &&
                                                event.selected === true)
                                        ) {
                                            this.createEvent(
                                                calendar,
                                                session.date,
                                                session.start,
                                                session.end,
                                                event.title,
                                                event.title,
                                                session.room,
                                                event
                                            ); // TODO : description
                                        }
                                        /*if (typeof event.papers !== "undefined") {
                                        event.papers.forEach(function (talk, talkIndex) {
                                        if (!favoritesOnly || ((typeof talk.selected !== "undefined") && talk.selected === true)) {
                                            if (talk.date == undefined || talk.start == undefined || talk.end == undefined) {
                                                createEvent(calendar, session.date, session.start, session.end, talk.title, talk.title, session.room); // TODO : description
                                            } else {
                                                createEvent(calendar, talk.date, talk.start, talk.end, talk.title, talk.title, session.room); // TODO : description
                                            }
                                        }
                                    });
                                }*/
                                    }
                                );
                            }
                        }
                    );
                }
            });
        });

        calendar.push("END:VCALENDAR");
        const file = calendar.join("\n");

        // Download file
        const blob = new Blob([file], {
            type: "text/calendar",
        });
        const inlinedDataUrl =
            "data:text/calendar;charset=utf-8," + encodeURIComponent(file);
        const filename = "icpe2021.ics";
        if (window.navigator.msSaveOrOpenBlob !== undefined) {
            window.navigator.msSaveBlob(blob, filename);
        } else {
            const elem = window.document.createElement("a");

            if (window.URL) {
                elem.href = window.URL.createObjectURL(blob);
            } else {
                elem.href = window.webkitURL.createObjectURL(blob);
            }
            // elem.href = inlinedDataUrl;
            elem.download = filename;
            document.body.appendChild(elem);
            elem.click();
            document.body.removeChild(elem);

            // var reader = new FileReader();
            // reader.onloadend = function(e) {
            //     console.log(reader);
            //     $window.open(reader.result);
            // };
            // reader.readAsDataURL(blob); //
        }
    }

    getInfo(event: any, talk: Paper, date: any, ref: TemplateRef<any>) {
        this.selectedTalk = talk;
        this.selectedTalkDate = date;
        this.open(ref);
    }
    convertHtml(desc: string) {
        return desc;
        //        return converter.makeHtml("**Description**:" + desc);
    }
    convertHtmlprogram(desc: string) {
        return desc;
        //        return converter.makeHtml("**Program**:" + desc);
    }

    toITCFormat(date: string, time: string) {
        let timeCont: number[] = [];
        let dateCont: number[] = [];

        if (time.toLowerCase().indexOf("pm") !== -1) {
            // tslint:disable-next-line:prettier
            timeCont = time.toLowerCase().replace("pm", "00").split(":").map(a => +a ); // assuming from your question seconds is never mentioned but only hh:mm i.e. hours and minutes
            // tslint:disable-next-line:radix
            timeCont[0] = (timeCont[0] + 12) % 24;
        } else if (time.toLowerCase().indexOf("am") !== -1) {
            timeCont = time
                .toLowerCase()
                .replace("am", "00")
                .split(":")
                .map((a) => +a);
        } else {
            timeCont = (time.toLowerCase() + "00").split(":").map((a) => +a);
        }
        dateCont = date.split("/").map((a) => +a);

        return dateCont.join("") + "T" + (timeCont[0] - 2) + timeCont[1] + "Z";
    }
}
