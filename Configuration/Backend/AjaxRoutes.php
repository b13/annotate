<?php

return [
    'annotate_add_comment' => [
        'path' => '/comment/add',
        'target' => \B13\Annotate\Controller\AnnotationController::class . '::addCommentAction',
    ],
    'annotate_update_comment' => [
        'path' => '/comment/update',
        'target' => \B13\Annotate\Controller\AnnotationController::class . '::updateCommentAction',
    ],
    'annotate_resolve_comment' => [
        'path' => '/comment/resolve',
        'target' => \B13\Annotate\Controller\AnnotationController::class . '::resolveCommentAction',
    ],
    'annotate_get_comments' => [
        'path' => '/comment/get',
        'target' => \B13\Annotate\Controller\AnnotationController::class . '::getCommentsForPageAction',
    ],
    'annotate_get_comments_records' => [
        'path' => '/comment/get/records',
        'target' => \B13\Annotate\Controller\AnnotationController::class . '::getCommentsForRecordsAction',
    ],
    'annotate_assign_comment' => [
        'path' => '/comment/assign',
        'target' => \B13\Annotate\Controller\AnnotationController::class . '::assignCommentAction',
    ],
];
