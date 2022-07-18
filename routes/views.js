const { getUser } = require("../database/tables/users");
const { getVideo } = require("../database/tables/videos");
const { addView } = require("../database/tables/views");

const router = require("express").Router();

router.route("/").post(async (req, res) => {
    const { user, video } = req.body;

    const userExist = await getUser(user);
    const videoExist = await getVideo(video);

    const validUserView = userExist != undefined || user === "anonymous";

    if (!validUserView || !videoExist) {
        res.send({ failed: true, reason: "Invalid user or video id." });
        return;
    }

    await addView(user, video);

    res.send({ done: true });
});

module.exports = router;
