'use strict';

const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
const {
  checkIfTokenSent,
  checkIfTokenValid,
} = require('../util/token-functions');

const {
  OK,
  BAD_REQUEST,
  UNAUTHORIZED,
  FORBIDDEN,
} = require('../../util/constants').STATUS_CODES;

const ROWS_PER_PAGE = 20;

// Search for all members using either first name, last name or email
router.post('/shortcutsearchusers', async function(req, res) {
  if (!checkIfTokenSent(req)) {
    return res.sendStatus(FORBIDDEN);
  } else if (!checkIfTokenValid(req)) {
    return res.sendStatus(UNAUTHORIZED);
  }
  let maybeOr = {};
  if (req.body.query) {
    const parts = req.body.query.trim().split(/\s+/);
    if (parts.length >= 2) {
      maybeOr = {
        $and: [
          { firstName: new RegExp(`^${parts[0]}`, 'i') },
          { lastName: new RegExp(`^${parts.slice(1).join(' ')}`, 'i') }
        ]
      };
    } else {
      maybeOr = {
        $or: ['firstName', 'lastName', 'email'].map((fieldName) => ({
          [fieldName]: {
            $regex: RegExp(req.body.query, 'i'),
          }
        }))
      };
    }
  }

  const sortColumn = req.query.sort || 'joinDate';

  const orderToInteger = {
    desc: -1,
    asc: 1,
    default: -1
  };
  const sortOrder = orderToInteger[req.query.order] || orderToInteger.default;

  // make sure that the page we want to see is 0 by default
  // and avoid negative page numbers
  let skip = Math.max(Number(req.body.page) || 0, 0);
  skip *= ROWS_PER_PAGE;
  const total = await User.count(maybeOr);
  User.find(maybeOr, { password: 0, }, { skip, limit: ROWS_PER_PAGE, })
    .sort({ [sortColumn] : sortOrder })
    .then(items => {
      res.status(OK).send({ items, total, rowsPerPage: ROWS_PER_PAGE, });
    })
    .catch((e) => {
      res.sendStatus(BAD_REQUEST);
    });
});

module.exports = router;
