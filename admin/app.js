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
		PermitList:'model/PermitList',
		MainView:'view/MainView',
		UserAdminView:'view/UserAdminView',
		RoleAdminView:'view/RoleAdminView',
		PermitView:'view/PermitView',
		PermitAddView:'view/PermitAddView'
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

require(['jquery','underscore','backbone','bootstrap','MainView','RoleAdminView','UserAdminView','PermitView','PermitAddView'],
	function ($,_,Backbone,bootstrap,MainView,RoleAdminView,UserAdminView,PermitView,PermitAddView) {

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
	var view=new MainView();
	//记录现在显示的view
	var show={target:'user'};
	var useradmin=new UserAdminView(view.userList,show);
	var roleadmin=new RoleAdminView(view.roleList,show);
	var permitview=new PermitView(show);
	var permitaddview=new PermitAddView(show);

	var router=new AppRouer();
	Backbone.history.start();

})