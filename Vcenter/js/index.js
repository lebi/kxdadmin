var VirtualMachine=MyModel.extend({
	url:'/vcenter/read/vm',
	defaults:{
		'name':null,
		'type':null,
		'memory':null,
		'cpu':null,
		'disk':null,
		'list':null
	}
})

var VcenterModel=MyModel.extend({
	defaults:{
		'name':null,
		'type':null,
		'memory':null,
		'cpu':null,
		'disk':null,
		'list':null
	}
})

var VcenterList=MyCollection.extend({
	url:'/vcenter/read/root',
	model:VcenterModel
})

var CloneModel=MyModel.extend({
	url:'/vcenter/create/clone',
	defaults:{
		'template':null,
		'name':null,
		'hostname':null,
		'domain':null,
		'dns':null,
		'dnsdomain':null,
		'host':null,
		'pool':null,
		'store':null,
		'dhcp':null,
		'ip':null,
		'netmask':null,
		'gateway':null,
		'poweron':null,
		'network':null
	}
})

var CreatePoolModel=MyModel.extend({
	url:'/vcenter/create/pool',
	defaults:{
		'name':null,
		'parent':null,
		'host':null,
		'memoryLimit':null,
		'memoryType':null,
		'cpuLimit':null,
		'cpuType':null
	}
})

var Page=Backbone.View.extend({
	el:$('body'),
	events:{
		'click .create-vm':'createVM',
		'click .create-pool':'createPool',
		'click .create-prev':'createprev',
		'click .create-next':'createnext',
		'hidden.bs.modal #create-vm':'resetmodal',
		'click .host-tree .jstree-clicked':'fetchpools',
		'click .choose-table tr':'changestore',
		'click .create-pool-finish':'createpoolfinish',
		'click .page-title li':'changedc'
	},
	permissions:{
		'.create-vm':'/vcenterAPI/create/clone/C',
		'.create-pool':'/vcenterAPI/create/pool/C'
	},
	initialize:function () {
		this.root=new VcenterList();
		var self=this;
		this.root.on('update',this.render,this);
		this.fetchdatacenters();
		this.fetchparents();
		this.fetchtemplates();
	},
	render:function () {
		console.log('page');
		$('.host-content').remove();
		_.each(this.root.models,function (model) {
			var temp=_.template($('#host-temp').html());
			$('.host').append(temp({model:model}));
		})
	},
	/* call when initialize.
	*  read datacenters list.
	*  read hosts in tree construct by datacenter name.
	*/
	fetchdatacenters:function(){
		var self=this;
		$.getJSON('/vcenter/read/dcs',function(list){
			list=list.result;
			var temp=_.template($('#dc-temp').html());
			$('.page-title').append(temp({list:list}));
			$($('.page-title li').get(0)).addClass('title-active');
			self.fetchhosttree();
		});
	},
	/* call after the datacenter fetched and when the root changed.
	*  read all hosts in the active datacenter.
	*/
	fetchhosttree:function () {
		var dc=$('.page-title .title-active').text();
		this.root.fetch({data:{datacenter:dc}});
	},
	/* call when initialize.
	*  read all templates use to clone.
	*/
	fetchtemplates:function () {
		var self=this;
		$.getJSON('/vcenter/template',function(list){
			list=list.result;
			for(var i in list){
				$('select[name=template]').append("<option>"+list[i].name+"</option>");
			}
		})
	},
	/* call when initialize.
	*  read the host where virtual machine belong to.
	*  read the pools where can new pool place in.
	*/
	fetchparents:function () {
		var self=this;
		$.getJSON('/vcenter/read/host',function(list){
			list=list.result;
			for(var i in list){
				$('.host-tree').append(self.parseTree(list[i]));
			}
			$('.host-tree').jstree();
		})

		$.getJSON('/vcenter/read/pools',function(list){
			list=list.result;
			for(var i in list){
				$('.pool-tree-list').append('<div class="pool-tree-view1" host="'+list[i].name+'">'+self.parseTree(list[i])+'</div>');
				$('.pool-tree-view1').jstree();
			}
		})
	},
	/* call after user choose the host.
	*  read the pools in tree construct belong to host.
	*/
	fetchpools:function(event) {
		$('.pool-tree').empty();
		var dom=event.target;
		var host=$(dom).text();
		this.fetchnetwork(host);
		this.fetchstore(host);
		var self=this;
		$.getJSON('/vcenter/read/pool',{host:host},function(model){
			model=model.result;
			$('.pool-tree').append('<div class="pool-tree-view2">'+self.parseTree(model)+'</div>');
			$('.pool-tree-view2').jstree();
		})
	},
	/* call after user choose the host.
	*  read the network list belong to the host.
	*/
	fetchnetwork:function (host) {
		$('.network').empty();
		var self=this;
		$.getJSON('/vcenter/read/network',{host:host},function(list){
			list=list.result;
			var options="";
			for(var i in list){
				options+="<option>"+list[i].name+"</option>"
			}
			$('.network').append(options);
		})
	},
	/* call after user choose the host.
	*  read the datastore list belong to the host.
	*/ 
	fetchstore:function (host) {
		$('.choose-table tr[name=row]').remove();
		$.getJSON('/vcenter/read/store',{host:host},function(list){
			list=list.result;
			var temp=_.template($('#store-temp').html());
			$('.choose-table tbody').append(temp({list:list}))
		})
	},
	changedc:function (event) {
		var dom=event.target;
		$('.title-active').removeClass('title-active');
		$(dom).closest('li').addClass('title-active');
		this.fetchhosttree();
	},
	/* previus step when clone.
	*/
	createprev:function (tag) {
		var content=$(tag.target).closest('.modal-content');
		var active=$(content).find('.modal-active');
		if(!$(active).prev().hasClass('modal-set'))
			return;
		$(active).removeClass('modal-active');
		$(active).prev().addClass('modal-active');
		if(!$(active).prev().prev().hasClass('modal-set')){
			$('.create-prev').attr('disabled',true);
		}
		$('.create-next').html('next');
	},
	/* next step when clone.
	*/
	createnext:function (tag) {
		if($(tag.target).text()=='next'){
			var content=$(tag.target).closest('.modal-content');
			var active=$(content).find('.modal-active');
			if(!$(active).next().hasClass('modal-set'))
				return;
			$(active).removeClass('modal-active');
			$(active).next().addClass('modal-active');
			if(!$(active).next().next().hasClass('modal-set')){
				$('.create-next').html('finish');
			}
			$('.create-prev').attr('disabled',false);
		}else {
			this.submitclone();
		}
	},
	resetmodal:function (){
		$('#create-vm').find('.modal-active').removeClass('modal-active');
		$($('#create-vm').find('.modal-set').get(0)).addClass('modal-active');
		$('.create-prev').attr('disabled',true);
		$('.create-next').html('next');
		$('.modal-set input').val('');
		$('.modal-set select').each(function (){
			$($(this).find('option')[0]).attr('selected',true);
		});
	},
	submitclone:function () {
		var form=new CloneModel();
		form.set('template',$('.modal-set select[name=template]').val());
		form.set('name',$('.modal-set input[name=vmname]').val());
		form.set('host',$('.modal-set .host-tree .jstree-clicked').text());
		form.set('pool',$('.modal-set .pool-tree .jstree-clicked').text());
		form.set('ip',$('.modal-set input[name=ipaddress]').val());
		form.set('netmask',$('.modal-set input[name=netmask]').val());
		form.set('gateway',$('.modal-set input[name=gateway]').val());
		form.set('hostname',$('.modal-set input[name=hostname]').val());
		form.set('domain',$('.modal-set input[name=hostdomain]').val());
		form.set('dnsdomain',$('.modal-set input[name=dnsdomain]').val());
		form.set('dns',$('.modal-set input[name=dns]').val());
		form.set('network',$('.modal-set select[name=network]').val());
		form.set('poweron',$('.modal-set input[name=poweron]').is(':checked'));
		form.set('dhcp',$('.modal-set input[name=dhcp]').is(':checked'));
		form.set('store',$($('.modal-set .store-chosen').find('td')[0]).text());
		var dom=document.getElementById(form.get('host'));
		var temp=_.template($('#create-temp').html());
		$(dom).append(temp({vm:form}));
		var self=this;
		Backbone.sync('create',form,{
			success:function (res) {
				var temp=_.template($('#alert-temp').html());
				var vmdom=document.getElementById(form.get('name'));
				if(res.value=="success"){
					$($(dom).closest('.host').find('.host-header')).after(temp({res:{type:"success",name:form.get('name')}}));
					var vm=new VirtualMachine();
					vm.fetch({
						data:{name:form.get('name')},
						success:function () {
							$($(vmdom).find('td').get(2)).append(vm.get('memory'));
							$($(vmdom).find('td').get(3)).append(vm.get('cpu'));
							$($(vmdom).find('td').get(4)).append(vm.get('disk'));
							var power="";
							if(vm.poweron) power="on";
							else power="off";
							$($(vmdom).find('td').get(5)).empty();
							$($(vmdom).find('td').get(5)).append(power);
							$(vmdom).addClass('vm-new');
						}
					})
				}else{
					$($(dom).closest('.host').find('.host-header')).after(temp({res:{type:"error",name:form.get('name')}}));
					self.fetchhosttree();
					// $(vmdom).remove();
				}
				// setTimeout(function() {
				// 	$('.close').alert('close');
				// }, 2000);

			}
		})
		$('#create-vm').modal('hide');
	},
	changestore:function (event) {
		if($(event.target).closest('tr').attr('name')=='head')return;
		$('.store-chosen').removeClass('store-chosen');
		$(event.target).closest('tr').addClass('store-chosen');
	},
	createVM:function () {
		$('#create-vm').modal('show');
	},
	createPool:function () {
		$('#create-pool').modal('show');
	},
	createpoolfinish:function (event) {
		var self=this;
		var model=new CreatePoolModel();
		model.set('name',$('#create-pool input[name=pool-name]').val());
		model.set('memoryLimit',$('#create-pool input[name=memory-limit]').val());
		if($('#create-pool select[name=memory-type]').val()=="可扩展")
			model.set('memoryType',true);
		else 
			model.set('memoryType',false);
		model.set('cpuLimit',$('#create-pool input[name=cpu-limit]').val());
		if($('#create-pool select[name=cpu-type]').val()=="可扩展")
			model.set('cpuType',true);
		else
			model.set('cpuType',false);
		model.set('parent',$('#create-pool .jstree-clicked').text());
		model.set('host',$('#create-pool .jstree-clicked').closest('.pool-tree-view1').attr('host'));
		Backbone.sync('create',model,{
			success:function (res) {
				self.fetchhosttree();
			},
			error:function () {
				alert('提交信息错误');
			}
		})
		$('#create-pool').modal('hide');
	},
	parseTree:function (model) {
		if(model.list==null||model.list.length==0){
			return "<ul><li>"+model.name+"</li></ul>";
		}
		var lis="";
		for(var i in model.list){
			lis+=this.parseTree(model.list[i]);
		}
		lis="<li>"+model.name+lis+"</li>";
		return "<ul>"+lis+"</ul>";
	}
})

$(function() {
	$.ajaxSetup({timeout:300000});
	var page=new Page();
	// $("#sidebar").load("nav.html",function (argument) {
		$($('.sidebar-items').children().get(0)).addClass('sidebar-active');
	// });

    $(".header").load("../top.html",function () {
    	$(".vcenter-component").addClass('active');
    });
})