let root = ''
let colList = ''
let modelsView = {}
window.onload = function() {
    root = new Vue({
		data: {
			templates: null,
			list: null
		},
		methods: {
			initApp: function(callback) {
				this.$http.get(window.location.origin + '/api/v1/templates/getAll').then(res => {
					this.templates = res.body.templates
					colList = res.body.list
					modelsView = res.body.modelsView
                    callback()
                })
			}
		}
	})

	root.initApp(function() {
		let routeList = []
		routeList[routeList.length] = { path:'/', component: authPage() }
		routeList[routeList.length] = { path:'/main', component: mainPage() }
		for (i = 0; i < colList.length; i ++) {
			routeList[routeList.length] = { path:`/${colList[i]}`, component: mainPage() }
		}

		let router = new VueRouter({
            mode: 'history',
			routes: routeList
		});

		let app = new Vue({
			router
		}).$mount('#app')
	});
}
function authPage() {
	return {
		
		template: root.templates.auth,
		data: function() {
			return {
				authServiceRes: authService.res
			}
		},

		methods: {
			wysiwygInit: function(){
                // CKEDITOR.replace( 'editor1' );
		  	}
			
		},
		created: function() {
			// mainService.getInfo()
		}
		
	}
}
function mainPage() {
	return {
		
		template: root.templates.main,
		data: function() {
			return {
				mainServiceRes: mainService.res,
				columns: [],
				pageNumber: '',
				models: modelsView,
				editors: {},
				modelSearch: '',
				type: '',
				deleteWindow: false,
				columnsMenu: false
			}
		},
		computed: {
		},
		methods: {
			searchModels: function() {
				this.mainServiceRes.collectionsNameCount = {}
				let keys = Object.keys(this.mainServiceRes.list)
				let incl = []
				incl = keys.filter(item => {
					return item.toLowerCase().includes(this.modelSearch.toLowerCase())
				})
				for (k of incl) {
					this.mainServiceRes.collectionsNameCount[k] = this.mainServiceRes.list[k]
				}
				return this.mainServiceRes.collectionsNameCount
			},
			createNew: function(){
				this.type = 'new'
				this.mainServiceRes.modalView = true
				// for (let i = 0; i < this.mainServiceRes.fieldsForCreate.length; i++) {
				// 	this.mainServiceRes.newOutput[this.mainServiceRes.fieldsForCreate[i]] = ''
				// 	if (this.models[this.mainServiceRes.fieldsForCreate[i]] == 'text') {
				// 		let editor = 'editor' + i
				// 		CKEDITOR.replace( editor );
				// 	}
				// } 
			},
			chooseColumns: function() {
				this.mainServiceRes.columnsName = []
				this.mainServiceRes.columnsName.push('_id')
				for (let i = 0; i < this.columns.length; i ++) {
					this.mainServiceRes.columnsName.push(this.columns[i])
				}
				this.columnsMenu = false
				mainService.getCollection()
			},
			columnsDropdown: function() {
				if (this.columnsMenu == false) {
					this.columnsMenu = true
				} else if (this.columnsMenu == true) {
					this.columnsMenu = false
				}
				
			},
			closeAllDropdowns: function(event) {
				let el = this.$refs.dropdownMenu
				let target = event.target
				if ( el !== target && !el.contains(target) && this.columnsMenu == true && event.target.textContent != 'Columns') {
					this.columnsMenu = false
				}

			},
			chooseMatch() {
				// console.log('chooseMatch', this.mainServiceRes.match)
			},
			chooseCoincidence() {
				// console.log('chooseCoincidence', this.mainServiceRes.coincidence)
			},
			nextPage() {
				this.mainServiceRes.skip = this.mainServiceRes.skip + 1
				if (this.mainServiceRes.skip < 0 || this.mainServiceRes.skip > this.mainServiceRes.paginationList) {
					this.mainServiceRes.skip = 0
				}
				this.pageNumber = ''
				mainService.getCollection()
			},
			prevPage() {
				this.mainServiceRes.skip = this.mainServiceRes.skip - 1
				if (this.mainServiceRes.skip < 0 || this.mainServiceRes.skip > this.mainServiceRes.paginationList) {
					this.mainServiceRes.skip = 0
				}
				this.pageNumber = ''
				mainService.getCollection()
			},
			goToPage() {
				this.pageNumber = parseInt(this.pageNumber)
				if (Number.isInteger(this.pageNumber)) {
					if (this.pageNumber - 1 < 0 || this.pageNumber - 1 > this.mainServiceRes.paginationList) {
						this.mainServiceRes.skip = 0
					} else {
						this.mainServiceRes.skip = this.pageNumber - 1
					}
					mainService.getCollection()
				} else {
					this.mainServiceRes.skip = 0
					this.pageNumber = ''
					mainService.getCollection()
				}
			},
			search() {
				mainService.getCollection()
			},
			save() {
				// for (instance in CKEDITOR.instances) {
				// 	for (q in this.mainServiceRes.newOutput) {
				// 		console.log(this.newOutput, q)
				// 		if (this.mainServiceRes.newOutput[q] == undefined || this.newOutput[q] == null) {
				// 			let data = CKEDITOR.instances[instance].getData()
				// 			this.mainServiceRes.newOutput[q] = data
				// 		}
				// 	}
				// }
				for (k in this.mainServiceRes.newOutput) {
					if (typeof this.mainServiceRes.fieldsType[k] === 'object')  {
						if (typeof this.mainServiceRes.newOutput[k] != 'object') {
							try {
								this.mainServiceRes.newOutput[k] = JSON.parse(this.mainServiceRes.newOutput[k])
							} catch (e) {
								return alert('Object syntax error in ' + k)
							}
						}
					} else if (typeof this.mainServiceRes.fieldsType[k] === 'number')  {
						if (typeof this.mainServiceRes.newOutput[k] != 'number') {
							try {
								this.mainServiceRes.newOutput[k] = JSON.parseInt(this.mainServiceRes.newOutput[k])
							} catch (e) {
								return alert('Content must be an integer in' + k)
							}
						}
					}
				}
				if (this.type == 'edit') {
					mainService.editOne()
				} else if (this.type == 'new') {
					mainService.createNew()
				}
				this.type = ''
				mainService.getCollection()
			},
			edit(id) {
				// for (let i = 0; i < this.res.fieldsForCreate.length; i++) {
				// 	this.res.newOutput[this.res.fieldsForCreate[i]] = '...'
				// 	if (this.models[this.mainServiceRes.fieldsForCreate[i]] == 'text') {
				// 		let editor = 'editor' + i
				// 		CKEDITOR.replace( editor );
				// 	}
				// } 
				this.type = 'edit'
				this.mainServiceRes.id = id
				mainService.getOne()
			},
			deleteItem(id) {
				this.mainServiceRes.id = id
				this.deleteWindow = true
			},
			deleteConfirm() {
				mainService.delete()
				this.deleteWindow = false
				mainService.getCollection()
			},
			deleteDiscard() {
				this.mainServiceRes.id = ''
				this.deleteWindow = false
			},
			cancel() {
				this.mainServiceRes.modalView = false
				for(i in this.mainServiceRes.newOutput) {
					this.mainServiceRes.newOutput[i] = ''
				}
			},
			uploadPhoto(name, item) {
				let file = document.getElementById(name).files[0]
				let reader = new FileReader()
				let result = ''
				if (file) {
					reader.onloadend = (e)=> {
						result = reader.result
						let dataImg = {}
						dataImg['base64'] = result
						this.$http.post('/api/v1/upload', dataImg).then(response => {
							console.log(response.body.url)
							this.mainServiceRes.newOutput[item] = response.body.url
							console.log(this.mainServiceRes.newOutput[item])
						}, response => {
							console.log('error at upload photo', response)
						});
						// $.post( document.location.href + 'api/v1/upload', dataImg)
						// .done(function( data ) {
						// 	console.log( 'AZAZAZA', data );
						// });
					}
					reader.readAsDataURL(file)
				}
			}
			
		},
		created: function() {
			let path = window.location.pathname
			if (path != '/main' && path != '/') {
				let newPath = path.replace('/', '')
				this.mainServiceRes.collectionName = newPath
			}

			for (let i = 0; i < colList.length; i ++) {
				this.mainServiceRes.list[colList[i]] = '...'
			}
			this.mainServiceRes.collectionsNameCount = this.mainServiceRes.list
			mainService.getCount()
			mainService.getFields()
		}
		
	}
}
let authService = new Vue({
	data: {
		res: {
			info: []
		}
	},
	methods: {
		getInfo: function() {
            console.log('getInfo')
            this.res.info = 'koo koo'
			// this.$http.get('http://').then(res =>{
			// 	this.res.events = res.body.events;
			// })
		}
	}
})
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