import * as user from './auth/user'
import * as service from './auth/service'
export default [
    {
        enabled: true,
        name: 'User auth handler',
        handler: user
    },
    {
        enabled: true,
        name: 'Service auth handler',
        handler: service
    }
]