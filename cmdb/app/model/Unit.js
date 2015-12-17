define(['jquery','underscore','backbone','model'],function ($,_,Backbone,MyModel) {
	var Unit=MyModel.extend({
		defaults:{
			id:null,
			name:null,
			layer:'',
			code:'',
			phone:null,
			dutyofficer:'',
			extend:[]
		},
		urlRoot:'/cmdbAPI/unit'
	})
	return Unit;
})