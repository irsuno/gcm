document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
	console.log("Device ready!");
	var am = new AccountManager();
	// Explicitly add an account for testing
	
	
	am.getAccountsByType('com.google', function(error, accounts) {
		console.log("Email" +accounts[0]['name']);
		PushNotification.email = accounts[0]['name'];
	});
	var ct = new Country();
	// Explicitly add an account for testing

	ct.getLocaleName(function(error, country) {
		console.log("Email" +JSON.stringify(country));
		PushNotification.countryCode = country['value'];
	});
	
	PushNotification.GCM.Register(GCMCode, {
		successCallback : function(regresult) {
			console.log("device registed");
			console.log('DeviceToken: ' + regresult.DeviceToken); // Use this
			
		},
		failCallback : function(regresult) {
			console.warn("error during registration: " + regresult);
			alert("error during registration: " + regresult);
		}
	});
	
}

function registerCurrentPosition() {
	console.log("RegisterCurrentPosition");
	PushNotification.Common.RegisterCurrentPosition({
		successCallback : function(regresult) {
			console.log("Position registration done");
		},
		failCallback : function(regresult) {
			console.warn("Position registration error: " + regresult);
		}
	});
}
