'use strict';

import {Router} from 'express';
import * as controller from './book.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.get('/', auth.isAuthenticated(), controller.getAll);
router.get('/best_books', auth.isAuthenticated(), controller.getBest);
router.get('/:slug', auth.isAuthenticated(), controller.getBySlug);
router.post('/', auth.hasRole('admin'), controller.create);
router.put('/:slug', auth.hasRole('admin'), controller.update);
router.delete('/:slug', auth.hasRole('admin'), controller.remove);
router.put('/:slug/cover', auth.hasRole('admin'), controller.changeCover);
router.put('/:slug/epub', auth.hasRole('admin'), controller.changeEpub);
router.put('/:id/rate', auth.isAuthenticated(), controller.rate);
router.post('/:id/buy', auth.isAuthenticated(), controller.sendLink);
router.get('/download/:url', auth.isAuthenticated(), controller.download);

module.exports = router;
