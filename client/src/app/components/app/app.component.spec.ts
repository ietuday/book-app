/* tslint:disable:no-unused-variable */

import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { RouterTestingModule } from "@angular/router/testing";
import { HomeComponent } from "../home/home.component";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { UserService } from "../../services/user.service";
import { BehaviorSubject, Observable } from "rxjs";
import { User } from "../../models/User";
import { HistoryService } from "../../services/history.service";
import { ChatService } from "../../services/chat.service";
import { ToastsManager } from "ng2-toastr";
import { APP_CONFIG, AppConfig } from "../../app.config";

describe('App Component', () => {
  let curUser = new User({
    firstName: 'User',
    lastName: 'Fake',
    email: 'test@example.com',
    password: 'password'
  });
  curUser.roles = ['admin'];

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        HeaderComponent,
        FooterComponent,
        SidebarComponent,
        HomeComponent
      ],
      imports: [
        RouterTestingModule
      ],
      providers: [
        {
          provide: UserService,
          useValue: {
            currentUser: new BehaviorSubject<User>(curUser),
            isLoggedIn: () => {
              return true;
            }
          }
        },
        {
          provide: HistoryService,
          useValue: {
            userHistory: new BehaviorSubject<any>(null)
          }
        },
        {
          provide: ChatService,
          useValue: {
            getQuestions: jasmine.createSpy('getQuestions').and.returnValue(true),
            questionsStream: new BehaviorSubject<any>(null),
            getAdminConnection: jasmine.createSpy('getAdminConnection').and.callFake(() => {
              return Observable.create(observer => {
                observer.next('connected');
              });
            })
          }
        },
        {
          provide: ToastsManager,
          useValue: {}
        },
        {
          provide: APP_CONFIG,
          useValue: AppConfig
        }
      ]
    });
  });

  it('should create the App Component', async(() => {
    let fixture = TestBed.createComponent(AppComponent);
    let appComponent = fixture.debugElement.componentInstance;
    fixture.detectChanges();

    expect(appComponent).toBeTruthy();
  }));
});
