//********************************************************************************************************************//
//														2015.8.3
//													edited by Huang Yan
//
//
//********************************************************************************************************************

var HostList=Backbone.Collection.extend({
	url:"/demo/monitor/hosts",
	initialize:function () {
		var self=this;
		this.fetch()
		.done(function (collection) {
			self.list=collection;
		})
	}
})

var ServiceList=Backbone.Collection.extend({
	url:"/demo/monitor/services",
	initialize:function () {
		var self=this;
		this.fetch()
		.done(function (collection) {
			self.list=collection;
		})
	}
})

var Project=Backbone.Model.extend({
	urlRoot:"/demo/project",
	defaults:{
		"id":null,
		"name":null,
		"status":null
	}
})

var ProjectList=Backbone.Collection.extend({
	model:Project,
	url:"/demo/project/list"
})

var Monitor=Backbone.Model.extend({
	defaults:{
		"id":null,
		"host":'localhost',
		"item":null,
		"status":null
	}
})

var Module=Backbone.Model.extend({
	urlRoot:"/demo/module",
	defaults:{
		"monitors":new Array(),
		"note":null,
		"id":null,
		'chart':'yes',
		'pid':null,
		"pos":null
	}
})

var Chart=Backbone.Model.extend({
	urlRoot:'/demo/chart',
	defaults:{
		'id':null,
		'host':null,
		'item':null,
		'data':new Array(),
		'reg':null,
		'parameters':null,
		'x-line':new Array(),
		'y-line':new Array(),
	},
	initialize:function () {
		this.set('data',[Math.random()*10,Math.random()*10,Math.random()*10,Math.random()*10,Math.random()*10,Math.random()*10,Math.random()*10]);
	}
})

var ModList=Backbone.Collection.extend({
	model:Module,
	url:"/demo/module/list",
	initialize:function () {
	}
})

var Options=Backbone.Model.extend({
	defaults:{
		'list':null,
		'target':null
	}
})
//***********************************************************************************************************************************
//																module view
//													one view stand for one part of the monitor list the user choose
//														user can edit the view to add or delete monitors
//															user can also delete the view
//
//
//************************************************************************************************************************************
var ModuleView=Backbone.View.extend({
	el:$('.monitorpage'),
	events:{
		'click .editmodule':'editmodule',
		'click .delete':'deletemodule'
	},
	initialize:function(){
		this.module=new Module();
	},
	setpage:function (page) {
		this.$el=$(page);
		this.delegateEvents();

		$('[data-toggle=tooltip]',this.$el).each(function() {
			var id=$(this).attr('serviceid');
			var dom=this;
			$.getJSON('/demo/monitor/status',{id:id}, function (data) {
				$(dom).attr('data-original-title',data.status);
			});
		})


		// $('[data-toggle=tooltip]',this.$el).on('mouseover',function  () {
		// 	var id=$(this).attr('serviceid');
		// 	var dom=this;
		// 	$.getJSON('/demo/monitor/status',{id:id}, function (data) {
		// 		$(dom).attr('data-original-title',data.status);
		// 	});
		// })

		$('[data-toggle=tooltip]',this.$el).tooltip();
	},
	setmodule:function (module) {
		this.module=module;
	},
	editmodule:function () {  //将页面上的数据转化为Module对象  并态模态框渲染
		var page=this.$el;

		$('.typeselect select').attr('disabled','disabled');
		modalView.rendermodule(this.module);
		$("#savemodule").unbind();	//绑定模态框点击保存的事件
		var self=this;
		$("#savemodule").on('click',function() {  //模块保存更新
			var module=modalView.savemodule();
			module.set('id',self.module.get('id'));
			module.set('pid',self.module.get('pid'));
			module.set('pos',self.module.get('pos'));
			self.module=module;
			Backbone.sync("update",self.module,{
				success:function(module) {
					self.module=new Module(module);
					var p=self.$el;
					var next=$(p).next();
					$(p).remove();
					var temp=_.template($("#module-temp").html());
					$(next).before(temp({module:self.module}));
					self.setpage($(next).prev());
				}
			});

		});
	},
	deletemodule:function () {
		var msg=confirm("确定删除:"+this.module.get('note'));
		if(msg==true){
			Backbone.sync('delete',this.module);
			this.remove();
		}
	}
})
//***********************************************************************************************************************************
//																chart view
//													one view stand for one part of the monitor list the user choose
//														user can edit the view to add or delete monitors
//															user can also delete the view
//														when user choose item he want to monitor
//													this view will draw a history chart for this item
//************************************************************************************************************************************


var ChartView=Backbone.View.extend({
	el:$('.monitorpage'),
	events:{
		'click .editmodule':'editmodule',
		'click .delete':'deletemodule'
	},
	initialize:function(){
		this.module=new Module();
	},
	setpage:function (page) {
		this.$el=$(page);
		this.delegateEvents();
	},
	setmodule:function (module) {
		this.module=module;
	},
	changechart:function (dom) {
		$(dom).closest('.servicelist').find(".btn-primary").removeClass("btn-primary");
		$(dom).closest('.changechart').addClass("btn-primary");
		this.fetchAndRenderChart();
	},
	fetchAndRenderChart:function (){
		var page=this.$el;
		var self=this;
		var monitors=this.module.get('monitors');
			$.getJSON('/demo/chart/'+this.module.get('id'),function (chartList) {
				var series=new Array();
				_.each(chartList,function (chart) {
					var offset=series.length;
					if(chart.parameters==null||chart.reg==null||chart.reg=="") return;
					var params=chart.parameters.split(';');
					for(var j=0;j<params.length;j++)
						series.push({name:params[j],data:new Array()});

					var reg='/'+chart.reg+'/g';
					var regx=eval(reg);
					for(var j=0;j<chart.data.length;j++){
						var match=regx.exec(chart.data[j]);
						if(match!=null)
							for(var n=1;n<params.length+1;n++){
								if (isNaN(match[n])) break;
								series[n-1+offset].data.push(parseFloat(match[n]));
							}
					}
					self.renderChart(series);
				});
			})
	},
	renderChart:function (series){
		$("#servicechart",this.$el).highcharts({
			title:null,
			chart:{
				height:300
			},
			yAxis:{
				title: null
			},
			series: series
		})
	},
	editmodule:function () {        //将页面上的数据转化为Module对象  并态模态框渲染
		var page=this.$el;

		$('.typeselect select').attr('disabled','disabled');
		modalView.rendermodule(this.module);
		$("#savemodule").unbind();	//绑定模态框点击保存的事件
		var self=this;
		$("#savemodule").on('click',function() {  //模块保存更新
			var module=modalView.savemodule();
			module.set('id',self.module.get('id'));
			module.set('pid',self.module.get('pid'));
			module.set('pos',self.module.get('pos'));
			self.module=module;
			Backbone.sync("update",self.module,{
				success:function(module) {
					self.module=new Module(module);
					var p=self.$el;
					var next=$(p).next();
					$(p).remove();
					var temp=_.template($("#chart-temp").html());
					$(next).before(temp({module:self.module}));
					self.setpage($(next).prev());
					self.fetchAndRenderChart();
				}
			});
		});
	},
	deletemodule:function () {
		var msg=confirm("确定删除:"+this.module.get('note'));
		if(msg==true){
			Backbone.sync('delete',this.module);
			this.remove();
		}
	}
})

//***********************************************************************************************************************************
//																project view
//										this view's el is this body,user add module view and chart view through this view
//													user can add new project and choose project he interested
//															user can also delete the project
//													
//													
//************************************************************************************************************************************


var ProjectView=Backbone.View.extend({
	el:$('body'),
	events:{
		'click .projectlist .projectdelete':'deleteproject',
		'click .rightcolumn .pagehide':'addright',
		'click .leftcolumn .pagehide':'addleft',
		'click .projectlist .add':'addproject',
		'click .projectlist .project':'changeproject',
		'click #saveproject':'saveproject'
	},
	initialize:function () {
		this.projectList=new ProjectList();
		var self=this;
		this.projectList.fetch()
		.done(function(){
			self.renderproject();
		});
		var self=this;
		setInterval(function () {
			self.renderproject();
		},10000);
	},
	renderproject:function (projectList) {
		console.log(this.pid);
		$('.projectlist .project').remove();
		var temp=_.template($("#project-temp").html());
		$('.add','.projectlist').before(temp({projectlist:this.projectList.models}));
		if(this.pid==null)
			$($('.projectlist').find('.project').get(0)).addClass('active');
		else
			$('.projectlist').find('.project[projectid='+this.pid+']').addClass('active');
		this.fetchandrenderlist();
	},
	changeproject:function (dom) {
		dom=dom.target;
		if($(dom).hasClass('projectdelete')) return;
		$('.projectlist .active').removeClass('active');
		$(dom).closest('.project').addClass('active');
		this.fetchandrenderlist();
	},
	fetchandrenderlist:function(){
		var self=this;
		this.pid=$('.projectlist',this.$el).find('.active').attr('projectid');
		if(this.pid==null) return;
		var moduleList=new ModList();
		moduleList.fetch({data:{pid:this.pid}})
		.done(function (collection) {
			$('.showpage').remove();
			_.each(moduleList.models,function(module){
				self.rendermodule(module);
			});
		});
	},
	rendermodule:function (module){ //将模型添加到相应位置
		var column=module.get('pos')+"column";   //left or right
		if(module.get('chart')=="no"){
			var temp=_.template($("#module-temp").html());
			$('.pagehide','.'+column).before(temp({module:module}));

			var moduleView=new ModuleView();
			moduleView.setpage( $('.pagehide','.'+column).prev() );
			moduleView.setmodule(module);
		}else{
			var temp=_.template($("#chart-temp").html());
			$('.pagehide','.'+column).before(temp({module:module}));

			var chartView=new ChartView();
			chartView.setmodule(module);
			chartView.setpage( $('.pagehide','.'+column).prev() );
			chartView.fetchAndRenderChart();
		}
	},
	addright:function () {
		if(this.pid==null) {
			alert("choose project");
			return;
		}
		this.pos="right";
		$('.typeselect select').attr('disabled',null);
		modalView.render();

		$("#savemodule").unbind();
		var self=this;
		$("#savemodule").on('click',function() {
			var module=modalView.savemodule();
			module.set('pos',self.pos);
			module.set('pid',self.pid);
			Backbone.sync('create',module,
				{
					success:function (result) {
						module=new Module(result)
						console.log(module);
						self.rendermodule(module);
					}
				}
			);

		});
	},
	addleft:function () {
		if(this.pid==null) {
			alert("choose project");
			return;
		}
		this.pos="left";
		$('.typeselect select').attr('disabled',null);
		modalView.render();

		$("#savemodule").unbind();
		var self=this;
		$("#savemodule").on('click',function() {
			var module=modalView.savemodule();
			module.set('pos',self.pos);      //还需要添加id  才能和post到服务器
			module.set('pid',self.pid);
			Backbone.sync('create',module,
				{
					success:function (result) {
						module=new Module(result)
						console.log(module);
						self.rendermodule(module);
					}
				}
			);
		});
	},
	addproject:function(dom) {
		dom=dom.target;
		$('#addproject-modal input').val('');
		$('#addproject-modal').modal('toggle');
	},
	saveproject:function() {
		var name=$("#addproject-modal input").val();
		var temp=_.template($("#project-temp").html());
		var project=new Project({name:name});
		var self=this;
		Backbone.sync('create',project,{
			success:function (id) {
				project.set('id',id);
				$('.add','.projectlist').before(temp({projectlist:[project] }));
				$('#addproject-modal').modal('toggle');
				$('.active','.projectlist').removeClass("active");
				$('.add','.projectlist').prev().addClass("active");
				self.fetchandrenderlist();
			}
		});
		this.projectList.push(project);
	},
	deleteproject:function (dom) {
		dom=dom.target;
		var pro=$(dom).closest('.project');
		var pid=pro.attr('projectid');
		var project;
		this.projectList.each(function (pro) {
			if(pro.get('id')==pid)
				project=pro;
		})

		var active=$(dom).closest('.active');
		var msg=confirm("确定删除:"+pro.text());
		if(msg==true){
			console.log(project);
			Backbone.sync('delete',project);
			this.projectList.remove(project);
			pro.remove();
			if($('.projectlist .active').length==0){
				$($('.project').get(0)).addClass('active');
				this.fetchandrenderlist();
			}
		}
	}
})

//**********************************************************************************************************************************//
//																modal ModalView                         							//	
//											when user want to edit or add a new chart or module,this view will show 	  			//
//													this view transfer the items on the view into a module object					//
//													user can exchange the selection to choose hosts and items 						//
//																																	//			
//																																	//	
//**********************************************************************************************************************************//


var ModalView=Backbone.View.extend({
	el:$('#add-modal'),
	events:{
		'click .firstselect option':'fetchsuit',
		'click #addservice':'addservice',
		'click #exchange':'exchange',
		'click #servicetable .deleteservice':'deleteservice'
	},
	initialize:function (){
		this.options=new Options();
	},
	render:function (){
		$('input[name=note]',this.el).val('');
		$('#servicetable tr[name=content]').remove();
		this.renderoptions();
		$(this.el).modal('toggle');
		this.delegateEvents();
	},
	rendermodule:function(module) {
		$('#servicetable tr[name=content]').remove();
		// _.each(module.get('monitors'),function(service){
		var temp=_.template($('#service-temp').html());
		$("#servicetable tbody").append(temp({monitors:module.get('monitors')}));
		// })
		$('input[name=note]',this.el).val(module.get('note'));
		$('.typeselect option[name='+module.get("chart")+']').attr("selected",true);
		this.renderoptions();
		this.delegateEvents();
		$(this.el).modal('toggle');

	},
	fetchsuit:function(dom) {
		var key=$(dom.target).text();
		$.getJSON("/demo/monitor/suit",{target:this.options.get('target'),key:key},function (list) {
			$('.secondselect select',this.el).empty();
			var temp=_.template($('#option-temp',this.el).html());
			$('.secondselect select',this.el).append(temp({options:list}));
		})
	},
	addservice:function(){
		var items=new Array();
		$('#serviceoption select',this.el).find("option:selected").each(function () {
			items.push($(this).text());
		});
		var hosts=new Array();
		$('#hostoption select',this.el).find("option:selected").each(function () {
			hosts.push($(this).text());
		});
		var monitors=new Array();
		for (var i=0; i < hosts.length; i++) 
			for(var j=0;j<items.length; j++)
				monitors.push({host:hosts[i],item:items[j]})
		var temp=_.template($('#service-temp').html());
		$("#servicetable tbody").append(temp({monitors:monitors}));
	},
	deleteservice:function (dom) {
		dom=dom.target;
		var tr=$(dom).closest('tr');
		tr.remove();
	},
	exchange:function() {
		var la=$($(".changelabel label").get(0)).text();
		var lb=$($(".changelabel label").get(1)).text();
		$($(".changelabel label").get(0)).text(lb);
		$($(".changelabel label").get(1)).text(la);

		$("#hostoption").attr("id","exchangetemp");
		$("#serviceoption").attr("id","hostoption");
		$("#exchangetemp").attr("id","serviceoption");

		this.renderoptions();
		this.delegateEvents();
	},
	savemodule:function() {
		var note=$("#add-modal input[name=note]").val();
		var type=$("#add-modal .typeselect option:selected").attr("name");
		console.log(type);
		var len=$("#servicetable").find("tr").length;
		// var hostArr=new Array();
		// var hostItems=new Array();
		var check=new Array();
		var monlist=new Array();

		// for (var i = 1; i<len; i++) {
		// 	var tr=$("#servicetable").find("tr").get(i);
		// 	var index=$.inArray($($(tr).find("td").get(1)).text(),hostArr);
		// 	if(index<0){
		// 		hostArr.push($($(tr).find("td").get(1)).text());
		// 		index=hostArr.length-1;
		// 		hostItems[index]=new Array();
		// 	}
		// 	if($.inArray($($(tr).find("td").get(2)).text(),hostItems[index])<0)
		// 		hostItems[index].push($($(tr).find("td").get(2)).text());
		// };

		for(var i=1;i<len;i++){
			var tr=$("#servicetable").find("tr").get(i);
			var host=$($(tr).find("td").get(1)).text();
			var service=$($(tr).find("td").get(2)).text();
			var index=$.inArray(host+"|"+service,check);
			if(index<0){
				check.push(host+"|"+service);
				monlist.push({host:host,item:service});
			}
		}
		// for (var i = hostArr.length - 1; i >= 0; i--) {
		// 	var monitor=new Monitor({host:hostArr[i],items:hostItems[i]});
		// 	monlist.push({host:hostArr[i],items:hostItems[i]});
		// };
		var module=new Module({monitors:monlist,note:note,chart:type});
		$('#add-modal').modal('toggle');
		return module;
	},
	renderoptions:function () {
		$('.multiselect select',this.el).empty();
		if($($('.changelabel label',this.el).get(0)).text()=='监测内容'){
			this.options.url='/demo/monitor/items';
			this.options.set('target','hosts');
			this.options.set('list',services.list);
		}else{
			this.options.url='/demo/monitor/hosts';
			this.options.set('target','items');
			this.options.set('list',hosts.list);
		}
		var temp=_.template($('#option-temp',this.el).html());
		$('.firstselect select',this.el).append(temp({options:this.options.get('list')}));
	}
})

var hosts=new HostList();
var services=new ServiceList();
var modalView=new ModalView();
$(function (){
	$("#warpper-top").load("wrapper-top.html",function () {
		$($(".top-navbar .nav li").get(0)).addClass('active');
	});
	var projectView=new ProjectView();
})
