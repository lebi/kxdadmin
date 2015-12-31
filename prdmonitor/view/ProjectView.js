
	//***********************************************************************************************************************************
	//																project view
	//										this view's el is this body,user add module view and chart view through this view
	//													user can add new project and choose project he interested
	//															user can also delete the project
	//													
	//													
	//************************************************************************************************************************************
define(['jquery','underscore','backbone','cookie','bootstrap','Project','ProjectList','Module','ModuleList','ModuleView','ChartView'],
	function ($,_,Backbone,cookie,bootstrap,Project,ProjectList,Module,ModuleList,ModuleView,ChartView) {

	var interval=1000*60*3;
	var ProjectView=Backbone.View.extend({
		el:$('body'),
		events:{
			'click .projectlist .projectdelete':'deleteproject',
			'click .rightcolumn .pageadd':'addright',
			'click .leftcolumn .pageadd':'addleft',
			'click .projectlist .add':'addproject',
			'click .projectlist .project':'changeproject',
			'click #saveproject':'saveproject'
		},
		permissions:{
			'.pageadd':'/kxdadmin/module/C',
			'.add':'/kxdadmin/project/C',
			'.projectlist .projectdelete':'/kxdadmin/project/D'
		},
		initialize:function () {
			this.projectList=new ProjectList();
			var self=this;
			this.viewList=new Array();

			this.projectList.on('update',this.renderproject,this);
			this.projectList.fetch().done(function () {
				self.fetchandrenderlist();
			});
			var self=this;
			setInterval(function () {
				self.projectList.fetch();
			},interval);
		},
		setModal:function (modalView) {
			this.modalView=modalView;
		},
		renderproject:function () {
			this.pid=$.cookie('projectid');
			$('.projectlist .project').remove();
			var temp=_.template($("#project-temp").html());
			$('.projectflag','.projectlist').before(temp({projectlist:this.projectList.models}));
			if(this.pid==null||this.pid=='null'){
				$($('.projectlist').find('.project').get(0)).addClass('active');
			}
			else
				$('.projectlist').find('.project[projectid='+this.pid+']').addClass('active');
			this.delegatePermissions();
			// this.fetchandrenderlist();    //it's too slow;
		},
		changeproject:function (dom) {
			dom=dom.target;
			if($(dom).hasClass('projectdelete')) return;
			$('.projectlist .active').removeClass('active');
			$(dom).closest('.project').addClass('active');
			this.fetchandrenderlist();
		},
		fetchandrenderlist:function(){
			if($('.projectlist .active').length==0)
				$($('.project').get(0)).addClass('active');

			this.pid=$('.projectlist',this.$el).find('.active').attr('projectid');
			$.cookie('projectid',this.pid);
			var self=this;
			var moduleList=new ModuleList();
			moduleList.fetch({data:{pid:this.pid}})
			.done(function () {
				_.each(self.viewList,function (view) {
					view.remove();
				})
				this.viewList=new Array();
				_.each(moduleList.models,function(module){
					self.rendermodule(module);
				});
			});
		},
		rendermodule:function (module){ //将模型添加到相应位置
			var column=module.get('pos')+"column";   //left or right
			if(module.get('chart')=="no"){
				var temp=_.template($("#module-temp").html());
				$('.pagehide','.'+column).before(temp({module:module}));

				var moduleView=new ModuleView($('.pagehide','.'+column).prev() );
				moduleView.setModal(this.modalView);
				moduleView.setmodule(module);
				this.viewList.push(moduleView);
			}else{
				var temp=_.template($("#chart-temp").html());
				$('.pagehide','.'+column).before(temp({module:module}));

				var chartView=new ChartView($('.pagehide','.'+column).prev());
				console.log(chartView);
				chartView.setModal(this.modalView);
				chartView.setmodule(module);
				chartView.fetchAndRenderChart();
				this.viewList.push(chartView);
			}
		},
		addright:function () {
			if(this.pid==null) {
				alert("choose project");
				return;
			}
			this.pos="right";
			$('.typeselect select').attr('disabled',null);
			this.modalView.render();

			$("#savemodule").unbind();
			var self=this;
			$("#savemodule").on('click',function() {
				var module=self.modalView.savemodule();
				module.set('pos',self.pos);
				module.set('pid',self.pid);
				Backbone.sync('create',module,
					{
						success:function (result) {
							module=new Module(result)
							self.rendermodule(module);
						}
					}
				);

			});
		},
		addleft:function () {
			if(this.pid==null) {
				alert("choose project");
				return;
			}
			this.pos="left";
			$('.typeselect select').attr('disabled',null);
			this.modalView.render();

			$("#savemodule").unbind();
			var self=this;
			$("#savemodule").on('click',function() {
				var module=self.modalView.savemodule();
				module.set('pos',self.pos);      //还需要添加id  才能和post到服务器
				module.set('pid',self.pid);
				Backbone.sync('create',module,
					{
						success:function (result) {

							module=new Module(result)
							// console.log(module);
							self.rendermodule(module);
						}
					}
				);
			});
		},
		addproject:function(dom) {
			dom=dom.target;
			$('#addproject-modal input').val('');
			$('#addproject-modal').modal('toggle');
		},
		saveproject:function() {
			var name=$("#addproject-modal input").val();
			var temp=_.template($("#project-temp").html());
			var project=new Project({name:name});
			var self=this;
			Backbone.sync('create',project,{
				success:function (id) {
					$('#addproject-modal').modal('toggle');
					self.projectList.fetch();
				}
			});
			this.projectList.push(project);
		},
		deleteproject:function (dom) {
			dom=dom.target;
			var pro=$(dom).closest('.project');
			var pid=pro.attr('projectid');
			var project;
			this.projectList.each(function (pro) {
				if(pro.get('id')==pid)
					project=pro;
			})

			var active=$(dom).closest('.active');
			var msg=confirm("确定删除:"+pro.text());
			var self=this;
			if(msg==true){
				console.log(project);
				Backbone.sync('delete',project).done(function () {
					self.projectList.fetch();
				});
				// this.projectList.remove(project);
				// pro.remove();
			}
		}
	})
	return ProjectView;
})