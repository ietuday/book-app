'use strict';

import {Router} from 'express';
import * as controller from './wishlist.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.get('/', auth.isAuthenticated(), controller.get);
router.post('/', auth.isAuthenticated(), controller.add);
router.delete('/:id', auth.isAuthenticated(), controller.remove);

module.exports = router;
