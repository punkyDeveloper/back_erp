function checkApiKey(req, res, next) {
  // Busca en headers o query
  const apiKey = req.headers["x-api-key"] || req.query["x-api-key"] || req.headers["x-api-key-p"] || req.query["x-api-key-p"];

  if (apiKey !== process.env.API_KEY || apiKey !== process.env.API_KEYY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }

  next();
}

module.exports = checkApiKey;

