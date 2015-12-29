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
			if(!OperationRouter.detail)
				OperationRouter.detail=new OperationDetailView();
			OperationRouter.detail.refreshView(mainView.operationList.get(id),mainView);
		},
		edit:function (id) {
			if(!mainView){
				window.location.href="#";
				return;
			}
			if(!OperationRouter.edit)
				OperationRouter.edit=new OperationEditView();
			OperationRouter.edit.refreshView(mainView.operationList.get(id).clone(),mainView);
		},
		add:function (id) {
			if(!mainView){
				window.location.href="#";
				return;
			}
			if(!OperationRouter.edit)
				OperationRouter.edit=new OperationEditView();
			OperationRouter.edit.refreshView(new Operation({typeId:id}),mainView);
		}
	})
	var mainView=new OperationNavView()
	var detail;
	var edit;
	return OperationRouter;
})