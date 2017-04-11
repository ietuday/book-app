import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from "../../services/user.service";
import { User} from "../../models/User";
import { Subscription } from "rxjs";
import { HistoryService } from "../../services/history.service";
import { convert } from '../../helpers/date.helper';

@Component({
  selector: 'ba-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  user: User;
  userHistory: any;
  userSub: Subscription;
  historySub: Subscription;

  constructor(
    private _userService: UserService,
    private _historyService: HistoryService
  ) {}

  ngOnInit() {
    this.userSub = this._userService.currentUser
      .subscribe(user => this.user = user);

    this.historySub = this._historyService.userHistory
      .subscribe(history => {
        if(history && history.length) {
          history.reverse();
          this.userHistory = history.slice(0,3);
          this.userHistory.map(item => {
            return item.committed_at = convert(item.committed_at);
          });
        }
      });
  }

  ngOnDestroy() {
    this.historySub.unsubscribe();
    this.userSub.unsubscribe();
  }
}
