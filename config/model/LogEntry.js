define(['jquery','underscore','backbone','model'],function ($,_,Backbone,MyModel) {
	//kind: 0 means a directory,1 means file
	var LogEntry=MyModel.extend({
		defaults:{
			message:null,
			author:null,
			date:null,
			revision:null
		}
	})
	return LogEntry;
})