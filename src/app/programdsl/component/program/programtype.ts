export interface Day {
    name?: string;
    rooms?: Room[];
    sessionGroups: Array<SessionGroup[]>;
}

export interface Room {
    name: string;
    capacity: number | null;
}

export interface SessionGroup {
    start?: string;
    rowSpan: number;
    end?: string;
    date?: Date;
    room?: Room;
    events?: Event[];
    icalStart?: string;
}

export interface Event {
    title: string;
    type: Type;
    organizers: Organizer[];
    description?: string;
    papers?: Paper[];
    selected?: boolean;
    icalStart?: string;
    speaker?: Author;
    abstract?: string;
    video?: null;
    url?: string;
    sessionchairs?: Organizer[];
    authors?: Author[];
}

export interface Organizer {
    name: string;
    email?: string;
}

export interface Paper {
    authors?: Author[];
    title?: string;
    abstract?: string;
    video?: null;
    selected?: boolean;
    icalStart?: string;
    speaker?: Author;
    type?: Type;
    url?: string;
    organizers?: Organizer[];
    papers?: Paper[];
    sessionchairs?: Organizer[];
    description?: string;
}

export interface Author {
    name: string;
    email?: string;
    homepage?: string;
}

export enum Type {
    Clinic = "Clinic",
    CoffeeBreak = "CoffeeBreak",
    Keynote = "Keynote",
    Meeting = "Meeting",
    Opening = "Opening",
    Panel = "Panel",
    Poster = "Poster",
    Reception = "Reception",
    Src = "SRC",
    TalkSession = "TalkSession",
    Tutorial = "Tutorial",
    Workshop = "Workshop",
}
