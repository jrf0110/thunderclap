(function() {
	"use strict"
	const {accountId,namespaceId,authEmail,authKey} = require("../keys.js"),
		getKeys = (prefix,limit=1000,cursor) => { 
			return fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/keys?limit=${limit}${cursor ? "&cursor="+cursor : ""}${prefix!=null ? "&prefix="+prefix : ""}`,
				{headers:{"X-Auth-Email":`${authEmail}`,"X-Auth-Key":`${authKey}`}})
				.then((result) => result.json())
		},
		methods = {
			clear: async function(prefix="") {
				let keys, cursor;
				do {
					keys = await this.keys(prefix,{cursor});
					cursor = keys.pop();
					for(const key of keys) {
						this.delete(key);
					}
				} while(keys.length>0 && cursor);
			},
			entries: async function(prefix="",{batchSize=1000,cursor}) {
				const {result,result_info} = await getKeys(prefix,batchSize,cursor),
					entries = [];
				for(const key of result) {
					const value = await this.get(key.name),
						entry = [key.name];
					if(value!==undefined) {
						entry.push(value);
					}
					if(key.expiration) {
						entry.push(key.expiration);
					}
					entries.push(entry);
				}
				entries.push(result_info.cursor);
				return entries;
			},
			hasKey: async function(key) {
				const {result} = await getKeys(key,100);
				return result[0].name===key;
			},
			keys: async function(prefix="",{extended,batchSize=1000,cursor}={}) {
				let {result,result_info} = await getKeys(prefix,batchSize,cursor);
				if(!extended) {
					// should these be secured?
					result = result.map((item) => item.name);
				}
				result.push(result_info.cursor);
				return result;
			},
			values:async function(prefix="",{batchSize=1000,cursor}) {
				const {result,result_info} = await getKeys(prefix,batchSize,cursor),
					values = [];
				for(const key of result) {
					const value = await this.get(key.name);
					if(value!==undefined) {
						values.push(value);
					}
				}
				values.push(result_info.cursor);
				return values;
			}
		};
	module.exports = (namespace) => {
		Object.assign(namespace,methods);
	}
}).call(this);