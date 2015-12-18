define(['jquery','underscore','backbone','model'],function ($,_,Backbone,MyModel) {
	var Asset=MyModel.extend({
		defaults:{
			id:null,
			name:'',
			code:'',
			unitId:null,
			typeId:null,
			unit:'',
			type:'',
			manufacturer:'',
			purpose:'',
			dutyofficer:'',
			ipAddress:'',
			purchaseTime:'',
			applytime:'',
			host:'',
			serverRoom:'',
			bracketId:'',
			typeDetail:null,
			properties:[]
		},
		urlRoot:'/cmdbAPI/asset'
	})
	return Asset;
})