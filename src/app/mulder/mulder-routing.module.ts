/* tslint:disable: ordered-imports*/
import { NgModule } from "@angular/core";
import { Routes, RouterModule, ExtraOptions } from "@angular/router";

/* Module */
import { MudlerModule } from "./mulder.module";

/* Containers */
import * as mulderContainers from "./containers";
import { BlogComponent } from "./containers/blog/blog.component";
import { BlogsComponent } from "./containers/blogs/blogs.component";
import { StaticComponent } from "./containers/static/static.component";

/* Routes */
export const ROUTES: Routes = [
    // Demo simple component
    {
        path: "",
        component: mulderContainers.HomeComponent,
    },
    // Demo simple component
    {
        path: "about",
        component: mulderContainers.AboutComponent,
    },
    {
        path: "surveydemo",
        component: mulderContainers.SurveyDemoComponent,
    },
    {
        path: "dslconfagenda",
        component: mulderContainers.ProgramDemoComponent,
    },

    // Demo complex component that consumes microservices (hal)
    {
        path: "publications",
        component: mulderContainers.PublicationsComponent,
    },
    // Demo complex component dynamic md content from microservices
    {
        path: "d/:cat/:slug",
        component: mulderContainers.DynamicMdComponent,
    },
    // Demo blog static
    {
        path: "blog/:slug",
        component: BlogComponent,
    },
    // Demo blog static (list of posts)
    {
        path: "blog",
        component: BlogsComponent,
    },
    // Demo static page from md
    {
        path: "s/:slug",
        component: StaticComponent,
    },
];

@NgModule({
    imports: [MudlerModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class BlogRoutingModule {}
