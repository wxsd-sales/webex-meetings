const express = require("express");
const path = require("path");
const cors = require("cors");
const https = require("https");
const fs = require("fs");
const { createServer } = require("node:http");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const app = express();
// const http = require("http").createServer(app);
// const io = require("socket.io")(http);
const server = createServer(app);
const { Server } = require("socket.io");
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

// app.get("/hangup", (req, res) => {
//   console.log("hangup");
// });

app.post("/task-routing", (req, res) => {
  console.log(req.body);
  const { access_token, destination } = req.body;
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/xml");
  myHeaders.append("Cookie", "JSESSIONID=7430280F23446A3C75D2533EEA6AFF2B");

  const raw = `<Task>
   <name>NewTaskName</name>
   <title>NewTaskTitle</title>
   <description>NewTaskdescription</description>
   <scriptSelector>CumulusTask</scriptSelector>
   <requeueOnRecovery>true</requeueOnRecovery>
   <!-- Indicates if the contact will be re-queued/discarded on 
   SM failure recovery-->
   <tags>
      <tag>tag1</tag>
      <tag>tag2</tag>
   </tags>
   <variables>
    <variable> 
      <name>cv_1</name> 
      <value>12345</value> 
    </variable>
    <variable> 
      <name>user_user_videoToken</name> 
      <value>${access_token}</value> 
    </variable>
    <variable> 
      <name>user_user_videoDestination</name> 
      <value>${destination}</value> 
    </variable>
   </variables>
</Task>`;

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    // redirect: "follow"
  };

  fetch("https://sm1.dcloud.cisco.com/ccp/task/feed/100080", requestOptions)
    .then((response) => response.text())
    .then((result) => {
      res.send(result);
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
