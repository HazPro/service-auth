var ObjectID = require('bson-objectid');

module.exports = {
  "localhost:27017": {
    "databases": {
      "myproject%60": {
        "collections": [
          {
            "name": "system.namespaces",
            "documents": [
              {
                "name": "system.indexes"
              }
            ]
          },
          {
            "name": "system.indexes",
            "documents": []
          }
        ]
      },
      "ksu": {
        "collections": [
          {
            "name": "system.namespaces",
            "documents": [
              {
                "name": "system.indexes"
              },
              {
                "name": "test"
              },
              {
                "name": "users"
              },
              {
                "name": "service"
              }
            ]
          },
          {
            "name": "system.indexes",
            "documents": [
              {
                "v": 1,
                "key": {
                  "_id": 1
                },
                "ns": "ksu.test",
                "name": "_id_",
                "unique": true
              },
              {
                "v": 1,
                "key": {
                  "_id": 1
                },
                "ns": "ksu.users",
                "name": "_id_",
                "unique": true
              },
              {
                "v": 1,
                "key": {
                  "_id": 1
                },
                "ns": "ksu.service",
                "name": "_id_",
                "unique": true
              }
            ]
          },
          {
            "name": "test",
            "documents": [
              {
                "test": 1,
                "test2": "alksdj",
                "_id": ObjectID("5c3b0a43f01e10c970b3e00a")
              }
            ]
          },
          {
            "name": "service",
            "documents": [
              {
                "serviceName": "testService",
                "info": {
                  "organization": "HAZPRO",
                  "email": "test@hazpro.ru"
                },
                "permissions": [
                  "joinUser",
                  "removeUser"
                ],
                "_id": ObjectID("5c3b0a43f01e10c970b3e00c")
              }
            ]
          },
          {
            "name": "users",
            "documents": [
              {
                "username": "admin@test.com",
                "org": "OFNIS",
                "_id": ObjectID("5c3b0a43f01e10c970b3e00b")
              },
              {
                "username": "test@mail.com",
                "password": "asdhakjsdhaksdjhaskd",
                "org": "OOFSKDLASD",
                "role": "administrator",
                "_id": ObjectID("5c3b0a44f01e10c970b3e00d")
              }
            ]
          }
        ]
      }
    }
  }
}