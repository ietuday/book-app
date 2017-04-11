import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from "./components/home/home.component";
import { SignupComponent } from "./components/user/signup/signup.component";
import { SigninComponent } from "./components/user/signin/signin.component";
import { ProfileComponent } from "./components/user/profile/profile.component";
import { ChangePasswordComponent } from "./components/user/password/change-password/change-password.component";
import { AddBookComponent } from "./components/books/add/add-book.component";
import { BestBooksComponent } from "./components/books/best/best-books.component";
import { BrowseBooksComponent } from "./components/books/browse/browse-books.component";
import { FavouriteBooksComponent } from "./components/books/favourite/favourite-books.component";
import { MustreadBooksComponent } from "./components/books/mustread/mustread-books.component";
import { ReadingBookComponent } from "./components/books/reading/reading-book.component";
import { WishlistBooksComponent } from "./components/books/wishlist/wishlist-books.component";
import { HelpComponent } from "./components/user/help/help.component";
import { HistoryComponent } from "./components/user/history/history.component";
import { AuthGuard } from "./guards/auth.guard";
import { RoleGuard } from "./guards/role.guard";
import { ForgotPasswordComponent } from "./components/user/password/forgot-password/forgot-password.component";
import { ResetPasswordComponent } from "./components/user/password/reset-password/reset-password.component";
import { BookDetailsComponent } from "./components/books/book-details/book-details.component";

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'signin',
    component: SigninComponent
  },
  {
    path: 'signup',
    component: SignupComponent
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'password-change',
    component: ChangePasswordComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'forgot',
    component: ForgotPasswordComponent
  },
  {
    path: 'reset/:token',
    component: ResetPasswordComponent
  },
  {
    path: 'add',
    component: AddBookComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: {
      roles: ['admin']
    }
  },
  {
    path: 'edit/:author/:slug',
    component: AddBookComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: {
      roles: ['admin']
    }
  },
  {
    path: 'best',
    component: BestBooksComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'browse',
    component: BrowseBooksComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'browse/:author/:slug',
    component: BookDetailsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'buy',
    component: BrowseBooksComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'buy/:author/:slug',
    component: BookDetailsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'favourite',
    component: FavouriteBooksComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'mustread',
    component: MustreadBooksComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'reading/:author/:slug',
    component: ReadingBookComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'reading',
    component: ReadingBookComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'wishlist',
    component: WishlistBooksComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'help',
    component: HelpComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'history',
    component: HistoryComponent,
    canActivate: [AuthGuard]
  }
];

export const routing = RouterModule.forRoot(routes);
