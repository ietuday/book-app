import { Component, Input, Output, EventEmitter, Inject } from "@angular/core";
import { Book } from "../../../models/Book";
import { APP_CONFIG } from "../../../app.config";
import { IAppConfig } from "../../../models/AppConfig";

@Component({
  selector: 'ba-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css']
})
export class BookListComponent {
  @Input() books: Book[];
  @Input() title: string;
  @Input() page: string;
  @Output() rated = new EventEmitter<Book>();
  @Output() sortChanged = new EventEmitter<string>();
  @Output() searchChanged = new EventEmitter<string>();
  @Output() removedFromMustread = new EventEmitter<Book>();
  @Output() removedFromFavourites = new EventEmitter<Book>();
  @Output() removedFromWishlist = new EventEmitter<Book>();
  sort: string = '';

  constructor(
    @Inject(APP_CONFIG) private config: IAppConfig
  ) {}

  changeSorting(event) {
    this.sortChanged.emit(event.target.value);
  }

  search(event) {
    this.searchChanged.emit(event.target.value);
  }

  rate(book: Book) {
    this.rated.emit(book);
  }

  removeFromMustread(event, book: Book) {
    event.stopPropagation();
    event.preventDefault();
    this.removedFromMustread.emit(book);
  }

  removeFromFavourites(event, book: Book) {
    event.stopPropagation();
    event.preventDefault();
    this.removedFromFavourites.emit(book);
  }

  removeFromWishlist(event, book: Book) {
    event.stopPropagation();
    event.preventDefault();
    this.removedFromWishlist.emit(book);
  }
}
