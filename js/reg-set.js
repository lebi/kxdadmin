//********************************************************************************************************************//
//														2015.8.10
//													edited by Huang Yan
//
//
//********************************************************************************************************************


var HostList=Backbone.Collection.extend({
	url:"/demo/monitor/hosts",
	initialize:function () {
		this.list=null;
	}
})

var ServiceList=Backbone.Collection.extend({
	url:"/demo/monitor/services",
	initialize:function () {
		this.list=null;	}
})

var RegModel=Backbone.Model.extend({
	url:'/demo/chart/reg',
	defaults:{
		id:null,
		objectId:null,
		host:null,
		service:null,
		sample:null,
		reg:null,
		parameters:null
	}
})

var RegList=Backbone.Collection.extend({
	model:RegModel,
	url:'/demo/chart/reg/list'
})

/*************************************************************************************************************************************************/
//
//															this view show the details of a regular expression
//																edit thie view to update the regualr expression
//																		and update it's parameters 
//																
//
/*************************************************************************************************************************************************/

var RegView=Backbone.View.extend({
	el:$('.service'),
	events:{
		'click .edit-reg':'renderEdit',
		'click .save-reg':'saveReg',
		'click .add-param':'addParam',
		'click .cancel-reg':'cancelEdit',
		'keyup input[name=regexp]':'printMatch'
	},
	initialize:function (regModel) {
		this.model=regModel;
		var temp=_.template($("#service-temp").html());
		$('.setting-list').append(temp({reg:this.model}));
		this.$el=$('#service'+this.model.get('objectId'));
		this.delegateEvents();
	},
	renderEdit:function () {
		var next=this.$el.next();
		var temp=_.template($("#edit-temp").html());
		this.$el.remove();
		if (next.length!=0) 
			$(next).before(temp({reg:this.model}));
		else
			$('.setting-list').append(temp({reg:this.model}));
		this.$el=$('#service'+this.model.get('objectId'));
		this.delegateEvents();
		this.printMatch();
	},
	saveReg:function() {
		var regexp=$('input[name=regexp]',this.$el).val();
		var param="";
		$('input[name=param]',this.$el).each(function (){
			if($(this).val()!="")
				param+=$(this).val()+";";
		})
		param=param.substr(0,param.length-1);
		this.model.set('reg',regexp);
		this.model.set('parameters',param);
		var self=this;
		this.model.save()
		.done(function (model){
			self.model.set('id',model.id);
			var next=self.$el.next();
			var temp=_.template($("#service-temp").html());
			console.log(self.$el);
			self.$el.remove();
			if (next.length!=0) 
				$(next).before(temp({reg:self.model}));
			else
				$('.setting-list').append(temp({reg:self.model}));
			self.$el=$('#service'+self.model.get('objectId'));
			self.delegateEvents();
		})
	},
	addParam:function() {
		$('.content-input',this.$el).parent().append('<input class="form-control content-input" name="param">');
	},
	cancelEdit:function() {			
		var next=this.$el.next();
		var temp=_.template($("#service-temp").html());
		this.$el.remove();
		if (next.length!=0) 
			$(next).before(temp({reg:this.model}));
		else
			$('.setting-list').append(temp({reg:this.model}));
		this.$el=$('#service'+this.model.get('objectId'));
		this.delegateEvents();
	},
	printMatch:function () {
		$('span[name=output]').empty();
		var paramList=new Array();
		$('input[name=param]',this.$el).each(function (){
			paramList.push($(this).val());
		})
		var reg=$('input[name=regexp]').val();
		console.log(reg);
		reg='/'+reg+'/g';
		var regx=eval(reg);
        if(regx!=null)
            var match=regx.exec( this.model.get('sample') );
        if(match==null)
        	match=new Array();
        for(var i=0;i<paramList.length;i++){
        	if(i+1>=match.length)
        		$('span[name=output]').append(paramList[i]+": ; ");
        	else $('span[name=output]').append(paramList[i]+":"+match[i+1]+"; ")
        }
	}
})


/*************************************************************************************************************************************************/
//
//																	this view decide which expression to show
//															hostList and serviceList fetched when the page load successfully
//
//
//
//
/*************************************************************************************************************************************************/

var PageView=Backbone.View.extend({
	el:$('body'),
	events:{
		// 'click #exchange':'exchangeList',
		// 'click #showsetting':'renderServices',
		'click #fetchList option':'renderRegByHost',
		'click #suitList option':'renderRegByService',
	},
	initialize:function () {
		this.hostList=new HostList();
		this.serviceList=new ServiceList();
		this.suittarget='items';

		this.list=new RegList();
		this.initSideSelect();
	},
	initSideSelect:function  () {		
		var self=this;
		this.hostList.fetch()
		.done(function (collection) {
			self.hostList.list=collection;
			self.renderSideSelect();
		})

		this.serviceList.fetch()
		.done(function (collection) {
			self.serviceList.list=collection;
			self.renderSideSelect();
		})
	},
	renderSideSelect:function () {
		// var title1=$($('.side-select .select h3').get(0)).text();
		$('#fetchList').empty();
		$('#suitList').empty();
		// if(title1=="主机列表"){
		// 	this.suittarget='items';
		// 	_.each(this.hostList.list,function (host) {
		// 		$('#fetchList').append("<option>"+host+"</option>")
		// 	})
		// }else if(title1=="服务列表"){
		// 	this.suittarget='hosts';
		// 	_.each(this.serviceList.list,function (service) {
		// 		$('#fetchList').append("<option>"+service+"</option>")
		// 	})
		// }
		_.each(this.hostList.list,function (host) {
			$('#fetchList').append("<option>"+host+"</option>")
		})

		_.each(this.serviceList.list,function (service) {
			$('#suitList').append("<option>"+service+"</option>")
		})
	},
	renderRegByHost:function (dom) {
		var name=$(dom.target).text();
		console.log(name);
		var target='host';
		this.renderRegList(target,name);
	},
	renderRegByService:function (dom) {
		var name=$(dom.target).text();
		console.log(name);
		var target='service';
		this.renderRegList(target,name);
	},
	renderRegList:function (target,name) {
		var regList=new RegList();
		$('.setting-list').empty();
		regList.fetch({data:{target:target,name:name}})
		.done(function (result) {
			_.each(result,function (reg) {
				new RegView(new RegModel(reg));
			})
		})
	}
})


$(function  () {
	$("#warpper-top").load("wrapper-top.html",function () {
		$($(".top-navbar .nav li").get(2)).addClass('active');
	});
	var view=new PageView();
})
