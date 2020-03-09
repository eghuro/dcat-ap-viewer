import React from "react";
import {
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Container,
  Collapse,
  Nav,
  NavItem,
  NavLink,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import {
  register,
  ELEMENT_HEADER,
  // VIEW_DATASET_LIST,
  // VIEW_ORGANISATION_LIST,
  // VIEW_KEYWORD_LIST,
  // VIEW_CATALOG_LIST,
} from "./../../../client/app/component-api";
// import {NavLink as RouterLink} from "react-router-dom";
import LanguageSelector from "./language-selector";
import {PropTypes} from "prop-types";

class Header extends React.Component {

  constructor(props) {
    super(props);
    this.toggleNavbar = this.toggleNavbar.bind(this);
    this.toggleMore = this.toggleMore.bind(this);
    this.state = {
      "isOpen": false,
      "isMoreOpen": false,
    };
  }

  toggleNavbar() {
    this.setState({
      "isOpen": !this.state.isOpen,
    });
  }

  toggleMore() {
    this.setState({
      "isMoreOpen": !this.state.isMoreOpen,
    });
  }

  render() {
    const {t} = this.props;
    return (
      <Container>
        <Navbar expand="md" className="navbar-light">
          <NavbarBrand href="https://data.gov.cz/">
            <img
              width="174" height="30"
              alt={t("header.logo_alt")}
              className="d-inline-block align-top"
              src="./assets/images/opendata-logo.png"
            />
          </NavbarBrand>
          <NavbarToggler onClick={this.toggleNavbar}/>
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <NavLink href="https://data.gov.cz/novinky/">
                  {t("news")}
                </NavLink>
              </NavItem>
              {/*<NavItem>*/}
              {/*  <RouterLink*/}
              {/*    to={tUrl(VIEW_DATASET_LIST)}*/}
              {/*    className="nav-link"*/}
              {/*    activeClassName="active"*/}
              {/*    isActive={isDatasetActive}*/}
              {/*  >*/}
              {/*    {t("datasets")}*/}
              {/*  </RouterLink>*/}
              {/*</NavItem>*/}
              {/*<NavItem>*/}
              {/*  <RouterLink*/}
              {/*    to={tUrl(VIEW_ORGANISATION_LIST)}*/}
              {/*    className="nav-link"*/}
              {/*    activeClassName="active"*/}
              {/*  >*/}
              {/*    {t("publishers")}*/}
              {/*  </RouterLink>*/}
              {/*</NavItem>*/}
              {/*<NavItem>*/}
              {/*  <RouterLink*/}
              {/*    to={tUrl(VIEW_KEYWORD_LIST)}*/}
              {/*    className="nav-link"*/}
              {/*    activeClassName="active"*/}
              {/*  >*/}
              {/*    {t("keywords")}*/}
              {/*  </RouterLink>*/}
              {/*</NavItem>*/}
              <NavItem>
                <Dropdown
                  isOpen={this.state.isMoreOpen}
                  toggle={this.toggleMore}
                >
                  <DropdownToggle caret nav>
                    {t("more")}
                  </DropdownToggle>
                  <DropdownMenu right>
                    <DropdownItem
                      href="https://opendata.gov.cz/informace:základy-otevřených-dat-pro-zájemce"
                    >
                      {t("for_interested_in_open_data")}
                    </DropdownItem>
                    <DropdownItem
                      href="https://opendata.gov.cz/informace:základy-otevřených-dat-pro-programátory"
                    >
                      {t("for_programmes")}
                    </DropdownItem>
                    <DropdownItem href="https://opendata.gov.cz">
                      {t("for_publishers")}
                    </DropdownItem>
                    {/*<DropdownItem*/}
                    {/*  tag={RouterLink}*/}
                    {/*  to={tUrl(VIEW_CATALOG_LIST)}*/}
                    {/*  activeClassName="active"*/}
                    {/*>*/}
                    {/*  {t("catalogs")}*/}
                    {/*</DropdownItem>*/}
                  </DropdownMenu>
                </Dropdown>
              </NavItem>
              <LanguageSelector
                t={this.props.t}
                language={this.props.language}
                location={this.props.location}
              />
            </Nav>
          </Collapse>
        </Navbar>
      </Container>
    )
  }

}

Header.propTypes = {
  "t": PropTypes.func.isRequired,
  "tUrl": PropTypes.func.isRequired,
  "language": PropTypes.string,
  "location": PropTypes.object.isRequired,
};

// function isDatasetActive(match, location) {
//   if (match) {
//     return true;
//   }
//   // const rootPath = URL_PREFIX + "/";
//   const rootPath = "/";
//   return location.pathname === rootPath;
// }

register({
  "name": ELEMENT_HEADER,
  "element": Header,
});
