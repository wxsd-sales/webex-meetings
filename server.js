const express = require("express");
const path = require("path");
const cors = require("cors");
const https = require("https");
const fs = require("fs");
const { createServer } = require("node:http");
const cron = require("node-cron");
require("dotenv").config();
cron.schedule("0 0 */13 * *", () => {
  console.log("Generating new access token");
  getAccessToken();
});

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const app = express();
// const http = require("http").createServer(app);
// const io = require("socket.io")(http);
const server = createServer(app);
const { Server } = require("socket.io");
const getDestLinks = require("./src/utils/get-dest-links.js");
const getAccessToken = require("./src/utils/get-access-token.js");
const io = new Server(server, {
  cors: {
    origin: "https://socketeer.glitch.me/",
    methods: ["GET", "POST"],
  },
});
const port = process.env.PORT || 3000;
// const options = {
//   key: fs.readFileSync("10.16.44.227.key"),
//   cert: fs.readFileSync("10.16.44.227.pem"),
//   passphrase: "qwertyuiop@123",
// };

app.use(express.static(path.join(__dirname, "dist")));
app.use(express.json());

app.use(cors());

app.post("/task-routing", async (req, res) => {
  console.log(req.body);
  const details = await getDestLinks();
  var clientMeetingLink =
    "?access_token=" +
    details.access_token +
    "&destination=" +
    details.joinLink +
    "&site=client";
  var hostMeetingLink =
    "?access_token=" +
    details.access_token +
    "&destination=" +
    details.startLink +
    "&site=agent";
  console.log("meeting link", hostMeetingLink);
  const { name, guid, language } = req.body;
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/xml");
  myHeaders.append("Cookie", "JSESSIONID=7430280F23446A3C75D2533EEA6AFF2B");
  // const destLinks = await getDestLinks();
  const raw = `<Task>
   <name>NewTaskName</name>
   <title>NewTaskTitle</title>
   <description>NewTaskdescription</description>
   <scriptSelector>video_registration</scriptSelector>
   <requeueOnRecovery>true</requeueOnRecovery>
   <!-- Indicates if the contact will be re-queued/discarded on 
   SM failure recovery-->
   <tags>
      <tag>video_registration</tag>
   </tags>
   <variables>
    <variable> 
      <name>cv_1</name> 
      <value>${guid}</value> 
    </variable>
    <variable> 
      <name>cv_2</name> 
      <value>${name}</value> 
    </variable>
    <variable> 
      <name>cv_3</name> 
      <value>${language}</value> 
    </variable>
 <variable>
         <name>user_user_user_videoDestination</name>
         <value>${details.startLink}</value>
      </variable>
      <variable>
         <name>user_user_user_videoToken</name>
         <value>${details.access_token}</value>
      </variable> 
   </variables>
</Task>`;

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    // redirect: "follow"
  };
  // res.send(clientMeetingLink);

  fetch(process.env.FINESSE_URL, requestOptions)
    .then((response) => response.text())
    .then((result) => {
      res.send(clientMeetingLink);
      console.log(result);
    })
    .catch((error) => console.error(error));
});
// https.createServer(options, app).listen(port, () => {
//   console.log(`Server listening on port ${port}`);
// });
io.on("connection", (socket) => {
  console.log(`user: ${JSON.stringify(socket.id)}`);
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
  socket.on("app_msg", (msg) => {
    socket.broadcast.emit("app_msg", msg); //Send to all except author/sender
    //io.emit("app_msg", msg); //Send to all, including author/sender
  });
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
