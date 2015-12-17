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
		AssetTypeList:'model/AssetTypeList'
	}
})

define(['jquery','underscore','backbone','cookie','bootstrap','Unit','UnitList','AssetTypeList'],
	function ($,_,Backbone,cookie,bootstrap,Unit,UnitList,AssetTypeList) {

	$('.nav-menu').load('nav.html',function () {
		$($('.nav-menu a').get(0)).addClass('active');
	});
	var UnitView=Backbone.View.extend({
		el:$('body'),
		events:{
			'click .manage-tab>a':'switchManage'
		},
		initialize:function(){
			// this.detail=new UnitDetailView();
			$('.manage-tab>a[manage=asset]').addClass('active');
			// UnitView.manage=new AssetView();
			new UnitRouter();
		}
	})
	UnitView.manage=null;

	var UnitNavView=Backbone.View.extend({
		el:$('.unit-nav'),
		template:_.template($('#unit-nav-temp').html()),
		events:{
			'click .tree-icon':'toggle'
		},
		initialize:function () {
			this.unitList=new UnitList();
			this.unitList.on('update',this.render,this);
			var self=this;
			this.unitList.fetch().done(function () {
				detailView=new UnitDetailView(self.unitList.at(0).get('id'));
				assetView=new AssetView();
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
			this.$el.append(this.template({trees:this.tree.children,parent:0}));
		},
		toggle:function () {
			var parent=$(event.target).closest('.unit-li');

			if(parent.hasClass('active'))
				parent.removeClass('active');
			else
				parent.addClass('active');
		}
	})

	var UnitDetailView=Backbone.View.extend({
		el:$('.detail-wrapper'),
		template:_.template($('#unit-detail-temp').html()),
		initialize:function (id) {
			this.unitDetail=new Unit({id:id});
			this.unitDetail.on('change',this.render,this);
			this.unitDetail.fetch({wait:true});
		},
		createView:function (id) {
			this.unitDetail.set('id',id);
			this.unitDetail.on('change',this.render,this);
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
		},
		template:_.template($('#unit-edit-temp').html()),
		initialize:function (detail) {
			this.detail=detail;
			this.detail.on('change',this.render,this)
			this.render();
		},
		createView:function (detail) {
			this.detail=detail;
			this.render();
		},
		render:function () {
			this.getParent();
			$('.manage-wrapper').empty();
			$('.manage-wrapper').append(this.template({detail:this.detail,parent:this.parent}));
		},
		getParent:function () {
			var layer=this.detail.get('layer');
			var arr=layer.split('/');
			var pid=arr[arr.length-2];
			var parent=navView.unitList.get(pid);
			if(!parent){
				parent=new Unit({id:0});
			}
			this.parent=parent;
		}
	})

	var AssetView=Backbone.View.extend({
		el:$('.manage-wrapper'),
		template:_.template($('#asset-temp').html()),
		initialize:function () {
			this.typeList=new AssetTypeList();
			this.typeList.fetch();
			this.render();
		},
		render:function () {
			console.log('change');
			$('.manage-wrapper').empty();
			$('.manage-wrapper').append(this.template());
		}	
	})

	var UnitRouter=Backbone.Router.extend({
		routes:{
			'asset':'asset',
			'edit':'edit',
			'add':'add',
			'detail':'detail'
		},
		asset:function () {
			if(!detailView){
				window.location.href="#";
				return;
			}

			$('.manage-tab>.active').removeClass('active');
			$('.manage-tab>a[manage=asset]').addClass('active');
			// if(UnitView.manage instanceof UnitEditView)
			// 	this.editTemp=UnitView.manage;

			// if(this.assetTemp)
			// 	UnitView.manage=this.assetTemp;
			// else
			// 	UnitView.manage=new AssetView();
			
			// console.log(UnitView.manage)
			// UnitView.manage.render();

			if(assetView)
				assetView.render();
			else assetView=new AssetView();
		},
		edit:function (id) {
			if(!detailView){
				window.location.href="#";
				return;
			}

			$('.manage-tab>.active').removeClass('active');
			$('.manage-tab>a[manage=unit]').addClass('active');
			// if(UnitView.manage instanceof AssetView)
			// 	this.assetTemp=UnitView.manage;

			// if(this.editTemp)
			// 	UnitView.manage=this.editTemp;
			// else
			// 	UnitView.manage=new UnitEditView(detail.unitDetail.clone());
			// UnitView.manage.createView(detail.unitDetail.clone());
			// console.log(UnitView.manage)
			// UnitView.manage.render();
			if(!detailView){
				window.location.href="#";
				return;
			}


			if(editView){
				editView.createView(detailView.unitDetail);
			}else {
				editView=new UnitEditView(detailView.unitDetail);
			}
		},
		add:function (id) {
			$('.manage-tab>.active').removeClass('active');
			$('.manage-tab>a[manage=unit]').addClass('active');
		},
		detail:function  (id) {
			if(!detailView){
				window.location.href="#";
				return;
			}

			if(detailView)
				detailView.createView(id);
			else
				detailView=new UnitDetailView(id);
		}
	})
	var mainView=new UnitView();
	var detailView;
	var assetView;
	var editView;
	var navView=new UnitNavView();

	Backbone.history.start();
})