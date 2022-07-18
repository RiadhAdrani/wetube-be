const router = require("express").Router();
const {
    add,
    getSubscribers,
    getSubscription,
    remove,
    relationExists,
} = require("../database/tables/subscription");
const { getUser } = require("../database/tables/users");

async function checkRequest(req, res, next) {
    const target = await getUser(req.body.target);
    const source = await getUser(req.body.source);

    if (!target || !source || target.id == source.id) {
        res.send({ failed: true });
        return;
    }

    req.target = target.id;
    req.source = source.id;

    next();
}

router.route("/add").post(checkRequest, async (req, res) => {
    if (await relationExists(req.source, req.target)) {
        res.send({ done: true });
        return;
    }

    await add(req.source, req.target);

    res.send({ done: true });
});

router.route("/remove").post(checkRequest, async (req, res) => {
    await remove(req.source, req.target);

    res.send({ done: true });
});

router.param("id", async (req, res, next, id) => {
    const user = await getUser(id);

    if (!user) {
        res.send({ failed: true });
        return;
    }

    next();
});

router.route("/:id").get(async (req, res) => {
    const subscribers = await getSubscribers(req.params.id);
    const subscription = await getSubscription(req.params.id);

    res.send({ subscribers, subscription });
});

router.route("/:id/subscribers").get(async (req, res) => {
    const items = await getSubscribers(req.params.id);

    res.send({ items });
});

router.route("/:id/subscription").get(async (req, res) => {
    const items = await getSubscription(req.params.id);

    res.send({ items });
});

module.exports = router;
