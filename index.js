"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var twit_1 = __importDefault(require("twit"));
var dotenv_1 = __importDefault(require("dotenv"));
var node_fetch_1 = __importDefault(require("node-fetch"));
var util_1 = require("util");
dotenv_1.default.config();
var CovidTweeter = /** @class */ (function () {
    function CovidTweeter() {
        var _this = this;
        this.API_URL = process.env.API_URL;
        this.HOSPITAL_URL = process.env.HOSPITAL_URL || '';
        this.ICU_URL = process.env.ICU_URL || '';
        this.consumer_key = process.env.APPLICATION_CONSUMER_KEY;
        this.consumer_secret = process.env.APPLICATION_CONSUMER_SECRET;
        this.access_token = process.env.ACCESS_TOKEN;
        this.access_token_secret = process.env.ACCESS_TOKEN_SECRET;
        this.tweetSummary = function () { return __awaiter(_this, void 0, void 0, function () {
            var cases, deaths, hospitalCases, icuCases, casesParsed, deathsParsed, hospitalCasesParsed, icuCasesParsed, hospitalizations, icuAdmissions, date, formattedDate, tweetText, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 10, , 11]);
                        return [4 /*yield*/, node_fetch_1.default(this.API_URL + "/daily/cases", { method: 'GET' })];
                    case 1:
                        cases = _a.sent();
                        return [4 /*yield*/, node_fetch_1.default(this.API_URL + "/daily/deaths", { method: 'GET' })];
                    case 2:
                        deaths = _a.sent();
                        return [4 /*yield*/, node_fetch_1.default(this.HOSPITAL_URL, { method: 'GET' })];
                    case 3:
                        hospitalCases = _a.sent();
                        return [4 /*yield*/, node_fetch_1.default(this.ICU_URL, { method: 'GET' })];
                    case 4:
                        icuCases = _a.sent();
                        return [4 /*yield*/, cases.json()];
                    case 5:
                        casesParsed = _a.sent();
                        return [4 /*yield*/, deaths.json()];
                    case 6:
                        deathsParsed = _a.sent();
                        return [4 /*yield*/, hospitalCases.json()];
                    case 7:
                        hospitalCasesParsed = _a.sent();
                        return [4 /*yield*/, icuCases.json()];
                    case 8:
                        icuCasesParsed = _a.sent();
                        console.log(hospitalCasesParsed);
                        hospitalizations = hospitalCasesParsed.features[0].attributes.SUM_number_of_confirmed_covid_1_sum;
                        icuAdmissions = icuCasesParsed.features[0].attributes.ncovidconf_sum;
                        date = new Date();
                        formattedDate = date.toLocaleDateString('en-ie', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                        tweetText = formattedDate + "\n  Cases: " + casesParsed + " \uD83E\uDDA0\n  Deaths: " + deathsParsed + " \u26B0\uFE0F\n  Confirmed cases in Hospital: " + hospitalizations + " \uD83E\uDE7A\n  Confirmed cases in ICU: " + icuAdmissions + " \uD83C\uDFE5\n  #COVID19 #ireland #covid19Ireland";
                        return [4 /*yield*/, this.postPromise(tweetText)];
                    case 9:
                        _a.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        err_1 = _a.sent();
                        console.error(err_1);
                        return [3 /*break*/, 11];
                    case 11: return [2 /*return*/];
                }
            });
        }); };
        this.postPromise = util_1.promisify(function (tweetText) { return _this.twitClient.post('statuses/update', { status: tweetText }, function (err, data, response) {
            if (err)
                console.error("Error: " + JSON.stringify(err));
            if (response)
                console.log("Response: " + JSON.stringify(response));
            if (data)
                console.log("Data: " + JSON.stringify(data));
        }); });
        if (this.consumer_key && this.consumer_secret && this.access_token && this.access_token_secret) {
            this.twitClient = new twit_1.default({
                consumer_key: this.consumer_key,
                consumer_secret: this.consumer_secret,
                access_token: this.access_token,
                access_token_secret: this.access_token_secret
            });
        }
        else {
            throw new Error('Twitter keys not set');
        }
    }
    return CovidTweeter;
}());
exports.handler = function () { return __awaiter(_this, void 0, void 0, function () {
    var bot;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                bot = new CovidTweeter;
                return [4 /*yield*/, bot.tweetSummary()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
