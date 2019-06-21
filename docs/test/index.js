const TESTDATE = new Date("2019-06-20T23:04:35.815Z");

let o1,
	o2;

describe("query",function() {
	/*it("put nested item",async function() {
		const object = await db.putItem({
			date: TESTDATE,
			name:"test",
			low:-1,
			middle:0,
			high:1,
			NaN: parseInt("a"),
			minusInfinity: -Infinity,
			plusInfinity: Infinity,
			flag:true,
			ssn:"555-55-5555",
			ip:"127.0.0.1",
			email: "someone@somewhere.com"});
		o1 = object; // save for deletion in final test
		expect(object.date.getTime()).equal(TESTDATE.getTime()); 
		expect(object.name).equal("test"); 
		expect(object.low).equal(-1);
		expect(object.middle).equal(0);
		expect(object.high).equal(1);
		expect(isNaN(object.NaN) && typeof(object.NaN)==="number").equal(true);
		expect(object.minusInfinity).equal(-Infinity);
		expect(object.plusInfinity).equal(Infinity);
		expect(object.flag).equal(true);
		expect(object.ssn).equal("555-55-5555");
		expect(object.ip).equal("127.0.0.1");
		expect(object.email).equal("someone@somewhere.com");
	}).timeout(10000);*/
	it("setItem primitive", async function() {
		const value = await db.setItem("test","test");
		expect(value).equal("test");
	});
	it("getItem primitive", async function() {
		const value = await db.getItem("test");
		expect(value).equal("test");
	});
	it("removeItem primitive", async function() {
		let value = await db.removeItem("test");
		expect(value).equal(undefined);
		value = await db.getItem("test");
		expect(value).equal(undefined);
	});
	it("securedTestWriteKey", async function() {
		let value = await db.setItem("securedTestWriteKey","test");
		expect(value).equal(undefined);
		value = await db.getItem("securedTestWriteKey");
		expect(value).equal(undefined);
	});
	it("securedTestReadKey", async function() {
		let value = await db.setItem("securedTestReadKey","test");
		expect(value).equal("test");
		value = await db.getItem("securedTestReadKey");
		expect(value).equal(undefined);
	});
	it("wild card key {$_:'test'}",async function() {
		const results = await db.query({$_:"test"});
		expect(typeof(results[0])).equal("object");
		expect(results[0].name).equal("test");
	}).timeout(3000);
	it("RegExp key {[/.*name/]:'test'}",async function() {
		const results = await db.query({[/.*name/]:"test"});
		expect(typeof(results[0])).equal("object");
		expect(results[0].name).equal("test");
	});
	it("$lt",async function() {
		const results = await db.query({low:{$lt:0}});
		expect(typeof(results[0])).equal("object");
		expect(results[0].low).equal(-1);
	}).timeout(2000);
	it("$lte",async function() {
		const results = await db.query({low:{$lte:-1}});
		expect(typeof(results[0])).equal("object");
		expect(results[0].low).equal(-1);
	});
	it("$eq",async function() {
		const results = await db.query({low:{$eq:-1}});
		expect(typeof(results[0])).equal("object");
		expect(results[0].low).equal(-1);
	});
	it("$eeq",async function() {
		const results = await db.query({low:{$eeq:-1}});
		expect(typeof(results[0])).equal("object");
		expect(results[0].low).equal(-1);
	});
	it("$gte",async function() {
		const results = await db.query({high:{$gte:1}});
		expect(typeof(results[0])).equal("object");
		expect(results[0].high).equal(1);
	});
	it("$gt",async function() {
		const results = await db.query({high:{$gt:0}});
		expect(typeof(results[0])).equal("object");
		expect(results[0].high).equal(1);
	});
	it("$neeq",async function() {
		const results = await db.query({low:{$neeq:0}});
		expect(typeof(results[0])).equal("object");
		expect(results[0].low).equal(-1);
	});
	it("$eq string",async function() {
		const results = await db.query({name:{$eq:"test"}});
		expect(typeof(results[0])).equal("object");
		expect(results[0].name).equal("test");
	});
	it("$eeq string",async function() {
		const results = await db.query({name:{$eeq:"test"}});
		expect(typeof(results[0])).equal("object");
		expect(results[0].name).equal("test");
	});
	it("$neq string",async function() {
		const results = await db.query({name:{$neq:"name"}});
		expect(typeof(results[0])).equal("object");
		expect(results[0].name).equal("test");
	});
	it("$between",async function()  {
		const results = await db.query({middle:{$between:[-1,1]}});
		expect(typeof(results[0])).equal("object");
		expect(results[0].middle).equal(0);
	});
	it("$between inclusive",async function()  {
		const results = await db.query({middle:{$between:[-1,0,true]}});
		expect(typeof(results[0])).equal("object");
		expect(results[0].middle).equal(0);
	});
	it("$outside higher",async function() {
		const results = await db.query({middle:{$outside:[-2,-1]}});
		expect(typeof(results[0])).equal("object");
		expect(results[0].middle).equal(0);
	});
	it("$outside lower",async function() {
		const results = await db.query({middle:{$outside:[1,2]}});
		expect(typeof(results[0])).equal("object");
		expect(results[0].middle).equal(0);
	});
	it("$echoes",async function() {
		const results = await db.query({name:{$echoes:"tesst"}});
		expect(typeof(results[0])).equal("object");
		expect(results[0].name).equal("test");
	});
	it("-Infinity",async function() {
		const results = await db.query({minusInfinity:-Infinity});
		expect(typeof(results[0])).equal("object");
		expect(results[0].minusInfinity).equal(-Infinity);
	});
	it("Infinity",async function() {
		const results = await db.query({plusInfinity:Infinity});
		expect(typeof(results[0])).equal("object");
		expect(results[0].plusInfinity).equal(Infinity);
	});
	it("NaN",async function() {
		const results = await db.query({NaN:{$isNaN:null}});
		expect(typeof(results[0])).equal("object");
		expect(typeof(results[0].NaN)==="number" && isNaN(results[0].NaN)).equal(true);
	});
	xit("$isArray",function(done) {
		let some = 0;
		db.query({favoriteNumbers:{$isArray:null}}).forEach(object => { 
			some++; 
			expect(object.favoriteNumbers.length).equal(4);
			})
			.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
	});
	it("$isEmail",async function() {
		const results = await db.query({email:{$isEmail:null}});
		expect(typeof(results[0])).equal("object");
		expect(results[0].email).equal("someone@somewhere.com");
	});
	it("$isEven",async function() {
		const results = await db.query({middle:{$isEven:null}});
		expect(typeof(results[0])).equal("object");
		expect(results[0].middle).equal(0);
	});
	it("$isIPAddress",async function() {
		const results = await db.query({ip:{$isIPAddress:null}});
		expect(typeof(results[0])).equal("object");
		expect(results[0].ip).equal("127.0.0.1");
	});
	it("$isOdd",async function() {
		const results = await db.query({low:{$isOdd:null}});
		expect(typeof(results[0])).equal("object");
		expect(results[0].low).equal(-1);
	});
	it("$isSSN",async function() {
		const results = await db.query({ssn:{$isSSN:null}});
		expect(typeof(results[0])).equal("object");
		expect(results[0].ssn).equal("555-55-5555");
	});
	it("$typeof",async function() {
		const results = await db.query({name:{$typeof:"string"}});
		expect(typeof(results[0])).equal("object");
		expect(typeof(results[0].name)).equal("string");
	});
	it("$in",async function() {
		const results = await db.query({name:{$in:["test"]}});
		expect(typeof(results[0])).equal("object");
		expect(typeof(results[0].name)).equal("string");
	});
	it("$nin",async function() {
		const results = await db.query({name:{$nin:["name"]}});
		expect(typeof(results[0])).equal("object");
		expect(typeof(results[0].name)).equal("string");
	});
	it("$instanceof",async function() {
		const results = await db.query({date:{$instanceof:"Date"}});
		expect(typeof(results[0])).equal("object");
		expect(new Date(results[0].date)).instanceof(Date);
	});
	xit("$matches",function(done) {
		let some = 0;
		db.query({name:{$matches:["joe"]}}).forEach(object => { some++; expect(object.name).equal("joe"); expect(object.age).equal(27);})
			.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
	});
	it("$and flat",async function() {
		const results = await db.query({middle:{$and:{$lt:1,$gt:-1}}});
		expect(typeof(results[0])).equal("object");
		expect(results[0].middle).equal(0);
	});
	it("$and nested",async function() {
		const results = await db.query({middle:{$and:{$lt:1,$and:{$gt:-1}}}});
		expect(typeof(results[0])).equal("object");
		expect(results[0].middle).equal(0);
	});
	it("$and array",async function() {
		const results = await db.query({middle:{$and:[{$lt:1},{$gt:-1}]}});
		expect(typeof(results[0])).equal("object");
		expect(results[0].middle).equal(0);
	});
	it("$or flat",async function() {
		const results = await db.query({middle:{$or:{$lt:0,$gt:-1}}});
		expect(typeof(results[0])).equal("object");
		expect(results[0].middle).equal(0);
	});
	it("$or nested",async function() {
		const results = await db.query({middle:{$or:{$lt:0,$or:{$gt:-1}}}});
		expect(typeof(results[0])).equal("object");
		expect(results[0].middle).equal(0);
	});
	it("$or array",async function() {
		const results = await db.query({middle:{$or:[{$lt:0},{$gt:-1}]}});
		expect(typeof(results[0])).equal("object");
		expect(results[0].middle).equal(0);
	});
	it("$xor flat",async function() {
		const results = await db.query({middle:{$xor:{$lt:1,$gt:1}}});
		expect(typeof(results[0])).equal("object");
		expect(results[0].middle).equal(0);
	});
	it("$xor nested",async function() {
		const results = await db.query({middle:{$xor:{$lt:1,$xor:{$gt:1}}}});
		expect(typeof(results[0])).equal("object");
		expect(results[0].middle).equal(0);
	});
	it("$xor array",async function() {
		const results = await db.query({middle:{$xor:[{$lt:1},{$gt:1}]}});
		expect(typeof(results[0])).equal("object");
		expect(results[0].middle).equal(0);
	});
	it("$not",async function() {
		const results = await db.query({name:{$not:{$eq:"name"}}});
		expect(typeof(results[0])).equal("object");
		expect(results[0].name).equal("test");
	});
	for(const key of ["date","day","fullYear","hours","milliseconds","minutes","month","seconds","time","UTCDate","UTCDay","UTCFullYear","UTCHours","UTCSeconds","UTCMilliseconds","UTCMinutes","UTCMonth","year"]) {
		const fname = `get${key[0].toUpperCase()}${key.substring(1)}`;
		it("$" + key, Function(`return async function() {
			const results = await db.query({date:{["$${key}"]:TESTDATE}});
			expect(typeof(results[0])).equal("object");
			expect(results[0].date["${fname}"]()).equal(TESTDATE["${fname}"]()); 
		}`)());
		it("$" + key + " from time", Function(`return async function() {
			const results = await db.query({date:{["$${key}"]:TESTDATE.getTime()}});
			expect(typeof(results[0])).equal("object");
			expect(results[0].date["${fname}"]()).equal(TESTDATE["${fname}"]()); 
		}`)());
	}
	it("double property",async function() {
		const results = await db.query({name:"test",middle:0});
		expect(typeof(results[0])).equal("object");
		expect(results[0].name).equal("test");
		expect(results[0].middle).equal(0);
	});
	it("partial",async function() {
		const results = await db.query({name:"test"},{partial:true});
		expect(typeof(results[0])).equal("object");
		expect(results[0].name).equal("test");
		expect(Object.keys(results[0]).length).equal(2);
	});
	xit("$search", function(done) {
		let some = 0;
		db.query({notes:{$search:"lover lives"}}).forEach(object => { some++; expect(object.notes.indexOf("loves")>=0).equal(true); })
		.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
	});
	xit("$search RegExp", function(done) {
		let some = 0;
		db.query({notes:{$search:/lives/}}).forEach(object => { some++; expect(object.notes.indexOf("loves")>=0).equal(true); })
		.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
	});
	xit("$search RegExp from string", function(done) {
		let some = 0;
		db.query({notes:{$search:"/lives/"}}).forEach(object => { some++; expect(object.notes.indexOf("loves")>=0).equal(true); })
		.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
	});
	xit("$search RegExp in string", function(done) {
		let some = 0;
		db.query({notes:{$search:"/lives/ loves"}}).forEach(object => { some++; expect(object.notes.indexOf("loves")>=0).equal(true); })
		.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
	});
	xit("$search expression in string", function(done) {
		let some = 0;
		db.query({notes:{$search:`{$eq:"loves"}`}}).forEach(object => { some++; expect(object.notes.indexOf("loves")>=0).equal(true); })
		.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
	});
	xit("join",async function() {
		const results = await db.join({name:{$neq:null}},{name:{$neq:null}},([o1,o2]) => o1.name===o2.name);
		expect(results.length).equal(1);
	});
	xit("delete",async function() {
		await db.removeItem(o1);
		const results = await db.query({name:"test"});
		expect(results.length).equal(0);
	});
	it("get User",async function() {
		const results = await db.query({userName:username});
		expect(results.length).equal(1);
		expect(results[0]).instanceof(db.ctors["User"]);
		expect(results[0].userName).equal(username);
	});
	it("get Schema",async function() {
		const schema = await db.getSchema("User");
		expect(schema).instanceof(db.ctors["Schema"]);
		expect(schema["#"]).equal("Schema@User");
	});
	it("fail Schema validation", async function() {
		const schema = await db.getSchema("User"),
			errors = await schema.validate({"#":"User@1234"},db);
		expect(errors.length>=1).equal(true);
	});
});



		
		



