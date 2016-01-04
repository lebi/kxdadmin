define(['jquery','underscore','backbone','model'],function ($,_,Backbone,MyModel) {
	var ComponentFileEntry=MyModel.extend({
		defaults:{
			path:null,
			revision:null,
			name:null,
			time:null,
			author:null,
			comment:null
		}
	});
	return ComponentFileEntry;
})