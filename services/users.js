const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");

const verifyUser = (email, password) => {
  const checkExists = (user) => {
    if (user) {
      return Promise.resolve(user);
    } else {
      throw {
        intended: true,
        message: "해당 이메일에 대한 유저를 찾지 못했습니다.",
      };
    }
  };

  const checkPassword = (user, password) => {
    if (user.password === password) {
      return Promise.resolve(user);
    } else {
      throw {
        intended: true,
        message: "해당 이메일은 존재하나 비밀번호가 일치하지 않습니다.",
      };
    }
  };

  const signToken = (user) => {
    const token = jwt.sign({ email: user.email }, "secret", {
      expiresIn: "1d",
    });
    return Promise.resolve(token);
  };

  return prisma.user
    .findOne({ where: { email } })
    .then(checkExists)
    .then((user) => checkPassword(user, password))
    .then(signToken);
};

const createUser = async (user) => {
  const checkIfConfirmationPasswordMatch = (user) => {
    if (user.password !== user.password2) {
      throw {
        intended: true,
        message: "확인 비밀번호가 일치하지 않습니다.",
      };
    } else {
      return Promise.resolve(user);
    }
  };

  const checkIfEmailExists = async (user) => {
    const found = await prisma.user.findOne({ where: { email: user.email } });
    if (found) {
      throw {
        intended: true,
        message: "이미 사용된 이메일입니다",
      };
    } else {
      return Promise.resolve(user);
    }
  };

  const writeUserToDatabase = async ({ email, name, phone, password }) => {
    await prisma.user.create({
      data: {
        email,
        name,
        phone,
        password,
      },
    });
  };

  return checkIfConfirmationPasswordMatch(user)
    .then(checkIfEmailExists)
    .then(writeUserToDatabase);
};

const UsersService = {
  verifyUser,
  createUser,
};

module.exports = UsersService;
