const express = require("express");
const snoowrap = require("snoowrap");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const path = require("path");
const utils = require("./scripts/utils.js");
const shrinkRay = require("shrink-ray");
const fs = require("fs");
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
  .use(express.static(path.join(__dirname, "dist")))
  .use(
    bodyParser.urlencoded({
      extended: true
    })
  )
  .use(bodyParser.json())
  .use(
    shrinkRay({
      cache: () => false,
      cacheSize: false,
      filter: () => true,
      brotli: {
        quality: 4 // between 1 and 11
      },
      zlib: {
        level: 6 // between 1 and 9
      }
    })
  )
  .use(
    shrinkRay({
      filter: req => req.headers["accept"].includes("text/html")
    })
  )
  .use((req, res, next) => {
    res.setHeader("Cache-Control", "max-age=" + 365 * 24 * 60 * 60);
    next();
  })
  .get("/r/:id/:sid", getDetail)
  .get("/r/:id", getSubreddit)
  .get("/", all)
  .listen(3001);

function getSubreddit(req, res) {
  const id = req.params.id;
  r.getSubreddit(id)
    .fetch()
    .then(post => {
      return {
        title: post.title,
        content: post.description,
        score: utils.truncateThousands(post.score),
        link: post.permalink,
        author: post.author ? post.author.name : "non existant",
        name: post.name,
        id: post.id,
        thumbnail: utils.checkIfUrl(post.thumbnail),
        subreddit: post.subreddit_name_prefixed
      };
    })
    .then(data => res.render("overview", { data: data }));
}

function getDetail(req, res) {
  const id = req.params.sid;

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
          thumbnail: utils.checkIfUrl(post.thumbnail),
          bigImg: post.url,
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
  try {
    fs.readFile("./data.json", "utf8", function read(err, data) {
      if (err) {
        console.log(err);
        fetchHomeData(req, res, next);
      }
      content = data;

      if (content) {
        console.log("content", JSON.parse(content));
        res.render("overview", {
          data: JSON.parse(content),
          title: "Hot reddit posts"
        });
      } else {
        fetchHomeData(req, res, next);
      }
    });
  } catch {
    fetchHomeData(req, res, next);
  }
}

function fetchHomeData(req, res, next) {
  r.getHot()
    .map(post => {
      return {
        title: post.title,
        link: post.permalink,
        score: post.score,
        author: post.author ? post.author.name : "non existant",
        name: post.name,
        id: post.id,
        thumbnail: post.thumbnail.includes("http") ? post.thumbnail : "",
        bigImg:
          post.url.includes(".jpg") ||
          post.url.includes(".png") ||
          post.url.includes(".jpeg")
            ? utils.checkIfUrl(post.url)
            : utils.checkIfUrl(post.thumbnail),
        subreddit: post.subreddit_name_prefixed,
        score: utils.truncateThousands(post.score)
      };
    })
    .then(data => {
      fs.writeFile("data.json", JSON.stringify(data), "utf8", err => {
        if (err) throw err;
      });
      return res.render("overview", { data: data, title: "Hot reddit posts" });
    });
}
