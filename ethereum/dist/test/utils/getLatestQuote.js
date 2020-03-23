"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
async function getLatestQuote() {
    const result = await axios_1.default.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=2913', {
        headers: {
            'X-CMC_PRO_API_KEY': '3b1acc4f-c5b2-4e9a-80e3-3cb9c92ca6d2',
        },
    });
    return result.data.data['2913'].quote.USD.price;
}
exports.getLatestQuote = getLatestQuote;
//# sourceMappingURL=getLatestQuote.js.map