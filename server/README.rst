# Phone-home server

Requires PHP 5.X.

Originally the server was hosted at `http://www.nethserver.org/phone-home` then has been moved to `https://phonehome.nethsever.org`.
To handle the transition, use the following `.htaccess` file:

```
RewriteEngine on
RewriteRule  ^phone-home/(.*)$    /$1    [NC,L]
```
