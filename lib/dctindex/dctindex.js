import utils from '../../src/utils'

const DctIndex = function (fieldList, opts) {
  utils.classCallCheck(this, DctIndex)
  fieldList || (fieldList = [])
  opts || (opts = {})

  if (!utils.isArray(fieldList)) {
    throw new Error('fieldList must be an array.')
  }

  if (fieldList.length != 1) { //jsData only uses 1 field.
    fieldList = ['id']
    //throw new Error('DctIndex supports only 1 key field')
  }

  this.collection = opts.collection || {}
  this.mapper = this.collection.mapper || {}
  this.idxFieldName = fieldList[0]
  this.rowIdFieldName = this.mapper.idAttribute || opts.idAttribute || this.idxFieldName
  this.bPrimaryKeyIdx = (this.idxFieldName === this.rowIdFieldName)
  this.dctRows = {}  //  For Primary Key Index [id:string]: Row , For Foreign Key Index [id:string]: Row[]
  this.dctIndexValueByRowId = {} // Used for Foreign Key Index..   Holds the IndexValue used when inserting a new row.  By Primary Key of the row
  this.arrUndefinedKeyRows = []  // TODO: Add support for records w/o Primary Keys defined.. std js-data
  this.arrUndefinedIndexKeyRows = []

}

DctIndex.prototype.set = function (keyList, value) {

  if (!utils.isArray(keyList)) {
    keyList = [keyList]
  }

  let idxValue = keyList[0]
  let rowIdValue = value[this.rowIdFieldName]
  if (this.bPrimaryKeyIdx) {
    if (utils.isUndefined(idxValue)) {
      this.arrUndefinedKeyRows.push(value)
    } else {
      this.dctRows[idxValue] = value
    }
  } else {
    if (utils.isUndefined(rowIdValue)) {
      this.arrUndefinedKeyRows.push(value)
    } else {
      this.dctIndexValueByRowId[rowIdValue] = idxValue
    }
    if (utils.isUndefined(idxValue)) {
      this.arrUndefinedIndexKeyRows.push(value)
    } else if (idxValue in this.dctRows) {
      this.dctRows[idxValue].push(value)
    } else {
      this.dctRows[idxValue] = [value]
    }
  }

}


DctIndex.prototype.get = function (keyList) {
  if (!utils.isArray(keyList)) {
    keyList = [keyList]
  }

  let idxValue = keyList[0]
  if(utils.isUndefined(idxValue)){
    if(this.bPrimaryKeyIdx){
      return this.arrUndefinedKeyRows.slice(0)
    } else {
      return this.arrUndefinedIndexKeyRows.slice(0)
    }
  }

  if (!(idxValue in this.dctRows)) { return [] }

  if (this.bPrimaryKeyIdx) {
    return [this.dctRows[idxValue]]
  } else {
    return this.dctRows[idxValue].slice(0) // clone array
  }

}

DctIndex.prototype.getAll = function (opts) {
  opts || (opts = {})

  let results = []

  // Fast path first..
  let keys = Object.keys(this.dctRows)

  if (!('order' in opts)) {

    for (let key of keys) {
      let dctEntry = this.dctRows[key]

      if (this.bPrimaryKeyIdx) {
        results.push(dctEntry)
      } else {
        results.push.apply(results, dctEntry)
      }
    }

    if (this.bPrimaryKeyIdx) {
      results.push.apply(results, this.arrUndefinedKeyRows)
    } else {
      results.push.apply(results, this.arrUndefinedIndexKeyRows)
    }

    return results
  }

  let keyNums = keys.map((a) => parseInt(a)).sort()
  if (opts.order === 'desc') {
    keyNums = keyNums.reverse()
  }

  for (let key of keyNums) {
    let dctEntry = this.dctRows[key]

    if (this.bPrimaryKeyIdx) {
      results.push(dctEntry)
    } else {
      results.push.apply(results, dctEntry)
    }
  }
  return results
}


DctIndex.prototype.visitAll = function (cb, thisArg) {
  let values = this.getAll()
  values.forEach(cb, thisArg)
}


DctIndex.prototype.between = function (leftKeys, rightKeys, opts) {
  opts || (opts = {})
  if (!utils.isArray(leftKeys)) {
    leftKeys = [leftKeys]
  }
  if (!utils.isArray(rightKeys)) {
    rightKeys = [rightKeys]
  }
  utils.fillIn(opts, {
    leftInclusive: true,
    rightInclusive: false,
    limit: undefined,
    offset: 0
  })

  let results = this._between(leftKeys, rightKeys, opts)

  if (opts.limit) {
    return results.slice(opts.offset, opts.limit + opts.offset)
  } else {
    return results.slice(opts.offset)
  }
}

DctIndex.prototype._condTrue = function (value, bound) { return true }

DctIndex.prototype._condLeftBoundInclusive = function (value, leftKey) { return value >= leftKey }

DctIndex.prototype._condLeftBoundExclusive = function (value, leftKey) { return value > leftKey }

DctIndex.prototype._condRightBoundInclusive = function (value, rightKey) { return value <= rightKey }

DctIndex.prototype._condRightBoundExclusive = function (value, rightKey) { return value < rightKey }

DctIndex.prototype._between = function (leftKeys, rightKeys, opts) {
  let results = []

  let leftKey = leftKeys.shift()
  let rightKey = rightKeys.shift()


  let leftCompare = this._condLeftBoundExclusive
  let rightCompare = this._condRightBoundExclusive

  if (opts.leftInclusive === false) {
    leftCompare = this._condLeftBoundInclusive
  }
  if(utils.isUndefined(leftKey)){
    leftCompare = this._condTrue
  }

  if(opts.rightInclusive){
    rightCompare = this._condRightBoundInclusive
  }
  if(utils.isUndefined(rightKey)){
    rightCompare = this._condTrue
  }

  let keys = Object.keys(this.dctRows)
  for(let aKey of keys){
    if(leftCompare(aKey, leftKey) && rightCompare(aKey, rightKey)){
      if(this.bPrimaryKeyIdx) {
        results.push(this.dctRows[aKey])
      } else {
        results.push.apply(results, this.dctRows[aKey])
      }
    }
  }

  if(this.bPrimaryKeyIdx){
    // Don't include if pk undefined (new row)...
  } else {
    // Don't include if fk undefined ...
  }

  // Handle offset better
  if (opts.limit) {
    return results.slice(0, opts.limit + opts.offset)
  } else {
    return results
  }
}

// kvd: Complete due to no references in js-data code.
DctIndex.prototype.peek = function () {

  let keys = Object.keys(this.dctRows)
  if (keys.length) {
    let firstKey = keys[0]
    if (this.bPrimaryKeyIdx) {
      return this.dctRows[firstKey]
    } else {
      return this.dctRows[firstKey][0]
    }
  }
  return []
}

// kvd: Method Complete
DctIndex.prototype.clear = function () {
  this.dctRows = {}
  this.dctIndexValueByRowId = {}
  this.arrUndefinedKeyRows = []
  this.arrUndefinedIndexKeyRows = []
}


DctIndex.prototype.insertRecord = function (data) {
  let idxValue = data[this.idxFieldName]
  this.set([idxValue], data)
}

// kvd: Add undefined support
DctIndex.prototype.removeRecord = function (data) {

  let curIdxValue = data[this.idxFieldName]
  let rowIdValue = data[this.rowIdFieldName]

  if (this.bPrimaryKeyIdx) {
    if (utils.isUndefined(rowIdValue)) {
      let arrIdx = this.arrUndefinedKeyRows.indexOf(data)
      if (arrIdx >= 0) {
        this.arrUndefinedKeyRows.splice(arrIdx, 1)
      } else {
        return undefined
      }
    } else if (rowIdValue in this.dctRows) {
      delete this.dctRows[rowIdValue]
      return data
    } else {
      return undefined
    }
  }

  // ForeignKey Index
  if (!(rowIdValue in this.dctIndexValueByRowId)) {
    // TODO: Add undefined support here..
    return undefined
  }

  let storedIdxValue = this.dctIndexValueByRowId[rowIdValue]
  let arrRows = this.dctRows[storedIdxValue]
  let idAttribute = this.rowIdFieldName
  let bItemRemoved = false
  this.dctRows[storedIdxValue] = arrRows.filter(function (val, idx) {
    let elementRowId = val[idAttribute] // TODO: Convert to number ?
    let bKeep = (elementRowId != rowIdValue)
    bItemRemoved |= !bKeep
    return bKeep
  })
  if (bItemRemoved) {
    delete this.dctIndexValueByRowId[rowIdValue]
    return data
  }
  return undefined

}

// kvd: Method Complete
DctIndex.prototype.updateRecord = function (data) {
  const removed = this.removeRecord(data)
  if (removed !== undefined) {
    this.insertRecord(data)
  }
}

export default DctIndex

