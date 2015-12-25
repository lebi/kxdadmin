//kind: 0 means a directory,1 means file
var DirEntry=MyModel.extend({
	defaults:{
		name:null,
		path:null,
		date:null,
		kind:null,
		children:null
	}
})

var DirEntryCollection=MyCollection.extend({
	url:'/svnserviceAPI/list/files',
	model:DirEntry,
	set:function  (models,options) {
		this._byRevision={};
		var self=this;
		MyCollection.prototype.set.call(this,models,options);
		_.each(this.models,function (entry) {
			self._byRevision[entry.get('path')]=entry;
		})
		this.trigger('myevent');
	},
	get:function (id) {
      	return this._byRevision[id];
	},
	remove:function (id,options) {
		MyCollection.prototype.remove.call(this,id,options);
		delete this._byRevision[id];
	},
	comparator:'path'
})

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

var FileDetail=MyModel.extend({
	url:'/svnserviceAPI/file',
	defaults:{
		path:null,
		revision:null,
		content:null,
		comment:null
	}
})

var ComponentFileEntry=MyModel.extend({
	defaults:{
		path:null,
		revision:null,
		name:null,
		time:null,
		author:null,
		comment:null
	}
})

var ComponentFileEntryCollection=MyCollection.extend({
	model:ComponentFileEntry,
	url:'/svnserviceAPI/list/component'
})

var DiffEntry=MyModel.extend({
	url:'/svnserviceAPI/file/diff',
	defaults:{
		fileA:null,
		rA:null,
		fileB:null,
		rB:null,
		diff:null
	}
})

var ChangeList=MyModel.extend({
	url:'/svnserviceAPI/component',
	defaults:{
		list:null,
		comment:null
	}
})
/*
action:null
author: null
comment:null
content: null
date: null
kind: null
path: null

*/
var BodyView=Backbone.View.extend({
	el:$('body'),
	events:{
		'click #add-product':'addProduct',
		'click #add-commit':'addProductCommit',
		'click .dir>div':'toggle',
		'click .dir>.content':'confirm',
		'click .file>.content':'confirm',
		'keyup .search-file > input':'searchFile',
		'click .setting-dropdown li':'setting',
		'keyup #diff-modal .diff-input':'diffHint',
		'click .file-hint li':'diffChoose',
		'click #diff-commit':'diffCommit',
		'click #rename-commit':'renameCommit'
	},
	initialize:function (callback) {
		this.fileList=new DirEntryCollection();
		var self=this;
		this.fileList.fetch().done(function () {
			self.alterFileList(callback);
		});
	},
	/* 	@description: 	check exist local cache file.
				if exist new file, add to list.
				if exist delete file, remove from list.

	*/
	alterFileList:function (callback) {
		DBManager.manager.getAll(function (result) {
			for(var i in result){
				// var file=this.fileList.get(i);
				if(!this.fileList.get(i)){
					if(result[i].action!='delete')
						this.fileList.add({path:result[i].path,kind:result[i].kind,name:result[i].path.split('/').peek()})
				}else {
					if(result[i].action=='delete')
						this.fileList.remove(i);
				}
			}
			this.renderFileList();
			if(callback)
				callback();
		},this)
	},
	/* 	@description: render file list 
	*	@tips:need to change list to tree before render  */
	renderFileList:function () {
		$('#file-list').empty();
		var stack=new Array();
		var self=this;
		_.each(this.fileList.models,function (file) {
			while(stack.length!=0){
				if(file.get('path').startWith(stack.peek().get('path'))){
					stack.peek().get('children').push(file);
					break;
				}else stack.pop();
			}
			if(file.get('kind')==0){
				file.set('children',new Array());
				stack.push(file);
			}
		})
		var temp=_.template($('#dir-list-temp').html());
		$('#file-list').append(temp({dirs:this.fileList.at(0).get('children')}));
		$('#file-list').children('.dir-list').addClass('product-list');
	},
	addProduct:function () {
		$('#add-product-modal input[name=addpath]').val('');
		$('#add-product-modal input[type=radio][value=dir]').prop('checked',true);
		$('#add-product-modal').modal('show');
	},
	/* 	@description: commit new file or dir,add node to its position
	*	@tip: rerender the view is inconvenient to user  */
	addProductCommit:function () {
		var path=$('#add-product-modal input[name=addpath]').val();
		var type=$('#add-product-modal input[type=radio]:checked').val();

		var kind=type=='file'?1:0;
		if(this.addToList(path,kind)){
			DBManager.manager.addExist({path:path,kind:kind,date:new Date().getTime(),action:'add'},function () {
				$('#add-product-modal').modal('hide');
			},this);
		}

	},
	/*	@tips: 		add a node to left menu.
	*				check node name first,then check parent folder,
	*				then check if node exists,
	*
	*/
	addToList:function (path,kind) {
		var self=this;
		var arr=path.split('/');
		if(arr.peek()==''){
			alert('文件名不能为空');
			return false;
		}

		var it=$('#file-list')
		for(var i=0;i<arr.length-1;i++){
			var list=it.children('ul').children('li');
			var flag=true;
			list.each(function () {
				var name=$(this).children('.content').children('span').html();
				if(name==arr[i]){
					it=$(this);
					flag=false;
					return false;
				}
			});
			if(flag) {
				alert('上级目录不存在');
				return false;
			}
		}
		if(it.hasClass('file')){
			alert('路径不是目录');
			return false;
		}
		var list=it.children('ul').children('li');

		for(var i=0;i<list.length;i++){
			var name=$(list.get(i)).children('.content').children('span').html();
			if(name==arr.peek()){
				alert('文件已存在');
				return false;
			}
		}
		
		var file=new DirEntry({name:arr.peek(),path:path,kind:kind});
		this.fileList.add(new DirEntry({path:path,kind:kind,name:arr.peek()}))
		if(it.attr('id')=='file-list'){
			var temp=_.template($('#product-temp').html());
			it.children('ul').append(temp({dir:file}));
		}else{
			var temp=_.template($('#dir-list-temp').html());
			it.append(temp({dirs:[file]}));
		}
		return true;
	},
	toggle:function () {
		var target=$(event.target);
		if(target.hasClass('setting')||target.closest('.setting-dropdown').length>0)
			return;
		var product=$(event.target).closest('.dir');
		if(product.hasClass('active'))
			product.removeClass('active');
		else
			product.addClass('active');
	},
	confirm:function () {
		var target=$(event.target);
		if(target.hasClass('setting')||target.closest('.setting-dropdown').length>0)
			return;

		var file=target.closest('.content');

		var locate=$(file).attr('href');
		window.location.href=locate;

		$('.content.confirm').removeClass('confirm');
		$(file).addClass('confirm');
	},
	findPath:function (son) {
		var path="";
		while(son.length>0){
			path=$(son.children('span')).text()+'/'+path;
			son=son.closest('li').parent().closest('li').children('.content');
			// //console.log(path)
		}
		return path.substr(0,path.length-1);
	},
	searchFile:function () {
		$('.content',this.$el).closest('li').addClass('active');
		$('.content',this.$el).closest('li').css('display','list-item');
		var str=$('.search-file>input').val();
		if(str=='')return;
		var reg=eval('/(.*'+str+'.*)/');

		_.each($('#file-list>ul>li'),function (dir) {
				console.log(dir);
			down($(dir));
		})

		function down (dom) {
			var child=dom.children('ul').children('.file,.dir');
			var num=0;
			_.each(child,function (dir) {
				if(down($(dir)))
					num++;
			})
			if(num==0){
				if( !reg.test(dom.children('.content').children('span').text()) ){
					dom.css('display','none');
					return 0;
				}
			}
			return 1;
		}
	},
	setting:function () {
		var target=$(event.target).closest('li').attr('target');
		// //console.log(target);
		switch(target){
			case 'rename':
				this.rename();
				break;
			case 'delete':
				this.deleteFile();
				break;
			case 'addfile':
				this.addFile();
				break;
			case 'adddir':
				this.addDir();
				break;
			case 'diff':
				this.diff();
				break;
		}
	},
	deleteFile:function () {
		var file=$(event.target).closest('.content');
		var path=this.findPath(file);
		var model=this.fileList.get(path);
		var obj={path:path,action:'delete',kind:model.get('kind'),date:new Date().getTime()};

		this.deleteCache(obj,function () {
			this.fileList.remove(path);
			$(file).closest('.file').remove();
		},this)
	},
	deleteCache:function (file,callback,obj) {
		DBManager.manager.getOne(file.path,function (result) {
			if(!result) DBManager.manager.add(file);
			else if(result.action=='add')
				DBManager.manager.delete(file.path);
			else DBManager.manager.addExist(file);
			callback.call(obj);
		})
	},
	rename:function () {
		var file=$(event.target).closest('.content');
		var path=this.findPath(file);
		$('#rename-modal input').val(path);
		$('#rename-modal').attr('origin',path);
		$('#rename-modal').modal('show');
	},
	addFile:function () {
		var file=$(event.target).closest('.content');
		var path=this.findPath(file);
		$('#add-product-modal input[name=addpath]').val(path+'/');
		$('#add-product-modal input[type=radio][value=file]').prop('checked',true);
		$('#add-product-modal').modal('show');
	},
	addDir:function () {
		var file=$(event.target).closest('.content');
		var path=this.findPath(file);
		$('#add-product-modal input[name=addpath]').val(path+'/');
		$('#add-product-modal input[type=radio][value=dir]').prop('checked',true);
		$('#add-product-modal').modal('show');
	},
	diff:function () {
		$('#diff-modal input').val('');
		var file=$(event.target).closest('.content');
		var path=this.findPath(file);
		$('#diff-modal input[name=fileA]').val(path);
		$('#diff-modal input[name=revisionA]').val('HEAD');
		$('.file-hint').removeClass('active');
		$('#diff-modal').modal('show');
	},
	diffHint:function () {
		var input=$(event.target);
		if(input.val()==''){
			input.next().removeClass('active');
			return;
		}
		input.next().addClass('active');
		var self=this;
		var patharray=_.map($('.file>.content'),function (file) {
			var path=$(file).attr('href');
			return path.substr(6);
		})
		var reg=new RegExp('.*'+input.val()+'.*');
		var arr=new Array();
		for(var i=0;i<patharray.length;i++){
			if(reg.test(patharray[i]))
				arr.push(patharray[i]);
			if(arr.length>=10)
				break;
		}
		var html=$("<ul>");
		_.each(arr,function (str) {
			html.append('<li>'+str+'</li>')
		})
		input.next().html(html);
	},
	diffChoose:function () {
		var li=$(event.target);
		var name=li.text();
		li.closest('.file-hint').prev().val(name);
		li.closest('.file-hint').removeClass('active');
	},
	diffCommit:function () {
		var fileA=$('#diff-modal input[name=fileA]').val();
		var rA=$('#diff-modal input[name=revisionA]').val();
		var fileB=$('#diff-modal input[name=fileB]').val();
		var rB=$('#diff-modal input[name=revisionB]').val();
		var href='fileA='+fileA+'&rA='+rA+'&fileB='+fileB+'&rB='+rB;
		window.location.href='#diff/'+href;
		$('#diff-modal').modal('hide');
	},
	/*	@tips: 	If the file is changed in cache, read the value from cache,
	*			else read the value from SVN HEAD.
	*			If the origin file is a new file,delete cache from the indexdb,
	*			else add a delete action in indexdb,if action exists, then update.
	*/
	renameCommit:function () {
		var path=$('#rename-modal input').val();
		var origin=$('#rename-modal').attr('origin');
		this.fileList.each(function (f) {
			//console.log(f.get('path'));
		})
		if(this.fileList.get(path)){
			alert('文件已存在');
			return;
		}
		var it=this.findByPath(origin);
		var orifile={path:origin,action:'delete',date:new Date().getTime(),kind:1};
		var newfile={path:path,action:'add',date:new Date().getTime(),kind:1};
		var self=this;
		DBManager.manager.getOne(origin,function (result) {
			if(!result){
				DBManager.manager.add(orifile);
			} else if(result.action=='add')
				DBManager.manager.delete(orifile.path);
			else DBManager.manager.addExist(orifile);
			this.fileList.remove(origin);
			it.remove();

			if(!result||result.content==null){
				$.getJSON('/svnserviceAPI/file',{path:origin,v:0},function (data) {
					if(data.errorMsg)return;
					newfile.content=data.result.content;
					DBManager.manager.addExist(newfile);
					self.addToList(path,1);
				})
			}else {
				newfile.content=result.content;
				DBManager.manager.addExist(newfile);
				self.addToList(path,1);
			}
			$('#rename-modal').modal('hide');
		},this)
	},
	findByPath:function (path) {
		var arr=path.split('/');

		var it=$('#file-list')
		for(var i=0;i<arr.length;i++){
			var list=it.children('ul').children('li');
			list.each(function () {
				var name=$(this).children('.content').children('span').html();
				if(name==arr[i]){
					it=$(this);
					if(i<arr.length-1)
						it.addClass('active');
					return false;
				}
			});
		}
		return it;
	},
	activeByPath:function (path) {
		var it=this.findByPath(path);
		$('.content.confirm').removeClass('confirm');
		it.children('.content').addClass('confirm');
	}
})
BodyView.body=null;
BodyView.wrapper=null;
BodyView.rightNav=null;

/*	@params: 	logList:the logs of the folder or file.trigger myevent after set.
*
*	
*	@discript: 	the view of right log list.
*	@tips: 		if fetch log not found. this is new create file.
*/
var RightNavView=Backbone.View.extend({

	initialize:function (path) {
		this.path=path;
		this.logList=new LogEntryCollection();
		this.logList.on('myevent',this.render,this);
		var self=this;
		this.logList.fetch({data:{path:this.path}})
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

var ComponentNavView=RightNavView.extend({
	events:{
		'click .version-item':'chooseVersion',
		'click .new-cache':'chooseEdit'
	},
	template:_.template($('#component-nav-temp').html()),
	renderVersion:function (){
		var id=$('.version-list>.active').attr('revision');
			//console.log('render version');
		var revision=this.logList.get(id)
		if(BodyView.wrapper)
			BodyView.wrapper.remove();
		BodyView.wrapper=new ComponentView(revision,this.path);
	},
	edit:function (){
		if(BodyView.wrapper)
			BodyView.wrapper.remove();
		BodyView.wrapper=new ComponentChangeView(this.path);
	},
	hasCache:function () {
		// DBManager.manager.getAmbiguous(this.path+'.*',function (result) {
		// 	if(result){
		// 		this.chooseEdit();
		// 	}else{
		$('.new-cache').addClass('hide');
		$($('.version-item').get(0)).addClass('active');
		this.renderVersion();
		// 	}
		// },this);
	},
})

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
		this.editRevisionShow(this.path,revision);
	},
	/*	@tips: 		when user choose to edit file on readview,call this function.
	*/
	editRevisionShow:function (path,revision) {
		var self=this;
		$.getJSON('/svnserviceAPI/file',{path:this.path,v:revision},function (data) {
			if(!data.errorMsg)
				DBManager.manager.getOne(data.result.path,function (result) {
					var file={path:data.result.path,date:new Date().getTime(),kind:1,
						action:'update',content:data.result.content,
						comment:data.result.comment};
					if(result){
						if(!confirm('存在未提交，是否覆盖？'))
							return;
						DBManager.manager.update(file,self.chooseEdit,self);
					}else
						DBManager.manager.addExist(file,self.chooseEdit,self);
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
				if(result.action!='delete')
					this.chooseEdit();
			}
		},this)
	},
	fileDiff:function () {
		var revision=$(event.target).closest('.version-item').attr('revision');
		$('#diff-modal input').val('');
		$('#diff-modal input[name=fileA]').val(this.path);
		$('#diff-modal input[name=revisionA]').val(revision);
		$('#diff-modal input[name=fileB]').val(this.path);
		$('.file-hint').removeClass('active');
		$('#diff-modal').modal('show');
	},
	fileCopy:function () {
		var revision=$(event.target).closest('.version-item').attr('revision');
		var self=this;
		var back=self.path+'.bak';
		$.getJSON('/svnserviceAPI/file',{path:this.path,v:revision},function (data) {
			if(data.errorMsg)return;
			if(BodyView.body.addToList(back,1)){
				var file={path:back,date:new Date().getTime(),content:data.result.content,kind:1,action:'add'};
				DBManager.manager.addExist(file,function () {
					window.location.href='#file/'+back;
				});
			}
		})
	}
})

var WrapperView=Backbone.View.extend({
	changeMode:function () {
		var mode=$('.file-type select').val();
		switch (mode){
			case 'ini/properties':
	    		var coffeeMode = require("ace/mode/coffee").Mode;
				this.editor.session.setMode(new coffeeMode());
				break;
			case 'XML':
	    		var xmlMode = require("ace/mode/xml").Mode;
				this.editor.session.setMode(new xmlMode());
				break;
			case 'diff':
	    		var perlMode = require("ace/mode/perl").Mode;
				this.editor.session.setMode(new perlMode());
				break;
		}
	}
})

// el:$('.edit-board')
var ReaderView=WrapperView.extend({
	events:{
		'change .file-type select':'changeMode',
		'click .edit-file':'editFile'
	},
	initialize:function(revision,path){
		this.revision=revision;
		this.path=path;
		this.detail=new FileDetail({path:this.path,revision:this.revision.get('revision'),comment:this.revision.get('message')});
		this.detail.on('change',this.render,this);
		this.detail.fetch({data:{path:this.path,v:this.revision.get('revision')}});
	},
	render:function () {
		$('.page-wrapper').empty();
		var temp=_.template($('#reader-temp').html());
		$('.page-wrapper').append(temp({detail:this.detail}));
		this.editor = ace.edit("reader")
	    this.editor.setTheme('ace/theme/vibrant_ink')
	    this.editor.setReadOnly(true);
	    var XMLMode = require("ace/mode/xml").Mode;
	    this.editor.session.setMode(new XMLMode());
	    this.editor.setShowPrintMargin(false)
		this.$el=$('.edit-board');
		this.delegateEvents();
	},
	editFile:function () {
		BodyView.rightNav.editRevisionShow(this.path,this.revision.get('revision'));
	}
})

//$el:$('.edit-board')
var EditorView=WrapperView.extend({
	events:{
		'click .commit':'commit',
		'change .file-type select':'changeMode',
		'click .save':'saveCache'
	},
	initialize:function(path){
		this.path=path;
		DBManager.manager.getOne(this.path,this.render,this)
	},
	render:function (data) {
		this.data=data;
		$('.page-wrapper').empty();
		var temp=_.template($('#editor-temp').html());
		$('.page-wrapper').append(temp({data:data}));
    	this.editor = ace.edit("editor")
    	this.editor.setTheme('ace/theme/vibrant_ink')
    	var XMLMode = require("ace/mode/xml").Mode;
    	this.editor.session.setMode(new XMLMode());
    	this.editor.setShowPrintMargin(false)
		this.$el=$('.edit-board');
		this.delegateEvents();
	},
	commit:function () {
		this.data.content=this.editor.session.getDocument().getValue();
		this.data.comment=$('.comment-field textarea').val();	
		var detail=new FileDetail(this.data);
		detail.unset('action');
		detail.save().done(function (result) {
			DBManager.manager.delete(detail.get('path'));
			BodyView.rightNav.remove();
			BodyView.rightNav=new FileNavView(detail.get('path'));
		})
	},
	saveCache:function () {
		this.data.date=new Date().getTime();
		this.data.content=this.editor.session.getDocument().getValue();
		this.data.comment=$('.comment-field textarea').val();

		var doing="<span class='save-doing'><i class='icon-refresh'/> 正在保存</span>";
		var success="<span class='save-success'><i class='icon-ok-sign'/> 已保存</span>";
		var fail="<span class='save-fail'><i class='icon-warning-sign'/> 保存失败</span>";
		DBManager.manager.update(this.data,function () {
			$('.save-message').html(success);
			setTimeout(function () {
				$('.save-message').html('');
			},1000)
		});
		$('.save-message').html(doing);
	}
})

var DiffView=WrapperView.extend({
	events:{
		'change .file-type select':'changeMode'
	},
	initialize:function (fileA,rA,fileB,rB) {
		this.model=new DiffEntry({fileA:fileA,rA:rA,fileB:fileB,rB:rB});
		this.model.on('change',this.render,this);
		this.model.save().done(function (result) {
			if(result.errorMsg)
				alert(result.result.description);
		})
	},
	render:function () {
		//console.log(this.model);
		var temp=_.template($('#diff-temp').html());
		$('.page-wrapper').append(temp({detail:this.model}));
		this.editor = ace.edit("diff")
	    this.editor.setTheme('ace/theme/vibrant_ink')
	    this.editor.setReadOnly(true);
	    var XMLMode = require("ace/mode/perl").Mode;
	    this.editor.session.setMode(new XMLMode());
	    this.editor.setShowPrintMargin(false)
		this.$el=$('.diff-board');
		this.delegateEvents();
	}
})

//$el:$('.component-content')
var ComponentView=Backbone.View.extend({
	initialize:function(revision,path){
		//console.log('comp view')
		if(!revision)return;
		this.revision=revision;
		this.path=path;
		this.fileList=new ComponentFileEntryCollection();

		this.fileList.on('update',this.render,this);
		this.fileList.fetch({data:{v:revision.get('revision'),path:this.path}});
	},
	render:function () {
		var temp=_.template($('#component-temp').html());
		$('.page-wrapper').append(temp({fileList:this.fileList,path:this.path}));
		this.$el=$('#component-file-list');
		this.delegateEvents();
	}
})

var ComponentChangeView=Backbone.View.extend({
	events:{
		'click .commit':'commitChanges',
		'click .cancel':'deleteChange'
	},
	initialize:function (path) {
		this.path=path;
		this.fileList;
		DBManager.manager.getAmbiguous(path+'.*',function (result) {
			this.fileList=result;
			this.render();
		},this)
	},
	render:function () {
		var temp=_.template($('#component-change-temp').html());
		$('.page-wrapper').append(temp({fileList:this.fileList}));
		this.$el=$('#component-change-list');
		this.delegateEvents();
	},
	commitChanges:function () {
		var list=new Array();
		for(var file in this.fileList){
			list.push(this.fileList[file]);
		}
		var comment=$('textarea',this.$el).val();
		var changeList=new ChangeList({list:list,comment:comment});
		var self=this;
		changeList.save().done(function (result) {
			if(result.errorMsg==null){
				DBManager.manager.deleteAmbiguous(self.path+'.*',function () {
					window.location.reload();
				});
			}
		})
		.fail(function () {
			$('.save-message',this.$el).html("<span class='save-fail'><i class='icon-refresh'/> 提交失败</span>");
		})
		$('.save-message',this.$el).html("<span class='save-doing'><i class='icon-refresh'/> 正在提交</span>");
	},
	deleteChange:function () {
		var li=$(event.target).closest('li');
		var path=li.attr('path');
		DBManager.manager.delete(path,function () {
			li.remove();
			window.location.reload();
		});
	}
})



var AppRouter=Backbone.Router.extend({
	routes:{
		'file/*path':'showFileNav',
		'dir/*path':'showComponentNav',
		'diff/*path':'showDiffFile',
		'commit':'commitAll'
	},
	showFileNav:function (path) {
		BodyView.body.activeByPath(path);
		if(BodyView.rightNav){
			BodyView.rightNav.remove();
		}
		BodyView.rightNav=new FileNavView(path);
	},
	showComponentNav:function (path) {
		BodyView.body.activeByPath(path);
		if(BodyView.rightNav){
			BodyView.rightNav.remove();
		}
		BodyView.rightNav=new ComponentNavView(path);
	},
	showDiffFile:function (path) {
		var arr=path.split('&');
		var map={};
		for(var i=0;i<arr.length;i++){
			var kv=arr[i].split('=');
			map[kv[0]]=kv[1];
		}
		if(map['rA'].toLocaleUpperCase()=='HEAD')
			map['rA']=0;
		if(map['rB'].toLocaleUpperCase()=='HEAD')
			map['rB']=0;
		if(isNaN(map['rA'])||isNaN(map['rB'])){
			alert('版本输入错误');
			return;
		}
		if(BodyView.wrapper){
			BodyView.wrapper.remove();
		}
		BodyView.wrapper=new DiffView(map['fileA'],map['rA'],map['fileB'],map['rB']);
	},
	commitAll:function () {
		if(BodyView.wrapper){
			BodyView.wrapper.remove();
		}
			
		if(BodyView.rightNav)
			BodyView.rightNav.remove();
		// console.log(BodyView.wrapper);
		BodyView.wrapper=new ComponentChangeView('');
		// console.log(BodyView.wrapper);
	}
})