import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// Define GenreSchema
const GenreSchema = new Schema({
  name: {
    type: String,
    required: true,
    min: 3,
    max: 100,
  },
});

// Define url for GenreSchema
GenreSchema.virtual('url').get(function () {
  return `/catalog/genre/${this._id}`;
});

// Export the model
const Genre = mongoose.model('Genre', GenreSchema);
export { Genre };
