const { getUser } = require("../database/tables/users");
const { getVideo } = require("../database/tables/videos");
const { addVote } = require("../database/tables/votes");

const router = require("express").Router();

router.route("/").post(async (req, res) => {
    const { user, video, vote } = req.body;

    const userExist = await getUser(user);
    const videoExist = await getVideo(video);

    if (!userExist || !videoExist || ![0, 1, -1].includes(vote)) {
        res.send({ failed: true, reason: "Invalid user or video id or vote type" });
        return;
    }

    await addVote(user, video, vote);

    res.send({ done: true });
});

module.exports = router;
