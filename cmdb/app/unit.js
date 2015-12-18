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
	}
})

define(['jquery','underscore','backbone','cookie','bootstrap','Unit','UnitList','AssetTypeList','Asset','AssetList'],
	function ($,_,Backbone,cookie,bootstrap,Unit,UnitList,AssetTypeList,Asset,AssetList) {

	$('.nav-menu').load('nav.html',function () {
		$($('.nav-menu a').get(0)).addClass('active');
	});

	var UnitNavView=Backbone.View.extend({
		el:$('.unit-nav'),
		template:_.template($('#unit-nav-temp').html()),
		events:{
			'click .tree-icon':'toggle',
			'click .unit-li>a':'choose'
		},
		initialize:function () {
			this.unitList=new UnitList();
			this.unitList.on('update',this.render,this);
			var self=this;
			this.unitList.fetch().done(function () {
				UnitRouter.detailView=new UnitDetailView(self.unitList.at(0).get('id'));
			});
		},
		/*
		*	@tips: 	root's layer is '/{id}'
		*			if parent's id is 5 and it's layer is /1/4/5
		*			it's children's layer is /1/4/5/{id}
		*/
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
			this.$el.empty();
			this.$el.append(this.template({trees:this.tree.children,parent:0}));
		},
		toggle:function () {
			var parent=$(event.target).closest('.unit-li');

			if(parent.hasClass('active'))
				parent.removeClass('active');
			else
				parent.addClass('active');
		},
		choose:function () {
			$('.unit-li>a.choose').removeClass('choose');
			$(event.target).closest('a').addClass('choose');
		}
	})

	var UnitDetailView=Backbone.View.extend({
		el:$('.detail-wrapper'),
		template:_.template($('#unit-detail-temp').html()),
		initialize:function (id) {
			this.unitDetail=new Unit({id:id});
			this.unitDetail.on('change',this.render,this);
			var self=this;
			this.unitDetail.fetch({wait:true}).done(function () {

				UnitRouter.assetView=new AssetView(self.unitDetail);
				UnitRouter.editView=new UnitEditView(self.unitDetail);
			})
		},
		createView:function (id) {
			this.unitDetail.set('id',id);
			this.unitDetail.fetch();
		},
		render:function () {
			// console.log('d change');
			// console.log(this.unitDetail)
			this.$el.empty()
			this.$el.append(this.template({detail:this.unitDetail}));
		}
	})

	var UnitEditView=Backbone.View.extend({
		el:$('.manage-wrapper'),
		events:{
			'change input':'bindValue'
		},
		template:_.template($('#unit-edit-temp').html()),
		initialize:function (detail) {
			this.detail=detail;
			this.detail.on('change',this.render,this);

			this.detailTemp=this.detail.clone();

			this.render();
		},
		render:function () {
			if(UnitRouter.active!='edit')return;
			this.getParent();
			$('.manage-wrapper').empty();
			$('.manage-wrapper').append(this.template({detail:this.detail,parent:this.parent}));
		},
		getParent:function () {
			var layer=this.detail.get('layer');
			var arr=layer.split('/');
			var pid=arr[arr.length-2];
			var parent=UnitRouter.navView.unitList.get(pid);
			if(!parent){
				parent=new Unit({id:0});
			}
			this.parent=parent;
		},
		bindValue:function () {
			var name=$(event.target).attr('name');
			var value=$(event.target).val();

			var keys=this.detailTemp.keys();
			if(name!='extend'&&keys.indexOf(name)>=0){
				this.detailTemp.set(name,value);
			}else{
				var extend=this.detailTemp.get('extend');
				for(var i in extend){
					if(extend[i].name==name)
						extend[i].value=value;
				}
			}

			console.log(this.detailTemp);
		}
	})
	/*	@Variables: unitDetail:和detailView的detail相绑定，当detailView的值改变，就会触发change时间。
	*				typeList:资产类型列表。
	*				assetList:搜索到的资产列表。
	*				search:保存用于搜索的关键字。unitDetail改变，会改变它的unitId。
	*					  （初始化他的typeId和unitId，否则为null，不能成功fetch）
	*/
	var AssetView=Backbone.View.extend({
		events:{
			'change select':'bindType',
			'change input':'bindValue',
			'click .pagination a':'page',
		},
		el:$('.manage-wrapper'),
		template:_.template($('#asset-temp').html()),
		initialize:function (unitDetail) {
			this.unitDetail=unitDetail;
			this.unitDetail.on('change',this.doChange,this);

			this.typeList=new AssetTypeList();
			this.typeList.on('sync',this.render,this);
			this.typeList.fetch();
			
			this.assetList=new AssetList();
			this.assetList.on('sync',this.render,this);

			this.search={};
			_.extend(this.search,Backbone.Events);
			this.search.model={unit:unitDetail.get('id'),type:0,page:1,
					code:'',name:'',purpose:'',dutyofficer:''};
			this.search.on('change',this.doFetch,this);

			this.doFetch();
		},
		bindType:function () {
			this.search.model.type=$(event.target).val();
			this.search.model.page=1;
			this.search.trigger('change');
		},
		bindValue:function () {
			var name=$(event.target).attr('name');
			this.search.model[name]=$(event.target).val();
			this.search.model.page=1;
			this.search.trigger('change');
		},
		doChange:function () {
			this.search.model.unit=this.unitDetail.get('id');
			this.search.model.page=1;
			this.search.trigger('change');
		},
		doFetch:function () {
			this.assetList.fetch({data:this.search.model});
		},
		render:function () {
			if(UnitRouter.active!='asset')return;
			$('.manage-wrapper').empty();
			$('.manage-wrapper').append(this.template({
				typeList:this.typeList,
				search:this.search.model,
				assetList:this.assetList,
				unit:this.unitDetail
			}));
		},
		page:function () {
			var dom=$(event.target).closest('li');
			var name=$(dom).attr('name')
			if(!name){
				var p=$(dom.children('a')).html();
				this.search.model.page=parseInt(p);
			}else if(name=='prev'){
				if(this.search.model.page>1)
					this.search.model.page--;
				else return;
			}else{
				if(!dom.hasClass('disabled'))
					this.search.model.page++;
			}
			this.search.trigger('change');
		}
	})

	var UnitRouter=Backbone.Router.extend({
		routes:{
			'':'main',
			'asset':'asset',
			'edit':'edit',
			'add':'add',
			'detail':'detail'
		},
		main:function  () {
			$('.manage-tab>.active').removeClass('active');
			$('.manage-tab>a[manage=asset]').addClass('active');	
			UnitRouter.navView=new UnitNavView();
			UnitRouter.active='asset';
		},
		asset:function () {
			if(!UnitRouter.detailView){
				window.location.href="#";
				return;
			}

			$('.manage-tab>.active').removeClass('active');
			$('.manage-tab>a[manage=asset]').addClass('active');	
			
			UnitRouter.active='asset';
			UnitRouter.assetView.render();
		},
		edit:function (id) {
			if(!UnitRouter.detailView){
				window.location.href="#";
				return;
			}

			$('.manage-tab>.active').removeClass('active');
			$('.manage-tab>a[manage=unit]').addClass('active');

			UnitRouter.active='edit';
			UnitRouter.editView.render();
		},
		add:function (id) {
			if(!UnitRouter.detailView){
				window.location.href="#";
				return;
			}

			$('.manage-tab>.active').removeClass('active');
			$('.manage-tab>a[manage=unit]').addClass('active');
			UnitRouter.active='add';
		},
		detail:function  (id) {
			if(!UnitRouter.detailView){
				window.location.href="#";
				return;
			}
			UnitRouter.detailView.createView(id);
		}
	})
	// var mainView=new UnitView();
	UnitRouter.detailView=null;
	UnitRouter.assetView;
	UnitRouter.editView;
	UnitRouter.navView;
	UnitRouter.active;

	new UnitRouter();
	Backbone.history.start();
})