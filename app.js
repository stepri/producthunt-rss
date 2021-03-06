var OAuth = require('oauth');
var RSS = require('rss');
var _ = require('underscore');
var cache = require('memory-cache');
var morgan = require('morgan');

var express = require('express');
var app = express();

app.use(morgan(':date[web] - :method :url :status :res[content-length] - :response-time ms'))

app.get('/', function (req, res) {
  res.redirect('/rss/posts/all');
});

app.get('/favicon.ico', function (req, res) {
  res.redirect('https://www.producthunt.com/favicon.ico');
});

app.get('/rss/posts/all', function (req, res) {

  req.cached = cache.get('posts/all');

  if (req.cached) {

    res.send(req.cached);

  } else {

    var oa = new OAuth.OAuth2(
      process.env.API_KEY,
      process.env.API_SECRET,
      'https://api.producthunt.com/',
      'oauth/authorize',
      'oauth/token',
      null
    );

    oa.get('https://api.producthunt.com/v1/posts/all', process.env.DEV_TOKEN, function(err, data) {

      if (err) {

        res.send(err);

      } else {

        data = JSON.parse(data);
        var feed = new RSS({
          title: 'Producthunt RSS',
          description: 'Producthunt RSS feed',
        });

        _.each(data.posts, function(post){
          feed.item({
            title: post.name + ' - ' + post.tagline,
            description: '<a href="'+post.redirect_url+'"><img src="'+post.screenshot_url['850px']+'"></a><br><a href="'+post.discussion_url+'">Discussion link</a> - Votes: '+post.votes_count+' - Comments: '+post.comments_count,
            url: post.redirect_url, // link to the item 
            guid: post.id, // optional - defaults to url 
            author: post.user.name + ' (@'+post.user.username+')', // optional - defaults to feed author property 
            date: post.created_at, // any format that js Date can parse. 
          });
        });

        var xml = feed.xml();

        cache.put('posts/all', xml, 300000);

        res.send(xml);
   
      }

    });

  }

});

app.listen(process.env.PORT || 80);
