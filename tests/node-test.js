function failed(msg, e) {
  console.log('Failed: '+ msg, e);
  process.exit();
}

function passed(msg) {
  console.log('Passed: ' + msg);
}

try {
  var l = require('../index.js');
} catch(e) {
  failed('In loading', e);
}
passed('Loading module');

l.warn('A test warning');
