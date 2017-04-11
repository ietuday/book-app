'use strict';

mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';

var CommentSchema = new Schema({
  bookId: Schema.Types.ObjectId,
  messages: [{
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    created_at: {
      type: Date,
      default: Date.now
    },
    text: String
  }]
});

export default mongoose.model('Comment', CommentSchema);
