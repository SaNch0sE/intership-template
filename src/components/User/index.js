const http = require('http');
const UserService = require('./service');
const UserValidation = require('./validation');
const AuthValidation = require('../Auth/validation');
const ValidationError = require('../../error/ValidationError');
const AuthError = require('../../error/AuthError');

/**
 * @function
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {Promise < void >}
 */
async function findAll(req, res) {
    const users = await UserService.findAll();

    AuthValidation.checkToken(req.cookies.accessToken);
    res.status(200).json({
        data: users,
    });
}

/**
 * @function
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {Promise < void >}
 */
async function findById(req, res) {
    const { error } = UserValidation.checkId(req.params);

    if (error) {
        throw new ValidationError(error.details);
    }

    AuthValidation.checkToken(req.cookies.accessToken);
    const user = await UserService.findById(req.params.id);

    return res.status(200).json({
        data: user,
    });
}

/**
 * @function
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {Promise < void >}
 */
async function create(req, res) {
    const { error } = UserValidation.create(req.body);

    if (error) {
        throw new ValidationError(error.details);
    }

    const payload = AuthValidation.checkToken(req.cookies.accessToken);
    if (payload.role === 'Admin') {
        const user = await UserService.create(req.body);

        return res.status(200).json({
            data: user,
        });
    }
    throw new AuthError(http.STATUS_CODES[403], 403);
}

/**
 * @function
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {Promise<void>}
 */
async function updateById(req, res) {
    const { error } = UserValidation.updateById(req.body);

    if (error) {
        throw new ValidationError(error.details);
    }

    const user = AuthValidation.checkToken(req.cookies.accessToken);
    if (user.role === 'Admin') {
        const updatedUser = await UserService.updateById(req.body.id, req.body);

        return res.status(200).json({
            data: updatedUser,
        });
    }
    throw new AuthError(http.STATUS_CODES[403], 403);
}

/**
 * @function
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {Promise<void>}
 */
async function deleteById(req, res) {
    const { error } = UserValidation.checkId(req.body);

    if (error) {
        throw new ValidationError(error.details);
    }

    const user = AuthValidation.checkToken(req.cookies.accessToken);
    if (user.role === 'Admin') {
        const deletedUser = await UserService.deleteById(req.body.id);

        return res.status(200).json({
            data: deletedUser,
        });
    }
    throw new AuthError(http.STATUS_CODES[403], 403);
}

module.exports = {
    findAll,
    findById,
    create,
    updateById,
    deleteById,
};