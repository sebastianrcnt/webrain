const { PrismaClient } = require("@prisma/client");
const respondWithError = require("../middlewares/error");
const prisma = new PrismaClient();

const provideAll = () => async (req, res, next) => {
  prisma.unitProject
    .findMany({ include: { Project: true } })
    .then((unitProjects) => {
      req.context.unitProjects = unitProjects;
      next();
    })
    .catch(respondWithError(res));
};

const provideOneById = () => async (req, res, next) => {
  prisma.unitProject
    .findOne({
      where: { id: req.params.id },
      include: { Project: true },
    })
    .then((unitProject) => {
      if (unitProject) {
        req.context.unitProject = unitProject;
        next();
      } else {
        throw {
          intended: true,
          message: "존재하지 않는 단위프로젝트입니다.",
        };
      }
    })
    .catch(respondWithError(res));
};

const UnitProjectsProvider = {
  provideAll,
  provideOneById,
};

module.exports = UnitProjectsProvider;
