define(['jquery','underscore','backbone','model'],function ($,_,Backbone,MyModel) {
	var Asset=MyModel.extend({
		defaults:{
			id:null,
			unitId:null,
			typeId:null,
			name:'',
			unit:'',
			type:'',
			code:'',
			manufacturer:'',
			purpose:'',
			dutyofficer:'',
			ipAddress:'',
			purchaseTime:'',
			applyTime:'',
			host:'',
			serverRoom:'',
			bracketId:'',
			typeDetail:{},
			properties:[]
		},
		urlRoot:'/cmdbAPI/asset'
	})
	return Asset;
})