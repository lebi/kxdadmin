define(['jquery','underscore','backbone','model'],function ($,_,Backbone,MyModel) {
	var DiffEntry=MyModel.extend({
		url:'/svnserviceAPI/file/diff',
		defaults:{
			fileA:null,
			rA:null,
			fileB:null,
			rB:null,
			diff:null
		}
	})
	return DiffEntry;
})