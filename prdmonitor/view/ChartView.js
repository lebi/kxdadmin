//***********************************************************************************************************************************
//																chart view
//													one view stand for one part of the monitor list the user choose
//														user can edit the view to add or delete monitors
//															user can also delete the view
//														when user choose item he want to monitor
//													this view will draw a history chart for this item
//************************************************************************************************************************************
define(['jquery','underscore','backbone','cookie','highcharts','Chart','ChartList','Module','util'],
	function ($,_,Backbone,cookie,highcharts,Chart,ChartList,Module,util) {

	var interval=1000*60*3;
	var ChartView=Backbone.View.extend({
		// // el:$('.monitorpage'),
		events:{
			'click .editmodule':'editmodule',
			'click .delete':'deletemodule',
			'click .button-list button':'jumpToDetail'
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
			this.freshinterval();
		},
		setModal:function (modalView) {
			this.modalView=modalView;
		},
		_setpage:function (page) {
			this.$el=page;
		},
		setmodule:function (module) {
			this.module=module;
			this.delegatePermissions();
		},
		changechart:function (dom) {
			$(dom).closest('.servicelist').find(".btn-primary").removeClass("btn-primary");
			$(dom).closest('.changechart').addClass("btn-primary");
			this.fetchAndRenderChart();
		},
		fetchAndRenderChart:function (){
			var page=this.$el;
			var self=this;
			// var monitors=this.module.get('monitors');
			this.chartList=new ChartList();
			this.chartList.fetch({data:{id:this.module.get('id'),starttime:null}})
			.done(function (){
				var series=new Array();
				if(!self.avialable(self.chartList)) return;
				_.each(self.chartList.models,function (chart) {
					series=series.concat(self.readdata(chart));
				})
				var end=new Date(self.chartList.models[0].get('chartData')[0].time.replace(/-/g, "/"));
				if(self.latest==null)self.latest=end;
					else self.latest=self.latest.getTime()>end.getTime()?self.latest:end;
				var start=new Date(self.chartList.models[0].get('chartData')[self.chartList.models[0].get('chartData').length-1].time.replace(/-/g, "/"));
				var interval=parseInt((end.getTime()-start.getTime())/(self.chartList.models[0].get('chartData').length));
				self.renderChart(series,start,interval);
			})
		},
		freshinterval:function  () {		
			var self=this;
			setInterval(function () {
				self.fetchAndRenderChart();
			},interval);
		},
		readdata:function (chart) {
			var series=new Array();
			var type=chart.get('dataType');
			var params=chart.get('parameters').split(';');
			var ruleList=chart.get('parametersCal').split(';');
			for(var j=0;j<params.length;j++){
				var result=new Array()
				for(var i=chart.get('chartData').length-1;i>=0;i--){
					var reg=new RegExp(chart.get('reg'));
					if(type==0)
						result.push(reg.calculate(chart.get('chartData')[i].perfdata,ruleList[j]));
					else
						result.push(reg.calculate(chart.get('chartData')[i].output,ruleList[j]));
				}
				series.push({name:params[j]+";"+chart.get('host')+";"+chart.get('service'),data:result});
			}
			return series;
		},
		renderChart:function (series,start,interval){
			// console.log(series);
			var self=this;
			Highcharts.setOptions({global:{useUTC : false}});
			$("#servicechart",this.$el).highcharts({
				title:null,
				chart:{
	          		type: 'spline',
	            },
			    xAxis: {type: 'datetime'},
				yAxis:{title: null},
				tooltip:{
	                formatter: function () {
						return '<b>'+this.series.name.split(';')[1]+'<b><br/>'+'<b>'+this.series.name.split(';')[2]
						+'<b><br/>'+this.series.name.split(';')[0]+':'+this.y+'<br/>'+new Date(this.x).pattern('HH:mm');
					}
				},
				plotOptions: {
			          spline: {
			              lineWidth: 2,
			              states: {
			                  hover: {lineWidth: 2}
			              },
			              marker: {enabled: false},
			              pointInterval: interval, // one hour
			              pointStart: start.getTime()
			          }
			      },
				legend:{
					labelFormatter:function () {
						return this.name.split(';')[1]+'|'+this.name.split(';')[2]+'|'+this.name.split(';')[0];
					}
				},
				series: series
			})
		},
		editmodule:function () { //将页面上的数据转化为Module对象  并态模态框渲染
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
						var p=self.$el;
						var next=$(p).next();
						$(p).remove();
						var temp=_.template($("#chart-temp").html());
						$(next).before(temp({module:self.module}));
						self._setpage($(next).prev());
						self.fetchAndRenderChart();
					}
				});
			});
		},
		deletemodule:function () {
			var msg=confirm("确定删除:"+this.module.get('note'));
			if(msg==true){
				Backbone.sync('delete',this.module);
				this.remove();
			}
		},
		jumpToDetail:function (dom) {
			dom=dom.target;
			var id=$(dom).closest('button').attr('serviceid');
			$.cookie("serviceid",id);
			window.location.href="detail.html";
		},
		avialable:function (chartList) {
			var regflag=false;
			var flag=false;
			_.each(chartList.models,function (chart) {
				if(chart.get('parameters')!=null&&chart.get('parametersCal')!=null) {
					regflag=true;
				}

				if(chart.get('chartData').length!=0){
					flag=true;
				}
			});
			if(!regflag){
				var html="<h3 style='margin-left:30px'>检查正则表达式配置</h3>";
				$("#servicechart").empty();
				$("#servicechart").append(html);
				return false;
			}
			if(!flag){
				var html="<h3 style='margin-left:30px'>近期无数据，请检查连接</h3>";
				$("#servicechart").empty();
				$("#servicechart").append(html);
				return false;
			}
			return true;
		}
	})
	return ChartView;
})