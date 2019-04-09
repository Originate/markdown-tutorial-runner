import { expect } from 'chai'
import { OpenTagTracker } from '../helpers/open-tag-tracker'
import { OpenCloseMdTransformer } from './open-close-md-transformer'

describe('MdTransformer', function() {
  beforeEach(function() {
    this.transformer = new OpenCloseMdTransformer(new OpenTagTracker())
  })

  describe('.isOpeningType()', function() {
    it('returns TRUE for opening types', function() {
      expect(this.transformer.isOpeningType('bullet_list_open')).to.be.true
    })
    it('returns FALSE for closing types', function() {
      expect(this.transformer.isOpeningType('bullet_list_close')).to.be.false
    })
    it('returns FALSE for all other types', function() {
      expect(this.transformer.isOpeningType('bullet_list')).to.be.false
    })
  })

  describe('.isClosingType()', function() {
    it('returns TRUE for closing types', function() {
      expect(this.transformer.isClosingType('bullet_list_close')).to.be.true
    })
    it('returns FALSE for opening types', function() {
      expect(this.transformer.isClosingType('bullet_list_open')).to.be.false
    })
    it('returns FALSE for all other types', function() {
      expect(this.transformer.isClosingType('bullet_list')).to.be.false
    })
  })

  describe('.openingTagFor()', function() {
    it('returns the opening HTML tag for known Remarkable tags', function() {
      expect(this.transformer.openingTagFor('bullet_list_open')).to.equal('ul')
    })
    it('returns the same tag for unknown types', function() {
      expect(this.transformer.openingTagFor('del')).to.equal('del')
    })
  })

  describe('.openingTypeFor()', function() {
    it('returns the opening type for the given known closing node type', function() {
      const actual = this.transformer.openingTypeFor('bullet_list_close')
      expect(actual).to.equal('bullet_list_open')
    })
    it('returns the opening type for the given unknown closing node type', function() {
      const actual = this.transformer.openingTypeFor('del_close')
      expect(actual).to.equal('del_open')
    })
  })

  describe('.closingTagFor()', function() {
    it('returns the closing HTML tag for the given known closing Remarkable type', function() {
      const actual = this.transformer.closingTagFor('bullet_list_close')
      expect(actual).to.equal('/ul')
    })
    it('returns the closing HTML tag for the given unknown closing Remarkable type', function() {
      const actual = this.transformer.closingTagFor('del_close')
      expect(actual).to.equal('/del')
    })
  })

  describe('.transform()', function() {
    it('stores attributes of the original node', function() {
      const node = { type: 'bullet_list_open', attributes: { foo: 'bar' } }
      const transformed = this.transformer.transform(node, 'file.js', 12)
      expect(transformed[0].attributes).to.eql({ foo: 'bar' })
    })
    it('transforms bullet_list_open', function() {
      const node = { type: 'bullet_list_open' }
      const transformed = this.transformer.transform(node, 'file.js', 12)
      expect(transformed).to.have.length(1)
      expect(transformed[0]).to.eql({
        attributes: {},
        content: '',
        file: { value: 'file.js' }, // this is an AbsoluteFilePath
        line: 12,
        tag: 'ul',
        type: 'bullet_list_open'
      })
    })
    it('transforms bullet_list_close', function() {
      // we need an open node before we can transform the closing node
      const openNode = { type: 'bullet_list_open' }
      this.transformer.transform(openNode, 'file.js', 12)

      // transform the closing node
      const closeNode = { type: 'bullet_list_close' }
      const transformed = this.transformer.transform(closeNode, 'file.js', 12)
      expect(transformed).to.have.length(1)
      expect(transformed[0]).to.eql({
        attributes: {},
        content: '',
        file: { value: 'file.js' }, // this is an AbsoluteFilePath
        line: 12,
        tag: '/ul',
        type: 'bullet_list_close'
      })
    })
    it('transforms images', function() {
      const closeNode = { type: 'bullet_list_close' }
      const transformed = this.transformer.transform(closeNode, 'file.js', 12)
      expect(transformed).to.have.length(1)
      expect(transformed[0]).to.eql({
        attributes: {},
        content: '',
        file: { value: 'file.js' }, // this is an AbsoluteFilePath
        line: 12,
        tag: '/ul',
        type: 'bullet_list_close'
      })
    })
  })
})
