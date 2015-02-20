package com.nhvu.cordova;

import java.util.Locale;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.core.GlobalizationError;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;



public class CountryPlugin extends CordovaPlugin {
	 public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
	        JSONObject obj = new JSONObject();
		 if(action.equals("getLocaleName")){
			 try {
				obj = getLocaleName();
			} catch (GlobalizationError e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
	        }
         	callbackContext.success(obj);
	        return true;
	    }
	 
	 
	 
	 private JSONObject getLocaleName() throws GlobalizationError{
	        JSONObject obj = new JSONObject();
	        try{
	            obj.put("value", toBcp47Language(Locale.getDefault()));
	            return obj;
	        }catch(Exception e){
	            throw new GlobalizationError(GlobalizationError.UNKNOWN_ERROR);
	        }
	    }
	 
	 private String toBcp47Language(Locale loc){
	        final char SEP = '-';       // we will use a dash as per BCP 47
	        String language = loc.getLanguage();
	        String region = loc.getCountry();
	        String variant = loc.getVariant();

	        // special case for Norwegian Nynorsk since "NY" cannot be a variant as per BCP 47
	        // this goes before the string matching since "NY" wont pass the variant checks
	        if( language.equals("no") && region.equals("NO") && variant.equals("NY")){
	            language = "nn";
	            region = "NO";
	            variant = "";
	        }

	        if( language.isEmpty() || !language.matches("\\p{Alpha}{2,8}")){
	            language = "und";       // Follow the Locale#toLanguageTag() implementation 
	                                    // which says to return "und" for Undetermined
	        }else if(language.equals("iw")){
	            language = "he";        // correct deprecated "Hebrew"
	        }else if(language.equals("in")){
	            language = "id";        // correct deprecated "Indonesian"
	        }else if(language.equals("ji")){
	            language = "yi";        // correct deprecated "Yiddish"
	        }

	        // ensure valid country code, if not well formed, it's omitted
	        if (!region.matches("\\p{Alpha}{2}|\\p{Digit}{3}")) {
	            region = "";
	        }

	         // variant subtags that begin with a letter must be at least 5 characters long
	        if (!variant.matches("\\p{Alnum}{5,8}|\\p{Digit}\\p{Alnum}{3}")) {
	            variant = "";
	        }

	        StringBuilder bcp47Tag = new StringBuilder(language);
	        if (!region.isEmpty()) {
	            bcp47Tag.append(SEP).append(region);
	        }
	        if (!variant.isEmpty()) {
	             bcp47Tag.append(SEP).append(variant);
	        }

	        return bcp47Tag.toString();
	    }
}
