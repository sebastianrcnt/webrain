const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.getProjectsForUserEmail = async function (userEmail) {
  return await prisma.project.findMany({
    where: { Result: { some: { userEmail } } },
    include: { Result: true },
    orderBy: { name: "asc" },
  });
};