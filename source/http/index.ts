import * as Koa from 'koa'
import * as winston from 'winston'
import * as bodyparser from 'koa-bodyparser'
import * as middlewares from '../middlewares'
import * as _ from 'lodash'
import DB from '../db'
import { Auth } from '@hazpro/auth'

export default class HttpServer {
    httpHandler: Koa
    port: number
    logger: winston.Logger
    config: any
    db: DB
    ca: Auth
    /** */
    constructor(
        port: number,
        logger: winston.Logger = null,
        db: DB,
        config: any
    ) {
        this.db = db
        this.config = config
        if (this.db.isConnected()) {
            this.db.connect()
        }
        this.ca = new Auth(config.ca)
        this.port = port
        this.httpHandler = new Koa()
        if (!logger) {
            // Create minimal logger fro http
            this.logger = winston.createLogger({
                level: 'info',
                format: winston.format.json(),
                transports: [
                    new winston.transports.Console({ format: winston.format.simple() })
                ]

            })
        } else {
            this.logger = logger
        }
    }
    async setExtensions(ctx: Koa.Context, next: Function) {
        _.set(ctx, 'db', this.db)
        _.set(ctx, 'config', this.config)
        _.set(ctx, 'ca', this.ca.getCerificate())
        await next()
    }
    async httpLogger(ctx: Koa.Context, next: Function) {
        const start = new Date()
        ctx.logger = this.logger
        await next()
        const ms = new Date().getTime() - start.getTime()
        let logLevel = 'info'
        if (ctx.status >= 500) {
            logLevel = 'error'
        }
        if (ctx.status >= 400) {
            logLevel = 'warn'
        }
        this.logger.log({
            level: logLevel,
            message: ctx.status.toString(),
            meta: {
                method: ctx.method,
                url: ctx.originalUrl,
                ms
            }
        })
    }

    start() {
        this.httpHandler.use(this.setExtensions)
        this.httpHandler.use(this.httpLogger)
        this.httpHandler.use(bodyparser())
        if (Array.isArray(middlewares)) {
            middlewares.map(mw => {
                if (typeof (mw) == 'object') {
                    if (mw.enabled) {
                        this.httpHandler.use(mw.handler)
                    }
                    return
                }
                if (typeof (mw) == 'function') {
                    this.httpHandler.use(mw)
                    return
                }
                this.logger.log('info', 'Cannot determinate middleware', { source: mw.toString() })
            })
        }
        this.httpHandler.listen(this.port)
    }
}