import * as Parser from "./parser"; // --> OFF

/* tslint:disable: no-non-null-assertion*/

export function evaluate(input: string): object[] | null {
    const p = new Parser.Parser(input);
    const tree = p.parse();
    if (tree.errs.length === 0 && tree.ast)
        return calcRoot(tree.ast, {
            rooms: [],
            papers: [],
            events: [],
            scheduleByDay: new Map(),
        });
    console.log("" + tree.errs);
    return null;
}

function calcRoot(node: Parser.Root, context: Context): object[] {
    calcRooms(node.rooms, context);
    calcPapers(node.papers, context);
    calcEvents(node.events, context);
    calcProgram(node.program, context);
    const out = [];

    const fullSchedule = context.scheduleByDay;
    for (const [day, schedule] of fullSchedule) {
        const entry: any = {};
        entry.name = day.toDateString();
        entry.rooms = schedule.getRooms();
        entry.sessionGroups = [];
        const times = schedule.getTimes();
        const roomsSchedule: ((TimeSlot | null)[] | undefined)[] = [];
        for (const room of entry.rooms) {
            roomsSchedule.push(schedule.getTimeSlots(room));
        }

        for (let t = 0; t < times.length - 1; t++) {
            const line = [];
            // add time on left
            const startTime: string = times[t]
                .toISOString()
                .split("T")[1]
                .substring(0, 5);
            line.push({ start: startTime, rowSpan: 1 });
            // for each room add the appropriate event or nothing if rowspan
            for (let roomID = 0; roomID < roomsSchedule.length; roomID++) {
                const roomSchedule = roomsSchedule[roomID];
                if (roomSchedule) {
                    const slot = roomSchedule[t];
                    if (slot && slot.getEvent()) {
                        const event = slot.getEvent();
                        const theEvent: any = {
                            // tslint:disable-next-line:no-non-null-assertion
                            title: event!.name,
                        };

                        // tslint:disable-next-line:no-non-null-assertion
                        if (event!.abstract)
                            theEvent.abstract = event!.abstract;
                        if (event!.type) theEvent.type = event!.type;
                        if (event!.organizers)
                            theEvent.organizers = event!.organizers;
                        if (event!.papers) theEvent.papers = event!.papers;

                        line.push({
                            start: startTime,
                            end: slot
                                .getEnd()
                                .toISOString()
                                .split("T")[1]
                                .substring(0, 5),
                            rowSpan: slot.getRowspan(),
                            date: day.toISOString().split("T")[0],
                            room: entry.rooms[roomID],
                            events: [theEvent],
                        });
                    } else if (slot) {
                        line.push({
                            rowSpan: 1,
                        });
                    }
                }
            }
            entry.sessionGroups.push(line);
        }
        const line1 = [];
        line1.push({
            end: times[times.length - 1]
                .toISOString()
                .split("T")[1]
                .substring(0, 5),
            rowSpan: 1,
        });
        for (const room of entry.rooms) {
            line1.push({ rowSpan: 1 });
        }
        entry.sessionGroups.push(line1);
        out.push(entry);
    }
    // console.log(context);
    return out;
}

function calcRooms(node: Parser.Rooms, context: Context): void {
    for (const room of node.rooms) {
        const theRoom = calcRoom(room, context);
        context.rooms.push(theRoom);
    }
}

function calcRoom(node: Parser.Room, context: Context): Room {
    const out: Room = { name: node.name };
    // tslint:disable-next-line:radix
    if (node.capacite) out.capacity = parseInt(node.capacite.value);
    return out;
}

function calcPapers(node: Parser.Papers, context: Context): void {
    for (const paper of node.papers) {
        const thePaper = calcPaper(paper, context);
        context.papers.push(thePaper);
    }
}

function calcPaper(node: Parser.Paper, context: Context): Paper {
    const thePaper: Paper = {
        authors: [],
        title: node.paperName,
    };
    if (node.abstract) thePaper.abstract = calcAbstract(node.abstract, context);
    if (node.video) thePaper.video = calcVideo(node.video, context);

    for (const author of node.authors) {
        const theAuthor = calcPerson(author, context);
        thePaper.authors.push(theAuthor);
    }
    return thePaper;
}

function calcPerson(node: Parser.Person, context: Context): Person {
    const out: Person = {
        name: node.name,
    };
    if (node.about) out.about = node.about.value;
    if (node.homepage) out.homepage = node.homepage.value;
    if (node.email) out.email = node.email.value;
    return out;
}

function calcAbstract(node: Parser.Abstract, context: Context): string {
    return node.text;
}

function calcVideo(node: Parser.Video, context: Context): string {
    return node.url;
}

function calcEvents(node: Parser.Events, context: Context): void {
    for (const event of node.events) {
        const theEvent = calcEvent(event, context);
        context.events.push(theEvent);
    }
}
function calcEvent(node: Parser.Event, context: Context): Event {
    if (node.kind === Parser.ASTKinds.SimpleEvent) {
        return calcSimpleEvent(node, context);
    }
    if (node.kind === Parser.ASTKinds.OrganizedEvent) {
        return calcOrganizedEvent(node, context);
    }
    if (node.kind === Parser.ASTKinds.TalkSession) {
        return calcTalkSession(node, context);
    }
    return { name: "ERROR" };
}
function calcSimpleEvent(node: Parser.SimpleEvent, context: Context): Event {
    const out: Event = {
        name: node.eventName,
    };
    if (node.abstract) out.abstract = calcAbstract(node.abstract, context);
    return out;
}
function calcOrganizedEvent(
    node: Parser.OrganizedEvent,
    context: Context
): Event {
    const organizers = [];
    for (const person of node.organizers) {
        organizers.push(calcPerson(person, context));
    }
    const out: Event = {
        name: node.eventName,
        type: node.eventType,
        organizers,
    };
    if (node.abstract) out.abstract = calcAbstract(node.abstract, context);
    return out;
}
function calcTalkSession(node: Parser.TalkSession, context: Context): Event {
    const papersList = [];
    for (const entry of node.papers) {
        const paperName = entry.name;
        for (const paper of context.papers) {
            if (paper.title === paperName) {
                papersList.push(paper);
            }
        }
    }
    const organizers = [];
    for (const person of node.organizers) {
        organizers.push(calcPerson(person, context));
    }
    const out: Event = {
        name: node.eventName,
        type: node.eventType,
        organizers,
        papers: papersList,
    };
    if (node.abstract) out.abstract = calcAbstract(node.abstract, context);
    return out;
}

function calcProgram(node: Parser.Program, context: Context): void {
    for (const day of node.days) {
        const schedule: Schedule = calcDay(day, context);
        schedule.sortAndFillHoles();
    }
}

function calcDay(node: Parser.Day, context: Context): Schedule {
    const schedule = new Schedule();
    context.scheduleByDay.set(parseISOString(node.date + "T00:00"), schedule);
    for (const infos of node.eventinfo) {
        const session: Session = calcEventInfo(infos, context);
        const startIso = node.date + "T" + session.start;
        const endIso = node.date + "T" + session.end;
        const ts: TimeSlot = new TimeSlot(
            parseISOString(startIso),
            parseISOString(endIso),
            session.event
        );
        schedule.add(session.room, ts);
    }
    return schedule;
}

function calcEventInfo(node: Parser.EventInfo, context: Context): Session {
    let theEvent: Event = { name: "Event not Found" };
    for (const event of context.events) {
        if (event.name === node.eventName) {
            theEvent = event;
            break;
        }
    }
    let theRoom: Room = { name: "Room not Found" };
    for (const room of context.rooms) {
        if (room.name === node.roomName) {
            theRoom = room;
            break;
        }
    }

    return {
        start: node.timeSlot.start,
        end: node.timeSlot.end,
        room: theRoom,
        event: theEvent,
    };
}

// Interfaces

interface Context {
    rooms: Room[];
    papers: Paper[];
    events: Event[];
    scheduleByDay: Map<Date, Schedule>;
}

interface Paper {
    authors: Person[];
    title: string;
    abstract?: string;
    video?: string;
}

interface Person {
    name: string;
    about?: string;
    homepage?: string;
    email?: string;
}

interface Event {
    name: string;
    abstract?: string;
    type?: string;
    organizers?: Person[];
    papers?: Paper[];
}

interface Room {
    name: string;
    capacity?: number;
}

interface Session {
    start: string;
    end: string;
    room: Room;
    event: Event;
}

// Schedule class

class Schedule {
    private schedulePerRoom: Map<Room, (TimeSlot | null)[]>;
    private displayTimes: Date[];
    constructor() {
        this.schedulePerRoom = new Map();
        this.displayTimes = [];
    }
    getTimes(): Date[] {
        return this.displayTimes;
    }
    getRooms(): Room[] {
        return Array.from(this.schedulePerRoom.keys());
    }
    getTimeSlots(room: Room): (TimeSlot | null)[] | undefined {
        return this.schedulePerRoom.get(room);
    }
    add(room: Room, timeslot: TimeSlot) {
        let slots: (TimeSlot | null)[] | undefined = this.schedulePerRoom.get(
            room
        );
        if (!slots) {
            slots = [];
            this.schedulePerRoom.set(room, slots);
        }
        slots!.push(timeslot);
    }
    sortAndFillHoles() {
        const timeSet: DateSet = new DateSet();
        for (const [room, slots] of this.schedulePerRoom) {
            const sorted = slots.sort(
                (obj1: TimeSlot | null, obj2: TimeSlot | null) => {
                    return obj1!.compareTo(obj2);
                }
            );
            this.schedulePerRoom.set(room, sorted);
            for (const slot of sorted) {
                timeSet.add(slot!.getStart());
                timeSet.add(slot!.getEnd());
            }
        }
        this.displayTimes = Array.from(timeSet.values()).sort(
            (a: Date, b: Date) => {
                return a.getTime() - b.getTime();
            }
        );
        for (const [room, slots] of this.schedulePerRoom) {
            let slotIndex = 0;

            for (let index = 0; index < this.displayTimes.length - 1; index++) {
                if (slotIndex >= slots.length) {
                    const ts: TimeSlot = new TimeSlot(
                        this.displayTimes[index],
                        this.displayTimes[index + 1],
                        null
                    );
                    slots.push(ts);
                    slotIndex++;
                } else if (
                    Math.abs(
                        this.displayTimes[index].getTime() -
                            slots[slotIndex]!.getStart().getTime()
                    ) < 60000
                ) {
                    let rowspan = 0;
                    while (
                        Math.abs(
                            this.displayTimes[index + rowspan].getTime() -
                                slots[slotIndex]!.getEnd().getTime()
                        ) > 60000
                    ) {
                        rowspan++; // compute rowspan
                    }
                    for (let i = 1; i < rowspan; i++) {
                        slots.splice(slotIndex + 1, 0, null);
                    }
                    index += rowspan - 1; // counter the loop ++
                    slots[slotIndex]!.setRowspan(rowspan);
                    slotIndex += rowspan;
                } else if (
                    this.displayTimes[index].getTime() <
                    slots[slotIndex]!.getStart().getTime()
                ) {
                    const ts: TimeSlot = new TimeSlot(
                        this.displayTimes[index],
                        this.displayTimes[index + 1],
                        null
                    );
                    slots.splice(slotIndex, 0, ts);
                    slotIndex++;
                }
            }
        }
    }
}

class TimeSlot {
    private start: Date;
    private end: Date;
    private event: Event | null;
    private rowspan: number;
    constructor(start: Date, end: Date, event: Event | null) {
        this.start = start;
        this.end = end;
        this.event = event;
        this.rowspan = 1;
    }

    compareTo(other: TimeSlot | null): number {
        return this.start.getTime() - other!.start.getTime();
    }
    getStart(): Date {
        return this.start;
    }
    getEnd(): Date {
        return this.end;
    }
    getEvent(): Event | null {
        return this.event;
    }
    setRowspan(rowspan: number) {
        this.rowspan = rowspan;
    }
    getRowspan(): number {
        return this.rowspan;
    }
}

class DateSet {
    private set: Set<Date>;
    constructor() {
        this.set = new Set();
    }
    add(item: Date) {
        const itemTime = item.getTime();
        for (const elem of this.set) {
            if (Math.abs(itemTime - elem.getTime()) < 60000) {
                return;
            }
        }
        this.set.add(item);
    }
    values() {
        return this.set.values();
    }
}

function parseISOString(iso: string): Date {
    const numbers: string[] = iso.split(/\D+/);
    return new Date(
        Date.UTC(
            // tslint:disable: radix
            parseInt(numbers[0]),
            parseInt(numbers[1]) - 1,
            parseInt(numbers[2]),
            parseInt(numbers[3]),
            parseInt(numbers[4]),
            0,
            0
        )
    );
}
