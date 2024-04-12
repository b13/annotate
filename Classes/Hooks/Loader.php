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

use TYPO3\CMS\Core\Page\PageRenderer;
use TYPO3\CMS\Core\SingletonInterface;

class Loader implements SingletonInterface
{
    protected bool $isLoaded = false;
    private PageRenderer $pageRenderer;

    public function __construct(PageRenderer $pageRenderer)
    {
        $this->pageRenderer = $pageRenderer;
    }

    public function add(int $id): void
    {
        if ($this->isLoaded) {
            return;
        }
        $this->pageRenderer->addCssFile('EXT:annotate/Resources/Public/Css/main.css');
        $this->pageRenderer->loadRequireJsModule('TYPO3/CMS/Annotate/Main', 'function(AnnotationContainer) {
            AnnotationContainer.setPid(' . $id . ');
            AnnotationContainer.start();
        }');
        $this->isLoaded = true;
    }
}
