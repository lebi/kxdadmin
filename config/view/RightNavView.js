define(['jquery','underscore','backbone','cookie','LogEntryCollection'],
	function ($,_,Backbone,cookie,LogEntryCollection) {

	/*	@params: 	logList:the logs of the folder or file.trigger myevent after set.
	*
	*	
	*	@discript: 	the view of right log list.
	*	@tips: 		if fetch log not found. this is new create file.
	*/
	var RightNavView=Backbone.View.extend({
		el:$('.right-nav'),
		initialize:function () {
		},
		createView:function (path,revision,bodyView) {
			if(bodyView)
				this.bodyView=bodyView;
			this.path=path;
			this.logList=new LogEntryCollection();
			this.logList.on('myevent',this.render,this);
			var self=this;
			if(!revision)
				revision=$.cookie('working-revision');
			this.logList.fetch({data:{path:this.path,v:revision}})
			.fail(function () {
				self.render();
			})
		},
		render:function () {
			this.$el.empty();
			this.$el.append(this.template({logList:this.logList}));
			this.hasCache();
		},
		chooseVersion:function () {
			var version=$(event.target);
			var li=version.closest('.version-list>li');
			if(li.hasClass('active'))return;
			if (!version.hasClass('setting')&&version.closest('.version-dropdown').length==0) {
				$('.version-list>.active').removeClass('active');
				li.addClass('active');
				this.renderVersion();
			};
		},
		chooseEdit:function () {
			$('.version-list>.active').removeClass('active');
			$('.new-cache').addClass('active');
			this.edit();
		},
		edit:function () {},
		renderVersion:function () {},
		hasCache:function () {}
	})
	return RightNavView;
})