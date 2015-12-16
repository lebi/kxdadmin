define(['jquery','underscore','backbone','model'],function ($,_,Backbone,MyModel) {
	var Operation=MyModel.extend({
		defaults:{
			name:null,
			parameters:'',
			type:'',
			typeId:null,
			id:null,
			definition:'',
			description:''
		},
		urlRoot:'/cmdbAPI/ops'
	})
	return Operation;
})