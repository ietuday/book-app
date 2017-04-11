'use strict';

import {Router} from 'express';
import * as controller from './history.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.get('/', auth.isAuthenticated(), controller.getAll);
router.post('/', auth.isAuthenticated(), controller.save);

module.exports = router;
