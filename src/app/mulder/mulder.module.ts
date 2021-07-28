/* tslint:disable: ordered-imports*/
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";

import { MarkdownModule } from "ngx-markdown";
import { AutosizeModule } from "ngx-autosize";

/* Modules */
import { NavigationModule } from "@app/navigation/navigation.module";

/* Components */
import * as mulderComponents from "./components";

/* Containers */
import * as mulderContainers from "./containers";
import { AngularD3CloudModule } from "angular-d3-cloud";

/* Guards */
// import * as blogGuards from './guards';

/* Services */
// import * as blogServices from './services';
import { IconsModule } from "../icons/icons.module";
import { ScullyLibModule } from "@scullyio/ng-lib";
import { SurveypluginModule } from "../surveyplugin/surveyplugin.module";
import { ProgramAgendapluginModule } from "@app/programdsl/programagendaplugin.module";

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        AngularD3CloudModule,
        MarkdownModule.forChild(),
        AutosizeModule,
        IconsModule,
        ScullyLibModule,
        NavigationModule,
        SurveypluginModule,
        ProgramAgendapluginModule,
    ],
    // providers: [...blogServices.services, ...blogGuards.guards],
    declarations: [
        ...mulderContainers.containers,
        ...mulderComponents.components,
    ],
    exports: [...mulderContainers.containers, ...mulderComponents.components],
})
export class MudlerModule {}
