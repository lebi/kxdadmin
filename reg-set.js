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
		'click #exchange':'exchangeList',
		'click #showsetting':'renderServices',
		'click #fetchList option':'renderSuitList'
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
		})
	},
	renderSideSelect:function () {
		var title1=$($('.side-select .select h3').get(0)).text();
		$('#fetchList').empty();
		if(title1=="主机列表"){
			this.suittarget='items';
			_.each(this.hostList.list,function (host) {
				$('#fetchList').append("<option>"+host+"</option>")
			})
		}else if(title1=="服务列表"){
			this.suittarget='hosts';
			_.each(this.serviceList.list,function (service) {
				$('#fetchList').append("<option>"+service+"</option>")
			})
		}
	},
	renderSuitList:function (dom) {
		dom=dom.target;

		$.getJSON("/demo/monitor/suit",{target:this.suittarget,key:$(dom).text()},function (list) {
			$('#suitList').empty();
			_.each(list,function (option) {
				$('#suitList').append("<option>"+option+"</option>")
			})
		})
	},
	exchangeList:function () {
		var title1=$($('.side-select .select h3').get(0)).text();
		var title2=$($('.side-select .select h3').get(1)).text();
		$($('.side-select .select h3').get(0)).text(title2);
		$($('.side-select .select h3').get(1)).text(title1);
		this.renderSideSelect();
	},
	renderServices:function() {
		var host=new Array();
		var service=new Array();
		if(this.suittarget=='items'){
			host.push($('#fetchList').find('option:selected').text());		
			$('#suitList',this.el).find("option:selected").each(function () {
				service.push($(this).text());
			});
		}else if(this.suittarget=='hosts'){
			service.push($('#fetchList').find('option:selected').text());
			$('#suitList',this.el).find("option:selected").each(function () {
				host.push($(this).text());
			});
		}
		var regList=new Array();
		$('.setting-list').empty();
		for(var i=0;i<host.length;i++)
			for(var j=0;j<service.length;j++){
				var regExp=new RegModel();
				regExp.fetch({data:{host:host[i],service:service[j]}})
				.done(function (reg) {
					new RegView(new RegModel(reg));
				})
			}
	}
})


$(function  () {
	$("#warpper-top").load("wrapper-top.html",function () {
		$($(".top-navbar .nav li").get(2)).addClass('active');
	});
	var view=new PageView();
})

// function match (dom) {
// 	var output="swap=4031MB;3225;2419;0;4031";
// 	var reg=$(dom).val();
// 	reg='/'+reg+'/g';
// 	reg=eval(reg);
// 	var res=reg.exec(output);
// 	if(res!=null){
// 		var str="";
// 		for(var i=1;i<res.length;i++)
// 			str+=res[i];
// 		$("#output").val(str);
// 	}
// }

// function addParam() {
// 	var html="<div><input name='paramName'><input onchange='regexec(this)' name='position'></div>"
// 	$('body').append(html);
// }

// function regexec(dom) {
// 	var reg=$('input[name=reg]').val();
// 	reg='/'+reg+'/g';
// 	reg=eval(reg);
// 	var output="swap=4031MB;3225;2419;0;4031";
// 	var value=$(dom).val();
// 	var check=/^\$(\d+)$/;
// 	console.log(check.exec(value))
// 	if(check.exec(value)!=null){
// 		var i=check.exec(value)[1];
// 		console.log(reg.exec(output)[i]);
// 	}
// }