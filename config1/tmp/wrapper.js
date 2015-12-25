define(['jquery','underscore','cookie','backbone','model','navview','tool'],function ($,_,cookie,Backbone,model,navview) {

	// el:$('.edit-board')
	var ReaderView=Backbone.View.extend({
		events:{
			'change .file-type select':'changeMode'
		},
		initialize:function(revision,path){
			this.revision=revision;
			this.path=path;
			this.detail=new FileDetail({path:this.path,revision:this.revision.get('revision'),comment:this.revision.get('message')});
			this.detail.on('change',this.render,this);
			this.detail.fetch({data:{path:this.path,v:this.revision.get('revision')}});
		},
		render:function () {
			var temp=_.template($('#reader-temp').html());
			$('.page-wrapper').append(temp({detail:this.detail}));
			this.editor = ace.edit("reader")
		    this.editor.setTheme('ace/theme/vibrant_ink')
		    this.editor.setReadOnly(true);
		    var JavaScriptMode = require("ace/mode/xml").Mode;
		    this.editor.session.setMode(new JavaScriptMode());
		    this.editor.setShowPrintMargin(false)
			this.$el=$('.edit-board');
			this.delegateEvents();
		},
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
			}
		}
	})

	//$el:$('.edit-board')
	var EditorView=Backbone.View.extend({
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
			var temp=_.template($('#editor-temp').html());
			$('.page-wrapper').append(temp({data:data}));
	    	this.editor = ace.edit("editor")
	    	this.editor.setTheme('ace/theme/vibrant_ink')
	    	var JavaScriptMode = require("ace/mode/javascript").Mode;
	    	this.editor.session.setMode(new JavaScriptMode());
	    	this.editor.setShowPrintMargin(false)
			this.$el=$('.edit-board');
			this.delegateEvents();
		},
		commit:function () {
			this.data.content=this.editor.session.getDocument().getValue();
			this.data.comment=$('.comment-field textarea').val();	
			var detail=new FileDetail(this.data);
			detail.save().done(function (result) {
				DBManager.manager.delete(detail.get('path'));
				BodyView.rightNav.remove();
				BodyView.rightNav=new FileNavView(detail.get('path'));
			})
		},
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
			}
		},
		saveCache:function () {
			this.data.date=new Date().getTime();
			this.data.content=this.editor.session.getDocument().getValue();
			this.data.comment=$('.comment-field textarea').val();
			DBManager.manager.update(this.data);
		}
	})

	//$el:$('.component-content')
	var ComponentView=Backbone.View.extend({
		initialize:function(revision,path){
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
		}
	})

	return {
		ComponentChangeView:ComponentChangeView,
		ComponentView:ComponentView,
		EditorView:EditorView,
		ReaderView:ReaderView
	}
}