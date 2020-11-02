const { PrismaClient, Prisma__ProjectClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.isProjectCompleted = function(project) {
  // checks if a project is completed
  for (let result of project.Result) {
    if (result.json == "{}") return false;
  }
  return true;
}

exports.getAvailableProjects = async function(userEmail) {
  let projects = await prisma.project.findMany({
    where: { userEmail },
    include: { Result: true },
  });
  projects = projects.filter(exports.isProjectCompleted);
  return projects;
}

// getAvailableGames("admin@monet.com").then((projects) => {
//   console.log(projects);
// });
