import { TestBed, fakeAsync, tick, inject } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { AlertComponent } from "../../alert/alert.component";
import { BookService } from '../../../services/book.service';
import { By } from "@angular/platform-browser";
import { dispatchEvent } from "@angular/platform-browser/testing/browser_util";
import { Observable } from "rxjs";
import { ResponseOptions, Response } from "@angular/http";
import { AddBookComponent } from "./add-book.component";
import { ActivatedRoute, Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { MockAppComponent } from "../../../helpers/mocks";
import { HistoryService } from "../../../services/history.service";

describe('Add Book Component', () => {
  let addBookComponent: AddBookComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        AddBookComponent,
        AlertComponent,
        MockAppComponent
      ],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([
          { path: '', component: MockAppComponent },
          { path: 'edit/:author/:slug', component: AddBookComponent }
        ])
      ],
      providers: [
        {
          provide: BookService,
          useValue: {
            getBook: jasmine.createSpy('getBook').and.callFake(() => {
              return Observable.create(observer => {
                observer.next({_id: 'book123', title: 'Example Book', rating: 5, slug: 'example-book', author: 'Best Author'});
              });
            }),

            create: jasmine.createSpy('create').and.callFake(() => {
              return Observable.create(observer => {
                observer.next('Created');
              });
            }),

            update: jasmine.createSpy('update').and.callFake(() => {
              return Observable.create(observer => {
                observer.next('Updated');
              });
            }),

            changeCover: jasmine.createSpy('changeCover').and.callFake(() => {
              return Observable.create(observer => {
                observer.next('Cover changed');
              });
            }),

            changeEpub: jasmine.createSpy('changeEpub').and.callFake(() => {
              return Observable.create(observer => {
                observer.next('Epub changed');
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
        }
      ]
    });
  });

  it('AddBook Component should be defined', () => {
    const fixture = TestBed.createComponent(AddBookComponent);
    addBookComponent = fixture.componentInstance;
    fixture.detectChanges();

    expect(addBookComponent).toBeDefined();
  });

  it('should initialize bookForm with empty fields when not isEditing mode', fakeAsync(() => {
    const fixture = TestBed.createComponent(AddBookComponent);
    addBookComponent = fixture.componentInstance;
    tick();
    fixture.detectChanges();

    expect(addBookComponent.bookForm).toBeDefined();
    expect(addBookComponent.bookForm.controls['title'].value).toBe('');
    expect(addBookComponent.bookForm.controls['author'].value).toBe('');
    expect(addBookComponent.bookForm.controls['description'].value).toBe('');
    expect(addBookComponent.bookForm.controls['paid'].value).toBe(false);
    expect(addBookComponent.bookForm.controls['price'].value).toBe('');
  }));

  it('should initialize bookForm with filled fields when isEditing mode', inject([Router], fakeAsync((router) => {
    // create root component with router-outlet
    const fixture = TestBed.createComponent(MockAppComponent);
    router.initialNavigation();
    fixture.detectChanges();
    tick();

    router.navigateByUrl('edit/best-author/example-book');
    fixture.detectChanges();
    tick();

    addBookComponent = fixture.debugElement.children[1].componentInstance;
    fixture.detectChanges();
    tick();

    expect(addBookComponent.bookForm).toBeDefined();
    expect(addBookComponent.bookForm.controls['title'].value).toBe('Example Book');
    expect(addBookComponent.bookForm.controls['author'].value).toBe('Best Author');
  })));

  describe('Validations', () => {
    it('should set required error to true when title field is empty', fakeAsync(() => {
      const fixture = TestBed.createComponent(AddBookComponent);
      addBookComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let titleField = fixture.debugElement.query(By.css('#title')).nativeElement;

      titleField.value = '';
      dispatchEvent(titleField, 'input');

      expect(addBookComponent.bookForm.controls['title'].errors['required']).toBeTruthy();
    }));

    it('should set required error to true when author field is empty', fakeAsync(() => {
      const fixture = TestBed.createComponent(AddBookComponent);
      addBookComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let authorField = fixture.debugElement.query(By.css('#author')).nativeElement;

      authorField.value = '';
      dispatchEvent(authorField, 'input');

      expect(addBookComponent.bookForm.controls['author'].errors['required']).toBeTruthy();
    }));

    it('should set required error to true when paid is checked and price field is empty', fakeAsync(() => {
      const fixture = TestBed.createComponent(AddBookComponent);
      addBookComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let paidField = fixture.debugElement.query(By.css('#paid')).nativeElement;

      paidField.checked = true;
      dispatchEvent(paidField, 'change');

      tick();
      fixture.detectChanges();

      let priceField = fixture.debugElement.query(By.css('#price')).nativeElement;

      priceField.value = '';
      dispatchEvent(priceField, 'input');

      expect(addBookComponent.bookForm.controls['price'].errors['required']).toBeTruthy();
    }));

    it('should set notPrice error to true when price is invalid', fakeAsync(() => {
      const fixture = TestBed.createComponent(AddBookComponent);
      addBookComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let paidField = fixture.debugElement.query(By.css('#paid')).nativeElement;

      paidField.checked = true;
      dispatchEvent(paidField, 'change');

      tick();
      fixture.detectChanges();

      let priceField = fixture.debugElement.query(By.css('#price')).nativeElement;

      priceField.value = 'dsds';
      dispatchEvent(priceField, 'input');

      expect(addBookComponent.bookForm.controls['price'].errors['notPrice']).toBeTruthy();
    }));
  });

  describe('save()', () => {
    it('should call bookService.create() method when not isEditing mode and form is valid', inject([BookService, HistoryService], fakeAsync((bookService, historyService) => {
      const fixture = TestBed.createComponent(AddBookComponent);
      addBookComponent = fixture.componentInstance;
      tick();
      fixture.detectChanges();

      let titleField = fixture.debugElement.query(By.css('#title')).nativeElement;
      let authorField = fixture.debugElement.query(By.css('#author')).nativeElement;

      titleField.value = 'Book Example';
      dispatchEvent(titleField, 'input');
      authorField.value = 'Unknown';
      dispatchEvent(authorField, 'input');
      fixture.detectChanges();
      tick();

      const book = {
        title: titleField.value,
        author: authorField.value,
        description: '',
        paid: false,
        price: ''
      };

      addBookComponent.save();
      fixture.detectChanges();
      tick();

      expect(bookService.create).toHaveBeenCalledWith(book);
      expect(historyService.addToHistory).toHaveBeenCalledWith(`You added ${book.title} by ${book.author}`);
    })));

    it('should not call bookService.create() method when not isEditing mode and form is invalid', inject([BookService], fakeAsync((bookService) => {
      const fixture = TestBed.createComponent(AddBookComponent);
      addBookComponent = fixture.componentInstance;
      tick();
      fixture.detectChanges();

      let titleField = fixture.debugElement.query(By.css('#title')).nativeElement;
      let authorField = fixture.debugElement.query(By.css('#author')).nativeElement;

      titleField.value = '';
      dispatchEvent(titleField, 'input');
      authorField.value = '';
      dispatchEvent(authorField, 'input');
      fixture.detectChanges();
      tick();

      addBookComponent.save();
      fixture.detectChanges();
      tick();

      expect(bookService.create).not.toHaveBeenCalled();
    })));

    // Cannot test Observable.forkJoin() for now
    // it('should call bookService.changeCover() method when cover was provided', inject([BookService], fakeAsync((bookService) => {
    //   const fixture = TestBed.createComponent(AddBookComponent);
    //   addBookComponent = fixture.componentInstance;
    //   tick();
    //   fixture.detectChanges();
    //
    //   let titleField = fixture.debugElement.query(By.css('#title')).nativeElement;
    //   let authorField = fixture.debugElement.query(By.css('#author')).nativeElement;
    //
    //   titleField.value = 'Book Example';
    //   dispatchEvent(titleField, 'input');
    //   authorField.value = 'Unknown';
    //   dispatchEvent(authorField, 'input');
    //   fixture.detectChanges();
    //   tick();
    //
    //   addBookComponent.onCoverChange({ target: {files: new Blob([JSON.stringify('cover', null, 2)], {type : 'application/json'})}});
    //   fixture.detectChanges();
    //   tick();
    //
    //   addBookComponent.save();
    //   fixture.detectChanges();
    //   tick();
    //
    //   expect(bookService.changeCover).toHaveBeenCalled();
    // })));
    //
    // it('should call bookService.changeEpub() method when epub was provided', inject([BookService], fakeAsync((bookService) => {
    //   const fixture = TestBed.createComponent(AddBookComponent);
    //   addBookComponent = fixture.componentInstance;
    //   tick();
    //   fixture.detectChanges();
    //
    //   let titleField = fixture.debugElement.query(By.css('#title')).nativeElement;
    //   let authorField = fixture.debugElement.query(By.css('#author')).nativeElement;
    //
    //   titleField.value = 'Book Example';
    //   dispatchEvent(titleField, 'input');
    //   authorField.value = 'Unknown';
    //   dispatchEvent(authorField, 'input');
    //   fixture.detectChanges();
    //   tick();
    //
    //   addBookComponent.onEpubChange({ target: {files: new Blob([JSON.stringify('epub', null, 2)], {type : 'application/json'})}});
    //   fixture.detectChanges();
    //   tick();
    //
    //   addBookComponent.save();
    //   fixture.detectChanges();
    //   tick();
    //
    //   expect(bookService.changeEpub).toHaveBeenCalled();
    // })));

    it('should set success to true when adding was successful', inject([], fakeAsync(() => {
      const fixture = TestBed.createComponent(AddBookComponent);
      addBookComponent = fixture.componentInstance;
      tick();
      fixture.detectChanges();

      let titleField = fixture.debugElement.query(By.css('#title')).nativeElement;
      let authorField = fixture.debugElement.query(By.css('#author')).nativeElement;

      titleField.value = 'Book Example';
      dispatchEvent(titleField, 'input');
      authorField.value = 'Unknown';
      dispatchEvent(authorField, 'input');
      fixture.detectChanges();
      tick();

      addBookComponent.save();
      fixture.detectChanges();
      tick();

      expect(addBookComponent.success).toBeTruthy();
    })));

    it('should show error when adding was failed', inject([BookService], fakeAsync((bookService) => {
      bookService.create = () => {
        return Observable.create(observer => {
          const response = new ResponseOptions({
            body: {"message": "Error"},
            status: 400
          });
          observer.error(new Response(response));
        });
      };
      const fixture = TestBed.createComponent(AddBookComponent);
      addBookComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let titleField = fixture.debugElement.query(By.css('#title')).nativeElement;
      let authorField = fixture.debugElement.query(By.css('#author')).nativeElement;

      titleField.value = 'Book Example';
      dispatchEvent(titleField, 'input');
      authorField.value = 'Unknown';
      dispatchEvent(authorField, 'input');
      fixture.detectChanges();
      tick();

      addBookComponent.save();
      fixture.detectChanges();
      tick();

      expect(addBookComponent.error).toEqual('Error');
    })));

    it('should call bookService.update() method when isEditing mode and form is valid', inject([BookService, Router, HistoryService], fakeAsync((bookService, router, historyService) => {
      // create root component with router-outlet
      const fixture = TestBed.createComponent(MockAppComponent);
      router.initialNavigation();
      fixture.detectChanges();
      tick();

      router.navigateByUrl('edit/best-author/example-book');
      fixture.detectChanges();
      tick();

      addBookComponent = fixture.debugElement.children[1].componentInstance;
      fixture.detectChanges();
      tick();

      let titleField = fixture.debugElement.query(By.css('#title')).nativeElement;
      let authorField = fixture.debugElement.query(By.css('#author')).nativeElement;

      titleField.value = 'Book Example 2';
      dispatchEvent(titleField, 'input');
      authorField.value = 'Unknown';
      dispatchEvent(authorField, 'input');
      fixture.detectChanges();
      tick();

      const book = {
        title: titleField.value,
        author: authorField.value,
        description: undefined,
        paid: undefined,
        price: ''
      };

      addBookComponent.save();
      fixture.detectChanges();
      tick();

      expect(bookService.update).toHaveBeenCalledWith('example-book', book);
      expect(historyService.addToHistory).toHaveBeenCalledWith(`You updated ${book.title} by ${book.author}`);
    })));

    it('should not call bookService.update() method when isEditing mode and form is invalid', inject([BookService, Router], fakeAsync((bookService, router) => {
      // create root component with router-outlet
      const fixture = TestBed.createComponent(MockAppComponent);
      router.initialNavigation();
      fixture.detectChanges();
      tick();

      router.navigateByUrl('edit/best-author/example-book');
      fixture.detectChanges();
      tick();

      addBookComponent = fixture.debugElement.children[1].componentInstance;
      fixture.detectChanges();
      tick();

      let titleField = fixture.debugElement.query(By.css('#title')).nativeElement;
      let authorField = fixture.debugElement.query(By.css('#author')).nativeElement;

      titleField.value = '';
      dispatchEvent(titleField, 'input');
      authorField.value = '';
      dispatchEvent(authorField, 'input');
      fixture.detectChanges();
      tick();

      addBookComponent.save();
      fixture.detectChanges();
      tick();

      expect(bookService.update).not.toHaveBeenCalled();
    })));

    it('should set success to true when updating was successful', inject([Router], fakeAsync((router) => {
      // create root component with router-outlet
      const fixture = TestBed.createComponent(MockAppComponent);
      router.initialNavigation();
      fixture.detectChanges();
      tick();

      router.navigateByUrl('edit/best-author/example-book');
      fixture.detectChanges();
      tick();

      addBookComponent = fixture.debugElement.children[1].componentInstance;
      fixture.detectChanges();
      tick();

      let titleField = fixture.debugElement.query(By.css('#title')).nativeElement;
      let authorField = fixture.debugElement.query(By.css('#author')).nativeElement;

      titleField.value = 'Book Example';
      dispatchEvent(titleField, 'input');
      authorField.value = 'Unknown';
      dispatchEvent(authorField, 'input');
      fixture.detectChanges();
      tick();

      addBookComponent.save();
      fixture.detectChanges();
      tick();

      expect(addBookComponent.success).toBeTruthy();
    })));

    it('should show error when updating was failed', inject([BookService, Router], fakeAsync((bookService, router) => {
      bookService.update = () => {
        return Observable.create(observer => {
          const response = new ResponseOptions({
            body: {"message": "Error"},
            status: 400
          });
          observer.error(new Response(response));
        });
      };
      // create root component with router-outlet
      const fixture = TestBed.createComponent(MockAppComponent);
      router.initialNavigation();
      fixture.detectChanges();
      tick();

      router.navigateByUrl('edit/best-author/example-book');
      fixture.detectChanges();
      tick();

      addBookComponent = fixture.debugElement.children[1].componentInstance;
      fixture.detectChanges();
      tick();

      let titleField = fixture.debugElement.query(By.css('#title')).nativeElement;
      let authorField = fixture.debugElement.query(By.css('#author')).nativeElement;

      titleField.value = 'Book Example';
      dispatchEvent(titleField, 'input');
      authorField.value = 'Unknown';
      dispatchEvent(authorField, 'input');
      fixture.detectChanges();
      tick();

      addBookComponent.save();
      fixture.detectChanges();
      tick();

      expect(addBookComponent.error).toEqual('Error');
    })));
  });

  // this test is passing, but got an error because avatar is private property
  // describe('onFileChange', () => {
  //   it('should set passed argument to component property', fakeAsync(() => {
  //     const fixture = TestBed.createComponent(ProfileComponent);
  //     profileComponent = fixture.componentInstance;
  //
  //     tick();
  //     fixture.detectChanges();
  //
  //     profileComponent.onFileChange({ target: {files: ['avatar']} });
  //     expect(profileComponent.avatar).toEqual('avatar');
  //   }));
  // });
});
