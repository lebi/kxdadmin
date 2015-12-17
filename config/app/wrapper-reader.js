var FileDetail=MyModel.extend({
	url:'/svnserviceAPI/file',
	defaults:{
		path:null,
		revision:null,
		content:null,
		comment:null
	}
})

// el:$('.edit-board')
var ReaderView=WrapperView.extend({
	events:{
		'change .file-type select':'changeMode',
		'click .edit-file':'editFile',
		'click .copy-file':'copyFile',
		'click .diff-file':'diffFile',
		'click #search':'search',
		'keypress input[name=search]':'keypressSearch',
		'click #replace':'replace',
		'click #replace-all':'replaceAll',
		'click #search-all':'searchAll'
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
		this.fitFileType(this.path);

	},
	editFile:function () {
		BodyView.rightNav.editRevisionAPI(this.path,this.revision.get('revision'));
	},
	copyFile:function(){
		BodyView.rightNav.fileCopyAPI(this.path,this.revision.get('revision'));
	},
	diffFile:function(){
		BodyView.rightNav.fileDiffAPI(this.path,this.revision.get('revision'));
	},
})
