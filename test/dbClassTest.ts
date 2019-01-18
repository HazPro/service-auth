import * as db from 'mongo-mock'
import * as DB from '../source/db'
import * as config from '../source/config'
import { expect } from 'chai'
const loggerMock = {
    log: (level, msg) => {
        console.log(level, msg)
    }
}
describe('DB Class tests', () => {
    let doc = { test: 1, test2: 'alksdj' }
    let dbClass: DB.default = null
    before('Setup mocks', async () => {
        db.MongoClient.persist = "db-test.js"
        dbClass = new DB.default(config.default, loggerMock, db.MongoClient)
        await dbClass.connect()
    })
    it('Test insert to db', async () => {
        await dbClass.getDb().collection('test').insertOne(doc)
    })
    it('Test find document in db', async () => {
        const docLocal = await dbClass.getDb().collection('test').findOne({ test: 1 })
        expect(docLocal.test).to.eq(doc.test)
    })
})