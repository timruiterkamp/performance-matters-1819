const express = require("express");
const snoowrap = require("snoowrap");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const r = new snoowrap({
  userAgent: process.env.USERAGENT,
  clientId: process.env.REDDITID,
  clientSecret: process.env.REDDITSECRET,
  refreshToken: process.env.REFRESHTOKEN
});

express()
  .engine("handlebars", exphbs({ defaultLayout: "main" }))
  .set("view engine", "handlebars")
  .use(express.static(path.join(__dirname, "public")))
  .use(
    bodyParser.urlencoded({
      extended: true
    })
  )
  .use(bodyParser.json())
  .get("/", all)
  .get("/*", (req, res) => res.render("error"))
  .listen(3000);

function all(req, res, next) {
  console.log("doet t mehehe");

  r.getHot()
    .map(post => {
      return {
        title: post.title,
        link: post.permalink,
        author: post.author ? post.author.name : "non existant",
        name: post.name,
        id: post.id,
        thumbnail: post.thumbnail,
        subreddit: post.subreddit_name_prefixed
      };
    })
    .then(data => res.render("home", { data: data }))
    .catch(console.error);

  // console.log(r.getSubmission("2np694").body);
  // function done(err, data) {
  //   if (err) {
  //     next(err);
  //   } else {
  //     console.log(data);
  //     res.format({
  //       json: () => res.json(data),
  //       html: () => res.render("home", Object.assign({}, { data: data }))
  //     });
  //   }
  // }
}
