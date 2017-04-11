'use strict';

mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';

var WishlistSchema = new Schema({
  userId: Schema.Types.ObjectId,
  books: [{
    type: Schema.Types.ObjectId,
    ref: 'Book'
  }]
});

export default mongoose.model('Wishlist', WishlistSchema);
