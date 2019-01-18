export interface IConfig {
    db: {
        url: string,
        name: string
        opt?: object
    }
    ca: string
    http: {
        port: number
    }
}
export default {
    db: {
        url: process.env.DB_URL || 'mongodb://localhost:27017/myproject`',
        name: process.env.DB_NAME || 'ksu'
    },
    ca: process.env.CA_PATH || './assets/ca.pem',
    http: {
        port: process.env.PORT || 3000
    }
} as IConfig