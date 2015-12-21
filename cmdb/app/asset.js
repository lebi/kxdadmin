require.config({
	paths:{
		jquery:'../../lib/jquery-1.11.3.min',
		underscore:'../../lib/underscore-min',
		backbone:'../../lib/backbone',
		cookie:'../../lib/jquery.cookie',
		bootstrap:'../../lib/bootstrap.min',
		model:'../../js/base-model',
		collection:'../../js/base-collection',
		Unit:'model/Unit',
		UnitList:'model/UnitList',
		AssetType:'model/AssetType',
		AssetTypeList:'model/AssetTypeList',
		Asset:'model/Asset',
		AssetList:'model/AssetList',
		AssetView:'AssetView'
	}
})

define(['jquery','underscore','backbone','cookie','bootstrap','AssetType','AssetTypeList','Asset','AssetList','UnitList','AssetView'],
	function ($,_,Backbone,cookie,bootstrap,AssetType,AssetTypeList,Asset,AssetList,UnitList,AssetView) {

	$('.nav-menu').load('nav.html',function () {
		$($('.nav-menu a').get(1)).addClass('active');
	});
	var MainAssetView=AssetView.extend({
		events:{
			'change #asset select':'bindType',
			'change #asset input':'bindValue',
			'click .pagination a':'page',
		},
		el:$('.content'),
		template:_.template($('#asset-info-temp').html()),
		initialize:function () {
			this.typeList=new AssetTypeList();
			this.typeList.on('sync',this.render,this);
			this.typeList.fetch();
			
			this.assetList=new AssetList();
			this.assetList.url='/cmdbAPI/asset/listall'
			this.assetList.on('sync',this.render,this);

			this.search={};
			_.extend(this.search,Backbone.Events);
			this.search.model={unit:'',type:0,page:1,
					code:'',name:'',purpose:'',dutyofficer:''};
			this.search.on('change',this.doFetch,this);

			this.doFetch();
		},
		doFetch:function () {
			this.assetList.fetch({data:this.search.model});
		},
		render:function () {
			this.$el.empty()
			this.$el.append(this.template({
				typeList:this.typeList,
				search:this.search.model,
				assetList:this.assetList
			}));
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
			this.asset.on('sync',this.render,this);
		},
		changeModel:function (id) {
			if(id==0){
				this.asset.trigger('myupdate');
				return;
			}
			this.asset.set('id',id);
			this.asset.fetch();
		},
		render:function () {
			// console.log(this.asset);
			this.$el.empty()
			this.$el.append(this.template({
				asset:this.asset.attributes,
				typeList:AssetRouter.asset.typeList
			}));
		},
		bindValue:function () {
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
			console.log(this.asset);
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
			this.asset.save();
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
			console.log(this.asset);
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
				typeList:AssetRouter.asset.typeList
			}));
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
			this.uid=parseInt($(event.target).attr('uid'));
			$('.unit-li>a.choose').removeClass('choose');
			$(event.target).closest('a').addClass('choose');
		},
		showView:function (model) {
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
			'add':'add'
		},
		detail:function (id) {
			if(!AssetRouter.detail){
				window.location.href="#";
				return;
			}
			AssetRouter.detail.changeModel(id);
		},
		info:function () {
			AssetRouter.asset.render();
		},
		edit:function (id) {
			if(!AssetRouter.detail){
				window.location.href="#";
				return;
			}
			AssetRouter.edit.changeModel(id);
		},
		add:function () {
			if(!AssetRouter.detail){
				window.location.href="#";
				return;
			}
			AssetRouter.add.changeModel();
		}
	})
	AssetRouter.asset=new MainAssetView();
	var router=new AssetRouter();
	Backbone.history.start();
	AssetRouter.detail=new AssetDetailView();
	AssetRouter.edit=new AssetEditView();
	AssetRouter.add=new AssetAddView();
	AssetRouter.unit=new UnitTreeView();
})