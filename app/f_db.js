
const FroncubatorMongo = require('froncubator-mongo')

let db = ''

async function main() {
    db = new FroncubatorMongo()

    await db.connect('mongodb://mongo:27017/otrivin', 'otrivin')
 
   
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
            name: '',
            avatar: '',
            text: '',
            email: ''
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