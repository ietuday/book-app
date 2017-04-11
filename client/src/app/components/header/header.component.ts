import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { UserService } from "../../services/user.service";
import { Router } from "@angular/router";
import { User } from "../../models/User";
import { Subscription } from "rxjs";
import { ChatService } from "../../services/chat.service";
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { IAppConfig } from "../../models/AppConfig";
import { APP_CONFIG } from "../../app.config";

@Component({
  selector: 'ba-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  user: User;
  userSub: Subscription;
  chatSub: Subscription;
  msgSub: Subscription;
  isAdminOnline: boolean = false;

  constructor(
    private _userService: UserService,
    private _router: Router,
    private _chatService: ChatService,
    private _toastr: ToastsManager,
    @Inject(APP_CONFIG) private config: IAppConfig
  ) {}

  signout() {
    this._userService.logout();
    this._router.navigate(['']);
  }

  ngOnInit() {
    this.userSub = this._userService.currentUser
      .subscribe(user => {
        if(user) {
          this.user = user;
          if(this.user.roles.indexOf('admin') > -1) {
            this._chatService.getQuestions();
            this.msgSub = this._chatService.questionsStream
              .subscribe(msg => {
                msg && this._toastr.info(msg[msg.length - 1].text, msg[msg.length - 1].author);
              });
          } else {
            this._chatService.getAnswers();
            this.msgSub = this._chatService.answersStream
              .subscribe(msg => {
                msg && this._toastr.info(msg[msg.length - 1].text, msg[msg.length - 1].author);
              });
          }
        }
      });

    this.chatSub = this._chatService.getAdminConnection()
      .subscribe(res => {
        if(res === 'connected') {
          this.isAdminOnline = true;
        }

        if(res === 'disconnected') {
          this.isAdminOnline = false;
        }
      });
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
    this.chatSub.unsubscribe();
    this.msgSub.unsubscribe();
  }
}
