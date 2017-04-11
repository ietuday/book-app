import { TestBed, fakeAsync, tick, inject } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { AlertComponent } from "../../alert/alert.component";
import { UserService } from '../../../services/user.service';
import { By } from "@angular/platform-browser";
import { dispatchEvent } from "@angular/platform-browser/testing/browser_util";
import { Observable, BehaviorSubject } from "rxjs";
import { ResponseOptions, Response } from "@angular/http";
import { ProfileComponent } from "./profile.component";
import { User } from "../../../models/User";
import { HistoryService } from "../../../services/history.service";
import { APP_CONFIG, AppConfig } from "../../../app.config";

describe('Profile Component', () => {
  let profileComponent: ProfileComponent;
  let curUser = new User({
    firstName: 'User',
    lastName: 'Fake',
    password: 'password',
    email: 'test@test.com'
  });
  curUser._id = 'user123';

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ProfileComponent,
        AlertComponent
      ],
      imports: [
        ReactiveFormsModule
      ],
      providers: [
        {
          provide: UserService,
          useValue: {
            update: jasmine.createSpy('update').and.callFake(() => {
              return Observable.create(observer => {
                observer.next('Sent')
              });
            }),
            currentUser: new BehaviorSubject<User>(curUser)
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

  it('Profile Component should be defined', () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    profileComponent = fixture.componentInstance;
    fixture.detectChanges();

    expect(profileComponent).toBeDefined();
  });

  it('should initialize profileForm with filled fields from current user', fakeAsync(() => {
    const fixture = TestBed.createComponent(ProfileComponent);
    profileComponent = fixture.componentInstance;
    tick();
    fixture.detectChanges();

    expect(profileComponent.profileForm).toBeDefined();
    expect(profileComponent.profileForm.controls['firstName'].value).toBe('User');
    expect(profileComponent.profileForm.controls['lastName'].value).toBe('Fake');
    expect(profileComponent.profileForm.controls['email'].value).toBe('test@test.com');
  }));

  describe('Validations', () => {
    it('should set required error to true when firstName field is empty', fakeAsync(() => {
      const fixture = TestBed.createComponent(ProfileComponent);
      profileComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let firstNameField = fixture.debugElement.query(By.css('#firstName')).nativeElement;

      firstNameField.value = '';
      dispatchEvent(firstNameField, 'input');

      expect(profileComponent.profileForm.controls['firstName'].errors['required']).toBeTruthy();
    }));

    it('should set required error to true when lastName field is empty', fakeAsync(() => {
      const fixture = TestBed.createComponent(ProfileComponent);
      profileComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let lastNameField = fixture.debugElement.query(By.css('#lastName')).nativeElement;

      lastNameField.value = '';
      dispatchEvent(lastNameField, 'input');

      expect(profileComponent.profileForm.controls['lastName'].errors['required']).toBeTruthy();
    }));

    it('should set required error to true when email field is empty', fakeAsync(() => {
      const fixture = TestBed.createComponent(ProfileComponent);
      profileComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let emailField = fixture.debugElement.query(By.css('#email')).nativeElement;

      emailField.value = '';
      dispatchEvent(emailField, 'input');

      expect(profileComponent.profileForm.controls['email'].errors['required']).toBeTruthy();
    }));

    it('should set validateEmail error to true when email is invalid', fakeAsync(() => {
      const fixture = TestBed.createComponent(ProfileComponent);
      profileComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let emailField = fixture.debugElement.query(By.css('#email')).nativeElement;

      emailField.value = 'test';
      dispatchEvent(emailField, 'input');

      expect(profileComponent.profileForm.controls['email'].errors['validateEmail']).toBeTruthy();
    }));
  });

  describe('saveChanges()', () => {
    it('should call userService.update() method when form is valid', inject([UserService, HistoryService], fakeAsync((userService, historyService) => {
      const fixture = TestBed.createComponent(ProfileComponent);
      profileComponent = fixture.componentInstance;
      tick();
      fixture.detectChanges();

      let firstNameField = fixture.debugElement.query(By.css('#firstName')).nativeElement;
      let lastNameField = fixture.debugElement.query(By.css('#lastName')).nativeElement;
      let emailField = fixture.debugElement.query(By.css('#email')).nativeElement;

      firstNameField.value = 'test';
      dispatchEvent(firstNameField, 'input');
      lastNameField.value = 'user';
      dispatchEvent(lastNameField, 'input');
      emailField.value = 'test@test.com';
      dispatchEvent(emailField, 'input');
      fixture.detectChanges();
      tick();

      const user = {
        firstName: firstNameField.value,
        lastName: lastNameField.value,
        email: emailField.value
      };

      profileComponent.saveChanges();
      expect(userService.update).toHaveBeenCalledWith('user123', user, undefined);
      expect(historyService.addToHistory).toHaveBeenCalledWith('You updated your profile');
    })));

    it('should not call userService.update() method when form is invalid', inject([UserService], fakeAsync((userService) => {
      const fixture = TestBed.createComponent(ProfileComponent);
      profileComponent = fixture.componentInstance;
      tick();
      fixture.detectChanges();

      let firstNameField = fixture.debugElement.query(By.css('#firstName')).nativeElement;
      let lastNameField = fixture.debugElement.query(By.css('#lastName')).nativeElement;
      let emailField = fixture.debugElement.query(By.css('#email')).nativeElement;

      firstNameField.value = '';
      dispatchEvent(firstNameField, 'input');
      lastNameField.value = '';
      dispatchEvent(lastNameField, 'input');
      emailField.value = '';
      dispatchEvent(emailField, 'input');
      fixture.detectChanges();
      tick();

      profileComponent.saveChanges();
      expect(userService.update).not.toHaveBeenCalled();
    })));

    it('should set success to true when saving was successful', inject([UserService], fakeAsync((userService) => {
      const fixture = TestBed.createComponent(ProfileComponent);
      profileComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let firstNameField = fixture.debugElement.query(By.css('#firstName')).nativeElement;
      let lastNameField = fixture.debugElement.query(By.css('#lastName')).nativeElement;
      let emailField = fixture.debugElement.query(By.css('#email')).nativeElement;

      firstNameField.value = 'test';
      dispatchEvent(firstNameField, 'input');
      lastNameField.value = 'user';
      dispatchEvent(lastNameField, 'input');
      emailField.value = 'test@test.com';
      dispatchEvent(emailField, 'input');
      fixture.detectChanges();
      tick();

      const user = {
        firstName: firstNameField.value,
        lastName: lastNameField.value,
        email: emailField.value
      };

      profileComponent.saveChanges();
      expect(userService.update).toHaveBeenCalledWith('user123', user, undefined);
      expect(profileComponent.success).toBeTruthy();
    })));

    it('should show error when saving was failed', inject([UserService], fakeAsync((userService) => {
      userService.update = () => {
        return Observable.create(observer => {
          const response = new ResponseOptions({
            body: {"message": "Error"},
            status: 400
          });
          observer.error(new Response(response));
        });
      };
      const fixture = TestBed.createComponent(ProfileComponent);
      profileComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let firstNameField = fixture.debugElement.query(By.css('#firstName')).nativeElement;
      let lastNameField = fixture.debugElement.query(By.css('#lastName')).nativeElement;
      let emailField = fixture.debugElement.query(By.css('#email')).nativeElement;

      firstNameField.value = 'test';
      dispatchEvent(firstNameField, 'input');
      lastNameField.value = 'user';
      dispatchEvent(lastNameField, 'input');
      emailField.value = 'test@test.com';
      dispatchEvent(emailField, 'input');
      fixture.detectChanges();
      tick();

      profileComponent.saveChanges();
      expect(profileComponent.error).toEqual('Error');
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
