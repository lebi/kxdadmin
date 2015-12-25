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
		AssetType:'model/AssetType',
		AssetTypeList:'model/AssetTypeList',
		Operation:'model/Operation',
		OperationList:'model/OperationList',
		AssetTypeProperty:'model/AssetTypeProperty'
	}
})

define(['jquery','underscore','backbone','cookie','jqueryform','AssetType','AssetTypeList','Operation','OperationList','AssetTypeProperty','bootstrap'],
	function ($,_,Backbone,cookie,jqueryform,AssetType,AssetTypeList,Operation,OperationList,AssetTypeProperty,bootstrap) {

	$('.nav-menu').load('nav.html',function () {
		$($('.nav-menu a').get(3)).addClass('active');
	});

	var AssetTypeView=Backbone.View.extend({
		events:{
			'click #export':'export',
			'click #import':'import',
			'change #upload>input':'upload'
		},
		template:_.template($('#property-temp').html()),
		el:$('.content-wrapper'),
		initialize:function () {
			this.collection=new AssetTypeList();
			this.collection.on('sync',this.render,this);
			this.collection.fetch();

			this.operations=new OperationList();
			this.operations.fetch();
		},
		render:function () {
			console.log(this.collection);
			this.$el.empty();
			this.$el.append(this.template({collection:this.collection}));
		},
		export:function () {
			window.open("/cmdbAPI/type/export");
		},
		import:function () {
			$('#upload input').click();
		},
		upload:function () {
			if(!$('#upload input').val())
				return;
			$('.hint',this.$el).html(" <i class='icon-spin icon-spinner'></i>正在导入");
			// $("#import").after("<span class='loading'> <i class='icon-spin icon-spinner'></i>正在导入</span>")
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
		}
	})

	// console.log(OperationList);
	var AssetEditView=Backbone.View.extend({
		events:{
			'click .tree-icon':'toggle',
			'click .add-extend':'addExtend',
			'click .extend-edit':'editExtend',
			'click #save-extend':'saveExtend',
			'click .op-remove':'removeOp',
			'change input[name=type-name]':'bindName',
			'change input[name=type-code]':'bindCode',
			'dblclick .children':'addOp',
			'click #save':'save',
		},
		template:_.template($('#property-edit-temp').html()),
		el:$('.content-wrapper'),
		initialize:function () {
			this.operationTree;
			this.assetType;
		},
		/*
		*	@Usage: initialize this.assetType;
					this.assetType bind the data of the view;
		*/
		createView:function (assetType) {
			if(!assetType)
				this.assetType=new AssetType();
			else
				this.assetType=assetType;
			this.assetType.on('myupdate',this.render,this);
			this.render();
		},
		render:function () {
			if(!this.operationTree)
				this.parseTree();
			this.$el.empty();
			this.$el.append(this.template({assetType:this.assetType,tree:this.operationTree}));
		},
		/*
		*	@Usage: change list data structure to a map;
		*	@Type:
		*		property.operations: OperationList;
		*		this.operationTree: Map<type,Operation>;
		*/
		parseTree:function(){
			this.operationTree={};
			var self=this;
			assetView.operations.each(function (op) {
				if(!self.operationTree[op.get('type')])
					self.operationTree[op.get('type')]=new Array();
				self.operationTree[op.get('type')].push(op);
			})
		},
		/* 
		*	@Usage: show and hide the tree;
		*/
		toggle:function () {
			var li=$(event.target).closest('.unit-li');
			if(li.hasClass('active'))
				li.removeClass('active');
			else
				li.addClass('active');
		},
		/*
		*	@Usage: bind data of this.assetType and data on the view
		*/
		bindName:function () {
			var name=$(event.target).val();
			this.assetType.set('name',name);
		},
		bindCode:function () {
			var code=$(event.target).val();
			this.assetType.set('code',code);
		},
		/*
		*	@Usage: add new type or save edit type;
		*			if create, add this type to main view's collection.
		*/
		save:function () {
			if(!(this.assetType.get('name')&&this.assetType.get('code'))){
				alert('名称或编码不能为空');
				return;
			}
			var dom=$(event.target);
			var flag=this.checkTypeId();
			var self=this;
			this.assetType.save().done(function () {
				$(dom).after(" <span id='save-hint'> <i class='icon-ok-sign'></i> 保存成功</span>");
				if(!flag)
					assetView.collection.add(self.assetType);
				setTimeout(function () {
					$('#save-hint').remove();
				},1000);
			});
		},
		checkExtend:function (name,code,id) {
			if(name==''||code==''){
				alert('输入不能为空');
				return false;
			}
			var reg=/,/;
			if(reg.test(name)||reg.test(code)){
				alert('输入包含而特殊字符');
				return false;
			}

			for(var i in this.assetType.get('properties')){
				var data=this.assetType.get('properties')[i];
				if(data.code==code||data.name==name){
					console.log(data);
					console.log(id);
					if(data.id==id)
						continue;
					alert('输入重复属性');
					return false;
				}
			}
			return true;
		},
		/*
		*	@Usage: check if this is an exist type.
		*			if false, can't add propery and operation to this type;
		*/
		checkTypeId:function () {
			if(!this.assetType.get('id'))
				return false;
			return true;
		},
		/*
		*	@Usage: check if empty;if contains comma;if exist in this.assetType;
		*			add the property to the view and this.assetType;
		*/
		addExtend:function () {
			if(!this.checkTypeId()){
				alert('请先添加资产类型');
				return;
			}


			var name=$('input[name=extendName]').val();
			var code=$('input[name=extendCode]').val();

			if(!this.checkExtend(name,code))
				return;

			var property=new AssetTypeProperty({name:name,code:code,type:this.assetType.get('id')});
			var self=this;
			property.save().done(function () {
				self.assetType.get('properties').push(property.toJSON());
				self.assetType.trigger('myupdate');
			})
		},
		/*
		*	@Usage: edit extend property of the type;
					need to restore the original name,code,id;
					restore original id in #edit-modal's extendid;
		*/
		editExtend:function () {

			var parent=$(event.target).closest('.badge');
			
			var name=$(parent.children('span').get(0)).html();
			var code=$(parent.children('span').get(1)).html();
			var id=parent.attr('extendid');
			$('#edit-modal input[name=modal-extend-name]').val(name);
			$('#edit-modal input[name=modal-extend-code]').val(code);
			$('#edit-modal').attr('extendid',id);
			$('#edit-modal').modal('show');
		},
		saveExtend:function () {
			var name=$('#edit-modal input[name=modal-extend-name]').val();
			var code=$('#edit-modal input[name=modal-extend-code]').val();
			var id=$('#edit-modal').attr('extendid');

			if(!this.checkExtend(name,code,id))
				return;

			var property=new AssetTypeProperty({name:name,code:code,id:id});
			var self=this;
			property.save().done(function () {
				_.each(self.assetType.get('properties'),function (data) {
					if(data.id==id){
						data.name=name;
						data.code=code;
					}
				})
				self.assetType.trigger('myupdate');
				$('.modal-backdrop').remove();
				$('#edit-modal').modal('hide');
			})
		},
		addOp:function () {
			if(!this.checkTypeId()){
				alert('请先添加资产类型');
				return;
			}

			var id=$(event.target).closest('.children').attr('nodeid');
			var op=assetView.operations.get(id).toJSON();
			for(var i in this.assetType.get('operations')){
				if(this.assetType.get('operations')[i].name==op.name){
					alert('操作已存在');
					return;
				}
			}
			var data={type:this.assetType.get('id'),operation:id};
			var self=this;
			Backbone.ajax({
				method:'POST',
				data:data,
				'url':'/cmdbAPI/type/operation',
				success:function () {
					self.assetType.get('operations').push(op);
					self.assetType.trigger('myupdate');
				}
			});

		},
		removeOp:function () {
			var id=$(event.target).closest('.badge').attr('opid');
			var self=this;
			var data={type:this.assetType.get('id'),operation:parseInt(id)};
			Backbone.ajax({
				method:'DELETE',
				data:JSON.stringify(data),
				headers:{"Content-Type":"application/json"},
				'url':'/cmdbAPI/type/operation',
				success:function () {
					var newarr=_.reduce(self.assetType.get('operations'),function (memo,i) {
						if(i.id!=id)
							memo.push(i);
						return memo;
					},new Array())
					self.assetType.set('operations',newarr);
					self.assetType.trigger('myupdate');
				}
			});
		}
	})

	var AppRouter=Backbone.Router.extend({
		routes:{
			'':'view',
			'edit':'edit'
		},
		view:function () {
			if(assetView)
				assetView.render();
			else
				assetView=new AssetTypeView();
		},
		edit:function (id) {
			if(!assetView){
				window.location.href="#";
				return;
			}
				

			if(!edit)
				edit=new AssetEditView();
			
			if(id)
				edit.createView(assetView.collection.get(id));
			else
				edit.createView();
			
		}
	})
	var router=new AppRouter();
	Backbone.history.start();
	var assetView;
	var edit;
})