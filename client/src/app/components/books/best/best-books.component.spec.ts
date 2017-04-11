import { BestBooksComponent } from "./best-books.component";
import { TestBed, fakeAsync, tick, inject } from "@angular/core/testing";
import { SpinnerComponent } from "../../spinner/spinner.component";
import { FormsModule } from "@angular/forms";
import { RatingModule } from "ng2-bootstrap";
import { BookService } from "../../../services/book.service";
import { Observable } from "rxjs";
import { BookListComponent } from "../book-list/book-list.component";
import { RouterTestingModule } from "@angular/router/testing";
import { HistoryService } from "../../../services/history.service";
import { Book } from "../../../models/Book";
import { APP_CONFIG, AppConfig } from "../../../app.config";

describe('Best Books Component', () => {
  let bestBooksComponent: BestBooksComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        SpinnerComponent,
        BestBooksComponent,
        BookListComponent
      ],
      imports: [
        FormsModule,
        RatingModule,
        RouterTestingModule
      ],
      providers: [
        {
          provide: BookService,
          useValue: {
            getBestBooks: jasmine.createSpy('getBestBooks').and.callFake(() => {
              return Observable.create(observer => {
                observer.next([{_id: 'book123', title: 'Example Book'}]);
              });
            }),

            rateBook: jasmine.createSpy('rate').and.callFake(() => {
              return Observable.create(observer => {
                observer.next('Rated');
              });
            })
          }
        },
        {
          provide: HistoryService,
          useValue: {
            addToHistory: jasmine.createSpy('addToHistory').and.callFake(() => {
              return Observable.create(observer => {
                observer.next('added to history');
              });
            })
          }
        },
        {
          provide: APP_CONFIG,
          useValue: AppConfig
        }
      ]
    });
  });

  it('Best Books Component should be defined', () => {
    const fixture = TestBed.createComponent(BestBooksComponent);
    bestBooksComponent = fixture.componentInstance;
    fixture.detectChanges();

    expect(bestBooksComponent).toBeDefined();
  });

  it('should initialize with best books list', inject([], fakeAsync(() => {
    const fixture = TestBed.createComponent(BestBooksComponent);
    bestBooksComponent = fixture.componentInstance;
    fixture.detectChanges();
    tick();

    expect(bestBooksComponent.books.length).toEqual(1);
    expect(bestBooksComponent.books[0].title).toEqual('Example Book');
  })));

  describe('rate()', () => {
    it('should call bookService.rateBook()', inject([BookService, HistoryService], fakeAsync((bookService, historyService) => {
      const fixture = TestBed.createComponent(BestBooksComponent);
      bestBooksComponent = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      const book = <Book>{
        _id: 'book_id',
        title: 'Awesome book',
        author: 'Unknown',
        rating: 4
      };

      bestBooksComponent.rate(book);
      tick();

      expect(bookService.rateBook).toHaveBeenCalledWith('book_id', 4);
      expect(historyService.addToHistory).toHaveBeenCalledWith('You rated Awesome book by Unknown');
    })));
  });
});
