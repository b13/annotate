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

use TYPO3\CMS\Backend\Controller\Event\RenderAdditionalContentToRecordListEvent;
use TYPO3\CMS\Core\Page\PageRenderer;

class RenderAdditionalContentToRecordList
{
    private PageRenderer $pageRenderer;

    public function __construct(PageRenderer $pageRenderer)
    {
        $this->pageRenderer = $pageRenderer;
    }

    public function __invoke(RenderAdditionalContentToRecordListEvent $event): void
    {
        if ($GLOBALS['BE_USER']->check('custom_options', 'tx_annotate:allow') === false) {
            return;
        }
        $id = (int)($event->getRequest()->getQueryParams()['id'] ?? 0);

        $this->pageRenderer->addCssFile('EXT:annotate/Resources/Public/Css/main.css');
        $this->pageRenderer->loadJavaScriptModule('@b13/annotate/main.js');

        $this->pageRenderer->loadJavaScriptModule('@b13/annotate/main.js');

        $event->addContentAbove(
            '<div id="bJS_annotate-comments" data-pid="' . $id . '" data-module-type="list" class="b_annotate-comments-page__container"><div id="bJS_annotate-comments-page__info" class="b_annotate-comments-page__info"></div></div>'
        );
    }
}
