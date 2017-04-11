'use strict';

import app from '../..';
import Book from './book.model';

let book;
let genBook = function() {
  book = new Book({
    title: 'Example Book',
    author: 'Unknown'
  });
  return book;
};

describe('Book Model', function() {
  before(function() {
    // Clear books before testing
    return Book.remove();
  });

  beforeEach(function() {
    genBook();
  });

  afterEach(function() {
    return Book.remove();
  });

  it('should begin with no books', function() {
    return Book.find({}).exec().should
      .eventually.have.length(0);
  });

  it('should fail when title was not provided', function() {
    book.title = '';
    return book.save().should.be.rejected;
  });

  it('should fail when author was not provided', function() {
    book.author = '';
    return book.save().should.be.rejected;
  });

  describe('Defaults', () => {
    it('should save with total_rating equals 0', function() {
      return book.save()
        .then(() => {
          return Book.find({}).exec();
        })
        .then(book => {
          book[0].total_rating.should.equal(0);
        });
    });

    it('should save with rating equals 0', function() {
      return book.save()
        .then(() => {
          return Book.find({}).exec();
        })
        .then(book => {
          book[0].rating.should.equal(0);
        });
    });

    it('should save with total_rates equals 0', function() {
      return book.save()
        .then(() => {
          return Book.find({}).exec();
        })
        .then(book => {
          book[0].total_rates.should.equal(0);
        });
    });

    it('should save with views equals 0', function() {
      return book.save()
        .then(() => {
          return Book.find({}).exec();
        })
        .then(book => {
          book[0].views.should.equal(0);
        });
    });

    it('should save with price equals 0', function() {
      return book.save()
        .then(() => {
          return Book.find({}).exec();
        })
        .then(book => {
          book[0].price.should.equal(0);
        });
    });

    it('should save with paid equals false', function() {
      return book.save()
        .then(() => {
          return Book.find({}).exec();
        })
        .then(book => {
          book[0].paid.should.equal(false);
        });
    });
  });

  describe('#slug', function() {
    it('should create slug before saving', function() {
      return book.save()
        .then(() => {
          return Book.find({}).exec();
        })
        .then(book => {
          book[0].slug.should.equal('example-book');
        })
    });
  });

  describe('#url', function() {
    it('should create virtual url before saving', function() {
      return book.save()
        .then(() => {
          return Book.find({}).exec();
        })
        .then(book => {
          book[0].toJSON().url.should.equal('unknown/example-book');
        })
    });
  });
});
