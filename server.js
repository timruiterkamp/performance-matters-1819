const express = require("express");
const snoowrap = require("snoowrap");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const path = require("path");
const utils = require("./scripts/utils.js");
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
  .get("/r/:id/:sid", getDetail)
  .get("/r/:id", getSubreddit)
  .get("/", all)
  // .get("*", (req, res) => res.render("error"))
  .listen(3000);

function getSubreddit(req, res) {
  const id = req.params.id;

  try {
    r.getSubreddit(id)
      .getWikiPage("bestof")
      .content_md.then(console.log);
  } catch {
    res.render("error");
  }
  r.getSubreddit(id)
    .fetch()
    .then(post => {
      console.log(post);
      return {
        title: post.title,
        content: post.description,
        score: utils.truncateThousands(post.score),
        link: post.permalink,
        author: post.author ? post.author.name : "non existant",
        name: post.name,
        id: post.id,
        thumbnail: post.thumbnail,
        subreddit: post.subreddit_name_prefixed
      };
    })
    .then(data => res.render("overview", { data: data }));
}

function getDetail(req, res) {
  const id = req.params.sid;
  console.log(id);

  try {
    r.getSubmission(id)
      .fetch()
      .then(post => {
        return {
          title: post.title,
          link: post.permalink,
          text: post.body,
          score: utils.truncateThousands(post.score),
          author: post.author ? post.author.name : "non existant",
          name: post.name,
          id: post.id,
          thumbnail: post.thumbnail,
          subreddit: post.subreddit_name_prefixed,
          created: post.created
        };
      })
      .then(data => res.render("detail", { data: data }));
  } catch {
    res.render("error");
  }
}
function all(req, res, next) {
  r.getHot()
    .map(post => {
      console.log(post);
      return {
        title: post.title,
        link: post.permalink,
        score: post.score,
        author: post.author ? post.author.name : "non existant",
        name: post.name,
        id: post.id,
        thumbnail: post.thumbnail,
        subreddit: post.subreddit_name_prefixed,
        score: utils.truncateThousands(post.score)
      };
    })
    .then(data =>
      res.render("overview", { data: data, title: "Hot reddit posts" })
    )
    .catch(console.error);
}
