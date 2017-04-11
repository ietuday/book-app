'use strict';
/*eslint no-invalid-this:0*/
import slugify from '../../components/slugify';
mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';

var BookSchema = new Schema({
  title: {
    type: String,
    required: 'Title is required',
    trim: true
  },
  author: {
    type: String,
    required: 'Author is required',
    trim: true
  },
  coverUrl: {
    type: String,
    default: ''
  },
  epubUrl: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  slug: {
    type: String
  },
  total_rating: {
    type: Number,
    default: 0
  },
  total_rates: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  added_at: {
    type: Date,
    default: Date.now
  },
  views: {
    type: Number,
    default: 0
  },
  paid: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    default: 0
  }
});

// makes slug for book before saving
BookSchema.pre('save', function(next) {
  this.slug = slugify(this.title);
  next();
});

BookSchema.virtual('url').get(function() {
  return slugify(this.author) + '/' + this.slug;
});

// to access virtual property from Angular
BookSchema.set('toJSON', {virtuals: true});

export default mongoose.model('Book', BookSchema);
