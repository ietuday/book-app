import { Component, style, state, animate, transition, trigger, OnInit, OnDestroy } from "@angular/core";
import { Location } from '@angular/common';
import { BookService } from "../../../services/book.service";
import { Book } from "../../../models/Book";
import { Subject, Subscription } from "rxjs";
import { HistoryService } from "../../../services/history.service";

@Component({
  templateUrl: './browse-books.component.html',
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
export class BrowseBooksComponent implements OnInit, OnDestroy {
  books: Book[];
  isLoading: boolean = false;
  private searchStream = new Subject<string>();
  private sortBy;
  private searchTerm: string;
  private subscription: Subscription;
  private paid: boolean;
  private title: string;
  private page: string;

  constructor(
    private _bookService: BookService,
    private _location: Location,
    private _historyService: HistoryService
  ) {}

  sort(event) {
    this.sortBy = event;
    this.isLoading = true;
    this._bookService.getBooks({ paid: this.paid, sort: this.sortBy, search: this.searchTerm })
      .finally(() => {
        this.isLoading = false;
      })
      .subscribe(res => {
        this.books = res;
      });
  }

  search(event) {
    this.searchTerm = event;
    this.searchStream.next(this.searchTerm);
  }

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
    this.paid = this.page.includes('buy');
    this.title = this.paid ? 'Browse Books To Buy' : 'Browse Free Books';

    this._bookService.getBooks({paid: this.paid})
      .finally(() => {
        this.isLoading = false;
      })
      .subscribe(res => {
        this.books = res;
      });

    this.subscription = this.searchStream
      .debounceTime(300)
      .distinctUntilChanged()
      .switchMap((searchStr: string) => {
        this.isLoading = true;
        return this._bookService.getBooks({ paid: this.paid, search: searchStr, sort: this.sortBy });
      })
      .subscribe(res => {
        this.isLoading = false;
        this.books = res;
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
