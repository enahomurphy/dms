import _ from 'underscore';
import db from '../db/models';
import Response from '../utils/ApiResponse';
import Query from '../utils/Query';
import Helpers from '../utils/Helpers';

const User = db.User;

/**
 * @class
 */
class UserController {


  /**
  * Create User
  * @description creates a user when POST /users
  * endpoint is called with valid details
  * @param  {Object} req - request object
  * @param  {Object} res - response object
  * @return {Object} res
  */
  static create(req, res) {
    const body = _.omit(req.body, 'role');
    User.create(body)
      .then(user => Response.created(res, user.toPublicJson()))
      .catch(error => Response
         .badRequest(res, Helpers.errorHandler(error.errors)));
  }

  /**
  * Gets all user
  * @description gets all user when GET /users
  * endpoint is called. returned data can be further
  * streamlined by passing query params.
  * @param  {Object} req - request object
  * @param  {Object} res - response object
  * @return {Object} res
  */
  static getAll(req, res) {
    const query = Query.userQuery(req);
    User.findAndCountAll(query)
    .then((users) => {
      users = Helpers.pagination(users, query);
      Response.success(res, users);
    })
    .catch(err => Response.serverError(res, err.message));
  }

 /**
  * Get a single document
  * @description gets a single user when GET /users/:id
  * endpoint is called.
  * @param  {Object} req - request object
  * @param  {Object} res - response object
  * @return {Object} res
  */
  static get(req, res) {
    const user = req.user.cursor;
    Response.success(res, user.toPublicJson());
  }

  /**
  * Updates a single document
  * @description gets a single user when GET /users/:id
  * endpoint is called.
  * @param  {Object} req - request object
  * @param  {Object} res - response object
  * @return {Object} res
  */
  static update(req, res) {
    const body = _.pick(req.body, ['firstname', 'lastname',
      'email', 'password', 'username']);
    if (req.user.role === 'admin' && req.user.cursor.id !== 1) {
      body.role = req.body.role || req.user.cursor.role;
    }
    req.user.cursor.update(body)
      .then(user => Response.success(res, {
        message: 'User updated',
        user: user.toPublicJson()
      }))
      .catch(error => Response
        .badRequest(res, (error.message)));
  }

  /**
  * Updates a single document
  * @description gets a single user when GET /users/:id
  * endpoint is called.
  * @param  {Object} req - request object
  * @param  {Object} res - response object
  * @return {Object} response object
  */
  static delete(req, res) {
    req.user.cursor.destroy()
      .then(() => Response.respond(res, { message: 'User deleted' }))
      .catch(error => Response.badRequest(res, { message: error.message }));
  }

  /**
  * Gets all user
  * @param  {Object} req - request object
  * @param  {Object} res - response object
  * @return {Object} res
  */
  static getUserDocuments(req, res) {
    const query = Query.docQuery(req);
    req.user.cursor.getDocuments(query)
      .then((data) => {
        Response.success(res, data);
      })
    .catch(err => Response.server(res, err.message));
  }
}

export default UserController;
