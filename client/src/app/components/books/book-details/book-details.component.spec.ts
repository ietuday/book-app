import { TestBed, fakeAsync, tick, inject } from "@angular/core/testing";
import { BookService } from '../../../services/book.service';
import { Observable, BehaviorSubject } from "rxjs";
import { SpinnerComponent } from "../../spinner/spinner.component";
import { BookListComponent } from "../book-list/book-list.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RatingModule } from "ng2-bootstrap";
import { MockAppComponent } from "../../../helpers/mocks";
import { RouterTestingModule } from "@angular/router/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { BookDetailsComponent } from "./book-details.component";
import { UserService } from "../../../services/user.service";
import { User } from "../../../models/User";
import { CommentsComponent } from "../comments/comments.component";
import { Http, ConnectionBackend, BaseRequestOptions, ResponseOptions, Response } from "@angular/http";
import { MockBackend } from "@angular/http/testing";
import { AuthHttp, AuthConfig } from "angular2-jwt";
import { CommentService } from "../../../services/comment.service";
import { MustreadService } from "../../../services/mustread.service";
import { AlertComponent } from "../../alert/alert.component";
import { FavouriteService } from "../../../services/favourite.service";
import { WishlistService } from "../../../services/wishlist.service";
import { By } from "@angular/platform-browser";
import { dispatchEvent } from "@angular/platform-browser/testing/browser_util";
import { BrowseBooksComponent } from "../browse/browse-books.component";
import { Location } from '@angular/common';
import { HistoryService } from "../../../services/history.service";
import { Book } from "../../../models/Book";
import { APP_CONFIG, AppConfig } from "../../../app.config";

describe('Book Details Component', () => {
  let bookDetailsComponent: BookDetailsComponent;
  let curUser = new User({
    firstName: 'User',
    lastName: 'Fake',
    password: 'password',
    email: 'test@test.com'
  });
  curUser._id = 'user123';
  curUser.roles = ['admin'];

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        BookDetailsComponent,
        SpinnerComponent,
        BookListComponent,
        MockAppComponent,
        CommentsComponent,
        AlertComponent,
        BrowseBooksComponent
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RatingModule,
        RouterTestingModule.withRoutes([
          { path: '', component: MockAppComponent },
          { path: 'browse/:author/:slug', component: BookDetailsComponent },
          { path: 'browse', component: BookDetailsComponent }
        ])
      ],
      providers: [
        BaseRequestOptions,
        MockBackend,
        {
          provide: BookService,
          useValue: {
            getBook: jasmine.createSpy('getBook').and.callFake(() => {
              return Observable.create(observer => {
                observer.next({_id: 'book123', title: 'Example Book', author: 'Unknown', rating: 5});
              });
            }),

            rateBook: jasmine.createSpy('rate').and.callFake(() => {
              return Observable.create(observer => {
                observer.next('Rated');
              });
            }),

            buyBook: jasmine.createSpy('buy').and.callFake(() => {
              return Observable.create(observer => {
                observer.next('buy');
              });
            }),

            remove: jasmine.createSpy('remove').and.callFake(() => {
              return Observable.create(observer => {
                observer.next('removed');
              });
            })
          }
        },
        {
          provide: MustreadService,
          useValue: {
            addToMustread: jasmine.createSpy('addToMustread').and.callFake(() => {
              return Observable.create(observer => {
                observer.next('added');
              });
            })
          }
        },
        {
          provide: FavouriteService,
          useValue: {
            addToFavourites: jasmine.createSpy('addToFavourites').and.callFake(() => {
              return Observable.create(observer => {
                observer.next('added');
              });
            })
          }
        },
        {
          provide: WishlistService,
          useValue: {
            addToWishlist: jasmine.createSpy('addToWishlist').and.callFake(() => {
              return Observable.create(observer => {
                observer.next('added');
              });
            })
          }
        },
        {
          provide: UserService,
          useValue: {
            currentUser: new BehaviorSubject<User>(curUser)
          }
        },
        {
          provide: ActivatedRoute,
          useFactory: (r: Router) => r.routerState.root,
          deps: [Router]
        },
        {
          provide: Http,
          useFactory: (
            backend: ConnectionBackend,
            defaultOptions: BaseRequestOptions
          ) => {
            return new Http(backend, defaultOptions);
          },
          deps: [MockBackend, BaseRequestOptions]
        },
        {
          provide: AuthHttp,
          useFactory: (http) => {
            return new AuthHttp(new AuthConfig(), http);
          },
          deps: [Http]
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
    TestBed.overrideComponent(CommentsComponent, {
      set: {
        providers: [
          {
            provide: CommentService,
            useValue: {
              getComments: jasmine.createSpy('getComments').and.callFake(() => {
                return Observable.create(observer => {
                  observer.next({
                    bookId: 'book123',
                    messages: [{
                      author: { displayName: 'Fake User' },
                      created_at: Date.now(),
                      text: 'Awesome Book'
                    }, {
                      author: { displayName: 'Fake User 2' },
                      created_at: Date.now() + 3600000,
                      text: 'Great Book'
                    }]
                  });
                });
              })
            }
          }
        ]
      }
    });
  });

  it('Browse Books Component should be defined', () => {
    const fixture = TestBed.createComponent(BookDetailsComponent);
    bookDetailsComponent = fixture.componentInstance;
    fixture.detectChanges();

    expect(bookDetailsComponent).toBeDefined();
  });

  it('should initialize with book', inject([Router, BookService], fakeAsync((router, bookService) => {
    // create root component with router-outlet
    const fixture = TestBed.createComponent(MockAppComponent);
    router.initialNavigation();
    fixture.detectChanges();
    tick();

    router.navigateByUrl('browse/best-author/awesome-book');
    fixture.detectChanges();
    tick();

    bookDetailsComponent = fixture.debugElement.children[1].componentInstance;
    fixture.detectChanges();
    tick();

    expect(bookService.getBook).toHaveBeenCalledWith('awesome-book');
    expect(bookDetailsComponent.book.title).toBe('Example Book');
  })));

  describe('rate()', () => {
    it('should call bookService.rateBook()', inject([BookService, HistoryService], fakeAsync((bookService, historyService) => {
      const fixture = TestBed.createComponent(BookDetailsComponent);
      bookDetailsComponent = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      const book = <Book>{
        _id: 'book_id',
        title: 'Awesome book',
        author: 'Unknown',
        rating: 4
      };

      bookDetailsComponent.rate(book);
      tick();

      expect(bookService.rateBook).toHaveBeenCalledWith('book_id', 4);
      expect(historyService.addToHistory).toHaveBeenCalledWith('You rated Awesome book by Unknown');
    })));
  });

  describe('addToMustread()', () => {
    it('should call mustreadService.addToMustread()', inject([MustreadService, HistoryService], fakeAsync((mustreadService, historyService) => {
      const fixture = TestBed.createComponent(BookDetailsComponent);
      bookDetailsComponent = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      bookDetailsComponent.addToMustread();
      tick();

      expect(mustreadService.addToMustread).toHaveBeenCalledWith('book123');
      expect(historyService.addToHistory).toHaveBeenCalledWith('You added Example Book by Unknown to Must Read Titles');
      expect(bookDetailsComponent.success).toEqual('Book Added To Must Read Titles!');
    })));

    it('should show error', inject([MustreadService], fakeAsync((mustreadService) => {
      const fixture = TestBed.createComponent(BookDetailsComponent);
      bookDetailsComponent = fixture.componentInstance;
      mustreadService.addToMustread = jasmine.createSpy('addToMustread').and.callFake(() => {
        return Observable.create(observer => {
          const response = new ResponseOptions({
            body: {"message": "Error"},
            status: 400
          });
          observer.error(new Response(response));
        });
      });

      fixture.detectChanges();
      tick();

      bookDetailsComponent.addToMustread();
      tick();

      expect(mustreadService.addToMustread).toHaveBeenCalledWith('book123');
      expect(bookDetailsComponent.error).toEqual('Error');
    })));
  });

  describe('addToFavourites()', () => {
    it('should call favouriteService.addToFavourites()', inject([FavouriteService, HistoryService], fakeAsync((favouriteService, historyService) => {
      const fixture = TestBed.createComponent(BookDetailsComponent);
      bookDetailsComponent = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      bookDetailsComponent.addToFavourites();
      tick();

      expect(favouriteService.addToFavourites).toHaveBeenCalledWith('book123');
      expect(historyService.addToHistory).toHaveBeenCalledWith('You added Example Book by Unknown to Favourites');
      expect(bookDetailsComponent.success).toEqual('Book Added To Favourites!');
    })));

    it('should show error', inject([FavouriteService], fakeAsync((favouriteService) => {
      const fixture = TestBed.createComponent(BookDetailsComponent);
      bookDetailsComponent = fixture.componentInstance;
      favouriteService.addToFavourites = jasmine.createSpy('addToFavourites').and.callFake(() => {
        return Observable.create(observer => {
          const response = new ResponseOptions({
            body: {"message": "Error"},
            status: 400
          });
          observer.error(new Response(response));
        });
      });

      fixture.detectChanges();
      tick();

      bookDetailsComponent.addToFavourites();
      tick();

      expect(favouriteService.addToFavourites).toHaveBeenCalledWith('book123');
      expect(bookDetailsComponent.error).toEqual('Error');
    })));
  });

  describe('addToWishlist()', () => {
    it('should call wishlistService.addToWishlist()', inject([WishlistService, HistoryService], fakeAsync((wishlistService, historyService) => {
      const fixture = TestBed.createComponent(BookDetailsComponent);
      bookDetailsComponent = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      bookDetailsComponent.addToWishlist();
      tick();

      expect(wishlistService.addToWishlist).toHaveBeenCalledWith('book123');
      expect(historyService.addToHistory).toHaveBeenCalledWith('You added Example Book by Unknown to Wishlist');
      expect(bookDetailsComponent.success).toEqual('Book Added To Wishlist!');
    })));

    it('should show error', inject([WishlistService], fakeAsync((wishlistService) => {
      const fixture = TestBed.createComponent(BookDetailsComponent);
      bookDetailsComponent = fixture.componentInstance;
      wishlistService.addToWishlist = jasmine.createSpy('addToWishlist').and.callFake(() => {
        return Observable.create(observer => {
          const response = new ResponseOptions({
            body: {"message": "Error"},
            status: 400
          });
          observer.error(new Response(response));
        });
      });

      fixture.detectChanges();
      tick();

      bookDetailsComponent.addToWishlist();
      tick();

      expect(wishlistService.addToWishlist).toHaveBeenCalledWith('book123');
      expect(bookDetailsComponent.error).toEqual('Error');
    })));
  });

  describe('buyForm', () => {
    it('buyForm should be defined', inject([], fakeAsync(() => {
      const fixture = TestBed.createComponent(BookDetailsComponent);
      bookDetailsComponent = fixture.componentInstance;
      bookDetailsComponent.showBuyForm();
      fixture.detectChanges();
      tick();

      expect(bookDetailsComponent.buyForm).toBeDefined();
    })));

    it('buyForm should be invalid if cardNumber field is empty', inject([], fakeAsync(() => {
      const fixture = TestBed.createComponent(BookDetailsComponent);
      bookDetailsComponent = fixture.componentInstance;
      bookDetailsComponent.showBuyForm();
      fixture.detectChanges();
      tick();

      let cardField = fixture.debugElement.query(By.css('input')).nativeElement;
      cardField.value ='';

      dispatchEvent(cardField, 'input');
      fixture.detectChanges();

      expect(bookDetailsComponent.buyForm.invalid).toBeTruthy();
    })));

    it('buyForm should be invalid if cardNumber is invalid', inject([], fakeAsync(() => {
      const fixture = TestBed.createComponent(BookDetailsComponent);
      bookDetailsComponent = fixture.componentInstance;
      bookDetailsComponent.showBuyForm();
      fixture.detectChanges();
      tick();

      let cardField = fixture.debugElement.query(By.css('input')).nativeElement;
      cardField.value ='dfgdf';

      dispatchEvent(cardField, 'input');
      fixture.detectChanges();

      expect(bookDetailsComponent.buyForm.invalid).toBeTruthy();
    })));

    it('should call bookService.buyBook() if form is valid', inject([BookService, HistoryService], fakeAsync((bookService, historyService) => {
      const fixture = TestBed.createComponent(BookDetailsComponent);
      bookDetailsComponent = fixture.componentInstance;
      bookDetailsComponent.showBuyForm();
      fixture.detectChanges();
      tick();

      let cardField = fixture.debugElement.query(By.css('input')).nativeElement;
      cardField.value = '4565454565454565';

      dispatchEvent(cardField, 'input');
      fixture.detectChanges();

      bookDetailsComponent.buyBook();
      tick();

      expect(bookService.buyBook).toHaveBeenCalledWith('book123', '4565454565454565');
      expect(historyService.addToHistory).toHaveBeenCalledWith('You bought Example Book by Unknown');
    })));

    it('should not call bookService.buyBook() if form is invalid', inject([BookService], fakeAsync((bookService) => {
      const fixture = TestBed.createComponent(BookDetailsComponent);
      bookDetailsComponent = fixture.componentInstance;
      bookDetailsComponent.showBuyForm();
      fixture.detectChanges();
      tick();

      let cardField = fixture.debugElement.query(By.css('input')).nativeElement;
      cardField.value = 'dfgdfg';

      dispatchEvent(cardField, 'input');
      fixture.detectChanges();

      bookDetailsComponent.buyBook();
      tick();

      expect(bookService.buyBook).not.toHaveBeenCalled();
    })));
  });

  describe('remove()', () => {
    it('should call bookService.remove() if confirmed', inject([Router, BookService, Location, HistoryService], fakeAsync((router, bookService, location, historyService) => {
      // create root component with router-outlet
      const fixture = TestBed.createComponent(MockAppComponent);
      router.initialNavigation();
      fixture.detectChanges();
      tick();

      router.navigateByUrl('browse/best-author/awesome-book');
      fixture.detectChanges();
      tick();

      bookDetailsComponent = fixture.debugElement.children[1].componentInstance;
      bookDetailsComponent.book.slug = 'awesome-book';
      fixture.detectChanges();

      spyOn(window, 'confirm').and.returnValue(true);

      bookDetailsComponent.removeBook();
      tick();

      expect(bookService.remove).toHaveBeenCalledWith('awesome-book');
      expect(historyService.addToHistory).toHaveBeenCalledWith('You removed Example Book by Unknown');
      expect(location.path()).toEqual('/browse');
    })));

    it('should not call bookService.remove() if not confirmed', inject([Router, BookService], fakeAsync((router, bookService) => {
      // create root component with router-outlet
      const fixture = TestBed.createComponent(MockAppComponent);
      router.initialNavigation();
      fixture.detectChanges();
      tick();

      router.navigateByUrl('browse/best-author/awesome-book');
      fixture.detectChanges();
      tick();

      bookDetailsComponent = fixture.debugElement.children[1].componentInstance;
      fixture.detectChanges();

      spyOn(window, 'confirm').and.returnValue(false);

      bookDetailsComponent.removeBook();
      tick();

      expect(bookService.remove).not.toHaveBeenCalled();
    })));

    it('should show error', inject([Router, BookService], fakeAsync((router, bookService) => {
      // create root component with router-outlet
      const fixture = TestBed.createComponent(MockAppComponent);
      router.initialNavigation();
      fixture.detectChanges();
      tick();

      router.navigateByUrl('browse/best-author/awesome-book');
      fixture.detectChanges();
      tick();

      bookDetailsComponent = fixture.debugElement.children[1].componentInstance;
      fixture.detectChanges();

      spyOn(window, 'confirm').and.returnValue(true);

      bookService.remove = jasmine.createSpy('remove').and.callFake(() => {
        return Observable.create(observer => {
          const response = new ResponseOptions({
            body: {"message": "Error"},
            status: 400
          });
          observer.error(new Response(response));
        });
      });

      bookDetailsComponent.removeBook();
      tick();

      expect(bookDetailsComponent.error).toEqual('Error');
    })));
  });
});
