define(['jquery','underscore','backbone','collection','DirEntry'],function ($,_,Backbone,MyCollection,DirEntry) {
	var DirEntryCollection=MyCollection.extend({
		url:'/svnserviceAPI/list/files',
		model:DirEntry,
		set:function  (models,options) {
			this._byRevision={};
			var self=this;
			MyCollection.prototype.set.call(this,models,options);
			_.each(this.models,function (entry) {
				self._byRevision[entry.get('path')]=entry;
			})
			this.trigger('myevent');
		},
		get:function (id) {
	      	return this._byRevision[id];
		},
		remove:function (id,options) {
			MyCollection.prototype.remove.call(this,id,options);
			delete this._byRevision[id];
		},
		addUnique:function(obj){
			var model=new DirEntry(obj);
			if(this.get(model.get(this.comparator)))
				return;
			this.add(model);
			this.trigger('myevent');
		},
		removeUnique:function(id){
			this.remove(id);
			this.trigger('myevent');
		},
		comparator:'path'
	})
	return DirEntryCollection;
})