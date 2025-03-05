import "./style.css";
require("dotenv").config();
const { enableDrag } = require("./selfview");
var socket = io();
const axios = require("axios");
console.log("socketio", socket);

const urlParams = new URLSearchParams(window.location.search);

const myAccessToken = urlParams.get("access_token");
const destination = urlParams.get("destination");
const site = urlParams.get("site");
if (!myAccessToken) {
  alert("Access token is missing. Please provide it in the URL.");
  throw new Error("Access token is missing. Please provide it in the URL.");
}

const Webex = require("webex");

const webex = Webex.init({
  credentials: {
    access_token: myAccessToken,
  },
});

webex.config.logger.level = "debug";
// socket.emit("app_msg", `workflow button pushed`);

socket.on("app_msg", function (msg) {
  if (site == "client") {
    alert(msg);
  }

  console.log("Socket IO Message: " + msg);
});

webex.meetings
  .register()
  .then((r) => {
    console.log("Succesfully registered");
    console.log(destination);
    webex.meetings
      .create(destination)
      .then(async (meeting) => {
        console.log("Meeting successfully created");

        // Call our helper function for binding events to meetings
        await bindMeetingEvents(meeting);
        await bindButtonEvents(meeting);
        await joinMeeting(meeting);
      })
      .catch((error) => {
        // Report the error
        console.error(error);
      });
  })
  .catch((err) => {
    console.error(err);
    alert(err);
    throw err;
  });
async function bindButtonEvents(meeting) {
  const videoMuteOff = document.getElementById("video-mute-off");
  const videoMuteOn = document.getElementById("video-mute-on");
  const audioMuteOff = document.getElementById("audio-mute-off");
  const audioMuteOn = document.getElementById("audio-mute-on");
  const dropdownButton = document.getElementById("dropdown-button");
  const hideSelfView = document.getElementById("hide-self-view");
  const showSelfView = document.getElementById("show-self-view");
  const self = document.getElementById("self");
  const remoteView = document.getElementById("remote-view");
  const clientConnect = document.getElementById("client-connect");
  const agentConnect = document.getElementById("agent-connect");
  const dropdown = document.getElementsByClassName("dropdown");

  const meetingDest = meeting.destination;

  document.getElementById("hangup").addEventListener("click", async () => {
    // window.location.href = "/hangup";
    console.log("hangup clicked");
    await axios
      .get(`https://webexapis.com/v1/meetings?webLink=${meetingDest}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myAccessToken}`,
        },
      })
      .then(async (res) => {
        console.log("res", res);
        const id = res.data.items[0].id;
        console.log("id", id);
        const date = new Date();
        const connectData = {
          accessToken: myAccessToken,
          meetingId: id,
          meetingEnded: date,
        };
        console.log("connectData", connectData);
        await axios
          .post(
            "https://hooks.us.webexconnect.io/events/P3RGOWXKZY",
            connectData
          )
          .then((res) => {
            console.log("Connect resp", res);
          })
          .catch((err) => {
            console.log("Connect err", err);
          });
      })
      .catch((err) => {
        console.log("list meetings err", err);
      });
    await meeting.endMeetingForAll();
    await meeting.getMembers().then((members) => {
      console.log("members", members);
    });
  });
  console.log("site", site);
  if (site == "client") {
    clientConnect.style.display = "none";
    agentConnect.style.display = "";
  } else if (site == "agent") {
    clientConnect.style.display = "";
    agentConnect.style.display = "none";
  }
  clientConnect.addEventListener("click", () => {
    console.error("workflow button pushed");
    socket.emit("app_msg", `Agent workflow button pushed`);
  });
  agentConnect.addEventListener("click", () => {
    console.error("workflow button pushed");
    socket.emit("app_msg", `Client workflow button pushed`);
  });
  videoMuteOff.addEventListener("click", () => {
    console.log("videmute off clicked");
    meeting.muteVideo();
    videoMuteOff.style.display = "none";
    videoMuteOn.style.display = "";
  });
  videoMuteOn.addEventListener("click", () => {
    console.log("video mute on clicked");
    meeting.unmuteVideo();
    videoMuteOff.style.display = "";
    videoMuteOn.style.display = "none";
  });
  audioMuteOff.addEventListener("click", () => {
    meeting.muteAudio();
    audioMuteOff.style.display = "none";
    audioMuteOn.style.display = "";
  });
  audioMuteOn.addEventListener("click", () => {
    meeting.unmuteAudio();
    audioMuteOff.style.display = "";
    audioMuteOn.style.display = "none";
  });
  hideSelfView.addEventListener("click", () => {
    self.style.display = "none";
    hideSelfView.style.display = "none";
    showSelfView.style.display = "";
  });
  showSelfView.addEventListener("click", () => {
    self.style.display = "";
    hideSelfView.style.display = "";
    showSelfView.style.display = "none";
  });
  dropdownButton.addEventListener("click", () => {
    // dropdown.classList.toggle("is-active");
    Array.from(dropdown).forEach((drop) => {
      drop.classList.toggle("is-active");
    });
  });
  if (self) {
    enableDrag(self, remoteView);
  }
}

async function bindMeetingEvents(meeting) {
  const selfView = document.getElementById("self-view");
  const remoteViewVideo = document.getElementById("remote-view-video");
  const remoteViewAudio = document.getElementById("remote-view-audio");
  const buttonsContainer = document.getElementById("buttons-container");
  const loadingContainer = document.getElementById("loading-container");

  meeting.on("error", (error) => console.log(error, "Meeting Error"));

  meeting.on("media:ready", (media) => {
    if (!media) return;

    const element =
      media.type === "local"
        ? selfView
        : media.type === "remoteVideo"
        ? remoteViewVideo
        : media.type === "remoteAudio"
        ? remoteViewAudio
        : null;

    if (element) {
      element.srcObject = media.stream;
      buttonsContainer.style.display = "flex";
      loadingContainer.style.display = "none";
    }
  });

  meeting.on("media:stopped", (media) => {
    console.log("meeting stopped");
    window.location.href = "/hangup";
    const element =
      media.type === "local"
        ? selfView
        : media.type === "remoteVideo"
        ? remoteViewVideo
        : media.type === "remoteAudio"
        ? remoteViewAudio
        : null;

    if (element) {
      element.srcObject = null;
      buttonsContainer.style.display = "none";
    }
  });
}

// Join the meeting and add media
// Join the meeting and add media through joinWithMedia method.
async function joinMeeting(meeting) {
  try {
    const { sendAudio, sendVideo } = await meeting.getSupportedDevices({
      sendAudio: true,
      sendVideo: true,
    });
    meeting.join().then(async () => {
      const mediaSettings = {
        receiveVideo: true,
        receiveAudio: true,
        receiveShare: false,
        sendShare: false,
        sendVideo,
        sendAudio,
      };

      // Get our local media stream and add it to the meeting
      meeting.getMediaStreams(mediaSettings).then((mediaStreams) => {
        const [localStream, localShare] = mediaStreams;
        meeting.addMedia({
          localShare,
          localStream,
          mediaSettings,
        });
      });
    });
  } catch (error) {
    console.log(error, "Join Meeting Error");
    throw error;
  }
}
