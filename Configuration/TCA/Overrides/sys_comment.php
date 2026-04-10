<?php

if ((new \TYPO3\CMS\Core\Information\Typo3Version())->getMajorVersion() < 14) {
    $GLOBALS['TCA']['sys_comment']['ctrl']['searchFields'] = 'explanation';
}