import { TestBed, fakeAsync, tick, inject } from "@angular/core/testing";
import { BookService } from '../../../services/book.service';
import { Observable } from "rxjs";
import { BrowseBooksComponent } from "./browse-books.component";
import { SpinnerComponent } from "../../spinner/spinner.component";
import { BookListComponent } from "../book-list/book-list.component";
import { FormsModule } from "@angular/forms";
import { RatingModule } from "ng2-bootstrap";
import { MockAppComponent } from "../../../helpers/mocks";
import { RouterTestingModule } from "@angular/router/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { HistoryService } from "../../../services/history.service";
import { Book } from "../../../models/Book";
import { APP_CONFIG, AppConfig } from "../../../app.config";

describe('Browse Book Component', () => {
  let browseBookComponent: BrowseBooksComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        BrowseBooksComponent,
        SpinnerComponent,
        BookListComponent,
        MockAppComponent
      ],
      imports: [
        FormsModule,
        RatingModule,
        RouterTestingModule.withRoutes([
          { path: '', component: MockAppComponent },
          { path: 'browse', component: BrowseBooksComponent },
          { path: 'buy', component: BrowseBooksComponent }
        ])
      ],
      providers: [
        {
          provide: BookService,
          useValue: {
            getBooks: jasmine.createSpy('getBooks').and.callFake(() => {
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
          provide: ActivatedRoute,
          useFactory: (r: Router) => r.routerState.root,
          deps: [Router]
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

  it('Browse Books Component should be defined', () => {
    const fixture = TestBed.createComponent(BrowseBooksComponent);
    browseBookComponent = fixture.componentInstance;
    fixture.detectChanges();

    expect(browseBookComponent).toBeDefined();
  });

  it('should initialize with books list', inject([Router], fakeAsync((router) => {
    // create root component with router-outlet
    const fixture = TestBed.createComponent(MockAppComponent);
    router.initialNavigation();
    fixture.detectChanges();
    tick();

    router.navigateByUrl('/browse');
    fixture.detectChanges();
    tick();

    browseBookComponent = fixture.debugElement.children[1].componentInstance;
    fixture.detectChanges();
    tick();

    expect(browseBookComponent.books.length).toEqual(1);
    expect(browseBookComponent.books[0].title).toEqual('Example Book');
  })));

  describe('sort()', () => {
    it('should call bookService.getBooks() and return free books', inject([BookService, Router], fakeAsync((bookService, router) => {
      // create root component with router-outlet
      const fixture = TestBed.createComponent(MockAppComponent);
      router.initialNavigation();
      fixture.detectChanges();
      tick();

      router.navigateByUrl('/browse');
      fixture.detectChanges();
      tick();

      browseBookComponent = fixture.debugElement.children[1].componentInstance;
      fixture.detectChanges();
      tick();

      browseBookComponent.sort('title');
      tick();

      expect(bookService.getBooks).toHaveBeenCalledWith({ paid: false, sort: 'title', search: undefined });
    })));

    it('should call bookService.getBooks() and return paid books', inject([BookService, Router], fakeAsync((bookService, router) => {
      // create root component with router-outlet
      const fixture = TestBed.createComponent(MockAppComponent);
      router.initialNavigation();
      fixture.detectChanges();
      tick();

      router.navigateByUrl('/buy');
      fixture.detectChanges();
      tick();

      browseBookComponent = fixture.debugElement.children[1].componentInstance;
      fixture.detectChanges();
      tick();

      browseBookComponent.sort('title');
      tick();

      expect(bookService.getBooks).toHaveBeenCalledWith({ paid: true, sort: 'title', search: undefined });
    })));
  });

  describe('rate()', () => {
    it('should call bookService.rateBook()', inject([BookService, Router, HistoryService], fakeAsync((bookService, router, historyService) => {
      // create root component with router-outlet
      const fixture = TestBed.createComponent(MockAppComponent);
      router.initialNavigation();
      fixture.detectChanges();
      tick();

      router.navigateByUrl('/browse');
      fixture.detectChanges();
      tick();

      browseBookComponent = fixture.debugElement.children[1].componentInstance;
      fixture.detectChanges();
      tick();

      const book = <Book>{
        _id: 'book_id',
        title: 'Awesome book',
        author: 'Unknown',
        rating: 4
      };

      browseBookComponent.rate(book);
      tick();

      expect(bookService.rateBook).toHaveBeenCalledWith('book_id', 4);
      expect(historyService.addToHistory).toHaveBeenCalledWith('You rated Awesome book by Unknown');
    })));
  });
});
