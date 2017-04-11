'use strict';

import Favourite from './favourite.model';

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    console.log(err);
    return res.status(statusCode).send(err);
  };
}

/**
 * get favourites by user
 */
export function get(req, res) {
  return Favourite.findOne({ userId: req.user._id })
    .populate('books')
    .exec()
    .then(favourite => {
      res.json(favourite);
    })
    .catch(handleError(res));
}

/**
 * adds book to favourites
 */
export function add(req, res) {
  const bookId = req.body.bookId;
  if(!bookId) {
    return res.status(400).json({ message: 'Book Not Provided' });
  }

  return Favourite.findOne({ userId: req.user._id }).exec()
    .then(favourite => {
      if(favourite) {
        if(favourite.books.indexOf(bookId) > -1) {
          return res.status(400).json({ message: 'Book is already in Favourites' });
        }

        favourite.books.push(bookId);
        return favourite.save();
      } else {
        let newFavourite = new Favourite({
          userId: req.user._id,
          books: [bookId]
        });
        return newFavourite.save();
      }
    })
    .then(() => {
      res.end();
    })
    .catch(handleError(res));
}

/**
 * removes book from favourites
 */
export function remove(req, res) {
  const userId = req.user._id,
    bookId = req.params.id;
  return Favourite.findOne({ userId: userId }).exec()
    .then(favourite => {
      const index = favourite.books.indexOf(bookId);

      if(index === -1) {
        return res.status(400).json({ message: 'Book Not Found in Your Favourite List' });
      }

      favourite.books.splice(index, 1);
      return favourite.save();
    })
    .then(() => {
      res.end();
    })
    .catch(handleError(res));
}
