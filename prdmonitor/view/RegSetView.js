define(['jquery','underscore','backbone','cookie','bootstrap','RegModel','RegList','util','HostList','ServiceList','RegView'],
	function ($,_,Backbone,cookie,bootstrap,RegModel,RegList,util,HostList,ServiceList,RegView) {
/*************************************************************************************************************************************************/
//
//																	this view decide which expression to show
//															hostList and serviceList fetched when the page load successfully
//
//
//
//
/*************************************************************************************************************************************************/

	var RegSetView=Backbone.View.extend({
		el:$('body'),
		events:{
			'change #suitList':'renderRegByService',
			'change #fetchList':'renderRegByHost',
			'keyup #service-search input':'searchService'
		},
		permissions:{
			'.reg-nav':'/kxdadmin/chart/reg/R'
		},
		initialize:function () {
			this.hostList=new HostList();
			this.hostList.on('reset',this.renderSideSelect,this);

			this.serviceList=new ServiceList();
			this.serviceList.on('reset',this.renderSideSelect,this);

			this.suittarget='items';

			this.list=new RegList();
		},
		renderSideSelect:function () {
			$('#fetchList').empty();
			$('#suitList').empty();
			_.each(this.hostList.list,function (host) {
				$('#fetchList').append("<option>"+host+"</option>")
			})

			_.each(this.serviceList.list,function (service) {
				$('#suitList').append("<option>"+service+"</option>")
			})
		},
		renderRegByHost:function (dom) {
			var name=$("#fetchList option:selected").text();
			var target='host';
			var regList=new RegList();
			$('.setting-list').empty();
			regList.fetch({data:{target:target,name:name}})
			.done(function (result) {
				_.each(result.result,function (reg) {
					new RegView(new RegModel(reg));
				})
			})
		},
		renderRegByService:function (dom) {
			var name=$("#suitList option:selected").text();
			var target='service';
			var regList=new RegList();
			$('.setting-list').empty();
			regList.fetch({data:{target:target,name:name}})
			.done(function (result) {
				result.result[0].host=null;
				new RegView(new RegModel(result.result[0]));
			})
		},
		renderRegList:function (target,name) {
			var regList=new RegList();
			$('.setting-list').empty();
			regList.fetch({data:{target:target,name:name}})
			.done(function (result) {
				_.each(result.result,function (reg) {
					new RegView(new RegModel(reg));
				})
			})
		},
		searchService:function  () {
			var value=$('#service-search input').val();
			var reg=eval('/.*'+value.toLowerCase()+'.*/');
			var list=new Array();
			for(var i=0;i<this.serviceList.length;i++){
				if(reg.exec(this.serviceList.list[i].toLowerCase())!=null)
					list.push(this.serviceList.list[i]);
			}
			$('#suitList').empty();
			_.each(list,function (service) {
				$('#suitList').append("<option>"+service+"</option>")
			})
		}
	})
	return RegSetView;
})