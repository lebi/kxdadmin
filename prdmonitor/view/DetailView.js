define(['jquery','underscore','backbone','cookie','bootstrap','highcharts','TimePicker','Service','Detail','ChartDetail','util'],
	function ($,_,Backbone,cookie,bootstrap,highcharts,TimePicker,Service,Detail,ChartDetail,util) {

	var interval=1000*60*3;
	var DetailView=Backbone.View.extend({
		el:$('body'),
		events:{
			'click .page-button li':'changeTarget',
			'change .page-trends select':'renderTrendsQuik',
			'click #create-button':'renderTrendsByDate'
		},
		initialize:function (){
			$('.form_datetime').datetimepicker({
		        format: "yyyy-mm-dd hh:ii",
		        autoclose:true
			})
			this.model=new Service({id:$.cookie('serviceid')});
			var self=this;
			this.target='page-detail';
			this.model.fetch().done(function() {
				var temp=_.template($('#title-temp').html());
				$('.page-title').empty();
				$('.page-title').append(temp({monitor:self.model}));
			})
			setInterval(function () {
				if(self.target=='page-detail')
					self.render();
			},interval);
			this.render();
		},
		changeTarget:function (dom) {
			this.target=$(dom.target).closest('li').attr('target');
			$(dom.target).closest('ul').find('.active').removeClass('active');
			$(dom.target).closest('li').addClass('active');
			this.render();
		},
		render:function  () {
			switch(this.target){
				case 'page-detail':
					this.renderDetail();
					break;
				case 'alert-history':
					this.renderHistory();
					break;
				case 'page-trends':
					this.renderTrendsQuik();
					break;
				case 'page-report':
					this.renderReport();
					break;
				case 'notification-history':
					this.renderNotification();
					break;
			}
		},
		renderDetail:function () {
			$('.page-block').hide();
			$('.page-detail').remove();
			this.detail=new Detail({id:this.model.get('id')});
			var self=this;
			this.detail.fetch().done(function () {
				var temp=_.template($('#detail-temp').html());
				$('.page-container').append(temp({detail:self.detail}));
			})
		},
		renderHistory:function() {
			$('.page-block').hide();
			$('.alert-history').show();
		},
		renderTrendsQuik:function  (argument) {
			var space=$('.page-trends option:selected').attr("name");
			var start;
			switch(space){
				case "day":
					start=new Date().beforeday();
					break;
				case "week":
					start=new Date().beforeweek();
					break;
				case "month":
					start=new Date().beforemonth();
					break;
				case "year":
					start=new Date().beforeyear();
					break;
				case "all":
					start=new Date(0);
					break;
			}
			var end=new Date();
			start=start.pattern("yyyy-MM-dd HH:mm");
			end=end.pattern("yyyy-MM-dd HH:mm");
			this.renderTrends(start,end);
		},
		renderTrendsByDate:function (argument) {
			var start=$('input[name=start]').val();
			var end=$('input[name=end]').val();
			this.renderTrends(start,end);
		},
		renderTrends:function (start,end) {
			this.loading();
			$("#detail-chart").empty();
			$('.page-block').hide();
			$('.page-trends').show();

			$('.page-trends input[name=start]').attr('value',start);
			$('.page-trends input[name=end]').attr('value',end);

			var historyDetail=new ChartDetail({id:this.model.get('id')});
			var self=this;
			historyDetail.fetch({data:{starttime:start,endtime:end}})
			.done(function () {
					self.loadfinish();
					if(historyDetail.get('reg')==""||historyDetail.get('reg')==null||historyDetail.get('parametersCal')==null){
						$("#detail-chart").append('<h3>无法获取数据，请完善对应正则表达式</h3>');
						return;
					}

					if(historyDetail.get('chartData')==null||historyDetail.get('chartData').length==0){
						$("#detail-chart").append('<h3>该时段无数据</h3>');
						return;
					}
						var series=new Array();
						var offset=series.length;
						if(historyDetail.get('parameters')==null) return;
						var type=historyDetail.get('dataType');
						var params=historyDetail.get('parameters').split(';');
						var ruleList=historyDetail.get('parametersCal').split(';');

						console.log(historyDetail);
						var start=new Date(historyDetail.get('begin').replace(/-/g, "/"));
						var end=new Date(historyDetail.get('end').replace(/-/g, "/"));
						console.log(start);
						var interval=parseInt((end.getTime()-start.getTime())/(historyDetail.get('chartData').length));
						
						for(var j=0;j<params.length;j++){
							var result=new Array()
							for(var i=0;i<historyDetail.get('chartData').length;i++){
								var reg=new RegExp(historyDetail.get('reg'));
								if(type==0)
									result.push(reg.calculate(historyDetail.get('chartData')[i].perfdata,ruleList[j]));
								else
									result.push(reg.calculate(historyDetail.get('chartData')[i].output,ruleList[j]));
							}
							series.push({name:params[j],data:result,type:'area',pointInterval:interval,pointStart:start.getTime()});
						}
						self.renderDetailChart(series);
			}).fail(function () {
				self.loadfinish();
				$("#detail-chart").append('<h3>数据加载失败</h3>');
				return;
			})
		},
		loading:function () {
			$('.page-container').addClass('waiting');
			$('#create-button').addClass('disabled');
		},
		loadfinish:function () {
			$('.page-container').removeClass('waiting');
			$('#create-button').removeClass('disabled');
		},
		renderReport:function () {
			$('.page-block').hide();
			$('.page-report').show();
		},
		renderNotification:function () {
			$('.page-block').hide();
			$('.notification-history').show();
		},
		renderDetailChart:function (series) {
			Highcharts.setOptions({global:{useUTC : false}});
		 	$('#detail-chart').highcharts({
		 		chart: { zoomType: 'x',spacingRight: 20,height:500 },
		        title: { text: '' },
		        xAxis: {
		            type: 'datetime',
		            title: {text: null}
		        },
		        yAxis: { title: {text: ''} },
		        tooltip: {shared: true},
		        plotOptions: {
		            area: {
		                fillColor: {
		                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
		                    stops: [
		                        [0, Highcharts.getOptions().colors[0]],
		                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
		                    ]
		                },
		                lineWidth: 1,
		                marker: {
		                    enabled: false
		                },
		                shadow: false,
		                states: {
		                    hover: {
		                        lineWidth: 1
		                    }
		                },
		                threshold: null
		            }
		        },
		        series:series
		    });
		}
	})
	return DetailView;
})