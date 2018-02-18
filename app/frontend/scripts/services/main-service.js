let mainService = new Vue({
	data: {
		res: {
			info: [],
			fieldsName: [],
			columnsName: [],
			collectionsNameCount: {},
			fields: {},
			skip: 0,
			collectionName: '',
			list: {},
			paginationList: 0,
			match: 'match',
			coincidence: 'exactly',
			searchIn: '_id',
			searchString: '',
			fieldsForCreate: [],
			id: '',
			newOutput: {},
			modalView: false,
			fieldsType: {},
			list: {}
		}
	},
	methods: {
		getCount: function() {
			this.$http.post('/api/v1/collection/count', { name: this.res.collectionsNameCount }).then(response => {
				this.res.collectionsNameCount = response.body
				this.res.list = this.res.collectionsNameCount
				let count = this.res.collectionsNameCount[this.res.collectionName]
				if (count != undefined)
					this.res.paginationList = Math.floor(count/100)
			}, response => {
				console.log('error at getCount()', response)
			});
		},
		getCollection: function() {
			this.$http.post('/api/v1/collection/fields', { name: this.res.collectionName, columns: this.res.columnsName, skip: this.res.skip, match: this.res.match, coincidence: this.res.coincidence, searchIn: this.res.searchIn, searchString: this.res.searchString }).then(response => {
				this.res.fields = response.body.output
				let count = response.body.count
				if (count != undefined)
					this.res.paginationList = Math.floor(count/100)
			}, response => {
				  console.log('error at getCollection()', response)
			});
		},
		getFields: function() {
			this.$http.post('/api/v1/collections/names', { data: this.res.collectionName }).then(response => {
				this.res.fieldsName = response.body
				let resp = response.body
				for (let i = 0; i < resp.length; i ++) {
					this.res.fieldsForCreate.push(resp[i])
				}
				let index = this.res.fieldsForCreate.indexOf('_id');
				if (index > -1) {
					this.res.fieldsForCreate.splice(index, 1);
				}

				if (this.res.fieldsName.indexOf('_id') == -1) {
					this.res.fieldsName.unshift('_id')
				}
				for (let i=0; i<4; i++) {
					if (this.res.fieldsName[i] != undefined) {
						this.res.columnsName[this.res.columnsName.length] = this.res.fieldsName[i]
					}
				}
				// this.res.newOutput.length = this.res.fieldsForCreate.length
				for (let i = 0; i < this.res.fieldsForCreate.length; i++) {
					this.res.newOutput[this.res.fieldsForCreate[i]] = ''
					// if (this.models[this.mainServiceRes.fieldsForCreate[i]] == 'text') {
					// 	let editor = 'editor' + i
					// 	CKEDITOR.replace( editor );
					// }
				} 
				this.getCollection()
			}, response => {
				  console.log('error at getFields()', response)
			});
		},
		getOne: function() {
			this.$http.post('/api/v1/collections/get/one', { name: this.res.collectionName, id: this.res.id }).then(response => {
				let resp = response.body[0]
				this.res.fieldsType = response.body[0]
				for (k in this.res.newOutput) {
					if (typeof resp[k] === 'object')  {
						this.res.newOutput[k] = JSON.stringify(resp[k])
					} else if (resp[k] == undefined) {
						this.res.newOutput[k] = ''
					} else {
						this.res.newOutput[k] = resp[k]
					}
				}
				this.res.modalView = true
			}, response => {
				  console.log('error at getOne()', response)
			});
		},
		editOne: function() {
			this.$http.post('/api/v1/collections/update/one', { name: this.res.collectionName, id: this.res.id, update: this.res.newOutput }).then(response => {
				let resp = response.body
				if (resp === true) {
					this.res.modalView = false
				}
			}, response => {
				  console.log('error at editOne()', response)
			});
		},
		createNew: function() {
			this.$http.post('/api/v1/collections/create', { name: this.res.collectionName, update: this.res.newOutput }).then(response => {
				let resp = response.body
				if (resp === true) {
					this.res.modalView = false
				}
			}, response => {
				  console.log('error at createNew()', response)
			});
		},
		delete: function() {
			this.$http.post('/api/v1/collections/delete/one', { name: this.res.collectionName, id: this.res.id }).then(response => {
				let resp = response.body
			}, response => {
				  console.log('error at createNew()', response)
			});
		}
	}
})