define(['backbone','body','navFile','navComponent','navConflict','wrapperDiff','commit'],
	function(Backbone,BodyView,FileNavView,ComponentNavView,ConflictNavView,DiffView,ComponentChangeView){
	var AppRouter=Backbone.Router.extend({
		routes:{
			'file/*path':'showFileNav',
			'dir/*path':'showComponentNav',
			'diff/*path':'showDiffFile',
			'commit':'commitAll',
			'conflict/*path':'showConflict'
		},
		showFileNav:function (path,v) {
			if(BodyView.body)
				BodyView.body.activeByPath(path);
			if(BodyView.rightNav){
				BodyView.rightNav.remove();
			}
			if(!v)
				v=$.cookie('working-revision');
			BodyView.rightNav=new FileNavView(path,v);
		},
		showComponentNav:function (path,v) {
			if(BodyView.body)
				BodyView.body.activeByPath(path);
			if(BodyView.rightNav){
				BodyView.rightNav.remove();
			}
			if(!v)
				v=$.cookie('working-revision');
			BodyView.rightNav=new ComponentNavView(path,v);
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
			BodyView.wrapper=new ComponentChangeView();
			// console.log(BodyView.wrapper);
			if(BodyView.rightNav){
				BodyView.rightNav.remove();
			}
			BodyView.rightNav=new ConflictNavView();
		},
		showConflict:function(path){
			if(BodyView.wrapper){
				BodyView.wrapper.remove();
			}
			BodyView.wrapper=new ConflictEditView(path);

			if(!BodyView.rightNav)
				BodyView.rightNav=new ConflictNavView();
		}
	})
	return AppRouter;
})