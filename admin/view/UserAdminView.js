define(['jquery','underscore','backbone','User'],function ($,_,Backbone,User) {

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

	return UserAdminView;
})