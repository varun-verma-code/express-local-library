/*
import asyncHandler from 'express-async-handler';

const index = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Site Home Page');
});

export { index };
*/

import { Genre } from '../models/genre.js';
import { Book } from '../models/book.js';
import { BookInstance } from '../models/bookinstance.js';
import { Author } from '../models/author.js';
import asyncHandler from 'express-async-handler';

/*
This controller is responsible to render the home page for the Local Website
The home page will display name of all Genres, Books, Authors
*/
const index = asyncHandler(async (req, res, next) => {
  // Get details of books, book instances, authors and genre counts (in parallel)
  const [
    numBooks,
    numBookInstances,
    numAvailableBookInstances,
    numAuthors,
    numGenres,
  ] = await Promise.all([
    Book.countDocuments({}).exec(),
    BookInstance.countDocuments({}).exec(),
    BookInstance.countDocuments({ status: 'Available' }).exec(),
    Author.countDocuments({}).exec(),
    Genre.countDocuments({}).exec(),
  ]);

  res.render('index', {
    title: 'Local Library Home',
    book_count: numBooks,
    book_instance_count: numBookInstances,
    book_instance_available_count: numAvailableBookInstances,
    author_count: numAuthors,
    genre_count: numGenres,
  });
});

export { index };
