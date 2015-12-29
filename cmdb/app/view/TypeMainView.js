/*
*	View of asset type list
*/

define(['jquery','underscore','backbone','AssetTypeList','OperationList','jqueryform'],
	function ($,_,Backbone,AssetTypeList,OperationList,jqueryform) {

	var TypeMainView=Backbone.View.extend({
		events:{
			'click #export':'export',
			'click #import':'import',
			'change #upload>input':'upload'
		},
		template:_.template($('#property-temp').html()),
		el:$('.content-wrapper'),
		initialize:function () {
			this.collection=new AssetTypeList();
			this.collection.on('read',this.render,this);
			var list=this.collection;
			this.collection.fetch().done(function () {
				list.trigger('read');
			});

			this.operations=new OperationList();
			this.operations.fetch();
		},
		render:function () {
			// console.log('render');
			// console.log(this.collection);
			this.$el.empty();
			this.$el.append(this.template({collection:this.collection}));
		},
		export:function () {
			window.open("/cmdbAPI/type/export");
		},
		import:function () {
			$('#upload input').click();
		},
		upload:function () {
			if(!$('#upload input').val())
				return;
			$('.hint',this.$el).html(" <i class='icon-spin icon-spinner'></i>正在导入");
			// $("#import").after("<span class='loading'> <i class='icon-spin icon-spinner'></i>正在导入</span>")
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
		}
	})
	return TypeMainView;
})