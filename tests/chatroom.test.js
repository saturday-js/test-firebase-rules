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
        '.write': "auth !== null && data.child(auth.uid).exists() || newData.hasChild(auth.uid)"
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
    },
    "room2": {
      "title": "Movie Time",
      "lastMessage": "nah, it suck",
      "timestamp": 1459361975337
    }
  },
  "members": {
    "room1": {
      "john": true,
      "jane": true
    },
    "room2": {
      "joe": true,
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
    },
    "room2": {
      "m1": {
        "name": "clark",
        "message": "Hey dude. How about salad for today?",
        "timestamp": 1459361875337
      },
      "m2": {
        "name": "joe",
        "message": "nah, it suck",
        "timestamp": 1459361975337
      }
    }
  }
}

const database = targaryen.database(rules, data)
const jane = {uid: 'jane'}
const joe = {uid: 'joe'}
const jake = {uid: 'jake'}

test(`Anonymous user shouldn't be able to read/write chats, members and messages`, t => {
  t.is(database.read('/chats/room1').allowed, false)
  t.is(database.read('/members/room1').allowed, false)
  t.is(database.read('/messages/room1').allowed, false)

  t.is(database.write('/chats/room1', {title: 'new title'}).allowed, false)
  t.is(database.write('/members/room1', {newmember: true}).allowed, false)
  t.is(database.write('/messages/room1/m3',{message: 'noooo'}).allowed, false)
})

test(`Joe shouldn't be able to read/write chats, members and messages`, t => {
  t.is(database.as(joe).read('/chats/room1').allowed, false)
  t.is(database.as(joe).read('/members/room1').allowed, false)
  t.is(database.as(joe).read('/messages/room1').allowed, false)

  t.is(database.as(joe).write('/chats/room1', {title: 'new title'}).allowed, false)
  t.is(database.as(joe).write('/members/room1', {newmember: true}).allowed, false)
  t.is(database.as(joe).write('/messages/room1/m3',{message: 'noooo'}).allowed, false)
})

test('Jane should be able to read/write chats, members and messages', t => {
  t.is(database.as(jane).read('/chats/room1').allowed, true)
  t.is(database.as(jane).read('/members/room1').allowed, true)
  t.is(database.as(jane).read('/messages/room1').allowed, true)

  t.is(database.as(jane).write('/chats/room1', {title: 'new title'}).allowed, true)
  t.is(database.as(jane).write('/members/room1', {newmember: true}).allowed, true)
  t.is(database.as(jane).write('/messages/room1/m3',{message: 'noooo'}).allowed, true)
})

test(`Jane shouldn't be able to read/write chats, members and messages in room2`, t => {
  t.is(database.as(jane).read('/chats/room2').allowed, false)
  t.is(database.as(jane).read('/members/room2').allowed, false)
  t.is(database.as(jane).read('/messages/room2').allowed, false)

  t.is(database.as(jane).write('/chats/room2', {title: 'new title'}).allowed, false)
  t.is(database.as(jane).write('/members/room2', {newmember: true}).allowed, false)
  t.is(database.as(jane).write('/messages/room2/m3',{message: 'noooo'}).allowed, false)
})

test('Jake should be able to create new room', t => {
  const dbWithJake = database.as(jake).write('/members/room3', {jane: true, jake: true})
  t.is(dbWithJake.allowed, true)
})
