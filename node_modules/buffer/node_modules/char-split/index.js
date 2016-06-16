var through = require('through')

module.exports = function (splitCharacter) {
    splitCharacter = splitCharacter || '\n'
    if (splitCharacter.length !== 1) {
        throw new Error("Split character length must be 1 (got "+splitCharacter.length+")")
    }
    var soFar = ''

    return through(
        function (string) {
            var index
            var start = 0
            while ((index = string.indexOf(splitCharacter, start)) !== -1) {
                if (start <= index) {
                    this.queue(soFar + string.slice(start, index))
                }
                soFar = '';
                start = index+1
            }
            if (start < string.length) {
                soFar += string.slice(start)
            }
        },
        function () {
            if (soFar.length) {
                this.queue(soFar)
            }
            this.queue(null)
        }
    )
}
