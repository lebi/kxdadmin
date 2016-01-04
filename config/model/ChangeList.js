/*
*	@author:Huangyan
*	@Date:2016.1.4
*/

//本地更改的文件列表，将其POST到服务器提交更改
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