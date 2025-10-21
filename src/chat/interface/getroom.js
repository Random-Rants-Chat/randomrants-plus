var hash = window.location.hash;
var curRoom = null;
if (hash) {
  curRoom = hash.slice(1, hash.length);
  if (curRoom.length < 1) {
    curRoom = null;
  }
}
window.addEventListener("hashchange", () => {
  window.location.reload();
});

module.exports = curRoom;
