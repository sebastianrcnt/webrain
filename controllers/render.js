const render = (template) => (req, res) => {
  res.render(template, req.context);
};

const RenderControllers = {
  render,
};

module.exports = RenderControllers;
