const express = require("express");
const cors = require("cors");

const users = require("./routes/users");
const videos = require("./routes/videos");
const subscription = require("./routes/subscription");
const watch = require("./routes/watch");
const views = require("./routes/views");
const votes = require("./routes/votes");
const comments = require("./routes/comments");
const playlists = require("./routes/playlists");

const app = express();

app.use(express.static("./public"));
app.use(cors());
app.use(express.json());
app.use("/users", users);
app.use("/videos", videos);
app.use("/subscription", subscription);
app.use("/watch", watch);
app.use("/views", views);
app.use("/votes", votes);
app.use("/comments", comments);
app.use("/playlists", playlists);

app.listen(5000);
