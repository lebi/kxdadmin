define(['jquery','underscore','backbone','model'],function ($,_,Backbone,MyModel) {
	//kind: 0 means a directory,1 means file
	var DirEntry=MyModel.extend({
		defaults:{
			revision:null,
			name:null,
			path:null,
			date:null,
			kind:null,
			children:null,
			active:null
		}
	})
	return DirEntry;
})