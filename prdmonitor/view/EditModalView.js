
	//**********************************************************************************************************************************//
	//																modal ModalView                         							//	
	//											when user want to edit or add a new chart or module,this view will show 	  			//
	//													this view transfer the items on the view into a module object					//
	//													user can exchange the selection to choose hosts and items 						//
	//																																	//			
	//																																	//	
	//**********************************************************************************************************************************//
define(['jquery','underscore','backbone','cookie','bootstrap','HostList','ServiceList','Module'],
	function ($,_,Backbone,cookie,bootstrap,HostList,ServiceList,Module) {
	var EditModalView=Backbone.View.extend({
		el:$('#add-modal'),
		events:{
			'click .firstselect option':'fetchsuit',
			'click #addservice':'addservice',
			'click #exchange':'exchange',
			'click #servicetable .deleteservice':'deleteservice'
		},
		initialize:function (){
			this.options={};
			this.hosts=new HostList();
			this.services=new ServiceList();
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
			$.getJSON("/demo/monitor/suit",{target:this.options.target,key:key},function (result) {
				$('.secondselect select',this.el).empty();
				var temp=_.template($('#option-temp',this.el).html());
				$('.secondselect select',this.el).append(temp({options:result.result}));
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
			var len=$("#servicetable").find("tr").length;
			var check=new Array();
			var monlist=new Array();


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
			var module=new Module({monitors:monlist,note:note,chart:type});
			$('#add-modal').modal('toggle');
			return module;
		},
		renderoptions:function () {
			$('.multiselect select',this.el).empty();
			if($($('.changelabel label',this.el).get(0)).text()=='监测内容'){
				this.options.target='hosts';
				this.options.list=this.services.list;
			}else{
				this.options.target='items';
				this.options.list=this.hosts.list;
			}
			var temp=_.template($('#option-temp',this.el).html());
			$('.firstselect select',this.el).append(temp({options:this.options.list}));
		}
	})
	return EditModalView;
})