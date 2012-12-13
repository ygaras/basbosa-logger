var RequireJs = require('requirejs');
var build = {
  baseUrl: ".",
  name: "index",
  out: "basbosa-logger-min.js"
}
RequireJs.optimize(build, function(buildResponse) {
  console.log(buildResponse);
});