<?php

/* @var $view Nethgui\Renderer\Xhtml */

include 'WizHeader.php';

echo sprintf("<div class='labeled-control wspreline'>%s</div>", htmlspecialchars($view['description']));

echo $view->radioButton('Status', 'enabled');
echo $view->radioButton('Status', 'disabled');

include 'WizFooter.php';