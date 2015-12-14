require.config({
	paths:{
		jquery:'../../lib/jquery-1.11.3.min',
		underscore:'../../lib/underscore-min',
		backbone:'../../lib/backbone',
		cookie:'../../lib/jquery.cookie',
		bootstrap:'../../lib/bootstrap.min',
		model:'../../js/base-model',
		collection:'../../js/base-collection',
		AssetType:'model/AssetType',
		AssetTypeList:'model/AssetTypeList',
		Operation:'model/Operation',
		OperationList:'model/OperationList'
	}
})

define(['underscore','backbone','cookie','AssetType','AssetTypeList','Operation','OperationList'],
	function (_,Backbone,cookie,AssetType,AssetTypeList,Operation,OperationList) {

	var PropertyView=Backbone.View.extend({
		template:_.template($('#property-temp').html()),
		el:$('.content-wrapper'),
		initialize:function () {
			this.collection=new AssetTypeList();
			this.collection.on('update',this.render,this);
			this.collection.fetch();

			this.operations=new OperationList();
			this.operations.fetch();
		},
		render:function () {
			console.log(this.collection);
			this.$el.empty();
			this.$el.append(this.template({collection:this.collection}));
		}
	})

	// console.log(OperationList);
	var PropertyEditView=Backbone.View.extend({
		events:{
			'click .tree-icon':'toggle',
			'click .add-type':'addType',
			'click .extend-remove':'removeExtend'
		},
		template:_.template($('#property-edit-temp').html()),
		el:$('.content-wrapper'),
		initialize:function () {
			this.operationTree;
			this.property;
		},
		/*
		*	@Usage: initialize this.property;
					this.property bind the data of the view;
		*/
		createView:function (property) {
			if(!property)
				this.property=new AssetType();
			else
				this.property=property.clone();
			this.property.on('myupdate',this.render,this);
			this.render();
		},
		render:function () {
			if(!this.operationTree)
				this.parseTree();
			this.$el.empty();
			this.$el.append(this.template({property:this.property,tree:this.operationTree}));
		},
		parseTree:function(){
			this.operationTree={};
			var self=this;
			property.operations.each(function (op) {
				if(!self.operationTree[op.get('type')])
					self.operationTree[op.get('type')]=new Array();
				self.operationTree[op.get('type')].push(op.get('name'));
			})
		},
		/* 
		*	@Usage: 	show and hide the operation tree;
		*/
		toggle:function () {
			var li=$(event.target).closest('.unit-li');
			if(li.hasClass('active'))
				li.removeClass('active');
			else
				li.addClass('active');
		},
		/*
		*	@Usage: check if empty;if contains comma;if exist in this.property;
		*			add the property to the view and this.property;
		*/
		addType:function () {
			var name=$('input[name=extendName]').val();
			var code=$('input[name=extendCode]').val();

			if(name==''||code==''){
				alert('输入不能为空');
				return;
			}
			var reg=/,/;
			if(reg.test(name)||reg.test(code)){
				alert('输入包含而特殊字符');
				return;
			}

			if(this.property.get('extendType').split(',').indexOf(name)>0||
				this.property.get('extendCode').split(',').indexOf(code)>0){
				alert('输入重复属性');
				return;
			}
			this.property.set('extendType',this.property.get('extendType')+','+name);
			this.property.set('extendCode',this.property.get('extendCode')+','+code);
			this.property.trigger('myupdate');

		},
		removeExtend:function () {
			var parent=$(event.target).closest('.badge');
			
			var name=$(parent.children('span').get(0)).html();
			var code=$(parent.children('span').get(1)).html();
			var newname=_.reduce(this.property.get('extendType').split(','),function (memo,t) {
				if(t!=name)
					if(memo=='')
						memo+=t;
					else
						memo+=','+t;
				return memo;
			},'')

			var newcode=_.reduce(this.property.get('extendCode').split(','),function (memo,t) {
				if(t!=code)
					if(memo=='')
						memo+=t;
					else
						memo+=','+t;
				return memo;
			},'')

			this.property.set('extendType',newname);
			this.property.set('extendCode',newcode);
			this.property.trigger('myupdate');
		}
	})

	var AppRouter=Backbone.Router.extend({
		routes:{
			'':'view',
			'edit':'edit'
		},
		view:function () {
			if(property)
				property.render();
			else
				property=new PropertyView();
		},
		edit:function (id) {
			if(!property){
				window.location.href="#";
				return;
			}
				

			if(!edit)
				edit=new PropertyEditView();
			
			if(id)
				edit.createView(property.collection.get(id));
			else
				edit.createView();
			
		}
	})
	var router=new AppRouter();
	Backbone.history.start();
	var property;
	var edit;
})