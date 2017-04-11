'use strict';

import User from './user.model';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';
import { loadImage } from '../../components/images';
import { removeImage } from '../../components/images';
import * as _ from 'lodash';
import Promise from 'bluebird';
const crypto = Promise.promisifyAll(require('crypto'));

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    return res.status(statusCode).json(err);
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    console.log(err);
    return res.status(statusCode).send(err);
  };
}

/**
 * Creates a new user
 */
export function create(req, res) {
  let newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.displayName = `${newUser.firstName} ${newUser.lastName}`;
  newUser.save()
    .then(user => {
      const token = jwt.sign({ _id: user._id }, config.secrets.session, {
        expiresIn: 60 * 60 * 5
      });
      res.json({ token });
    })
    .catch(validationError(res));
}

/**
 * Updates an existing user
 */
export function update(req, res) {
  const userId = req.user._id;
  return User.findById(userId, '-salt -password').exec()
    .then(user => {
      _.extend(user, req.body);
      user.displayName = `${user.firstName} ${user.lastName}`;
      return user.save();
    })
    .then(user => {
      res.json(user);
    })
    .catch(validationError(res));
}

/**
 * Change a users password
 */
export function changePassword(req, res) {
  const userId = req.user._id;
  const oldPass = String(req.body.oldPassword);
  const newPass = String(req.body.newPassword);

  return User.findById(userId).exec()
    .then(user => {
      if(user.authenticate(oldPass)) {
        user.password = newPass;
        return user.save()
          .then(() => {
            res.status(200).end();
          })
          .catch(validationError(res));
      } else {
        return res.status(403).json({ message: 'Current password is incorrect!' });
      }
    });
}

/**
 * Change a user's avatar
 */
export function changeAvatar(req, res) {
  const userId = req.user._id;

  return User.findById(userId).exec()
    .then(user => {
      // if there is avatar
      if(req.files.file) {
        // check if files have valid mimetype
        if(req.files.file.mimetype.indexOf('jpeg') === -1 && req.files.file.mimetype.indexOf('png') === -1) {
          return res.status(400).send({
            message: 'Image should be in JPEG or PNG format'
          });
        }

        if(user.avatarUrl.indexOf('default-avatar') > -1) {
          return loadImage(req.files.file.path, {
            width: 30,
            height: 30,
            pathTo: '/avatars'
          })
            .then(imgPath => {
              user.avatarUrl = imgPath;
              return user.save();
            })
            .then(function(user) {
              res.end(user.avatarUrl);
            })
            .catch(handleError(res));
        } else {
          return removeImage(user.avatarUrl)
            .then(() => {
              return loadImage(req.files.file.path, {
                width: 30,
                height: 30,
                pathTo: '/avatars'
              })
                .then(imgPath => {
                  user.avatarUrl = imgPath;
                  return user.save();
                })
                .then(function(user) {
                  res.end(user.avatarUrl);
                });
            })
            .catch(handleError(res));
        }
      } else {
        res.status(400).send({
          message: 'No File Provided'
        });
      }
    })
    .catch(handleError(res));
}

/**
 * Forgot password: check if email is exist
 */
export function forgot(req, res) {
  let token;
  return User.findOne({ email: req.body.email }).exec()
    .then(user => {
      if(!user) {
        return res.status(401).json({ message: 'Email not found!' });
      } else {
        return crypto.randomBytesAsync(20)
          .then(buffer => {
            token = buffer.toString('hex');
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
            return user.save();
          })
          .then(() => {
            res.json({ token: token });
          })
          .catch(handleError(res));
      }
    })
    .catch(handleError(res));
}

/**
 * Reset old password, save new password
 */
export function reset(req, res) {
  return User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }}).exec()
    .then(user => {
      if(!user) {
        return res.status(401).json({ message: 'Token not found!' });
      } else {
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        return user.save()
          .then(user => {
            const token = jwt.sign({ _id: user._id }, config.secrets.session, {
              expiresIn: 60 * 60 * 5
            });
            res.json({ token });
          });
      }
    })
    .catch(handleError(res));
}

/**
 * Get my info
 */
export function me(req, res, next) {
  var userId = req.user._id;

  return User.findOne({ _id: userId }, '-salt -password').exec()
    .then(user => { // don't ever give out the password or salt
      if(!user) {
        return res.status(401).end();
      }
      res.json(user);
    })
    .catch(err => next(err));
}

/**
 * Authentication callback
 */
export function authCallback(req, res) {
  res.redirect('/');
}
