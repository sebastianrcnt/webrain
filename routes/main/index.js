const express = require("express");
const ResultsProvider = require("../../providers/results");
const ExperimentsProvider = require("../../providers/experiments");
const UserControllers = require("../../controllers/users");
const UsersService = require("../../services/users");
const respondWithError = require("../../middlewares/error");
const MainRouter = express.Router();
const RenderControllers = require("../../controllers/render");
const HomeProvider = require("../../providers/home");
const ProjectsProvider = require("../../providers/projects");
const UnitProjectsProvider = require("../../providers/unit-projects");
const { PublicRestrictor } = require("../../middlewares/filter-access");

// Routes
MainRouter.get(
  "/games",
  PublicRestrictor(),
  ResultsProvider.provideAll(),
  ExperimentsProvider.provideAll(),
  (req, res) => {
    res.render("main/pages/games", req.context);
  }
)
  .get(
    "/game/:id",
    PublicRestrictor(),
    ResultsProvider.provideOneById(),
    (req, res) => {
      res.render("main/pages/game-pre", req.context);
    }
  )
  .get(
    "/projects",
    PublicRestrictor(),
    ProjectsProvider.provideAll(),
    ResultsProvider.provideAll(),
    (req, res) => {
      res.render("main/pages/projects", req.context);
    }
  )
  .get(
    "/project/:id",
    PublicRestrictor(),
    ResultsProvider.provideAll(),
    (req, res) => {
      res.render("main/pages/project", {
        ...req.context,
        projectId: req.params.id,
      });
    }
  )
  .get(
    "/unit-projects",
    PublicRestrictor(),
    UnitProjectsProvider.provideAll(),
    ResultsProvider.provideAll(),
    (req, res) => {
      res.render("main/pages/unit-projects", req.context);
    }
  )
  .get(
    "/unit-project/:id",
    PublicRestrictor(),
    UnitProjectsProvider.provideOneById(),
    ProjectsProvider.provideAll(),
    ResultsProvider.provideAll(),
    RenderControllers.render("main/pages/unit-project")
  )
  .get("/login", (req, res) => {
    if (req.user) {
      res.redirect("/main/games");
    } else {
      res.render("main/pages/login", req.context);
    }
  })
  .get("/register", (req, res) => {
    if (req.user) {
      res.redirect("/main");
    } else {
      res.render("main/pages/register", req.context);
    }
  })
  .get("/logout", UserControllers.eraseTokenAndRedirectToMainLogin)
  .post("/register", (req, res) => {
    UsersService.createUser(req.body)
      .then((user) => {
        res.render("utils/message-with-link", {
          message: "회원가입이 완료되었습니다. 로그인하세요.",
          link: "/main/login",
          linkname: "로그인하기",
        });
      })
      .catch(respondWithError(res));
  })
  .post("/login", (req, res) => {
    const { email, password } = req.body;

    UsersService.verifyUser(email, password)
      .then((token) => {
        res.cookie("webrain-token", token);
        res.render("utils/message-with-link", {
          message: "정상적으로 로그인 되었습니다.",
          link: "/main",
          linkname: "메인페이지로 이동",
        });
      })
      .catch(respondWithError(res));
  });

MainRouter.get("/", HomeProvider, RenderControllers.render("main/pages/index"));
MainRouter.all("/", PublicRestrictor(), (req, res) => {
  res.redirect("/main/unit-projects");
});

module.exports = MainRouter;
