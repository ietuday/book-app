import { TestBed, fakeAsync, tick, inject } from "@angular/core/testing";
import { SigninComponent } from "./signin.component";
import { ReactiveFormsModule } from "@angular/forms";
import { AlertComponent } from "../../alert/alert.component";
import { Location } from "@angular/common";
import { UserService } from '../../../services/user.service';
import { RouterTestingModule } from "@angular/router/testing";
import { HomeComponent } from "../../home/home.component";
import { By } from "@angular/platform-browser";
import { dispatchEvent } from "@angular/platform-browser/testing/browser_util";
import { Observable } from "rxjs";
import { MockAppComponent } from "../../../helpers/mocks";
import { ResponseOptions, Response } from "@angular/http";

describe('Signin Component', () => {
  let signinComponent: SigninComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        SigninComponent,
        AlertComponent,
        HomeComponent,
        MockAppComponent
      ],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([
          { path: '', component: HomeComponent }
        ])
      ],
      providers: [
        {
          provide: UserService,
          useValue: {
            login: jasmine.createSpy('login').and.callFake(() => {
              return Observable.create(observer => {
                observer.next('Sent')
              });
            }),
            isLoggedIn: () => {
              return true;
            }
          }
        }
      ]
    });
  });

  it('Signin Component should be defined', () => {
    const fixture = TestBed.createComponent(SigninComponent);
    signinComponent = fixture.componentInstance;
    fixture.detectChanges();

    expect(signinComponent).toBeDefined();
  });

  it('should initialize signinForm with empty fields', fakeAsync(() => {
    const fixture = TestBed.createComponent(SigninComponent);
    signinComponent = fixture.componentInstance;
    tick();
    fixture.detectChanges();

    expect(signinComponent.signinForm).toBeDefined();
    expect(signinComponent.signinForm.controls['email'].value).toBe('');
    expect(signinComponent.signinForm.controls['password'].value).toBe('');
  }));

  describe('Validations', () => {
    it('should set required error to true when email field is empty', fakeAsync(() => {
      const fixture = TestBed.createComponent(SigninComponent);
      signinComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let emailField = fixture.debugElement.query(By.css('#email')).nativeElement;

      emailField.value = '';
      dispatchEvent(emailField, 'input');

      expect(signinComponent.signinForm.controls['email'].errors['required']).toBeTruthy();
    }));

    it('should set validateEmail error to true when email is invalid', fakeAsync(() => {
      const fixture = TestBed.createComponent(SigninComponent);
      signinComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let emailField = fixture.debugElement.query(By.css('#email')).nativeElement;

      emailField.value = 'test';
      dispatchEvent(emailField, 'input');

      expect(signinComponent.signinForm.controls['email'].errors['validateEmail']).toBeTruthy();
    }));

    it('should set required error to true when password is empty', fakeAsync(() => {
      const fixture = TestBed.createComponent(SigninComponent);
      signinComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let passwordField = fixture.debugElement.query(By.css('#password')).nativeElement;

      passwordField.value = '';
      dispatchEvent(passwordField, 'input');

      expect(signinComponent.signinForm.controls['password'].errors['required']).toBeTruthy();
    }));
  });

  describe('signin()', () => {
    it('should call userService.login() method when form is valid', inject([UserService], fakeAsync((userService) => {
      // create root component with router-outlet
      TestBed.createComponent(MockAppComponent);
      const fixture = TestBed.createComponent(SigninComponent);
      signinComponent = fixture.componentInstance;
      tick();
      fixture.detectChanges();

      let emailField = fixture.debugElement.query(By.css('#email')).nativeElement;
      let passwordField = fixture.debugElement.query(By.css('#password')).nativeElement;

      emailField.value = 'test@test.com';
      dispatchEvent(emailField, 'input');
      passwordField.value = 'password';
      dispatchEvent(passwordField, 'input');
      fixture.detectChanges();
      tick();

      signinComponent.signin();
      expect(userService.login).toHaveBeenCalledWith({
        email: emailField.value,
        password: passwordField.value
      });
    })));

    it('should not call userService.login() method when form is invalid', inject([UserService], fakeAsync((userService) => {
      // create root component with router-outlet
      TestBed.createComponent(MockAppComponent);
      const fixture = TestBed.createComponent(SigninComponent);
      signinComponent = fixture.componentInstance;
      tick();
      fixture.detectChanges();

      let emailField = fixture.debugElement.query(By.css('#email')).nativeElement;
      let passwordField = fixture.debugElement.query(By.css('#password')).nativeElement;

      emailField.value = '';
      dispatchEvent(emailField, 'input');
      passwordField.value = '';
      dispatchEvent(passwordField, 'input');
      fixture.detectChanges();
      tick();

      signinComponent.signin();
      expect(userService.login).not.toHaveBeenCalled();
    })));

    it('should navigate to / when signin was successful', inject([UserService, Location], fakeAsync((userService, location) => {
      // create root component with router-outlet
      TestBed.createComponent(MockAppComponent);
      const fixture = TestBed.createComponent(SigninComponent);
      signinComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let emailField = fixture.debugElement.query(By.css('#email')).nativeElement;
      let passwordField = fixture.debugElement.query(By.css('#password')).nativeElement;

      emailField.value = 'test@test.com';
      dispatchEvent(emailField, 'input');
      passwordField.value = 'password';
      dispatchEvent(passwordField, 'input');
      fixture.detectChanges();
      tick();

      signinComponent.signin();
      expect(userService.login).toHaveBeenCalledWith({
        email: emailField.value,
        password: passwordField.value
      });
      expect(location.path()).toEqual('');
    })));

    it('should show error when signin was failed', inject([UserService], fakeAsync((userService) => {
      userService.login = () => {
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
      const fixture = TestBed.createComponent(SigninComponent);
      signinComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let emailField = fixture.debugElement.query(By.css('#email')).nativeElement;
      let passwordField = fixture.debugElement.query(By.css('#password')).nativeElement;

      emailField.value = 'test@test.com';
      dispatchEvent(emailField, 'input');
      passwordField.value = 'password';
      dispatchEvent(passwordField, 'input');
      fixture.detectChanges();
      tick();

      signinComponent.signin();
      expect(signinComponent.error).toEqual('Error');
    })));
  });
});
