const toysR = require("./toys");
const usersR = require("./users");


exports.routesInit = (app) => {
  app.use("/users",usersR);
  app.use("/toys",toysR);
}