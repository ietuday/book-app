import {
  Component, animate, style, transition, state, trigger, OnInit, OnDestroy, ViewChild, ElementRef, Renderer, Inject
} from "@angular/core";
import { Book } from "../../../models/Book";
import { BookService } from "../../../services/book.service";
import { UserService } from "../../../services/user.service";
import { ActivatedRoute, Router } from "@angular/router";
import { User } from "../../../models/User";
import { Subscription } from "rxjs";
import { MustreadService } from "../../../services/mustread.service";
import * as ErrorHandler from '../../../helpers/errorHandler';
import * as CreditCardHelper from '../../../helpers/creditCard.helper';
import { FavouriteService } from "../../../services/favourite.service";
import { WishlistService } from "../../../services/wishlist.service";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ValidatorHelper } from "../../../helpers/validator.helper";
import { HistoryService } from "../../../services/history.service";
import { APP_CONFIG } from "../../../app.config";
import { IAppConfig } from "../../../models/AppConfig";

@Component({
  templateUrl: './book-details.component.html',
  host: {
    '[@routeAnimation]': 'true',
    'style': 'position: absolute; width: 100%; height: 100%;'
  },
  styleUrls: ['./book-details.component.css'],
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
export class BookDetailsComponent implements OnInit, OnDestroy {
  book: Book;
  user: User;
  buyForm: FormGroup;
  isLoading: boolean = false;
  success: string;
  error: string;
  private subscription: Subscription;
  private buyFormVisible: boolean = false;
  isSubmitting: boolean = false;
  private isDownloading: boolean = false;
  typecard: string;
  @ViewChild('buyFormRef') buyFormRef: ElementRef;

  constructor(
    private _bookService: BookService,
    private _userService: UserService,
    private _route: ActivatedRoute,
    private _mustreadService: MustreadService,
    private _favouriteService: FavouriteService,
    private _wishlistService: WishlistService,
    private _renderer: Renderer,
    private _router: Router,
    private _historyService: HistoryService,
    @Inject(APP_CONFIG) private config: IAppConfig
  ) {}

  rate(book: Book) {
    this._bookService.rateBook(book._id, book.rating)
      .switchMap(() => {
        return this._historyService.addToHistory(`You rated ${book.title} by ${book.author}`);
      })
      .subscribe();
  }

  addToMustread() {
    this._mustreadService.addToMustread(this.book._id)
      .switchMap(() => {
        return this._historyService.addToHistory(`You added ${this.book.title} by ${this.book.author} to Must Read Titles`);
      })
      .subscribe(
        () => {
          this.success = 'Book Added To Must Read Titles!'
        },
        err => {
          this.error = ErrorHandler.handleError(err.json());
        }
      );
  }

  addToFavourites() {
    this._favouriteService.addToFavourites(this.book._id)
      .switchMap(() => {
        return this._historyService.addToHistory(`You added ${this.book.title} by ${this.book.author} to Favourites`);
      })
      .subscribe(
        () => {
          this.success = 'Book Added To Favourites!'
        },
        err => {
          this.error = ErrorHandler.handleError(err.json());
        }
      );
  }

  addToWishlist() {
    this._wishlistService.addToWishlist(this.book._id)
      .switchMap(() => {
        return this._historyService.addToHistory(`You added ${this.book.title} by ${this.book.author} to Wishlist`);
      })
      .subscribe(
        () => {
          this.success = 'Book Added To Wishlist!'
        },
        err => {
          this.error = ErrorHandler.handleError(err.json());
        }
      );
  }

  showBuyForm() {
    this.buyFormVisible = true;
  }

  correctPan(event) {
    this.buyForm.controls['cardNumber'].setValue(CreditCardHelper.formatPan(event.target.value));
  }

  buyBook() {
    if(this.buyForm.valid) {
      let url;
      this._bookService.buyBook(this.book._id, CreditCardHelper.correctNumber(this.buyForm.value.cardNumber))
        .switchMap(res => {
          url = res.url;
          return this._historyService.addToHistory(`You bought ${this.book.title} by ${this.book.author}`);
        })
        .subscribe(
          () => {
            this.createDownloadLink(url);
            this.buyFormVisible = false;
            this.isDownloading = true;
          },
          err => {
            this.error = ErrorHandler.handleError(err.json());
          }
        );
    }
  }

  removeBook() {
    const isConfirmed = confirm('Do you want to remove the book?'),
      path = this._route.snapshot.url[0].path;
    if(isConfirmed) {
      this._bookService.remove(this.book.slug)
        .switchMap(() => {
          return this._historyService.addToHistory(`You removed ${this.book.title} by ${this.book.author}`);
        })
        .subscribe(
          () => {
            this._router.navigate([path]);
          },
          err => {
            this.error = ErrorHandler.handleError(err.json());
          }
        );
    }
  }

  private createDownloadLink(href: string): void {
    let aElem = this._renderer.createElement(this.buyFormRef.nativeElement.parentNode, 'a');
    this._renderer.createText(aElem, 'Download Book');
    this._renderer.setElementAttribute(aElem, 'href', href);
    this._renderer.setElementClass(aElem, 'download-link', true);
    this._renderer.listen(aElem, 'click', () => {
      this._renderer.detachView([aElem]);
      this.isDownloading = false;
    });
  }

  ngOnInit() {
    this.isLoading = true;
    this.subscription = this._userService.currentUser
      .subscribe(user => {
        this.user = user;
      });

    this._route.params.forEach(param => {
      let slug = param['slug'];
      this._bookService.getBook(slug)
        .finally(() => { this.isLoading = false; })
        .subscribe(res => {
          this.book = res;
        });
    });

    this.buyForm = new FormGroup({
      cardNumber: new FormControl('', Validators.compose([
        Validators.required,
        ValidatorHelper.isCreditCard
      ]))
    });

    this.buyForm.controls['cardNumber'].valueChanges
      .subscribe(value => {
        this.typecard = CreditCardHelper.detectCardType(CreditCardHelper.correctNumber(value));
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
