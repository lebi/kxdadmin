//***********************************************************************************************************************************
//																module view
//													one view stand for one part of the monitor list the user choose
//														user can edit the view to add or delete monitors
//															user can also delete the view
//
//
//************************************************************************************************************************************

define(['jquery','underscore','backbone','cookie','Module'],
	function ($,_,Backbone,cookie,Module) {
	var interval=1000*60*3;

	var ModuleView=Backbone.View.extend({
		// $el:$('.monitorpage'),
		events:{
			'click .editmodule':'editmodule',
			'click .delete':'deletemodule',
			'click .service-detail':'jumpToDetail'
		},
		permissions:{
			'.dropdown .delete':'/kxdadmin/module/D',
			'.dropdown .editmodule':'/kxdadmin/module/U',
			'.dropdown':'/kxdadmin/module/DU'
		}, 
		initialize:function(page){
			this._setpage(page);
			this.delegateEvents();
			this.module=new Module();

			var self=this;
			setInterval(function () {
				self.module.fetch()
				.done(function () {
					self.fresh();
				});
			},interval);
		},
		setModal:function (modalView) {
			this.modalView=modalView;
		},
		_setpage:function (el) {
			this.$el=el;
			this.delegateEvents();

			$('a[data-toggle=tooltip]',this.$el).each(function() {

				var id=$(this).attr('serviceid');
				var output=$(this).attr('output');
				$(this).attr('data-original-title',output);
				// var dom=this;
				// $.getJSON('/demo/monitor/status',{id:id}, function (result) {
				// 	$(dom).attr('data-original-title',result.result.status);
				// });
			})
			$('[data-toggle=tooltip]',this.$el).tooltip();
		},
		setmodule:function (module) {
			this.module=module;
			this.delegatePermissions();
		},
		editmodule:function () {  //将页面上的数据转化为Module对象  并态模态框渲染
			var page=this.$el;

			$('.typeselect select').attr('disabled','disabled');
			this.modalView.rendermodule(this.module);
			$("#savemodule").unbind();	//绑定模态框点击保存的事件
			var self=this;
			$("#savemodule").on('click',function() {  //模块保存更新
				var module=self.modalView.savemodule();
				module.set('id',self.module.get('id'));
				module.set('pid',self.module.get('pid'));
				module.set('pos',self.module.get('pos'));
				self.module=module;
				Backbone.sync("update",self.module,{
					success:function(module) {
						self.module=new Module(module);
						self.fresh();
					}
				});
			});
		},
		fresh:function () {
			var p=this.$el;
			var next=$(p).next();
			$(p).remove();
			var temp=_.template($("#module-temp").html());
			$(next).before(temp({module:this.module}));
			this._setpage($(next).prev());
		},
		deletemodule:function () {
			var msg=confirm("确定删除:"+this.module.get('note'));
			if(msg==true){
				Backbone.sync('delete',this.module);
				this.remove();
			}
		},
		jumpToDetail:function (dom) {
			var id=$(dom.target).closest('a').attr('serviceid');
			$.cookie("serviceid",id);
			window.location.href="detail.html";
		}
	})
	return ModuleView;
})