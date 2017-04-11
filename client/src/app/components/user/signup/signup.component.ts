import { Component, OnInit, style, state, animate, transition, trigger } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { UserService } from "../../../services/user.service";
import { Router } from "@angular/router";
import { ValidatorHelper } from "../../../helpers/validator.helper";
import { User } from "../../../models/User";
import * as ErrorHandler from '../../../helpers/errorHandler';

@Component({
  templateUrl: './signup.component.html',
  host: {
    '[@routeAnimation]': 'true'
  },
  styles: [':host { position: absolute; width: 100%; height: 100%; }'],
  animations: [
    trigger('routeAnimation', [
      state('*', style({transform: 'translateX(0)', opacity: 1})),
      transition('void => *', [
        style({transform: 'translateX(-100%)', opacity: 0}),
        animate('0.5s cubic-bezier(0.215, 0.610, 0.355, 1.000)')
      ]),
      transition('* => void',
        animate('0.5s cubic-bezier(0.215, 0.610, 0.355, 1.000)', style({
          transform: 'translateX(100%)',
          opacity: 0
        }))
      )
    ])
  ]
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  error: string;
  isSubmitting: boolean = false;
  private avatar: File;
  avatarUrl: string;

  constructor(
    private _fb: FormBuilder,
    private _userService: UserService,
    private _router: Router
  ) {}

  onFileChange(event) {
    if(event.target.files[0]) {
      this.avatar = event.target.files[0];
      this.readURL(this.avatar);
    }
  }

  private readURL(file) {
    let reader = new FileReader();
    reader.onload = (e: any) => {
      this.avatarUrl = e.target.result;
    };

    reader.readAsDataURL(file);
  }

  signup() {
    if(this.signupForm.valid) {
      this.isSubmitting = true;
      let user = new User(this.signupForm.value);
      return this._userService.create(user, this.avatar)
        .finally(() => {
          this.isSubmitting = false;
        })
        .subscribe(
          () => {
            this._router.navigate(['']);
          },
          err => {
            this.error = ErrorHandler.handleError(err.json());
            console.log(err);
          }
        );
    }
  }

  ngOnInit() {
    this.signupForm = this._fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.compose([
        Validators.required,
        ValidatorHelper.isEmail
      ])],
      password: ['', Validators.required]
    });
  }
}
