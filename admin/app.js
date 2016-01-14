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
	var Resource=MyModel.extend({
		urlRoot:'/webserviceAPI/admin/resource',
		defaults:{
			'id':null,
			'name':null,
			'action':null,
			'uri':null
		}
	})

	var ResourceList=MyCollection.extend({
		model:Resource,
		url:'/webserviceAPI/admin/resource'
	})
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
			this.resourceList=new ResourceList();
			var li=$('.sidebar-items li').get(0);
			if(li)
				$(li).addClass('active');
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
			'click #user-admin .add-user':'addUser',
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
			console.log(this.userList.length);
			// if(this.userList.length==0)
				this.userList.fetch()
			// else 
				// this.render()
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
			var user=new User({id:this.user.id,username:this.user.username,password:core.MD5(this.user.password).toString()});
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
			'click #role-admin .delete-role':'deleteRole',
			'change #role-admin .role-admin-form input':'bindRole',
			'click #role-admin .op-remove':'removeOperation',
			'click #role-admin .op-add':'addOperation'
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
			var rid=$(event.target).closest('tr').attr('rid');
			var oid=$(event.target).closest('.badge').attr('oid');
			var roleOp=new RoleOperation({id:oid});
			var self=this;
			roleOp.destroy().done(function () {
				self.updateOpView(rid);
			})
		},
		addOperation:function () {
			var rid=$(event.target).closest('tr').attr('rid');
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
				self.roleList.trigger('update');
			})
		}
	})

	var PermitView=Backbone.View.extend({
		el:$('.tool-wrapper'),
		template:_.template($('#permit-admin-temp').html()),
		initialize:function (show) {
			this.show=show;
			this.permitList=new PermitList();
			this.unitList=new UnitList();
			this.roleList=new RoleList();

			this.permitList.on('update',this.render,this);
		},
		showView:function () {
			this.permitList.fetch();
		},
		render:function () {
			if(this.show.target!='permit') return;
			this.$el.empty();
			this.$el.append(this.template({permitList:this.permitList,unitList:this.unitList}));
		}
	})

	var AppRouer=Backbone.Router.extend({
		routes:{
			'user':'user',
			'role':'role',
			'permit':'permit'
		},
		user:function () {
			show.target='user';
			useradmin.showView();
		},
		role:function () {
			show.target='role';
			roleadmin.showView();
		},
		permit:function () {
			show.target='permit';
			permitview.showView();
		}
	})
	var view=new WholeView();
	//记录现在显示的view
	var show={target:'user'};
	var useradmin=new UserAdminView(view.userList,show);
	var roleadmin=new RoleAdminView(view.roleList,show);
	var permitview=new PermitView(show);
	var router=new AppRouer();
	Backbone.history.start();

})