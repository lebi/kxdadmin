var LogEntry=MyModel.extend({
	defaults:{
		message:null,
		author:null,
		date:null,
		revision:null
	}
})
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

/*	@params: 	logList:the logs of the folder or file.trigger myevent after set.
*
*	
*	@discript: 	the view of right log list.
*	@tips: 		if fetch log not found. this is new create file.
*/
var RightNavView=Backbone.View.extend({

	initialize:function (path,revision) {
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
		$('.right-nav').empty();
		$('.right-nav').append(this.template({logList:this.logList}));
		this.$el=$('.version-list');
		this.delegateEvents();
		this.hasCache();
	},
	chooseVersion:function () {
		var version=$(event.target);
		var li=version.closest('.version-list>li');
		if(li.hasClass('active'))return;
		if (!version.hasClass('setting')&&version.closest('.version-dropdown').length==0) {
			$('.version-list>.active').removeClass('active');
			li.addClass('active');
			if(BodyView.wrapper)
				BodyView.wrapper.remove();

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