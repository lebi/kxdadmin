define(['backbone','bodyview','navview','tool'],function (Backbone,odyview,navview) {
	var AppRouter=Backbone.Router.extend({
		routes:{
			'file/*path':'showFileNav',
			'component/*path':'showComponentNav'
		},
		showFileNav:function (path) {
			if(bodyview.BodyView.rightNav){
				bodyview.BodyView.rightNav.remove();
			}
			bodyview.BodyView.rightNav=new navview.FileNavView(path);
			console.log(11)
		},
		showComponentNav:function (path) {
			if(BodyView.rightNav){
				BodyView.rightNav.remove();
			}
			BodyView.rightNav=new navview.ComponentNavView(path);
		}
	})
	return {
		AppRouter:AppRouter
	}
})