import { TestBed, inject, fakeAsync, tick } from "@angular/core/testing";
import { MustreadBooksComponent } from "./mustread-books.component";
import { SpinnerComponent } from "../../spinner/spinner.component";
import { AlertComponent } from "../../alert/alert.component";
import { BookListComponent } from "../book-list/book-list.component";
import { BookService } from "../../../services/book.service";
import { Observable } from "rxjs";
import { MustreadService } from "../../../services/mustread.service";
import { RouterTestingModule } from "@angular/router/testing";
import { RatingModule } from "ng2-bootstrap";
import { ResponseOptions, Response } from "@angular/http";
import { HistoryService } from "../../../services/history.service";
import { Book } from "../../../models/Book";
import { APP_CONFIG, AppConfig } from "../../../app.config";

describe('Mustread Books Component', () => {
  let mustreadBooksComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        MustreadBooksComponent,
        SpinnerComponent,
        AlertComponent,
        BookListComponent
      ],
      imports: [
        RouterTestingModule,
        RatingModule
      ],
      providers: [
        {
          provide: BookService,
          useValue: {
            rateBook: jasmine.createSpy('rate').and.callFake(() => {
              return Observable.create(observer => {
                observer.next('Rated');
              });
            })
          }
        },
        {
          provide: MustreadService,
          useValue: {
            getMustread: jasmine.createSpy('getMustread').and.callFake(() => {
              return Observable.create(observer => {
                observer.next({
                  userId: 'user123',
                  books: [{
                    _id: 'book123',
                    title: 'Awesome Book'
                  }]
                })
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

  it('Mustread Books Component should be defined', () => {
    const fixture = TestBed.createComponent(MustreadBooksComponent);
    mustreadBooksComponent = fixture.componentInstance;
    fixture.detectChanges();

    expect(mustreadBooksComponent).toBeDefined();
  });

  it('should initialize with books', inject([MustreadService], fakeAsync((mustreadService) => {
    const fixture = TestBed.createComponent(MustreadBooksComponent);
    mustreadBooksComponent = fixture.componentInstance;
    fixture.detectChanges();
    tick();

    expect(mustreadService.getMustread).toHaveBeenCalled();
    expect(mustreadBooksComponent.books[0].title).toEqual('Awesome Book');
  })));

  describe('rate()', () => {
    it('should rate a book', inject([BookService, HistoryService], fakeAsync((bookService, historyService) => {
      const fixture = TestBed.createComponent(MustreadBooksComponent);
      mustreadBooksComponent = fixture.componentInstance;
      fixture.detectChanges();

      const book = <Book>{
        _id: 'book_id',
        title: 'Awesome book',
        author: 'Unknown',
        rating: 4
      };

      mustreadBooksComponent.rate(book);
      tick();

      expect(bookService.rateBook).toHaveBeenCalledWith('book_id', 4);
      expect(historyService.addToHistory).toHaveBeenCalledWith('You rated Awesome book by Unknown');
    })));
  });

  describe('removeFromMustread', () => {
    it('should remove from mustread and update books list', inject([MustreadService, HistoryService], fakeAsync((mustreadService, historyService) => {
      const fixture = TestBed.createComponent(MustreadBooksComponent);
      mustreadBooksComponent = fixture.componentInstance;
      fixture.detectChanges();

      mustreadService.getMustread = () => {
        return Observable.create(observer => {
          observer.next({ userId: 'user123', books: [] });
        });
      };

      mustreadService.removeFromMustread = jasmine.createSpy('removeFromMustread').and.callFake(() => {
        return Observable.create(observer => {
          observer.next('removed');
        });
      });

      const book = <Book>{
        _id: 'book_id',
        title: 'Awesome book',
        author: 'Unknown',
        rating: 4
      };

      mustreadBooksComponent.removeFromMustread(book);
      tick();

      expect(mustreadService.removeFromMustread).toHaveBeenCalledWith('book_id');
      expect(mustreadBooksComponent.books.length).toBe(0);
      expect(historyService.addToHistory).toHaveBeenCalledWith('You removed Awesome book by Unknown from Must Read Titles');
    })));

    it('should show error when removing was failed', inject([MustreadService], fakeAsync((mustreadService) => {
      const fixture = TestBed.createComponent(MustreadBooksComponent);
      mustreadBooksComponent = fixture.componentInstance;
      fixture.detectChanges();

      mustreadService.removeFromMustread = jasmine.createSpy('removeFromMustread').and.callFake(() => {
        return Observable.create(observer => {
          const response = new ResponseOptions({
            body: {"message": "Error"},
            status: 400
          });
          observer.error(new Response(response));
        });
      });

      const book = <Book>{
        _id: 'book_id',
        title: 'Awesome book',
        author: 'Unknown',
        rating: 4
      };

      mustreadBooksComponent.removeFromMustread(book);
      tick();

      expect(mustreadService.removeFromMustread).toHaveBeenCalledWith('book_id');
      expect(mustreadBooksComponent.error).toBe('Error');
    })));
  });
});
