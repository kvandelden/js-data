import { assert, JSData } from '../../_setup'

describe('DctIndex#insertRecord', function () {
  it('should insert records', function () {
    const index = new JSData.DctIndex(['id'], {})

    const record1 = { id: 1, age: 30 }
    const record2 = { id: 5, age: 27 }
    const record3 = { name: 'John', age: 18 }
    const record4 = { id: 3, age: 45 }
    const record5 = { age: 97 }
    const record6 = { id: 2, age: 55 }
    const record7 = { id: 6, age: 97 }
    const record8 = { id: 8, age: 97 }
    const record9 = { id: 7, age: 98 }
    const record10 = { id: 10 }
    index.insertRecord(record1)
    index.insertRecord(record2)
    index.insertRecord(record3)
    index.insertRecord(record4)
    index.insertRecord(record5)
    index.insertRecord(record6)
    index.insertRecord(record7)
    index.insertRecord(record8)
    index.insertRecord(record9)
    index.insertRecord(record10)

    let getNewRows = index.get()
    assert.equal(getNewRows.length, 2)
    assert.equal(true, getNewRows.indexOf(record3) >= 0)
    assert.equal(true, getNewRows.indexOf(record5) >= 0)


    const index2 = new JSData.DctIndex(['age'], {idAttribute: 'id'})

    index2.insertRecord(record1)
    index2.insertRecord(record2)
    index2.insertRecord(record3)
    index2.insertRecord(record4)
    index2.insertRecord(record5)
    index2.insertRecord(record6)
    index2.insertRecord(record7)
    index2.insertRecord(record8)
    index2.insertRecord(record9)
    index2.insertRecord(record10)

    let records = index2.between([44], [98])
    //console.log("Between 44, 98")
    //console.log(JSON.stringify(records, null, '\t'))
    // dctIndex doesn't guarantee order..
    assert.equal(records.length, 5)
    assert.equal(true, records.indexOf(record4) >= 0)
    assert.equal(true, records.indexOf(record5) >= 0)
    assert.equal(true, records.indexOf(record6) >= 0)
    assert.equal(true, records.indexOf(record7) >= 0)
    assert.equal(true, records.indexOf(record8) >= 0)

  })
})
