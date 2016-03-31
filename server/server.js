var React = require('react');
var ReactDOMServer = require('react-dom/server');
var ReactRouter = require('react-router');
var express = require('express');
var bundle = require('./public/bundle');
var Document = require('./public/helpers/Document').Document;

// start server
var app = express();

app.use(express.static('public'));

app.get('*', function (req, res) {
  ReactRouter.match(
    {
      routes: bundle.exports.routes,
      location: req.url
    },
    (error, redirectLocation, renderProps) => {
      if (error) {
        res.status(500).send(error.message);
      } else if (redirectLocation) {
        res.redirect(302, redirectLocation.pathname + redirectLocation.search);
      } else if (renderProps) {
        res.status(200).send(
          '<!DOCTYPE html>' + ReactDOMServer.renderToString(
            React.createElement( Document, { contentElement: bundle.exports.contentElement } )
          )
        );
      } else {
        res.status(404).send('Not found');
      }
    }
  );
});

app.listen(3000, function () {
  console.log('Server listening on port 3000!');
});
