import { signin, login } from '../source/middlewares/auth/user'
import * as DB from '../source/db'
import * as db from 'mongo-mock'
import * as config from '../source/config'
import * as _ from 'lodash'
import { expect } from 'chai'
import { Certificate } from '../source/cert'

const loggerMock = {
    log: (level, msg) => {
        console.log(level, msg)
    }
}
async function next(err) {
    if (err) {
        throw err
    }
}

describe('users test', () => {
    let dbClass: DB.default = null
    let ca: Certificate = null
    before('Setup mocks', async () => {
        ca = Certificate.fromFile('./assets')
        db.MongoClient.persist = "db-test.js"
        dbClass = new DB.default(config.default, loggerMock, db.MongoClient)
        await dbClass.connect()
    })
    it('SignIn user', async () => {
        let ctx = {
            db: dbClass,
            request: {
                body: {
                    username: 'test@mail.com',
                    password: 'asdhakjsdhaksdjhaskd',
                    org: 'OOFSKDLASD'
                }
            }
        }
        await signin(ctx, next)
        const body = _.get(ctx, 'body')
        expect(body.error).eq(false)
        expect(body.result).eq('User registred')
    })
    it('Login user', async () => {
        let ctx = {
            db: dbClass,
            ca,
            request: {
                body: {
                    username: 'test@mail.com',
                    password: 'asdhakjsdhaksdjhaskd',
                    org: 'OOFSKDLASD'
                }
            }
        }
        await login(ctx, next)
        const body = _.get(ctx, 'body')
        expect(body.error).eq(false)
    })
    it('Login invalid user', (done) => {
        let ctx = {
            db: dbClass,
            ca,
            request: {
                body: {
                    username: 'te2st@mail.com',
                    password: 'asdhakjsdhaksdjhaskd',
                }
            }
        }
        login(ctx, next).then(_=>{
            done(new Error('Invalid behavior'))
        }, err=>{
            done()
        })
    })
})