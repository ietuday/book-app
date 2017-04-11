This repo has two branches. On the branch angular_1 we can find the application which is made on MEAN.JS. Database - MongoDB, ODM - mongoose.js. The system of authorization and authentication is implemented using passport.js with division of roles for administration and general use applications. Access to the application is open only to registered users. Registration does not require a verification e-mail. To test the application, simply register.

The application uses EPUB.JS - Reader for parsing and display the contents of epub-file. Table of content is presented, as well as search, bookmarks are supported.

Books are stored in a separate folder. When you add a new book, there appears a new directory with a name that matches the name of the book in which the cover and epub-file are placed. On the back-end the uploading is made with module multer.js, and on the front-end - angular module ng-file-upload. Implemented accounting of the books views, as well as the rating system.

Front-end part is made on Bootstrap, Angular.js. As the router there is used ui-router, to implement RESTful API - ngResource

On the branch master we can find the same app with following differences: front end part is written on Angular 2 and backend part was slightly improved(ES6, Gulp as task manager, added unit tests, etc).

To see it in action, please visit http://denlysenko.github.io/bookapp/
