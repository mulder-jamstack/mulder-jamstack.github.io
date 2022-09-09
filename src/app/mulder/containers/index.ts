import { SortByPipe } from "../sort-by.pipe";

import { AboutComponent } from "./about/about.component";
import { BlogComponent } from "./blog/blog.component";
import { BlogsComponent } from "./blogs/blogs.component";
import { DynamicMdComponent } from "./dynamic-md/dynamic-md.component";
import { HomeComponent } from "./home/home.component";
import { ProgramDemoComponent } from "./programdemo/programdemo.component";
import { AuthorPipe } from "./publications/author.pipe";
import { DescbibPipe } from "./publications/descbib.pipe";
import { PublicationsComponent } from "./publications/publications.component";
import { StaticComponent } from "./static/static.component";
import { SurveyDemoComponent } from "./surveydemo/surveydemo.component";

export const containers = [
    HomeComponent,
    AboutComponent,
    PublicationsComponent,
    DynamicMdComponent,
    StaticComponent,
    BlogComponent,
    BlogsComponent,
    SurveyDemoComponent,
    ProgramDemoComponent,
    AuthorPipe,
    DescbibPipe,
    SortByPipe,
];

export * from "./home/home.component";
export * from "./about/about.component";
export * from "./publications/publications.component";
export * from "./dynamic-md/dynamic-md.component";
export * from "./blog/blog.component";
export * from "./blogs/blogs.component";
export * from "./static/static.component";
export * from "./surveydemo/surveydemo.component";
export * from "./programdemo/programdemo.component";
