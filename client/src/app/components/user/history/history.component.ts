import { Component, style, state, animate, transition, trigger, OnInit } from "@angular/core";
import { HistoryService } from "../../../services/history.service";

@Component({
  templateUrl: './history.component.html',
  host: {
    '[@routeAnimation]': 'true',
    'style': 'position: absolute; width: 100%; height: 100%;'
  },
  styleUrls: ['./history.component.css'],
  animations: [
    trigger('routeAnimation', [
      state('*', style({transform: 'translateX(0)', opacity: 1})),
      transition('void => *', [
        style({transform: 'translateX(-100%)', opacity: 0}),
        animate('0.5s cubic-bezier(0.215, 0.610, 0.355, 1.000)')
      ]),
      transition('* => void',
        animate('0.5s cubic-bezier(0.215, 0.610, 0.355, 1.000)', style({
          transform: 'translateX(100%)',
          opacity: 0
        }))
      )
    ])
  ]
})
export class HistoryComponent implements OnInit {
  history: any;

  constructor(
    private _historyService: HistoryService
  ) {}

  ngOnInit() {
    this._historyService.getHistory()
      .subscribe(res => {
        res.actions.reverse();
        this.history = res.actions;
      });
  }
}
