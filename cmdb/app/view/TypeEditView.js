/*
*	view of edit or add type;
*	edit properties of the type;
*	edit operations of the type;
*/

define(['jquery','underscore','backbone','AssetType','AssetTypeProperty'],
	function ($,_,Backbone,AssetType,AssetTypeProperty) {
	var TypeEditView=Backbone.View.extend({
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
		/*
		*	operations:list of all operations;
		*	typeList:list of all types;
		*/
		initialize:function (operations,typeList) {
			this.operations=operations;
			this.typeList=typeList;
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
			this.operations.each(function (op) {
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
			this.assetType.save()
			.done(function () {
				$(dom).after(" <span id='save-hint'> <i class='icon-ok-sign'></i> 保存成功</span>");
				if(!flag){
					self.typeList.add(self.assetType);
				}
				setTimeout(function () {
					$('#save-hint').remove();
				},1000);
			})
			.fail(function () {
				$(dom).after(" <span id='save-hint' class='fail'> <i class='icon-remove'></i> 保存失败</span>");
				setTimeout(function () {
					$('#save-hint').remove();
				},1000);
			})
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
			// console.log(AssetTypeProperty);
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
			.fail(function () {
				alert('保存失败，检查属性编码');
			})
		},
		addOp:function () {
			if(!this.checkTypeId()){
				alert('请先添加资产类型');
				return;
			}

			var id=$(event.target).closest('.children').attr('nodeid');
			var op=this.operations.get(id).toJSON();
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
	return TypeEditView;
})