const { promisify } = require('util')
const crypto = require('crypto')
const fs = require('fs')
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const mkdirp = promisify(require('mkdirp'))
const base64Img = require('base64-img')
const base64ImgIMG = promisify(base64Img.img)
const sharp = require('sharp')
const imageSize = promisify(require('image-size'))
const helper = require('./helper.js')

class Uploader {
    constructor() {
        this.subDirNumber = 4
        this.host = ''
        this.url = ''
        this.base64 = ''
        this.hash = ''
        this.uploaderFolder = './upload'
        this.baseWidth = 800
        this.filePath = ''
        this.thumbFilePath = ''
    }

    _isValidURL() {
        if (!this.url.includes('http')) {
            return false
        } else {
            return true
        }
    }

    _getHash(data) {
        const hash = crypto.createHmac('sha256', '')
                           .update(data)
                           .digest('hex')
        this.hash = hash
        return hash
    }

    async _mkdir() {
        const charsList = this.hash.match(/..?/gi)
        let path = ''

        for (let i=0; i<this.subDirNumber; i++) {
            path += '/' + charsList[i]
        }

        this.uploaderFolder += path
        const err = await mkdirp(this.uploaderFolder)
        if (err) {
            return false
        }

        return true
    }

    async _uploadFile() {
        this._getHash(this.url)
        await this._mkdir()

        this.filePath = this.uploaderFolder + '/' + this.hash
        this.thumbFilePath = this.uploaderFolder + '/t_' + this.hash

        try {
            await helper.downloadFile(this.url, this.filePath)
        } catch(err) {
            console.error(err)
        }
        return this.filePath
    }

    async _resizeImage() {
        try {
            let dimensions = await imageSize(this.filePath)
            if (dimensions.width > 800) {
                await sharp(this.filePath).resize(this.baseWidth, null)
                                          .jpeg({ quality: 95 })
                                          .toFile(this.thumbFilePath + '.jpg')
            } else {
                await sharp(this.filePath).jpeg({ quality: 95 })
                                          .toFile(this.thumbFilePath + '.jpg')
            }
        } catch(err) {
            console.log(err)
            return err
        }
    }

    async uploadImageBase64(base64 = '') {
        this.base64 = base64
        this._getHash(this.base64)
        await this._mkdir()

        this.thumbFilePath = this.uploaderFolder + '/t_' + this.hash
        this.filePath = await base64ImgIMG(base64, this.uploaderFolder, this.hash)
        await this._resizeImage()

        let path = this.thumbFilePath.replace(/(\.\.)|(\.)/gi, '') + '.jpg'
        return this.host + path
    }

    async uploadImage(url = '') {
        this.url = url
        if (!this._isValidURL())
            return false
        await this._uploadFile()
        await this._resizeImage()
        let path = this.thumbFilePath.replace(/(\.\.)|(\.)/gi, '') + '.jpg'
        return this.host + path
    }

}

module.exports = {
    Uploader
}
