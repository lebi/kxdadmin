define(['require','jquery','underscore','backbone','OperationRouter'],
	function (require,$,_,Backbone,OperationRouter) {

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
		initialize:function () {
			// this.operation=operation;
			// this.operation.on('myupdate',this.render,this);
			// this.render();
		},
		refreshView:function (operation,mainView) {
			this.mainView=mainView;

			this.operation=operation;
			this.operation.on('myupdate',this.render,this);
			this.render();

		},
		render:function () {
			this.$el.empty();
			this.$el.append(this.template({operation:this.operation,types:this.mainView.typeList}));
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
			this.operation.set('type',this.mainView.typeList.get(type).get('name'));
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
					self.mainView.operationList.fetch().done(function () {
						self.mainView.operationList.trigger('update')
						var id=self.operation.get('id');
						window.location.href='#edit?'+id;
					})
				},1000);
			})
			.fail(function () {
				dom.after(" <span id='save-hint' class='fail'> <i class='icon-remove'></i> 保存失败</span>");
				setTimeout(function () {
					$('#save-hint').remove();
				},1500);
				
			})
		}
	})
	return OperationEditView;
})