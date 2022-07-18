const router = require("express").Router();
const { add, getVideoComments } = require("../database/tables/comments");
const { getUser } = require("../database/tables/users");
const { getVideo } = require("../database/tables/videos");

async function videoExists(id) {
    const video = await getVideo(id);
    return video != undefined;
}

async function userExists(id) {
    const user = await getUser(id);
    return user != null;
}

router.post("/", async (req, res) => {
    const video = req.body.video;
    const user = req.body.user;
    const comment = req.body.comment;
    const created = Date.now();

    const userExi = await userExists(req.body.user);
    const videoExi = await videoExists(req.body.video);

    console.log(req.body);

    if (!videoExi || !userExi) {
        res.send({ failed: true, reason: "user or video does not exist !" });
        return;
    }

    await add(comment, user, video, created);

    const comments = await getVideoComments(video);

    for (let i in comments) {
        const user = await getUser(comments[i]["user_id"]);

        comments[i].user = user;
    }

    res.send({ comments });
});

router.route("/:id").get(
    async (req, res, next) => {
        const videoExi = await videoExists(req.params.id);

        if (!videoExi) {
            res.send({ failed: true, reason: "video does not exist", comments: [] });
            return;
        }

        next();
    },
    async (req, res) => {
        const comments = await getVideoComments(req.params.id);

        for (let i in comments) {
            const user = await getUser(comments[i]["user_id"]);

            comments[i].user = user;
        }

        res.send({ comments });
    }
);

module.exports = router;
