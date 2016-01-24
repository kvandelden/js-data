export function init () {
  describe('createRecord', function () {
    it('should create an instance', function () {
      const Test = this
      const store = new Test.JSData.DataStore()
      class Person extends Test.JSData.Record {
        say () {
          return 'hi'
        }
        get fullName () {
          return `${this.first} ${this.last}`
        }
      }
      const PersonMapper = store.defineMapper('person', {
        RecordClass: Person
      })

      class Dog extends Test.JSData.Record {
        say () {
          return 'woof'
        }
      }
      const DogMapper = store.defineMapper('dog', {
        RecordClass: Dog,
        name: 'Dog'
      })

      class Cat extends Test.JSData.Record {
        say () {
          return 'meow'
        }
      }
      const CatMapper = store.defineMapper('cat', {
        name: 'Cat',
        RecordClass: Cat
      })

      const personAttrs = {
        first: 'John',
        last: 'Anderson'
      }

      const dogAttrs = {
        name: 'Spot'
      }

      const person = PersonMapper.createRecord(personAttrs)
      const person2 = new Person(personAttrs)
      const dog = DogMapper.createRecord(dogAttrs)
      const dog2 = new Dog(dogAttrs)
      const cat = CatMapper.createRecord()
      const cat2 = new Cat()

      Test.assert.equal(person.say(), 'hi')
      Test.assert.equal(person2.say(), 'hi')
      Test.assert.equal(dog.say(), 'woof')
      Test.assert.equal(dog2.say(), 'woof')
      Test.assert.equal(cat.say(), 'meow')
      Test.assert.equal(cat2.say(), 'meow')

      Test.assert.objectsEqual(person, {
        first: 'John',
        last: 'Anderson'
      })
      Test.assert.objectsEqual(dog, dogAttrs)
      Test.assert.objectsEqual(cat, {})

      Test.assert.isTrue(person instanceof Person)
      Test.assert.isTrue(person2 instanceof Person)
      Test.assert.isTrue(dog instanceof Dog)
      Test.assert.isTrue(dog2 instanceof Dog)
      Test.assert.isTrue(cat instanceof Cat)
      Test.assert.isTrue(cat2 instanceof Cat)
    })
  })
}
