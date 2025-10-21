const Storage = require("./storage.js");

const storage = new Storage(
  process.env.sbBucket,
  process.env.sbURL,
  process.env.sbAPIKey,
);

(async () => {
  await storage.uploadFile("hello.txt", Buffer.from("hi there"), "text/plain");
  const file = await storage.downloadFile("hello.txt");
  console.log(file.toString());

  await storage.deleteFile("hello.txt");
})();
