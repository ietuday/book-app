import { TestBed, fakeAsync, tick, inject } from "@angular/core/testing";
import { ChangePasswordComponent } from "./change-password.component";
import { ReactiveFormsModule } from "@angular/forms";
import { AlertComponent } from "../../../alert/alert.component";
import { UserService } from '../../../../services/user.service';
import { By } from "@angular/platform-browser";
import { dispatchEvent } from "@angular/platform-browser/testing/browser_util";
import { Observable, BehaviorSubject } from "rxjs";
import { ResponseOptions, Response } from "@angular/http";
import { User } from "../../../../models/User";

describe('Change Password Component', () => {
  let changePasswordComponent: ChangePasswordComponent;
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
        ChangePasswordComponent,
        AlertComponent
      ],
      imports: [
        ReactiveFormsModule
      ],
      providers: [
        {
          provide: UserService,
          useValue: {
            changePassword: jasmine.createSpy('changePassword').and.callFake(() => {
              return Observable.create(observer => {
                observer.next('Sent')
              });
            }),
            currentUser: new BehaviorSubject<User>(curUser)
          }
        }
      ]
    });
  });

  it('ChangePassword Component should be defined', () => {
    const fixture = TestBed.createComponent(ChangePasswordComponent);
    changePasswordComponent = fixture.componentInstance;
    fixture.detectChanges();

    expect(ChangePasswordComponent).toBeDefined();
  });

  it('should create subscription for currentUser', fakeAsync(() => {
    const fixture = TestBed.createComponent(ChangePasswordComponent);
    changePasswordComponent = fixture.componentInstance;
    tick();
    fixture.detectChanges();

    expect(changePasswordComponent.subscription).toBeDefined();
  }));

  it('should initialize changePasswordForm with empty fields', fakeAsync(() => {
    const fixture = TestBed.createComponent(ChangePasswordComponent);
    changePasswordComponent = fixture.componentInstance;
    tick();
    fixture.detectChanges();

    expect(changePasswordComponent.changePasswordForm).toBeDefined();
    expect(changePasswordComponent.changePasswordForm.controls['newPassword'].value).toBe('');
    expect(changePasswordComponent.changePasswordForm.controls['oldPassword'].value).toBe('');
    expect(changePasswordComponent.changePasswordForm.controls['verifyPassword'].value).toBe('');
  }));

  describe('Validations', () => {
    it('should set required error to true when newPassword field is empty', fakeAsync(() => {
      const fixture = TestBed.createComponent(ChangePasswordComponent);
      changePasswordComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let newPasswordField = fixture.debugElement.query(By.css('#newPassword')).nativeElement;

      newPasswordField.value = '';
      dispatchEvent(newPasswordField, 'input');

      expect(changePasswordComponent.changePasswordForm.controls['newPassword'].errors['required']).toBeTruthy();
    }));

    it('should set required error to true when oldPassword field is empty', fakeAsync(() => {
      const fixture = TestBed.createComponent(ChangePasswordComponent);
      changePasswordComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let currentPasswordField = fixture.debugElement.query(By.css('#currentPassword')).nativeElement;

      currentPasswordField.value = '';
      dispatchEvent(currentPasswordField, 'input');

      expect(changePasswordComponent.changePasswordForm.controls['oldPassword'].errors['required']).toBeTruthy();
    }));

    it('should set required error to true when verifyPassword is empty', fakeAsync(() => {
      const fixture = TestBed.createComponent(ChangePasswordComponent);
      changePasswordComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let verifyPasswordField = fixture.debugElement.query(By.css('#verifyPassword')).nativeElement;

      verifyPasswordField.value = '';
      dispatchEvent(verifyPasswordField, 'input');

      expect(changePasswordComponent.changePasswordForm.controls['verifyPassword'].errors['required']).toBeTruthy();
    }));

    it('should set notMatch error to true when newPassword is not equal verifyPassword', fakeAsync(() => {
      const fixture = TestBed.createComponent(ChangePasswordComponent);
      changePasswordComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let newPasswordField = fixture.debugElement.query(By.css('#newPassword')).nativeElement;

      newPasswordField.value = '111';
      dispatchEvent(newPasswordField, 'input');

      let verifyPasswordField = fixture.debugElement.query(By.css('#verifyPassword')).nativeElement;

      verifyPasswordField.value = '11111';
      dispatchEvent(verifyPasswordField, 'input');

      expect(changePasswordComponent.changePasswordForm.controls['verifyPassword'].errors['notMatch']).toBeTruthy();
    }));
  });

  describe('changePassword()', () => {
    it('should call userService.changePassword() method when form is valid', inject([UserService], fakeAsync((userService) => {
      const fixture = TestBed.createComponent(ChangePasswordComponent);
      changePasswordComponent = fixture.componentInstance;
      tick();
      fixture.detectChanges();

      let newPasswordField = fixture.debugElement.query(By.css('#newPassword')).nativeElement;
      let currentPasswordField = fixture.debugElement.query(By.css('#currentPassword')).nativeElement;
      let verifyPasswordField = fixture.debugElement.query(By.css('#verifyPassword')).nativeElement;

      newPasswordField.value = '2222';
      dispatchEvent(newPasswordField, 'input');
      currentPasswordField.value = 'password';
      dispatchEvent(currentPasswordField, 'input');
      verifyPasswordField.value = '2222';
      dispatchEvent(verifyPasswordField, 'input');
      fixture.detectChanges();
      tick();

      changePasswordComponent.changePassword();
      expect(userService.changePassword).toHaveBeenCalledWith('user123', '2222', 'password');
    })));

    it('should not call userService.changePassword() method when form is invalid', inject([UserService], fakeAsync((userService) => {
      const fixture = TestBed.createComponent(ChangePasswordComponent);
      changePasswordComponent = fixture.componentInstance;
      tick();
      fixture.detectChanges();

      let newPasswordField = fixture.debugElement.query(By.css('#newPassword')).nativeElement;
      let currentPasswordField = fixture.debugElement.query(By.css('#currentPassword')).nativeElement;
      let verifyPasswordField = fixture.debugElement.query(By.css('#verifyPassword')).nativeElement;

      newPasswordField.value = '';
      dispatchEvent(newPasswordField, 'input');
      currentPasswordField.value = 'password';
      dispatchEvent(currentPasswordField, 'input');
      verifyPasswordField.value = '2222';
      dispatchEvent(verifyPasswordField, 'input');
      fixture.detectChanges();
      tick();

      changePasswordComponent.changePassword();
      expect(userService.changePassword).not.toHaveBeenCalled();
    })));

    it('should set success to true when changing was successful', inject([UserService], fakeAsync((userService) => {
      const fixture = TestBed.createComponent(ChangePasswordComponent);
      changePasswordComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let newPasswordField = fixture.debugElement.query(By.css('#newPassword')).nativeElement;
      let currentPasswordField = fixture.debugElement.query(By.css('#currentPassword')).nativeElement;
      let verifyPasswordField = fixture.debugElement.query(By.css('#verifyPassword')).nativeElement;

      newPasswordField.value = '2222';
      dispatchEvent(newPasswordField, 'input');
      currentPasswordField.value = 'password';
      dispatchEvent(currentPasswordField, 'input');
      verifyPasswordField.value = '2222';
      dispatchEvent(verifyPasswordField, 'input');
      fixture.detectChanges();
      tick();

      changePasswordComponent.changePassword();

      expect(changePasswordComponent.success).toBeTruthy();
    })));

    it('should set error when changing was failed', inject([UserService], fakeAsync((userService) => {
      userService.changePassword = () => {
        return Observable.create(observer => {
          const response = new ResponseOptions({
            body: {"message": "Error"},
            status: 400
          });
          observer.error(new Response(response));
        });
      };

      const fixture = TestBed.createComponent(ChangePasswordComponent);
      changePasswordComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let newPasswordField = fixture.debugElement.query(By.css('#newPassword')).nativeElement;
      let currentPasswordField = fixture.debugElement.query(By.css('#currentPassword')).nativeElement;
      let verifyPasswordField = fixture.debugElement.query(By.css('#verifyPassword')).nativeElement;

      newPasswordField.value = '2222';
      dispatchEvent(newPasswordField, 'input');
      currentPasswordField.value = 'password';
      dispatchEvent(currentPasswordField, 'input');
      verifyPasswordField.value = '2222';
      dispatchEvent(verifyPasswordField, 'input');
      fixture.detectChanges();
      tick();

      changePasswordComponent.changePassword();

      expect(changePasswordComponent.error).toEqual('Error');
    })));
  });
});
