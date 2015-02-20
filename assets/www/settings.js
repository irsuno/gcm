function loadSetting(){	
	PushNotification.Common.GetCategoryFilters({
		successCallback : function(regresult) {
			console.log("Get category");
			console.log(regresult.all[0]['cat_name']);
			$.each(regresult.all, function( index, value ) {
				var isCheck = "";
				$.each(regresult.actived, function( k, v ) {
					if(value['id'] == v){
						isCheck = "checked='checked'";
					}
				});
			      var check = "<input onclick='setSettings()' type='checkbox' class='cat-id' name='cat[]' value='"+value['id']+"' "+isCheck+" >";
				  
			      var str ="<li class='list-group-item'><div class='todo-list'><div class='todo-checker'>"+check+"</div>";
			      str +="<div class='todo-text'>"+value['cat_name']+"</div></div></li>";
			      
				 
				  $("ul#category-list").append(str);
				});
		},
		failCallback : function(regresult) {
			console.warn("settings registration error: " + regresult);
		}
	});
}

function setSettings() {
	 var searchIDs = $(".cat-id:checkbox:checked").map(function(){
	        return this.value;
	    }).toArray();
		PushNotification.Common.AddCategoryFilter(searchIDs,{
			successCallback : function(regresult) {
				console.log("Position registration done");
			},
			failCallback : function(regresult) {
				console.warn("Position registration error: " + regresult);
			}
		});
	    console.log(searchIDs);
}

