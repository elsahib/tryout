import React, { useContext, useState } from "react";
import { Container, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";
import SignIn from "./SignIn";
import UserContext from "./Context";
import CYFLogo from "./../Assets/CYFLogo.png";

const NavMenu = () => {
  const user = useContext(UserContext);
  const [hideBtn, setHideBtn] = useState(false);

  const handleBtn = () => {
    setHideBtn(!hideBtn);
  };

  return (
    <div>
      <Navbar>
        <Navbar.Brand href="#home">
          <img
            src={CYFLogo}
            className="d-inline-block align-top"
            alt="CYF Logo"
            width="180"
          />
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
            <SignIn />
          </Navbar.Text>
        </Navbar.Collapse>
      </Navbar>

      <Container>
        <div className="WelcomeSection">
          <h1>Welcome to the Q&A App</h1>
          <p>
            This product is in beta. That means that everything you post in here
            could be lost at some point.
          </p>

          <p>
            Please give us your feedback via{" "}
            <a href="https://forms.gle/drxvYH88GJFgo8R39"> this form </a>
          </p>
          <Link to="/">
            {hideBtn && (
              <button
                type="button"
                className="btn btn-success p-3 font-weight-bold"
                onClick={handleBtn}
              >
                See All Questions
              </button>
            )}
          </Link>
          {user && !hideBtn && (
            <Link
              to="/ask"
              type="button"
              className="btn btn-info p-3 mt-3 font-weight-bold"
              onClick={handleBtn}
            >
              Ask a question
            </Link>
          )}
        </div>
      </Container>
    </div>
  );
};

export default NavMenu;
