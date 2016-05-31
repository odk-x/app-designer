var runnel = require('..');

function uno (cb) {
  setTimeout(function () { cb(null, 'eins'); } , 100);
}

function dos (resuno, cb) {
  setTimeout(function () { cb(null, resuno, 'zwei'); } , 100);
}

function tres (resuno, resdos, cb) {
  setTimeout(function () { cb(null, resuno, resdos, 'drei'); } , 100);
}

runnel(
    uno
  , dos
  , tres 
  , function (err, resuno, resdos, restres) {
      if (err) 
        console.error('Error: ', err);
      else
        console.log('Success: uno: %s, dos: %s, tres: %s', resuno, resdos, restres);
    }
);

// Outputs: Success: uno: eins, dos: zwei, tres: drei
