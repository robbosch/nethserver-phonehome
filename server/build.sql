CREATE TABLE IF NOT EXISTS `country_name_map` (
   `id` varchar(40) NOT NULL,
   `lat` varchar(15) NOT NULL,
   `lng` varchar(15) NOT NULL,
   `country_name` varchar(35) DEFAULT NULL,
   `code` varchar(2) NOT NULL,
   PRIMARY KEY (`id`) ) ENGINE=MyISAM DEFAULT CHARSET=latin1;
