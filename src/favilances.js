const path = require("path");
const express = require("express");
const moment = require("moment");
const fs = require("fs");
const { marked } = require('marked');
const chalk = require("chalk");
const conf = require("../config/conf.json");
var app = express();

class favilances {
  constructor() {
      this.blogs = []; 
  }

  start(options) {
      const templateDir = path.resolve(`${process.cwd()}${path.sep}web`);
      app.use("/img", express.static(path.join(__dirname, 'img')));
      app.use("/css", express.static(path.resolve(`${templateDir}${path.sep}css`)));

      app.locals.domain = conf.homepage;

      app.engine("web", require("ejs").renderFile);
      app.set("view engine", "web");
      
      var bodyParser = require("body-parser");
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: true }));

      app.use((req, res, next) => {
          res.locals.marked = marked;
          next();
      });

      this.loadBlogs(); 

      const renderTemplate = async (res, req, template, data = {}) => {
          const baseData = {
              title: conf.title,
              description: conf.description,
              keywords: conf.keywords,
              author: conf.author,
              version: conf.version,
              license: conf.license,
              blogs: this.blogs,
              repository: conf.repository,
              homepage: conf.homepage,
              color: conf.color,
              copyright: conf.copyright,
              icon: conf.icon,
              x: conf.x,
              github: conf.github,
              resim: conf.resim,
              instagram: conf.instagram,
              youtube: conf.youtube
          };
          res.render(path.resolve(`${templateDir}${path.sep}${template}`), Object.assign(baseData, data));
      };

      app.get("/", (req, res) => {
          renderTemplate(res, req, "index.ejs", { req, res });
      });
    
      app.get("/blog", (req, res) => {
          renderTemplate(res, req, "blog.ejs", { req, res });
      });
      app.get("/bank-accounts", (req, res) => {
        renderTemplate(res, req, "bank-accounts.ejs", { req, res });
    });
      app.get('/blog/:slug', (req, res) => {
          const blogSlug = req.params.slug.toLowerCase();
          console.log('İstenen Slug:', blogSlug);

          const blog = this.blogs.find(b => b.slug === blogSlug);

          if (!blog) {
              return res.redirect("/404");
          }

          renderTemplate(res, req, 'blog-detail.ejs', { blog });
      });

      app.use(function(req, res, next) {
        res.status(404);
        renderTemplate(res, req, "404.ejs", { req, res })
      });

      app.listen(conf.port, console.log(
          chalk.white("[") +
          chalk.dim(`${moment(Date.now()).format('HH:mm')}`) +
          chalk.white("] ") +
          chalk.bold(`WEB`) +
          chalk.white(" | ") +
          chalk.bold(`ONLINE!`) +
          chalk.white(" | ") +
          chalk.bold(`PORT:`) +
          chalk.bold(conf.port)
      ));
  }

  loadBlogs() {
      const blogDir = path.join(__dirname, 'blogs');

      if (!fs.existsSync(blogDir)) {
          console.error('Blog klasörü bulunamadı:', blogDir);
          return [];
      }

      const files = fs.readdirSync(blogDir);

      this.blogs = files.map((file) => {
          const content = fs.readFileSync(path.join(blogDir, file), 'utf-8');

          const parts = content.split(/---\r?\n/);
          if (parts.length < 3) {
              return null;
          }

          const metadata = parts[1].trim();
          const body = parts.slice(2).join('---\n').trim();

          const meta = metadata.split('\n').reduce((acc, line) => {
              const [key, value] = line.split(':').map((x) => x.trim());
              if (key) acc[key] = value;
              return acc;
          }, {});

          if (!meta.title || !meta.date || !meta.resim) {
              return null;
          }

          r
          return {
              ...meta,
              body: marked(body), 
              slug: file.replace('.md', ''),
              date: moment(meta.date, 'DD-MM-YYYY').toDate(),
          };
      }).filter(blog => blog !== null);

    
      this.blogs.sort((a, b) => b.date - a.date);
  }

  extractImageUrls(markdown) {
      const imageUrlPattern = /!\[.*?\]\((https:\/\/[^\s)]+)\)/g;
      let urls = [];
      let match;

      while ((match = imageUrlPattern.exec(markdown)) !== null) {
          urls.push(match[1]); 
      }

      return urls;
  }
}

module.exports = favilances;

