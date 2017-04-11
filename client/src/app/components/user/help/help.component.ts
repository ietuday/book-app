import { Component, style, state, animate, transition, trigger, OnInit, OnDestroy } from "@angular/core";
import { User } from "../../../models/User";
import { UserService } from "../../../services/user.service";
import { ChatService } from "../../../services/chat.service";
import { Subscription } from "rxjs";

@Component({
  templateUrl: './help.component.html',
  host: {
    '[@routeAnimation]': 'true',
    'style': 'position: absolute; width: 100%; height: 100%;'
  },
  styleUrls: ['./help.component.css'],
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
export class HelpComponent implements OnInit, OnDestroy {
  private user: User;
  private userSub: Subscription;
  private chatSub: Subscription;
  messages: any = [];
  question: string;

  constructor(
    private _userService: UserService,
    private _chatService: ChatService
  ) {}

  sendQuestion() {
    this._chatService.sendQuestion(this.question, this.user.displayName);
    this.question = '';
  }

  sendAnswer(msg) {
    this._chatService.sendAnswer(msg.answer, this.user.displayName, msg.socketId);
    msg.boxShown = false;
  }

  ngOnInit() {
    this.userSub = this._userService.currentUser
      .subscribe(user => {
        if(user) {
          this.user = user;
          if(this.user.roles.indexOf('admin') > -1) {
            this.chatSub = this._chatService.questionsStream
              .subscribe(messages => {
                this.messages = messages;
              });
          } else {
            this.chatSub = this._chatService.answersStream
              .subscribe(messages => {
                this.messages = messages;
              });
          }
        }
      });
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
    this.chatSub.unsubscribe()
  }
}
