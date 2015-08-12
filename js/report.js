$(function  () {
	$("#warpper-top").load("wrapper-top.html",function () {
		$($(".top-navbar .nav li").get(3)).addClass('active');
	});
})
