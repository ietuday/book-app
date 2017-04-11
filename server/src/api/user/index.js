'use strict';

import {Router} from 'express';
import * as controller from './user.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.put('/:id/avatar', auth.isAuthenticated(), controller.changeAvatar);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.post('/', controller.create);
router.post('/forgot', controller.forgot);
router.post('/reset/:token', controller.reset);

module.exports = router;
