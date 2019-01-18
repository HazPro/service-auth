import * as config from './config'
import * as HTTP from './http'
import * as DB from './db'
import { Auth } from '@hazpro/auth'

const db = new DB.default(config.default)
const http = new HTTP.default(config.default.http.port, null, db, config.default)
http.start()