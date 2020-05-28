import * as crypto from  'crypto';
import {getLocalAuthorization} from './accessPropertiesReader';

//const id = process.env.API_ID;
//const key = process.env.KEY;

const headerPreFix = "VERACODE-HMAC-SHA-256";
const verStr = "vcode_request_version_1";

var url = '/v3/workspaces'
var host = 'api.veracode.com';

var hmac256 = (data:string|Int8Array, key:string|Buffer|Int8Array, format:"hex"|undefined) => {
    console.log('hmac256');
    console.log(typeof(key)+ ' - '+key);
    let hash = crypto.createHmac('sha256', key).update(data);
    if (format===undefined){
        return hash.digest();
    } else {
        // no format = Buffer / byte array
        return hash.digest(format);
    }
}

var getByteArray = (hex) => {
	var bytes = [];

	for(var i = 0; i < hex.length-1; i+=2){
	    bytes.push(parseInt(hex.substr(i, 2), 16));
	}

	// signed 8-bit integer array (byte array)
	return Int8Array.from(bytes);
}

const getCredentials = () => {
    return {
        API_ID: 'gg',
        KEY: 'gggggg'
    }
}

export function generateHeader (context,host:string, urlPpath:string, method:string) {
    context.log('generateHeader');
    // for cloud deployment - these should be the credentials
    let id = process.env.veracode_api_key_id;
    let secret = process.env.veracode_api_key_secret;

    // Replace with your own profile in local.settings.json for local debugging
    if (id === undefined || id.length==0){
        var authProfile = process.env.veracode_auth_profile;
        if (authProfile !== undefined && authProfile.length>0) {
            const credentials = getLocalAuthorization(authProfile);
            context.log(credentials);
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

