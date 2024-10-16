import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// Define Book Schema
const BookSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'Author',
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  isbn: {
    type: String,
    required: true,
  },
  genre: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Genre',
    },
  ],
});

// Define Book URL
BookSchema.virtual('url').get(function () {
  return `/catalog/book/${this._id}`;
});

// Export model
const Book = mongoose.model('Book', BookSchema);
export { Book };
