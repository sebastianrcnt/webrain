const multer = require("multer");
const shortid = require("shortid");
const fs = require("fs");

// exports.zipUploader = multer({
//   storage: multer.diskStorage({
//     destination: function (req, file, cb) {
//       req.fileId = shortid.generate();
//       fs.mkdirSync("uploads/zip/" + req.fileId);
//       cb(null, "uploads/zip/" + req.fileId);
//     },
//     filename: function (req, file, cb) {
//       cb(null, file.originalname);
//     },
//   }),
// });

exports.uploader = multer({ dest: "uploads/" });
