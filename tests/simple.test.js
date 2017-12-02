const test = require('ava')
const targaryen = require('targaryen')

const rules = {
  rules: {
    '.read': 'auth != null',
    '.write': 'auth != null'
  }
};

const data = {
  message: {
    0: {
      text: 'hello'
    }
  }
}

const database = targaryen.database(rules, data)

test(`Anonymous user shouldn't be able to read/write `, t => {
  t.pass(database.read('/message').allowed, false)
  t.pass(database.write('/message', {1: {text: 'hey' }}).allowed, false)
})

test('Logged in user should be able to read/write', t => {
  t.pass(database.as({uid: 'someuid'}).read('/message').allowed, true)
  t.pass(database.as({uid: 'someuid'}).write('/message', {1: {text: 'hey' }}).allowed, true)
})
