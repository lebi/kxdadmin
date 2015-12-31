var Point=MyModel.extend({
	defaults:{
		'count':null,
		'time':null
	}
})

var PointList=MyCollection.extend({
	model:Point,
	url:'/demo/report/chart/alert'
})

var BodyView=Backbone.View.extend({
	el:$("body"),
	events:{
		'click #create-button':'createChart'
	},
	initialize:function () {
		this.starttime=$.cookie("report-starttime");
		this.endtime=$.cookie("report-endtime");
		this.service=$.cookie("report-service");
		this.host=$.cookie("report-host");
		this.id=$.cookie("drilldown-id");
		this.render();
	},
	render:function () {
		$('.form_datetime').datetimepicker({
	        format: "yyyy-mm-dd hh:ii",
	        autoclose:true
		})
		$('.form_datetime input[name=start]').attr('value',this.starttime);
		$('.form_datetime input[name=end]').attr('value',this.endtime);
		if(this.starttime!=null&&this.endtime!=null&&this.id!=null){
			this.fetchandrender();
		}
		var html="<span><b>Service:</b>"+this.service+" </span><span> <b>Host:</b>"+this.host+"</span>";
		$(".form-header").append(html);
	},
	fetchandrender:function () {
		var start=new Date(Date.parse(this.starttime.replace(/-/g, "/")));
		var end=new Date(Date.parse(this.endtime.replace(/-/g, "/")));
		var dist=(Date.parse(end)-Date.parse(start))/1000;
		var i=0;
		while(dist>1){
			if(dist/distance[i]<1)
				break;
			console.log(dist);
			dist/=distance[i];
			i++;
		}
		var pointList=new PointList();
		var self=this;
		pointList.fetch({data:{starttime:this.starttime,endtime:this.endtime,id:this.id,type:type[i-1]}})
		.done(function (result) {
			var pointList=new Array();
			_.each(result.result,function (point){
				if(i>1)
					pointList.push({name: point.time,y: point.count,drilldown: true, type:type[i-1], down:type[i-2]});
				else
					pointList.push({name: point.time,y: point.count,drilldown: true, type:type[i-1], down:null});
			})
			self.renderChart(pointList);
		})
	},
	createChart:function () {
		this.starttime=$('input[name=start]').val();
		this.endtime=$('input[name=end]').val();
		this.fetchandrender();

	},
	renderChart:function (pointList) {
		var self=this;
		$('#drilldown-chart').highcharts({
	        chart: {
	            events: {
	                drilldown: function (e) {
	                	console.log(e);	
	                    if (!e.seriesOptions) {
	                        var chart = this;
	                        var down=e.point.down;
	                        if(down!=null){
	                        	var endtime;
								var starttime=new Date(Date.parse(e.point.name.replace(/-/g, "/")));
								console.log(starttime);
	                        	switch(e.point.type){
	                        		case "year":
	                        			endtime=starttime.nextyear();
	                        			break;
	                        		case "month":
	                        			endtime=starttime.nextmonth();
	                        			break;
	                        		case "day":
	                        			endtime=starttime.nextday();
	                        			break;
	                        		default:
	                        			return;
	                        	}
								var pointList=new PointList();
								var i=$.inArray(e.point.down,type)+1;
								pointList.fetch({data:{starttime:starttime.pattern("yyyy-MM-dd HH:mm"),
									endtime:endtime.pattern("yyyy-MM-dd HH:mm"),id:self.id,type:type[i-1]}})
								.done(function (result) {
									var pointList=new Array();
									_.each(result.result,function (point){
										if(i>1)
											pointList.push({name: point.time,y: point.count,drilldown: true, type:type[i-1], down:type[i-2]});
										else
											pointList.push({name: point.time.split(' ')[1]+":00",y: point.count,drilldown: true, type:type[i-1], down:null});
									})
	                           		series={name:e.point.name,data: pointList}
	                            	chart.addSeriesAsDrilldown(e.point, series);
								});
	                        }
	                    }
	                }
	            }
	        },
	        title: {text: ''},
	        xAxis: {type: 'category'},
	        legend: {enabled: false
	        },
	        plotOptions: {
	            series: {
	                borderWidth: 0,
	                dataLabels: {enabled: true}
	            }
	        },
	        series: [{
	            data: pointList
	        }],
	        drilldown: {series: []}
	    });
	}
})

var type=['hour','day','month','year'];
var distance=[3600,24,30,12];
$(function () {	
	$("#warpper-top").load("wrapper-top.html",function () {
		$($(".top-navbar .nav li").get(3)).addClass('active');
	});
	var body=new BodyView();
})