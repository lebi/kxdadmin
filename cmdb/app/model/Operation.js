define(['underscore','backbone','model'],function (_,Backbone,MyModel) {
	var Operation=MyModel.extend({
		defaults:{
			name:null,
			parameters:null,
			type:null,
			id:null,
			definition:null,
			description:null
		}
	})
	return Operation;
})