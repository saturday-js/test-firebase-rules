const test = require('ava')
const targaryen = require('targaryen')

const rules = {
  rules: {
    chats: {
      $roomId: {
        '.read': "auth !== null && root.child('members').child($roomId).child(auth.uid).exists()",
        '.write': "auth !== null && root.child('members').child($roomId).child(auth.uid).exists()"
      }
    },
    members: {
      $roomId: {
        '.read': "auth !== null && data.child(auth.uid).exists()",
        '.write': "auth !== null && data.child(auth.uid).exists()"
      }
    },
    messages: {
      $roomId: {
        '.read': "auth !== null && root.child('members').child($roomId).child(auth.uid).exists()",
        '.write': "auth !== null && root.child('members').child($roomId).child(auth.uid).exists()"
      }
    }
  }
};

const data = {
  "chats": {
    "room1": {
      "title": "Saturday JS",
      "lastMessage": "ok",
      "timestamp": 1459361975337
    }
  },
  "members": {
    "room1": {
      "john": true,
      "jane": true,
      "clark": true
    }
  },
  "messages": {
    "room1": {
      "m1": {
        "name": "john",
        "message": "Let get some burger.",
        "timestamp": 1459361875337
      },
      "m2": {
        "name": "jane",
        "message": "ok",
        "timestamp": 1459361975337
      }
    }
  }
}

const database = targaryen.database(rules, data)
const jane = {uid: 'jane'}
const joe = {uid: 'joe'}

test(`Anonymous user shouldn't be able to read/write chats, members and messages`, t => {
  t.pass(database.read('/chats/room1').allowed, false)
  t.pass(database.read('/members/room1').allowed, false)
  t.pass(database.read('/messages/room1').allowed, false)

  t.pass(database.write('/chats/room1', {title: 'new title'}).allowed, false)
  t.pass(database.write('/members/room1', {newmember: true}).allowed, false)
  t.pass(database.write('/messages/room1/m3',{message: 'noooo'}).allowed, false)
})

test(`Joe shouldn't be able to read/write chats, members and messages`, t => {
  t.pass(database.as(joe).read('/chats/room1').allowed, false)
  t.pass(database.as(joe).read('/members/room1').allowed, false)
  t.pass(database.as(joe).read('/messages/room1').allowed, false)

  t.pass(database.as(joe).write('/chats/room1', {title: 'new title'}).allowed, false)
  t.pass(database.as(joe).write('/members/room1', {newmember: true}).allowed, false)
  t.pass(database.as(joe).write('/messages/room1/m3',{message: 'noooo'}).allowed, false)
})

test('Jane should be able to read/write chats, members and messages', t => {
  t.pass(database.as(jane).read('/chats/room1').allowed, true)
  t.pass(database.as(jane).read('/members/room1').allowed, true)
  t.pass(database.as(jane).read('/messages/room1').allowed, true)

  t.pass(database.as(jane).write('/chats/room1', {title: 'new title'}).allowed, true)
  t.pass(database.as(jane).write('/members/room1', {newmember: true}).allowed, true)
  t.pass(database.as(jane).write('/messages/room1/m3',{message: 'noooo'}).allowed, true)
})
