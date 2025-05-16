<?php

declare(strict_types=1);

namespace B13\Annotate\EventListener\PageModule;

/*
 * This file is part of TYPO3 CMS-based extension "annotate" by b13.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 */

use B13\Annotate\Service\PermissionService;
use TYPO3\CMS\Backend\Controller\Event\ModifyPageLayoutContentEvent;
use TYPO3\CMS\Core\Page\PageRenderer;

class ModifyPageLayoutContent
{
    public function __construct(
        private readonly PageRenderer $pageRenderer,
        private readonly PermissionService $permissionService
    ) {
    }

    public function __invoke(ModifyPageLayoutContentEvent $event): void
    {
        if (!$this->permissionService->isAllowed()) {
            return;
        }
        $id = (int)($event->getRequest()->getQueryParams()['id'] ?? 0);

        $this->pageRenderer->addCssFile('EXT:annotate/Resources/Public/Css/main.css');
        $this->pageRenderer->loadJavaScriptModule('@b13/annotate/main.js');

        $event->addHeaderContent(
            '<div id="bJS_annotate-comments" data-pid="' . $id . '" data-module-type="page" class="b_annotate-comments-page__container"><div id="bJS_annotate-comments-page__info" class="b_annotate-comments-page__info"></div></div>'
        );
    }
}
