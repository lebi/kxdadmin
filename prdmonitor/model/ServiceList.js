define(['collection'],function (MyCollection) {
	var ServiceList=MyCollection.extend({
		url:"/demo/monitor/services",
		initialize:function () {
			var self=this;
			this.fetch()
			.done(function (collection) {
				self.list=collection.result;
				self.trigger('reset');
			})
		}
	})
	return ServiceList;
})