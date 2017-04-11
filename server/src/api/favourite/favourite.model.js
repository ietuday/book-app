'use strict';

mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';

var FavouriteSchema = new Schema({
  userId: Schema.Types.ObjectId,
  books: [{
    type: Schema.Types.ObjectId,
    ref: 'Book'
  }]
});

export default mongoose.model('Favourite', FavouriteSchema);
