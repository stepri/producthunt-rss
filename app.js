var express = require('express');
var OAuth = require('oauth');
var RSS = require('rss');
var _ = require('underscore');
var app = express();

app.get('/', function (req, res) {
  res.redirect('/rss/post/all');
});

app.get('/rss/post/all', function (req, res) {

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
          description: '<img src="'+post.screenshot_url['850px']+'"><br><a href="'+post.discussion_url+'">Discussion link</a> - Votes: '+post.votes_count+' - Comments: '+post.comments_count,
          url: post.redirect_url, // link to the item 
          guid: post.id, // optional - defaults to url 
          author: post.user.name + ' (@'+post.user.username+')', // optional - defaults to feed author property 
          date: post.created_at, // any format that js Date can parse. 
        });
      });

      var xml = feed.xml();
      res.send(xml);
 
    }

  });

});

app.listen(process.env.PORT || 80);