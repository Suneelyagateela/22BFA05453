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

module.exports = logger;