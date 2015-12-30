define(['jquery','underscore','backbone','OperationDetailView','OperationEditView','OperationNavView','Operation'],
	function ($,_,Backbone,OperationDetailView,OperationEditView,OperationNavView,Operation) {
	var OperationRouter=Backbone.Router.extend({
		routes:{
			'detail':'detail',
			'edit':'edit',
			'add':'add'
		},
		detail:function (id) {
			if(!mainView){
				window.location.href="#";
				return;
			}
			if(!detail)
				detail=new OperationDetailView();
			detail.refreshView(mainView.operationList.get(id),mainView);
		},
		edit:function (id) {
			if(!mainView){
				window.location.href="#";
				return;
			}
			if(!edit)
				edit=new OperationEditView();
			edit.refreshView(mainView.operationList.get(id).clone(),mainView);
		},
		add:function (id) {
			if(!mainView){
				window.location.href="#";
				return;
			}
			if(!edit)
				edit=new OperationEditView();
			edit.refreshView(new Operation({typeId:id}),mainView);
		}
	})
	var mainView=new OperationNavView()
	var detail;
	var edit;
	return OperationRouter;
})