define(['jquery','underscore','backbone','model'],function ($,_,Backbone,MyModel) {
	var FileDetail=MyModel.extend({
		url:'/svnserviceAPI/file',
		defaults:{
			path:null,
			revision:null,
			content:null,
			comment:null
		}
	})
	return FileDetail;
})