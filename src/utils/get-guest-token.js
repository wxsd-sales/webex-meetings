const axios = require("axios");

function getGuestToken(body, access_token) {
  axios
    .post(`https://webexapis.com/v1/guests/token`, body, {
      //create join and start links
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    })
    .then(async (r) => {
      //   console.log("resp", r.data);
      return r.data.accessToken;
    })
    .catch((error) => {
      console.log("get guest token error", error);
    });
}

module.exports = getGuestToken;
