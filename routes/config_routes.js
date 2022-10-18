const indexR = require("./index");
const usersR = require("./users");
const camerasR = require("./cameras");

exports.routesInit = (app) => {
    app.use("/", indexR);
    app.use("/users", usersR);
    app.use("/cameras", camerasR)
}