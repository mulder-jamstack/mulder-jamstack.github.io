import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
} from "@angular/core";

@Component({
    selector: "mulder-programdemo",
    templateUrl: "./programdemo.component.html",
    styleUrls: ["programdemo.component.scss"],
})
export class ProgramDemoComponent implements OnInit, OnDestroy {
    constructor(private http: HttpClient) {}

    // canbesaved = true;

    ngOnInit(): void {}

    sendFinalData(result: any) {}

    ngOnDestroy() {}
}
