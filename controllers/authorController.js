import { Author } from '../models/author.js';
import { Book } from '../models/book.js';
import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';

// Display list of all Authors.
const author_list = asyncHandler(async (req, res, next) => {
  //   res.send('NOT IMPLEMENTED: Author list');
  const allAuthors = await Author.find({}).sort({ family_name: 1 }).exec();
  res.render('author_list', { title: 'Author List', author_list: allAuthors });
});

// Display detail page for a specific Author.
const author_detail = asyncHandler(async (req, res, next) => {
  //   res.send(`NOT IMPLEMENTED: Author detail: ${req.params.id}`);
  const [authorDetails, authorBooks] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }).exec(),
  ]);
  res.render('author_detail', {
    author: authorDetails,
    author_books: authorBooks,
  });
});

// Display Author create form on GET.
const author_create_get = asyncHandler(async (req, res, next) => {
  //   res.send('NOT IMPLEMENTED: Author create GET');
  res.render('author_form', { title: 'Create Author' });
});

// Handle Author create on POST.
const author_create_post = [
  // Validate and sanitize fields
  body('first_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('First name is required')
    .isAlpha()
    .withMessage('First name can only have alphabets'),
  body('family_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Family name is required')
    .isAlpha()
    .withMessage('Family name can only have alphabets'),
  body('date_of_birth', 'Invalid date of birth')
    .optional({ values: 'falsy' })
    .isISO8601()
    .toDate()
    .withMessage('Enter valid date of birth'),
  body('date_of_death', 'Invalid date of death')
    .optional({ values: 'falsy' })
    .isISO8601()
    .toDate()
    .withMessage('Enter valid date of death'),

  // Process request after validation and sanitization
  asyncHandler(async (req, res, next) => {
    // res.send('NOT IMPLEMENTED: Author create POST');
    const errors = validationResult(req);
    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
    });
    if (!errors.isEmpty()) {
      console.log('Errors not empty', errors);

      // Redirect to form with error messages
      res.render('author_form', {
        title: 'Create Author',
        author: author,
        errors: errors.array(),
      });
      return;
    } else {
      // Check if author already exists in database
      const authorExists = await Author.findOne({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
      })
        .collation({ locale: 'en', strength: 2 }) // Ensures case insensitive search
        .exec();
      if (authorExists) {
        console.log(`Author already exists in db, ${authorExists.id}`);
        res.redirect(authorExists.url);
      } else {
        // Save author in database
        await author.save();
        console.log(`New author saved in db, ${author.id}`);
        // Redirect to author detail page
        res.redirect(author.url);
      }
    }
  }),
];

// Display Author delete form on GET.
const author_delete_get = asyncHandler(async (req, res, next) => {
  //   res.send('NOT IMPLEMENTED: Author delete GET');
  const [author, author_books] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }).exec(),
  ]);
  res.render('author_delete', {
    title: 'Delete Author',
    author: author,
    author_books: author_books,
  });
});

// Handle Author delete on POST.
const author_delete_post = asyncHandler(async (req, res, next) => {
  //   res.send('NOT IMPLEMENTED: Author delete POST');
  const author = await Author.findById(req.params.id).exec();
  await author.deleteOne().exec();
  console.log(`Deleted author ${author.name} from database`);
  res.redirect('/catalog/authors');
});

// Display Author update form on GET.
const author_update_get = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Author update GET');
});

// Handle Author update on POST.
const author_update_post = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Author update POST');
});

export {
  author_list,
  author_detail,
  author_create_get,
  author_create_post,
  author_delete_get,
  author_delete_post,
  author_update_get,
  author_update_post,
};
