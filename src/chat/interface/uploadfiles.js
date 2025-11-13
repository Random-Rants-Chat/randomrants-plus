var accountHelper = require("../../accounthelper");

async function uploadFileAsURL(blob) {
  try {
    const formData = new FormData();
    formData.append("file", blob, blob.name); // Append the file as "file" field
    var fileurl = accountHelper.getServerURL() + "/uploads/" + "file";
    var a = await fetch(fileurl, { method: "POST", body: formData });
    var b = await a.json();
    return `${fileurl}/${b.id}/${encodeURIComponent(blob.name)}`;
  } catch (e) {
    return "";
  }
}

module.exports = uploadFileAsURL;
