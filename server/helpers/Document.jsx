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
