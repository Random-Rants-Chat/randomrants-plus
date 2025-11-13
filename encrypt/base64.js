function btoa(val) {
  return Buffer.from(val).toString('base64');
}
function atob(val) {
  return Buffer.from(val, 'base64').toString('ascii');
}
module.exports = {btoa,atob};
