var rewire = require('rewire')
  , assert = require('assert')
  , path = require('path')

describe('find-nearest-file', function () {

  it('should thow if a path is passed as a filename', function () {

    assert.throws(function () {
      require('../')('..')
    }, /filename must be just a filename and not a path/)

    assert.throws(function () {
      require('../')('../')
    }, /filename must be just a filename and not a path/)

  })

  it('should only accept a filename', function () {

    assert.throws(function () {
      require('../')('')
    }, /filename is required/)

    assert.throws(function () {
      require('../')()
    }, /filename is required/)

  })

  it('should search for the given file all the way up to the root of the filesystem', function () {

    var find = rewire('../')
      , filename = 'a-really-unique-filename-for-testing.test.zzz.__dsf.yup'
      , paths = []

    function mockStat(path) {
      paths.push(path)
      throw new Error()
    }

    find.__set__('fs', { statSync: mockStat })
    find(filename)
    paths.reduce(function (a, b) {
      if (!a) return
      if (a.replace(filename, '').indexOf(b.replace(filename, '')) !== 0) throw new Error()
    })
    assert.equal(paths.pop(), path.join(path.resolve('/'), filename))

  })

  it('should stop and return the filename when stat doesn’t throw an error', function () {

    var find = rewire('../')
      , filename = 'a-really-unique-filename-for-testing.test.zzz.__dsf.yup'
      , times = 0

    function mockStat() {
      times++
      if (times < 2) throw new Error()
      if (times === 2) return { isFile: function () { return false } }
      return { isFile: function () { return true } }
    }

    find.__set__('fs', { statSync: mockStat })
    assert.equal(find(filename), path.resolve(process.cwd(), '../../' + filename))

  })

})
