const dbConnect = require('../db/connect');

module.exports = async (req, res, next) => {
  try {
    await dbConnect();
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};