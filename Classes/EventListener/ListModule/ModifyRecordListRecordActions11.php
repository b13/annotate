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

use B13\Annotate\Service\PermissionService;
use TYPO3\CMS\Core\Imaging\Icon;
use TYPO3\CMS\Core\Imaging\IconFactory;
use TYPO3\CMS\Recordlist\Event\ModifyRecordListRecordActionsEvent;

/**
 * @extensionScannerIgnoreFile
 */
class ModifyRecordListRecordActions11
{
    private IconFactory $iconFactory;
    private PermissionService $permissionService;

    public function __construct(IconFactory $iconFactory, PermissionService $permissionService)
    {
        $this->iconFactory = $iconFactory;
        $this->permissionService = $permissionService;
    }

    public function __invoke(ModifyRecordListRecordActionsEvent $event): void
    {
        if (
            !$this->permissionService->isAllowed() ||
            ($event->getTable() !== 'pages' && $event->getTable() !== 'tt_content')
        ) {
            return;
        }
        $action = '<div class="bJS_annotate-list-module__btn-container-' . $event->getTable() . ' b_annotate-list-module__btn-container">
                    <a class="btn btn-default bJS_annotate-open-comments" data-table="' . $event->getTable() . '" data-uid="' . ($event->getRecord()['uid'] ?? 0) . '" href="#">' .
            $this->iconFactory->getIcon('actions-comment', Icon::SIZE_SMALL)->render() .
            '</a>
                </div>';

        $event->setAction(
            $action,
            'annotate',
            'primary',
            '',
            'delete'
        );
    }
}
