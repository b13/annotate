<?php

defined('TYPO3') or die();

// Hook into the page modules
$GLOBALS['TYPO3_CONF_VARS']['SC_OPTIONS']['cms/layout/db_layout.php']['drawHeaderHook']['annotate'] =
    \B13\Annotate\Hooks\PageHook::class . '->renderInHeader';

$GLOBALS['TYPO3_CONF_VARS']['BE']['customPermOptions']['tx_annotate'] = [
    'header' => 'b13/annotate',
    'items' => [
        'allow' => [
            'Show comments',
        ],
    ],
];