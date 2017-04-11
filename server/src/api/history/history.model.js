'use strict';

mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';

// TODO refactor Schema to make possible to fetch history by portions

var HistorySchema = new Schema({
  userId: Schema.Types.ObjectId,
  actions: [{
    desc: String,
    committed_at: {
      type: Date,
      default: Date.now
    }
  }]
});

export default mongoose.model('History', HistorySchema);
