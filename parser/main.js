const fs = require("fs");
const data = fs.readFileSync("./exp.txt", "utf-8");
const Parser = require("./parser.js");
const parser = new Parser(data);
console.log(parser.execute().json());
