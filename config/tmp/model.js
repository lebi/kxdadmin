define(['jquery','underscore','cookie','backbone','setup'],function ($,_,cookie,Backbone,setup) {
	var DirEntry=setup.MyModel.extend({
		defaults:{
			name:null,
			path:null,
			date:null,
			kind:null,
			children:null
		}
	})

	var DirEntryCollection=setup.MyCollection.extend({
		url:'/svnserviceAPI/list/files',
		model:DirEntry
	})

	var LogEntry=setup.MyModel.extend({
		defaults:{
			message:null,
			author:null,
			date:null,
			revision:null
		}
	})

	var LogEntryCollection=setup.MyCollection.extend({
		_byRevision:{},
		url:'/svnserviceAPI/list/log',
		model:LogEntry,
		set:function  (models,options) {
			this._byRevision={};
			MyCollection.prototype.set.call(this,models.result,options);
			var self=this;
			_.each(this.models,function (log) {
				self._byRevision[log.get('revision')]=log;
			})
		},
		get:function (id) {
	      	return this._byRevision[id];
		}
	})

	var FileDetail=setup.MyModel.extend({
		url:'/svnserviceAPI/file',
		defaults:{
			path:null,
			revision:null,
			content:null,
			comment:null
		}
	})

	var ComponentFileEntry=setup.MyModel.extend({
		defaults:{
			path:null,
			revision:null,
			name:null,
			time:null,
			author:null,
			comment:null
		}
	})

	var ComponentFileEntryCollection=setup.MyCollection.extend({
		model:ComponentFileEntry,
		url:'/svnserviceAPI/list/component'
	})
	return {
		DirEntry:DirEntry,
		ComponentFileEntryCollection:ComponentFileEntryCollection,
		ComponentFileEntry:ComponentFileEntry,
		FileDetail:FileDetail,
		LogEntryCollection:LogEntryCollection,
		LogEntry:LogEntry,
		DirEntryCollection:DirEntryCollection
	}
})

