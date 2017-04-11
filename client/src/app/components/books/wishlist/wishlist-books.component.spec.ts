import { TestBed, inject, fakeAsync, tick } from "@angular/core/testing";
import { SpinnerComponent } from "../../spinner/spinner.component";
import { AlertComponent } from "../../alert/alert.component";
import { BookListComponent } from "../book-list/book-list.component";
import { BookService } from "../../../services/book.service";
import { Observable } from "rxjs";
import { RouterTestingModule } from "@angular/router/testing";
import { RatingModule } from "ng2-bootstrap";
import { ResponseOptions, Response } from "@angular/http";
import { WishlistBooksComponent } from "./wishlist-books.component";
import { WishlistService } from "../../../services/wishlist.service";
import { HistoryService } from "../../../services/history.service";
import { Book } from "../../../models/Book";
import { APP_CONFIG, AppConfig } from "../../../app.config";

describe('Wishlist Books Component', () => {
  let wishlistBooksComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        WishlistBooksComponent,
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
          provide: WishlistService,
          useValue: {
            getWishlist: jasmine.createSpy('getWishlist').and.callFake(() => {
              return Observable.create(observer => {
                observer.next({
                  userId: 'user123',
                  books: [{
                    _id: 'book123',
                    title: 'Awesome Book',
                    author: 'Unknown'
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

  it('Wishlist Books Component should be defined', () => {
    const fixture = TestBed.createComponent(WishlistBooksComponent);
    wishlistBooksComponent = fixture.componentInstance;
    fixture.detectChanges();

    expect(wishlistBooksComponent).toBeDefined();
  });

  it('should initialize with books', inject([WishlistService], fakeAsync((wishlistService) => {
    const fixture = TestBed.createComponent(WishlistBooksComponent);
    wishlistBooksComponent = fixture.componentInstance;
    fixture.detectChanges();
    tick();

    expect(wishlistService.getWishlist).toHaveBeenCalled();
    expect(wishlistBooksComponent.books[0].title).toEqual('Awesome Book');
  })));

  describe('rate()', () => {
    it('should rate a book', inject([BookService, HistoryService], fakeAsync((bookService, historyService) => {
      const fixture = TestBed.createComponent(WishlistBooksComponent);
      wishlistBooksComponent = fixture.componentInstance;
      fixture.detectChanges();

      const book = <Book>{
        _id: 'book_id',
        title: 'Awesome book',
        author: 'Unknown',
        rating: 4
      };

      wishlistBooksComponent.rate(book);
      tick();

      expect(bookService.rateBook).toHaveBeenCalledWith('book_id', 4);
      expect(historyService.addToHistory).toHaveBeenCalledWith('You rated Awesome book by Unknown');
    })));
  });

  describe('removeFromWishlist', () => {
    it('should remove from wishlist and update books list', inject([WishlistService, HistoryService], fakeAsync((wishlistService, historyService) => {
      const fixture = TestBed.createComponent(WishlistBooksComponent);
      wishlistBooksComponent = fixture.componentInstance;
      fixture.detectChanges();

      wishlistService.getWishlist = () => {
        return Observable.create(observer => {
          observer.next({ userId: 'user123', books: [] });
        });
      };

      wishlistService.removeFromWishlist = jasmine.createSpy('removeFromWishlist').and.callFake(() => {
        return Observable.create(observer => {
          observer.next('removed');
        });
      });
      const book = <Book>{
        _id: 'book123',
        title: 'Awesome book',
        author: 'Unknown'
      };

      wishlistBooksComponent.removeFromWishlist(book);
      tick();

      expect(wishlistService.removeFromWishlist).toHaveBeenCalledWith('book123');
      expect(wishlistBooksComponent.books.length).toBe(0);
      expect(historyService.addToHistory).toHaveBeenCalledWith('You removed Awesome book by Unknown from Wishlist');
    })));

    it('should show error when removing was failed', inject([WishlistService], fakeAsync((wishlistService) => {
      const fixture = TestBed.createComponent(WishlistBooksComponent);
      wishlistBooksComponent = fixture.componentInstance;
      fixture.detectChanges();

      wishlistService.removeFromWishlist = jasmine.createSpy('removeFromWishlist').and.callFake(() => {
        return Observable.create(observer => {
          const response = new ResponseOptions({
            body: {"message": "Error"},
            status: 400
          });
          observer.error(new Response(response));
        });
      });

      const book = <Book>{
        _id: 'book123',
        title: 'Awesome book',
        author: 'Unknown'
      };

      wishlistBooksComponent.removeFromWishlist(book);
      tick();

      expect(wishlistService.removeFromWishlist).toHaveBeenCalledWith('book123');
      expect(wishlistBooksComponent.error).toBe('Error');
    })));
  });
});
