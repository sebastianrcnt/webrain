const respondWithError = require("../middlewares/error");
const { PrismaClient } = require("@prisma/client");
const shortid = require("shortid");
const prisma = new PrismaClient();

const createProject = async (req, res) => {
  const { name, description, agreement } = req.body;
  if (name && description && agreement) {
    prisma.project
      .create({
        data: {
          id: shortid.generate(),
          name,
          description,
          agreement,
          User: { connect: { email: req.user.email } },
        },
      })
      .then((project) => {
        res.render("utils/message-with-link", {
          message: "프로젝트가 성공적으로 생성되었습니다",
          link: "/admin/projects",
          linkname: "프로젝트 목록 페이지로 이동",
        });
      })
      .catch(respondWithError(res));
  } else {
    res.status(400).send();
  }
};

const ProjectControllers = { createProject };

module.exports = ProjectControllers;
