import express from 'express';
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  //res.render('index', { title: 'Express' });
  res.redirect('/catalog'); // Redirect root (/) to /catalog site, so that localhost:3000/ will redirect to localhost:3000/catalog
});

export { router };
