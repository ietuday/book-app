import { Component, Input } from "@angular/core";

@Component({
  selector: 'ba-alert',
  templateUrl: './alert.component.html'
})
export class AlertComponent {
  @Input() text: string;
  @Input() type: string;
}
