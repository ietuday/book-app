import { TestBed, inject, fakeAsync, tick } from "@angular/core/testing";
import { SpinnerComponent } from "../../spinner/spinner.component";
import { AlertComponent } from "../../alert/alert.component";
import { BookListComponent } from "../book-list/book-list.component";
import { BookService } from "../../../services/book.service";
import { Observable } from "rxjs";
import { RouterTestingModule } from "@angular/router/testing";
import { RatingModule } from "ng2-bootstrap";
import { ResponseOptions, Response } from "@angular/http";
import { FavouriteBooksComponent } from "./favourite-books.component";
import { FavouriteService } from "../../../services/favourite.service";
import { HistoryService } from "../../../services/history.service";
import { Book } from "../../../models/Book";
import { APP_CONFIG, AppConfig } from "../../../app.config";

describe('Favourite Books Component', () => {
  let favouriteBooksComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        FavouriteBooksComponent,
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
          provide: FavouriteService,
          useValue: {
            getFavourites: jasmine.createSpy('getFavourites').and.callFake(() => {
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

  it('Favourite Books Component should be defined', () => {
    const fixture = TestBed.createComponent(FavouriteBooksComponent);
    favouriteBooksComponent = fixture.componentInstance;
    fixture.detectChanges();

    expect(favouriteBooksComponent).toBeDefined();
  });

  it('should initialize with books', inject([FavouriteService], fakeAsync((favouriteService) => {
    const fixture = TestBed.createComponent(FavouriteBooksComponent);
    favouriteBooksComponent = fixture.componentInstance;
    fixture.detectChanges();
    tick();

    expect(favouriteService.getFavourites).toHaveBeenCalled();
    expect(favouriteBooksComponent.books[0].title).toEqual('Awesome Book');
  })));

  describe('rate()', () => {
    it('should rate a book', inject([BookService, HistoryService], fakeAsync((bookService, historyService) => {
      const fixture = TestBed.createComponent(FavouriteBooksComponent);
      favouriteBooksComponent = fixture.componentInstance;
      fixture.detectChanges();

      const book = <Book>{
        _id: 'book_id',
        title: 'Awesome book',
        author: 'Unknown',
        rating: 4
      };

      favouriteBooksComponent.rate(book);
      tick();

      expect(bookService.rateBook).toHaveBeenCalledWith('book_id', 4);
      expect(historyService.addToHistory).toHaveBeenCalledWith('You rated Awesome book by Unknown');
    })));
  });

  describe('removeFromFavourites', () => {
    it('should remove from mustread and update books list', inject([FavouriteService, HistoryService], fakeAsync((favouriteService, historyService) => {
      const fixture = TestBed.createComponent(FavouriteBooksComponent);
      favouriteBooksComponent = fixture.componentInstance;
      fixture.detectChanges();

      favouriteService.getFavourites = () => {
        return Observable.create(observer => {
          observer.next({ userId: 'user123', books: [] });
        });
      };

      favouriteService.removeFromFavourites = jasmine.createSpy('removeFromFavourites').and.callFake(() => {
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

      favouriteBooksComponent.removeFromFavourites(book);
      tick();

      expect(favouriteService.removeFromFavourites).toHaveBeenCalledWith('book_id');
      expect(historyService.addToHistory).toHaveBeenCalledWith('You removed Awesome book by Unknown from Favourites');
      expect(favouriteBooksComponent.books.length).toBe(0);
    })));

    it('should show error when removing was failed', inject([FavouriteService], fakeAsync((favouriteService) => {
      const fixture = TestBed.createComponent(FavouriteBooksComponent);
      favouriteBooksComponent = fixture.componentInstance;
      fixture.detectChanges();

      favouriteService.removeFromFavourites = jasmine.createSpy('removeFromFavourites').and.callFake(() => {
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

      favouriteBooksComponent.removeFromFavourites(book);
      tick();

      expect(favouriteService.removeFromFavourites).toHaveBeenCalledWith('book_id');
      expect(favouriteBooksComponent.error).toBe('Error');
    })));
  });
});
