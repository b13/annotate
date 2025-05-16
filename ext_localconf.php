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