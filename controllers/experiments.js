const extract = require("extract-zip");
const respondWithError = require("../middlewares/error");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { transformDocument } = require("@prisma/client/runtime");
const prisma = new PrismaClient();
const fs = require("fs");
const Parser = require("../parser/parser.js");

exports.createExperiment = async (req, res, next) => {
  const coverFile = req.files["cover"][0];
  const zipFile = req.files["zip"][0];

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

  const coverFile = req.files["cover"] ? req.files["cover"][0] : null;
  const zipFile = req.files["zip"] ? req.files["zip"][0] : null;

  // if we need to update zipFile, do the work
  // read data
  if (zipFile) {
    try {
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
  }
  try {
    let nextExperiment = {
      name,
      description,
      tags,
    };
    if (coverFile) {
      nextExperiment["coverFileId"] = coverFile.filename;
    }
    if (zipFile) {
      nextExperiment = {
        ...nextExperiment,
        fileId: zipFile.filename, // filename = upload id..
        fileName: zipFile.originalname,
        json: req.parseResultJson,
      };
    }
    await prisma.experiment.update({
      where: { id: req.params.id },
      data: nextExperiment,
    });
    res.render("utils/message-with-link", {
      message: "실험이 성공적으로 저장되었습니다",
      link: "/admin/experiments",
      linkname: "실험 목록 페이지로 이동",
    });
  } catch (error) {
    next({
      intended: true,
      message: "데이터베이스 저장 중에 문제가 발생했습니다.",
      error,
    });
    return;
  }
};
