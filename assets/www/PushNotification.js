var PushNotification = PushNotification || {};
var AccountManager = function() {};
var Country = function() {};
var Globalization = function() {};
var email ="";


AccountManager.prototype.getAccountsByType = function(type, callback)
{
	return cordova.exec(
		function(accounts) { callback(undefined, accounts) },
		callback,
		'AccountManager', 'getAccountsByType', [type],true);
};

var am = new AccountManager;


Country.prototype.getLocaleName = function(callback)
{
	return cordova.exec(
		function(accounts) { callback(undefined, accounts) },
		callback,
		'Country', 'getLocaleName', [],true);
};


PushNotification.PushNotificationAppId = null;
PushNotification.gcmregid = '';
PushNotification.email = '';
PushNotification.latitude ="";
PushNotification.longitude ="";
PushNotification.altitude ="";
PushNotification.accuracy ="";
PushNotification.heading ="";
PushNotification.altitudeAccuracy ="";
PushNotification.speed ="";
PushNotification.timestamp ="";
PushNotification.countryCode ="";
PushNotification.Events = PushNotification.Events || {};
PushNotification.OS = {
	ANDROID : {
		value : 2,
		name : "Android",
		code : "ANDROID"
	}
};
var RESPONSESTATUS = {
	REGISTERED : {
		value : 200,
		name : "Registered",
		code : "REGISTERED"
	},
	GENERICERROR : {
		value : 500,
		name : "Generic Error",
		code : "GENERICERROR"
	},
	APPLICATIONNOTFOUND : {
		value : 404,
		name : "Application not found",
		code : "APPLICATIONNOTFOUND"
	},
	DEVICENOTFOUND : {
		value : 405,
		name : "Device not found",
		code : "DEVICENOTFOUND"
	}
};
PushNotification.GCM = function() {
	var deviceId = '';
	var privateAppId = '';
	var privateDeviceType = -1;
	var privateSuccessCallback = GCM_Success;
	var privateFailCallback = GCM_Fail;
	var email ="";
	function GCM_Event(e) {
		console.log('GCM_Event: ' + e.event);
		switch (e.event) {
		case 'registered':
			PushNotification.gcmregid = e.regid;
			if (PushNotification.gcmregid.length > 0) {
				console.log('REGISTERED -> REGID:' + e.regid);
				PushNotification.Common.RegisterOnPushNotification(e.regid,
						privateAppId, privateDeviceType, {
							instanceId : deviceId,
							successCallback : privateSuccessCallback,
							failCallback : privateFailCallback
						});
			}
			break;
		case 'message':
			console.log('MESSAGE -> MSG:' + e.message);
			console.log('MESSAGE -> MSGCNT:' + e.msgcnt);
			console.log('e:' + JSON.stringify(e));
			if (e.payload.foreground) {
				console.log('soundname:' + e.payload.sound);
				var my_media = new Media("/android_asset/www/" + e.soundname);
				my_media.play();
			} else {
				console.log('inline');
				PushNotification.Common.NotifyPush(ConvertPush(e));
			}
			break;
		case 'error':
			console.warn('ERROR -> MSG:' + e.msg);
			privateFailCallback(e);
			break;
		default:
			alert('EVENT -> Unknown, an event was received and we do not know what it is');
			break;
		}
	}
	function GCM_Success(e) {
		console.log('success method');
		console.log('e:' + JSON.stringify(e));
		if (e == "ALREADY REGISTERED" && privateSuccessCallback != GCM_Success) {
			privateSuccessCallback(e);
		}
		console.log(PushNotification.gcmregid);
		console.log('exit from success');
	}
	function GCM_Fail(e) {
		console.log('GCM_Fail -> GCM plugin failed to register');
		console.log('GCM_Fail -> ' + e.msg);
		privateFailCallback(e);
	}
	function ConvertPush(GCMPush) {
		console.log("Converting GCM...");
		var CommonPush = {
			Badge : GCMPush.msgcnt,
			Alert : GCMPush.message,
			Sound : GCMPush.sound
		};
		console.log("CommonPush: " + JSON.stringify(CommonPush));
		return CommonPush;
	}
	return {
		Register : function(GCMCode, optionalparams) {
			console.log('Calling GCM Register');
			privateAppId = PushNotification.PushNotificationAppId;
			privateDeviceType = 2;
			if (!optionalparams)
				optionalparams = {};
			privateSuccessCallback = PushNotification.Common.DefaultValue(
					optionalparams.successCallback, GCM_Success);

			privateFailCallback = PushNotification.Common.DefaultValue(
					optionalparams.failCallback, GCM_Fail);

			deviceId = PushNotification.Common.DefaultValue(
					optionalparams.instanceId, device.uuid);
			console.log('Params initialized');
			return cordova.exec(GCM_Success, GCM_Fail, 'GCMPlugin', 'register',
					[ {
						senderID : GCMCode,
						ecb : "PushNotification.GCM.GCM_Event"
					} ]);
		},
		UnRegister : function(successCallback, failureCallback) {
			console.log("Start unregistering app");
			var UnregisterSuccessCallback = PushNotification.Common
					.DefaultValue(successCallback, function() {
						console.log("Success Unregistering app");
					});
			var UnregisterFailCallback = PushNotification.Common.DefaultValue(
					failureCallback, function(err) {
						console.log("Error during Unregistering app");
						console.log("error:" + JSON.stringify(err));
					});
			console.log("Calling native unregister");
			return cordova.exec(UnregisterSuccessCallback,
					UnregisterFailCallback, 'GCMPlugin', 'unregister', [ {} ]);
		},
		GCM_Event : GCM_Event
	};
}();
PushNotification.Common = function() {
	var privateCurrentPlatform = null;
	var email ="";
	
	function DefaultValue(arg, def) {
		return (typeof arg == 'undefined' ? def : arg);
	}
	
	
	function GetAppId() {
		if (PushNotification.PushNotificationAppId == null) {
			console.warn("PushNotificationAppId is NOT setted");
			return null;
		}
		return PushNotification.PushNotificationAppId;
	}
	function WriteResponceStatus(code) {
		if (code == RESPONSESTATUS.REGISTERED.value) {
			console.log(RESPONSESTATUS.REGISTERED.name);
		} else if (code == RESPONSESTATUS.GENERICERROR.value) {
			console.warn(RESPONSESTATUS.GENERICERROR.name);
		} else if (code == RESPONSESTATUS.APPLICATIONNOTFOUND.value) {
			console.warn(RESPONSESTATUS.APPLICATIONNOTFOUND.name);
		} else if (code == RESPONSESTATUS.DEVICENOTFOUND.value) {
			console.warn(RESPONSESTATUS.DEVICENOTFOUND.name);
		} else {
			console.warn("Code not found");
		}
	
	}
	
	function NotifyPush(push) {
		console.log("NotifyPush Callback:" + push);
		var ev;
		console.log("dispatch for firefox + others");
		ev = document.createEvent('HTMLEvents');
		ev.notification = push;
		ev.initEvent('PushNotification', true, true, push);
		document.dispatchEvent(ev);
		console.log("notificationCallback dispached");
	}
	
	function OnPushReceived(callback) {
		console.log("setting callback");
		document.addEventListener("PushNotification-notification", callback);
		console.log("setting callback done");
	}
	
	function GetCategoryFilters(optionalparams) {
		if (!optionalparams) {
			optionalparams = {};
		} 
	        var deviceId = DefaultValue(optionalparams.instanceId, device.uuid);
	        var pSuccessCallBack = DefaultValue(optionalparams.successCallback, function (PushNotificationresult) {
	            console.log('Internal PushNotification getfilter success managed');
	        });
	        
	        
	        var pFailCallBack = DefaultValue(optionalparams.failCallback, function (PushNotificationresult) {
	            console.log('Internal PushNotification getfilter fail managed');
	        });
	        console.log('Get Tag Filters...');
	        var request = new XMLHttpRequest();
	        console.log('DeviceIdentifier:' + deviceId);
	        var getstr = PushNotification.Domain + "getCategories.php?app_id=" + PushNotification.PushNotificationAppId + "&device_id=" + deviceId
	               ;
	        console.log('RequestTo:' + getstr);
	        request.open('GET', getstr, true);
	        request.onreadystatechange = function () {
	            if (request.readyState == 4) {
	                console.log('Processing responce');
	                if (request.status == 200 || request.status == 201) {
	                    try {
	                        pSuccessCallBack(JSON.parse(request.responseText));
	                    } catch (e) {
	                        console.warn('Error during responce parsing' + this.statusText);
	                        pFailCallBack(e);
	                    }
	                    ;
	                } else {
	                    console.warn('Error during filter getting' + this.statusText);
	                    pFailCallBack(this);
	                }
	            }
	        }
	        console.log('Calling GetTagFilters endpoint');
	        request.send();
	    }
	
	
	
	function GetMessagesFilters(optionalparams) {
		if (!optionalparams) {
			optionalparams = {};
		} 
	        var deviceId = DefaultValue(optionalparams.instanceId, device.uuid);
	        var pSuccessCallBack = DefaultValue(optionalparams.successCallback, function (PushNotificationresult) {
	            console.log('Internal PushNotification getfilter success managed');
	        });
	        
	        
	        var pFailCallBack = DefaultValue(optionalparams.failCallback, function (PushNotificationresult) {
	            console.log('Internal PushNotification getfilter fail managed');
	        });
	        console.log('Get Tag Filters...');
	        var request = new XMLHttpRequest();
	        console.log('DeviceIdentifier:' + deviceId);
	        var getstr = PushNotification.Domain + "getRichs.php?app_id=" + PushNotification.PushNotificationAppId + "&device_id=" + deviceId;
	        console.log('RequestTo:' + getstr);
	        request.open('GET', getstr, true);
	        request.onreadystatechange = function () {
	            if (request.readyState == 4) {
	                console.log('Processing responce');
	                if (request.status == 200 || request.status == 201) {
	                    try {
	                        pSuccessCallBack(JSON.parse(request.responseText));
	                    } catch (e) {
	                        console.warn('Error during responce parsing' + this.statusText);
	                        pFailCallBack(e);
	                    }
	                    ;
	                } else {
	                    console.warn('Error during filter getting' + this.statusText);
	                    pFailCallBack(this);
	                }
	            }
	        }
	        console.log('Calling GetTagFilters endpoint');
	        request.send();
	    }
	
	function AddCategoryFilter(tag, optionalparams) {
		if (!optionalparams)
			optionalparams = {};
		var appId = PushNotification.PushNotificationAppId;
		console.log('Optional params: ' + JSON.stringify(optionalparams));
		var deviceId = DefaultValue(optionalparams.instanceId, device.uuid);
		var pSuccessCallBack = DefaultValue(
				optionalparams.successCallback,
				function(PushNotificationresult) {
					console
							.log('Internal PushNotification addfilter success managed');
				});
		var pFailCallBack = DefaultValue(optionalparams.failCallback, function(
				PushNotificationresult) {
			console.log('Internal PushNotification addfilter fail managed');
		});
		var pRemovePrevCategory = DefaultValue(
				optionalparams.removePrevCategory, false);
		console.log('Adding Category Filter...');
		var request = new XMLHttpRequest();
		console.log('AppId:' + appId);
		console.log('Category:' + tag);

		console.log('DeviceIdentifier:' + deviceId);
		var getstr = PushNotification.Domain
				+ "setCategories.php?app_id="
				+ PushNotification.PushNotificationAppId + "&device_id=" + deviceId + "&category="
				+ tag;
		console.log('RequestTo:' + getstr);
		request.open('GET', getstr, true);
		request.onreadystatechange = function() {
			if (request.readyState == 4) {
				console.log('Processing responce');
				if (request.status == 200 || request.status == 201) {
					try {
						var code = JSON.parse(request.responseText).d.AddCategoryFilter;
						if (code == 200) {
							console.log('Filter added succesfully');
							pSuccessCallBack(this);
						} else {
							console
									.warn('Error during filter adding execution');
							WriteResponceStatus(code);
							pFailCallBack(this);
						}
					} catch (e) {
						console.warn('Error during responce parsing'
								+ this.statusText);
						pFailCallBack(e);
					}
					;
				} else {
					console
							.warn('Error during filter adding'
									+ this.statusText);
					pFailCallBack(this);
				}
			}
		}
		console.log('Calling AddCategoryFilter endpoint');
		request.send();
	}
	function privateCurrentPositionSuccess(position){
		this.position = position;
	}
	function RegisterOnPushNotification(deviceToken, appId, deviceType,
			optionalparams) {
		console.log('Registering on PushNotification...');
		if (!optionalparams)
			optionalparams = {};
		console.log('Optional params: ' + JSON.stringify(optionalparams));
		var deviceId = DefaultValue(optionalparams.instanceId, device.uuid);
		var pSuccessCallBack = DefaultValue(optionalparams.successCallback,
				function(PushNotificationresult) {
					console.log('Internal PushNotification success managed');
				});
		var pFailCallBack = DefaultValue(optionalparams.failCallback, function(
				PushNotificationresult) {
			console.log('Internal PushNotification fail managed');
		});
		// get curent position
		var type ='com.google';
		var accountsList =		{};
		
		
		var request = new XMLHttpRequest();
		console.log('AppId:' + appId);
		console.log('Token:' + deviceToken);
		console.log('DeviceIdentifier:' + deviceId);
		console.log('DeviceType:' + deviceType);
		
		var getstr = PushNotification.Domain + "registerGCM.php?app_id="+ appId + "&lat=" + PushNotification.latitude +
				"&long=" + PushNotification.longitude +"&timestamp=" + PushNotification.timestamp +
				"&gcm_id="+ deviceToken + "&email="+PushNotification.email + "&device_id="
				+ deviceId;
		console.log('RequestTo:' + getstr);
		request.open('GET', getstr, true);
		request.onreadystatechange = function() {
			if (request.readyState == 4) {
				console.log('Processing responce');
				if (request.status == 200 || request.status == 201) {
					console.log("RegisterCurrentPosition");
					PushNotification.Common.RegisterCurrentPosition({
						successCallback : function(regresult) {
							console.log("Position registration done");
						},
						failCallback : function(regresult) {
							console.warn("Position registration error: " + regresult);
						}
					});
					if (request.status == 200) {
						console.log('Registered succesfully');
						this.DeviceToken = deviceToken;
						this.DeviceId = deviceId;
						
						pSuccessCallBack(this);
					} else {
						console
								.warn('Error during registration device execution');
						WriteResponceStatus(code);
						pFailCallBack(this);
					}
				} else {
					console.warn('Error during registration' + this.statusText);
					pFailCallBack(this);
				}
			}
		}
		console.log('Calling RegisterOnPushNotification endpoint');
		request.send();
	}
	function UnRegister(optionalparams) {
		if (!optionalparams)
			optionalparams = {};
		PushNotification.GCM.UnRegister(optionalparams.SuccessCallback,
				optionalparams.FailCallback);
	}

	var positionOptionalParams = null;

	function RegisterCurrentPosition(optionalparams) {
		if (!optionalparams) {
			positionOptionalParams = {};
		} else {
			positionOptionalParams = optionalparams;
		}
		positionOptionalParams.enableHighAccuracy = true;
		positionOptionalParams.timeout = 1000000;
		//navigator.geolocation.getCurrentPosition(currentPositionSuccess,
		////		currentPositionError, positionOptionalParams);
		navigator.geolocation.getCurrentPosition(currentPositionSuccess);
		
	
	}
	function currentPositionSuccess(position) {
		console.log('Optional params: '
				+ JSON.stringify(positionOptionalParams));
		console.log('Latitude: ' + position.coords.latitude + '\n'
				+ 'Longitude: ' + position.coords.longitude + '\n'
				+ 'Altitude: ' + position.coords.altitude + '\n' + 'Accuracy: '
				+ position.coords.accuracy + '\n' + 'Altitude Accuracy: '
				+ position.coords.altitudeAccuracy + '\n' + 'Heading: '
				+ position.coords.heading + '\n' + 'Speed: '
				+ position.coords.speed + '\n' + 'Timestamp: '
				+ position.timestamp + '\n');
		var isodate = new Date(position.timestamp);
		var isodatestring = ISODateString(isodate);
		console.log("ISO date: " + isodatestring);
		var deviceId = DefaultValue(positionOptionalParams.instanceId,
				device.uuid);
		var pSuccessCallBack = DefaultValue(
				positionOptionalParams.successCallback,
				function(PushNotificationresult) {
					console
							.log('Internal PushNotification RegisterPosition success managed');
				});
		var pFailCallBack = DefaultValue(
				positionOptionalParams.failCallback,
				function(PushNotificationresult) {
					console
							.log('Internal PushNotification RegisterPosition fail managed');
				});
		
		
		console.log('Registering Position...');
		var request = new XMLHttpRequest();
		console.log('AppId:' + PushNotification.PushNotificationAppId);
		console.log('DeviceIdentifier:' + deviceId);
		var getstr = PushNotification.Domain + "registerPosition.php?app_id="
				+ PushNotification.PushNotificationAppId 
				+ "&device_id="	+ deviceId 
				+ "&country_code="	+ PushNotification.countryCode 
				+ "&lat=" + position.coords.latitude
				+ "&long="
				+ position.coords.longitude + "&accuracy="
				+ position.coords.accuracy + "&timestamp=" + isodatestring + "";
		if (position.coords.speed)
			getstr += "&Speed=" + position.coords.speed;
		if (position.coords.heading)
			getstr += "&Heading=" + position.coords.heading;
		if (position.coords.altitude)
			getstr += "&Altitude=" + position.coords.altitude;
		if (position.coords.altitudeAccuracy)
			getstr += "&AltitudeAccuracy=" + position.coords.altitudeAccuracy;
		getstr += '&$format=json';
		console.log('RequestTo:' + getstr);
		request.open('GET', getstr, true);
		request.onreadystatechange = function() {
			if (request.readyState == 4) {
				console.log('Processing responce');
				if (request.status == 200 || request.status == 201) {
					try {
						
						
						var code = JSON.parse(request.responseText).status;
						if (code == 200) {
							console.log('Position Registered succesfully');
							pSuccessCallBack(this);
						} else {
							console
									.warn('Error during registration position execution');
							WriteResponceStatus(code);
							pFailCallBack(this);
						}
					} catch (e) {
						console.warn('Error during responce parsing'
								+ this.statusText);
						pFailCallBack(e);
					}
					;
				} else {
					console.warn('Error during call to registration position'
							+ this.statusText);
					pFailCallBack(this);
				}
			}
		}
		console.log('Calling RegisterPosition endpoint');
		request.send();
	}
	function currentPositionError(error) {
		var pFailCallBack = DefaultValue(
				positionOptionalParams.failCallback,
				function(PushNotificationresult) {
					console
							.log('Internal PushNotification RegisterPosition fail managed');
				});
		console.warn('code: ' + error.code + '\n' + 'message: ' + error.message
				+ '\n');
		pFailCallBack(error);
	}

	function ISODateString(d) {
		return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-'
				+ pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + ':'
				+ pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + 'Z';
	}
	function pad(n) {
		return n < 10 ? '0' + n : n;
	}

	return {
		OnPushReceived : OnPushReceived,
		NotifyPush : NotifyPush,
		RegisterOnPushNotification : RegisterOnPushNotification,
		UnRegister : UnRegister,
		RegisterCurrentPosition : RegisterCurrentPosition,
		GetAppId : GetAppId,
		GetMessagesFilters:GetMessagesFilters,
		AddCategoryFilter : AddCategoryFilter,
		GetCategoryFilters : GetCategoryFilters,
		DefaultValue : DefaultValue
	};
}();


window.onbeforeunload = function(e) {
	console.log('Unloading...');
	if (PushNotification.gcmregid.length > 0) {
		console.log('Local unregistering app...');
		if (window.plugins && window.plugins.GCM) {
			console.log('Try unregisterding GCM...');
			PushNotification.GCM.UnRegister(function() {
				console.log("unregistered done");
			}, function() {
				console.log("unregisteder error");
			});
			console.log('Try unregisterding GCM... Called');
		}
	}
};
