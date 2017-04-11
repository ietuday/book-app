'use strict';

import History from './history.model';

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    console.log(err);
    return res.status(statusCode).send(err);
  };
}

/**
 * Gets all actions by user, optionally limited
 */
export function getAll(req, res) {
  return History.findOne({ userId: req.user._id })
    .exec()
    .then(history => {
      res.json(history);
    })
    .catch(handleError(res));
}

/**
 * Creates new history if not exists or add new action if exists
 */
export function save(req, res) {
  const userId = req.user._id;
  return History.findOne({ userId: userId })
    .exec()
    .then(history => {
      if(history) {
        history.actions.push({ desc: req.body.desc });
        return history.save();
      } else {
        let newHistory = new History({
          userId: userId,
          actions: [{ desc: req.body.desc }]
        });
        return newHistory.save();
      }
    })
    .then(history => {
      res.json(history);
    })
    .catch(handleError(res));
}
