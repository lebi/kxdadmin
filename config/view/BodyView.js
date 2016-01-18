define(['jquery','underscore','backbone','cookie','DirEntryCollection'],
	function ($,_,Backbone,cookie,DirEntryCollection) {
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
			'click #rename-commit':'renameCommit',
			'click .update':'update',
			'keyup #diff-modal input[name=revisionA]':'showFileInfoA',
			'keyup #diff-modal input[name=revisionB]':'showFileInfoB'
		},
		initialize:function (callback) {
			this.fileList=new DirEntryCollection();
			var self=this;
			this.active={};
			this.fileList.on('myevent',this.renderFileList,this);
			this.revision=$.cookie('working-revision');
			if(!this.revision||isNaN(this.revision))
				this.revision=0;

			this.fileList.fetch({data:{v:this.revision}}).done(function () {
				self.alterFileList();
			});
			if(callback)
				callback();
		},
		/* 	@description: 	check exist local cache file.
					if exist new file, add to list.
					if exist delete file, remove from list.
		*/
		alterFileList:function () {
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
			},this)
		},
		/* 	@description: render file list 
		*	@tips:need to change list to tree before render  */
		renderFileList:function () {
			$('#file-list').empty();
			var forest=new Array();
			var stack=new Array();
			var self=this;
			this.fileList.each(function (file) {
				while(stack.length!=0){
					var str=stack.peek().get('path');
					if(!str.endWith("/"))
						str+="/";
					if(file.get('path').startWith(str)){
						stack.peek().get('children').push(file);
						break;
					}else stack.pop();
				}
				if(stack.length==0)
					forest.push(file);
				if(file.get('kind')==0){
					file.set('children',new Array());
					stack.push(file);
				}
			})
			// console.log(forest);
			this.revision=_.reduce(forest,function (memo,dir) {
				if(dir.get('revision')>memo)
					return dir.get('revision');
				else
					return memo;
			},0);
			// console.log(this.revision);
			$.cookie('working-revision',this.revision);
			var temp=_.template($('#dir-list-temp').html());
			$('#file-list').append(temp({dirs:forest,active:this.active,deep:0}));
			$('#file-list').children('.dir-list').addClass('product-list');

			$('.update').empty();
			$('.update').append('<span>当前版本:'+this.revision+' </span><span><i class="icon-refresh"></i> 更新</span>');
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
				DBManager.manager.addExist({path:path,kind:kind,date:new Date().getTime(),action:'add',revision:$.cookie('working-revision')},function () {
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
			if(this.fileList.get(path)){
				alert('文件已存在');
				return false;
			}
			var parent=arr[0];
			for(var i=1;i<arr.length-1;i++)
				parent+='/'+arr[i];

			if(!this.fileList.get(parent)){
				alert('上级目录不存在');
				return false;
			}else if(this.fileList.get(parent).get('kind')==1){
				if(it.hasClass('file')){
					alert('路径不是目录');
					return false;
				}
			}
			this.fileList.addUnique({path:path,name:arr.peek(),kind:kind});
			return true;
		},
		toggle:function () {
			var target=$(event.target);
			// console.log(target);
			if(!target.hasClass('dir-caret'))
				return;
			var product=$(event.target).closest('.dir');
			var path=this.findPath(product.children('.content'));
			// console.log(path);
			if(product.hasClass('active')){
				delete this.active[path];
				localStorage.removeItem(path);
				product.removeClass('active');
			}else{
				this.active[path]=1;
				localStorage.setItem(path,1);
				product.addClass('active');
			}
		},
		confirm:function () {
			var target=$(event.target);
			if(target.hasClass('dir-caret')||target.hasClass('setting')||target.closest('.setting-dropdown').length>0)
				return;

			var file=target.closest('.content');
			var locate=$(file).attr('href');
			window.location.href=locate;

		},
		findPath:function (son) {
			var path=son.children('span').text();
			son=son.closest('li').parent().closest('li').children('.content');
			while(son.length>0){
				var t=$(son.children('span')).text();
				if(t.endWith('/'))
					path=t+path;
				else
					path=t+'/'+path;
				son=son.closest('li').parent().closest('li').children('.content');
			}
			if(!path.startWith('/'))
				path='/'+path;
			return path;
		},
		searchFile:function () {
			$('.content',this.$el).closest('li').addClass('active');
			$('.content',this.$el).closest('li').css('display','list-item');
			var str=$('.search-file>input').val();
			if(str=='')return;
			var reg=eval('/(.*'+str+'.*)/');

			_.each($('#file-list>ul>li'),function (dir) {
					// console.log(dir);
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
			var file=$(event.target).closest('.content');
			var path=this.findPath(file);
			console.log(path);
			switch(target){
				case 'rename':
					this.checkPermission(file,path,'edit',this.rename,this);
					break;
				case 'delete':
					this.checkPermission(file,path,'delete',this.deleteFile,this);
					break;
				case 'addfile':
					this.checkPermission(file,path,'add',this.addFile,this);
					break;
				case 'adddir':
					this.checkPermission(file,path,'add',this.addDir,this);
					break;
				case 'diff':
					this.diff(file,path);
					break;
			}
		},
		checkPermission:function (file,path,action,callback,target) {
			var encodepath=encodeURIComponent(path);
			$.ajax({
				url:'/svnserviceAPI/permit?file='+encodepath+'&action='+action,
				success:function (result) {
					if(result.errorMsg==null)
						callback.call(target,file,path);
					else
						alert('没有权限！');
				}
			})
		},
		deleteFile:function (file,path) {
			var model=this.fileList.get(path);
			var obj={path:path,action:'delete',kind:model.get('kind'),date:new Date().getTime(),revision:$.cookie('working-revision')};

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
		rename:function (file,path) {
			$('#rename-modal input').val(path);
			$('#rename-modal').attr('origin',path);
			$('#rename-modal').modal('show');
		},
		addFile:function (file,path) {
			$('#add-product-modal input[name=addpath]').val(path+'/');
			$('#add-product-modal input[type=radio][value=file]').prop('checked',true);
			$('#add-product-modal').modal('show');
		},
		addDir:function (file,path) {
			$('#add-product-modal input[name=addpath]').val(path+'/');
			$('#add-product-modal input[type=radio][value=dir]').prop('checked',true);
			$('#add-product-modal').modal('show');
		},
		diff:function (file,path) {
			$('#diff-modal input').val('');
			$('#diff-modal input[name=fileA]').val(path);
			$('#diff-modal input[name=revisionA]').val('HEAD');
			$('#diff-modal input[name=revisionB]').val('HEAD');
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
		*			else read the value from SVN WORKING.
		*			If the origin file is a new file,delete cache from the indexdb,
		*			else add a delete action in indexdb,if action exists, then update.
		*/
		renameCommit:function () {
			var path=$('#rename-modal input').val();
			var origin=$('#rename-modal').attr('origin');
			if(this.fileList.get(path)){
				alert('文件已存在');
				return;
			}
			var it=this.findByPath(origin);
			var orifile={path:origin,action:'delete',date:new Date().getTime(),kind:1,revision:$.cookie('working-revision')};
			var newfile={path:path,action:'add',date:new Date().getTime(),kind:1,revision:$.cookie('working-revision')};
			var self=this;
			DBManager.manager.getOne(origin,function (result) {
				//原文件不在缓存中，将原文件删除
				if(!result)
					DBManager.manager.add(orifile);
				//原文件在缓存中，但是是新添加的文件，直接删除缓存文件（不需要告诉svn）
				else if(result.action=='add')
					DBManager.manager.delete(orifile.path);
				//原文件不是add，那么该文件存在缓存中，也存在文件列表中，将删除操作添加到缓存
				else 
					DBManager.manager.addExist(orifile);
				this.fileList.remove(origin);
				it.remove();
				$('#rename-modal').modal('hide');
				
				if(!result||result.content==null){
					//文件不在缓存中，需要从svn读取文件内容并存在缓存中
					$.getJSON('/svnserviceAPI/file',{path:origin,v:$.cookie('working-revision')},function (data) {
						if(data.errorMsg)return;
						newfile.content=data.result.content;
						DBManager.manager.addExist(newfile);
						self.addToList(path,1);
					})
				}else {
					//文件存在缓存中，直接将缓存内容读出
					newfile.content=result.content;
					DBManager.manager.addExist(newfile);
					self.addToList(path,1);
				}
				window.location.href="#file"+path;
			},this)
		},
		findByPath:function (path) {
			var it=$('#file-list')
			while(path){
				var list=it.children('ul').children('li');
				if(!list.length)
					return;
				console.log(path);
				list.each(function () {
					var name=$(this).children('.content').children('span').html();
					if(name=='/'){
						it=$(this);
						path=path.substr(1);
						return false;
					}
					if(path.startWith(name)&&(path[name.length]=='/'||path.length==name.length)){
						it=$(this);
						path=path.substr(name.length+1);
						return false;
					}
					//遍历到最后一个，没有找到
					if($(this).index()==list.length-1){
						path='';
						return false;
					}
				})
			}
			return it;
		},
		activeByPath:function (path) {
			var it=this.findByPath(path);
			if(it){
				$('.content.confirm').removeClass('confirm');
				it.children('.content').addClass('confirm');
			}
		},
		update:function(){
			$.cookie('working-revision',0);
			window.location.reload();
		}
	})
	return BodyView;
})