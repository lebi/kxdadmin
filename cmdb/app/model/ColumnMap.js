/*
*	@map:资产基础属性表中英文映射。
*	@priority:资产属性在页面上显示时列的优先级。
*/
define([],function () {
	var map={
		id:'#',
		unitId:'单位ID',
		typeId:'类型ID',
		name:'资产名',
		unit:'所属单位',
		type:'类型',
		code:'编号',
		manufacturer:'生产商',
		purpose:'用途',
		dutyofficer:'负责人',
		ipAddress:'IP',
		purchaseTime:'购买时间',
		applyTime:'使用时间',
		host:'主机',
		serverRoom:'机房',
		bracketId:'机架号'
	}

	var priority={
		id:1,
		name:2,
		unit:4,
		type:5,
		code:3,
		manufacturer:8,
		purpose:9,
		dutyofficer:10,
		ipAddress:11,
		purchaseTime:12,
		applyTime:13,
		host:14,
		serverRoom:15,
		bracketId:16
	}
	return {
		map:map,
		priority:priority
	}
})