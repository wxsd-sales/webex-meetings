import "./style.css";
const { enableDrag } = require("./selfview");

function getAccessTokenFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("access_token");
}
function getDestinationFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("destination");
}

const myAccessToken = getAccessTokenFromURL();
const destination = getDestinationFromURL();

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

webex.meetings
  .register()
  .then((r) => {
    console.log("Succesfully registered");
    console.log(destination);
    webex.meetings
      .create(destination)
      .then(async (meeting) => {
        console.log("Meeting successfully created");
        // let data =
        //   "<Task>\r\n   <name>NewTaskName</name>\r\n   <title>NewTaskTitle</title>\r\n   <description>NewTaskdescription</description>\r\n   <scriptSelector>CumulusTask</scriptSelector>\r\n   <requeueOnRecovery>true</requeueOnRecovery>\r\n   <!-- Indicates if the contact will be re-queued/discarded on \r\n   SM failure recovery-->\r\n   <tags>\r\n      <tag>tag1</tag>\r\n      <tag>tag2</tag>\r\n   </tags>\r\n   <variables>\r\n    <variable> \r\n      <name>cv_1</name> \r\n      <value>access_token</value> \r\n    </variable>\r\n        <variable> \r\n      <name>cv_2</name> \r\n      <value>destination</value> \r\n    </variable>\r\n   </variables>\r\n</Task>";

        // let config = {
        //   method: "post",
        //   maxBodyLength: Infinity,
        //   url: "https://sm1.dcloud.cisco.com/ccp/task/feed/100080",
        //   headers: {
        //     "Content-Type": "application/xml",
        //     Cookie: "JSESSIONID=686F769071BB0A13F344F78F9A0E0447",
        //   },
        //   data: data,
        // };

        // axios
        //   .request(config)
        //   .then((response) => {
        //     console.log(JSON.stringify(response.data));
        //   })
        //   .catch((error) => {
        //     console.log(error);
        //   });

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
  const dropdown = document.getElementsByClassName("dropdown");

  document.getElementById("hangup").addEventListener("click", async () => {
    window.location.href = "/hangup";
    // await meeting.endMeetingForAll();
    await meeting.getMembers().then((members) => {
      console.log("members", members);
    });
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
  // meeting.on("error", (err) => {
  //   console.error(err);
  // });

  // // Handle media streams changes to ready state
  // meeting.on("media:ready", (media) => {
  //   bindButtonEvents(meeting);
  //   if (!media) {
  //     return;
  //   }
  //   if (media.type === "remoteVideo") {
  //     document.getElementById("remote-view-video").srcObject = media.stream;
  //   }
  //   if (media.type === "remoteAudio") {
  //     document.getElementById("remote-view-audio").srcObject = media.stream;
  //   }
  // });

  // // Handle media streams stopping
  // meeting.on("media:stopped", (media) => {
  //   // Remove media streams
  //   if (media.type === "remoteVideo") {
  //     document.getElementById("remote-view-video").srcObject = null;
  //   }
  //   if (media.type === "remoteAudio") {
  //     document.getElementById("remote-view-audio").srcObject = null;
  //   }
  // });

  // // Of course, we'd also like to be able to leave the meeting:
  // document.getElementById("hangup").addEventListener("click", () => {
  //   meeting.leave();
  // });
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
  // const microphoneStream =
  //   await webex.meetings.mediaHelpers.createMicrophoneStream({
  //     echoCancellation: true,
  //     noiseSuppression: true,
  //   });

  // const cameraStream = await webex.meetings.mediaHelpers.createCameraStream({
  //   width: 640,
  //   height: 480,
  // });
  // document.getElementById("self-view").srcObject = cameraStream.outputStream;

  // const meetingOptions = {
  //   mediaOptions: {
  //     allowMediaInLobby: true,
  //     shareAudioEnabled: false,
  //     shareVideoEnabled: false,
  //     localStreams: {
  //       camera: cameraStream,
  //       microphone: microphoneStream,
  //     },
  //   },
  // };

  // await meeting.joinWithMedia(meetingOptions);
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
