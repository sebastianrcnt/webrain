const express = require("express");
const AdminRouter = express.Router();
const { LevelRestrictor } = require("../../middlewares/filter-access");
const { RESEARCHER } = require("../../levels/levels");
const UserControllers = require("../../controllers/users");
const RenderControllers = require("../../controllers/render");
const ContextProviders = require("../../providers");
const multer = require("multer");
const ExperimentControllers = require("../../controllers/experiments");
const shortid = require("shortid");
const fs = require("fs");
const rimraf = require("rimraf");
const path = require("path");
const experimentZipUploader = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      req.fileId = shortid.generate();
      fs.mkdirSync("uploads/" + req.fileId);
      cb(null, "uploads/" + req.fileId);
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});

const generalUploader = multer({ dest: "uploads/" });

const respondWithError = require("../../middlewares/error");
const { PrismaClient } = require("@prisma/client");
const ProjectControllers = require("../../controllers/projects");
const HomeProvider = require("../../providers/home");
const sendNotification = require("../../services/emailNotification");
const UnitProjectsProvider = require("../../providers/unit-projects");
const ProjectsProvider = require("../../providers/projects");
const prisma = new PrismaClient();

// Pages
AdminRouter.get("/login", RenderControllers.render("admin/pages/login"))
  .get("/register", RenderControllers.render("admin/pages/register"))
  .get("/logout", UserControllers.eraseTokenAndRedirectToAdminLogin)
  .post(
    "/register",
    (req, res, next) => {
      console.log("register");
      prisma.user
        .findMany({ where: { level: { gte: 200 } } })
        .then(async (users) => {
          console.log(`sending emails to ${users.length} users...`);
          for (let user of users) {
            console.log(`sending email to ${user.email}`);
            await sendNotification(user.email);
            console.log(`sent email to ${user.email}`);
          }
          console.log("sent all emails");
        })
        .catch((error) => {
          console.error(error);
        });
      next();
    },
    UserControllers.createUser
  )
  .post("/login", UserControllers.loginAndSignToken);

AdminRouter.use(LevelRestrictor(100));
AdminRouter.get(
  "/users",
  ContextProviders.provideUsersContext(),
  RenderControllers.render("admin/pages/users")
)
  .get(
    "/users/:email",
    LevelRestrictor(200),
    ContextProviders.provideUserContextByEmail(),
    RenderControllers.render("admin/pages/user")
  )
  .post("/users/:email", LevelRestrictor(200), (req, res, next) => {
    prisma.user
      .update({
        where: { email: req.params.email },
        data: { ...req.body, level: +req.body.level },
      })
      .then((user) => {
        res.render("utils/message-with-link", {
          message: "성공적으로 수정되었습니다.",
          link: "/admin/users",
          linkname: "유저 목록으로 이동",
        });
      })
      .catch(respondWithError(res));
  });

AdminRouter.get(
  "/experiments",
  LevelRestrictor(RESEARCHER),
  ContextProviders.provideExperimentsContext(),
  RenderControllers.render("admin/pages/experiments")
)
  .get(
    "/experiments/new",
    LevelRestrictor(RESEARCHER),
    RenderControllers.render("admin/pages/experiment-new")
  )
  .get(
    "/experiments/:id",
    ContextProviders.provideExperimentContextById(),
    RenderControllers.render("admin/pages/experiment")
  )
  .post(
    "/experiments",
    experimentZipUploader.single("experiment-file"),
    ExperimentControllers.createExperiment
  )
  .post("/experiments/:id", generalUploader.single("cover"), (req, res) => {
    const { name, description, tags } = req.body;
    const coverFileId = req.file ? req.file.filename : null;
    prisma.experiment
      .update({
        where: { id: req.params.id },
        data: { name, description, tags, coverFileId },
      })
      .then((experiment) => {
        res.render("utils/message-with-link", {
          message: "실험이 성공적으로 저장되었습니다",
          link: "/admin/experiments",
          linkname: "실험 목록 페이지로 이동",
        });
      })
      .catch(respondWithError(res));
  })
  .delete("/experiments/:id", LevelRestrictor(100), (req, res, next) => {
    prisma.experiment
      .delete({ where: { id: req.params.id } })
      .then((experiment) => {
        rimraf(
          path.resolve(path.join("uploads", experiment.id)),
          async (error) => {
            if (error) {
              console.log(error);
              throw error;
            }
            res.status(200).json("성공적으로 삭제되었습니다");
          }
        );
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  });

AdminRouter.get(
  "/projects",
  ContextProviders.provideProjectsContext(),
  (req, res) => {
    res.render("admin/pages/projects", req.context);
  }
)
  .get("/projects/new", RenderControllers.render("admin/pages/project-new"))
  .get(
    "/projects/:id",
    ContextProviders.provideProjectContextById(),
    ContextProviders.provideExperimentsContext(),
    RenderControllers.render("admin/pages/project")
  )
  .post("/projects", ProjectControllers.createProject)
  .post(
    "/projects/:id",
    generalUploader.single("cover"),
    ContextProviders.provideProjectContextById(),
    (req, res) => {
      const coverFileId = req.file ? req.file.filename : null;
      console.log(req.body);
      const { name, description, agreement, public } = req.body;
      prisma.project
        .update({
          where: { id: req.params.id },
          data: { name, description, agreement, public: +public, coverFileId },
        })
        .then((project) => {
          res.render("utils/message-with-link", {
            message: "프로젝트가 성공적으로 저장되었습니다",
            link: "/admin/projects",
            linkname: "프로젝트 목록 페이지로 이동",
          });
        })
        .catch(respondWithError(res));
    }
  )
  .delete("/projects/:id", LevelRestrictor(100), (req, res, next) => {
    prisma.project
      .delete({ where: { id: req.params.id } })
      .then((project) => {
        res.status(200).json("성공적으로 삭제되었습니다");
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  });

AdminRouter.get(
  "/results",
  ContextProviders.provideResultsContext(),
  (req, res) => {
    res.render("admin/pages/results", req.context);
  }
)
  .get(
    "/results/new",
    ContextProviders.provideUsersContext(),
    ContextProviders.provideProjectsContext(),
    ContextProviders.provideExperimentsContext(),
    (req, res) => {
      res.render("admin/pages/result-new", req.context);
    }
  )
  .delete("/results/:id", (req, res) => {
    prisma.result
      .delete({ where: { id: req.params.id } })
      .then((result) => {
        res.status(200).json("성공적으로 삭제되었습니다");
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  })
  .post("/results", async (req, res) => {
    console.log(req.body);
    const { user, project } = req.body;
    try {
      const targetProject = await prisma.project.findOne({
        where: { id: project },
        include: { Experiment: true },
      });

      let queue = targetProject.Experiment.map((experiment) => {
        return prisma.result.create({
          data: {
            id: shortid.generate(),
            User: { connect: { email: user } },
            Project: { connect: { id: project } },
            Experiment: { connect: { id: experiment.id } },
          },
        });
      });

      await Promise.all(queue);
      res.render("utils/message-with-link", {
        message: "성공적으로 생성했습니다",
        link: "/admin/results",
        linkname: "게임생성/결과 페이지로 이동하기",
      });
    } catch (e) {
      console.log(e);
      res.render("utils/message-with-link", {
        message: "생성에 실패했습니다",
        link: "/admin/results",
        linkname: "게임생성/결과 페이지로 이동하기",
      });
    }
  });

AdminRouter.get(
  "/unit-projects",
  UnitProjectsProvider.provideAll(),
  RenderControllers.render("admin/pages/unit-projects")
)
  .get(
    "/unit-project/:id",
    UnitProjectsProvider.provideOneById(),
    ProjectsProvider.provideAll(),
    RenderControllers.render("admin/pages/unit-project")
  )
  .get(
    "/unit-projects/new",
    RenderControllers.render("admin/pages/unit-projects-new")
  )
  .post(
    "/unit-projects/new",
    generalUploader.single("cover"),
    (req, res, next) => {
      const { name, description } = req.body;
      const id = req.params.id;
      const coverFileId = req.file ? req.file.filename : null;
      if (id && name && description) {
        prisma.unitProject
          .create({
            data: {
              id: shortid.generate(),
              name,
              description,
              coverFileId,
            },
          })
          .then(() => {
            res.redirect(`/admin/unit-project/${id}`);
          })
          .catch(respondWithError());
      } else {
        res.status(400).send();
      }
    }
  )
  .post(
    "/unit-project/:id",
    generalUploader.single("cover"),
    (req, res, next) => {
      const { name, description } = req.body;
      const id = req.params.id;
      const coverFileId = req.file ? req.file.filename : null;
      if (id && name && description) {
        prisma.unitProject
          .update({
            where: {
              id,
            },
            data: {
              name,
              description,
              coverFileId,
            },
          })
          .then(() => {
            res.redirect(`/admin/unit-project/${id}`);
          })
          .catch(respondWithError());
      } else {
        res.status(400).send();
      }
    }
  );
AdminRouter.get(
  "/edit",
  HomeProvider,
  RenderControllers.render("admin/pages/edit-home")
);
AdminRouter.all("/", async (req, res) => {
  res.redirect("/admin/projects");
});

module.exports = AdminRouter;
