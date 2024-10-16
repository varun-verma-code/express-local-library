import { Genre } from '../models/genre.js';
import { Book } from '../models/book.js';
import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';

// Display list of all Genre.
const genre_list = asyncHandler(async (req, res, next) => {
  //   res.send('NOT IMPLEMENTED: Genre list');
  const allGenres = await Genre.find({}).sort({ name: 1 }).exec();
  return res.render('genre_list', {
    title: 'Genre List',
    genre_list: allGenres,
  });
});

// Display detail page for a specific Genre.
const genre_detail = asyncHandler(async (req, res, next) => {
  //   res.send(`NOT IMPLEMENTED: Genre detail: ${req.params.id}`);

  //   const genreBooks = await Book.find({ genre: req.params.id }).exec();
  //   const genre = await Genre.findOne({ _id: req.params.id }).exec();

  /* The above code could be replaced by Promise.all() */
  const [genreBooks, genre] = await Promise.all([
    Book.find({ genre: req.params.id }).exec(),
    Genre.findById(req.params.id).exec(),
  ]);
  res.render('genre_detail', { genre: genre, genre_books: genreBooks });
});

// Display Genre create form on GET.
const genre_create_get = asyncHandler(async (req, res, next) => {
  //   res.send('NOT IMPLEMENTED: Genre create GET');
  res.render('genre_form', { title: 'Create Genre' });
});

// Handle Genre create on POST.
const genre_create_post = [
  // Validate and sanitize the name field.
  // When you use req.body.name within the asyncHandler, it will contain the sanitized data so you don't have to trim or escape again
  body('name', 'Genre name must contain at least 3 characters')
    .trim()
    .isLength({ min: 3 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.
    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render('genre_form', {
        title: 'Create Genre',
        genre: genre,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      const genreExists = await Genre.findOne({ name: req.body.name })
        .collation({ locale: 'en', strength: 2 }) // Ensures case insensitive search
        .exec();
      console.log(genreExists);
      if (genreExists) {
        // Genre exists, redirect to its detail page.
        res.redirect(genreExists.url);
      } else {
        await genre.save();
        // New genre saved. Redirect to genre detail page.
        res.redirect(genre.url);
      }
    }
  }),
];

// Display Genre delete form on GET.
const genre_delete_get = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Genre delete GET');
});

// Handle Genre delete on POST.
const genre_delete_post = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Genre delete POST');
});

// Display Genre update form on GET.
const genre_update_get = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Genre update GET');
});

// Handle Genre update on POST.
const genre_update_post = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Genre update POST');
});

export {
  genre_list,
  genre_detail,
  genre_create_get,
  genre_create_post,
  genre_delete_get,
  genre_delete_post,
  genre_update_get,
  genre_update_post,
};
