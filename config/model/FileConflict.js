define(['jquery','underscore','backbone','model'],function ($,_,Backbone,MyModel) {
	var FileConflict=MyModel.extend({
		url:'/svnserviceAPI/file/diffconflict',
		defaults:{
			path:null,
			action:null,
			content:null,
			comment:null
		}
	})
	return FileConflict;
})