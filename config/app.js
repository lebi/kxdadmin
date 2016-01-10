require.config({
	paths:{
		jquery:'../lib/jquery-1.11.3.min',
		underscore:'../lib/underscore-min',
		backbone:'../lib/backbone',
		cookie:'../lib/jquery.cookie',
		bootstrap:'../lib/bootstrap.min',
		tool:'tool',
		model:'../js/base-model',
		collection:'../js/base-collection',
		theme:'ace/theme-vibrant_ink',
		ace:'ace-no/ace',
		IndexDB:'IndexDB',
		DirEntry:'model/DirEntry',
		DirEntryCollection:'model/DirEntryCollection',
		LogEntry:'model/LogEntry',
		LogEntryCollection:'model/LogEntryCollection',
		FileDetail:'model/FileDetail',
		ComponentFileEntry:'model/ComponentFileEntry',
		ComponentFileEntryCollection:'model/ComponentFileEntryCollection',
		DiffEntry:'model/DiffEntry',
		ChangeList:'model/ChangeList',
		ConflictList:'model/ConflictList',
		FileConflict:'model/FileConflict',
		BodyView:'view/BodyView',
		RightNavView:'view/RightNavView',
		ComponentNavView:'view/ComponentNavView',
		FileNavView:'view/FileNavView',
		WrapperView:'view/WrapperView',
		ReaderView:'view/ReaderView',
		EditorView:'view/EditorView',
		DiffView:'view/DiffView',
		ConflictEditView:'view/ConflictEditView',
		ComponentView:'view/ComponentView',
		ConflictNavView:'view/ConflictNavView',
		ComponentChangeView:'view/ComponentChangeView'
	},
	shim : {  
    	bootstrap : {  
        	deps : ['jquery'],  
            exports :'bs'  
    	}
    }
})

require(['jquery','underscore','backbone','bootstrap','cookie','tool','IndexDB','model','collection','ace-no/ace','ComponentFileEntryCollection','BodyView',
	'RightNavView','ComponentNavView','FileNavView','ReaderView','EditorView','DiffView','ConflictEditView','ComponentView','ConflictNavView','ComponentChangeView'],
	function ($,_,Backbone,bootstrap,cookie,tool,IndexDB,MyModel,MyCollection,ACE,ComponentFileEntryCollection,BodyView,
		RightNavView,ComponentNavView,FileNavView,ReaderView,EditorView,DiffView,ConflictEditView,ComponentView,ConflictNavView,ComponentChangeView) {

	DBManager.manager.init(function() {
		var app_router = new AppRouter();
		Backbone.history.start();
	});
	$(".header").load("../top.html",function () {
       	$(".config-component").addClass('active');
    });

	/*
	action:null
	author: null
	comment:null
	content: null
	date: null
	kind: null
	path: null
	*/

	var AppRouter=Backbone.Router.extend({
		routes:{
			'file/*path':'showFileNav',
			'dir/*path':'showComponentNav',
			'diff/*path':'showDiffFile',
			'commit':'commitAll',
			'conflict/*path':'showConflict'
		},
		showFileNav:function (path,v) {
			console.log(path);
			bodyView.activeByPath(path);
			if(!v)
				v=$.cookie('working-revision');
			fileRightNav.createView(path,v,bodyView);
		},
		showComponentNav:function (path,v) {
			bodyView.activeByPath(path);
			if(!v)
				v=$.cookie('working-revision');
			compRightNav.createView(path,v);
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
			diffView.createView(map['fileA'],map['rA'],map['fileB'],map['rB']);
		},
		commitAll:function () {
			changeView.createView(bodyView)
			conflictRightNav.createView();
		},
		showConflict:function(path){
			conflictEdit.createView(path);
			// conflictRightNav.createView();
		}
	})

	var bodyView=new BodyView()
	var fileRightNav=new FileNavView();
	var compRightNav=new ComponentNavView();
	var conflictRightNav=new ConflictNavView();

	var readView=new ReaderView({nav:fileRightNav});
	var editView=new EditorView({nav:fileRightNav});
	fileRightNav.setup(readView,editView);
	var diffView=new DiffView();
	var compView=new ComponentView();
	compRightNav.setup(compView);

	var changeView=new ComponentChangeView();
	var conflictEdit=new ConflictEditView({nav:conflictRightNav});
})