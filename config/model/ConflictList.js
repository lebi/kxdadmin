define(['jquery','underscore','backbone','model'],function ($,_,Backbone,MyModel) {
	var ConflictList=MyModel.extend({
		url:'/svnserviceAPI/component/conflict',
		defaults:{
			list:null,
			comment:null,
			force:false,
			revision:null
		}
	})
	return ConflictList;
})