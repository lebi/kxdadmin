var FileConflict=MyModel.extend({
	url:'/svnserviceAPI/file/diffconflict',
	defaults:{
		path:null,
		action:null,
		content:null,
		comment:null
	}
})


var ConflictEditView=WrapperView.extend({
	events:{
		'change .file-type select':'changeMode',
		'click #search':'search',
		'keypress input[name=search]':'keypressSearch',
		'click #replace':'replace',
		'click #replace-all':'replaceAll',
		'click #search-all':'searchAll',
		'click .resolve':'resolve'
	},
	template:_.template($('#conflict-editor-temp').html()),
	initialize:function(path){
		this.path=path;
		DBManager.manager.getOne(this.path,this.render,this)
	},
	render:function (data) {

		this.data=data;
		$('.page-wrapper').empty();
		var detail=new FileConflict({path:data.path,content:data.content,action:data.action,resolve:data.resolve});
		var self=this;
		detail.save().done(function(result){
			$('.page-wrapper').append(self.template({data:data,result:result.result}));
	    	self.editor = ace.edit("conflict")
	    	self.editor.setTheme('ace/theme/vibrant_ink')
	    	var XMLMode = require("ace/mode/xml").Mode;
	    	self.editor.session.setMode(new XMLMode());
	    	self.editor.setShowPrintMargin(false)
			self.$el=$('.edit-board');
			self.delegateEvents();
		})
	},
	/*
	*	@Usage: 	after user edit the conflict, set it resolved.
	*				save the data in indexDB, update data's date,content and resolve.
	*/
	resolve:function(){
		this.data.date=new Date().getTime();
		this.data.content=this.editor.session.getDocument().getValue();
		this.data.resolve=1;
		var doing="<span class='save-doing'><i class='icon-refresh'/> 正在保存</span>";
		var success="<span class='save-success'><i class='icon-ok-sign'/> 已保存</span>";
		var fail="<span class='save-fail'><i class='icon-warning-sign'/> 保存失败</span>";
		DBManager.manager.update(this.data,function () {
			$('.save-message').html(success);
			setTimeout(function () {
				$('.save-message').html('');
			},1000)
			if(BodyView.rightNav)
				BodyView.rightNav.remove();
			BodyView.rightNav=new ConflictNavView();
		});
		$('.save-message').html(doing);
	}
})