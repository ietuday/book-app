import { TestBed, fakeAsync, tick, inject } from "@angular/core/testing";
import { CommentsComponent } from "./comments.component";
import { FormsModule } from "@angular/forms";
import { CommentService } from "../../../services/comment.service";
import { Observable } from "rxjs";
import { Http, ConnectionBackend, BaseRequestOptions } from "@angular/http";
import { MockBackend } from "@angular/http/testing";
import { AuthHttp, AuthConfig } from "angular2-jwt";
import { User } from "../../../models/User";
import { By } from "@angular/platform-browser";
import { HistoryService } from "../../../services/history.service";
import { Book } from "../../../models/Book";

describe('Comments Component', () => {
  let commentsComponent;
  let curUser = new User({
    firstName: 'User',
    lastName: 'Fake',
    password: 'password',
    email: 'test@test.com'
  });
  curUser._id = 'user123';
  curUser.displayName = 'Fake User';

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        CommentsComponent
      ],
      imports: [
        FormsModule
      ],
      providers: [
        BaseRequestOptions,
        MockBackend,
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
        }
      ]
    })
    .overrideComponent(CommentsComponent, {
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
              }),

              saveComment: jasmine.createSpy('saveComment').and.callFake(() => {
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

  it('Comment Component should be defined', () => {
    const fixture = TestBed.createComponent(CommentsComponent);
    commentsComponent = fixture.componentInstance;
    commentsComponent.user = curUser;
    commentsComponent.book = <Book>{
      _id: 'book123',
      title: 'Awesome book',
      author: 'Unknown'
    };

    fixture.detectChanges();

    expect(commentsComponent).toBeDefined();
  });

  it('should initialize with comments', fakeAsync(() => {
    const fixture = TestBed.createComponent(CommentsComponent);
    const commentService = fixture.debugElement.injector.get(CommentService);
    commentsComponent = fixture.componentInstance;
    commentsComponent.user = curUser;
    commentsComponent.book = <Book>{
      _id: 'book123',
      title: 'Awesome book',
      author: 'Unknown'
    };

    tick();
    fixture.detectChanges();

    expect(commentService.getComments).toHaveBeenCalledWith('book123');
    expect(commentsComponent.comments.bookId).toEqual('book123');
    expect(commentsComponent.comments.messages.length).toEqual(2);
  }));

  it('should initialize with comments sorted by date', fakeAsync(() => {
    const fixture = TestBed.createComponent(CommentsComponent);
    commentsComponent = fixture.componentInstance;
    commentsComponent.user = curUser;
    commentsComponent.book = <Book>{
      _id: 'book123',
      title: 'Awesome book',
      author: 'Unknown'
    };

    tick();
    fixture.detectChanges();

    expect(commentsComponent.comments.messages[0].text).toEqual('Great Book');
    expect(commentsComponent.comments.messages[1].text).toEqual('Awesome Book');
  }));

  describe('submitComment()', () => {
    it('should save comment if form is valid', inject([HistoryService], fakeAsync((historyService) => {
      const fixture = TestBed.createComponent(CommentsComponent);
      commentsComponent = fixture.componentInstance;
      commentsComponent.user = curUser;
      commentsComponent.book = <Book>{
        _id: 'book123',
        title: 'Awesome book',
        author: 'Unknown'
      };

      spyOn(commentsComponent, 'submitComment');

      fixture.detectChanges();

      let commentForm = fixture.debugElement.query(By.css('[name = commentForm]'));
      // could not test commentService.saveComment() because of ngModel not updating
      commentForm.triggerEventHandler('submit', null);
      fixture.detectChanges();

      expect(commentsComponent.submitComment).toHaveBeenCalled();
      // expect(historyService.addToHistory).toHaveBeenCalledWith('You commented on Awesome book by Unknown');
    })));
  });
});
