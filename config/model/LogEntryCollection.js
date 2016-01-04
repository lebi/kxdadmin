define(['jquery','underscore','backbone','collection','LogEntry'],function ($,_,Backbone,MyCollection,LogEntry) {

	/*	@tips: 		after set _byRevision, trigger update again ,
	*				in case invoke get() before _byRevision set.
	*/

	var LogEntryCollection=MyCollection.extend({
		url:'/svnserviceAPI/list/log',
		model:LogEntry,
		set:function  (models,options) {
			this._byRevision={};
			var self=this;
			MyCollection.prototype.set.call(this,models,options);
			this.each(function (log) {
				self._byRevision[log.get('revision')+'']=log;
			})
			this.trigger('myevent');
		},
		get:function (id) {
	      	return this._byRevision[id];
		},
		remove:function (id,options) {
			MyCollection.prototype.remove.call(this,id,options);
			delete this._byRevision[id];
		}
	})
	return LogEntryCollection;
})