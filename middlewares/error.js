const respondWithError = (res) => (error) => {
  if (error.intended) {
    res.status(401).render("utils/message", {
      message: error.message,
    });
  } else {
    console.error(error);
    res.status(500).render("error", {
      message: "알 수 없는 오류가 발생했습니다.",
      error,
    });
  }
};

module.exports = respondWithError;
