define(['jquery','underscore','backbone','Unit','UnitDetailView','UnitAssetView','UnitEditView','UnitNavView'],
	function ($,_,Backbone,Unit,UnitDetailView,UnitAssetView,UnitEditView,UnitNavView) {
	var UnitRouter=Backbone.Router.extend({
		routes:{
			'asset':'asset',
			'edit':'edit',
			'add':'add',
			'detail':'detail'
		},
		asset:function () {
			if(!detailView){
				window.location.href="#";
				return;
			}

			$('.manage-tab>.active').removeClass('active');
			$('.manage-tab>a[manage=asset]').addClass('active');	
			
			active.now='asset';
			assetView.render();
		},
		edit:function (id) {
			if(!detailView){
				window.location.href="#";
				return;
			}

			$('.manage-tab>.active').removeClass('active');
			$('.manage-tab>a[manage=unit]').addClass('active');

			active.now='edit';
			editView.setDetail(detailView.unitDetail);
		},
		add:function (id) {
			if(!detailView){
				window.location.href="#";
				return;
			}

			$('.manage-tab>.active').removeClass('active');
			$('.manage-tab>a[manage=unit]').addClass('active');
			id=parseInt(id);
			active.now='edit';

			if(!id){
				editView.setDetail(new Unit({parent:0}));
				return;
			}
			editView.setDetail(new Unit({parent:id}));
		},
		//将detail和assetView，editView绑定，detail改变，相应的assetView和editView都会改变。
		detail:function  (id) {
			if(!detailView){
				if(!id){
					var uid=$.cookie('unitChoose');
					id=parseInt(uid);
				}
				detailView=new UnitDetailView(id,function (detail) {
					assetView=new UnitAssetView(detail,active);
					editView=new UnitEditView(detail,active,navView.unitList);
				});
			}
			detailView.createView(id);
		}
	})

	var navView=new UnitNavView();
	var active={now:'asset'};
	var detailView=null;
	var assetView;
	var editView;
	return UnitRouter;
})