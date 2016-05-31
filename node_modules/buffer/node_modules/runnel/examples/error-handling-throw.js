var runnel = require('..');

/*
 * There is no way for runnel to handle errors thrown inside async functions
 * Therefore always call back with an error instead of throwing one.
 * In cases where this happens accidentally like below, the error will eventually bubble up.
 * This will cause your app to blow up unless you are using domains: http://nodejs.org/api/domain.html or
 * registered a process.on('uncaughtException') handler.
 *
 * A better way to deal with this is to wrap risky code in a try catch block and 
 * call back with the error if one is thrown as demonstrated in error-handling-callback.js
 */
function throwsError (cb) {
  setTimeout(
      function () { 
        console.log('bad culprit', culprit); 
        cb(null, 'yay');
      }
    , 20);
}

runnel(throwsError, function (err, res) {
  console.log('we\'ll never get here to print ', res);
});

