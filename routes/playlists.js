const {
    addPlaylist,
    getPlaylist,
    deletePlaylist,
    getPlaylistData,
} = require("../database/tables/playlists");
const {
    addToPlaylist,
    removeFromPlaylist,
    getVideoPlaylists,
} = require("../database/tables/playlist-videos");

const router = require("express").Router();

router.route("/").post(async (req, res) => {
    const name = req.body.name;
    const user = req.body.user;

    if (!name || !user) throw Error("Playlist name or user are invalid !");

    const playlist = await addPlaylist(name, user);

    res.send(playlist);
});

router.route("/user").get();

router
    .route("/video/set")
    .post(async (req, res) => {
        const video = req.body.video;
        const playlist = req.body.playlist;

        if (!video || !playlist) throw Error("Playlist id or video id are invalid !");

        await addToPlaylist(playlist, video);

        const newPlaylist = await getPlaylist(playlist);

        res.send(newPlaylist);
    })
    .delete(async (req, res) => {
        const video = req.body.video;
        const playlist = req.body.playlist;

        if (!video || !playlist) throw Error("Playlist id or video id are invalid !");

        await removeFromPlaylist(video, playlist);

        const newPlaylist = await getPlaylist(playlist);

        res.send(newPlaylist);
    });

router.route("/video/:id").get(async (req, res) => {
    const items = await getVideoPlaylists(req.params.id);

    for (let i = 0; i < items.length; i++) {
        items[i] = await getPlaylistData(items[i].playlist_id);
    }

    res.send(items);
});

router
    .route("/:id")
    .get(async (req, res) => {
        const playlist = await getPlaylist(req.params.id);

        res.send(playlist);
    })
    .delete(async (req, res) => {
        await deletePlaylist(req.params.id);

        res.send({ done: true });
    });

module.exports = router;
