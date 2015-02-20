function loadMessages(){	
	PushNotification.Common.GetMessagesFilters({
		successCallback : function(regresult) {
			console.log("Get Messages");
			var str ="";
			$.each(regresult, function( index, value ) {
			str +="<li class='list-group-item'>";
			str +=" <div class=media>";
			str += "<a class='pull-left' href='"+value['link']+"'>";
			str +="<img class='media-object' src='"+value['link_image']+"' alt=''>";
			str +="</a>";
			str +="<div class='media-body'>";
			str +="<h3 class='media-heading'>"+value['title']+"</h3>";
			str +="<div class='text-bold text-muted'>";
			str +="<small>"+value['message']+"</small>";
			str +="</div>";
			str +="</div>";
			str +="</li>";
                                                        
                                         
				  console.log(str);
				});
			  $("div#recent-orders").html(str);

		},
		failCallback : function(regresult) {
			console.warn("Position registration error: " + regresult);
		}
	});
}
