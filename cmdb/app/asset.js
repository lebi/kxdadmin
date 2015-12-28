require.config({
	paths:{
		jquery:'../../lib/jquery-1.11.3.min',
		underscore:'../../lib/underscore-min',
		backbone:'../../lib/backbone',
		cookie:'../../lib/jquery.cookie',
		bootstrap:'../../lib/bootstrap.min',
		model:'../../js/base-model',
		collection:'../../js/base-collection',
		jqueryform:'../../lib/jquery.form.min',
		Unit:'model/Unit',
		UnitList:'model/UnitList',
		AssetType:'model/AssetType',
		AssetTypeList:'model/AssetTypeList',
		Asset:'model/Asset',
		AssetList:'model/AssetList',
		AssetView:'AssetView',
		AssetTypeShow:'model/AssetTypeShow',
		ColumnMap:'model/ColumnMap',
		TimePicker:'../../lib/bootstrap-datetimepicker'
	},
	shim : {  
    	bootstrap : {  
        	deps : ['jquery'],  
            exports :'bs'  
    	},
    	TimePicker:{
        	deps : ['bootstrap'],  
            exports :'$.fn.datepicker'
    	}  
    } 
})

define(['jquery','underscore','backbone','cookie','bootstrap','jqueryform','AssetType','AssetTypeList','Asset','AssetList','UnitList','AssetView','AssetTypeShow','ColumnMap','TimePicker'],
	function ($,_,Backbone,cookie,bootstrap,jqueryform,AssetType,AssetTypeList,Asset,AssetList,UnitList,AssetView,AssetTypeShow,ColumnMap,TimePicker) {

	$('.nav-menu').load('nav.html',function () {
		$($('.nav-menu a').get(1)).addClass('active');
	});
	var MainAssetView=AssetView.extend({
		events:{
			'change #asset #type-select':'bindType',
			'change #asset .matcher':'bindValue',
			'change #asset #key-select':'bindKey',
			'click .pagination a':'page',
			'click .remove-asset':'remove',
			'click #export':'export',
			'click #import':'import',
			'change #upload>input':'upload',
			'change #column-show input':'showColumn',
			'click #column-save':'columnSave'
		},
		el:$('.content'),
		template:_.template($('#asset-info-temp').html()),
		initialize:function () {
			this.typeList=new AssetTypeList();
			this.typeList.on('sync',this.render,this);
			
			this.assetList=new AssetList();
			this.assetList.url='/cmdbAPI/asset/listall'
			this.assetList.on('sync',this.render,this);

			this.search={};
			_.extend(this.search,Backbone.Events);
			this.search.model={key:'name',type:0,page:1,matcher:'',extend:false};
			this.search.on('change',this.doFetch,this);

			this.showColumn=null;
		},
		doFetch:function () {
			console.log('fetch')
			if(this.typeList.length==0)
				this.typeList.fetch();
			this.assetList.fetch({data:this.search.model});
		},
		/*
		*	@typeList:资产类型列表。
		*	@search:搜索的参数。选择的资产类型，页码，选择搜索的列，搜索关键字。
		*	@assetList:匹配到的资产列表。
		*	@showColumn:选择的资产类型要显示哪些列。
		*	@columnMap:资产类型某个属性的中文映射，便于显示。
		*	@columns:资产需要展示的基础属性。
		*	@defaults:当资产类型没有配置需要展示的列时，默认显示的列。
		*/
		render:function () {
			this.$el.empty()
			this.$el.append(this.template({
				typeList:this.typeList,
				search:this.search.model,
				assetList:this.assetList,
				showColumn:this.showColumn,
				columnMap:ColumnMap.map,
				columns:_.keys(ColumnMap.priority),
				defaults:_.keys(ColumnMap.defaults)
			}));
		},
		export:function () {
			window.open("/cmdbAPI/asset/export");
		},
		import:function () {
			$('#upload input').click();
		},
		upload:function () {
			if(!$('#upload input').val())
				return;
			$('.hint',this.$el).html(" <i class='icon-spin icon-spinner'></i>正在导入");
			$('#upload').ajaxSubmit({
				timeout : 60*1000,
				success:function () {
					$('.hint',this.$el).html(" <i class='icon-ok'></i>导入成功</span>");
					setTimeout(function () {
						$('.hint',this.$el).html(" 继续导入");
					},1000)
					$('#upload input').val('');
				},
				error:function (result) {
					$('.hint',this.$el).html(" <i class='icon-remove-sign'></i>导入失败");
					alert(result.responseJSON.errorMsg);
					setTimeout(function () {
						$('.hint',this.$el).html(" 重新选择文件");
					},1000)
					$('#upload input').val('');
				}
			})
		},
		/*
		*	@Usage: 当选择展示的列改变时触发。
		*			target:根据改变的扩展熟悉还是基础属性。
		*			this.showColumn[target]:显示的属性集合字符串，由逗号分割。
		*/
		showColumn:function () {
			var target=$(event.target).attr("target");
			var value=$(event.target).val();
			if($(event.target).prop('checked')){
				if(!this.showColumn)
					this.showColumn={typeId:this.search.model.type};

				if(!this.showColumn[target])
					this.showColumn[target]=value;
				else{
					var arr=this.showColumn[target].split(',');
					//p:这个属性的优先级，由ColumnMap.priority决定。
					//需要判断p是否存在（即是否是基础属性）。
					//根据优先级将p插入到列的集合中。
					var p=ColumnMap.priority[value];
					if(p){
						for(var i=0;i<=arr.length;i++){
							if(i==arr.length||!ColumnMap.priority[arr[i]]||p<ColumnMap.priority[arr[i]]){
								arr.splice(i,0,value);
								break;
							}
						}
						this.showColumn[target]=arr.toString();
					}else{
						this.showColumn[target]+=","+value;
					}
				}			
			}else{
				var arr=this.showColumn[target].split(",");
				var newarr=_.reduce(arr,function (memo,i) {
					if(i!=value)
						memo.push(i);
					return memo;
				},[])
				this.showColumn[target]=newarr.toString();
			}
		},
		/*
		*	@Usage: 当选择保存展示的列时触发。
		*/
		columnSave:function () {
			var self=this;
			if(this.showColumn){
				var show=new AssetTypeShow(this.showColumn);
				console.log(show);
				show.save().done(function () {
					$('#select-show-modal').modal('hide');
					$('.modal-backdrop').remove();
					self.showColumn=show.toJSON();
					self.typeList.fetch();
				});
			}
		}
	})

	var AssetDetailView=Backbone.View.extend({
		el:$('.content'),
		template:_.template($('#asset-detail-temp').html()),
		initialize:function () {
			this.asset=new Asset();
			this.asset.on('sync',this.render,this);
		},
		changeModel:function (id) {
			this.asset.set('id',id);
			this.asset.fetch();
		},
		render:function () {
			this.$el.empty()
			this.$el.append(this.template({asset:this.asset.attributes}));
		}
	})

	var AssetEditView=Backbone.View.extend({
		el:$('.content'),
		template:_.template($('#asset-edit-temp').html()),
		events:{
			'change .asset-edit input':'bindValue',
			'change .asset-edit select':'bindType',
			'click .asset-edit #save':'save',
			'click .asset-edit #unit':'unitShow'
		},
		initialize:function () {
			this.asset=new Asset();
			this.asset.on('myupdate',this.render,this);

			this.typeList=new AssetTypeList();
			this.typeList.on('sync',this.render,this);
			this.typeList.fetch();
		},
		changeModel:function (id) {
			var self=this;
			this.asset.set('id',id);
			this.asset.fetch().done(function () {
				self.asset.trigger('myupdate');
			})
		},
		render:function () {
			this.$el.empty()
			this.$el.append(this.template({
				asset:this.asset.attributes,
				typeList:this.typeList
			}));
			$('.datetimepicker').remove();
			$(".form_datetime").datetimepicker({
	        	format: "yyyy-mm-dd",
	        	autoclose:true,
	        	startView: 4, 
	        	minView: 2,
	        });

		},
		/*
		*	当使用timepicker选择日期时，event是点击事件。
		*/
		bindValue:function () {
			if(event.type=='click'){
				var apply=$('input[name=applyTime]',this.$el).val();
				var purchase=$('input[name=purchaseTime]',this.$el).val()
				this.asset.set('applyTime',apply?apply:null);
				this.asset.set('purchaseTime',purchase?purchase:null);
				return;
			}
			var name=$(event.target).attr('name');
			var value=$(event.target).val();
			var keys=this.asset.keys();

			if(name!='extend'&&keys.indexOf(name)>=0){
				this.asset.set(name,value);
			}else{
				var extend=this.asset.get('properties');
				for(var i in extend){
					if(extend[i].name==name)
						extend[i].value=value;
				}
			}
		},
		bindType:function () {
			var tid=$(event.target).val();
			if(confirm("改变资产类型会删除原有的扩展属性信息，确认改变？")){
				var model=this.asset;
				var self=this;
				$.ajax({
					method:'POST',
					url:'/cmdbAPI/asset/type',
					data:{id:model.get('id'),typeId:tid},
					success:function (data) {
						model.set('typeDetail',data.result);
						self.setAssetType(model,data.result);
						model.trigger('myupdate');
					}
				})
			}else{
				$(event.target).val(this.asset.get('typeDetail').id);
			}
		},
		save:function () {
			if(!(this.asset.get('name')&&this.asset.get('code'))){
				alert('名称和编码不能为空');
				return;
			}
			if(!(this.asset.get('unitId')&&this.asset.get('typeId'))){
				alert('为选择单位和资产类型');
				return;
			}
			var dom=$(event.target);
			this.asset.save().done(function () {
				$(dom).after(" <span id='save-hint'> <i class='icon-ok-sign'></i> 保存成功</span>");
				setTimeout(function () {
					$('#save-hint').remove();
				},1500);
			})
		},
		setAssetType:function (model,type) {
			model.set('properties',[])
			_.each(type.properties,function (p) {
				model.get('properties').push({
					id:null,
					code:p.code,
					name:p.name,
					value:'',
					assetId:model.get('id'),
					pid:p.id
				});
			})
			model.set('typeId',type.id);
			model.set('type',type.name);
		},
		unitShow:function () {
			AssetRouter.unit.showView(this.asset);
		}
	})

	var AssetAddView=AssetEditView.extend({
		el:$('.content'),
		template:_.template($('#asset-add-temp').html()),
		events:{
			'change .asset-add input':'bindValue',
			'change .asset-add select':'bindType',
			'click .asset-add #save':'save',
			'click .asset-add #unit':'unitShow'
		},
		initialize:function () {
			this.asset=new Asset();
			this.assetType=new AssetType();

			this.typeList=new AssetTypeList();
			this.typeList.on('sync',this.render,this);
			this.typeList.fetch();

		},
		changeModel:function () {
			this.asset=new Asset();
			this.asset.on('myupdate',this.render,this);
			this.render();
		},
		render:function () {
			this.$el.empty();
			this.$el.append(this.template({
				asset:this.asset.attributes,
				typeList:this.typeList
			}));
			$('.datetimepicker').remove();
			$(".form_datetime").datetimepicker({
	        	format: "yyyy-mm-dd",
	        	autoclose:true,
	        	startView: 4, 
	        	minView: 2,
	        });
		},
		bindType:function(){
			var tid=$(event.target).val();
			if(tid!=0){
				this.assetType.set('id',tid);
				var self=this;
				this.assetType.fetch().done(function () {
					self.setAssetType(self.asset,self.assetType.toJSON());
					self.asset.set('typeDetail',self.assetType.toJSON());
					self.asset.trigger('myupdate');
				})
			}
		}
	})
	var UnitTreeView=Backbone.View.extend({
		events:{
			'click .tree-icon':'toggle',
			'click .unit-li>a':'choose',
			'click #unit-choose':'unitChoose'
		},
		el:$('#unit-modal'),
		template:_.template($('#unit-nav-temp').html()),
		initialize:function () {
			this.unitList=new UnitList();
			this.unitList.on('reset',this.render,this);
			this.unitList.fetch({reset: true});
		},
		render:function () {
			var stack=[];
			this.tree={children:[]};
			var self=this;
			this.unitList.each(function (u) {
				var obj=u.toJSON();
				obj.children=[];
				if(stack.length==0){
					self.tree.children.push(obj);
					stack.push(obj);
				}else{
					while(stack.length!=0){
						var peek=stack[stack.length-1];
						var reg=new RegExp('^'+peek.layer+'/');
						if(reg.test(obj.layer)){
							peek.children.push(obj);
							stack.push(obj);
							break;
						}else{
							stack.pop();
						}
					}
					if(stack.length==0){
						self.tree.children.push(obj);
						stack.push(obj);
					}
				}
			})
			$('.unit-tree').append(this.template({trees:this.tree.children,parent:0}));
		},
		toggle:function () {
			var parent=$(event.target).closest('.unit-li');
			if(parent.hasClass('active'))
				parent.removeClass('active');
			else
				parent.addClass('active');
		},
		choose:function () {
			this.uid=parseInt($(event.target).closest('a').attr('uid'));
			$('.unit-li>a.choose').removeClass('choose');
			$(event.target).closest('a').addClass('choose');
		},
		showView:function (model) {
			if(model.get('unitId')){
				this.uid=model.get('unitId');
				$('#unit-modal .unit-li>a.choose').removeClass('choose');
				$('#unit-modal .unit-li>a[uid='+this.uid+']').addClass('choose');
			}
			this.$el.modal('show');
			this.model=model;
		},
		unitChoose:function() {
			if(!this.uid){
				alert('请选择单位');
				return;
			}
			this.model.set('unitId',this.uid);
			this.model.set('unit',this.unitList.get(this.uid).get('name'));
			this.$el.modal('hide');
			this.model.trigger('myupdate');
			this.uid=null;
		}
	})

	var AssetRouter=Backbone.Router.extend({
		routes:{
			'':'info',
			'detail':'detail',
			'edit':'edit',
			'add':'add',
			'export':'export'
		},
		detail:function (id) {
			if(!AssetRouter.detail){
				AssetRouter.detail=new AssetDetailView();
			}
			AssetRouter.detail.changeModel(id);
		},
		info:function () {
			AssetRouter.asset.doFetch();
		},
		edit:function (id) {
			if(!AssetRouter.edit){
				AssetRouter.edit=new AssetEditView();
			}
			AssetRouter.edit.changeModel(id);
		},
		add:function () {
			if(!AssetRouter.add){
				AssetRouter.add=new AssetAddView();
			}
			AssetRouter.add.changeModel();
		},
		export:function () {
		}
	})
	AssetRouter.asset=new MainAssetView();
	var router=new AssetRouter();
	Backbone.history.start();
	AssetRouter.unit=new UnitTreeView();
})