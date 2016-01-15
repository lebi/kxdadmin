require.config({
	paths:{
		jquery:'../lib/jquery-1.11.3.min',
		underscore:'../lib/underscore-min',
		backbone:'../lib/backbone',
		cookie:'../lib/jquery.cookie',
		bootstrap:'../lib/bootstrap.min',
		model:'../js/base-model',
		collection:'../js/base-collection',
		core:'../lib/crypto/core',
		MD5:'../lib/crypto/md5',
		User:'model/User',
		UserList:'model/UserList',
		Role:'model/Role',
		RoleOperation:'model/RoleOperation',
		RoleList:'model/RoleList',
		OperationList:'model/OperationList',
		TypeList:'model/TypeList',
		UnitList:'model/UnitList',
		Permit:'model/Permit',
		PermitList:'model/PermitList'
	},
	shim : {  
    	bootstrap : {  
        	deps : ['jquery'],  
            exports :'bs'  
    	},
    	MD5 : {  
        	deps : ['core'],
            exports :'MD5'  
    	}
    }
})

require(['jquery','underscore','backbone','bootstrap','cookie','model','collection','User','UserList','Role','RoleList','core','MD5','OperationList','TypeList','UnitList','RoleOperation','Permit','PermitList'],
	function ($,_,Backbone,bootstrap,cookie,MyModel,MyCollection,User,UserList,Role,RoleList,core,MD5,OperationList,TypeList,UnitList,RoleOperation,Permit,PermitList) {
	var WholeView=Backbone.View.extend({
		el:$('body'),
		events:{
			'click .sidebar-items li':'changeActive',
			'click .create-role-link':'changeRole'
		},
		permissions:{
			'li[target=user-admin]':'/webservice/admin/user/R',
			'li[target=account-add]':'/webservice/admin/user/C',
			'li[target=role-admin]':'/webservice/admin/role/R',
			'.create-role-link':'/webservice/admin/role/C'
		},
		initialize:function () {
			$('.header').load('../top.html',function () {
				$('.right-component').addClass('active');
			})

			this.userList=new UserList();
			this.roleList=new RoleList();
			// var li=$('.sidebar-items li').get(0);
			// if(li)
			// 	$(li).addClass('active');
		},
		changeActive:function (event) {
			$('.sidebar-items .active').removeClass('active');
			var target=event.target;
			$(target).addClass('active');
		}
	})

	/*
	* The view to show users, edit user's password and roles;
	* @Attr: userList,roleList,pwdindex,roleindex;
	*/

	var UserAdminView=Backbone.View.extend({
		el:$('.tool-wrapper'),
		template:_.template($('#user-admin-temp').html()),
		events:{
			'click #user-admin .edit-user':'showEdit',
			'click #user-admin #edit-submit':'editSubmit',
			'click #user-admin .cancel-submit':'hideSubmit',
			'click #user-admin .delete-user':'deleteUser',
			'click #user-admin #add-user':'addUser',
			'change #user-admin input':'bind',

		},
		initialize:function (userList,show){
			this.userList=userList;
			this.show=show;
			//记录选择编辑的用户在List中的位置。方便提交。
			this.pwdindex=null;

			this.userList.on('update',this.render,this);
		},
		showView:function () {
			this.userList.fetch()
		},
		render:function(){
			if(this.show.target!='user') return;
			this.$el.empty();
			$(this.$el).append(this.template({userList:this.userList.models}));
		},
		showEdit:function (event) {
			$('.edit-user-form',this.$el).empty();
			var target=event.target;
			var uid=$(target).closest('tr').attr('uid');
			var model=this.userList.get(uid);
			this.user={id:model.get('id'),username:model.get('username')};

			var temp=_.template($('#edit-user-temp').html());
			$('.edit-user-form').append(temp({user:this.user}));
			$('.edit-user-form',this.$el).slideDown('fast');
		},
		addUser:function () {
			$('.edit-user-form',this.$el).empty();
			this.user={};
			var temp=_.template($('#edit-user-temp').html());
			$('.edit-user-form').append(temp({user:this.user}));
			$('.edit-user-form').slideDown('fast');
		},
		bind:function () {
			var value=$(event.target).val();
			var name=$(event.target).attr('name');
			this.user[name]=value;
		},
		editSubmit:function (event) {
			console.log(this.user);
			if(!(this.user.password&&this.user.username&&this.user.confirmpwd)){
				alert("输入不可为空！");
				return;	
			}
			if(this.user.password!=this.user.confirmpwd){
				alert("确认密码不正确！");
				return;
			}
			var user=new User({id:this.user.id,username:this.user.username,password:this.user.password});
			var self=this;
			user.save().done(function (result) {
				if(result.errorMsg==null){
					self.userList.add(user);
					self.userList.trigger('update')
				}
			});
			this.hideSubmit(event);
		},
		hideSubmit:function(event){
			var dom=event.target;
			$(dom).closest('form').slideUp('fast');
		},
		deleteUser:function () {
			var i=parseInt($(event.target).closest('tr').attr('uid'));
			this.userList.get(i).destroy();
		}
	})

	/*
	* The view to show roles list, edit role's permit and add new role;
	* @Attr:roleList,resourceList,roleindex;
	*/


	var RoleAdminView=Backbone.View.extend({
		el:$('.tool-wrapper'),
		events:{
			'click #role-admin .module-name':'tableSlide',
			'click #role-admin .cancel-submit':'hideSubmit',
			'click #role-admin #permission-submit':'roleSubmit',
			'click #role-admin .edit-role':'editRole',
			'click #role-admin #add-new-role':'addRole',
			'click #role-admin .edit-operation':'editOperation',
			'click #role-admin .delete-role':'deleteRole',
			'change #role-admin .role-admin-form input':'bindRole',
			'click #role-admin .op-remove':'removeOperation',
			'click #role-admin .op-add':'addOperation',
			'click #role-admin .op-slide-up':'opSlideUp'
		},
		permissions:{
			'#add-new-role':'/webservice/admin/role/C',
			'.delete-role-button':'/webservice/admin/role/D',
			'.edit-role-button':'/webservice/admin/role/U'
		},
		initialize:function (roleList,show) {
			this.roleList=roleList;
			this.typeList=new TypeList();
			this.typeList.fetch();

			this.show=show;
			this.roleindex=null;

			this.typeList.on('update',this.render,this);
			this.roleList.on('update',this.render,this);
		},
		showView:function () {
			this.roleList.fetch();
		},
		render:function () {
			if(this.show.target!='role') return;
			this.$el.empty();
			var temp=_.template($('#role-admin-temp').html());
			this.$el.append(temp({roleList:this.roleList,typeList:this.typeList}));
		},
		tableSlide:function (event) {
			var target=event.target;
			var table=$(target).parent().find('.checkbox');
			var icon=$(target).find('i');
			var display=table.css('display');
			if(display=='none'){
				table.slideDown('fast');
				icon.removeClass('icon-double-angle-down').addClass('icon-double-angle-up');
			}else{
				table.slideUp('fast');
				icon.removeClass('icon-double-angle-up').addClass('icon-double-angle-down');
			}
		},
		bindRole:function () {
			var name=$(event.target).attr('name');
			this.editrole.set(name,$(event.target).val());
		},
		hideSubmit:function  (event) {
			$('.role-admin-form').slideUp('fast');
		},
		addRole:function() {
			this.editrole=new Role();
			$('.role-admin-form input',this.$el).val('');
			$('.role-admin-form').slideDown('fast');
		},
		editRole:function () {
			$('.module-list input[type=checkbox]').prop('checked',false);

			var index=$(event.target).closest('tr').attr('rid');
			this.editrole=this.roleList.get(index);
			$('.role-admin-form input[name=name]',this.$el).val(this.editrole.get('name'));
			$('.role-admin-form input[name=code]',this.$el).val(this.editrole.get('code'));
			$('.role-admin-form').slideDown('fast');
		},
		roleSubmit:function () {
			if(!(this.editrole.get('name')&&this.editrole.get('code'))){
				alert('输入不能为空');
				return;
			}
			var self=this;
			this.editrole.save().done(function (result){
				var role=self.editrole.clone();
				if(result.errorMsg==null){
					self.roleList.add(role);
					self.roleList.trigger('update');
				}
					
			});
			$('.role-admin-form').slideUp('fast');
		},
		deleteRole:function () {
			var i=$(event.target).closest('tr').attr('rid');
			this.roleList.get(i).destroy();
		},
		removeOperation:function () {
			var rid=$('#operation-view').attr('rid');
			var oid=$(event.target).closest('.badge').attr('oid');
			var roleOp=new RoleOperation({id:oid});
			var self=this;
			roleOp.destroy().done(function () {
				self.updateOpView(rid);
			})
		},
		addOperation:function () {
			var rid=$('#operation-view').attr('rid');
			var operation=$(event.target).closest('.badge').attr('operation');
			var roleOp=new RoleOperation({role:rid,operation:operation});
			var self=this;
			roleOp.save().done(function () {
				self.updateOpView(rid);
			})
		},
		updateOpView:function (rid) {
			var self=this;
			var role=this.roleList.get(rid);
			role.fetch().done(function () {
				self.roleList.add(role);
				var temp=_.template($('#operation-temp').html());
				$('#operation-list').html(temp({typeList:self.typeList,role:role}));
			})
		},
		editOperation:function () {
			var rid=$(event.target).closest('tr').attr('rid');
			var temp=_.template($('#operation-temp').html());
			$('#operation-list').html(temp({typeList:this.typeList,role:this.roleList.get(rid)}));
			$('#operation-list').slideDown('fast');
		},
		opSlideUp:function () {
			console.log(event.target)
			$('#operation-list').slideUp('fast');
		}
	})

	var PermitView=Backbone.View.extend({
		events:{
			'click #permit-admin .delete-permit':'delete',
			'change #permit-admin input':'search'
		},
		el:$('.tool-wrapper'),
		template:_.template($('#permit-admin-temp').html()),
		initialize:function (show) {
			this.show=show;
			this.permitList=new PermitList();
			this.unitList=new UnitList();
			this.roleList=new RoleList();

			this.permitList.on('update',this.render,this);
			this.unitList.on('update',this.render,this);

			this.unitList.fetch();
			this.search={username:'',rolename:'',unitname:''};
		},
		showView:function () {
			this.permitList.fetch();
			this.roleList.fetch();
		},
		render:function () {
			if(this.show.target!='permit') return;
			if(this.unitList.length>0){
				var self=this;
				this.permitList.each(function (permit) {
					permit.set('unitname',self.unitList.get(permit.get('unit')).get('name'));
				})
			}
			var search=this.search;
			var list=this.permitList.reduce(function (memo,p) {
				var reg=new RegExp('.*'+search.username+'.*');
				if(!reg.test(p.get('username')))
					return memo;

				reg=new RegExp('.*'+search.rolename+'.*');
				if(!reg.test(p.get('rolename')))
					return memo;

				reg=new RegExp('.*'+search.unitname+'.*');
				if(!reg.test(p.get('unitname')))
					return memo;
				memo.add(p)
				return memo
			},new Backbone.Collection())
			this.$el.html(this.template({permitList:list,search:this.search}));
		},
		delete:function () {
			var id=$(event.target).closest('tr').attr('pid');
			this.permitList.get(id).destroy();
		},
		search:function () {
			var name=$(event.target).attr('name');
			this.search[name]=$(event.target).val();
			this.render();
		}
	})

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
				unitStr:unitTree.render(this.unitList),
				roleList:this.roleList
			}));
		},
		choose:function () {
			var frame=$(event.target).closest('.choose-frame');
			frame.find('.chosen').removeClass('chosen');
			$(event.target).closest('a').addClass('chosen');
			var key=frame.attr('name');
			var value=$(event.target).closest('a').attr('value');
			console.log(this.permit)
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

	var AppRouer=Backbone.Router.extend({
		routes:{
			'':'defalut',
			'user':'user',
			'role':'role',
			'permit':'permit',
			'permitadd':'permitadd'
		},
		defalut:function () {
			var li=$('.sidebar-items li').get(0);
			$(li).addClass('active');
			show.target='user';
			useradmin.showView();
		},
		user:function () {
			var li=$('.sidebar-items li').get(0);
			$(li).addClass('active');

			show.target='user';
			useradmin.showView();
		},
		role:function () {
			var li=$('.sidebar-items li').get(1);
			$(li).addClass('active');
			show.target='role';
			roleadmin.showView();
		},
		permit:function () {
			var li=$('.sidebar-items li').get(2);
			$(li).addClass('active');
			show.target='permit';
			permitview.showView();
		},
		permitadd:function () {
			var li=$('.sidebar-items li').get(2);
			$(li).addClass('active');
			show.target='permitadd';
			permitaddview.showView();
		}
	})
	var view=new WholeView();
	//记录现在显示的view
	var show={target:'user'};
	var useradmin=new UserAdminView(view.userList,show);
	var roleadmin=new RoleAdminView(view.roleList,show);
	var permitview=new PermitView(show);
	var permitaddview=new PermitAddView(show);
	var unitTree=new TreeView();


	var router=new AppRouer();
	Backbone.history.start();

})