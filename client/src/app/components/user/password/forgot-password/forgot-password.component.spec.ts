import { TestBed, fakeAsync, tick, inject } from "@angular/core/testing";
import { ForgotPasswordComponent } from "./forgot-password.component";
import { ReactiveFormsModule } from "@angular/forms";
import { AlertComponent } from "../../../alert/alert.component";
import { UserService } from '../../../../services/user.service';
import { By } from "@angular/platform-browser";
import { dispatchEvent } from "@angular/platform-browser/testing/browser_util";
import { Observable } from "rxjs";
import { ResponseOptions, Response } from "@angular/http";
import { RouterTestingModule } from "@angular/router/testing";
import { ResetPasswordComponent } from "../reset-password/reset-password.component";
import { MockAppComponent } from "../../../../helpers/mocks";
import { Location } from "@angular/common";
import { HistoryService } from "../../../../services/history.service";

describe('Forgot Password Component', () => {
  let forgotPasswordComponent: ForgotPasswordComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ForgotPasswordComponent,
        AlertComponent,
        ResetPasswordComponent,
        MockAppComponent
      ],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([
          { path: 'reset/:token', component: ResetPasswordComponent }
        ])
      ],
      providers: [
        {
          provide: UserService,
          useValue: {
            requestReset: jasmine.createSpy('requestReset').and.callFake(() => {
              return Observable.create(observer => {
                observer.next({token: 'token'});
              });
            })
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
        }
      ]
    });
  });

  it('ForgotPassword Component should be defined', () => {
    const fixture = TestBed.createComponent(ForgotPasswordComponent);
    forgotPasswordComponent = fixture.componentInstance;
    fixture.detectChanges();

    expect(ForgotPasswordComponent).toBeDefined();
  });

  it('should initialize forgotForm with empty fields', fakeAsync(() => {
    const fixture = TestBed.createComponent(ForgotPasswordComponent);
    forgotPasswordComponent = fixture.componentInstance;
    tick();
    fixture.detectChanges();

    expect(forgotPasswordComponent.forgotForm).toBeDefined();
    expect(forgotPasswordComponent.forgotForm.controls['email'].value).toBe('');
  }));

  describe('Validations', () => {
    it('should set required error to true when email field is empty', fakeAsync(() => {
      const fixture = TestBed.createComponent(ForgotPasswordComponent);
      forgotPasswordComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let emailField = fixture.debugElement.query(By.css('#email')).nativeElement;

      emailField.value = '';
      dispatchEvent(emailField, 'input');

      expect(forgotPasswordComponent.forgotForm.controls['email'].errors['required']).toBeTruthy();
    }));

    it('should set validateEmail error to true when email is invalid', fakeAsync(() => {
      const fixture = TestBed.createComponent(ForgotPasswordComponent);
      forgotPasswordComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let emailField = fixture.debugElement.query(By.css('#email')).nativeElement;

      emailField.value = 'invalid_email';
      dispatchEvent(emailField, 'input');

      expect(forgotPasswordComponent.forgotForm.controls['email'].errors['validateEmail']).toBeTruthy();
    }));
  });

  describe('onSubmit()', () => {
    it('should call userService.requestReset() method when form is valid', inject([UserService], fakeAsync((userService) => {
      // create root component with router-outlet
      TestBed.createComponent(MockAppComponent);
      const fixture = TestBed.createComponent(ForgotPasswordComponent);
      forgotPasswordComponent = fixture.componentInstance;
      tick();
      fixture.detectChanges();

      let emailField = fixture.debugElement.query(By.css('#email')).nativeElement;

      emailField.value = 'test@test.com';
      dispatchEvent(emailField, 'input');

      fixture.detectChanges();

      forgotPasswordComponent.onSubmit();
      tick();

      expect(userService.requestReset).toHaveBeenCalledWith({email: 'test@test.com'});
    })));

    it('should not call userService.resetRequest() method when form is invalid', inject([UserService], fakeAsync((userService) => {
      const fixture = TestBed.createComponent(ForgotPasswordComponent);
      forgotPasswordComponent = fixture.componentInstance;
      tick();
      fixture.detectChanges();

      let emailField = fixture.debugElement.query(By.css('#email')).nativeElement;

      emailField.value = 'invalid_email';
      dispatchEvent(emailField, 'input');

      fixture.detectChanges();

      forgotPasswordComponent.onSubmit();
      tick();

      expect(userService.requestReset).not.toHaveBeenCalled();
    })));

    it('should navigate to reset when email exists', inject([UserService, Location], fakeAsync((userService, location) => {
      // create root component with router-outlet
      TestBed.createComponent(MockAppComponent);
      const fixture = TestBed.createComponent(ForgotPasswordComponent);
      forgotPasswordComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let emailField = fixture.debugElement.query(By.css('#email')).nativeElement;

      emailField.value = 'test@test.com';
      dispatchEvent(emailField, 'input');

      fixture.detectChanges();

      forgotPasswordComponent.onSubmit();
      tick();

      expect(location.path()).toEqual('/reset/token');
    })));

    it('should set error when email not exists', inject([UserService], fakeAsync((userService) => {
      userService.requestReset = () => {
        return Observable.create(observer => {
          const response = new ResponseOptions({
            body: {"message": "Error"},
            status: 400
          });
          observer.error(new Response(response));
        });
      };

      // create root component with router-outlet
      TestBed.createComponent(MockAppComponent);
      const fixture = TestBed.createComponent(ForgotPasswordComponent);
      forgotPasswordComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let emailField = fixture.debugElement.query(By.css('#email')).nativeElement;

      emailField.value = 'test@test.com';
      dispatchEvent(emailField, 'input');

      fixture.detectChanges();

      forgotPasswordComponent.onSubmit();
      tick();

      expect(forgotPasswordComponent.error).toEqual('Error');
    })));
  });
});
