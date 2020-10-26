const { PrismaClient } = require("@prisma/client");
const respondWithError = require("../middlewares/error");
const prisma = new PrismaClient();

const provideAll = () => async (req, res, next) => {
  prisma.project
    .findMany({ include: { User: true, Result: true, Experiment: true } })
    .then((projects) => {
      req.context.projects = projects;
      next();
    })
    .catch(respondWithError(res));
};

const provideOneById = () => async (req, res, next) => {
  prisma.project
    .findOne({
      where: { id: req.params.id },
      include: { User: true, Result: true, Experiment: true },
    })
    .then((project) => {
      if (project) {
        req.context.project = project;
        next();
      } else {
        throw {
          intended: true,
          message: "존재하지 않는 게임입니다",
        };
      }
    })
    .catch(respondWithError(res));
};

const ProjectsProvider = {
  provideAll,
  provideOneById,
};

module.exports = ProjectsProvider;
