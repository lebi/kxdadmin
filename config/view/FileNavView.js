define(['jquery','underscore','backbone','RightNavView'],
	function ($,_,Backbone,RightNavView) {

	var FileNavView=RightNavView.extend({
		events:{
			'click #file-nav .version-item':'chooseVersion',
			'click #file-nav .file-edit':'editRevision',
			'click #file-nav .new-cache':'chooseEdit',
			'click #file-nav .file-diff':'fileDiff',
			'click #file-nav .file-copy':'fileCopy'
		},
		template:_.template($('#file-nav-temp').html()),
		//设置readView和editView的值，防止循环依赖
		setup:function (readView,editView) {
			this.readView=readView;
			this.editView=editView;
		},
		renderVersion:function () {
			var id=$('.version-list>.active').attr('revision');
			var revision=this.logList.get(id)
			this.readView.createView(revision,this.path);
		},
		edit:function () {
			this.editView.createView(this.path);
		},
		editRevision:function () {
			var revision=$(event.target).closest('.version-item').attr('revision');
			this.editRevisionAPI(this.path,revision);
		},
		/*	@tips: 		当用户选择编辑文件时。
		*				首先获取文件内容，判断该文件在本地是否已更改
		*				若存在：
		*					用户确认继续，需要保证文件action属性和原先一致，再将原先的更改覆盖。
		*				若不存在：
		*					判断该文件在fileList中是否已存在:
		*						若不存在，将文件添加到fileList，使action为add。
		*						若已存在，action为update。
		*					再添加文件。
		*/
		editRevisionAPI:function (path,revision) {
			var self=this;
			$.getJSON('/svnserviceAPI/file',{path:path,v:revision},function (data) {
				if(!data.errorMsg)
					DBManager.manager.getOne(path,function (result) {
						var file={path:path,date:new Date().getTime(),kind:1,
							action:'update',content:data.result.content,
							comment:data.result.comment};
						if(result){
							if(!confirm('存在未提交，是否覆盖？'))
								return;
							if(result.action=='add')
								file.action='add';
							DBManager.manager.update(file,self.chooseEdit,self);
						}else{
							if(!self.bodyView.fileList.get(path)){
								file.action='add';
								self.bodyView.fileList.addUnique({path:path,kind:1,name:path.split('/').peek()});
							}
							DBManager.manager.addExist(file,self.chooseEdit,self);
						}
						$('.new-cache.hide').removeClass('hide');
					});
			})
			// }
		},
		hasCache:function () {
			DBManager.manager.getOne(this.path,function (result) {
				if(!result){
					$('.new-cache').addClass('hide');
					$($('.version-item').get(0)).addClass('active');
					this.renderVersion();
				}else{
					if(result.action!='delete')
						this.chooseEdit();
				}
			},this)
		},
		fileDiff:function () {
			var revision=$(event.target).closest('.version-item').attr('revision');
			this.fileDiffAPI(this.path,revision);
		},
		fileDiffAPI:function(path,revision){
			$('#diff-modal input').val('');
			$('#diff-modal input[name=fileA]').val(path);
			$('#diff-modal input[name=revisionA]').val(revision);
			$('#diff-modal input[name=fileB]').val(path);
			$('.file-hint').removeClass('active');
			$('#diff-modal').modal('show');
		},
		fileCopy:function () {
			var revision=$(event.target).closest('.version-item').attr('revision');
			this.fileCopyAPI(this.path,revision);
		},
		fileCopyAPI:function(path,revision){
			var back=path+'.bak';
			$.getJSON('/svnserviceAPI/file',{path:path,v:revision},function (data) {
				if(self.bodyView.addToList(back,1)){
					var file={path:back,date:new Date().getTime(),content:data.result.content,kind:1,action:'add'};
					DBManager.manager.addExist(file,function () {
						window.location.href='#file/'+back;
					});
				}
			})
		},
		fileDeleteAPI:function(path){
			this.bodyView.fileList.removeUnique(path);
		}
	})
	return FileNavView;
})