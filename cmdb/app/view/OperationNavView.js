define(['jquery','underscore','backbone','Operation','OperationList','OperationType','OperationTypeList'],
	function ($,_,Backbone,Operation,OperationList,OperationType,OperationTypeList) {
	var OperationNavView=Backbone.View.extend({
		el:$('.operation-nav'),
		template:_.template($('#operation-nav-temp').html()),
		events:{
			'click .unit-li>.children':'active',
			'click .dropdown':'active',
			'click .tree-icon':'toggle',
			'click #type-save':'typeSave',
			'click .type-edit':'typeEdit',
			'click #type-add':'typeAdd',
			'show.bs.modal #type-modal':'bindModel',
			'change #type-modal input[name=type]':'bindTypename'
		},
		initialize:function () {
			this.operationList=new OperationList();
			this.typeList=new OperationTypeList();
			
			this.tree={};
			_.extend(this.tree,Backbone.Events);
			this.tree.models={};
			this.tree.on("update",this.render,this);

			this.operationList.on("update",this.parseTree,this);
			this.typeList.on("update",this.parseTree,this);

			this.operationList.fetch();
			this.typeList.fetch();
		},
		parseTree:function () {
			if(this.typeList.length==0)return;
			
			var self=this;
			this.typeList.each(function (type) {
				self.tree.models[type.get('id')]=new Array();
			})
			this.operationList.each(function (op) {
				// console.log(op.get('type'));
				self.tree.models[op.get('typeId')].push(op);
			})
			this.tree.trigger('update');
		},
		render:function () {
			this.$el.empty();
			this.$el.append(this.template({tree:this.tree.models,types:this.typeList}));
		},
		active:function () {
			$('.operation-tree a.active').removeClass('active');
			var children=$(event.target).closest('.unit-li').children('a');
			children.addClass('active');
		},
		toggle:function () {
			var li=$(event.target).closest('.unit-li');
			if(li.hasClass('active'))
				li.removeClass('active');
			else
				li.addClass('active')
		},
		typeSave:function () {
			var flag=this.modalType.get('id');
			var self=this;
			this.modalType.save().done(function () {
				self.typeList.fetch().done(function () {
					self.typeList.trigger('update');
				})
				$('.modal-backdrop').remove();
			})
		},
		typeEdit:function () {
			var typeId=$(event.target).attr('typeId');
			this.modalType=this.typeList.get(typeId);
			$('#type-modal').modal('show');
		},
		typeAdd:function () {
			this.modalType=new OperationType();
			$('#type-modal').modal('show');
		},
		bindModel:function () {
			if(this.modalType.get('name'))
				$('#type-modal .modal-title').html('修改操作类型');
			else
				$('#type-modal .modal-title').html('添加新的操作类型');
			$('#type-modal input').val(this.modalType.get('name'));
		},
		bindTypename:function () {
			if(this.modalType)
				this.modalType.set('name',$(event.target).val());
		}
	})
	return OperationNavView;
})