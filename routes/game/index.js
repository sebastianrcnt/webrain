const { PrismaClient } = require("@prisma/client");
const respondWithError = require("../../middlewares/error");
const prisma = new PrismaClient();

const express = require("express");
const GameRouter = express.Router();

// Routes
GameRouter.get("/:id", (req, res) => {
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
        res.render("game/pages/game", { game: result });
      } else {
        throw {
          intended: true,
          message: "게임을 찾을 수 없습니다",
        };
      }
    })
    .catch(respondWithError);
});

module.exports = GameRouter;
