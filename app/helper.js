const fs = require('fs')
const u = require('url')
const adapters = {
    'http:': require('http'),
    'https:': require('https')
}
const fileType = require('file-type')

const helper = {}

helper.downloadFile = function(url, path) {
    return new Promise((resolve, reject) => {
        let file = fs.createWriteStream(path)
        const r = adapters[u.parse(url).protocol]

        let request = r.get(url, (res) => {
            res.pipe(file)
            file.on('finish', () => {
                file.close()
                resolve(path)
            })
        }).on('error', (err) => {
            helper.sendErr(null, err)
            fs.unlink(path)
            reject(err)
        })
    })
}

helper.fileType = function(url) {
    return new Promise((resolve, reject) => {
        const r = adapters[u.parse(url).protocol]
        r.get(url, (res) => {
            res.once('data', chunk => {
                res.destroy();
                let ch = fileType(chunk) //=> {ext: 'gif', mime: 'image/gif'}
                if (ch != null) {
                    let type = ch.ext
                    resolve(type)
                } else {
                    resolve(undefined)
                }
            });
        }).on('error', (err) => {
            helper.sendErr(null, err)
            fs.unlink(path)
            reject(err)
        })
    })
}

helper.isEmail = function(value) {
    if (typeof value == 'string' && value.indexOf('@') != -1 && value.indexOf('.') != -1 && value.length >= 5) {
        return true
    } else {
        return false
    }
}


helper.unirestGet = function(url) {
    return new Promise((resolve, reject) => {
        unirest.get(url)
        .headers({'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'})
        .end(function (response) {
            resolve(response.raw_body)
        });
    })
}

helper.readFile = function(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, output) => {
            if (err) return reject(err)
            resolve(output)
        })
    })
}

module.exports = helper