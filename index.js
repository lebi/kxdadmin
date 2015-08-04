//********************************************************************************************************************//
//														2015.8.3
//													edited by Huang Yan
//
//
//********************************************************************************************************************

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
		"host":'localhost',
		"items":new Array(),
		"status":new Array()
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
	defaults:{
		'host':null,
		'item':null,
		'data':new Array(),
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

		$('[data-toggle=tooltip]',this.$el).on('mouseover',function  () {
			$(this).attr('data-original-title',$(this).text());
		})

		$('[data-toggle=tooltip]',this.$el).tooltip();
		this.delegateEvents();
		this.pid=$('.projectlist .active').attr('projectid');
		this.module.set('pid',this.pid);
	},
	setmodule:function (module) {
		this.module=module;
	},
	editmodule:function () {  //将页面上的数据转化为Module对象  并态模态框渲染
		var page=this.$el;
		var note=$('.title',page).text();
		var monlist=new Array();  //将页面上的模型转换为module对象   左右两种情况不同
		$('.service',page).each(function (){
			var host=$($(this).children().get(0)).text();
			var items=new Array();
			$(this).find('a').each(function () {
				items.push($(this).text());
			});
			monlist.push({host:host,items:items});
		});
		var module=new Module({note:note,monitors:monlist});

		modalView.rendermodule(module);
		$("#savemodule").unbind();	//绑定模态框点击保存的事件
		var self=this;
		$("#savemodule").on('click',function() {  //模块保存更新
			var module=modalView.savemodule();
			module.set('id',self.module.get('id'));
			module.set('chart',self.module.get('chart'));
			module.set('pid',self.module.get('pid'));
			Backbone.sync("update",module);

			var p=self.$el;
			var next=$(p).next();
			$(p).remove();
			var temp=_.template($("#module-temp").html());
			$(next).before(temp({module:module}));
			self.setpage($(next).prev());
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
		var series=new Array();
		var dom=$(page).find('.btn-default').each(function () {
			var host=$($(this).find('span').get(0)).text();
			var item=$($(this).find('span').get(1)).text();
			var chart=new Chart();
			series.push({name:host+"-"+item,data:chart.get('data')})
		})
		this.renderChart(series,page);
	},
	renderChart:function (series,page){
		$("#servicechart",page).highcharts({
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
		var note=$('.title',page).text();
		var monlist=new Array();
		$('.servicelist button',page).each(function () {
			var host=$($(this).find('span').get(0)).text();
			var items=[];
			items[0]=$($(this).find('span').get(1)).text();
			monlist.push({host:host,items:items});
		});
		// }
		var module=new Module({note:note,monitors:monlist});
		console.log(module);

		modalView.rendermodule(module);
		$("#savemodule").unbind();	//绑定模态框点击保存的事件
		var self=this;
		$("#savemodule").on('click',function() {  //模块保存更新
			var module=modalView.savemodule();
			module.set('id',self.module.get('id'));
			module.set('chart',self.module.get('chart'));
			Backbone.sync("update",module);

			var p=self.$el;
			var next=$(p).next();
			$(p).remove();
			var temp=_.template($("#chart-temp").html());
			$(next).before(temp({module:module}));
			self.setpage($(next).prev());
			self.fetchAndRenderChart();
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
		// this.projectList.on('update',this.renderproject);
		var self=this;
		this.projectList.fetch()
		.done(function(){
			self.renderproject(self.projectList);
		});
	},
	renderproject:function (projectList) {
		var temp=_.template($("#project-temp").html());
		$('.add','.projectlist').before(temp({projectlist:projectList.models}));
		$($('.projectlist').find('.project').get(0)).addClass('active');
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
		console.log(this.pid);
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
		console.log(module);
		if(module.get('chart')=="no"){
			var temp=_.template($("#module-temp").html());
			$('.pagehide','.'+column).before(temp({module:module}));
			console.log($('.pagehide','.'+column));

			var moduleView=new ModuleView();
			moduleView.setmodule(module);
			moduleView.setpage($('pagehide','.'+column).prev());
		}else{
			var temp=_.template($("#chart-temp").html());
			$('.pagehide','.'+column).before(temp({module:module}));
			console.log($('pagehide','.'+column));

			var chartView=new ChartView();
			chartView.setmodule(module);
			chartView.setpage($('.pagehide','.'+column).prev());
			chartView.fetchAndRenderChart();
		}
	},
	addright:function () {
		if(this.pid==null) {
			alert("choose project");
			return;
		}
		this.pos="right";
		modalView.render();

		$("#savemodule").unbind();
		var self=this;
		$("#savemodule").on('click',function() {
			var module=modalView.savemodule();
			module.set('pos',self.pos);
			module.set('pid',self.pid);
			Backbone.sync('create',module,
				{
					success:function (id) {
						module.set('id',id);
					}
				}
			);
			console.log(module);
			self.rendermodule(module);
		});
	},
	addleft:function () {
		if(this.pid==null) {
			alert("choose project");
			return;
		}
		this.pos="left";
		modalView.render();

		$("#savemodule").unbind();
		var self=this;
		$("#savemodule").on('click',function() {
			var module=modalView.savemodule();
			module.set('pos',self.pos);      //还需要添加id  才能和post到服务器
			module.set('pid',self.pid);
			Backbone.sync('create',module,
				{
					success:function (id) {
						module.set('id',id);
					}
				}
			);
			console.log(module);
			self.rendermodule(module);
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

//***********************************************************************************************************************************
//																modal view
//											when user want to edit or add a new chart or module,this view will show
//													this view transfer the items on the view into a module object
//													user can exchange the selection to choose hosts and items
//													
//													
//************************************************************************************************************************************


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
		_.each(module.get('monitors'),function(service){
			var temp=_.template($('#service-temp').html());
			$("#servicetable tbody").append(temp({service:service}));
		})
		$('input[name=note]',this.el).val(module.get('note'));
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
		for (var i = hosts.length - 1; i >= 0; i--) {
			var service={host:hosts[i],items:items};
			var temp=_.template($('#service-temp').html());
			$("#servicetable tbody").append(temp({service:service}));
		};
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

		var len=$("#servicetable").find("tr").length;
		var hostArr=new Array();
		var hostItems=new Array();
		for (var i = 1; i<len; i++) {
			var tr=$("#servicetable").find("tr").get(i);
			var index=$.inArray($($(tr).find("td").get(1)).text(),hostArr);
			if(index<0){
				hostArr.push($($(tr).find("td").get(1)).text());
				index=hostArr.length-1;
				hostItems[index]=new Array();
			}
			if($.inArray($($(tr).find("td").get(2)).text(),hostItems[index])<0)
				hostItems[index].push($($(tr).find("td").get(2)).text());
		};
		var monlist=new Array();
		for (var i = hostArr.length - 1; i >= 0; i--) {
			var monitor=new Monitor({host:hostArr[i],items:hostItems[i]});
			monlist.push({host:hostArr[i],items:hostItems[i]});
		};
		var module=new Module({monitors:monlist,note:note,chart:type});
		$('#add-modal').modal('toggle');
		return module;
	},
	renderoptions:function () {
		$('.multiselect select',this.el).empty();
		if($($('.changelabel label',this.el).get(0)).text()=='监测内容'){
			this.options.url='/demo/monitor/items';
			this.options.set('target','hosts');
		}else{
			this.options.url='/demo/monitor/hosts';
			this.options.set('target','items');
		}
		var self=this;
		var response=Backbone.sync('read',this.options,{
			success:function (list) {
				self.options.set('list',list);
				var temp=_.template($('#option-temp',self.el).html());
				$('.firstselect select',self.el).append(temp({options:self.options.get('list')}));
			}
		});
	}
})

var modalView=new ModalView();
$(function (){
	var projectView=new ProjectView();
})
