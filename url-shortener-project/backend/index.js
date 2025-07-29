const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
// const logger = require("./loggerMiddleware");

const axios = require('axios');

const logger = {
  clientID: '0a903632-13ab-464c-b45d-05037bc8b21a',
  clientSecret: 'dXMeyHyUZErtgfXR',
  authToken: null,
  async getToken() {
    try {
      const res = await axios.post('http://20.244.56.144/evaluation-service/auth', {
        email: "suneelyagateela@gmail.com",
  name: "Yagateela Suneel",
  githubUsername: "Suneelyagateela",
  rollNo: "22bfao5453",
  accessCode:"PrjyQF",

        clientID: this.clientID,
        clientSecret: this.clientSecret
      });
      console.log(res);
      this.authToken = res.data.access_token;
    } catch (err) {
        console.log(err);
      console.log("Auth failed");
    }
  },

  async log(where, what, details) {
    if (!this.authToken) await this.getToken();
    
    try {
      await axios.post('http://20.244.56.144/evaluation-service/logs', {
        stack: where,
        level: "info",
        package: "app",
        message: `${what} - ${details}`,
        timestamp: new Date().toISOString()
      }, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
    } catch (err) {
      console.log("Log failed");
    }
  }
};

const {
  createShortURL,
  getOriginalURL,
  recordClick,
  getStats
} = require('./urlStore');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(logger);

// Create Short URL
app.post('/shorturls', (req, res) => {
  try {
    const { url, validity, shortcode } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    const { shortcode: sc, expiry } = createShortURL(url, validity, shortcode);

    res.status(201).json({
      shortlink: `http://localhost:${PORT}/${sc}`,
      expiry: expiry.toISOString()
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Redirect to original URL
app.get('/:shortcode', (req, res) => {
  try {
    const { shortcode } = req.params;
    const originalUrl = getOriginalURL(shortcode);
    recordClick(shortcode, req);
    res.redirect(originalUrl);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// Get Short URL stats
app.get('/shorturls/:shortcode', (req, res) => {
  try {
    const { shortcode } = req.params;
    const stats = getStats(shortcode);
    res.status(200).json(stats);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});