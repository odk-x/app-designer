var runnel = require('..');

/*
 * Demonstrates the correct way of handling errors in nodejs in general and thus also with runnel.
 * E.g., catch them and invoke the callback with the caught error.
 * This allows runnel to react properly, stop the call chain and call back the  
 * last function in the chain with the error.
 */
function callsBackWithError(cb) {
  setTimeout(
      function () { 
        try {
          console.log('bad culprit', culprit); 
          cb(null, 'yay');
        } catch(err) {
          cb(err);
        }
      }
    , 20);
}

function willNotBeCalled (yay, cb) {
  console.log('See, this never prints: ', yay);
  cb(null, yay);
}

runnel(
    callsBackWithError
  , willNotBeCalled
  , function (err, res) {
      if (err) {
        console.log('we\'ll get here to print the error', err);
        return;
      } else {
        console.log('we\'ll get here once the code was fixed to print', res);
      }
    }
);
