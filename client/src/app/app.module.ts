import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './components/app/app.component';
import { HeaderComponent } from "./components/header/header.component";
import { FooterComponent } from "./components/footer/footer.component";
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { HomeComponent } from "./components/home/home.component";
import { routing } from "./app.routing";
import { AUTH_PROVIDERS } from "angular2-jwt";
import { FileUploadService } from "./services/fileUpload.service";
import { UserService } from "./services/user.service";
import { SigninComponent } from "./components/user/signin/signin.component";
import { SignupComponent } from "./components/user/signup/signup.component";
import { AlertComponent } from "./components/alert/alert.component";
import { DropdownModule, RatingModule } from "ng2-bootstrap";
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
import { SpinnerComponent } from "./components/spinner/spinner.component";
import { ForgotPasswordComponent } from "./components/user/password/forgot-password/forgot-password.component";
import { ResetPasswordComponent } from "./components/user/password/reset-password/reset-password.component";
import { BookService } from "./services/book.service";
import { BookListComponent } from "./components/books/book-list/book-list.component";
import { BookDetailsComponent } from "./components/books/book-details/book-details.component";
import { CommentsComponent} from "./components/books/comments/comments.component";
import { MustreadService } from "./services/mustread.service";
import { FavouriteService } from "./services/favourite.service";
import { WishlistService } from "./services/wishlist.service";
import { HistoryService } from "./services/history.service";
import { ChatService } from "./services/chat.service";
import { ToastModule } from 'ng2-toastr/ng2-toastr';
import { APP_CONFIG, AppConfig } from "./app.config";

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    HomeComponent,
    SigninComponent,
    SignupComponent,
    AlertComponent,
    ProfileComponent,
    ChangePasswordComponent,
    AddBookComponent,
    BestBooksComponent,
    BrowseBooksComponent,
    FavouriteBooksComponent,
    MustreadBooksComponent,
    ReadingBookComponent,
    WishlistBooksComponent,
    HelpComponent,
    HistoryComponent,
    SpinnerComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    BookListComponent,
    BookDetailsComponent,
    CommentsComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpModule,
    DropdownModule,
    RatingModule,
    ToastModule,
    routing
  ],
  providers: [
    {
      provide: APP_CONFIG,
      useValue: AppConfig
    },
    AUTH_PROVIDERS,
    FileUploadService,
    UserService,
    BookService,
    MustreadService,
    FavouriteService,
    WishlistService,
    HistoryService,
    ChatService,
    AuthGuard,
    RoleGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
