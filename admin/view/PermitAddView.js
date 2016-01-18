define(['jquery','underscore','backbone','UserList','RoleList','UnitList','Permit'],function ($,_,Backbone,UserList,RoleList,UnitList,Permit) {

	var PermitAddView=Backbone.View.extend({
		events:{
			'click #permit-add .choose-frame a':'choose',
			'click #permit-add .tree-icon':'toggle',
			'click #permit-add #add':'addSubmit'
		},
		el:$('.tool-wrapper'),
		template:_.template($('#permit-add-temp').html()),
		initialize:function (show) {
			this.show=show;
			this.userList=new UserList();
			this.unitList=new UnitList();
			this.roleList=new RoleList();
			this.unitTree=new TreeView();

			this.userList.on('update',this.render,this);
			this.unitList.on('update',this.render,this);
			this.roleList.on('update',this.render,this);

			this.unitList.fetch();

			this.permit=new Permit();
		},
		showView:function () {
			this.userList.fetch();
			this.roleList.fetch();
		},
		render:function () {
			if(this.show.target!='permitadd')return;
			this.$el.html(this.template({
				userList:this.userList,
				unitStr:this.unitTree.render(this.unitList),
				roleList:this.roleList
			}));
		},
		choose:function () {
			var frame=$(event.target).closest('.choose-frame');
			frame.find('.chosen').removeClass('chosen');
			$(event.target).closest('a').addClass('chosen');
			var key=frame.attr('name');
			var value=$(event.target).closest('a').attr('value');
			this.permit.set(key,value);

		},
		toggle:function () {
			var parent=$(event.target).closest('.unit-li');
			if(parent.hasClass('active'))
				parent.removeClass('active');
			else
				parent.addClass('active');
		},
		addSubmit:function () {
			if(!this.permit.get('user')){
				alert('请选择用户');
				return
			}
			if(!this.permit.get('unit')){
				alert('请选择单位');
				return
			}
			if(!this.permit.get('role')){
				alert('请选择角色');
				return
			}
			var self=this;
			this.permit.save().done(function () {
				self.permit=new Permit();
				self.render();
				var str='<span class="hint success-hint"><i class="icon-ok-sign"></i>添加成功 </span>';
				$('#add').before(str);
				setTimeout(function () {
					$('.hint').remove();
				},1000);
			})
			.fail(function () {
				self.render();
				var str='<span class="hint error-hint"><i class="icon-remove-sign"></i>添加失败 </span>';
				$('#add').before(str);
				setTimeout(function () {
					$('.hint').remove();
				},1000);
			})
		}
	})

	var TreeView=Backbone.View.extend({
		template:_.template($('#unit-temp').html()),
		render:function (unitList) {
			var stack=[];
			this.tree={children:[]};
			var self=this;
			unitList.each(function (u) {
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
			return this.template({trees:this.tree.children,parent:0});
		},
	})
	return PermitAddView;
})