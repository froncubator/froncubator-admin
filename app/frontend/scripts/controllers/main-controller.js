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
				columnsMenu: false,
				newOutput : {

				}
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
				for (let i = 0; i < this.mainServiceRes.fieldsForCreate.length; i++) {
					this.$set(this.newOutput, this.mainServiceRes.fieldsForCreate[i], '')
				// 	if (this.models[this.mainServiceRes.fieldsForCreate[i]] == 'text') {
				// 		let editor = 'editor' + i
				// 		CKEDITOR.replace( editor );
				// 	}
				} 
				setTimeout(() => {
					this.mainServiceRes.modalView = true
					
				}, 100);
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
				this.mainServiceRes.newOutput = this.newOutput
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
				this.newOutput = this.mainServiceRes.newOutput
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
				for(i in this.newOutput) {
					this.newOutput[i] = ''
				}
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
							this.$set(this.newOutput, item, response.body.url)
						}, response => {
							console.log('error at upload photo', response)
						});
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