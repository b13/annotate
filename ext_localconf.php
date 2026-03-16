<?php

defined('TYPO3') or die();

$GLOBALS['TYPO3_CONF_VARS']['BE']['customPermOptions']['tx_annotate'] = [
    'header' => 'b13/annotate',
    'items' => [
        'allow' => [
            'Show comments',
        ],
    ],
];
$GLOBALS['TYPO3_CONF_VARS']['SC_OPTIONS']['t3lib/class.t3lib_tcemain.php']['processCmdmapClass']['tx_annotage'] = \B13\Annotate\Hooks\DatahandlerDeleteHook::class;
