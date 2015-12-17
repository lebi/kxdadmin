//$el:$('.edit-board')
var EditorView=WrapperView.extend({
	events:{
		'click .commit':'commit',
		'change .file-type select':'changeMode',
		'click .save':'saveCache',
		'click #search':'search',
		'keypress input[name=search]':'keypressSearch',
		'click #replace':'replace',
		'click #replace-all':'replaceAll',
		'click #search-all':'searchAll',
		'click .cancel':'cancel'
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
	},
	cancel:function () {
		var self=this;
		DBManager.manager.delete(this.path,function () {
			if(BodyView.rightNav)
				BodyView.rightNav.remove();
			
			if(self.data.action=='add'){
				BodyView.body.fileList.removeUnique(self.path);
				window.location.href="#dir/"+self.path.parent();
				// BodyView.rightNav=new ComponentNavView(self.path.parent());
			}else{
				BodyView.rightNav=new FileNavView(self.path);
			}
		});
	}
})