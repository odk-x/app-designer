# This is how we bundle things using browserify.
browserify -r ./jgiFollow.js:jgiFollow ./jgiDb.js ./jgiModels.js ./jgiUrls.js >bundle.js
