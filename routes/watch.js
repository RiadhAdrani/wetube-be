const router = require("express").Router();
const fs = require("fs");
const { getVideo } = require("../database/tables/videos");

const CHUNK_SIZE = 10 ** 6;

router.param("id", async (req, res, next, id) => {
    const video = await getVideo(id);

    if (!video) {
        res.status(400).send({ failed: true, reason: "Video not found." });
        return;
    }

    next();
});

router.route("/:id").get((req, res) => {
    const range = req.headers.range;

    if (!range) {
        res.status(400).send("Requires range header.");
        return;
    }

    const filePath = `./public/videos/${req.params.id}.mp4`;
    const fileSize = fs.statSync(filePath).size;

    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, fileSize - 1);
    const contentLength = end - start + 1;

    const headers = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };

    res.writeHead(206, headers);

    const videoStream = fs.createReadStream(filePath, { start, end });
    videoStream.pipe(res);
});

module.exports = router;
