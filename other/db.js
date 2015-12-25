(function () {
	var data=[
		{path:'path1',name:'java',price:'100'},
		{path:'path2',name:'cpp',price:'95'}
	]
	var db;
	var request = indexedDB.open("MyTestDatabase",3);
	request.onerror = function(event) {
	  	alert("Why didn't you allow my web app to use IndexedDB?!");
	};
	request.onsuccess = function(event) {
	  	db = request.result;
	  	var transaction=db.transaction(['bookshop'],'readwrite');
	  	var objectstore=transaction.objectStore('bookshop');
		for(var i in data){
			objectstore.add(data[i]);
		}
		
		transaction=db.transaction(['bookshop']);
		objectstore=transaction.objectStore('bookshop');
		var get = objectstore.get("path1");
		get.onerror=function (event) {
			console.log(event.target);
		}
		get.onsuccess=function (event) {
			console.log(event);
		}
	};
	request.onupgradeneeded=function (event) {
		db=event.target.result;

		var store=db.createObjectStore('bookshop',{keyPath:'path'});

		store.createIndex('name','name',{unique:true});
		store.createIndex('price','price');
		console.log('upgreade');

	}
})()