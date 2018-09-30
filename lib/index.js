'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var options = {
    keepAlive: true,
    maxSockets: 15,
    keepAliveMsecs: 3000000
};

var axios = _axios2.default.create({
    httpAgent: new _http2.default.Agent(options),
    httpsAgent: new _https2.default.Agent(options)
});

var Geolocation = function () {
    function Geolocation(options) {
        _classCallCheck(this, Geolocation);

        this._options = options;
        this._promises = [];
        this._GoogleApiKey = options.GoogleApiKey || '';
        this._keyField = options.keyField || 'key';
        this._sourceField = options.sourceField || 'postal_address';
        this._targetField = options.targetField || 'geo';
    }

    _createClass(Geolocation, [{
        key: 'add',
        value: function add(source, callback) {
            var _this = this;

            source.forEach(function (source) {
                _this._promises.push(_this._wrap(source));
            });

            return Promise.all(this._promises).then(function (result) {
                callback(result);
            });
        }
    }, {
        key: '_addGeolocation',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(source, cb) {
                var _target;

                var target, address_enc, url, response, data;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                target = (_target = {}, _defineProperty(_target, this._keyField, source[this._keyField]), _defineProperty(_target, this._sourceField, source[this._sourceField]), _defineProperty(_target, this._targetField, null), _target);
                                _context.prev = 1;

                                if (!(source[this._sourceField] && source[this._sourceField] !== '')) {
                                    _context.next = 12;
                                    break;
                                }

                                address_enc = encodeURI(source[this._sourceField]);
                                url = 'https://maps.googleapis.com/maps/api/geocode/json?key=' + this._GoogleApiKey + '&address=' + address_enc;
                                _context.next = 7;
                                return axios.get(url);

                            case 7:
                                response = _context.sent;
                                data = response.data;

                                if (data.results && data.results.length > 0) {
                                    console.log('City: ' + data.results[0].formatted_address + ' -', 'Latitude: ' + data.results[0].geometry.location.lat + ' -', 'Longitude: ' + data.results[0].geometry.location.lng);
                                    target[this._targetField] = data.results[0].geometry.location;
                                    target[this._targetField].country = this._getCountry(data.results[0]);
                                    cb(target);
                                }
                                _context.next = 13;
                                break;

                            case 12:
                                cb(target);

                            case 13:
                                _context.next = 19;
                                break;

                            case 15:
                                _context.prev = 15;
                                _context.t0 = _context['catch'](1);

                                console.log('ERROR on code:', target[this._keyField], _context.t0);
                                cb(target);

                            case 19:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[1, 15]]);
            }));

            function _addGeolocation(_x, _x2) {
                return _ref.apply(this, arguments);
            }

            return _addGeolocation;
        }()
    }, {
        key: '_wrap',
        value: function _wrap(source, cb) {
            var _this2 = this;

            var p = new Promise(function (resolve, reject) {
                _this2._addGeolocation(source, function (target) {
                    resolve(target);
                });
            });
            return p;
        }
    }, {
        key: '_getCountry',
        value: function _getCountry(data) {
            if (data && data.address_components && data.address_components.length > 0) {
                var result = data.address_components.filter(function (component) {
                    if (component.types.filter(function (type) {
                        return type === 'country';
                    }).length > 0) return true;else return false;
                });
                if (result && result.length > 0) {
                    return {
                        short_name: result[0].short_name || '',
                        long_name: result[0].long_name || ''
                    };
                }
            }
            return null;
        }
    }]);

    return Geolocation;
}();

exports.default = Geolocation;