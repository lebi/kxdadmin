define(['underscore','backbone','model'],function (_,Backbone,MyModel) {
	var OperationType=MyModel.extend({
		defaults:{
			name:null,
			id:null,
		},
		urlRoot:'/cmdbAPI/ops/type'
	})
	return OperationType;
})