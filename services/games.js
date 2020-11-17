const { PrismaClient, Prisma__ProjectClient } = require("@prisma/client");

const prisma = new PrismaClient();

function isProjectCompleted(project) {
  // checks if a project is completed
  for (let result of project.Result) {
    if (result.json == "{}") return false;
  }
  return true;
}

exports.getProjectsForUserEmail = async function (userEmail) {
  return await prisma.project.findMany({
    where: { Result: { some: { userEmail } } },
    include: { Result: true },
    orderBy: { name: "asc" },
  });
};

// exports.tagAvailableProjects = function (projects) {
//   // i를 수행할 수 있는 가장 최신의 프로젝트 인덱스 - 1로 설정
//   // 가장 최신의 프로젝트는 아직 완료 안 된 첫번째 프로젝트일 것이다!
//   projects = Array.from(projects);
//   projects = projects.map((project) => {
//     const isCompleted = isProjectCompleted(project);
//     return { ...project, isCompleted };
//   });

//   if (projects[0]) {
//     // 한개라도 있으면
//     projects[0].isAvailable = true; // 첫놈은 가능해야하고

//     // 그 뒤엣놈들은 완료되면
//     for (let i = 1; i < projects.length; i++) {
//       if (isProjectCompleted(projects[i - 1])) {
//         projects[i].isAvailable = true;
//       } else {
//         projects[i].isAvailable = true;
//         break;
//       }
//     }
//   }

//   return projects;
// };