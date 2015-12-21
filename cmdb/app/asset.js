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

define(['jquery','underscore','backbone','cookie','bootstrap','AssetTypeList','Asset','AssetList','AssetView'],
	function ($,_,Backbone,cookie,bootstrap,AssetTypeList,Asset,AssetList,AssetView) {
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
			console.log(this.asset.attributes);
			this.$el.append(this.template({asset:this.asset.attributes}));
		}
	})

	var AssetEditView=Backbone.View.extend({
		el:$('.content'),
		template:_.template($('#asset-edit-temp').html()),
		events:{
			'change .asset-edit input':'bindValue',
			'change .asset-edit select':'bindType',
			'click #save':'save'
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
			console.log(this.asset);
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
		},
		bindType:function () {
			var tid=$(event.target).val();
			if(confirm("改变资产类型会删除原有的扩展属性信息，确认改变？")){
				var model=this.asset;
				$.ajax({
					method:'POST',
					url:'/cmdbAPI/asset/type',
					data:{id:model.get('id'),typeId:tid},
					success:function (data) {
						model.set('typeDetail',data.result);
						model.set('properties',[])
						_.each(data.result.properties,function (p) {
							model.get('properties').push({id:null,code:p.code,name:p.name,value:'',assetId:model.get('id'),pid:p.id});
						})
						model.set('typeId',tid);
						model.set('type',data.result.name);
						model.trigger('myupdate');
					}
				})
			}else{
				$(event.target).val(this.asset.get('typeDetail').id);
			}
		},
		save:function () {
			if(!(this.asset.get('name')||this.asset.get('code'))){
				alert('名称和编码不能为空');
				return;
			}
			this.asset.save();
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
			AssetRouter.edit.changeModel(0);
		}
	})
	AssetRouter.asset=new MainAssetView();
	var router=new AssetRouter();
	Backbone.history.start();
	AssetRouter.detail=new AssetDetailView();
	AssetRouter.edit=new AssetEditView();
})