define(['jquery','underscore','backbone','model'],function ($,_,Backbone,MyModel) {
	var ChangeList=MyModel.extend({
		url:'/svnserviceAPI/component',
		defaults:{
			list:null,
			comment:null,
			force:false,
			revision:null
		}
	})
	return ChangeList;
})