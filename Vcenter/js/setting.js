var Page=Backbone.View.extend({
	el:$('body'),
	events:{
		'dblclick .all-vm option':'addTempalte',
		'click .delete-template':'deleteTemplate'
	},
	permissions:{
		'.delete-template':'/vcenterAPI/template/D'
	},
	initialize:function () {
		this.getallvm();
		this.gettemplates();
	},
	getallvm:function () {
		$.getJSON('/vcenter/read/vms',function (list) {
			list=list.result;
			var html="";
			for(var i in list){
				for(var j in list[i].list){
					html+="<option>"+list[i].list[j].name+"</option>";
				}
			}
			$('.all-vm').append(html);
		})
	},
	gettemplates:function () {
		$.getJSON('/vcenter/template',function (list) {
			list=list.result;
			var html="";
			for(var i in list){
				html+="<option>"+list[i].name+"</option>";
			}
			$('.templates').append(html);
		})	
	},
	addTempalte:function (event) {
		var dom=event.target;
		var name=$(dom).text();
		$.post('/vcenter/template',{name:name},function (result) {
			result=result.result;
			if(result&&result.type>0){
				var html="<option>"+name+"</option>";
				$('.templates').append(html);
			}
		})
	},
	deleteTemplate:function() {
		var name=$('.templates').find('option:selected').text();
		var obj={name:name};
		$.ajax({
			url:'/vcenter/template?name='+name,
			method:'DELETE',
			dataType:'json',
			success:function (result) {
				result=result.result;
				if(result&&result.type>0){
					$('.templates').find('option:selected').remove();
				}
			}
		});
	}
})

$(function() {
	var page=new Page();
	// $("#sidebar").load("nav.html",function (argument) {
	$($('.sidebar-items').children().get(1)).addClass('sidebar-active');
	// });
    $(".header").load("../top.html",function () {
    	$(".vcenter-component").addClass('active');
    });
})