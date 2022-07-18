const sharp = require("sharp");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
var path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const fs = require("fs");

ffmpeg.setFfmpegPath(ffmpegPath);

function generateID(length = 12) {
    const possible = [..."abcdefghijklmnopqrstuvwxyz-_0123456789"];

    let index = 0;
    let id = "";

    while (index < length) {
        index++;

        const char = possible[Math.floor(possible.length * Math.random())];

        id += Math.random() > 0.5 ? char.toUpperCase() : char;
    }

    return id;
}

async function processImage(buffer, maxSize, maxDimension, outputPath) {
    let file = sharp(buffer);
    let processed = file;

    let metadata = await file.metadata();

    let resizeRate = 1;

    if (Array.isArray(maxDimension) && maxDimension.length > 0) {
        if (maxDimension.length == 1) {
            resizeRate = maxDimension[0] / Math.max(metadata.height, metadata.width);
        } else {
            resizeRate = Math.min(
                maxDimension[0] / metadata.width,
                maxDimension[1] / metadata.height
            );
        }
    } else if (metadata.height > maxDimension || metadata.width > maxDimension) {
        resizeRate = maxDimension / Math.max(metadata.height, metadata.width);
    }

    processed = processed.resize(
        Math.floor(metadata.width * resizeRate),
        Math.floor(metadata.height * resizeRate)
    );

    metadata = await processed.metadata();

    const compressionRate =
        maxSize < metadata.size ? Math.floor(maxSize < metadata.size * 100) : 100;

    processed = processed.webp({ quality: compressionRate });

    await processed.toFile(outputPath);
}

function useMulter() {
    return upload;
}

function isValidInput(input, type, minLength, maxLength) {
    if (typeof input != type) return false;
    if (typeof input === "string") {
        if (/(:|;)/.test(input)) return false;
        if (input.length < minLength) return false;
        if (maxLength > minLength && input.length > maxLength) return false;
    }

    return true;
}

function isValidEmail(input) {
    const regEx = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;

    return regEx.test(input);
}

function processVideo(id, onError, onEnd) {
    const origin = path.join(__dirname, "./public/upload/" + id + ".mp4");
    const output = path.join(__dirname, "./public/videos/" + id + ".mp4");

    ffmpeg(origin)
        .output(output)
        .videoCodec("libx264")
        .size("1280x720")
        .on("progress", (progress) => {
            console.log("progress approx: " + progress.percent);
        })
        .on("error", (error) => {
            onError(error);
        })
        .on("end", () => {
            console.log("Deleting Raw file ...");
            fs.unlinkSync(origin);

            console.log("Getting metadata ...");
            ffmpeg.ffprobe(output, (err, metadata) => {
                onEnd(metadata);
            });
        })
        .run();
}

function makeThumbnail(id) {
    const video = path.join(__dirname, "./public/videos/" + id + ".mp4");
    const output = path.join(__dirname, "./public/thumbnails/" + id + ".jpg");

    ffmpeg(video).seekInput("00:02.000").output(output).outputOptions("-frames", "1").run();
}

function makeUserData(data) {
    if (!data) return data;

    let img = `http://localhost:5000/users/${data.id}.webp`;

    const _path = path.join(__dirname, `./public/users/${data.id}.webp`);

    const exist = fs.existsSync(_path);

    if (!exist) {
        img = `http://localhost:5000/users/user.png`;
    }

    delete data.password;

    return {
        ...data,
        img,
    };
}

module.exports = {
    generateID,
    processImage,
    useMulter,
    isValidInput,
    isValidEmail,
    processVideo,
    makeThumbnail,
    makeUserData,
};
