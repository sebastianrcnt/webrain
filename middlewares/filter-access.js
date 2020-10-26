const PublicRestrictor = () => (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.render("utils/message-with-link", {
      message: "허가되지 않은 접근입니다.",
      link: "javascript:history.back()",
      linkname: "뒤로가기",
    });
  }
};

// 100 and over => researcher
// 200 and over => admin

const LevelRestrictor = (level) => (req, res, next) => {
  if (req.user && req.user.level >= level) {
    next();
  } else {
    res.render("utils/message-with-link", {
      message: "허가되지 않은 접근입니다.",
      link: "javascript:history.back()",
      linkname: "뒤로가기",
    });
  }
};

module.exports = {
  LevelRestrictor,
  PublicRestrictor,
};
// usage app.use(LevelResctrictor(100));
