import { TestBed, fakeAsync, inject, tick } from "@angular/core/testing";
import { HelpComponent } from "./help.component";
import { UserService } from "../../../services/user.service";
import { User } from "../../../models/User";
import { BehaviorSubject } from "rxjs";
import { ChatService } from "../../../services/chat.service";
import { FormsModule } from "@angular/forms";

describe('Help Component', () => {
  let helpComponent;
  let curUser = new User({
    firstName: 'User',
    lastName: 'Fake',
    password: 'password',
    email: 'test@test.com'
  });
  curUser._id = 'user123';
  curUser.displayName = 'Fake User';
  curUser.roles = ['admin'];

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        HelpComponent
      ],
      imports: [
        FormsModule
      ],
      providers: [
        {
          provide: UserService,
          useValue: {
            currentUser: new BehaviorSubject<User>(curUser)
          }
        },
        {
          provide: ChatService,
          useValue: {
            getQuestions: jasmine.createSpy('getQuestions').and.returnValue(true),
            questionsStream: new BehaviorSubject<any>(null),
            answersStream: new BehaviorSubject<any>(null),
            sendQuestion: jasmine.createSpy('sendQuestion').and.returnValue(true),
            sendAnswer: jasmine.createSpy('sendAnswer').and.returnValue(true)
          }
        }
      ]
    });
  });

  it('Help Component should be defined', () => {
    const fixture = TestBed.createComponent(HelpComponent);
    helpComponent = fixture.componentInstance;
    fixture.detectChanges();

    expect(helpComponent).toBeDefined();
  });

  it('Help Component should have subscriptions defined', () => {
    const fixture = TestBed.createComponent(HelpComponent);
    helpComponent = fixture.componentInstance;
    fixture.detectChanges();

    expect(helpComponent.userSub).toBeDefined();
    expect(helpComponent.chatSub).toBeDefined();
  });

  describe('sendQuestion()', () => {
    it('should call chatService.sendQuestion()', inject([ChatService], fakeAsync((chatService) => {
      const fixture = TestBed.createComponent(HelpComponent);
      helpComponent = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      helpComponent.sendQuestion();
      tick();

      expect(chatService.sendQuestion).toHaveBeenCalled();
    })));
  });

  describe('sendAnswer()', () => {
    it('should call chatService.sendAnswer()', inject([ChatService], fakeAsync((chatService) => {
      const fixture = TestBed.createComponent(HelpComponent);
      helpComponent = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      helpComponent.sendAnswer({answer: 'Answer', socketId: 'socketId'});
      tick();

      expect(chatService.sendAnswer).toHaveBeenCalledWith('Answer', 'Fake User', 'socketId');
    })));
  });
});
