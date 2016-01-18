define(['jquery','underscore','backbone','UserList','RoleList'],function ($,_,Backbone,UserList,RoleList) {
	var MainView=Backbone.View.extend({
		el:$('body'),
		events:{
			'click .sidebar-items li':'changeActive',
			'click .create-role-link':'changeRole'
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
	return MainView;
})