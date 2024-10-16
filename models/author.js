import mongoose from 'mongoose';
import { format } from 'date-fns';

const Schema = mongoose.Schema;

// Define Author Schema
const AuthorSchema = new Schema({
  first_name: {
    type: String,
    required: true,
    maxLength: 100,
  },
  family_name: {
    type: String,
    required: true,
    maxLength: 100,
  },
  date_of_birth: {
    type: Date,
  },
  date_of_death: {
    type: Date,
  },
});

// Virtual method for author's full name
AuthorSchema.virtual('name').get(function () {
  let fullName = '';
  if (this.first_name && this.family_name) {
    fullName = `${this.family_name}, ${this.first_name}`;
  }
  return fullName;
});

// Format date_of_birth
AuthorSchema.virtual('date_of_birth_formatted').get(function () {
  return this.date_of_birth ? format(this.date_of_birth, 'MM-dd-yyyy') : '';
});

// Format date_of_death
AuthorSchema.virtual('date_of_death_formatted').get(function () {
  return this.date_of_death ? format(this.date_of_death, 'MM-dd-yyyy') : '';
});

// Virtual method for author's url
AuthorSchema.virtual('url').get(function () {
  return `/catalog/author/${this._id}`;
});

// Export model
const Author = mongoose.model('Author', AuthorSchema);
export { Author };
