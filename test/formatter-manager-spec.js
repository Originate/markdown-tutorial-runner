const FormatterManager = require('../dist/formatters/formatter-manager')
const jsdiffConsole = require('jsdiff-console')
const {expect} = require('chai')

describe('FormatterManager', function () {
  before(function () {
    this.formatterManager = new FormatterManager()
  })

  describe('availableFormatterNames', function () {
    before(function () {
      this.formatterNames = this.formatterManager.availableFormatterNames()
    })

    it('returns the names of the available formatters', function () {
      expect(this.formatterNames).to.eql(['detailed', 'dot'])
    })
  })

  describe('getFormatter', function () {
    context('with correct formatter name', function () {
      before(function () {
        this.result = this.formatterManager.getFormatter('dot')
      })

      it('returns the formatter with the given name', function () {
        expect(typeof this.result).to.equal('object')
      })
    })

    context('with unknown formatter name', function () {
      before(function () {
        try {
          this.formatterManager.getFormatter('zonk')
        } catch (e) {
          this.err = e.message
        }
      })

      it('returns no formatter', function () {
        expect(this.result).to.be.undefined
      })

      it('returns an error', function () {
        jsdiffConsole(this.err,
`Unknown formatter: 'zonk'

<<<<<<< HEAD
Available formatters are detailed, dot`)
=======
Available formatters are dot, robust`)
>>>>>>> master
      })
    })
  })
})
