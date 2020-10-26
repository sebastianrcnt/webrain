const { PrismaClient } = require("@prisma/client");
const respondWithError = require("../middlewares/error");
const { transformDocument } = require("@prisma/client/runtime");
const prisma = new PrismaClient();

const provideAll = () => async (req, res, next) => {
  prisma.result
    .findMany({ include: { User: true, Project: true, Experiment: true } })
    .then((results) => {
      req.context.results = results;
      next();
    })
    .catch(respondWithError(res));
};

const provideOneById = () => async (req, res, next) => {
  prisma.result
    .findOne({
      where: { id: req.params.id },
      include: { User: true, Project: true, Experiment: true },
    })
    .then((result) => {
      if (result) {
        req.context.result = result;
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

const ResultsProvider = {
  provideAll,
  provideOneById,
};

module.exports = ResultsProvider;
