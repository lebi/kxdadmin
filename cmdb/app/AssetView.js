define(['AssetTypeList','Asset','AssetList'],
	function (AssetTypeList,Asset,AssetList) {
	var AssetView=Backbone.View.extend({
		initialize:function (unitDetail) {
		},
		bindType:function () {
			var pid=$(event.target).val();
			if(pid>0)
				this.showColumn=this.typeList.get(pid).get('showColumn');
			else
				this.showColumn=null;
			this.search.model.key='name';
			this.search.model.type=pid;
			this.search.model.page=1;
			this.search.model.matcher='';
			this.search.model.extend=false;
			this.search.trigger('change');
		},
		bindValue:function(){
			this.search.model.matcher=$(event.target).val();
			this.search.trigger('change');
		},
		bindKey:function  (argument) {
			var extend=parseInt($(event.target).children('option:selected').attr('extend'));
			this.search.model.extend=extend?true:false;
			this.search.model.key=$(event.target).val();
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