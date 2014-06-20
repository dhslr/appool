appool
======

The appool service manages npm packages. Packages can be uploaded via
HTTP POST requests. If a package is uploaded, it automatically gets
installed via npm. A list of all installed packages as well as
information about a specific package can be obtained with simple GET
requests. 

Appool can be installed with npm:

    git clone https://github.com/tequnix/appool
    cd berry
    npm install
