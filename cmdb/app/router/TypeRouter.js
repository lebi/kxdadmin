define(['jquery','underscore','backbone','TypeEditView','TypeMainView'],
	function ($,_,Backbone,TypeEditView,TypeMainView) {

	var TypeRouter=Backbone.Router.extend({
		routes:{
			'':'view',
			'edit':'edit'
		},
		view:function () {
			if(assetView)
				assetView.render();
			else
				assetView=new TypeMainView();
		},
		edit:function (id) {
			if(!assetView){
				window.location.href="#";
				return;
			}
			if(!edit)
				edit=new TypeEditView(assetView.operations,assetView.collection);
			
			if(id)
				edit.createView(assetView.collection.get(id));
			else
				edit.createView();
		}
	})
	var assetView;
	var edit;
	return TypeRouter;
})