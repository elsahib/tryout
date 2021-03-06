import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Accordion, Card, Button } from "react-bootstrap";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import Moment from "react-moment";
import { Comment } from "./Comment";
import ShowComments from "./ShowComments";
import { Link } from "react-router-dom";

const ShowContext = ({
  id,
  title,
  context,
  postComment,
  getComments,
  question_date,
}) => {
  const [comments, setComments] = useState([]);
  const [refresh, setRefresh] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [open, setOpen] = useState(true);

  const handleClick = () => {
    setShowEdit(true);
  };

  function createMarkup() {
    return { __html: context };
  }

  useEffect(() => {
    getComments(id).then((data) => {
      setComments(data);
    });
  }, [refresh]);

  return (
    <Accordion
      className="p-2"
      defaultActiveKey="1"
      onClick={() => setOpen(!open)}
    >
      <Card className=" bg-light">
        <Card.Header className="text-left lead font-weight-bold">
          <Accordion.Toggle
            as="div"
            variant="link"
            eventKey="0"
            className="py-3"
          >
            {title}

            {open ? (
              <FaChevronDown className="float-right" />
            ) : (
              <FaChevronUp className="float-right" />
            )}

            <Moment fromNow className="text-muted d-block font-weight-lighter">
              {question_date}
            </Moment>
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse eventKey="0">
          <Card.Body>
            <Card.Text
              dangerouslySetInnerHTML={createMarkup()}
              className="text-left py-2"
            />
            <ShowComments comments={comments} />
            <Accordion defaultActiveKey="1">
              <Accordion.Toggle
                as="div"
                variant="link"
                eventKey={refresh ? "0" : "1"}
              >
                <Button
                  onClick={handleClick}
                  className="float-right mb-3"
                  variant="info"
                >
                  Answer this Question
                </Button>
              </Accordion.Toggle>
              <Accordion.Collapse eventKey={refresh ? "0" : "1"}>
                <Comment
                  setRefresh={setRefresh}
                  showEdit={showEdit}
                  refresh={refresh}
                  postComment={postComment}
                  id={id}
                />
              </Accordion.Collapse>
            </Accordion>
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </Accordion>
  );
};

ShowContext.propTypes = {
  id: PropTypes.number,
  title: PropTypes.string,
  context: PropTypes.string,
  getComments: PropTypes.func,
  postComment: PropTypes.func,
  question_date: PropTypes.string,
};

export default ShowContext;
