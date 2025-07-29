const { v4: uuidv4 } = require('uuid');

const urlDatabase = {};

const generateShortcode = () => uuidv4().slice(0, 6);

const createShortURL = (url, validity, shortcode) => {
  const code = shortcode || generateShortcode();
  const now = new Date();
  const expiry = new Date(now.getTime() + (validity || 30) * 60000);

  if (urlDatabase[code]) {
    throw new Error("Shortcode already exists");
  }

  urlDatabase[code] = {
    originalUrl: url,
    createdAt: now,
    expiry: expiry,
    clicks: [],
  };

  return { shortcode: code, expiry };
};

const getOriginalURL = (shortcode) => {
  const entry = urlDatabase[shortcode];
  if (!entry) throw new Error("Shortcode not found");

  if (new Date() > entry.expiry) throw new Error("Link expired");

  return entry.originalUrl;
};

const recordClick = (shortcode, req) => {
  const entry = urlDatabase[shortcode];
  if (entry) {
    entry.clicks.push({
      time: new Date(),
      referrer: req.get("Referrer") || "unknown",
      ip: req.ip || req.connection.remoteAddress,
    });
  }
};

const getStats = (shortcode) => {
  const entry = urlDatabase[shortcode];
  if (!entry) throw new Error("Shortcode not found");

  return {
    url: entry.originalUrl,
    createdAt: entry.createdAt,
    expiry: entry.expiry,
    clickCount: entry.clicks.length,
    clicks: entry.clicks,
  };
};

module.exports = { createShortURL, getOriginalURL, recordClick, getStats };