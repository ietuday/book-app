'use strict';

import Book from './book.model';
import { loadImage } from '../../components/images';
import { removeImage } from '../../components/images';
import * as _ from 'lodash';
import Promise from 'bluebird';
import url from 'url';
const fs = Promise.promisifyAll(require('fs'));
const normalize = require('path').normalize;

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    return res.status(statusCode).json(err);
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    console.log(err);
    return res.status(statusCode).send(err);
  };
}

/**
 * Gets book's list optionally filtered
 */
export function getAll(req, res) {
  let query = url.parse(req.url, true).query,
    filter = { paid: query.paid === 'true' },
    sortBy;

  if(query.search) {
    filter.$or = [{ title: new RegExp(`^${query.search}`, "i") }, { author: new RegExp(`^${query.search}`, "i") }];
  }

  if(query.sort) {
    sortBy = `-${query.sort}`;
  } else {
    sortBy = 'title';
  }

  return Book.find(filter)
    .sort(sortBy).exec()
    .then(books => {
      res.json(books);
    })
    .catch(handleError(res));
}

/**
 * Gets best by rating books
 */
export function getBest(req, res) {
  return Book.find({ rating: 5 })
    .sort('-added_at')
    .exec()
    .then(books => {
      res.json(books);
    })
    .catch(handleError(res));
}

/**
 * Gets book by slug
 */
export function getBySlug(req, res) {
  return Book.findOneAndUpdate({ slug: req.params.slug }, {$inc: {views:1} }).exec()
    .then(book => {
      res.json(book);
    })
    .catch(handleError(res));
}

/**
 * Creates a new book
 */
export function create(req, res) {
  let newBook = new Book(req.body);

  newBook.save()
    .then(book => {
      res.json(book);
    })
    .catch(validationError(res));
}

/**
 * Updates an existing book
 */
export function update(req, res) {
  return Book.findOne({ slug: req.params.slug }).exec()
    .then(book => {
      _.extend(book, req.body);
      return book.save();
    })
    .then(book => {
      res.json(book);
    })
    .catch(validationError(res));
}

/**
 * Removes an existing book
 */
export function remove(req, res) {
  let coverUrl, epubUrl;

  return Book.findOne({ slug: req.params.slug }).exec()
    .then(book => {
      coverUrl = book.coverUrl;
      epubUrl = book.epubUrl;
      return book.remove();
    })
    .then(() => {
      return removeImage(coverUrl);
    })
    .then(() => {
      return fs.unlinkAsync(normalize(__dirname + '/../../..' + epubUrl));
    })
    .then(() => {
      res.end();
    })
    .catch(validationError(res));
}

/**
 * Updates a book's cover
 */
export function changeCover(req, res) {
  return Book.findOne({ slug: req.params.slug }).exec()
    .then(book => {
      // check if files have valid mimetype
      if(req.files.file.mimetype.indexOf('jpeg') === -1 && req.files.file.mimetype.indexOf('png') === -1) {
        return res.status(400).send({
          message: 'Image should be in JPEG or PNG format'
        });
      }
      // if cover already exists, remove it first
      if(book.coverUrl) {
        return removeImage(book.coverUrl)
          .then(() => {
            return loadImage(req.files.file.path, {
              width: 200,
              height: 275,
              pathTo: '/books/covers'
            })
            .then(imgPath => {
              book.coverUrl = imgPath;
              return book.save();
            })
            .then(book => {
              res.json(book);
            });
          })
          .catch(handleError(res));
      } else {
        return loadImage(req.files.file.path, {
          width: 200,
          height: 275,
          pathTo: '/books/covers'
        })
        .then(imgPath => {
          book.coverUrl = imgPath;
          return book.save();
        })
        .then(book => {
          res.json(book);
        })
        .catch(handleError(res));
      }
    })
    .catch(handleError(res));
}

/**
 * Updates a book's epub
 */
export function changeEpub(req, res) {
  let epubUrl;

  return Book.findOne({ slug: req.params.slug }).exec()
    .then(book => {
      // check if files have valid mimetype
      if(req.files.file.mimetype.indexOf('epub') === -1) {
        return res.status(400).send({
          message: 'Image should be in EPUB format'
        });
      }

      // if there is epub file, remove it first
      if(book.epubUrl) {
        return fs.unlinkAsync(normalize(__dirname + '/../../..' + book.epubUrl))
        .then(() => {
          const index = req.files.file.path.indexOf('uploads');
          const tmpPath = req.files.file.path.slice(index + 7);
          const epubPath = normalize(__dirname + '/../../../fs/books/epubs' + tmpPath);
          epubUrl = '/fs/books/epubs' + tmpPath;
          return fs.renameAsync(req.files.file.path, epubPath);
        })
        .then(() => {
          book.epubUrl = epubUrl;
          return book.save();
        })
        .then(book => {
          res.json(book);
        })
        .catch(handleError(res));
      } else {
        const index = req.files.file.path.indexOf('uploads');
        const tmpPath = req.files.file.path.slice(index + 7);
        const epubPath = normalize(__dirname + '/../../../fs/books/epubs' + tmpPath);
        epubUrl = '/fs/books/epubs' + tmpPath;
        return fs.renameAsync(req.files.file.path, epubPath)
        .then(() => {
          book.epubUrl = epubUrl;
          return book.save();
        })
        .then(book => {
          res.json(book);
        })
        .catch(handleError(res));
      }
    })
    .catch(handleError(res));
}

/**
 * Updates rating to book
 */
export function rate(req, res) {
  return Book.findById(req.params.id).exec()
    .then(book => {
      const total_rates = book.total_rates + 1;
      const total_rating = book.total_rating + req.body.rating;
      const rating = Math.ceil(total_rating / total_rates);
      book.total_rates = total_rates;
      book.total_rating = total_rating;
      book.rating = rating;
      return book.save();
    })
    .then(() => {
      res.end();
    })
    .catch(handleError(res));
}

// check credit card and send link for downloading
export function sendLink(req, res) {
  // checking credit card number req.body.card
  // if(req.body.card) isValid, start downloading
  return Book.findById(req.params.id).exec()
    .then(book => {
      if(!book) {
        return res.status(404).json({ message: 'Book Not Found!' });
      }
      res.json({ url: book.epubUrl });
    })
    .catch(handleError);
}

// downloads file
export function download(req, res) {
  let file = normalize(__dirname + '../../../../' + req.params.url);
  res.download(file);
}
