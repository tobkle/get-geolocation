'use strict'

import Axios from 'axios'
import http from 'http'
import https from 'https'

const options = {
    keepAlive: true,
    maxSockets: 15,
    keepAliveMsecs: 3000000
}

const axios = Axios.create({
    httpAgent: new http.Agent(options),
    httpsAgent: new https.Agent(options),
})

export default class Geolocation {

    constructor(options) {
        this._options = options
        this._promises = []
        this._GoogleApiKey = options.GoogleApiKey || ''
        this._keyField = options.keyField || 'key'
        this._sourceField = options.sourceField || 'postal_address'
        this._targetField = options.targetField ||  'geo'
    }

    add(source, callback) {
        source.forEach(source => {
            this._promises.push(this._wrap(source))
        })

        return Promise.all(this._promises).then(result => {
            callback(result)
        })
    }

    async _addGeolocation(source, cb) {
        const target = {
            [this._keyField]: source[this._keyField],
            [this._sourceField]: source[this._sourceField],
            [this._targetField]: null
        }
        try {
            if (source[this._sourceField] && source[this._sourceField] !== '') {
                const address_enc = encodeURI(source[this._sourceField])
                const url = `https://maps.googleapis.com/maps/api/geocode/json?key=${this._GoogleApiKey}&address=${address_enc}`
                const response = await axios.get(url)
                const data = response.data
                if (data.results && data.results.length > 0) {
                    target[this._targetField] = data.results[0].geometry.location
                    target[this._targetField].country = this._getCountry(data.results[0])
                    cb(target)
                }
            } else {
                cb(target)
            }
        } catch (error) {
            console.log('ERROR on code:', target[this._keyField], error)
            cb(target)
        }
    }

    _wrap(source, cb) {
        const p = new Promise((resolve, reject) => {
            this._addGeolocation(source, target => { resolve(target) })
        })
        return p
    }

    _getCountry(data) {
        if (data && data.address_components && data.address_components.length > 0) {
            const result = data.address_components.filter(component => {
                if (component.types.filter(type => type === 'country').length > 0)
                    return true
                else
                    return false
            })
            if (result && result.length > 0) {
                return {
                    short_name: result[0].short_name || '',
                    long_name: result[0].long_name || ''
                }
            }
        }
        return null
    }

}