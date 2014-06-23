appool
======

The appool service manages npm packages. Packages can be uploaded via
HTTP POST requests. If a package is uploaded, it automatically gets
installed via npm. A list of all installed packages as well as
information about a specific package can be obtained with simple GET
requests. 

Appool can be installed with npm:

    git clone https://github.com/tequnix/appool
    cd appool
    npm install
    
The following table shows the REST Interface for appool:

HTTP Method | Path | Return type | Action
------------|------|-------------|--------
GET         | /apps | JSON | Returns an array with information about all installed apps.
GET         | /apps/:name | JSON | Returns information about the app from the service.
DELETE      | /apps/:name | 204, no content | Deletes the app from the service.
GET         | /apps/:name/download | x-tar | Returns the specified app as npm package (gzipped)
POST        | /apps/upload | JSON | Accepts npm packages, installs them and returns the path of the newly created resource.
