'use strict';

import Mustread from './mustread.model';

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    console.log(err);
    return res.status(statusCode).send(err);
  };
}

/**
 * get mustreads by user
 */
export function get(req, res) {
  return Mustread.findOne({ userId: req.user._id })
    .populate('books')
    .exec()
    .then(mustread => {
      res.json(mustread);
    })
    .catch(handleError(res));
}

/**
 * adds book to mustreads
 */
export function add(req, res) {
  const bookId = req.body.bookId;
  if(!bookId) {
    return res.status(400).json({ message: 'Book Not Provided' });
  }

  return Mustread.findOne({ userId: req.user._id }).exec()
    .then(mustread => {
      if(mustread) {
        if(mustread.books.indexOf(bookId) > -1) {
          return res.status(400).json({ message: 'Book is already in Must Read Titles' });
        }

        mustread.books.push(bookId);
        return mustread.save();
      } else {
        let newMustread = new Mustread({
          userId: req.user._id,
          books: [bookId]
        });
        return newMustread.save();
      }
    })
    .then(() => {
      res.end();
    })
    .catch(handleError(res));
}

/**
 * removes book from mustreads
 */
export function remove(req, res) {
  const userId = req.user._id,
    bookId = req.params.id;
  return Mustread.findOne({ userId: userId }).exec()
    .then(mustread => {
      const index = mustread.books.indexOf(bookId);

      if(index === -1) {
        return res.status(400).json({ message: 'Book Not Found in Your Must Read List' });
      }

      mustread.books.splice(index, 1);
      return mustread.save();
    })
    .then(() => {
      res.end();
    })
    .catch(handleError(res));
}
