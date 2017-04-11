'use strict';

import Wishlist from './wishlist.model';

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    console.log(err);
    return res.status(statusCode).send(err);
  };
}

/**
 * get wishlist by user
 */
export function get(req, res) {
  return Wishlist.findOne({ userId: req.user._id })
    .populate('books')
    .exec()
    .then(wishlist => {
      res.json(wishlist);
    })
    .catch(handleError(res));
}

/**
 * adds book to wishlist
 */
export function add(req, res) {
  const bookId = req.body.bookId;
  if(!bookId) {
   return res.status(400).json({ message: 'Book Not Provided' });
  }

  return Wishlist.findOne({ userId: req.user._id }).exec()
    .then(wishlist => {
      if(wishlist) {
        if(wishlist.books.indexOf(bookId) > -1) {
          return res.status(400).json({ message: 'Book is already in Wishlist' });
        }
        wishlist.books.push(bookId);
        return wishlist.save();
      } else {
        let newWishlist = new Wishlist({
          userId: req.user._id,
          books: [bookId]
        });

        return newWishlist.save();
      }
    })
    .then(() => {
      res.end();
    })
    .catch(handleError(res));
}

/**
 * removes book from wishlist
 */
export function remove(req, res) {
  const userId = req.user._id,
    bookId = req.params.id;
  return Wishlist.findOne({ userId: userId }).exec()
    .then(wishlist => {
      const index = wishlist.books.indexOf(bookId);

      if(index === -1) {
        return res.status(400).json({ message: 'Book Not Found in Your Wishlist' });
      }

      wishlist.books.splice(index, 1);
      return wishlist.save();
    })
    .then(() => {
      res.end();
    })
    .catch(handleError(res));
}
