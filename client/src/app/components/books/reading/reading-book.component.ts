import { Component, style, animate, transition, state, trigger, OnInit, OnDestroy, Inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { UserService } from "../../../services/user.service";
import { User } from "../../../models/User";
import { Subscription } from "rxjs";
import { BookService } from "../../../services/book.service";
import { APP_CONFIG } from "../../../app.config";
import { IAppConfig } from "../../../models/AppConfig";

@Component({
  templateUrl: './reading-book.component.html',
  host: {
    '[@routeAnimation]': 'true',
    'style': 'position: absolute; width: 100%; height: 100%;'
  },
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
export class ReadingBookComponent implements OnInit, OnDestroy {
  private reader: any;
  user: User;
  private subscription: Subscription;
  private epubUrl: string;

  constructor(
    private _route: ActivatedRoute,
    private _userService: UserService,
    private _bookService: BookService,
    @Inject(APP_CONFIG) private config: IAppConfig
  ) {}

  ngOnInit() {
    EPUBJS.cssPath = window.location.origin + '/';

    this.subscription = this._userService.currentUser
      .subscribe(user => {
        this.user = user;
      });

    this._route.params.forEach(param => {
      let slug = param['slug'];
      if(slug) {
        this._bookService.getBook(slug)
          .subscribe(book => {
            this.epubUrl = `${this.config.baseUrl}${book.epubUrl}`;
            this.reader = ePubReader(this.epubUrl);
          });
      } else {
        this.epubUrl = this.user.reading.epubUrl;
        if(this.epubUrl) {
          this.reader = ePubReader(this.user.reading.epubUrl);
          if(this.user.reading.bookmark) {
            this.reader.book.gotoCfi(this.user.reading.bookmark);
          }
        }
      }
    });
  }

  ngOnDestroy() {
    if(this.epubUrl) {
      this.user.reading.epubUrl = this.epubUrl;
      this.user.reading.bookmark = this.reader.book.getCurrentLocationCfi();
      this._userService.update(this.user._id, this.user).subscribe();
    }
    this.subscription.unsubscribe();
  }
}
