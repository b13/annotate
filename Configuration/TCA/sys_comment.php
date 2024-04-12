<?php

return [
    'ctrl' => [
        'title' => 'Comment',
        'label' => 'explanation',
        'crdate' => 'createdon',
        'cruser_id' => 'author',
        'delete' => 'isresolved',
        'default_sortby' => 'createdon DESC',
        'searchFields' => 'explanation',
        'hideTable' => true,
        'rootLevel' => -1,
        'iconfile' => 'EXT:annotate/Resources/Public/Icons/Extension.png',
    ],
    'types' => [
        1 => [
            'showitem' => 'explanation',
        ],
    ],
    'columns' => [
        'explanation' => [
            'label' => 'Comment',
            'config' => [
                'type' => 'text',
            ],
        ],
        'recorduid' => [
            'label' => 'Added to record',
            'config' => [
                'type' => 'passthrough',
            ],
        ],
        'recordtable' => [
            'label' => 'Added to table',
            'config' => [
                'type' => 'passthrough',
            ],
        ],
        'last_edit' => [
            'label' => 'Last Edit',
            'config' => [
                'type' => 'passthrough',
            ],
        ],
        'parentcomment' => [
            'label' => 'Parent comment',
            'config' => [
                'type' => 'group',
                'allowed' => 'sys_comment',
                'max' => 1,
                'min' => 0,
            ],
        ],
        'assignedto' => [
            'label' => 'Assigned to',
            'config' => [
                'type' => 'group',
                'allowed' => 'be_users',
                'max' => 1,
                'min' => 0,
            ],
        ],
    ],
];
