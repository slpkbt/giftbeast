
process.on('uncaughtException', (err) => { console.log(err) }); // Ignore ECONNRESET and other request errors, but we logs critical error on startup
process.on('unhandledRejection', (err) => { }); // Ignore ECONNRESET and other request errors

// Import modules

const request = require(`request`)
const fs = require(`fs`);

// Options

let glength = 16 // This means the number of characters in the gift code, it's usually 16, but discord can change that
let intervalms = 1000 // MS of interval (The smaller, the faster. Not less than zero.) 
let threads = 300 // How much intervals we should create
let proxy = `proxy.txt` // List of proxies that generator will use
let logerrors = false // Log errors (better turn it off)
let logcustom = false // Log custom messages from discord api (ratelimit etc)
const webhookurl = `` // Your webhook url to send logs right in discord

if (!webhookurl) return console.log(`Please configure your webhook at 16th line!`)

let unknown = 0
let success = 0

// Main functions

function log(message) { // Send log using webhookurl
    request.post({ url: webhookurl, form: { content: message } }, function (e, r, b) {
        console.log(e)
        console.log(b)
    });
}
function g(length) { // This function will allow us to generate a string with the number of characters specified in glength
    let r = ``;
    const c = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`;
    for (let i = 0; i < length; i++) {
        r += c.charAt(Math.floor(Math.random() * c.length));
    }
    return r;
}

let total = 0 // Just... Total?

function start() { // Start function

    console.clear()

    if (!fs.existsSync(proxy)) {
        return console.log(`Proxies were not found, make sure they are located in the root folder of the script and the file name is ${proxy}`)
    }

    let proxies = fs.readFileSync(`./${proxy}`, 'utf-8').replace(/\r/g, '').split('\n')

    if (!proxies) {
        return console.log(`Proxies were not found, make sure they are located in the root folder of the script and the file name is ${proxy}`)
    }

    console.log(`Loaded ${proxies.length} proxies, make sure that they're HTTP/S!`)
    for(let i = 0; i < threads; i++) {
        setInterval(() => {
            let code = g(glength);
    
            let takedproxy = proxies[Math.floor(Math.random() * proxies.length)] // We take a random proxy from our proxy file
    
            request({
                url: `https://discordapp.com/api/v6/entitlements/gift-codes/${code}?with_application=true&with_subscription_plan=true`,
                proxy: 'http://' + takedproxy
            }, (err, res, body) => {
    
                total++
                process.title = `giftbeast | ${total} requests | ${unknown} invalid | ${success} valid`
    
                if (err) return logerrors ? console.log(`[i] Error on ${takedproxy}`) : false
    
                let p = JSON.parse(body)
    
                if (p.message == `You are being rate limited.` || p.message == `The resource is being rate limited.`) {
                    if(logcustom) return console.log(`Rate limit on ${takedproxy}`)
                    return
                }
    
                if (p.message == `Unknown Gift Code`) {
                    unknown++
                    console.clear()
                    return console.log(`---------GIFTBEAST---------\n${unknown} invalid\n${success} valid\n${total} total`)
                }
    
                console.log(`sending ${code} with message ${p.message}`)
    
                log(`NitroCode found!\nCode: ${code}`)
    
            })
        }, intervalms);
    }


}


start() // Call start function