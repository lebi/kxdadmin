define(['jquery','underscore','backbone','MainAssetView','AssetDetailView','UnitTreeView','AssetEditView','AssetAddView'],
	function ($,_,Backbone,MainAssetView,AssetDetailView,UnitTreeView,AssetEditView,AssetAddView) {
	var AssetRouter=Backbone.Router.extend({
		routes:{
			'':'info',
			'detail':'detail',
			'edit':'edit',
			'add':'add',
			'export':'export'
		},
		detail:function (id) {
			if(!AssetRouter.detail){
				AssetRouter.detail=new AssetDetailView();
			}
			AssetRouter.detail.changeModel(id);
		},
		info:function () {
			AssetRouter.asset.doFetch();
		},
		edit:function (id) {
			if(!AssetRouter.edit){
				AssetRouter.edit=new AssetEditView();
			}
			AssetRouter.edit.changeModel(id);
		},
		add:function () {
			if(!AssetRouter.add){
				AssetRouter.add=new AssetAddView();
			}
			AssetRouter.add.changeModel();
		},
		export:function () {
		}
	})
	AssetRouter.asset=new MainAssetView();
	AssetRouter.unit=new UnitTreeView();
	return AssetRouter;
})