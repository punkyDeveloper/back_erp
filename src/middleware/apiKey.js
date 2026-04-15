function checkApiKey(req, res, next) {
  try {
    // La API key SOLO se acepta en el header — nunca en query params,
    // ya que los query params quedan en logs de servidor, proxies e historial del navegador.
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      return res.status(403).json({ message: "Forbidden: API Key requerida" });
    }

    const validKeys = [process.env.API_KEY, process.env.API_KEYY].filter(Boolean);

    if (!validKeys.includes(apiKey)) {
      return res.status(403).json({ message: "Forbidden: API Key inválida" });
    }

    next();
  } catch (error) {
    console.error('Error en checkApiKey:', error);
    return res.status(500).json({ message: "Error del servidor" });
  }
}

module.exports = checkApiKey;