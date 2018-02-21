
const FroncubatorMongo = require('froncubator-mongo')
const exec = require('child_process').exec

let db = ''

let hostIP = ''

async function main() {
    db = new FroncubatorMongo()

    exec("/sbin/ip route|awk '/default/ { print $3 }'", (error, stdout, stderr) => {
        hostIP = stdout.replace(/[^0-9\.]/gi,'')
        db.connect('mongodb://' + hostIP + ':27017/otrivin', 'otrivin')
    })
    // await db.connect('mongodb://' + hostIP + ':27017/otrivin', 'otrivin')
 
   
    db.modelsView = {
        name: 'char',
        city: 'char',
        email: 'char',
        social: 'char',
        age: 'char',
        avatar: 'img',
        text: 'text',
        photo1: 'img',
        photo2: 'img',
        photo3: 'img',
        show: 'char',
        date: 'char'
    }

    db.models.users = function() {
        return {
            name: '',
            city: '',
            email: '',
            social: '',
            age: ''
        }
    },
    db.models.winner = function() {
        return {
            avatar: '',
            email: '',
            name: '',
            text: '',
            photo1: '',
            photo2: '',
            photo3: '',
            date: ''
        }
    },
    db.models.review = function() {
        return {
            avatar: '',
            email: '',
            name: '',
            text: '',
            photo1: '',
            photo2: '',
            photo3: '',
            date: ''
        }
    },
    db.models.showBlocks = function() {
        return {
            name: '',
            show: ''
        }
    }
}

main()

module.exports = db