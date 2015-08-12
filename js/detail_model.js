var Service=Backbone.Model.extend({
	urlRoot:'/demo/monitor',
	defaults:{
		'id':null,
		'host':null,
		'item':null,
		'address':null,
		'status':null
	}
})


var Detail=Backbone.Model.extend({
	urlRoot:'/demo/monitor/detail',
	defaults:{
		'id':null,
		'current_state':null,
		'statusInfo':null,
		'perfdata':null,
		'current_check_attempt':null,
		'max_check_attempts':null,
		'last_check':null,
		'check_type':null,
		'latency':null,
		'execution_time':null,
		'next_check':null,
		'last_state_change':null,
		'last_notification':null,
		'is_flapping':null,
		'scheduled_downtime_depth':null,
		'active_checks_enabled':null,
		'passive_checks_enabled':null,
		'obsess':null,
		'notifications_enabled':null,
		'event_handler_enabled':null,
		'flap_detection_enabled':null
	}
})

var Host=Backbone.Model.extend({
	url:'/demo/monitor/host',
	defaults:{
		'id':null,
		'name':null,
		'address':null,
		'status':null
	}
})

var HostDetail=Backbone.Model.extend({
	urlRoot:'/demo/monitor/host/detail',
	defaults:{
		'id':null,
		'current_state':null,
		'statusInfo':null,
		'perfdata':null,
		'current_check_attempt':null,
		'max_check_attempts':null,
		'last_check':null,
		'check_type':null,
		'latency':null,
		'execution_time':null,
		'next_check':null,
		'last_state_change':null,
		'last_notification':null,
		'is_flapping':null,
		'scheduled_downtime_depth':null,
		'active_checks_enabled':null,
		'passive_checks_enabled':null,
		'obsess':null,
		'notifications_enabled':null,
		'event_handler_enabled':null,
		'flap_detection_enabled':null
	}
})