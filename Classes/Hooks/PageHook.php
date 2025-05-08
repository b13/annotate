<?php

declare(strict_types=1);
namespace B13\Annotate\Hooks;

/*
 * This file is part of TYPO3 CMS-based extension "annotate" by b13.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 */

use TYPO3\CMS\Backend\Controller\PageLayoutController;

class PageHook
{
    protected Loader $loader;

    public function __construct(Loader $loader)
    {
        $this->loader = $loader;
    }

    public function renderInHeader(array $params, PageLayoutController $controller): string
    {
        if ($GLOBALS['BE_USER']->check('custom_options', 'tx_annotate:allow') === false) {
            return '';
        }
        if ($controller->id) {
            $this->loader->add((int)$controller->id);
        }

        return '<div id="bJS_annotate-comments" data-module-type="page" class="b_annotate-comments-page__container"><div id="bJS_annotate-comments-page__info" class="b_annotate-comments-page__info"></div></div>';
    }
}
