const extract = require("extract-zip");
const respondWithError = require("../middlewares/error");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { transformDocument } = require("@prisma/client/runtime");
const prisma = new PrismaClient();
const fs = require("fs");
const Parser = require("../parser/parser.js");

exports.createExperiment = async (req, res, next) => {
  const coverFile = req.files['cover'][0];
  const zipFile = req.files['zip'][0];

  try {
    // extract
    await extract(zipFile.path, {
      dir: path.resolve(zipFile.destination),
    });

    // read data
    const data = fs.readFileSync(
      path.join(
        path.resolve(zipFile.destination), // /uploads
        path.parse(zipFile.originalname).name, // name = 1_lake_nback_i
        "exp.txt"
      ),
      "utf-8"
    );

    // parse data
    const parser = new Parser(data);
    const result = parser.execute().json();
    req.parseResultJson = result;
  } catch (error) {
    next({
      intended: true,
      message: "파싱하는 과정에서 오류가 발생했습니다.",
      error,
    });
    return;
  }

  // write to database
  try {
    await prisma.experiment.create({
      data: {
        id: zipFile.filename,
        User: { connect: { email: req.user.email } },
        name: req.body.name,
        description: req.body.description,
        fileId: zipFile.filename, // filename = upload id..
        fileName: zipFile.originalname,
        coverFileId: coverFile.filename,
        json: req.parseResultJson,
        tags: req.body.tags.trim(),
      },
    });
  } catch (error) {
    next(error);
    return;
  }

  res.render("utils/message-with-link", {
    message: "생성이 완료되었습니다",
    link: "/admin/experiments",
    linkname: "실험 목록 페이지로 이동",
  });
};

exports.updateExperiment = async (req, res, next) => {
  const { name, description, tags } = req.body;
  const coverFileId = zipFile ? req.file.filename : null;
  try {
    await prisma.experiment.update({
      where: { id: req.params.id },
      data: { name, description, tags, coverFileId },
    });
    res.render("utils/message-with-link", {
      message: "실험이 성공적으로 저장되었습니다",
      link: "/admin/experiments",
      linkname: "실험 목록 페이지로 이동",
    });
  } catch (error) {
    next(error);
  }
};
/*
  req.files looks like:
  {
    coverFile: {
      fieldname: 'cover',
      originalname: '물풍선.png',
      encoding: '7bit',
      mimetype: 'image/png',
      destination: 'uploads/',
      filename: '841d2d24601cddd9838b4b62fef94c00',
      path: 'uploads/841d2d24601cddd9838b4b62fef94c00',
      size: 37012
    },
    zipFile: {
      fieldname: 'zip',
      originalname: '1_lake_nback_i.zip',
      encoding: '7bit',
      mimetype: 'application/zip',
      destination: 'uploads/',
      filename: '1dd9bb0b2ae332d0f26cec0aa0302d5d',
      path: 'uploads/1dd9bb0b2ae332d0f26cec0aa0302d5d',
      size: 5928993
    }
  }

  file structure:
  uploads
  ├── 1_lake_nback_i
  ├── 1dd9bb0b2ae332d0f26cec0aa0302d5d
  └── 841d2d24601cddd9838b4b62fef94c00
  */

// const extractZip = (req) =>
//   new Promise((resolve, reject) => {
//     extract(req.file.path, { dir: path.resolve(req.file.destination) })
//       .then((value) => {
//         resolve(req);
//       })
//       .catch((err) => {
//         console.log(err);
//         throw {
//           intended: true,
//           message: "압축 파일(zip)을 푸는 데 실패하였습니다.",
//         };
//       });
//   });

// const parseJson = (req) => {
//   try {
//     const data = fs.readFileSync(
//       path.join(
//         path.resolve(req.file.destination),
//         path.parse(filename).name,
//         "exp.txt"
//       ),
//       "utf-8"
//     );
//     const parser = new Parser(data);
//     const result = parser.execute().json();
//     req.parseResultJson = result;
//     return Promise.resolve(req);
//   } catch (err) {
//     console.log(err);
//     throw {
//       intended: true,
//       message: "파싱하는 과정에서 오류가 발생했습니다.",
//     };
//   }
// };

// const writeToDatabase = (req) => {
//   prisma.experiment
//     .create({
//       data: {
//         id: req.fileId,
//         User: { connect: { email: req.user.email } },
//         name: req.body.name,
//         description: req.body.description,
//         fileId: req.fileId,
//         fileName: req.file.originalname,
//         json: req.parseResultJson,
//         tags: req.body.tags.trim(),
//       },
//     })
//     .then((experiment) => {
//       res.render("utils/message-with-link", {
//         message: "생성이 완료되었습니다",
//         link: "/admin/experiments",
//         linkname: "실험 목록 페이지로 이동",
//       });
//     })
//     .catch((err) => {
//       console.log(err);
//       res.render("utils/message", { message: "Error code 1213" });
//     });
// };

// const createExperiment = async (req, res) => {
//   const { fieldname, originalname, destination, filename } = req.file;
//   console.log({
//     fieldname,
//     originalname,
//     destination,
//     filename,
//   });

//   extractZip(req)
//     .then(parseJson)
//     .then(writeToDatabase)
//     .catch(respondWithError(res));
// };

// const ExperimentControllers = {
//   createExperiment,
//   middlewares: {
//     parseJson,
//     writeToDatabase,
//   },
// };

// module.exports = ExperimentControllers;
