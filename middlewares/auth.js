const { User } = require('../models');

const isLoggedIn = function (req, res, next) {
  if (!req.session.user) {
    const msg = `harap login`;
    return res.redirect(`/login/?msg=${msg}`);
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (req.session.user.role !== 'admin') {
    const msg = `Not Access`;
    return res.redirect(`/?msg=${msg}`);
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
  isAdmin,
};
