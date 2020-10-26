const { PrismaClient } = require("@prisma/client");

const respondWithError = require("../middlewares/error");
const prisma = new PrismaClient();

exports.provideUsersContext = () => async (req, res, next) => {
  prisma.user
    .findMany({ where: {} })
    .then((users) => {
      req.context.users = users;
      next();
    })
    .catch(respondWithError(res));
};

exports.provideUserContextByEmail = () => async (req, res, next) => {
  prisma.user
    .findOne({ where: { email: req.params.email } })
    .then((user) => {
      if (user) {
        req.context.user = user;
        next();
      } else {
        res.render("utils/message-with-link", {
          message: "존재하지 않거나 삭제된 유저입니다",
          link: "javascript:history.back()",
          linkname: "뒤로가기",
        });
      }
    })
    .catch(respondWithError(res));
};

exports.provideExperimentsContext = () => async (req, res, next) => {
  prisma.experiment
    .findMany({ where: {}, include: { User: true } })
    .then((experiments) => {
      req.context.experiments = experiments;
      next();
    })
    .catch(respondWithError(res));
};

exports.provideExperimentContextById = () => async (req, res, next) => {
  prisma.experiment
    .findOne({
      where: { id: req.params.id },
    })
    .then((experiment) => {
      if (experiment) {
        req.context.experiment = experiment;
        next();
      } else {
        res.render("utils/message", {
          message: "존재하지 않거나 삭제된 실험입니다.",
          link: "javascript:history.back()",
          linkname: "뒤로가기",
        });
      }
    })
    .catch(respondWithError(res));
};

exports.provideProjectsContext = () => async (req, res, next) => {
  prisma.project
    .findMany({ include: { User: true } })
    .then((projects) => {
      req.context.projects = projects;
      next();
    })
    .catch(respondWithError(res));
};

exports.provideProjectContextById = () => async (req, res, next) => {
  prisma.project
    .findOne({
      where: { id: req.params.id },
      include: {
        User: true,
        Result: true,
        Experiment: { include: { User: true } },
      },
    })
    .then((project) => {
      req.context.project = project;
      next();
    })
    .catch(respondWithError(res));
};

exports.provideResultsContext = () => async (req, res, next) => {
  prisma.result
    .findMany({ include: { User: true, Project: true, Experiment: true } })
    .then((results) => {
      req.context.results = results;
      next();
    })
    .catch(respondWithError(res));
};
