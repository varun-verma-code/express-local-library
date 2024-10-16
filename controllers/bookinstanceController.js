import { BookInstance } from '../models/bookinstance.js';
import { Book } from '../models/book.js';
import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';

// Display list of all BookInstances.
const bookinstance_list = asyncHandler(async (req, res, next) => {
  //   res.send('NOT IMPLEMENTED: BookInstance list');
  const allBookInstances = await BookInstance.find({}).populate('book').exec();
  //   console.log(allBookInstances);
  res.render('bookinstance_list', {
    title: 'Book Instance List',
    bookinstance_list: allBookInstances,
  });
});

// Display detail page for a specific BookInstance.
const bookinstance_detail = asyncHandler(async (req, res, next) => {
  //   res.send(`NOT IMPLEMENTED: BookInstance detail: ${req.params.id}`);
  const bookInstance = await BookInstance.findById(req.params.id)
    .populate('book')
    .exec();
  res.render('bookinstance_detail', { bookinstance: bookInstance });
});

// Display BookInstance create form on GET.
const bookinstance_create_get = asyncHandler(async (req, res, next) => {
  //   res.send('NOT IMPLEMENTED: BookInstance create GET');
  const allBooks = await Book.find({}).sort({ title: 1 }).exec();
  res.render('bookinstance_form', {
    title: 'Create Book Instance (copy)',
    book_list: allBooks,
  });
});

// Handle BookInstance create on POST.
const bookinstance_create_post = [
  body('book', 'Book must be specified')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Book cannot be empty')
    .escape(),
  body('imprint', 'Imprint must be specified')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Book cannot be empty')
    .escape(),
  body('status', 'Status must be specified')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Status cannot be empty')
    .escape(),
  body('due_back', 'Invalid date')
    .optional({ values: 'falsy' })
    .isISO8601()
    .toDate(),

  asyncHandler(async (req, res, next) => {
    //   res.send('NOT IMPLEMENTED: BookInstance create POST');
    const errors = validationResult(req);

    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      due_back: req.body.due_back,
      status: req.body.status,
    });

    const book_list = await Book.find({}).sort({ title: 1 }).exec();

    if (!errors.isEmpty) {
      // Send validation error back to template
      res.render('bookinstance_template', {
        title: 'Create Book Instance (copy)',
        book_list: allBooks,
        bookinstance: bookInstance,
        selected_book: bookInstance.book,
        errors: errors.array(),
      });
    } else {
      // Save bookinstance information in database
      await bookInstance.save();
      res.redirect(bookInstance.url);
    }
  }),
];

// Display BookInstance delete form on GET.
const bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  //   res.send('NOT IMPLEMENTED: BookInstance delete GET');
  const bookInstance = await BookInstance.findById(req.params.id)
    .populate('book')
    .exec();
  if (bookInstance === null) {
    const err = new Error('Book Instance not found');
    err.status = 404;
    return next(err);
  }
  res.render('bookinstance_delete', {
    title: 'Delete Book Instance',
    book_instance: bookInstance,
  });
});

// Handle BookInstance delete on POST.
const bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  //   res.send('NOT IMPLEMENTED: BookInstance delete POST');
  const bookInstance = await BookInstance.findById(req.params.id).exec();
  if (bookInstance === null) {
    const err = new Error('Book Instance not found');
    err.status = 404;
    return next(err);
  }
  await bookInstance.deleteOne().exec();
  console.log(`Deleted book instance ${bookInstance._id} from database`);
  res.redirect(`/catalog/book/${bookInstance.book._id}`);
});

// Display BookInstance update form on GET.
const bookinstance_update_get = asyncHandler(async (req, res, next) => {
  //   res.send('NOT IMPLEMENTED: BookInstance update GET');
  let selected_book;
  const [allBooks, bookInstance] = await Promise.all([
    Book.find({}).sort({ title: 1 }).exec(),
    BookInstance.findById(req.params.id).populate('book').exec(),
  ]);
  for (const book of allBooks) {
    if (book._id.toString() === bookInstance.book._id.toString())
      selected_book = book._id;
  }
  res.render('bookinstance_form', {
    title: 'Update Book Instance',
    book_list: allBooks,
    selected_book: selected_book,
    bookinstance: bookInstance,
  });
});

// Handle bookinstance update on POST.
const bookinstance_update_post = [
  body('book', 'Book must be specified')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Book cannot be empty')
    .escape(),
  body('imprint', 'Imprint must be specified')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Book cannot be empty')
    .escape(),
  body('status', 'Status must be specified')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Status cannot be empty')
    .escape(),
  body('due_back', 'Invalid date')
    .optional({ values: 'falsy' })
    .isISO8601()
    .toDate(),

  asyncHandler(async (req, res, next) => {
    //   res.send('NOT IMPLEMENTED: BookInstance update POST');
    const errors = validationResult(req);
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });
    if (!errors.isEmpty()) {
      // Errors exist. Handle errors and return to form.
    } else {
      // Update data
      const updatedBookInstance = await BookInstance.findByIdAndUpdate(
        req.params.id,
        bookInstance,
        {}
      );
      console.log(`Book instance ${req.params.id} updated in database`);
      res.redirect(updatedBookInstance.url);
    }
  }),
];

export {
  bookinstance_list,
  bookinstance_detail,
  bookinstance_create_get,
  bookinstance_create_post,
  bookinstance_delete_get,
  bookinstance_delete_post,
  bookinstance_update_get,
  bookinstance_update_post,
};
