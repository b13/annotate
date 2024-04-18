<?php

declare(strict_types=1);

namespace B13\Annotate\Widget;

/*
 * This file is part of TYPO3 CMS-based extension "annotate" by b13.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 */

use B13\Annotate\Domain\Repository\CommentRepository;
use TYPO3\CMS\Core\Database\Connection;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Dashboard\Widgets\WidgetConfigurationInterface;
use TYPO3\CMS\Dashboard\Widgets\WidgetInterface;
use TYPO3\CMS\Fluid\View\StandaloneView;

class CommentsWidget implements WidgetInterface
{
    protected WidgetConfigurationInterface $configuration;
    protected StandaloneView $view;
    protected CommentRepository $commentRepository;

    public function __construct(WidgetConfigurationInterface $configuration, StandaloneView $view, CommentRepository $commentRepository)
    {
        $this->configuration = $configuration;
        $this->view = $view;
        $this->commentRepository = $commentRepository;
    }

    public function renderWidgetContent(): string
    {
        $this->view->setTemplatePathAndFilename('EXT:annotate/Resources/Private/Templates/Widget/Comments.html');
        $this->view->assignMultiple([
            'pages' => $this->getPagesWithComments(),
            'configuration' => $this->configuration,
        ]);
        return $this->view->render();
    }

    protected function getPagesWithComments(): array
    {
        $queryBuilder = GeneralUtility::makeInstance(ConnectionPool::class)->getQueryBuilderForTable('tx_internal_news');
        return $queryBuilder
            ->select('pages.uid', 'pages.title')
            ->add('select', 'COUNT(sys_comment.uid) AS commentCount', true)
            ->from('pages')
            ->innerJoin(
                'pages',
                'sys_comment',
                'sys_comment',
                $queryBuilder->expr()->eq('sys_comment.pid', 'pages.uid')
            )
            ->where(
                $queryBuilder->expr()->eq('sys_comment.isresolved', $queryBuilder->createNamedParameter(0, Connection::PARAM_INT)),
                $queryBuilder->expr()->eq('sys_comment.parentcomment', $queryBuilder->createNamedParameter(0, Connection::PARAM_INT)),
            )
            ->groupBy(
                'pages.uid', 'pages.title'
            )
            ->executeQuery()
            ->fetchAllAssociative();
    }

    public function getOptions(): array
    {
        return [];
    }
}
