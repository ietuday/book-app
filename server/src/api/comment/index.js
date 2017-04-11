'use strict';

import {Router} from 'express';
import * as controller from './comment.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.get('/:bookId', auth.isAuthenticated(), controller.getAll);
router.post('/:bookId', auth.isAuthenticated(), controller.save);

module.exports = router;
