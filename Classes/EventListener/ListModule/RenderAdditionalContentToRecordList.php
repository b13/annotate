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

use B13\Annotate\Hooks\Loader;
use TYPO3\CMS\Recordlist\Event\RenderAdditionalContentToRecordListEvent;

class RenderAdditionalContentToRecordList
{
    protected Loader $loader;
    public function __construct(Loader $loader)
    {
        $this->loader = $loader;
    }

    public function __invoke(RenderAdditionalContentToRecordListEvent $event): void
    {
        if ($event->getRequest()->getQueryParams()['id']) {
            $this->loader->add((int)$event->getRequest()->getQueryParams()['id']);
        }
        $event->addContentAbove(
            '
<div id="bJS_annotate-comments" data-module-type="list" class="b_annotate-comments-page__container">
    <div id="bJS_annotate-comments-page__info" class="b_annotate-comments-page__info"></div>
</div>'
        );
    }
}
