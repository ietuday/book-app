import { Component, trigger, transition, animate, style, state } from '@angular/core';
import { UserService } from "../../services/user.service";

@Component({
  templateUrl: './home.component.html',
  host: {
    '[@routeAnimation]': 'true'
  },
  styles: [':host { position: absolute; width: 100%; height: 100%; }'],
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
export class HomeComponent {
  title: string = 'Book Application';

  constructor(private _userService: UserService) {}
}
