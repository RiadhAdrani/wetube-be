const router = require("express").Router();
const { getUser } = require("../database/tables/users");
const {
    addVideo,
    getVideo,
    removeVideo,
    editVideo,
    getUserVideos,
    getRandomVideos,
} = require("../database/tables/videos");
const { generateID, processVideo, makeThumbnail } = require("../utils");
const path = require("path");
const multer = require("multer");
const { getVideoViews, addView } = require("../database/tables/views");
const { getVideoVotes } = require("../database/tables/votes");
const { getSubscribers } = require("../database/tables/subscription");

function makeVideoData(data) {
    let thumbnail = `http://localhost:5000/thumbnails/${data.id}.jpg`;

    return {
        ...data,
        thumbnail,
    };
}

const storage = multer.diskStorage({
    destination: "./public/upload",
    filename: (req, file, cb) => {
        cb(null, req.id + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
}).single("file");

router.route("/random").get(async (req, res) => {
    const list = await getRandomVideos(20);

    const items = [];

    for (let video in list) {
        const user = await getUser(list[video].user_id);
        const views = await getVideoViews(list[video].id);

        items.push({ ...makeVideoData(list[video]), user, views });
    }

    res.send({ items });
});

router.route("/").post(
    async (req, res, next) => {
        let doGenerateId = true;
        let id = "";

        while (doGenerateId) {
            id = generateID();

            const _exist = await getVideo(id);

            if (!_exist) doGenerateId = false;
        }

        req.id = id;

        next();
    },
    upload,
    async (req, res) => {
        const title = req.body.title;
        const userId = req.body.userId;
        const created = Date.now();
        const id = req.id;

        const _userExist = await getUser(userId);

        if (!_userExist) {
            res.send({ failed: true, details: "user does not exist" });
            return;
        }

        processVideo(
            id,
            () => {
                res.send({ failed: true, details: "Something went wrong" });
            },
            async (metadata) => {
                makeThumbnail(id);

                await addVideo(
                    id,
                    userId,
                    title,
                    Math.floor(metadata.format.duration),
                    created,
                    "",
                    "Private"
                );

                const _video = await getVideo(id);

                res.send({ data: _video, done: true });
            }
        );
    }
);

router.param("id", async (req, res, next, id) => {
    const video = await getVideo(id);

    if (!video) {
        res.send({ failed: true, reason: "video does not exist !" });
        return;
    }

    const user = await getUser(video.user_id);
    const views = await getVideoViews(id);
    const votes = await getVideoVotes(id);
    const subs = await getSubscribers(video.user_id);

    user.subscribers = subs;

    req.video = { ...video, views, votes, user };

    next();
});

router
    .route("/:id")
    .get(async (req, res) => {
        res.send(makeVideoData(req.video));
    })
    .delete(async (req, res) => {
        await removeVideo(req.params.id);

        res.send({ done: true });
    })
    .put(async (req, res) => {
        const video = req.video;

        const id = req.params.id;
        const title = req.body.title || video.title;
        const description = req.body.description || video.description;
        const visibility = req.body.visibility || video.visibility;

        await editVideo(id, title, description, visibility);

        const _video = await getVideo(id);

        res.send({ done: true, data: _video });
    });

router.route("/user/:userId").get(async (req, res) => {
    try {
        const items = await getUserVideos(req.params.userId);

        for (let video in items) {
            const views = await getVideoViews(items[video].id);

            items[video].views = views;
        }

        res.send({ items: items.map((item) => makeVideoData(item)) });
    } catch (error) {
        console.log(error);

        res.send({ failed: true, reason: error });
    }
});

module.exports = router;
