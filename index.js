var Monitor=Backbone.Model.extend({
	defaults:{
		host:'localhost',
		items:new Array(),
		status:new Array()
	}
})

var Module=Backbone.Model.extend({
	defaults:{
		"monitors":new Array(),
		"note":null,
		"id":0
	}
})

var ModList=Backbone.Collection.extend({
	model:Module,
	url:"/demo/rest/modlist",
	initialize:function () {
	}
})

var ProjectView=Backbone.View.extend({
	el:$('.monitor'),
	events:{
		'click .rightcolumn .pagehide':'addright',
		'click .leftcolumn .pagehide':'addleft',
		'click .editmodule':'editmodule'
	},
	initialize:function () {
		this.modlist=new ModList();
		this.pos='left';
		this.modalView=new ModalView();
	},
	renderlist:function(modlist){
		// console.log(modlist.models);
		var self=this;
		modlist.each(function(module){
			self.rendermodule(module);
		});
	},
	rendermodule:function (module){ //将模型添加到相应位置
		var temp=_.template($("#module-temp").html());
		$('.'+this.pos+'column .pagehide').before(temp({module:module}));
	},
	editmodule:function (dom) {
		dom=dom.target;        //将页面上的数据转化为Module对象  并态模态框渲染
		var page=$(dom).closest('.monitorpage');
		var note=$('.title',page).text();

		var monlist=new Array();
		$('.service',page).each(function (){
			var host=$($(this).children().get(0)).text();
			var items=new Array();
			$(this).find('a').each(function () {
				items.push($(this).text());
			});
			monlist.push(new Monitor({host:host,items:items}));
		});
		var module=new Module({note:note,monitors:monlist});

		this.modalView.rendermodule(module);
		$("#savemodule").unbind();	//绑定模态框点击保存的事件
		var self=this;
		$("#savemodule").on('click',function() {  //模块保存更新
			var module=self.savemodule();
			var p=$(dom).closest('.monitorpage');
			var next=$(p).next();
			$(p).remove();
			var temp=_.template($("#module-temp").html());
			$(next).before(temp({module:module}));
		});
	},
	addright:function () {
		this.pos='right';
		this.renderAddModal();
	},
	addleft:function () {
		this.pos='left';
		this.renderAddModal();
	},
	renderAddModal:function(){
		this.modalView.render();
		$("#savemodule").unbind();
		var self=this;
		$("#savemodule").on('click',function() {
			var module=self.savemodule();
			self.rendermodule(module);
		});
	},
	savemodule:function() {
		var note=$("#add-modal input[name=note]").val();
		var len=$("#servicetable").find("tr").length;
		var hostArr=new Array();
		var hostItems=new Array();
		for (var i = 1; i<len; i++) {
			var tr=$("#servicetable").find("tr").get(i);
			var index=$.inArray($($(tr).find("td").get(1)).text(),hostArr);
			if(index<0){
				hostArr.push($($(tr).find("td").get(1)).text());
				// console.log(hostArr);
				index=hostArr.length-1;
				hostItems[index]=new Array();
			}
			if($.inArray($($(tr).find("td").get(2)).text(),hostItems[index])<0)
				hostItems[index].push($($(tr).find("td").get(2)).text());
		};
		var monlist=new Array();
		for (var i = hostArr.length - 1; i >= 0; i--) {
			var monitor=new Monitor({host:hostArr[i],items:hostItems[i]});
			monlist.push(monitor);
		};
		var module=new Module({monitors:monlist,note:note});
		// console.log(module);
		$('#add-modal').modal('toggle');
		return module;
	}
})

var ModalView=Backbone.View.extend({
	el:$('#add-modal'),
	events:{
		'click .firstselect option':'fetchsuit',
		'click #addservice':'addservice',
		'click #exchange':'exchange',
		// 'click #savemodule':'savemodule'
	},
	initialize:function (){
		this.options=['a','b','c'];
	},
	render:function (){
		$('input[name=note]',this.el).val('');
		$('select',this.el).empty();
		// console.log($('#servicetable tr[name=content]'));
		$('#servicetable tr[name=content]').remove();
		var temp=_.template($('#option-temp',this.el).html());
		$('.firstselect select',this.el).append(temp({options:this.options}));                  //options need to update
		$(this.el).modal('toggle');
		this.delegateEvents();
	},
	rendermodule:function(module) {
		$('select',this.el).empty();
		$('#servicetable tr[name=content]').remove();

		_.each(module.get('monitors'),function(service){
			console.log(service);
			var temp=_.template($('#service-temp').html());
			$("#servicetable tbody").append(temp({service:service}));
		})
		$('input[name=note]',this.el).val(module.get('note'));

		var temp=_.template($('#option-temp',this.el).html());
		$('.firstselect select',this.el).append(temp({options:this.options}));				//options need to update
		$(this.el).modal('toggle');
		this.delegateEvents();


	},
	fetchsuit:function() {
		var suits=['c','d','e'];
		$('.secondselect select',this.el).empty();
		var temp=_.template($('#option-temp',this.el).html());
		$('.secondselect select',this.el).append(temp({options:suits}));
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
		// console.log(hosts);
		// console.log(items);
		for (var i = hosts.length - 1; i >= 0; i--) {
			var service=new Monitor({host:hosts[i],items:items});
			var temp=_.template($('#service-temp').html());
			$("#servicetable tbody").append(temp({service:service}));
		};
	},
	exchange:function() {
		var la=$($(".changelabel label").get(0)).text();
		var lb=$($(".changelabel label").get(1)).text();
		$($(".changelabel label").get(0)).text(lb);
		$($(".changelabel label").get(1)).text(la);

		$("#hostoption").attr("id","exchangetemp");
		$("#serviceoption").attr("id","hostoption");
		$("#exchangetemp").attr("id","serviceoption");

		var items=new Array();                                 //items fetch from server
		$('#serviceoption option').each(function () {
			items.push($(this).text());
		});

		$('#hostoption select').empty();
		$('#serviceoption select').empty();
		var temp=_.template($('#option-temp',this.el).html());
		console.log(temp({options:items}));
		$(".firstselect select").append(temp({options:items}));
		this.delegateEvents();
	}
})

$(function (){
	var proView=new ProjectView();
	var mod1=new Module({note:'aaa',id:1});
	var mod2=new Module({note:'bb',id:2});
	var modlist=new ModList();
	modlist.push(mod1);
	modlist.push(mod2);
	proView.renderlist(modlist);
	console.log(modlist.models);
})
