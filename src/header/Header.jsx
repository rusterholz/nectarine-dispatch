import React, {PropTypes, Component} from 'react';
import {Link} from 'react-router';

export default class Header extends Component {
  render(){
    return (
      <div className="navbar navbar-default navbar-fixed-top">
        <div className="container-fluid">
          <div className="navbar-header">
            <Link to="/" className="navbar-brand">Nectarine</Link>
            <button className="navbar-toggle" type="button" data-toggle="collapse" data-target="#navbar-main">
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
          </div>
          <div className="navbar-collapse collapse" id="navbar-main">
            <ul className="nav navbar-nav">
              <li className="dropdown">
                <a className="dropdown-toggle" data-toggle="dropdown" href="#" id="themes">Themes <span className="caret"></span></a>
                <ul className="dropdown-menu" aria-labelledby="themes">
                  <li><a href="../default/">Default</a></li>
                  <li className="divider"></li>
                  <li><a href="../cerulean/">Cerulean</a></li>
                  <li><a href="../cosmo/">Cosmo</a></li>
                </ul>
              </li>
              <li>
                <a href="../help/">Help</a>
              </li>
              <li>
                <a href="http://news.bootswatch.com">Blog</a>
              </li>
              <li className="dropdown">
                <a className="dropdown-toggle" data-toggle="dropdown" href="#" id="download">Darkly <span className="caret"></span></a>
                <ul className="dropdown-menu" aria-labelledby="download">
                  <li><a href="http://jsfiddle.net/bootswatch/1172d9hh/">Open Sandbox</a></li>
                  <li className="divider"></li>
                  <li><a href="./bootstrap.min.css">bootstrap.min.css</a></li>
                  <li><a href="./bootstrap.css">bootstrap.css</a></li>
                </ul>
              </li>
            </ul>
            <ul className="nav navbar-nav navbar-right">
              <li><a href="http://builtwithbootstrap.com/" target="_blank">Built With Bootstrap</a></li>
              <li><a href="https://wrapbootstrap.com/?ref=bsw" target="_blank">WrapBootstrap</a></li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

Header.displayName = 'Header';
