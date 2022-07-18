const router = require("express").Router();
const {
    getUser,
    addUser,
    getAll,
    updateUser,
    getUserByEmail,
    getUserByCredential,
    deleteUser,
    getUsersIn,
} = require("../database/tables/users");
const { generateID, processImage, useMulter, isValidInput, isValidEmail } = require("../utils");

const MAX_SIZE = 100 * 1024;
const MAX_DIMENSION = 500;

function usersImgPath(ref) {
    return `./public/users/${ref}.webp`;
}

router
    .route("/")
    .get(async (req, res) => {
        let data = [];

        if (req.body.users) {
            data = await getUsersIn(req.body.users);
        } else {
            data = await getAll();
        }

        res.send(data);
    })
    .post(async (req, res) => {
        const { username, password, email } = req.body;

        let _exist = true;
        let id = "";

        if (!isValidInput(email, "string", 6, 50) || !isValidEmail(email)) {
            res.send({ failed: true, reason: "The given email is not formatted properly." });
            return;
        }

        if ((await getUserByEmail(email)) != undefined) {
            res.send({ failed: true, reason: "The given email is already in use." });
            return;
        }

        if (!isValidInput(username, "string", 3, 50)) {
            res.send({ failed: true, reason: "The provided Username is invalid." });
            return;
        }

        if (!isValidInput(password, "string", 6, 50)) {
            res.send({ failed: true, reason: "The provided Password is too weak or invalid." });
            return;
        }

        while (_exist) {
            id = generateID();

            const _user = await getUser(id);

            if (!_user) _exist = false;
        }

        await addUser({
            id,
            username,
            password,
            email,
            joined: Date.now(),
        });

        const user = await getUser(id);

        res.send(user);
    });

router.route("/search").post(async (req, res) => {
    const query = req.body.query;

    if (!query) {
        res.send({ result: [] });
        return;
    }

    const result = await getAll(query);
    res.send({ result: result });
});

router.route("/login").post(async (req, res) => {
    const { email, password } = req.body;

    const user = await getUserByCredential(email, password);

    if (!user) {
        res.send({ failed: true, reason: "Unable to find a user with the given combination." });
        return;
    }

    res.send(user);
});

router.param("id", async (req, res, next, id) => {
    const user = await getUser(id);

    if (!user) {
        res.send({ failed: true });
        return;
    }

    req.user = user;
    next();
});

router
    .route("/:id")
    .get(async (req, res) => {
        const user = req.user;

        res.send(user);
    })
    .delete(async (req, res) => {
        await deleteUser(req.user.id);

        res.send({ done: true });
    })
    .put(useMulter().single("img"), async (req, res) => {
        const user = req.user;
        const id = user.id;

        const updatedUser = await updateUser(id, req.body);

        if (req.file) {
            await processImage(req.file.buffer, MAX_SIZE, MAX_DIMENSION, usersImgPath(id));
        }

        if (updatedUser) {
            res.send(updatedUser);
        } else {
            res.send({ failed: true });
        }
    });

module.exports = router;
