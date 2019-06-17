import { assert, JSData } from '../../_setup'

describe('DctIndex', function () {
  it('should be a constructor function', function () {
    assert.equal(typeof JSData.DctIndex, 'function', 'should be a function')
    let index = new JSData.DctIndex()
    assert(index instanceof JSData.DctIndex, 'query should be an instance')
  })
})
