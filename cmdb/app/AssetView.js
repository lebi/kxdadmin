define(['AssetTypeList','Asset','AssetList'],
	function (AssetTypeList,Asset,AssetList) {
	var AssetView=Backbone.View.extend({
		initialize:function (unitDetail) {
		},
		bindType:function () {
			this.search.model.type=$(event.target).val();
			this.search.model.page=1;
			this.search.trigger('change');
		},
		bindValue:function () {
			var name=$(event.target).attr('name');
			this.search.model[name]=$(event.target).val();
			this.search.model.page=1;
			this.search.trigger('change');
		},
		doFetch:function () {
		},
		render:function () {
		},
		page:function () {
			var dom=$(event.target).closest('li');
			var name=$(dom).attr('name')
			if(!name){
				var p=$(dom.children('a')).html();
				this.search.model.page=parseInt(p);
			}else if(name=='prev'){
				if(this.search.model.page>1)
					this.search.model.page--;
				else return;
			}else{
				if(!dom.hasClass('disabled'))
					this.search.model.page++;
			}
			this.search.trigger('change');
		},
		remove:function () {
			var aid=$(event.target).attr('aid');
			if(confirm("确认删除资产？")){
				var self=this;
				this.assetList.get(aid).destroy().done(function () {
					self.doFetch()
				})
			}
		}
	})
	
	return AssetView;
})