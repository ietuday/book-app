/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';
import cors from 'cors';

export default function(app) {
  app.use(cors());
  // Insert routes below
  app.use('/api/users', require('./api/user'));
  app.use('/api/books', require('./api/book'));
  app.use('/api/comments', require('./api/comment'));
  app.use('/api/wishlist', require('./api/wishlist'));
  app.use('/api/favourite', require('./api/favourite'));
  app.use('/api/mustread', require('./api/mustread'));
  app.use('/api/history', require('./api/history'));

  app.use('/auth', require('./auth').default);

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(`${app.get('appPath')}/index.html`));
    });
}
