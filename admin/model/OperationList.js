define(['model','collection'],function (MyModel,MyCollection) {
	var Operation=MyModel.extend({
		defaults:{
			name:'',
			type:'',
			definition:'',
			parameters:'',
			description:'',
			id:null,
			code:'',
			typeId:null
		}
	})

	var OperationList=MyCollection.extend({
		model:Operation,
		url:'/webserviceAPI/list/operation'
	})
	
	return OperationList;
})