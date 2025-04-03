const express = require("express")
const router = express.Router();

const imageRoute = require("./imageRoute")

const defaultRoutes = [
    {
        prefix: "/image",
        route: imageRoute,
    },
]

defaultRoutes.forEach((route) => {
    if (route.middleware) {
        router.use(route.prefix, route.middleware, route.route);
    } else {
        router.use(route.prefix, route.route);
    }
});

module.exports = router;

