import { TestBed, fakeAsync, tick, inject } from "@angular/core/testing";
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
import { SignupComponent } from "./signup.component";
import { User } from "../../../models/User";

describe('Signup Component', () => {
  let signupComponent: SignupComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        SignupComponent,
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
            create: jasmine.createSpy('create').and.callFake(() => {
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
    const fixture = TestBed.createComponent(SignupComponent);
    signupComponent = fixture.componentInstance;
    fixture.detectChanges();

    expect(signupComponent).toBeDefined();
  });

  it('should initialize signupForm with empty fields', fakeAsync(() => {
    const fixture = TestBed.createComponent(SignupComponent);
    signupComponent = fixture.componentInstance;
    tick();
    fixture.detectChanges();
    expect(signupComponent.signupForm).toBeDefined();
    expect(signupComponent.signupForm.controls['firstName'].value).toBe('');
    expect(signupComponent.signupForm.controls['lastName'].value).toBe('');
    expect(signupComponent.signupForm.controls['email'].value).toBe('');
    expect(signupComponent.signupForm.controls['password'].value).toBe('');
  }));

  describe('Validations', () => {
    it('should set required error to true when firstName field is empty', fakeAsync(() => {
      const fixture = TestBed.createComponent(SignupComponent);
      signupComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let firstNameField = fixture.debugElement.query(By.css('#firstName')).nativeElement;

      firstNameField.value = '';
      dispatchEvent(firstNameField, 'input');

      expect(signupComponent.signupForm.controls['firstName'].errors['required']).toBeTruthy();
    }));

    it('should set required error to true when lastName field is empty', fakeAsync(() => {
      const fixture = TestBed.createComponent(SignupComponent);
      signupComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let lastNameField = fixture.debugElement.query(By.css('#lastName')).nativeElement;

      lastNameField.value = '';
      dispatchEvent(lastNameField, 'input');

      expect(signupComponent.signupForm.controls['lastName'].errors['required']).toBeTruthy();
    }));

    it('should set required error to true when email field is empty', fakeAsync(() => {
      const fixture = TestBed.createComponent(SignupComponent);
      signupComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let emailField = fixture.debugElement.query(By.css('#email')).nativeElement;

      emailField.value = '';
      dispatchEvent(emailField, 'input');

      expect(signupComponent.signupForm.controls['email'].errors['required']).toBeTruthy();
    }));

    it('should set validateEmail error to true when email is invalid', fakeAsync(() => {
      const fixture = TestBed.createComponent(SignupComponent);
      signupComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let emailField = fixture.debugElement.query(By.css('#email')).nativeElement;

      emailField.value = 'test';
      dispatchEvent(emailField, 'input');

      expect(signupComponent.signupForm.controls['email'].errors['validateEmail']).toBeTruthy();
    }));

    it('should set required error to true when password is empty', fakeAsync(() => {
      const fixture = TestBed.createComponent(SignupComponent);
      signupComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let passwordField = fixture.debugElement.query(By.css('#password')).nativeElement;

      passwordField.value = '';
      dispatchEvent(passwordField, 'input');

      expect(signupComponent.signupForm.controls['password'].errors['required']).toBeTruthy();
    }));
  });

  describe('signup()', () => {
    it('should call userService.create() method when form is valid', inject([UserService], fakeAsync((userService) => {
      // create root component with router-outlet
      TestBed.createComponent(MockAppComponent);
      const fixture = TestBed.createComponent(SignupComponent);
      signupComponent = fixture.componentInstance;
      tick();
      fixture.detectChanges();

      let firstNameField = fixture.debugElement.query(By.css('#firstName')).nativeElement;
      let lastNameField = fixture.debugElement.query(By.css('#lastName')).nativeElement;
      let emailField = fixture.debugElement.query(By.css('#email')).nativeElement;
      let passwordField = fixture.debugElement.query(By.css('#password')).nativeElement;

      firstNameField.value = 'test';
      dispatchEvent(firstNameField, 'input');
      lastNameField.value = 'user';
      dispatchEvent(lastNameField, 'input');
      emailField.value = 'test@test.com';
      dispatchEvent(emailField, 'input');
      passwordField.value = 'password';
      dispatchEvent(passwordField, 'input');
      fixture.detectChanges();
      tick();

      const user = new User({
        firstName: firstNameField.value,
        lastName: lastNameField.value,
        email: emailField.value,
        password: passwordField.value
      });

      signupComponent.signup();
      expect(userService.create).toHaveBeenCalledWith(user, undefined);
    })));

    it('should not call userService.create() method when form is invalid', inject([UserService], fakeAsync((userService) => {
      // create root component with router-outlet
      TestBed.createComponent(MockAppComponent);
      const fixture = TestBed.createComponent(SignupComponent);
      signupComponent = fixture.componentInstance;
      tick();
      fixture.detectChanges();

      let firstNameField = fixture.debugElement.query(By.css('#firstName')).nativeElement;
      let lastNameField = fixture.debugElement.query(By.css('#lastName')).nativeElement;
      let emailField = fixture.debugElement.query(By.css('#email')).nativeElement;
      let passwordField = fixture.debugElement.query(By.css('#password')).nativeElement;

      firstNameField.value = '';
      dispatchEvent(firstNameField, 'input');
      lastNameField.value = '';
      dispatchEvent(lastNameField, 'input');
      emailField.value = '';
      dispatchEvent(emailField, 'input');
      passwordField.value = '';
      dispatchEvent(passwordField, 'input');
      fixture.detectChanges();
      tick();

      signupComponent.signup();
      expect(userService.create).not.toHaveBeenCalled();
    })));

    it('should navigate to / when signin was successful', inject([UserService, Location], fakeAsync((userService, location) => {
      // create root component with router-outlet
      TestBed.createComponent(MockAppComponent);
      const fixture = TestBed.createComponent(SignupComponent);
      signupComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let firstNameField = fixture.debugElement.query(By.css('#firstName')).nativeElement;
      let lastNameField = fixture.debugElement.query(By.css('#lastName')).nativeElement;
      let emailField = fixture.debugElement.query(By.css('#email')).nativeElement;
      let passwordField = fixture.debugElement.query(By.css('#password')).nativeElement;

      firstNameField.value = 'test';
      dispatchEvent(firstNameField, 'input');
      lastNameField.value = 'user';
      dispatchEvent(lastNameField, 'input');
      emailField.value = 'test@test.com';
      dispatchEvent(emailField, 'input');
      passwordField.value = 'password';
      dispatchEvent(passwordField, 'input');
      fixture.detectChanges();
      tick();

      const user = new User({
        firstName: firstNameField.value,
        lastName: lastNameField.value,
        email: emailField.value,
        password: passwordField.value
      });

      signupComponent.signup();
      expect(userService.create).toHaveBeenCalledWith(user, undefined);
      expect(location.path()).toEqual('');
    })));

    it('should show error when signin was failed', inject([UserService], fakeAsync((userService) => {
      userService.create = () => {
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
      const fixture = TestBed.createComponent(SignupComponent);
      signupComponent = fixture.componentInstance;

      tick();
      fixture.detectChanges();

      let firstNameField = fixture.debugElement.query(By.css('#firstName')).nativeElement;
      let lastNameField = fixture.debugElement.query(By.css('#lastName')).nativeElement;
      let emailField = fixture.debugElement.query(By.css('#email')).nativeElement;
      let passwordField = fixture.debugElement.query(By.css('#password')).nativeElement;

      firstNameField.value = 'test';
      dispatchEvent(firstNameField, 'input');
      lastNameField.value = 'user';
      dispatchEvent(lastNameField, 'input');
      emailField.value = 'test@test.com';
      dispatchEvent(emailField, 'input');
      passwordField.value = 'password';
      dispatchEvent(passwordField, 'input');
      fixture.detectChanges();
      tick();

      signupComponent.signup();
      expect(signupComponent.error).toEqual('Error');
    })));
  });

  // this test is passing, but got an error because avatar is private property
  // describe('onFileChange', () => {
  //   it('should set passed argument to component property', fakeAsync(() => {
  //     const fixture = TestBed.createComponent(SignupComponent);
  //     signupComponent = fixture.componentInstance;
  //
  //     tick();
  //     fixture.detectChanges();
  //
  //     signupComponent.onFileChange({ target: {files: ['avatar']} });
  //     expect(signupComponent.avatar).toEqual('avatar');
  //   }));
  // });
});
