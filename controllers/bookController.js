import { Book } from "../models/book.js";
import { Author } from "../models/author.js";
import { Genre } from "../models/genre.js";
import { BookInstance } from "../models/bookinstance.js";
import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";

// Display list of all books.
const book_list = asyncHandler(async (req, res, next) => {
  //res.send('NOT IMPLEMENTED: Book list');
  const allBooks = await Book.find({}).populate("author").exec();
  //   console.log(allBooks);
  res.render("book_list", { title: "Book List", book_list: allBooks });
});

// Display detail page for a specific book.
const book_detail = asyncHandler(async (req, res, next) => {
  //   res.send(`NOT IMPLEMENTED: Book detail: ${req.params.id}`);
  const [book, bookInstances] = await Promise.all([
    Book.findById(req.params.id).populate("author").populate("genre").exec(),
    BookInstance.find({ book: req.params.id }).exec(),
  ]);
  // console.log(book);
  return res.render("book_detail", {
    book: book,
    book_instances: bookInstances,
  });
});

// Display book create form on GET.
const book_create_get = asyncHandler(async (req, res, next) => {
  //   res.send('NOT IMPLEMENTED: Book create GET');
  const [authors, genres] = await Promise.all([
    Author.find({}).sort({ name: 1 }).exec(),
    Genre.find({}).sort({ name: 1 }).exec(),
  ]);
  res.render("book_form", {
    title: "Create Book",
    authors: authors,
    genres: genres,
  });
});

// Handle book create on POST.
const book_create_post = [
  //   res.send('NOT IMPLEMENTED: Book create POST');

  // Convert the genre to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },

  // Validate and sanitize data
  body("title", "Title must not be empty")
    .trim()
    .isLength({ min: 10 })
    .escape(),
  body("author", "Author must not be empty")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Author should have a minimum of 5 characters")
    .escape(),
  body("summary", "Summary must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "Summary must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("genre.*").escape(), // Use .* to escale all values in array

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const [authors, genres] = await Promise.all([
      Author.find({}).sort({ name: 1 }).exec(),
      Genre.find({}).sort({ name: 1 }).exec(),
    ]);

    // Create the book object, so it can be sent back to the template to re-populate with existing fields
    // Or save it as is if there are errors on the template
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
    });

    if (!errors.isEmpty()) {
      /*
        By default, the selected genres look like this when using JSON.stringify(genres)
        [
            {"_id":"6700b36b2f04b6967de56ba2","name":"Fantasy","__v":0},
            {"_id":"670533a5196ed10217a2ce25","name":"Fiction","__v":0},
            {"_id":"6700b36b2f04b6967de56ba4","name":"French Poetry","__v":0},
            {"_id":"6705a692163c085fea2aa4db","name":"Historical Fiction","__v":0},
            {"_id":"6700b36b2f04b6967de56ba3","name":"Science Fiction","__v":0},
            {"_id":"6705a742867b9a4f983d2ba6","name":"Young Adult","__v":0}
        ]

        When this is returned back to the UI, the UI isn't able to map the objectId's back with the selected elements. 
        Therefore, loop through all the genres that we got from the model, and we add a checked=true property if that genre is available in book.genre (obtained from form)
        [
            {"_id":"6700b36b2f04b6967de56ba2","name":"Fantasy","__v":0},
            {"_id":"670533a5196ed10217a2ce25","name":"Fiction","__v":0,"checked":"true"},
            {"_id":"6700b36b2f04b6967de56ba4","name":"French Poetry","__v":0},
            {"_id":"6705a692163c085fea2aa4db","name":"Historical Fiction","__v":0,"checked":"true"},
            {"_id":"6700b36b2f04b6967de56ba3","name":"Science Fiction","__v":0},
            {"_id":"6705a742867b9a4f983d2ba6","name":"Young Adult","__v":0}
        ]
        PS: The console.log(genres) or JSON.stringify(genres) does not print the checked:true. You have to manually print genres[1].checked to validate
      */

      // Loop through model genres and add the checked property
      for (const genre of genres) {
        if (book.genre.includes(genre._id)) {
          genre.checked = "true";
        }
      }
      // Errors exist, send it back to the form
      res.render("book_form", {
        title: "Create Book",
        authors: authors,
        genres: genres,
        book: book,
        errors: errors.array(),
      });
    } else {
      // No errors, process the form data
      await book.save();
      console.log("Save the book in database");
      res.redirect(book.url);
    }
  }),
];

// Display book delete form on GET.
const book_delete_get = asyncHandler(async (req, res, next) => {
  //   res.send('NOT IMPLEMENTED: Book delete GET');
  const [book, bookInstances] = await Promise.all([
    Book.findById(req.params.id).exec(),
    BookInstance.find({ book: req.params.id }).exec(),
  ]);
  if (book === null) {
    const err = new Error("Book not found");
    err.status = 404;
    return next(err);
  }
  res.render("book_delete", {
    title: "Delete Book",
    book: book,
    book_instances: bookInstances,
  });
});

// Handle book delete on POST.
const book_delete_post = asyncHandler(async (req, res, next) => {
  //   res.send('NOT IMPLEMENTED: Book delete POST');
  const book = await Book.findById(req.params.id).exec();
  if (book === null) {
    const err = new Error("Book not found");
    err.status = 404;
    return next(err);
  } else {
    await book.deleteOne().exec();
    console.log(`Deleted book ${book.title} from database`);
    res.redirect("/catalog/books");
  }
});

// Display book update form on GET.
const book_update_get = asyncHandler(async (req, res, next) => {
  //   res.send('NOT IMPLEMENTED: Book update GET');
  const [book, allAuthors, allGenres] = await Promise.all([
    Book.findById(req.params.id).exec(),
    Author.find({}).sort({ name: 1 }).exec(),
    Genre.find({}).sort({ name: 1 }).exec(),
  ]);
  for (const genre of allGenres) {
    if (book.genre.includes(genre._id)) genre.checked = "true";
  }
  res.render("book_form", {
    title: "Update Book",
    book: book,
    authors: allAuthors,
    genres: allGenres,
  });
});

// Handle book update on POST.
const book_update_post = [
  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: typeof req.body.genre === "undefined" ? [] : req.body.genre,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });
    if (!errors.isEmpty()) {
      const [allAuthors, allGenres] = await Promise.all([
        Author.find({}).sort({ name: 1 }).exec(),
        Genre.find({}).sort({ name: 1 }).exec(),
      ]);
      for (const genre of genres) {
        if (req.params.genre.includes(genre._id)) genre.checked = "true";
      }
      res.render("book_form", {
        title: "Update book",
        authors: allAuthors,
        genres: allGenres,
        book: book,
        errors: errors.array(),
      });
    } else {
      //   res.send('NOT IMPLEMENTED: Book update POST');
      const updatedBook = await Book.findByIdAndUpdate(req.params.id, book, {});
      res.redirect(updatedBook.url);
    }
  }),
];

export {
  book_list,
  book_detail,
  book_create_get,
  book_create_post,
  book_delete_get,
  book_delete_post,
  book_update_get,
  book_update_post,
};
