import jwt from 'jsonwebtoken';
import moment from 'moment';
import Crypto from 'crypto';
import dotenv from 'dotenv';
import Response from '../utils/ApiResponse';
import db from '../db/models';


dotenv.config();

const User = db.User;
const secret = process.env.SECRET_KEY;

/**
 * @class
 */
export default class AuthController {

 /**
  * Login user
  * @description Log's in user with valid details
  * and generates a jwt token for further authentication
  * @param  {Object} req - request object
  * @param  {Object} res - response object
  * @returns {Object}  response to be sent to client
  */
  static login(req, res) {
    const body = req.body;
    const message = 'Authentication failed! invalid username or password';
    if (!body.username && !body.password) {
      return Response.badRequest(res,
        'Authentication failed! username and password required');
    }
    User.findOne({
      where: { username: body.username }
    }).then((user) => {
      if (!user || !user.isPassword(body.password)) {
        return Response.badRequest(res, message);
      }
      const token = jwt.sign({
        sub: user.id,
        role: user.role,
        exp: moment().add(2, secret).valueOf(),
      }, secret);

      user = user.toPublicJson();
      user.token = token;
      db.Token.create({
        token,
      }).then(() => Response.success(res, user, 'login successful'))
        .catch(err => Response.serverError(res, err.errors));
    });
  }

/**
  * Logout
  * @description Logs user out from the api
  * by blocking continues use of jwt
  * @param  {Object} req - request object
  * @param  {Object} res - response object
  * @returns {Object}  response to be sent to client
  */
  static logout(req, res) {
    const token = req.token;
    db.Token.findOne({
      where: {
        token_hash: Crypto.createHash('md5').update(token).digest('hex')
      }
    }).then((tokenHash) => {
      tokenHash.destroy()
        .then(() => Response.success(res, 'You have been logged out'))
        .catch(err => Response.serverError(res, err.message));
    });
  }
}
