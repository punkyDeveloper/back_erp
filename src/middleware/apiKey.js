function checkApiKey(req, res, next) {
  try {
    // Busca en headers o query
    const apiKey = req.headers["x-api-key"] || req.query["x-api-key"] || req.headers["x-api-key-p"] || req.query["x-api-key-p"];

    const validKeys = [process.env.API_KEY, process.env.API_KEYY];

    if (!validKeys.includes(apiKey)) {
      return res.status(403).json({ message: "Forbidden: Invalid API Key" });
    }

    next();
  } catch (error) {
    console.error('Error en checkApiKey:', error);
    return res.status(500).json({ message: "Error del servidor" });
  }
}

module.exports = checkApiKey;