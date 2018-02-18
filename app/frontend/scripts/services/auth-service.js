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