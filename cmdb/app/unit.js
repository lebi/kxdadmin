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
			this.unitList.on('reset',this.render,this);
			var self=this;
			this.unitList.fetch({reset: true}).done(function () {
				console.log(self.unitList);
				UnitRouter.detailView=new UnitDetailView(self.unitList.at(0).get('id'));
			});
		},
		/*
		*	@tips: 	root's layer is '/{id}'
		*			if parent's id is 5 and it's layer is /1/4/5
		*			it's children's layer is /1/4/5/{id}
		*/
		render:function () {
			console.log('units update');
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
			this.unitDetail.attributes.id=id;
			// this.unitDetail.set('id',id);
			var self=this;
			this.unitDetail.fetch().done(function  () {
				self.unitDetail.trigger('chooseChange');
			})
		},
		render:function () {
			this.$el.empty()
			this.$el.append(this.template({detail:this.unitDetail}));
		}
	})

	/*	@Variables: detail:和detailView的detail相绑定，当detailView的值改变，就会触发chooseChange。
	*				detailTemp:这个更改后的unit缓存，和input等相绑定，修改触发myupdate。
	*				propertyTemp:新属性缓存，和modal框绑定，在选择添加后将属性添加到detailTemp中，并将其初始化。
	*/
	var UnitEditView=Backbone.View.extend({
		el:$('.manage-wrapper'),
		events:{
			'change .unit-manage input':'bindValue',
			'change #property-modal input':'bindProperty',
			'click #add-property':'addProperty',
			'click #save':'save'
		},
		template:_.template($('#unit-edit-temp').html()),
		/*
		*   @Usage: 初始化detail,detailTemp,propertyTemp。
		*/
		initialize:function (detail) {
			this.detail=detail;
			this.detail.on('chooseChange',this.changeDetail,this);

			this.detailTemp=this.detail.clone();
			this.detailTemp.on('myupdate',this.render,this);

			this.propertyTemp={code:'',description:'',value:'',name:''};

			this.render();
		},
		/*
		*   @Usage: 当view的功能改变时（从添加变成编辑或反之），重新初始化值。
		*/
		setDetail:function (detail) {
			this.detail=detail;
			this.detail.on('chooseChange',this.changeDetail,this);
			this.detailTemp=this.detail.clone();
			this.detailTemp.on('myupdate',this.render,this);

			this.propertyTemp={code:'',description:'',value:'',name:''};

			this.render();
		},
		/*
		*   @Usage: 当单位列表选择其他单位时，修改本地缓存，并重新渲染页面。
		*/
		changeDetail:function () {
			this.detailTemp.set(this.detail.toJSON());
			this.detailTemp.trigger('myupdate');
		},
		/*
		*   @Usage: tab栏选择的是单位管理时，选择渲染view，否则返回。
		*/
		render:function () {
			// console.log(this.detailTemp);

			if(UnitRouter.active!='edit')return;
			this.getParent();
			$('.manage-wrapper').empty();
			$('.manage-wrapper').append(this.template({detail:this.detailTemp,parent:this.parent}));
		},
		/*
		*   @Usage: 根据pid，获取父单位的对象。
		*/
		getParent:function () {
			var pid=this.detail.get('parent');
			var parent=UnitRouter.navView.unitList.get(pid);
			if(!parent){
				parent=new Unit({id:0});
			}
			this.parent=parent;
		},
		/*
		*   @Usage: 绑定input和detailTemp。有基本熟悉和扩展属性两种情况。
		*/
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
			// console.log(this.detail);
			// console.log(this.detailTemp);
		},
		/*
		*   @Usage: 绑定modal和propertyTemp。
		*/
		bindProperty:function () {
			var name=$(event.target).attr('name');
			this.propertyTemp[name]=$(event.target).val();
			// console.log(this.detailTemp);
			// console.log(this.propertyTemp);
		},
		/*
		*   @Usage: 将propertyTemp添加到detailTemp中。并将propertyTemp重置。
		*/
		addProperty:function () {
			var name=this.propertyTemp.name;
			if(!name){
				alert("属性不能为空");
				return;
			}
			for(var i in this.detailTemp.get('extend')){
				if(this.detailTemp.get('extend')[i].name==name){
					alert("该属性已存在");
					return;
				}
			}
			this.detailTemp.get('extend').push(this.propertyTemp);
			this.propertyTemp={code:'',description:'',value:'',name:''};
			this.detailTemp.trigger('myupdate');
			$('.modal-backdrop').remove();
		},
		/*
		*   @Usage: 将detail保存，detail.set会出发detail的change，使detailView也改变。
		*			将navView.unitList更新。
		*/
		save:function () {
			var self=this;
			this.detailTemp.save().done(function () {
				self.detail.set(self.detailTemp.toJSON());
				UnitRouter.navView.unitList.fetch({reset: true});
			})
		}
	})
	/*	@Variables: unitDetail:和detailView的detail相绑定，当detailView的值改变，就会触发chooseChange。
	*				typeList:资产类型列表。
	*				assetList:搜索到的资产列表。
	*				search:保存用于搜索的关键字。unitDetail改变，会改变它的unitId。
	*					  （初始化他的typeId和unitId，否则为null，不能成功fetch）
	*/
	var AssetView=Backbone.View.extend({
		events:{
			'change #asset select':'bindType',
			'change #asset input':'bindValue',
			'click .pagination a':'page',
		},
		el:$('.manage-wrapper'),
		template:_.template($('#asset-temp').html()),
		initialize:function (unitDetail) {
			this.unitDetail=unitDetail;
			this.unitDetail.on('chooseChange',this.doChange,this);

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
			if(UnitRouter.active!='asset')return;
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
			UnitRouter.editView.setDetail(UnitRouter.detailView.unitDetail);
		},
		add:function (id) {
			if(!UnitRouter.detailView){
				window.location.href="#";
				return;
			}

			$('.manage-tab>.active').removeClass('active');
			$('.manage-tab>a[manage=unit]').addClass('active');
			id=parseInt(id);
			UnitRouter.active='edit';

			if(!id){
				UnitRouter.editView.setDetail(new Unit({parent:0}));
				return;
			}
			UnitRouter.editView.setDetail(new Unit({parent:id}));
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

