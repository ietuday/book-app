import { TestBed, fakeAsync, tick, inject } from "@angular/core/testing";
import { ResetPasswordComponent } from "./reset-password.component";
import { ReactiveFormsModule } from "@angular/forms";
import { AlertComponent } from "../../../alert/alert.component";
import { UserService } from '../../../../services/user.service';
import { By } from "@angular/platform-browser";
import { dispatchEvent } from "@angular/platform-browser/testing/browser_util";
import { Observable } from "rxjs";
import { ResponseOptions, Response } from "@angular/http";
import { RouterTestingModule } from "@angular/router/testing";
import { MockAppComponent } from "../../../../helpers/mocks";
import { Location } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { HomeComponent } from "../../../home/home.component";
import { HistoryService } from "../../../../services/history.service";

describe('Reset Password Component', () => {
  let resetPasswordComponent: ResetPasswordComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ResetPasswordComponent,
        AlertComponent,
        ResetPasswordComponent,
        MockAppComponent,
        HomeComponent
      ],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([
          { path: '', component: HomeComponent },
          { path: 'reset/:token', component: ResetPasswordComponent }
        ])
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useFactory: (r: Router) => r.routerState.root,
          deps: [ Router ]
        },
        {
          provide: UserService,
          useValue: {
            resetPassword: jasmine.createSpy('resetPassword').and.callFake(() => {
              return Observable.create(observer => {
                observer.next({token: 'token'});
              });
            }),
            isLoggedIn: () => {
              return true;
            }
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

  it('ResetPassword Component should be defined', () => {
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    resetPasswordComponent = fixture.componentInstance;
    fixture.detectChanges();

    expect(ResetPasswordComponent).toBeDefined();
  });

  it('should initialize with token param', inject([Router], fakeAsync((router) => {
    // create root component with router-outlet
    const fixture = TestBed.createComponent(MockAppComponent);
    router.initialNavigation();
    fixture.detectChanges();
    tick();

    router.navigateByUrl('/reset/token');
    fixture.detectChanges();
    tick();

    resetPasswordComponent = fixture.debugElement.children[1].componentInstance;
    fixture.detectChanges();
    tick();

    expect(resetPasswordComponent.token).toEqual('token');
  })));

  it('should initialize resetPasswordForm with empty fields', fakeAsync(() => {
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    resetPasswordComponent = fixture.componentInstance;
    tick();
    fixture.detectChanges();

    expect(resetPasswordComponent.resetPasswordForm).toBeDefined();
    expect(resetPasswordComponent.resetPasswordForm.controls['newPassword'].value).toBe('');
    expect(resetPasswordComponent.resetPasswordForm.controls['verifyPassword'].value).toBe('');
  }));

  describe('Validations', () => {
    it('should set required error to true when password field is empty', fakeAsync(() => {
      const fixture = TestBed.createComponent(ResetPasswordComponent);
      resetPasswordComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let passwordField = fixture.debugElement.query(By.css('#newPassword')).nativeElement;

      passwordField.value = '';
      dispatchEvent(passwordField, 'input');

      expect(resetPasswordComponent.resetPasswordForm.controls['newPassword'].errors['required']).toBeTruthy();
    }));

    it('should set required error to true when verifyPassword field is empty', fakeAsync(() => {
      const fixture = TestBed.createComponent(ResetPasswordComponent);
      resetPasswordComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let verifyPasswordField = fixture.debugElement.query(By.css('#verifyPassword')).nativeElement;

      verifyPasswordField.value = '';
      dispatchEvent(verifyPasswordField, 'input');

      expect(resetPasswordComponent.resetPasswordForm.controls['verifyPassword'].errors['required']).toBeTruthy();
    }));

    it('should set notMatch error to true when password and cerifyPaswword not equal', fakeAsync(() => {
      const fixture = TestBed.createComponent(ResetPasswordComponent);
      resetPasswordComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let passwordField = fixture.debugElement.query(By.css('#newPassword')).nativeElement;

      passwordField.value = '111';
      dispatchEvent(passwordField, 'input');

      let verifyPasswordField = fixture.debugElement.query(By.css('#verifyPassword')).nativeElement;

      verifyPasswordField.value = '11111';
      dispatchEvent(verifyPasswordField, 'input');

      expect(resetPasswordComponent.resetPasswordForm.controls['verifyPassword'].errors['notMatch']).toBeTruthy();
    }));
  });

  describe('onSubmit()', () => {
    it('should call userService.resetPassword() method when form is valid', inject([UserService, Router, HistoryService], fakeAsync((userService, router, historyService) => {
      // create root component with router-outlet
      const fixture = TestBed.createComponent(MockAppComponent);
      router.initialNavigation();
      fixture.detectChanges();
      tick();

      router.navigateByUrl('/reset/token');
      fixture.detectChanges();
      tick();

      resetPasswordComponent = fixture.debugElement.children[1].componentInstance;;
      fixture.detectChanges();
      tick();

      let passwordField = fixture.debugElement.children[1].query(By.css('#newPassword')).nativeElement;

      passwordField.value = '11111';
      dispatchEvent(passwordField, 'input');

      let verifyPasswordField = fixture.debugElement.children[1].query(By.css('#verifyPassword')).nativeElement;

      verifyPasswordField.value = '11111';
      dispatchEvent(verifyPasswordField, 'input');

      fixture.detectChanges();

      resetPasswordComponent.onSubmit();
      tick();

      expect(userService.resetPassword).toHaveBeenCalledWith('token', '11111');
      expect(historyService.addToHistory).toHaveBeenCalledWith('You updated your password');
    })));

    it('should not call userService.resetPassword() method when form is invalid', inject([UserService], fakeAsync((userService) => {
      const fixture = TestBed.createComponent(ResetPasswordComponent);
      resetPasswordComponent = fixture.componentInstance;
      tick();
      fixture.detectChanges();

      let passwordField = fixture.debugElement.query(By.css('#newPassword')).nativeElement;

      passwordField.value = '11111';
      dispatchEvent(passwordField, 'input');

      let verifyPasswordField = fixture.debugElement.query(By.css('#verifyPassword')).nativeElement;

      verifyPasswordField.value = '111';
      dispatchEvent(verifyPasswordField, 'input');

      fixture.detectChanges();

      resetPasswordComponent.onSubmit();
      tick();

      expect(userService.resetPassword).not.toHaveBeenCalled();
    })));

    it('should navigate to home when token exists', inject([UserService, Location], fakeAsync((userService, location) => {
      // create root component with router-outlet
      TestBed.createComponent(MockAppComponent);
      const fixture = TestBed.createComponent(ResetPasswordComponent);
      resetPasswordComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let passwordField = fixture.debugElement.query(By.css('#newPassword')).nativeElement;

      passwordField.value = '11111';
      dispatchEvent(passwordField, 'input');

      let verifyPasswordField = fixture.debugElement.query(By.css('#verifyPassword')).nativeElement;

      verifyPasswordField.value = '11111';
      dispatchEvent(verifyPasswordField, 'input');

      fixture.detectChanges();

      resetPasswordComponent.onSubmit();
      tick();

      expect(location.path()).toEqual('/');
    })));

    it('should set error when email not exists', inject([UserService], fakeAsync((userService) => {
      userService.resetPassword = () => {
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
      const fixture = TestBed.createComponent(ResetPasswordComponent);
      resetPasswordComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let passwordField = fixture.debugElement.query(By.css('#newPassword')).nativeElement;

      passwordField.value = '11111';
      dispatchEvent(passwordField, 'input');

      let verifyPasswordField = fixture.debugElement.query(By.css('#verifyPassword')).nativeElement;

      verifyPasswordField.value = '11111';
      dispatchEvent(verifyPasswordField, 'input');

      fixture.detectChanges();

      resetPasswordComponent.onSubmit();
      tick();

      expect(resetPasswordComponent.error).toEqual('Error');
    })));
  });
});
