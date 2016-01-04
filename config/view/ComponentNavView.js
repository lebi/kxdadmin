define(['jquery','underscore','backbone','RightNavView'],
	function ($,_,Backbone,RightNavView) {

	var ComponentNavView=RightNavView.extend({
		events:{
			'click #comp-nav .version-item':'chooseVersion'
		},
		template:_.template($('#component-nav-temp').html()),
		setup:function (compView) {
			this.compView=compView;
		},
		renderVersion:function (){
			var id=$('.version-list>.active').attr('revision');
			var revision=this.logList.get(id)
			this.compView.createView(revision,this.path);
		},
		hasCache:function () {
			$($('.version-item').get(0)).addClass('active');
			this.renderVersion();
		}
	})

	return ComponentNavView;
})