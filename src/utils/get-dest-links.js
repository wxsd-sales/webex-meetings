const axios = require("axios");
const getAccessToken = require("./get-access-token.js");
async function getDestLinks() {
  const access_token = await getAccessToken();
  console.log("access_token in getDestLinks", access_token);
  const currentDateTime = new Date().toISOString();
  const currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + 1);
  const futureDateTime = currentDate.toISOString();
  const payload = {
    title: "Webex Meeting",
    start: currentDateTime,
    end: futureDateTime,
  };
  console.log("start time", currentDateTime);
  console.log("end time", futureDateTime);

  return axios
    .post(`https://webexapis.com/v1/meetings`, payload, {
      //create a meeting
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    })
    .then(async (r) => {
      console.log("resp", r.data.id);
      const linkdata = {
        meetingId: r.data.id,
        createJoinLinkAsWebLink: true,
        createStartLinkAsWebLink: true,
        joinDirectly: false,
      };

      return axios
        .post(`https://webexapis.com/v1/meetings/join`, linkdata, {
          //create join and start links
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
        })
        .then((linkr) => {
          console.log("link data", linkr.data);
          const joinLink = linkr.data.joinLink;
          const startLink = linkr.data.startLink;
          const details = {
            access_token,
            joinLink,
            startLink,
          };
          return details;
        })
        .catch((err) => {
          console.log("err", err);
        });
    })
    .catch((err) => {
      console.log("err", err);
    });
}
module.exports = getDestLinks;
