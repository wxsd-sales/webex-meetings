const express = require("express");
const path = require("path");
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "dist")));

app.post("/task-routing", (req, res) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/xml");
  myHeaders.append("Cookie", "JSESSIONID=7430280F23446A3C75D2533EEA6AFF2B");

  const raw =
    "<Task>\n   <name>NewTaskName</name>\n   <title>NewTaskTitle</title>\n   <description>NewTaskdescription</description>\n   <scriptSelector>CumulusTask</scriptSelector>\n   <requeueOnRecovery>true</requeueOnRecovery>\n   <!-- Indicates if the contact will be re-queued/discarded on \n   SM failure recovery-->\n   <tags>\n      <tag>tag1</tag>\n      <tag>tag2</tag>\n   </tags>\n   <variables>\n    <variable> \n      <name>cv_1</name> \n      <value>access_token</value> \n    </variable>\n        <variable> \n      <name>cv_2</name> \n      <value>destination</value> \n    </variable>\n   </variables>\n</Task>";

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

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// const express = require("express");
// const webpack = require("webpack");
// const webpackDevMiddleware = require("webpack-dev-middleware");

// const app = express();
// const config = require("./webpack.config.js");
// const compiler = webpack(config);

// app.use(
//   webpackDevMiddleware(compiler, {
//     publicPath: config.output.publicPath,
//   })
// );

// // Serve the files on port 3000.
// app.listen(3000, function () {
//   console.log("Example app listening on port 3000!\n");
// });
