const { User } = require('../models');

const isLoggedIn = function (req, res, next) {
  if (!req.session.user) {
    return res.redirect(`/`);
  }
  next();
};

const injectUser = async function (req, res, next) {
  try {
    if (req.session.user) {
      res.locals.user = await User.findByPk(req.session.user.id);
    } else {
      res.locals.user = null;
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  isLoggedIn,
  injectUser,
};
