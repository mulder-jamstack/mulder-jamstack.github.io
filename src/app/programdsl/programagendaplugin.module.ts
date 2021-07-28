import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { IconsModule } from "../icons/icons.module";

import { ProgramComponent } from "./component/program/program.component";

@NgModule({
    declarations: [ProgramComponent],
    imports: [CommonModule, IconsModule],
    exports: [ProgramComponent],
})
export class ProgramAgendapluginModule {}
