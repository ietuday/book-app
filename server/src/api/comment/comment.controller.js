'use strict';

import Comment from './comment.model';
import User from '../user/user.model';

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    console.log(err);
    return res.status(statusCode).send(err);
  };
}

/**
 * gets all comments for book
 */
export function getAll(req, res) {
  return Comment.findOne({ bookId: req.params.bookId })
    .populate({
      path: 'messages.author',
      select: 'displayName',
      model: User
    })
    .exec()
    .then(comment => {
      res.json(comment);
    })
    .catch(handleError(res));
}

/**
 * Saves new comment from book
 */
export function save(req, res) {
  return Comment.findOne({ bookId: req.params.bookId }).exec()
    .then(comment => {
      if(comment) {
        comment.messages.push({
          author: req.user._id,
          created_at: Date.now(),
          text: req.body.comment
        });

        return comment.save();
      } else {
        let newComment = new Comment({
          bookId: req.params.bookId,
          messages: [{
            author: req.user._id,
            text: req.body.comment
          }]
        });

        return newComment.save();
      }
    })
    .then(comment => {
      return comment.populate({
        path: 'messages.author',
        select: 'displayName',
        model: User
      }).execPopulate();
    })
    .then(comment => {
      res.json(comment);
    })
    .catch(handleError(res));
}
