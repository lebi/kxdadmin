// define(['backbone','model','collection','indexdb','nav'],function(Backbone,MyModel,MyCollection,DBManager,RightNavView){
	var FileNavView=RightNavView.extend({
		events:{
			'click .version-item':'chooseVersion',
			'click .file-edit':'editRevision',
			'click .new-cache':'chooseEdit',
			'click .file-diff':'fileDiff',
			'click .file-copy':'fileCopy'
		},
		template:_.template($('#file-nav-temp').html()),
		renderVersion:function () {
			var id=$('.version-list>.active').attr('revision');
			var revision=this.logList.get(id)
			if(BodyView.wrapper)
				BodyView.wrapper.remove();
			BodyView.wrapper=new ReaderView(revision,this.path);
		},
		edit:function () {
			if(BodyView.wrapper)
				BodyView.wrapper.remove();
			BodyView.wrapper=new EditorView(this.path);
		},
		editRevision:function () {
			var revision=$(event.target).closest('.version-item').attr('revision');
			this.editRevisionAPI(this.path,revision);
		},
		/*	@tips: 		when user choose to edit file on readview,call this function.
		*				if the file does not exsits in HEAD revision, the action is add.
		*				so it's necessary to check body's fileList to determine whether add or udpate.
		*
		*	@lock: 		when user choose to edit this file. The file will lock on the SVN.Commit or undo will unlock the file.
		*/
		editRevisionAPI:function (path,revision) {
			var self=this;
	// 		Backbone.ajax({
	// 			type:'POST',
	// 			data:{path:path},
	// 			url:'/svnserviceAPI/file/lock',
	// 			success:function(data){
	// else{
	// 					alert('file is locked');
	// 				}
	// 			}
	// 		})
			// if(data.result){
			$.getJSON('/svnserviceAPI/file',{path:path,v:revision},function (data) {
				if(!data.errorMsg)
					DBManager.getOne(path,function (result) {
						var file={path:path,date:new Date().getTime(),kind:1,
							action:'update',content:data.result.content,
							comment:data.result.comment};
						if(result){
							if(!confirm('存在未提交，是否覆盖？'))
								return;
							if(result.action=='add')
								file.action='add';
							DBManager.update(file,self.chooseEdit,self);
						}else{
							if(!BodyView.body.fileList.get(path)){
								file.action='add';
								BodyView.body.fileList.addUnique({path:path,kind:1,name:path.split('/').peek()});
							}
							DBManager.addExist(file,self.chooseEdit,self);
						}
						$('.new-cache.hide').removeClass('hide');
					});
			})
			// }
		},
		hasCache:function () {
			DBManager.getOne(this.path,function (result) {
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
				if(BodyView.body.addToList(back,1)){
					var file={path:back,date:new Date().getTime(),content:data.result.content,kind:1,action:'add'};
					DBManager.addExist(file,function () {
						window.location.href='#file/'+back;
					});
				}
			})
		}
	})
// 	return FileNavView;
// });