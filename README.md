# thunderdb

ThunderDB is an indexed JSON database designed specifically for Cloudflare. It runs on top of the Cloudflare KV store. 
Its query language, JOQULAR (JavaScript Object Query Language), is similar to, but more extensive than, the query language
associated with MongoDB.

Like MongoDB, ThunderDB is open-sourced under the Server Side Public License. This means licencees are free to use and 
modify the code for internal applications or applications that are not primarily a means of providing ThunderDB as a 
hosted service. In order to provide ThunderDB as a hosted service you must either secure a commercial license from 
AnyWhichWay or make all your source code available, including the source of non-derivative works that support the 
monitoring and operation of ThunderDB as a service.

# Important Alpha Notes

ThunderDB is currently early beta grade because:

1) Workers KV from Cloudflare is still in beta

2) There are no security or authentication measures in place

## Installation and Deployment

Clone the repository https://www.github.com/anywhichway/thunderdb.

Run `npm install`.

If you wish to modify ThunderDB, it is also strongly recommended you subscribe to the Cloudflare Argo tunneling service 
on the domain where you wish to use ThunderDB.

When ThunderDB is running in production, it will be available at `thunderdb.<your-domain>`. When it is running in 
development mode, it will be available at `<dev-host-prefix>-thunderdb.<your-domain>`.

Create a root CNAME alias on your domain called `thunderdb` using the Cloudflare DNS control panel.

Create two Cloudflare Workers KV namespaces using the Cloudflare Workders control panel. One of the namespaces will 
be for your production data the other will be for development. By convention the following name forms are recommended 
so that the names parrallel the names of scripts generated by the ThunderDB script `thunderclap`.

development: `<devHost>-thunderdb-<primaryHostName>-<com|org|...>`

production: `thunderdb--<primaryHostName>-<com|org|...>`

You will need to populate a file `thunderclap.json` with many of your Cloudflare ids or keys. Copy the file 
`thunderclap.template.json` to `thunderclap.json` and replace the placeholder values.

## Production Deployment

You can use ThunderDB without making any modifications by setting the `mode` in `thunderclap.json` to `production`
and running `npm run thunderclap`. This will deploy the ThunderDB worker and a route. 

You will then need to place the file `db.json` at the root of your web servers public directory and `thunderdb.js` 
in your normal JavaScript resources directory. For convenience, `db.json` and `thunderdb.js` are located in the `docs` 
subdirectory of the repository so you can host them using GitHub Pages if you wish.

## Development Deployment

If the 'mode' in 'thunderclap.json` is set to `development`, then in addition to deploying the worker script to
`<devHost>-thunderdb-<primaryHostName>-<com|org|...>` with a route and a local web server is started with an Argo tunnel 
through `<dev-host-prefix>-thunderdb.<your-domain>`.

## Smoke Test Deployment

If the 'mode' in 'thunderclap.json` is set to `smoke`, then the worker script is deployed to production at 
`thunderdb--<primaryHostName>-<com|org|...>` with a route and a local web server is started with an Argo tunnel through 
`smoke-thunderdb.<your-domain>`. Any data modifications will will be against your production KV store.

# Data Manipulation

## JavaScript Client

setItem

putItem

getItem

removeItem

match

## URL Requests 







