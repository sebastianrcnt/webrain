const extract = require("extract-zip");
const respondWithError = require("../middlewares/error");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { transformDocument } = require("@prisma/client/runtime");
const prisma = new PrismaClient();
const fs = require("fs");
const Parser = require("../parser/parser.js");

const extractZip = (req) =>
  new Promise((resolve, reject) => {
    extract(req.file.path, { dir: path.resolve(req.file.destination) })
      .then((value) => {
        resolve(req);
      })
      .catch((err) => {
        console.log(err);
        throw {
          intended: true,
          message: "압축 파일(zip)을 푸는 데 실패하였습니다.",
        };
      });
  });

const parseJson = (req) => {
  try {
    const data = fs.readFileSync(
      // join(resolve(req.file.destination)),
      path.join(
        path.resolve(req.file.destination),
        path.parse(filename).name,
        "exp.txt"
      ),
      "utf-8"
    );
    const parser = new Parser(data);
    const result = parser.execute().json();
    req.parseResultJson = result;
    return Promise.resolve(req);
  } catch (err) {
    console.log(err);
    throw {
      intended: true,
      message: "파싱하는 과정에서 오류가 발생했습니다.",
    };
  }
};

const writeToDatabase = (req) => {
  prisma.experiment
    .create({
      data: {
        id: req.fileId,
        User: { connect: { email: req.user.email } },
        name: req.body.name,
        description: req.body.description,
        fileId: req.fileId,
        fileName: req.file.originalname,
        json: req.parseResultJson,
        tags: req.body.tags.trim(),
      },
    })
    .then((experiment) => {
      res.render("utils/message-with-link", {
        message: "생성이 완료되었습니다",
        link: "/admin/experiments",
        linkname: "실험 목록 페이지로 이동",
      });
    })
    .catch((err) => {
      console.log(err);
      res.render("utils/message", { message: "Error code 1213" });
    });
};

const createExperiment = async (req, res) => {
  const { fieldname, originalname, destination, filename } = req.file;
  console.log({
    fieldname,
    originalname,
    destination,
    filename,
  });

  extractZip(req)
    .then(parseJson)
    .then(writeToDatabase)
    .catch(respondWithError(res));
};

const ExperimentControllers = {
  createExperiment,
  middlewares: {
    parseJson,
    writeToDatabase,
  },
};

module.exports = ExperimentControllers;
