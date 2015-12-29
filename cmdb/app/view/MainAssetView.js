define(['jquery','underscore','backbone','jqueryform','AssetTypeList','Asset','AssetList','AssetView','ColumnMap'],
	function ($,_,Backbone,jqueryform,AssetTypeList,Asset,AssetList,AssetView,ColumnMap) {

	/*
	*	展示资产列表，提供资产搜索，导入导出功能。
	*/
	var MainAssetView=AssetView.extend({
		events:{
			//选择资产类型时，绑定数据
			'change #asset #type-select':'bindType',
			//根据关键字搜索时，绑定
			'change #asset .matcher':'bindValue',
			//选择搜索某个属性时，绑定属性
			'change #asset #key-select':'bindKey',
			//选择到某页
			'click .pagination a':'page',
			//选择删除资产
			'click .remove-asset':'remove',
			//导出资产
			'click #export':'export',
			//导入资产时选择文件
			'click #import':'import',
			//文件选择完成，文件上传并导入
			'change #upload>input':'upload',
			//修改资产视图选择发生改变，将数据绑定
			'change #column-show input':'showColumn',
			//保存资产视图更改
			'click #column-save':'columnSave'
		},
		el:$('.content'),
		template:_.template($('#asset-info-temp').html()),
		initialize:function () {
			this.typeList=new AssetTypeList();
			this.typeList.on('sync',this.render,this);
			
			this.assetList=new AssetList();
			this.assetList.url='/cmdbAPI/asset/listall'
			this.assetList.on('sync',this.render,this);

			this.search={};
			_.extend(this.search,Backbone.Events);
			this.search.model={key:'name',type:0,page:1,matcher:'',extend:false};
			this.search.on('change',this.doFetch,this);

			this.showColumn=null;
		},
		doFetch:function () {
			console.log('fetch')
			if(this.typeList.length==0)
				this.typeList.fetch();
			this.assetList.fetch({data:this.search.model});
		},
		/*
		*	@typeList:资产类型列表。
		*	@search:搜索的参数。选择的资产类型，页码，选择搜索的列，搜索关键字。
		*	@assetList:匹配到的资产列表。
		*	@showColumn:选择的资产类型要显示哪些列。
		*	@columnMap:资产类型某个属性的中文映射，便于显示。
		*	@columns:资产需要展示的基础属性。
		*	@defaults:当资产类型没有配置需要展示的列时，默认显示的列。
		*/
		render:function () {
			this.$el.empty()
			this.$el.append(this.template({
				typeList:this.typeList,
				search:this.search.model,
				assetList:this.assetList,
				showColumn:this.showColumn,
				columnMap:ColumnMap.map,
				columns:_.keys(ColumnMap.priority),
				defaults:_.keys(ColumnMap.defaults)
			}));
		},
		export:function () {
			window.open("/cmdbAPI/asset/export");
		},
		import:function () {
			$('#upload input').click();
		},
		upload:function () {
			if(!$('#upload input').val())
				return;
			$('.hint',this.$el).html(" <i class='icon-spin icon-spinner'></i>正在导入");
			$('#upload').ajaxSubmit({
				timeout : 60*1000,
				success:function () {
					$('.hint',this.$el).html(" <i class='icon-ok'></i>导入成功</span>");
					setTimeout(function () {
						$('.hint',this.$el).html(" 继续导入");
					},1000)
					$('#upload input').val('');
				},
				error:function (result) {
					$('.hint',this.$el).html(" <i class='icon-remove-sign'></i>导入失败");
					alert(result.responseJSON.errorMsg);
					setTimeout(function () {
						$('.hint',this.$el).html(" 重新选择文件");
					},1000)
					$('#upload input').val('');
				}
			})
		},
		/*
		*	@Usage: 当选择展示的列改变时触发。
		*			target:根据改变的扩展熟悉还是基础属性。
		*			this.showColumn[target]:显示的属性集合字符串，由逗号分割。
		*/
		showColumn:function () {
			var target=$(event.target).attr("target");
			var value=$(event.target).val();
			if($(event.target).prop('checked')){
				if(!this.showColumn)
					this.showColumn={typeId:this.search.model.type};

				if(!this.showColumn[target])
					this.showColumn[target]=value;
				else{
					var arr=this.showColumn[target].split(',');
					//p:这个属性的优先级，由ColumnMap.priority决定。
					//需要判断p是否存在（即是否是基础属性）。
					//根据优先级将p插入到列的集合中。
					var p=ColumnMap.priority[value];
					if(p){
						for(var i=0;i<=arr.length;i++){
							if(i==arr.length||!ColumnMap.priority[arr[i]]||p<ColumnMap.priority[arr[i]]){
								arr.splice(i,0,value);
								break;
							}
						}
						this.showColumn[target]=arr.toString();
					}else{
						this.showColumn[target]+=","+value;
					}
				}			
			}else{
				var arr=this.showColumn[target].split(",");
				var newarr=_.reduce(arr,function (memo,i) {
					if(i!=value)
						memo.push(i);
					return memo;
				},[])
				this.showColumn[target]=newarr.toString();
			}
		},
		/*
		*	@Usage: 当选择保存展示的列时触发。
		*/
		columnSave:function () {
			var self=this;
			if(this.showColumn){
				var show=new AssetTypeShow(this.showColumn);
				console.log(show);
				show.save().done(function () {
					$('#select-show-modal').modal('hide');
					$('.modal-backdrop').remove();
					self.showColumn=show.toJSON();
					self.typeList.fetch();
				});
			}
		}
	})
	return MainAssetView;
})