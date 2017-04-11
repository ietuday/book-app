import { TestBed, async } from '@angular/core/testing';
import { BookListComponent } from "./book-list.component";
import { By } from "@angular/platform-browser";
import { dispatchEvent } from "@angular/platform-browser/testing/browser_util";
import { RatingModule } from "ng2-bootstrap";
import { FormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { APP_CONFIG, AppConfig } from "../../../app.config";

describe('Book List Component', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        BookListComponent
      ],
      imports: [
        RatingModule,
        FormsModule,
        RouterTestingModule
      ],
      providers: [
        {
          provide: APP_CONFIG,
          useValue: AppConfig
        }
      ]
    });
  });

  it('should create Book List Component', async(() => {
    let fixture = TestBed.createComponent(BookListComponent);
    let bookListComponent = fixture.debugElement.componentInstance;
    expect(bookListComponent).toBeTruthy();
  }));

  describe('changeSorting()', () => {
    it('should emit sortChanged', async(() => {
      let fixture = TestBed.createComponent(BookListComponent);
      let bookListComponent = fixture.debugElement.componentInstance;
      bookListComponent.page = '/browse';
      fixture.detectChanges();

      spyOn(bookListComponent.sortChanged, 'emit');

      let radioButton = fixture.debugElement.query(By.css('#recent')).nativeElement;

      radioButton.dispatchEvent(new Event('change'));
      expect(bookListComponent.sortChanged.emit).toHaveBeenCalledWith('added_at');
    }));
  });

  describe('search()', () => {
    it('should emit searchChanged', async(() => {
      let fixture = TestBed.createComponent(BookListComponent);
      let bookListComponent = fixture.debugElement.componentInstance;
      bookListComponent.page = '/browse';
      fixture.detectChanges();

      spyOn(bookListComponent.searchChanged, 'emit');

      let inputElem = fixture.debugElement.query(By.css('#search input')).nativeElement;
      inputElem.value = 'search string';

      dispatchEvent(inputElem, 'keyup');
      expect(bookListComponent.searchChanged.emit).toHaveBeenCalledWith('search string');
    }));
  });

  // describe('rate()', () => {
  //   it('should emit rated', async(() => {
  //     let fixture = TestBed.createComponent(BookListComponent);
  //     let bookListComponent = fixture.debugElement.componentInstance;
  //
  //     spyOn(bookListComponent.rated, 'emit');
  //
  //     let ratingElem = fixture.debugElement.query(By.css('.rate')).nativeElement;
  //
  //     dispatchEvent(ratingElem, 'click');
  //     expect(bookListComponent.rated.emit).toHaveBeenCalled();
  //   }));
  // });

  describe('removeFromMustread()', () => {
    it('should emit removedFormMustread', async(() => {
      let fixture = TestBed.createComponent(BookListComponent);
      let bookListComponent = fixture.debugElement.componentInstance;
      bookListComponent.page = '/mustread';
      bookListComponent.books = [{paid: false}];
      fixture.detectChanges();

      spyOn(bookListComponent.removedFromMustread, 'emit');

      let trashElem = fixture.debugElement.query(By.css('.fa-trash-o')).nativeElement;

      dispatchEvent(trashElem, 'click');
      expect(bookListComponent.removedFromMustread.emit).toHaveBeenCalled();
    }));
  });

  describe('removeFromFavourites()', () => {
    it('should emit removedFormFavourites', async(() => {
      let fixture = TestBed.createComponent(BookListComponent);
      let bookListComponent = fixture.debugElement.componentInstance;
      bookListComponent.page = '/favourite';
      bookListComponent.books = [{paid: false}];
      fixture.detectChanges();

      spyOn(bookListComponent.removedFromFavourites, 'emit');

      let trashElem = fixture.debugElement.query(By.css('.fa-trash-o')).nativeElement;

      dispatchEvent(trashElem, 'click');
      expect(bookListComponent.removedFromFavourites.emit).toHaveBeenCalled();
    }));
  });

  describe('removeFromWishlist()', () => {
    it('should emit removedFormWishlist', async(() => {
      let fixture = TestBed.createComponent(BookListComponent);
      let bookListComponent = fixture.debugElement.componentInstance;
      bookListComponent.page = '/wishlist';
      bookListComponent.books = [{paid: true}];
      fixture.detectChanges();

      spyOn(bookListComponent.removedFromWishlist, 'emit');

      let trashElem = fixture.debugElement.query(By.css('.fa-trash-o')).nativeElement;

      dispatchEvent(trashElem, 'click');
      expect(bookListComponent.removedFromWishlist.emit).toHaveBeenCalled();
    }));
  });
});
