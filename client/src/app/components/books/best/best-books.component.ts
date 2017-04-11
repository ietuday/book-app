import { Component, style, state, animate, transition, trigger, OnInit } from "@angular/core";
import { Location } from '@angular/common';
import { Book } from "../../../models/Book";
import { BookService } from "../../../services/book.service";
import { HistoryService } from "../../../services/history.service";

@Component({
  templateUrl: './best-books.component.html',
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
export class BestBooksComponent implements OnInit {
  books: Book[];
  isLoading: boolean = false;
  private title: string;
  private page: string;

  constructor(
    private _bookService: BookService,
    private _location: Location,
    private _historyService: HistoryService
  ) {}

  rate(book: Book) {
    this._bookService.rateBook(book._id, book.rating)
      .switchMap(() => {
        return this._historyService.addToHistory(`You rated ${book.title} by ${book.author}`);
      })
      .subscribe();
  }

  ngOnInit() {
    this.isLoading = true;
    this.page = this._location.path();
    this.title = 'Best Books';

    this._bookService.getBestBooks()
      .finally(() => {
        this.isLoading = false;
      })
      .subscribe(res => {
        this.books = res;
      });
  }
}
