import mongoose from 'mongoose';
import { format } from 'date-fns';

const Schema = mongoose.Schema;

// Define BookInstance Schema
const BookInstanceSchema = new Schema({
  book: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  imprint: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'],
    default: 'Maintenance',
  },
  due_back: {
    type: Date,
    default: Date.now,
  },
});

// Define url for BookInstance
BookInstanceSchema.virtual('url').get(function () {
  return `/catalog/bookinstance/${this._id}`;
});

// Format dates
BookInstanceSchema.virtual('due_back_formatted').get(function () {
  return format(this.due_back, 'MM-dd-yyyy');
});

// Format dates for pug template
BookInstanceSchema.virtual('due_back_yyyy_mm_dd').get(function () {
  return format(this.due_back, 'yyyy-MM-dd');
});

// Export model
const BookInstance = mongoose.model('BookInstance', BookInstanceSchema);
export { BookInstance };
