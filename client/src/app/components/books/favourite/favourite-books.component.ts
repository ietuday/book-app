import { Component, style, state, animate, transition, trigger } from "@angular/core";
import { Book } from "../../../models/Book";
import { FavouriteService } from "../../../services/favourite.service";
import { BookService } from "../../../services/book.service";
import { Location } from '@angular/common';
import * as ErrorHandler from '../../../helpers/errorHandler';
import { HistoryService } from "../../../services/history.service";

@Component({
  templateUrl: './favourite-books.component.html',
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
export class FavouriteBooksComponent {
  books: Book[];
  isLoading: boolean = false;
  error: string;
  private title: string;
  private page: string;

  constructor(
    private _favouriteService: FavouriteService,
    private _bookService: BookService,
    private _location: Location,
    private _historyService: HistoryService
  ) {}

  rate(book) {
    this._bookService.rateBook(book._id, book.rating)
      .switchMap(() => {
        return this._historyService.addToHistory(`You rated ${book.title} by ${book.author}`);
      })
      .subscribe();
  }

  removeFromFavourites(book: Book) {
    this._favouriteService.removeFromFavourites(book._id)
      .switchMap(() => {
        return this._historyService.addToHistory(`You removed ${book.title} by ${book.author} from Favourites`);
      })
      .subscribe(
        () => {
          this.getFavourites();
        },
        err => {
          this.error = ErrorHandler.handleError(err.json());
        }
      );
  }

  private getFavourites() {
    this.isLoading = true;
    this.page = this._location.path();
    this.title = 'Favourite Books';

    this._favouriteService.getFavourites()
      .finally(() => {
        this.isLoading = false;
      })
      .subscribe(res => {
        if(res) {
          this.books = res.books;
        }
      });
  }

  ngOnInit() {
    this.getFavourites();
  }
}
