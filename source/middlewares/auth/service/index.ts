import * as Koa from 'koa'
import DB from '../../../db'
import * as winston from 'winston'
import * as _ from 'lodash'
import * as jwt from 'jsonwebtoken'
import { Certificate, IKsuCertificate } from '@hazpro/auth/build/cert'
import * as crypto from 'crypto'

function createRandomPassword() {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(4, (err, buf) => {
            if (err) return reject(err)
            resolve(buf.toString('hex'))
        })
    })
}


export default async function handler(ctx: Koa.Context, next: Function) {
    switch (ctx.path) {
        case '/api/service/user/join':
            await serviceJoinUser(ctx, next)
            break
        case '/api/service/auth':
            await serviceAuth(ctx, next)
            break
        default:
            const userRegPath = /\/api\/service\/user\/(\d+)/
            if (userRegPath.test(ctx.path)) {
                const params = userRegPath.exec(ctx.path)
                const pathParams = {
                    id: params[0]
                }
                _.set(ctx, 'pathParams', pathParams)
                switch (ctx.method) {
                    case 'PUT':
                        await serviceUpdateUser(ctx, next)
                        break
                    case 'DELETE':
                        await serviceDeleteUser(ctx, next)
                        break
                }
            }
            break
    }
}
export async function serviceUpdateUser(ctx: Koa.Context | any, next: Function) {
    const ca: Certificate = _.get(ctx, 'ca')
    const logger: winston.Logger = _.get(ctx, 'logger')
    const body = _.get(ctx.request, 'body')
    const db: DB = _.get(ctx, 'db')
    const berear: string = ctx.get('Authorization')
    const token = berear.split(' ')[1]
    const pathParams = _.get(ctx, 'pathParams')
    if (!token) ctx.throw(400,new Error('Authorization failed'))
    let service: IKsuCertificate = null
    try {
        service = <IKsuCertificate>jwt.verify(token, ca.getPublicString())
    } catch {
        ctx.throw(400,new Error('Broken authorization token'))
    }
    if (service.permissions.indexOf('updateUser') < 0) {
        ctx.throw(400,new Error('Service do not have permission updating of user'))
    }
    const userData = await db.getDb()
        .collection('users')
        .findOne({ _id: DB.toObjectId(pathParams.id) })
    if (!userData) {
        ctx.throw(400,new Error('User not found'))
    }
    const user = Object.assign(userData, body)
    // console.log(user)
    await db.getDb()
        .collection('users')
        .updateOne({ _id: DB.toObjectId(pathParams.id) }, user)
    delete user.password
    ctx.body = {
        error: false,
        result: 'User has been updated',
        user
    }
}
export async function serviceDeleteUser(ctx: Koa.Context | any, next: Function) {
    const ca: Certificate = _.get(ctx, 'ca')
    const logger: winston.Logger = _.get(ctx, 'logger')
    const body = _.get(ctx.request, 'body')
    const db: DB = _.get(ctx, 'db')
    const berear: string = ctx.get('Authorization')
    const token = berear.split(' ')[1]
    const pathParams = _.get(ctx, 'pathParams')
    if (!token) ctx.throw(400,new Error('Authorization failed'))
    let service: IKsuCertificate = null
    try {
        service = <IKsuCertificate>jwt.verify(token, ca.getPublicString())
    } catch {
        ctx.throw(400,new Error('Broken authorization token'))
    }
    if (service.permissions.indexOf('removeUser') < 0) {
        ctx.throw(400,new Error('Service do not have permission remove of user'))
    }
    const userData = await db.getDb()
        .collection('users')
        .findOne({ _id: DB.toObjectId(pathParams.id) })
    if (!userData) {
        ctx.throw(400,new Error('User not found'))
    }
    await db.getDb()
        .collection('users')
        .deleteOne({ _id: DB.toObjectId(pathParams.id) })
    ctx.body = {
        error: false,
        result: 'User has been removed'
    }
}

export async function serviceJoinUser(ctx: Koa.Context | any, next: Function) {
    const ca: Certificate = _.get(ctx, 'ca')
    const logger: winston.Logger = _.get(ctx, 'logger')
    const body = _.get(ctx.request, 'body')
    const db: DB = _.get(ctx, 'db')
    const berear: string = ctx.get('Authorization')
    const token = berear.split(' ')[1]
    if (!token) ctx.throw(400,new Error('Authorization failed'))
    let service: IKsuCertificate = null
    try {
        service = <IKsuCertificate>jwt.verify(token, ca.getPublicString())
    } catch (e) {
        console.log(e)
        ctx.throw(400,new Error('Broken authorization token'))
    }
    if (service.permissions.indexOf('joinUser') < 0) {
        ctx.throw(400,new Error('Service do not have permission joining of user'))
    }
    const { user, inviter } = body
    const inviterData = await db.getDb().collection('users').findOne({ username: inviter })
    if (!inviterData) {
        ctx.throw(400,new Error('Inviter not found'))
    }
    const userData = await db.getDb().collection('users').findOne({ username: user })
    if (userData) {
        ctx.throw(400,new Error('User already invited'))
    }
    const userInserted = await db.getDb().collection('users').insertOne({
        username: user,
        role: 'guest',
        password: await createRandomPassword(),
        org: inviterData.org,
        inviter: inviterData._id
    })
    ctx.body = {
        error: false,
        result: 'User invited',
        user: {
            id: userInserted.insertedId
        }
    }
}

export async function serviceAuth(ctx: Koa.Context | any, next: Function) {
    const db: DB = _.get(ctx, 'db')
    const config = _.get(ctx, 'config')
    const ca: Certificate = _.get(ctx, 'ca')
    const logger: winston.Logger = _.get(ctx, 'logger')
    const body = _.get(ctx.request, 'body')
    if (_.isEmpty(body)) {
        ctx.throw(400,new Error('Empty request'))
    }
    const { serviceName, serviceCertificate } = body
    if (!ca.validateCertificate(serviceCertificate)) {
        ctx.throw(400,new Error('Invalid certificate'))
    }
    const serviceCrt = new Certificate(serviceCertificate)
    db.getDb().collection('service').insertOne(
        Object.assign({ serviceName }, serviceCrt.getInfo())
    )
    const token = jwt.sign(serviceCrt.getInfo(), ca.getPrivateKey(), { algorithm: 'RS512' })
    ctx.body = {
        error: false,
        result: 'Authenticate success',
        token
    }
}