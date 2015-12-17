define(['jquery','underscore','cookie','backbone','model','tool'],function ($,_,cookie,Backbone,model) {
	var BodyView=Backbone.View.extend({
		el:$('body'),
		events:{
			'click #add-product':'addProduct',
			'click #add-project-commit':'addProductCommit',
			'click .dir>.content':'toggle',
			'click .component>.content':'confirm',
			'click .file>.content':'confirm',
			'keyup .search-file > input':'searchFile',
			'click .setting-dropdown li':'setting'
		},
		initialize:function () {
			this.fileList=new model.DirEntryCollection();
			this.fileList.on('update',this.renderFileList,this);
			this.fileList.fetch();
		},
		renderFileList:function () {
			var stack=new Array();
			// console.log(this.fileList);
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
			var temp=_.template($('#product-list-temp').html());
			$('#file-list').append(temp({products:this.fileList.at(0).get('children')}));
		},
		addProduct:function () {
			$('#add-product-modal input').val('');
			$('#add-product-modal').modal('show');
		},
		addProductCommit:function () {
			var name=$('#add-product-modal input').val();
			$('#add-product-modal').modal('hide');
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
			$('.content.confirm').removeClass('confirm');
			$(file).addClass('confirm');

			var path=this.findPath(file);
		},
		findPath:function (son) {
			var path="";
			while(son.length>0){
				path=$(son.children('span')).text()+'/'+path;
				son=son.closest('li').parent().closest('li').children('.content');
				// console.log(path)
			}
			return path;
		},
		searchFile:function () {
			$('.content',this.$el).closest('li').addClass('active');
			$('.content',this.$el).closest('li').css('display','list-item');
			var str=$('.search-file>input').val();
			if(str=='')return;
			var reg=eval('/(.*'+str+'.*)/');
			_.each($('.dir',this.$el),function (comp) {
				var res=_.reduce($(comp).find('.file'),function (memo,file) {

					var name=$($(file).find('.content>span')).text();
					if(name.match(reg))
						return memo+1;
					else {
						$(file).css('display','none');
						return memo;
					}
				},0);
				if(res==0){
					$(comp).css('display','none');
				}
			})
		},
		setting:function () {
			var target=$(event.target).closest('li').attr('target');
			// console.log(target);
			switch(target){
				case 'rename':
					this.rename();
					break;
				case 'delete':
					this.deleteFile();
					break;
				case 'add':
					this.add();
					break;
				case 'diff':
					this.diff();
					break;
			}
		},
		deleteFile:function () {
			$(event.target).closest('.file').remove();
		},
		rename:function () {
			var text=$($(event.target).closest('.content').children('span')).text();
			$('#rename-modal input').val(text);
			$('#rename-modal').modal('show');
		},
		add:function () {
			this.addProduct();
		},
		diff:function () {

		}
	})
	BodyView.wrapper=null;
	BodyView.rightNav=null;

	return{
		BodyView:BodyView
	}
})