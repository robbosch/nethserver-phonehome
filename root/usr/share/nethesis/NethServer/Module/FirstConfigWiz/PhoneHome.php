<?php
namespace NethServer\Module\FirstConfigWiz;
/*
 * Copyright (C) 2015 Nethesis Srl
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Description of PhoneHome
 *
 * @author Davide Principi <davide.principi@nethesis.it>
 */
class PhoneHome extends \Nethgui\Controller\AbstractController
{

    public $wizardPosition = 100;

    public function initialize()
    {
        parent::initialize();
        $this->declareParameter('Status', \Nethgui\System\PlatformInterface::SERVICESTATUS, array('configuration', 'phone-home', 'status'));
    }

    public function prepareView(\Nethgui\View\ViewInterface $view)
    {
        parent::prepareView($view);
        $view['description'] = $view->translate('description', array('product' => $this->getPlatform()->getDatabase('configuration')->getProp('sysconfig', 'ProductName')));
    }

    protected function onParametersSaved($changes)
    {
        $this->getParent()->storeAction(array(
            'message' => array(
                'module' => $this->getIdentifier(),
                'id' => 'PhoneHome_Action',
                'args' => $this->parameters->getArrayCopy()
            ),
            'events' => array()
        ));
    }

    public function nextPath() {
        if ($this->getRequest()->hasParameter('skip') || $this->getRequest()->isMutation()) {
            $successor = $this->getParent()->getSuccessor($this);
            return $successor ? $successor->getIdentifier() : 'Review';
        }
        return parent::nextPath();
    }
}
