<?php

declare(strict_types=1);

namespace B13\Annotate\EventListener\ListModule;

/*
 * This file is part of TYPO3 CMS-based extension "annotate" by b13.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 */

use TYPO3\CMS\Backend\RecordList\Event\ModifyRecordListRecordActionsEvent;
use TYPO3\CMS\Core\Imaging\Icon;
use TYPO3\CMS\Core\Imaging\IconFactory;

class ModifyRecordListRecordActions
{
    private IconFactory $iconFactory;

    public function __construct(IconFactory $iconFactory)
    {
        $this->iconFactory = $iconFactory;
    }

    public function __invoke(ModifyRecordListRecordActionsEvent $event): void
    {
        if (
            $GLOBALS['BE_USER']->check('custom_options', 'tx_annotate:allow') === false ||
            ($event->getTable() !== 'pages' && $event->getTable() !== 'tt_content')
        ) {
            return;
        }

        $action = '<a
            class="bJS_annotate-list-module__btn-container-' . $event->getTable() . ' b_annotate-list-module__btn-container btn btn-default"
            data-table="' . $event->getTable() . '"
            data-uid="' . ($event->getRecord()['uid'] ?? 0) . '"
        ></a>';

        $event->setAction(
            $action,
            'annotate',
            'primary',
            '',
            'delete'
        );
    }
}
