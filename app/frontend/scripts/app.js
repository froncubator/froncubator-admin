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
				console.log('INIT', window.location.origin)
				this.$http.get(window.location.origin + '/admin/api/v1/templates/getAll').then(res => {
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
		// routeList[routeList.length] = { path:'/', component: authPage() }
		routeList[routeList.length] = { path:'/admin', component: mainPage() }
		routeList[routeList.length] = { path:'/admin/main', component: mainPage() }
		for (i = 0; i < colList.length; i ++) {
			routeList[routeList.length] = { path:`/admin/${colList[i]}`, component: mainPage() }
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