const fs = require('fs')
const exec = require('child_process').exec
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')

let db = require('./f_db.js')
let helper = require('./helper')
const { Uploader } = require('./uploader.js')

let appVersion = 'v.0.0.1'

var app = express()

app.use(helmet({
    frameguard: false
}))

function allowCrossDomain(req, res, next) {
    let originHost = req.headers.origin || req.headers.host
    res.header('Access-Control-Allow-Origin', originHost)
    res.header('Access-Control-Allow-Methods', '*')
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    res.header('Access-Control-Allow-Credentials', 'true')
    next()
}

app.use(allowCrossDomain)
app.use(cookieParser())
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use('/images', express.static('./images'))
app.use('/static', express.static('./frontend'))

// upload photo
app.post('/admin/api/v1/upload', async (req, res) => {
    const uploader = new Uploader()
    uploader.uploaderFolder = './images'
    uploader.host = 'https://konkurs-otrivin.ru'
    let url = ''
    if (req.body.url != undefined) {
        let type = await helper.fileType(req.body.url)
        if (type != 'jpg' && type != 'jpeg' && type != 'png') {
            return res.send({
                error: 'Invalid support. Available extensions: jpg, png'
            })
        }
        url = await uploader.uploadImage(req.body.url)
    } else {
        url = await uploader.uploadImageBase64(req.body.base64)
    }
    res.send({
        url
    })
})

//get all templates and collection names
app.get('/admin/api/v1/templates/getAll', async (req, res) => {
    let data = {
        templates: {},
        list: [],
        modelsView: {}
    }
    data.modelsView = db.modelsView
    let temp = {}
    for (k in db.models) {
        data.list[data.list.length] = k
    }
    fs.readdir('./frontend/templates/directives/', async (err, files) => {
        for (let file of files) {
            if (!file.includes('.DS_')) {
                let output = await helper.readFile('./frontend/templates/directives/' + file)
                let fileOutput = file.split('').splice(0, 4).join('')
                temp[fileOutput] = output
                
            }
        }
        data.templates = temp
        res.send(data)
    })
})

//get all fields from collection
app.post('/admin/api/v1/collections/names', async (req, res) => {
    let collectionName = req.body.data
    if (collectionName.length > 0) {
        let arr = db.models[collectionName]()
        let fieldsName = []
        for (k in arr) {
            if (k != 'password' && k != 'token') {
                fieldsName[fieldsName.length] = k
            }
        }
        res.send(fieldsName)
    }
})

//get collection
app.post('/admin/api/v1/collection/fields', async (req, res) => {
    try {
        let collectionName = req.body.name
        let collectionColumns = req.body.columns
        let skip = req.body.skip
        let match = req.body.match
        let coincidence = req.body.coincidence
        let searchIn = req.body.searchIn
        let searchString = req.body.searchString

        let fields = {} 
        for (let i = 0; i < collectionColumns.length; i++) {
            fields[collectionColumns[i]] = 1
        }

        if (searchString.length == 0) {
            let search =  {}
            search[searchIn] = searchString

            let output = await db.find(collectionName,
                { }, 
                {  
                    fields: fields,
                    limit: 100,
                    skip: skip
                }, {
                    // count: true 
                }
            )
            let count = await db.find(collectionName,
                { }, 
                {  
                    fields: fields,
                    // limit: 100,
                    skip: skip
                }, {
                    count: true 
                }
            )
            res.send({ output, count })
        } else {
            if (coincidence == 'contains' && match != "not match") {
                searchString = {$regex : `.*${searchString}.*`}
            } else if (coincidence != 'contains' && match == "not match") {
                searchString = {$ne : `${searchString}`}
            } else if (coincidence == 'contains' && match == "not match") {
                let re = new RegExp(searchString,"g");
                searchString = {$not : re}
            }
    
            let search =  {}
            if (searchIn == "_id" && searchString.length == 24) {
                searchString = db.toObjectID(searchString)
            }
            search[searchIn] = searchString

            let output = await db.find(collectionName, search, 
                {  
                    fields: fields,
                    limit: 100,
                    skip: skip
                }, {
                    // count: true 
                }
            )
            let count = await db.find(collectionName, search, 
                {  
                    fields: fields,
                    // limit: 100,
                    skip: skip
                }, {
                    count: true 
                }
            )
            res.send({ output, count })

        }

    } catch (err) {
        console.log('/admin/api/v1/collection/fields', err)
    }
})

//get collection count
app.post('/admin/api/v1/collection/count', async (req, res) => {
    try {
        let collectionName = Object.keys(req.body.name)
        let output = {}
        for (let i = 0; i < collectionName.length; i ++) {
            let count = await db.find(collectionName[i],
                { }, 
                {  
                }, {
                    count: true 
                }
            )
            output[collectionName[i]] = count + ''
        }

        res.send(output)

    } catch (err) {
        console.log('/admin/api/v1/collection/count', err)
    }
})

//get one
app.post('/admin/api/v1/collections/get/one', async (req, res) => {
    try {
        let collectionName = req.body.name
        let id = req.body.id
        
        let output = await db.find(collectionName,
            { "_id": db.toObjectID(id) }, 
            {  
                fields: {
                    password: 0,
                    token: 0
                },
                // limit: 100,
                // skip: skip
            }, {
                // count: true 
            }
        )
        res.send(output)

    } catch (err) {
        console.log('/admin/api/v1/collection/get/one', err)
    }
})

//update one
app.post('/admin/api/v1/collections/update/one', async (req, res) => {
    try {
        let collectionName = req.body.name
        let update = req.body.update
        let id = req.body.id
        
        await db.updateOne(collectionName,
            { "_id": db.toObjectID(id) }, 
            { 
                $set: update
            }
        )
        res.send(true)

    } catch (err) {
        console.log('/admin/api/v1/update/one', err)
    }
})

//delete one
app.post('/admin/api/v1/collections/delete/one', async (req, res) => {
    try {
        let collectionName = req.body.name
        let id = req.body.id
        
        await db.deleteOne(collectionName, { "_id": db.toObjectID(id) })
        res.send(true)

    } catch (err) {
        console.log('/admin/api/v1/update/one', err)
    }
})

//create new 
app.post('/admin/api/v1/collections/create', async (req, res) => {
    try {
        let collectionName = req.body.name
        let update = req.body.update
        
        await db.insert(collectionName, update)
        res.send(true)

    } catch (err) {
        console.log('/admin/api/v1/collection/create', err)
    }
})

app.get('*', (req, res) => {
    fs.readFile('./frontend/templates/index.html', 'utf8', (err, output) => {
        output = output.replace(/\<script backend\-env\>\<\/script\>/gi, '<script>var appVersion = "' + appVersion + '";</script>')
        output = output.replace(/\?version\=1/gi, `?version=${new Date().getTime()}`)
        res.send(output)
    })
})

exec('cd ./frontend && gulp', (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }

    console.log(`stdout: ${stdout}`);

    if (stderr) {
        console.log(`stderr: ${stderr}`);
    }
});

app.listen(process.env.PORT || 8080)