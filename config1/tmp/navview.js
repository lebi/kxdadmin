define(['jquery','underscore','cookie','backbone','model','tool','wrapper'],function ($,_,cookie,Backbone,model,tool,wrapper) {
	var RightNavView=Backbone.View.extend({
		events:{
			'click .version-item':'chooseVersion',
			'click .file-edit':'editRevision',
			'click .new-cache':'chooseEdit'
		},
		initialize:function (path) {
			this.path=path;
			this.logList=new model.LogEntryCollection();
			this.logList.on('update',this.render,this);
			this.logList.fetch({data:{path:this.path}});
		},
		render:function () {
			var temp=_.template($('#right-nav-temp').html());
			$('.right-nav').append(temp({logList:this.logList}));
			this.$el=$('.version-list');
			this.delegateEvents();
			var self=this;
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

	var ComponentNavView=RightNavView.extend({
		renderVersion:function (){
			var id=$('.version-list>.active').attr('revision');
			var revision=this.logList.get(id)
			if(BodyView.wrapper)
				BodyView.wrapper.remove();
			BodyView.wrapper=new wrapper.ComponentView(revision,this.path);
		},
		edit:function (){
			if(BodyView.wrapper)
				BodyView.wrapper.remove();
			BodyView.wrapper=new wrapper.ComponentChangeView(this.path);
		},
		hasCache:function () {
			DBManager.manager.getAmbiguous(this.path+'.*',function (result) {
				console.log(result);
				if(result){
					this.chooseEdit();
				}else{
					$('.new-cache').addClass('hide');
					$($('.version-item').get(0)).addClass('active');
					this.renderVersion();
				}
			},this);
		},
	})

	var FileNavView=RightNavView.extend({
		renderVersion:function () {
			var id=$('.version-list>.active').attr('revision');
			var revision=this.logList.get(id)
			if(BodyView.wrapper)
				BodyView.wrapper.remove();
			BodyView.wrapper=new wrapper.ReaderView(revision,this.path);
		},
		edit:function () {
			if(BodyView.wrapper)
				BodyView.wrapper.remove();
			BodyView.wrapper=new wrapper.EditorView(this.path);
		},
		editRevision:function () {
			var revision=$(event.target).closest('.version-item').attr('revision');
			var self=this;
			$.getJSON('/svnserviceAPI/file',{path:this.path,v:revision},function (data) {
				DBManager.manager.getOne(data.result.path,function (result) {
					data.result.date=new Date().getTime();
					if(result){
						if(!confirm('存在未提交，是否覆盖？'))
							return;
						DBManager.manager.update(data.result,self.chooseEdit,self);
					}else
						DBManager.manager.add(data.result,self.chooseEdit,self);
					$('.new-cache.hide').removeClass('hide');
				});
			})
		},
		hasCache:function () {
			DBManager.manager.getOne(this.path,function (result) {
				if(!result){
					$('.new-cache').addClass('hide');
					$($('.version-item').get(0)).addClass('active');
					this.renderVersion();
				}else{
					this.chooseEdit();
				}
			},this)
		}
	})

	return{
		FileNavView:FileNavView,
		ComponentNavView:ComponentNavView
	}
}
