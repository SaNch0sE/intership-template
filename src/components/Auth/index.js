const http = require('http');
const AuthService = require('./service');
const UserService = require('../User/service');
const UserValidation = require('../User/validation');
const AuthValidation = require('./validation');
const ValidationError = require('../../error/ValidationError');
const config = require('../../config');
const AuthError = require('../../error/AuthError');

/**
 * @function
 * @name signUp
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {Promise < void >}
 */
async function signUp(req, res) {
    const { error } = UserValidation.create(req.body);

    if (error) {
        throw new ValidationError(error.details);
    }

    await UserService.create(req.body);

    return res.status(200).json({
        data: {
            status: 200,
        },
    });
}

/**
 * @function
 * @name signIn
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {Promise < void >}
 */
async function signIn(req, res) {
    const { error } = AuthValidation.signIn(req.body);

    if (error) {
        throw new ValidationError(error.details);
    }

    const tokens = await AuthService.signIn(req.body);
    const profile = { email: req.body.email, token: tokens.refreshToken };
    await AuthService.saveToken(profile);

    res.cookie('accessToken', tokens.accessToken, { maxAge: config.accessAge });
    res.cookie('refreshToken', tokens.refreshToken, { maxAge: config.refreshAge });
    return res.status(200).json({
        data: tokens,
    });
}

/**
 * @function
 * @name rereshToken
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {Promise < void >}
 */
async function refreshToken(req, res) {
    const user = AuthValidation.checkToken(req.cookies.refreshToken);
    const compared = await AuthService.compareTokens(user.email, req.cookies.refreshToken);
    if (compared) {
        const newTokens = AuthService.genTokens(user);

        await AuthService.updateToken({
            email: user.email,
            token: newTokens.refreshToken,
        });

        res.cookie('accessToken', newTokens.accessToken, { maxAge: config.accessAge });
        res.cookie('refreshToken', newTokens.refreshToken, { maxAge: config.refreshAge });
        return res.status(200).json({
            data: newTokens,
        });
    }
    throw new AuthError(http.STATUS_CODES[401]);
}

/**
 * @function
 * @name payload
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {Promise < void >}
 */
async function payload(req, res) {
    const user = AuthValidation.checkToken(req.cookies.accessToken);

    return res.status(200).json({
        data: user,
    });
}

/**
 * @function
 * @name logout
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {Promise < void >}
 */
async function logout(req, res) {
    AuthValidation.checkToken(req.cookies.accessToken);
    await AuthService.removeToken(req.cookies.refreshToken);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.status(200).json({
        data: {
            status: 200,
        },
    });
}

module.exports = {
    signUp,
    signIn,
    payload,
    logout,
    refreshToken,
};