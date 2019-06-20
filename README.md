# thunderclap

Thunderclap is an indexed JSON database designed specifically for Cloudflare. It runs on top of the Cloudflare KV store. 
Its query language, [JOQULAR](https://medium.com/@anywhichway/joqular-high-powered-javascript-pattern-matching-273a0d77eab5) (JavaScript Object Query Language), is similar to, but more extensive than, the query language
associated with MongoDB.

Thunderclap also includes role based access control mechanisms and schema or schemaless operation.

Like MongoDB, Thunderclap is open-sourced under the Server Side Public License. This means licencees are free to use and 
modify the code for internal applications or applications that are not primarily a means of providing Thunderclap as a 
hosted service. In order to provide Thunderclap as a hosted service you must either secure a commercial license from 
AnyWhichWay or make all your source code available, including the source of non-derivative works that support the 
monitoring and operation of Thunderclap as a service.

# Important Notes

Thunderclap is currently in ALPHA because:

1) Workers KV from Cloudflare is still in beta

2) Security measures have not yet been vetted by a third party

3) Functional testing has been limited

4) Load and stress testing has not been started

5) The source code could do with a lot more documentation

6) Project structure does not currently have a clean separation between what people might want to change
for their own use vs submit as a pull request. In general changes to file in the `src` directory are
candidates for pull requests and with the exception of this README those outside are not.

## Installation and Deployment

Clone the repository https://www.github.com/anywhichway/thunderclap.

Run `npm install`.

### Production

When Thunderclap is running in production, it will be available at `thunderclap.<your-domain>`. When it is running in 
development mode, it will be available at `<dev-host-prefix>-thunderclap.<your-domain>`.

You can deploy and use Thunderclap immediately after creating and populating a `thunderclap.json` configuration file
and establishing a CNAME alias `thunderclap` in the Cloudflare DNS control panel. This can just point to your root, 
you do not need a distinct IP address, Cloudflare's smart routers will send requests to the Thunderclap workers.

Create a root CNAME alias on your domain called `thunderclap` using the Cloudflare DNS control panel.

Create a Cloudflare Workers KV namespace using the Cloudflare Workders control panel. By convention the following 
name form is recommended so that the name parrallels the names of scripts generated by the Thunderclap script `thunderclap`.

`thunderclap-<primaryHostName>-<com|org|...>`

e.g. `thunderclap-mydomain-com` is the KV namespace and script name associated with `thunderclap.mydomain.com`

You will need to populate a file `thunderclap.json` with many of your Cloudflare ids or keys. Copy the file 
`thunderclap.template.json` to `thunderclap.json` and replace the placeholder values. This will contain secret keys,
so you may want to move it out of your project directory to avoid having it checked-in. The `thunderclap` script in
`webpack.config.js` assumes the file in up one level in the directory tree.

You will then need to place the file `db.json` at the root of your web server's public directory and `thunderclap.js` 
in your normal JavaScript resources directory. For convenience, `db.json` and `thunderclap.js` are located in the `docs` 
subdirectory of the repository so you can host them using GitHub Pages if you wish.

You can use Thunderclap without making any modifications by setting the `mode` in `thunderclap.json` to `production`
and running `npm run thunderclap`. This will deploy the Thunderclap worker and a route. 

### Development

If you wish to modify Thunderclap, you must subscribe to the Cloudflare Argo tunneling service on the domain where 
you wish to use Thunderclap.

Create a Cloudflare Workers KV namespace using the Cloudflare Workders control panel. By convention the following 
name form is recommended so that the name parrallels the names of scripts generated by the Thunderclap script `thunderclap`.

`<devHost>-thunderclap-<primaryHostName>-<com|org|...>`

e.g. `myname-thunderclap-mydomain-com` is the KV namespace and script name associated with `myname-thunderclap.mydomain.com`

You do not need a CNAME record for your dev host, Argo manages this for you.

If the 'mode' in 'thunderclap.json` is set to `development`, then in addition to deploying the worker script to
`<devHost>-thunderclap-<primaryHostName>-<com|org|...>` with a route, a local web server is started with an Argo tunnel 
to access `<dev-host-prefix>-thunderclap.<your-domain>` via your web browser.

When in dev mode files are watched by webpack and any changes cause a re-bundling and deployment of 
the worker script to Cloudflare.

# Data Manipulation

Data in Thunderclap can be manipulated using a JavaScript client or CURL.

## JavaScript Client

```
<script src="thunderclap.js"></script>
<script>
const endpoint = "https://thunderclap.mydomain.com/db.json",
	username = "<get from somewhere>",
	password = "<get from somewhere>",
	db = new Thunderclap({endpoint,user:{username,password}});
</script>
```

`User async createUser(string userName,string password)` - creates a user. The password is stored as an SHA-256 hash and salt.

`any async setItem(string key,any value)` - sets the `key` to `value`. If the `value` is an object it is NOT indexed.

`any async putItem(object value)` - adds a unique id on property "#", indexes the object and stores it with `setItem` 
using the id as the key.

`any async getItem(string key)` - gets the value at `key`. Returns `undefined` if no value exists.

`undefined async removeItem(string|object keyOrObject) - removes the keyOrObject. If the argument is an indexed object 
or a key that resolves to an indexed object, the object is removed from the index. 

`async query(object JOQULARExpression)` - uses the index to find matching objects. There are a lot of examples in the unit
test `file docs/test/index.js`.


## URL Requests 

To be written

# Security

The Thunderclap security mechanisms support the application of role based read and write access rules at the object, 
property and key level. 

If a user is not authorized read access to an object or key value, it will not be returned. If a user is not 
authorized access to a particular property, the property will be stripped from the object before the
object is returned. Additionaly, a query for an object using properties to which a user does not have access
will automatically drop the properties from the selection process to prevent data leakage through inference.

If a user is not authorized write access to specific properties on an indexed object, update attempts will 
fall back to partial updates on just those properties for which write access is allowed. If write access to a
key or an entire object is not allowed, the write will simply fail.

At the moment, by default, all keys, object, and properties are available for read and write unless specifically
controlled in the `acl.js` file in the root of the Thunderclap repository. A future release will support defaulting
to prevent read and write unless specifically permitted.

See the file `acl.js` for more detail.

Roles can also be established in a tree that is automatically applied at runtime. See the file `roles.js`.

# Schema

To be written.

# History and Roadmap

Many of the concepts in Thunderclap were first explored in ReasonDB. ReasonDB development has been suspended for now, 
but many features found in ReasonDB will make their way into Thunderclap if interest in shown in the software. This
includes the addition of graph queries a la GunDB, full-text indexing, and joins.




