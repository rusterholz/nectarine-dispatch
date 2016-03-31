import React, {Component, PropTypes} from 'react';

/**
 * Wrapper component containing HTML metadata and boilerplate tags.
 * Used in server-side code only to wrap the string output of the
 * rendered route component.
 *
 * The only thing this component doesn't (and can't) include is the
 * HTML doctype declaration, which is added to the rendered output
 * by the server.js file.
 */
export class Document extends Component {
  render() {
    const {contentElement} = this.props;
    return (
      <html lang="en-us">
        <head>
          <title>Nectarine Dispatch</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="application-name" content="Nectarine" />
          <link rel="stylesheet" type="text/css" href="/bundle.css" />
          <script src="https://code.jquery.com/jquery-2.2.2.min.js"></script>
          <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js" integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS" crossOrigin="anonymous"></script>
        </head>
        <body>
          <div id={contentElement}/>
          <script type="text/javascript" src="/bundle.js"></script>
        </body>
      </html>
    );

  }
}

Document.propTypes = {
  contentElement: PropTypes.string
}
