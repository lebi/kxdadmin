define(['collection'],function (MyCollection) {
	var HostList=MyCollection.extend({
		url:"/demo/monitor/hosts",
		initialize:function () {
			var self=this;
			this.fetch()
			.done(function (collection) {
				self.list=collection.result;
				self.trigger('reset');
			})
		}
	})
	return HostList;
})