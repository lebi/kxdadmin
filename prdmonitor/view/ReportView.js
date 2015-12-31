define(['jquery','underscore','backbone','cookie','bootstrap','Report','collection','TimePicker','util','highcharts'],
	function ($,_,Backbone,cookie,bootstrap,Report,MyCollection,TimePicker,util,highcharts) {
	var HostReport=MyCollection.extend({
		model:Report,
		url:'/demo/report/host'
	})

	var ServiceReport=MyCollection.extend({
		model:Report,
		url:'/demo/report/service'
	})

	var WarningReport=MyCollection.extend({
		model:Report,
		url:'/demo/report/service/warning'
	})

	var CriticalReport=MyCollection.extend({
		model:Report,
		url:'/demo/report/service/critical'
	})

	var UnknownReport=MyCollection.extend({
		model:Report,
		url:'/demo/report/service/unknown'
	})

	var ReportView=Backbone.View.extend({
		el:$('body'),
		events:{
			'click #create-button':'renderReport',
			'click .service-report table a[name=alert-drilldown-chart]':'jumpToDrilldown',
			'click .report table a[name=service-detail]':'jumpToDetail'
		},
		initialize:function () {
			var now=new Date();
			$('.form_datetime').datetimepicker({
		        format: "yyyy-mm-dd hh:ii",
		        autoclose:true
			})
			this.start=$.cookie("report-starttime");
			this.end=$.cookie("report-endtime");

			if(this.start!=null&&this.end!=null){
				$('.form_datetime input[name=start]').attr('value',this.start);
				$('.form_datetime input[name=end]').attr('value',this.end);
			}else{
				$('.form_datetime input[name=end]').attr('value',now.pattern("yyyy-MM-dd HH:mm"));
				now.setDate(now.getDate()-7);
				$('.form_datetime input[name=start]').attr('value',now.pattern("yyyy-MM-dd HH:mm"));
			}
		},
		renderReport:function () {
			this.start=$('input[name=start]').val();
			this.end=$('input[name=end]').val();
			var count=$('select[name=count]').val();
			count=count.substr(3);
			if(this.end==""||this.start==""){
				alert("请选择时间");
				return;
			};

			$.cookie("report-starttime",this.start);
			$.cookie("report-endtime",this.end);
			$('.init-report').remove();
			this.loading();
			this.renderMain(this.start,this.end,count);
			this.renderCritical(this.start,this.end,count);
			this.renderWarning(this.start,this.end,count);
			this.renderUnknown(this.start,this.end,count);
		},
		renderMain:function (start,end,count) {
			// var serviceReport=new ServiceReport();
			var self=this;
			$('.service-report').empty();
			$.getJSON('/demo/report/service',{starttime:start,endtime:end,count:count},function (result) {
					result=result.result;
					self.loadfinish();
					var temp=_.template($('#service-report-temp').html());
					$('.service-report').append(temp({result:result}));
					if(result.length==0) return;
					self.renderChart(result,"#service-chart");
			})
			$('.host-report').empty();

			$.getJSON('/demo/report/host',{starttime:start,endtime:end,count:count},function (result) {
					result=result.result;
					self.loadfinish();
					console.log(result)
					var temp=_.template($('#host-report-temp').html());
					$('.host-report').append(temp({result:result}));
					if(result.length==0) return;
					self.renderChart(result,"#host-chart");
			})
		},
		renderCritical:function(start,end,count) {
			var self=this;
			var criticals=new CriticalReport();
			$('.service-critical-report').empty();
			criticals.fetch({data:{starttime:start,endtime:end,count:count}})
			.done(function () {
				self.loadfinish();
				var temp=_.template($('#alert-report-temp').html());
				$('.service-critical-report').append(temp({result:criticals.models,type:'critical'}));
				if(criticals.length==0) return;
				self.piechart(criticals,"#critical-pie");

			}).fail(function () {
				self.loadfinish();
			})
		},
		renderWarning:function(start,end,count) {
			var self=this;
			var warnings=new WarningReport();
			$('.service-warning-report').empty();
			warnings.fetch({data:{starttime:start,endtime:end,count:count}})
			.done(function () {
				self.loadfinish();
				var temp=_.template($('#alert-report-temp').html());
				$('.service-warning-report').append(temp({result:warnings.models,type:'warning'}));
				if(warnings.length==0) return;
				self.piechart(warnings,"#warning-pie");
			}).fail(function () {
				self.loadfinish();
			})
		},
		renderUnknown:function(start,end,count) {
			var self=this;
			var unknowns=new UnknownReport();
			$('.service-unknown-report').empty();
			unknowns.fetch({data:{starttime:start,endtime:end,count:count}})
			.done(function () {
				self.loadfinish();
				var temp=_.template($('#alert-report-temp').html());
				$('.service-unknown-report').append(temp({result:unknowns.models,type:'unknown'}));
				if(unknowns.length==0) return;
				self.piechart(unknowns,"#unknown-pie");
			}).fail(function () {
				self.loadfinish();
			})
		},
		jumpToDrilldown:function (dom) {
			dom=dom.target;
			var pid=$(dom).closest('tr').attr('projectid');
			$.cookie("drilldown-id",pid);
			$.cookie("report-service",$($(dom).closest('tr').find('td').get(2)).text());
			$.cookie("report-host",$($(dom).closest('tr').find('td').get(1)).text());
			window.location.href="drilldown.html";
		},
		jumpToDetail:function (dom) {
			dom=dom.target;
			var pid=$(dom).closest('tr').attr('projectid');
			$.cookie("serviceid",pid);
			window.location.href="detail.html";

		},
		renderChart:function (result,dom) {
			var nameList=new Array();
			var alertList=new Array();
			var warningList=new Array();
			var criticalList=new Array();
			var unknownList=new Array();
			_.each(result,function (reportList) {
				var warning=0;var critical=0;var unkonwn=0;var all=0;var common=0;
				_.each(reportList,function  (report) {
				   	if(report.state==0) common=report.num;
				    else if(report.state==1) warning=report.num;
				    else if(report.state==2) critical=report.num;
				    else if(report.state==3) unkonwn=report.num;
				})
				nameList.push(reportList[0].name);
				alertList.push(warning+critical+unkonwn);
				warningList.push(warning);
				criticalList.push(critical);
				unknownList.push(unkonwn);
			});
			$(dom).highcharts({
			        title: {text: '报表'},
			        colors: ['#104E8B', '#EEB422', '#CD2626', '#B0B0B0', '#3D96AE', '#DB843D', '#92A8CD', '#A47D7C', '#B5CA92'],
			        chart: {type: 'column'},
			        xAxis: {categories:nameList},
			        series: [{name: 'alert',data: alertList},
			        {name: 'warning',data: warningList},
			        {name: 'critical',data: criticalList},
			        {name: 'unkonwn',data: unknownList}]
			});
		},
		piechart:function (result,dom) {
			var data=new Array();
			_.each(result.models,function (report) {
				data.push([report.get('name'),report.get('num')]);
			})

			$(dom).highcharts({
				chart: { plotBackgroundColor: null, plotBorderWidth: null,plotShadow: false,height: 350},
			    title: {text: ''},
			    colors: ['#FF0000','#FF6347','#FF8247','#FFB90F', '#FFD700', '#FFFF00', '#B3EE3A', '#7CFC00', '#00FF7F', '#00CD00'
			    , '#008B00', '#00868B','#009ACD', '#00B2EE', '#00EEEE','#7B68EE','#6959CD','#7A378B','#551A8B','#483D8B'],
		        plotOptions: {
		            pie: {
						allowPointSelect: true,
		                cursor: 'pointer',
		                dataLabels: {enabled: false}
		            }
				},
		        series: [{type: 'pie',data: data}]
		    });
		},
		loading:function (){
			$('body').addClass('waiting');
			$('#create-button').addClass('disabled');
		},
		loadfinish:function(){
			$('body').removeClass('waiting');
			$('#create-button').removeClass('disabled');
		}
	})
	return ReportView;
})