define(['model','collection'],function (MyModel,MyCollection) {
	var Unit=MyModel.extend({
		defaults:{
			name:'',
			code:'',
			dutyofficer:'',
			phone:'',
			layer:'',
			id:null,
			parent:null
		}
	})

	var UnitList=MyCollection.extend({
		model:Unit,
		url:'/webserviceAPI/list/unit'
	})
	
	return TypeList;
})