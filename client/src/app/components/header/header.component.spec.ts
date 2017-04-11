import { TestBed, fakeAsync, tick, inject } from "@angular/core/testing";
import { HeaderComponent } from "./header.component";
import { HomeComponent } from "../home/home.component";
import { MockAppComponent } from "../../helpers/mocks";
import { RouterTestingModule } from "@angular/router/testing";
import { UserService } from "../../services/user.service";
import { BehaviorSubject, Observable } from "rxjs";
import { Location } from "@angular/common";
import { User } from "../../models/User";
import { ChatService } from "../../services/chat.service";
import { ToastsManager } from "ng2-toastr";
import { APP_CONFIG, AppConfig } from "../../app.config";

describe('Header Component', () => {
  let headerComponent;
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
        HeaderComponent,
        HomeComponent,
        MockAppComponent
      ],
      imports: [
        RouterTestingModule.withRoutes([
          { path: '', component: HomeComponent }
        ])
      ],
      providers: [
        {
          provide: UserService,
          useValue: {
            logout: jasmine.createSpy('logout'),
            isLoggedIn: () => {
              return true;
            },
            currentUser: new BehaviorSubject<User>(curUser)
          }
        },
        {
          provide: ChatService,
          useValue: {
            getQuestions: jasmine.createSpy('getQuestions').and.returnValue(true),
            questionsStream: new BehaviorSubject<any>(null),
            answersStream: new BehaviorSubject<any>(null),
            getAdminConnection: jasmine.createSpy('getAdminConnection').and.callFake(() => {
              return Observable.create(observer => {
                observer.next('connected');
              });
            })
          }
        },
        {
          provide: ToastsManager,
          useValue: {
            info: jasmine.createSpy('info')
          }
        },
        {
          provide: APP_CONFIG,
          useValue: AppConfig
        }
      ]
    });
  });

  it('Header Component should be defined', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    headerComponent = fixture.componentInstance;
    fixture.detectChanges();

    expect(headerComponent).toBeDefined();
  });

  it('Header Component should have subscriptions defined', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    headerComponent = fixture.componentInstance;
    fixture.detectChanges();

    expect(headerComponent.userSub).toBeDefined();
    expect(headerComponent.chatSub).toBeDefined();
    expect(headerComponent.msgSub).toBeDefined();
  });

  it('should call _chatService.getQuestions() for admin role', inject([ChatService], fakeAsync((chatService) => {
    const fixture = TestBed.createComponent(HeaderComponent);
    headerComponent = fixture.componentInstance;
    fixture.detectChanges();
    tick();

    expect(chatService.getQuestions).toHaveBeenCalled();
  })));

  it('isAdminOnline should be set to true', inject([], fakeAsync(() => {
    const fixture = TestBed.createComponent(HeaderComponent);
    headerComponent = fixture.componentInstance;
    fixture.detectChanges();
    tick();

    expect(headerComponent.isAdminOnline).toBeTruthy();
  })));

  describe('Signout()', () => {
    it('should call userService.logout() and redirect to /', inject([UserService, Location], fakeAsync((userService, location) => {
      // create root component with router-outlet
      TestBed.createComponent(MockAppComponent);
      const fixture = TestBed.createComponent(HeaderComponent);
      headerComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      headerComponent.signout();
      tick();
      fixture.detectChanges();

      expect(userService.logout).toHaveBeenCalled();
      expect(location.path()).toEqual('/');
    })));
  });
});
