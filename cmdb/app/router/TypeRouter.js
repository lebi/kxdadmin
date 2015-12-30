define(['jquery','underscore','backbone','TypeEditView','TypeMainView'],
	function ($,_,Backbone,TypeEditView,TypeMainView) {

	var TypeRouter=Backbone.Router.extend({
		routes:{
			'':'view',
			'edit':'edit'
		},
		view:function () {
			if(typeView)
				typeView.render();
			else
				typeView=new TypeMainView();
		},
		edit:function (id) {
			if(!typeView){
				window.location.href="#";
				return;
			}
			if(!edit)
				edit=new TypeEditView(typeView.operations,typeView.collection);
			
			if(id)
				edit.createView(typeView.collection.get(id));
			else
				edit.createView();
		}
	})
	var typeView;
	var edit;
	return TypeRouter;
})