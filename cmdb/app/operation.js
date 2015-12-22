require.config({
	paths:{
		jquery:'../../lib/jquery-1.11.3.min',
		underscore:'../../lib/underscore-min',
		backbone:'../../lib/backbone',
		cookie:'../../lib/jquery.cookie',
		bootstrap:'../../lib/bootstrap.min',
		model:'../../js/base-model',
		collection:'../../js/base-collection',
		Operation:'model/Operation',
		OperationList:'model/OperationList',
		OperationType:'model/OperationType',
		OperationTypeList:'model/OperationTypeList',
	}
})

define(['jquery','underscore','backbone','cookie','Operation','OperationList','bootstrap','OperationType','OperationTypeList'],
	function ($,_,Backbone,cookie,Operation,OperationList,bootstrap,OperationType,OperationTypeList) {
	$('.nav-menu').load('nav.html',function () {
		$($('.nav-menu a').get(2)).addClass('active');
	});

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
			console.log(this.tree);
			console.log('render');
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

	var OperationDetailView=Backbone.View.extend({
		events:{
			'click #remove-op':'remove'
		},
		el:$('.operation-edit'),
		template:_.template($('#operation-detail-temp').html()),
		initialize:function (operation) {
			this.operation=operation;
			this.render();
		},
		refreshView:function (operation) {
			this.operation=operation;
			this.render();
		},
		render:function () {
			this.$el.empty();
			this.$el.append(this.template({operation:this.operation,types:mainView.typeList}));
		},
		remove:function () {
			var self=this;
			this.operation.destroy({wait: true})
			.done(function () {
				self.$el.empty();
				window.location.href="#";
			})
			.fail(function (data) {
				if(data.status==409)
					alert('删除操作失败，存在资产和该操作关联！');
			})
		}
	})

	var OperationEditView=Backbone.View.extend({
		events:{
			'change input':'bindInput',
			'click #add-param':'addParam',
			'click .param-remove':'removeParam',
			'change select':'bindType',
			'click #save':'save'
		},
		el:$('.operation-edit'),
		template:_.template($('#operation-edit-temp').html()),
		initialize:function (operation) {
			this.operation=operation;
			this.operation.on('myupdate',this.render,this);
			this.render();
		},
		refreshView:function (operation) {
			this.operation=operation;
			this.operation.on('myupdate',this.render,this);
			this.render();
		},
		render:function () {
			this.$el.empty();
			this.$el.append(this.template({operation:this.operation,types:mainView.typeList}));
		},
		bindInput:function () {
			var input=$(event.target);
			var name=input.attr('name');
			if(name){
				this.operation.set(name,input.val());
			}
		},
		addParam:function () {
			var param=$(event.target).closest('.form-group').find('input').val();
			if(param==''){
				alert('输入不能为空');
				return;
			}
			if(this.operation.get('parameters'))
				this.operation.set('parameters',this.operation.get('parameters')+param.trim()+';');
			else
				this.operation.set('parameters',param.trim()+';');
			// console.log(this.operation.get('parameters'));
			this.operation.trigger('myupdate');
		},
		removeParam:function () {
			var i=$(event.target).closest('a').index();
			var arr=this.operation.get('parameters').split(';');
			var str='';
			for(var j=0;j<arr.length-1;j++){
				if(j!=i)
					str+=arr[j]+';';
			}
			this.operation.set('parameters',str);
			this.operation.trigger('myupdate');
		},
		bindType:function () {
			var type=$(event.target).val();
			this.operation.set('typeId',type);
			this.operation.set('type',mainView.typeList.get(type).get('name'));
			console.log(this.operation);
		},
		save:function () {
			if(!this.operation.get('name')){
				alert('名称不能为空');
				return;
			}
			var flag=this.operation.get('id');
			var dom=$(event.target);
			var self=this;
			this.operation.save().done(function () {
				dom.after(" <span id='save-hint'> <i class='icon-ok-sign'></i> 保存成功</span>");
				dom.addClass('disabled');

				setTimeout(function () {
					$('#save-hint').remove();
					mainView.operationList.fetch().done(function () {
						mainView.operationList.trigger('update')
						var id=self.operation.get('id');
						window.location.href='#edit?'+id;
					})
				},1000);
			})
		}
	})


	var AppRouter=Backbone.Router.extend({
		routes:{
			'detail':'detail',
			'edit':'edit',
			'add':'add'
		},
		detail:function (id) {
			if(!mainView){
				window.location.href="#";
				return;
			}
			if(detail)
				detail.refreshView(mainView.operationList.get(id));
			else
				detail=new OperationDetailView(mainView.operationList.get(id));
		},
		edit:function (id) {
			if(!mainView){
				window.location.href="#";
				return;
			}
			if(edit)
				edit.refreshView(mainView.operationList.get(id).clone());
			else
				edit=new OperationEditView(mainView.operationList.get(id).clone());
		},
		add:function (id) {
			if(!mainView){
				window.location.href="#";
				return;
			}
			if(edit)
				edit.refreshView(new Operation({typeId:id}));
			else
				edit=new OperationEditView(new Operation({typeId:id}));
		}
	})

	var router=new AppRouter();
	Backbone.history.start();
	var mainView=new OperationNavView()
	var detail;
	var edit;
})