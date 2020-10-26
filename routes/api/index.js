const express = require("express");
const ApiRouter = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const respondWithError = require("../../middlewares/error");
const fs = require("fs");
const path = require("path");
const sendNotification = require("../../services/emailNotification");

ApiRouter.get("/login", async (req, res) => {
  const { email, password } = req.query;

  if (email && password) {
    prisma.user.findOne({ where: { email } }).then((found) => {
      if (found) {
        if (found.password === password) {
          const token = jwt.sign(
            {
              email,
            },
            "secret",
            { expiresIn: "1d" }
          );

          req.cookie("webrain-token", token);
          res.status(200).json(token);
        } else {
          res.status(401).send("wrong password");
        }
      } else {
        res.status(404).send("No user find with the email");
      }
    });
  } else {
    res.status(400).send("Email and Password is not provided");
  }
});

ApiRouter.get("/process/connect-experiment-to-project", (req, res) => {
  const { projectId, experimentId } = req.query;
  if (projectId && experimentId) {
    prisma.project
      .update({
        where: { id: projectId },
        data: {
          Experiment: {
            connect: [{ id: experimentId }],
          },
        },
      })
      .then((success) => {
        res.status(200).send("success");
      })
      .catch(respondWithError(res));
  } else {
    res.status(400).send();
  }
});

ApiRouter.get("/process/disconnect-experiment-to-project", (req, res) => {
  const { projectId, experimentId } = req.query;
  if (projectId && experimentId) {
    prisma.project
      .update({
        where: { id: projectId },
        data: {
          Experiment: {
            disconnect: [{ id: experimentId }],
          },
        },
      })
      .then((success) => {
        res.status(200).send("success");
      })
      .catch(respondWithError(res));
  } else {
    res.status(400).send();
  }
});

ApiRouter.get("/process/connect-project-to-unit-project", (req, res) => {
  const { projectId, unitProjectId } = req.query;
  if (projectId && unitProjectId) {
    prisma.unitProject
      .update({
        where: { id: unitProjectId },
        data: {
          Project: {
            connect: [{ id: projectId }],
          },
        },
      })
      .then((success) => {
        res.status(200).send("success");
      })
      .catch(respondWithError(res));
  } else {
    res.status(400).send();
  }
});

ApiRouter.get("/process/disconnect-project-to-unit-project", (req, res) => {
  const { projectId, unitProjectId } = req.query;
  if (projectId && unitProjectId) {
    prisma.unitProject
      .update({
        where: { id: unitProjectId },
        data: {
          Project: {
            disconnect: [{ id: projectId }],
          },
        },
      })
      .then((success) => {
        res.status(200).send("success");
      })
      .catch(respondWithError(res));
  } else {
    res.status(400).send();
  }
});

ApiRouter.post("/process/edit-home", (req, res) => {
  const data = unescape(req.body.html).trim();
  console.log(data);
  fs.writeFileSync("html/home.html", data, { encoding: "utf-8" });
  res.status(200).send();
});

ApiRouter.get("/game/:id", (req, res) => {
  const { id } = req.params;
  prisma.result
    .findOne({
      where: { id },
      include: {
        Experiment: true,
        Project: true,
        User: true,
      },
    })
    .then((result) => {
      if (result) {
        res.json(JSON.parse(result.Experiment.json));
      } else {
        throw {
          intended: true,
          message: "게임을 찾을 수 없습니다",
        };
      }
    })
    .catch(respondWithError(res));
});

ApiRouter.post("/game/:id", (req, res) => {
  const { id } = req.params;
  const { resultJson } = req.body;
  if (id && resultJson) {
    prisma.result
      .update({ where: { id }, data: { json: resultJson } })
      .then((result) => {
        res.status(200).send();
      })
      .catch(respondWithError(res));
  } else {
    res.status(400).send();
  }
});

ApiRouter.get("/download/game/:id", (req, res) => {
  const { id } = req.params;
  prisma.result
    .findOne({
      where: { id },
    })
    .then((result) => {
      fs.writeFileSync(
        `json/result.json`,
        JSON.stringify(JSON.parse(result.json), null, 4)
      );
      res.download(path.resolve("json/result.json"));
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(404);
    });
});

ApiRouter.post("/email", (req, res) => {
  if (!req.body.email) {
    res.sendStatus(400);
  } else {
    sendNotification(req.body.email)
      .then((result) => {
        res.json({ success: true, result });
      })
      .catch((err) => {
        res.status(500).json({ success: false, reason: err, result });
      });
  }
});

const multer = require("multer");
const rimraf = require("rimraf");
const extract = require("extract-zip");

const experimentZipUploader = multer({
  dest: "uploads/etc/",
}).single("zip");

// const identifyExperiment = (req, res, next) => {
//   // first, check if experiment exists.
//   // PUT /api/alter-experiment-file?experimentId=sb0xQwo6_
//   prisma.experiment
//     .findOne({ where: { id: req.query.experimentId } })
//     .then((experiment) => {
//       if (experiment) {
//         req.fileId = experiment.fileId
//         next()
//       } else {
//         res.status(404).send()
//       }
//     })
//     .catch(respondWithError(res))
// }

ApiRouter.post("/alter-experiment-file", experimentZipUploader, (req, res) => {
  console.log(req.file);
  // console.log(Object.keys(req));
  res.send("test 1");
});

module.exports = ApiRouter;
