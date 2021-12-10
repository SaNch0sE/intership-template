const { Router } = require('express');
const BookComponent = require('.');
const { errorHandler } = require('../../error/errorsMiddleware');

/**
 * Express router to mount book related functions on.
 * @type {Express.Router}
 * @const
 */
const router = Router();

/**
 * Route serving list of books.
 * @name /v1/books
 * @function
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get('/', errorHandler(BookComponent.findAll));

/**
 * Route serving a book
 * @name /v1/books/:id
 * @function
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get('/:title', errorHandler(BookComponent.findByTitle));

/**
 * Route serving a new book
 * @name /v1/books
 * @function
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
router.post('/', errorHandler(BookComponent.create));

/**
 * Route serving a new book
 * @name /v1/books
 * @function
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 */
router.put('/', errorHandler(BookComponent.updateByTitle));

/**
 * Route serving a new book
 * @name /v1/books
 * @function
 * @inner
 * @param {string} path -Express path
 * @param {callback} middleware - Express middleware
 */
router.delete('/', errorHandler(BookComponent.deleteById));

module.exports = router;