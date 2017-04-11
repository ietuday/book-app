// Cannot mock EPUJS, ePubReader for testing

// import {TestBed, inject, fakeAsync, tick} from "@angular/core/testing";
// import {ReadingBookComponent} from "./reading-book.component";
// import {BookService} from "../../../services/book.service";
// import {Observable, BehaviorSubject} from "rxjs";
// import {UserService} from "../../../services/user.service";
// import {User} from "../../../models/User";
// import {ActivatedRoute, Router} from "@angular/router";
// import {RouterTestingModule} from "@angular/router/testing";
// import {MockAppComponent} from "../../../helpers/mocks";
//
// describe('Reading Book Component', () => {
//   let readingBookComponent;
//   let curUser = new User({
//     firstName: 'User',
//     lastName: 'Fake',
//     password: 'password',
//     email: 'test@test.com'
//   });
//   curUser._id = 'user123';
//   curUser.reading = {
//     epubUrl: '',
//     bookmark: ''
//   };
//
//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       declarations: [
//         ReadingBookComponent,
//         MockAppComponent
//       ],
//       imports: [
//         RouterTestingModule.withRoutes([
//           { path: '', component: MockAppComponent },
//           { path: 'reading/:author/:slug', component: ReadingBookComponent },
//           { path: 'reading', component: ReadingBookComponent }
//         ]),
//       ],
//       providers: [
//         {
//           provide: BookService,
//           useValue: {
//             getBook: jasmine.createSpy('getBook').and.callFake(() => {
//               return Observable.create(observer => {
//                 observer.next({ ebupUrl: 'example/book.epub' });
//               });
//             })
//           }
//         },
//         {
//           provide: UserService,
//           useValue: {
//             currentUser: new BehaviorSubject<User>(curUser)
//           }
//         },
//         {
//           provide: ActivatedRoute,
//           useFactory: (r: Router) => r.routerState.root,
//           deps: [Router]
//         }
//       ]
//     });
//   });
//
//   it('Reading Book Component should be defined', inject([Router], fakeAsync((router) => {
//     // create root component with router-outlet
//     const fixture = TestBed.createComponent(MockAppComponent);
//     router.initialNavigation();
//     fixture.detectChanges();
//     tick();
//
//     router.navigateByUrl('reading/best-author/awesome-book');
//     fixture.detectChanges();
//     tick();
//
//     readingBookComponent = fixture.debugElement.children[1].componentInstance;
//     fixture.detectChanges();
//     tick();
//     console.log(readingBookComponent.user)
//
//     expect(readingBookComponent).toBeDefined();
//   })));
//
//   it('should call bookService.getBook() if slug parameter passed', inject([BookService, Router], fakeAsync((bookService, router) => {
//     // create root component with router-outlet
//     const fixture = TestBed.createComponent(MockAppComponent);
//     router.initialNavigation();
//     fixture.detectChanges();
//     tick();
//
//     router.navigateByUrl('reading/best-author/awesome-book');
//     fixture.detectChanges();
//     tick();
//
//     readingBookComponent = fixture.debugElement.children[1].componentInstance;
//     fixture.detectChanges();
//     tick();
//
//     expect(bookService.getBook).toHaveBeenCalledWith('awesome-book');
//   })));
// });
