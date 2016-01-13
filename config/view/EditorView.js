define(['jquery','cookie','underscore','backbone','WrapperView'],
	function ($,cookie,_,Backbone,WrapperView) {

	var EditorView=WrapperView.extend({
		template:_.template($('#editor-temp').html()),
		events:{
			'click #editor-board .commit':'commit',
			'change #editor-board .file-type select':'changeMode',
			'click #editor-board .save':'saveCache',
			'click #editor-board #search':'search',
			'keypress #editor-board input[name=search]':'keypressSearch',
			'click #editor-board #replace':'replace',
			'click #editor-board #replace-all':'replaceAll',
			'click #editor-board #search-all':'searchAll',
			'click #editor-board .cancel':'cancel'
		},
		createView:function (path) {
			this.path=path;
			DBManager.manager.getOne(this.path,this.render,this)
		},
		render:function (data) {
			console.log('edit');
			this.data=data;
			this.$el.empty();
			this.$el.append(this.template({data:data}));

	    	this.editor = ace.edit("editor")
	    	this.editor.setTheme('ace/theme/vibrant_ink')
	    	this.editor.session.setMode("ace/mode/xml");
	    	this.editor.setShowPrintMargin(false)
		},
		saveCache:function () {
			this.data.date=new Date().getTime();
			this.data.content=this.editor.session.getDocument().getValue();
			this.data.comment=$('.comment-field textarea').val();
			this.data.revision=$.cookie('working-revision');

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
		},
		cancel:function () {
			var self=this;
			DBManager.manager.delete(this.path,function () {
				if(self.data.action=='add'){
					self.fileRightNav.fileDeleteAPI(self.path);
					window.location.href="#dir"+self.path.parent();
				}else{
					self.fileRightNav.createView(self.path);
				}
			});
		}
	})
	return EditorView;
})