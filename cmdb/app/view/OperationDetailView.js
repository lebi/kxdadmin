define(['require','jquery','underscore','backbone','OperationRouter'],
	function (require,$,_,Backbone,OperationRouter) {

	var OperationDetailView=Backbone.View.extend({
		events:{
			'click #remove-op':'remove'
		},
		el:$('.operation-edit'),
		template:_.template($('#operation-detail-temp').html()),
		initialize:function () {
		},
		refreshView:function (operation,mainView) {
			this.mainView=mainView;

			this.operation=operation;
			this.render();
		},
		render:function () {
			this.$el.empty();
			this.$el.append(this.template({operation:this.operation,types:this.mainView.typeList}));
		},
		remove:function () {
			var self=this;
			this.operation.destroy({wait: true})
			.done(function () {
				self.mainView.operationList.trigger('sync');
				self.$el.empty();
				window.location.href="#";
			})
			.fail(function (data) {
				if(data.status==409)
					alert('删除操作失败，存在资产和该操作关联！');
			})
		}
	})
	return OperationDetailView
});