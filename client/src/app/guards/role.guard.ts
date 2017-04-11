import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot } from "@angular/router";
import { UserService } from "../services/user.service";
import { User } from "../models/User";

@Injectable()
export class RoleGuard implements CanActivate {
  user: User;

  constructor(private _userService: UserService, private _router: Router) {
    this._userService.currentUser
      .subscribe(user => {
        this.user = user;
      })
  }

  canActivate(route: ActivatedRouteSnapshot) {
    if(this.user) {
      const requiredRoles = route.data['roles'],
        userRoles = this.user.roles;

      if(!userRoles.some((role) => {
        return requiredRoles.includes(role);
      })) {
        this._router.navigate(['']);
        return false;
      }
      return true;
    } else {
      this._router.navigate(['']);
      return false;
    }
  }
}
