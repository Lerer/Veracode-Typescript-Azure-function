import * as crypto from  'crypto';
import {getLocalAuthorization} from './accessPropertiesReader';
import {  Context } from "@azure/functions"

const headerPreFix = "VERACODE-HMAC-SHA-256";
const verStr = "vcode_request_version_1";

var hmac256 = (data:string|Int8Array, key:string|Buffer|Int8Array, format:"hex"|undefined) => {
    let hash = crypto.createHmac('sha256', key).update(data);
    if (format===undefined){
        return hash.digest();
    } else {
        // no format = Buffer / byte array
        return hash.digest(format);
    }
}

var getByteArray = (hex:string) => {
	var bytes = [];

	for(var i = 0; i < hex.length-1; i+=2){
	    bytes.push(parseInt(hex.substr(i, 2), 16));
	}

	// signed 8-bit integer array (byte array)
	return Int8Array.from(bytes);
}

/*
The generateHeader function require the presense of the id and secret which need to be generated in the platform:
- https://help.veracode.com/reader/LMv_dtSHyb7iIxAQznC~9w/3YtglKwBsC_tCpQpA4Axiw

When running in the Cloud, verify you setup environment variables:
- veracode_api_key_id
- veracode_api_key_secret

When running locally you need to make sure you update credentials file as per:
- https://help.veracode.com/reader/LMv_dtSHyb7iIxAQznC~9w/zm4hbaPkrXi02YmacwH3wQ

Following on that, you need to update the local setting file (local.settings.json) to include the profile you put the credentials into:
{
  "IsEncrypted": false|true,
  "Values": {
    "AzureWebJobsStorage": "......",
    "FUNCTIONS_WORKER_RUNTIME": "node",

    "veracode_auth_profile":"<Profile name>"
  }
}
note - if you are using this repo as a code example, you will need to update the function to read 
       the credential file profile id from a different place.
*/
export function generateHeader (context:Context,host:string, urlPpath:string, method:string) {
    context.log('generateHeader');
    // for cloud deployment - these should be the credentials
    let id = process.env.veracode_api_key_id;
    let secret = process.env.veracode_api_key_secret;

    // Replace with your own profile in local.settings.json
    if (id === undefined || id.length==0 || secret===undefined || secret.length==0){
        var authProfile = process.env.veracode_auth_profile;
        if (authProfile !== undefined && authProfile.length>0) {
            const credentials = getLocalAuthorization(authProfile);
            // context.log(credentials); - uncomment only for local debug
            id = credentials.API_ID;
            secret = credentials.SECRET;
        }
    }
    
    if (id === undefined || id.length==0){
        context.log.error('No credentials provided');
        return;
    }

	var data = `id=${id}&host=${host}&url=${urlPpath}&method=${method}`;
	var timestamp = (new Date().getTime()).toString();
	var nonce = crypto.randomBytes(16).toString("hex");

	// calculate signature
	var hashedNonce = hmac256(getByteArray(nonce), getByteArray(secret),undefined);
	var hashedTimestamp = hmac256(timestamp, hashedNonce,undefined);
	var hashedVerStr = hmac256(verStr, hashedTimestamp,undefined);
	var signature = hmac256(data, hashedVerStr, "hex");

	return `${headerPreFix} id=${id},ts=${timestamp},nonce=${nonce},sig=${signature}`;
}

