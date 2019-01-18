import * as config from './config'
import * as HTTP from './http'
import * as DB from './db'
import { Certificate } from './cert'

const db = new DB.default(config.default)
const ca = Certificate.fromFile('./assets')
//const http = new HTTP.default(config.default.http.port, null, db, config.default)
//http.start()