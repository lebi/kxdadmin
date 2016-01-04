define(['jquery','underscore','backbone','WrapperView','FileDetail'],
	function ($,_,Backbone,WrapperView,FileDetail) {

	var ReaderView=WrapperView.extend({
		template:_.template($('#reader-temp').html()),
		events:{
			'change #reader-board .file-type select':'changeMode',
			'click #reader-board .edit-file':'editFile',
			'click #reader-board .copy-file':'copyFile',
			'click #reader-board .diff-file':'diffFile',
			'click #reader-board #search':'search',
			'keypress #reader-board input[name=search]':'keypressSearch',
			'click #reader-board #replace':'replace',
			'click #reader-board #replace-all':'replaceAll',
			'click #reader-board #search-all':'searchAll'
		},
		createView:function (revision,path) {
			this.revision=revision;
			this.path=path;
			this.detail=new FileDetail({path:this.path,revision:this.revision.get('revision'),comment:this.revision.get('message')});
			this.detail.on('change',this.render,this);
			this.detail.fetch({data:{path:this.path,v:this.revision.get('revision')}});
		},
		render:function () {
			// console.log('read');
			this.$el.empty();
			this.$el.append(this.template({detail:this.detail}));
			this.editor = ace.edit("reader")
		    this.editor.setTheme('ace/theme/vibrant_ink')
		    this.editor.setReadOnly(true);
		    this.editor.getSession().setMode("ace/mode/xml");
		    this.editor.setShowPrintMargin(false)
			this.fitFileType(this.path);

		},
		editFile:function () {
			this.fileRightNav.editRevisionAPI(this.path,this.revision.get('revision'));
		},
		copyFile:function(){
			this.fileRightNav.fileCopyAPI(this.path,this.revision.get('revision'));
		},
		diffFile:function(){
			this.fileRightNav.fileDiffAPI(this.path,this.revision.get('revision'));
		},
	})

	return ReaderView;
})