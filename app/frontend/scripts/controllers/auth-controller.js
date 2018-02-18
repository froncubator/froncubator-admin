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