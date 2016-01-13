

var User=MyModel.extend({
	urlRoot:'/webserviceAPI/admin/user',
	defaults:{
		'username':null,
		'id':null,
		'password':null
	}
})

var UserList=MyCollection.extend({
	model:User,
	url:'/webserviceAPI/admin/user'
})

var Role=MyModel.extend({
	urlRoot:'/webserviceAPI/admin/role',
	defaults:{
		'name':null,
		'id':null,
		'permits':null
	}
})

var RoleList=MyCollection.extend({
	model:Role,
	url:'/webserviceAPI/admin/role'
})


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

		this.useradmin=new UserAdminView(this.userList,this.roleList);
		this.roleadmin=new RoleAdminView(this.roleList,this.resourceList);
		this.useradd=new UserAddView(this.userList,this.roleList);
		var li=$('.sidebar-items li').get(0);
		if(li)
			$(li).addClass('active');
		this.showActive();
	},
	showActive:function () {
		$('.tool').hide();
		var target=$('.sidebar-items .active').attr('target');
		$('#'+target).show();
	},
	changeActive:function (event) {
		$('.sidebar-items .active').removeClass('active');
		var target=event.target;
		$(target).addClass('active');
		this.showActive();
	},
	changeRole:function () {
		var li=$('.sidebar-items li[target=role-admin]');
		if(li){
			$('.sidebar-items .active').removeClass('active');
			$(li).addClass('active');
		}
		this.showActive();
		this.roleadmin.addRole();
	}
})

/*
* The view to show users, edit user's password and roles;
* @Attr: userList,roleList,pwdindex,roleindex;
*/

var UserAdminView=Backbone.View.extend({
	el:$('#user-admin'),
	events:{
		'click .edit-user':'showEdit',
		'click #edit-submit':'editSubmit',
		'click .edit-role':'showEditRole',
		'click .cancel-submit':'hideSubmit',
		'click #role-submit':'roleSubmit',
		'click .delete-user':'deleteUser'
	},
	permissions:{
		'.edit-user-button':'/webservice/admin/user/U',
		'.delete-user-button':'/webservice/admin/user/D',
		'.edit-role':'/webservice/admin/user/U'
	},
	initialize:function (userList,roleList){
		this.userList=userList;
		this.roleList=roleList;
		//记录选择编辑的用户在List中的位置。方便提交。
		this.pwdindex=null;
		this.roleindex=null;

		this.userList.on('update',this.render,this);
		this.roleList.on('update',this.renderRole,this);
		
		this.userList.fetch()
		this.roleList.fetch();
	},
	render:function(){
		$('.user-admin-tbody').empty();
		var temp=_.template($('#user-admin-temp').html());
		$('.user-admin-tbody',this.$el).append(temp({userList:this.userList.models}));
		this.delegatePermissions()
	},
	renderRole:function () {
		$('.role-check-list',this.$el).empty();
		var temp=_.template($('#role-check-list').html());
		$('.role-check-list',this.$el).append(temp({roleList:this.roleList.models}));
	},
	showEdit:function (event) {
		var target=event.target;
		this.pwdindex=$(target).closest('tr').index();
		var model=this.userList.models[this.pwdindex];
		var username=model.get('username');
		$('.edit-user-form .username',this.$el).html(username);
		$('.edit-user-form input[type=password]',this.$el).val('');
		$('.edit-user-form',this.$el).slideDown('fast');
	},
	editSubmit:function (event) {
		var newpwd=$('.edit-user-form input[name=new-pwd]',this.$el).val();
		var confirmpwd=$('.edit-user-form input[name=confirm-pwd]',this.$el).val();
		if(newpwd!=confirmpwd){
			alert("确认密码不正确！");
			return;
		}
		if(newpwd==''){
			alert("密码不可为空！");
			return;	
		}
		this.userList.models[this.pwdindex].set('password',CryptoJS.MD5(newpwd).toString());
		this.userList.models[this.pwdindex].save();
		this.hideSubmit(event);
		this.userList.models[this.pwdindex].set('password',null);
	},
	showEditRole:function(event) {
		$('.checkbox input',this.$el).prop('checked',false);

		this.roleindex=$(event.target).closest('tr').index();
		var model=this.userList.models[this.roleindex];

		_.each(model.get('roleList'),function (role) {
			$('.checkbox input[roleid='+role.id+']',this.$el).prop('checked',true);
		})
		var username=model.get('username');

		$('.edit-role-form .username',this.$el).html(username);
		$('.edit-role-form',this.$el).slideDown('fast');	
	},
	hideSubmit:function(event){
		var dom=event.target;
		$(dom).closest('form').slideUp('fast');
	},
	roleSubmit:function (event) {
		var roleList=new Array();
		_.each($('.checkbox input:checked',this.$el),function (dom) {
			var name=$(dom).parent().text();
			var id=$(dom).attr('roleid');
			roleList.push({id:id,name:name});
		});
		this.userList.models[this.roleindex].set('roleList',roleList);
		this.userList.models[this.roleindex].save();
		this.userList.trigger('update');
		this.hideSubmit(event);
	},
	deleteUser:function () {
		var i=$(event.target).closest('tr').index();
		this.userList.models[i].destroy();
	}
})

/*
* The view to show roles list, edit role's permit and add new role;
* @Attr:roleList,resourceList,roleindex;
*/


var RoleAdminView=Backbone.View.extend({
	el:$('#role-admin'),
	events:{
		'click .module-name':'tableSlide',
		'click .cancel-submit':'hideSubmit',
		'click #permission-submit':'permissonSubmit',
		'click .edit-role':'editRole',
		'click #add-new-role':'addRole',
		'click .delete-role':'deleteRole'
	},
	permissions:{
		'#add-new-role':'/webservice/admin/role/C',
		'.delete-role-button':'/webservice/admin/role/D',
		'.edit-role-button':'/webservice/admin/role/U'
	},
	initialize:function (roleList,resourceList) {
		this.roleList=roleList
		this.resourceList=resourceList;
		this.roleindex=null;

		this.roleList.on('update',this.render,this);
		this.resourceList.on('update',this.renderResourceList,this);

		this.roleList.fetch();
		this.resourceList.fetch();
	},
	render:function () {
		$('.role-admin-tbody').empty();
		var temp=_.template($('#role-admin-temp').html());
		$('.role-admin-tbody').append(temp({roleList:this.roleList.models}));
		this.delegatePermissions()
	},
	renderResourceList:function () {
		var value={'kxdadmin':'监控','webservice':'权限管理','vcenterAPI':'虚拟机部署'}
		var map=new Array();
		_.map(this.resourceList.models,function (model) {
			var key=value[model.get('uri').split('/')[1]];
			if(map[key]==null)
				map[key]=new Array();
			map[key].push({name:model.get('name'),id:model.get('id'),action:model.get('action')});
		});
		var temp=_.template($('#module-list-temp').html());
		$('.module-list').append(temp({map:map}));
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
	hideSubmit:function  (event) {
		$('.role-admin-form').slideUp('fast');
	},
	addRole:function() {
		$('.module-list input[type=checkbox]').prop('checked',false);

		this.roleindex=-1;
		var html='<input class="form-control">'
		$('.role-admin-form .rolename',this.$el).html(html);
		$('.role-admin-form').slideDown('fast');
	},
	editRole:function () {
		$('.module-list input[type=checkbox]').prop('checked',false);

		this.roleindex=$(event.target).closest('tr').index();
		var role=this.roleList.models[this.roleindex];
		var html='<label class="control-label ">'+role.get('name')+'</label>';
		_.each(role.get('permits'),function (permit) {
			var dom=$('.module-list tr[resourceid='+permit.resourceid+']');
			var tmp=permit.permit;
			for(var i=3;i>=0;i--){
				if(tmp%2==1)
					$($('td input[type=checkbox]',dom).get(i)).prop('checked',true);
				tmp=tmp>>1;
			}
		})
		$('.role-admin-form .rolename',this.$el).html(html);
		$('.role-admin-form').slideDown('fast');
	},
	permissonSubmit:function () {
		var role=new Role();
		var rolename;
		if(this.roleindex==-1)
			rolename=$('.role-admin-form .rolename input').val();
		else{
			rolename=this.roleList.models[this.roleindex].get('username');
			role.set('id',this.roleList.models[this.roleindex].get('id'));
		}
		if(rolename==''){
			alert('角色名不能为空');
			return;
		}

		var permits=new Array();
		$('.module-list tbody tr').each(function () {
			var permit=0;
			var i=3;
			$('input[type=checkbox]',this).each(function () {
				if($(this).prop('checked'))
					permit+=1<<i;
				i--;
			})
			permits.push({resourceid:$(this).attr('resourceid'),permit:permit})
		})
		role.set('name',rolename);
		role.set('permits',permits);
		var self=this;
		role.save().done(function () {
			self.roleList.fetch();
			self.hideSubmit();
		});
	},
	deleteRole:function () {
		var i=$(event.target).closest('tr').index();
		this.roleList.models[i].destroy();
	}
})

/*
* The view to add new user;
* @Attr:roleList,userList;
*/

var UserAddView=Backbone.View.extend({
	el:$('#account-add'),
	events:{
		'click .add-reset':'resetInput',
		'click .add-submit':'submitAdd'
	},
	initialize:function (userList,roleList) {
		this.userList=userList;
		this.roleList=roleList;

		this.roleList.on('update',this.renderRole,this);
	},
	renderRole:function () {
		$('.role-check-list',this.$el).empty();
		var temp=_.template($('#role-check-list').html());
		$('.role-check-list',this.$el).append(temp({roleList:this.roleList.models}));
	},
	resetInput:function () {
		$('input',this.$el).val('');
		$('input[type=checkbox]',this.$el).prop('checked',false);
	},
	submitAdd:function () {
		var username=$('input[name=username]',this.$el).val();
		var newpwd=$('input[name=new-pwd]',this.$el).val();
		var confirm=$('input[name=confirm-pwd]',this.$el).val();
		if(newpwd!=confirm){
			alert("确认密码不正确！");
			return;
		}
		if(newpwd==''){
			alert("密码不可为空！");
			return;	
		}
		var roleList=new Array();
		$('input[type=checkbox]:checked',this.$el).each(function () {
			var rolename=$(this).attr('value');
			var roleid=$(this).attr('roleid');
			roleList.push({name:rolename,id:roleid});
		})
		var user=new User({username:username,password:CryptoJS.MD5(newpwd).toString(),roleList:roleList});
		var self=this;
		user.save().done(function () {
			self.userList.fetch();
			alert('添加成功');
			self.resetInput();
		});
	}
})
$(function () {
	var view=new WholeView();
})