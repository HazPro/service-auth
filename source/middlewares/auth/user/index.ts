import { Context } from 'koa'
import DB from '../../../db'
import * as winston from 'winston'
import * as _ from 'lodash'
import * as jwt from 'jsonwebtoken'
import { Certificate } from '../../../cert'

export default async function handler(ctx: Context | any, next: Function) {
    switch (ctx.path) {
        case '/api/users/login':
            await login(ctx, next)
            break
        case '/api/users/signin':
            await signin(ctx, next)
            break
    }
}
export async function login(ctx: Context | any, next: Function) {
    const db: DB = _.get(ctx, 'db')
    const config = _.get(ctx, 'config')
    const ca: Certificate = _.get(ctx, 'ca')
    const logger: winston.Logger = _.get(ctx, 'logger')
    const body = _.get(ctx.request, 'body')
    if (_.isEmpty(body)) {
        return next(new Error('Empty request'))
    }
    let { username, password } = body
    if (!db.isConnected()) {
        return next(new Error('Try later'))
    }
    const user = await db.getDb().collection('users').findOne({ username, password })
    if (!user) {
        return next(new Error('Invalid username or password'))
    }
    const secretOrPrivateKey = ca.getPrivateKey()
    const authToken = getToken(user, secretOrPrivateKey)
    ctx.body = {
        error: false,
        reault: 'Authentication success',
        token: authToken
    }
}
export function getToken(user: any, secretOrPublicKey: string) {
    const { username, role, name, _id } = user
    return jwt.sign({
        username,
        role,
        name,
        id: _id
    }, secretOrPublicKey)
}

export async function signin(ctx: Context | any, next: Function) {
    const db: DB = _.get(ctx, 'db')
    const config = _.get(ctx, 'config')
    const logger: winston.Logger = _.get(ctx, 'logger')
    const body = _.get(ctx.request, 'body')
    if (_.isEmpty(body)) {
        return next(new Error('Empty request'))
    }
    const { username, password, org } = body
    if (!db.isConnected()) {
        return next(new Error('Try later'))
    }
    const user = await db.getDb().collection('users').findOne({ username })
    if (user) {
        return next(new Error('Some users exists'))
    }
    await db.getDb().collection('users').insertOne({
        username,
        password,
        org,
        'role': 'administrator'
    })
    ctx.body = {
        error: false,
        result: 'User registred'
    }
}