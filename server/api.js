/* eslint-disable indent */
/* eslint-disable linebreak-style */

import { Router } from "express";
import * as admin from "firebase-admin";
import { Connection } from "./db";

if (!process.env.DATABASE_URL) {
  const serviceAccount = require("./ServiceAccount.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://q-and-a-342c1.firebaseio.com",
  });
} else {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(
        Buffer.from(
          process.env.GOOGLE_APPLICATION_CREDENTIALS,
          "base64"
        ).toString("ascii")
      )
    ),
    databaseURL: "https://q-and-a-342c1.firebaseio.com",
  });
}

const router = new Router();

router.get("/", (_, res, next) => {
  Connection.connect((err) => {
    if (err) {
      return next(err);
    }
    res.status(200).json({ message: "Hello, Team!" });
  });
});

router.get("/questions", (_, res, next) => {
  Connection.query(
    "select * from questions order by id DESC",
    (err, result) => {
      if (err) {
        return next(err);
      }
      res.status(200).json(result.rows);
    }
  );
});

router.get("/comments/:id", (req, res, next) => {
  if (req.params.id) {
    const questionId = parseInt(req.params.id);
    Connection.query(
      "select * from comments where question_id = $1 order by id DESC",
      [questionId],
      (err, result) => {
        if (err) {
          return next(err);
        }
        res.status(200).json(result.rows);
      }
    );
  }
});

router.post("/question", (req, res, next) => {
  let title = req.body.title,
    context = req.body.context,
    email = req.body.email,
    token = req.body.token;
  console.log(token);
  admin
    .auth()
    .verifyIdToken(token)
    .then(() => {
      let sql =
        "insert into questions (title, context,email)" +
        "values ($1,$2,$3) returning id";
      Connection.query(sql, [title, context, email], (err, result) => {
        if (err) {
          return next(err);
        }
        res.status(200).json(result.rows);
      });
    })
    .catch(() => res.send({ message: "Could not authorize" }).status(403));
});

router.post("/comment", (req, res, next) => {
  let questionId = req.body.questionId,
    comment = req.body.comment,
    email = req.body.email,
    token = req.body.token;

  admin
    .auth()
    .verifyIdToken(token)
    .then(() => {
      let sql =
        "insert into comments (question_id, comment,email)" +
        "values ($1,$2,$3) returning id";
      Connection.query(sql, [questionId, comment, email], (err, result) => {
        if (err) {
          return next(err);
        }
        res.status(200).json(result.rows);
      });
    })
    .catch(() => res.send({ message: "Could not authorize" }).status(403));
});

router.post("/newuser", (req, res, next) => {
  let userId = req.body.userId,
    email = req.body.email;
  let checksql = "select * from users where userid = $1";
  let insertsql =
    "insert into users (userid, email)" + "values ($1,$2) returning *";
  Connection.query(checksql, [userId])
    .then((result) => {
      if (result.rowCount > 0) {
        return result;
      } else {
        return Connection.query(insertsql, [userId, email]);
      }
    })
    .then((result) => res.status(200).json(result.rows))
    .catch((e) => {
      console.log(e.stack);
      next(e);
    });
});

router.put("/question", (req, res, next) => {
  let questionId = req.body.id,
    title = req.body.title,
    context = req.body.context,
    email = req.body.email,
    token = req.body.token;
  let checksql = "select * from questions where id = $1";
  let updatesql =
    "update questions set title=$1,context=$2 where id =$3 returning *";
  admin
    .auth()
    .verifyIdToken(token)
    .then(() => {
      return Connection.query(checksql, [questionId]).then((result) => {
        if (result.rowCount > 0) {
          if (result.rows[0].email !== email) {
            return "You are not the author of this question!";
          }
          return Connection.query(updatesql, [title, context, questionId]);
        } else {
          return null;
        }
      });
    })
    .then((result) => {
      result
        ? result.rows
          ? res.status(200).json(result.rows)
          : res.status(200).json({ message: result })
        : res.status(404).json({ message: "There is no such question!" });
    })
    .catch((e) => {
      if (e) {
        console.log(e.stack);
        next(e);
      } else {
        res.send({ message: "Could not authorize" }).status(403);
      }
    });
});

router.put("/comment", (req, res, next) => {
  let commentId = req.body.id,
    comment = req.body.comment,
    email = req.body.email,
    token = req.body.token;
  let checksql = "select * from comments where id = $1";
  let updatesql = "update comments set comment=$1 where id =$2 returning *";
  admin
    .auth()
    .verifyIdToken(token)
    .then(() => {
      return Connection.query(checksql, [commentId]).then((result) => {
        if (result.rowCount > 0) {
          if (result.rows[0].email !== email) {
            return "You are not the Author of this comment!";
          }
          return Connection.query(updatesql, [comment, commentId]);
        } else {
          return null;
        }
      });
    })
    .then((result) => {
      result
        ? result.rows
          ? res.status(200).json(result.rows)
          : res.status(200).json({ message: result })
        : res.status(404).json({ message: "There is no such comment!" });
    })
    .catch((e) => {
      if (e) {
        console.log(e.stack);
        next(e);
      } else {
        res.send({ message: "Could not authorize" }).status(403);
      }
    });
});

router.delete("/comment", (req, res, next) => {
  let commentId = req.body.id,
    email = req.body.email,
    token = req.body.token;
  let checksql = "select * from comments where id = $1";
  let deletesql = "delete from comments where id =$1 returning id";
  admin
    .auth()
    .verifyIdToken(token)
    .then(() => {
      return Connection.query(checksql, [commentId]).then((result) => {
        if (result.rowCount > 0) {
          if (result.rows[0].email !== email) {
            return "You are not the author of this comment!";
          }
          return Connection.query(deletesql, [commentId]);
        } else {
          return null;
        }
      });
    })
    .then((result) => {
      result
        ? result.rows
          ? res.status(200).json(result.rows)
          : res.status(200).json({ message: result })
        : res.status(404).json({ message: "There is no such comment!" });
    })
    .catch((e) => {
      if (e) {
        console.log(e.stack);
        next(e);
      } else {
        res.send({ message: "Could not authorize" }).status(403);
      }
    });
});

router.delete("/question", (req, res, next) => {
  let questionId = req.body.id,
    email = req.body.email,
    token = req.body.token;
  let checksql = "select * from questions where id = $1";
  let deletesql = "delete from questions where id =$1 returning id";
  admin
    .auth()
    .verifyIdToken(token)
    .then(() => {
      return Connection.query(checksql, [questionId]).then((result) => {
        if (result.rowCount > 0) {
          if (result.rows[0].email !== email) {
            return "You are not the author of this question!";
          }
          return Connection.query(deletesql, [questionId]);
        } else {
          return null;
        }
      });
    })
    .then((result) => {
      result
        ? result.rows
          ? res.status(200).json(result.rows)
          : res.status(200).json({ message: result })
        : res.status(404).json({ message: "There is no such question!" });
    })
    .catch((e) => {
      if (e) {
        console.log(e.stack);
        next(e);
      } else {
        res.send({ message: "Could not authorize" }).status(403);
      }
    });
});
export default router;
