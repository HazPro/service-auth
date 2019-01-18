import * as db from 'mongo-mock'
import * as DB from '../source/db'
import * as config from '../source/config'
import { serviceAuth, serviceJoinUser, serviceUpdateUser, serviceDeleteUser } from '../source/middlewares/auth/service'
import { expect } from 'chai'
import { Certificate } from '@hazpro/auth/build/cert'
import * as fs from 'fs'
import * as _ from 'lodash'

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
describe('Service test', () => {
    let dbClass: DB.default = null
    let ca: Certificate = null
    let serviceCa: Certificate = null
    let serviceCert: string = null
    let token: string = null
    let userId: any = null
    before(async () => {
        ca = Certificate.fromFile('./assets')
        serviceCert = fs.readFileSync('./test/assets/test.pem', 'ascii')
        serviceCa = new Certificate(serviceCert)
        db.MongoClient.persist = "service-db-test.js"
        dbClass = new DB.default(config.default, loggerMock, db.MongoClient)
        await dbClass.connect()
    })
    it('test auth service', (done) => {
        let ctx = {
            db: dbClass,
            request: {
                body: {
                    serviceName: 'testService',
                    serviceCertificate: serviceCert
                }
            },
            ca
        }
        serviceAuth(ctx, next).then(() => {
            const body = _.get(ctx, 'body')
            expect(body.error).eq(false)
            expect(body.result).eq('Authenticate success')
            token = body.token
            done()
        }, done)
        token = _.get(ctx,'body.token')
    })
    it('test join user', async () => {
        if (!token) throw new Error('Service not auth')
        await dbClass.getDb().collection('users').insertOne({
            username: 'admin@test.com',
            org: 'OFNIS'
        })
        let ctx = {
            db: dbClass,
            ca,
            request: {
                headers: {
                    'Authorization': `Berear ${token}`
                },
                body: {
                    user: 'test@test.com',
                    inviter: 'admin@test.com'
                }
            },
            get: () => {
                return `Berear ${token}`
            }
        }
        await serviceJoinUser(ctx, next)        
        userId = ctx['body'].user.id
    })
    it('test update user', (done) => {
        if (!token || !userId) throw new Error('Service not auth')
        let ctx = {
            db: dbClass,
            ca,
            request: {
                headers: {
                    'Authorization': `Berear ${token}`
                },
                body: {
                    role: 'manager'
                }
            },
            get: () => {
                return `Berear ${token}`
            },
            pathParams: {
                id: userId
            }
        }
        serviceUpdateUser(ctx, next).then(_=>{
            done(new Error('Update user have invalid behavior'))
        },_=>{done()})
    })
    it('test remove user', async ()=>{
        if (!token || !userId) throw new Error('Service not auth')
        let ctx = {
            db: dbClass,
            ca,
            request: {
                headers: {
                    'Authorization': `Berear ${token}`
                },
                body: {
                    role: 'manager'
                }
            },
            get: () => {
                return `Berear ${token}`
            },
            pathParams: {
                id: userId
            }
        }
        await serviceDeleteUser(ctx, next)
    })
})