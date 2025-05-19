<?php

declare(strict_types=1);

namespace B13\Annotate\Domain\Repository;

/*
 * This file is part of TYPO3 CMS-based extension "annotate" by b13.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 */

use B13\Annotate\Domain\Factory\CommentFactory;
use B13\Annotate\Domain\Model\Comment;
use Doctrine\DBAL\ParameterType;
use TYPO3\CMS\Core\Database\Connection;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Database\Query\QueryBuilder;
use TYPO3\CMS\Core\Utility\GeneralUtility;

class CommentRepository
{
    public function __construct(
        protected readonly CommentFactory $commentFactory
    ) {
    }

    /** @return Comment[] */
    public function findAllCommentsForPage(int $pageId, string $recordtable = ''): array
    {
        $queryBuilder = $this->createPreparedQueryBuilder();
        $queryBuilder->where(
            $queryBuilder->expr()->eq('pid', $queryBuilder->createNamedParameter($pageId, ParameterType::INTEGER))
        );
        if (!empty($recordtable)) {
            $queryBuilder->andWhere(
                $queryBuilder->expr()->eq('recordtable', $queryBuilder->createNamedParameter($recordtable))
            );
        }
        return $this->fetchComments($queryBuilder);
    }

    public function countAllCommentsForPage(int $pageId, string $recordtable = ''): int
    {
        $queryBuilder = GeneralUtility::makeInstance(ConnectionPool::class)
            ->getQueryBuilderForTable('sys_comment')
            ->count('*')
            ->from('sys_comment');
        $queryBuilder->where(
            $queryBuilder->expr()->eq('pid', $queryBuilder->createNamedParameter($pageId, ParameterType::INTEGER))
        );
        if (!empty($recordtable)) {
            $queryBuilder->andWhere(
                $queryBuilder->expr()->eq('recordtable', $queryBuilder->createNamedParameter($recordtable))
            );
        }
        return (int)($queryBuilder->executeQuery()->fetchOne());
    }

    /** @return Comment[] */
    public function findAllCommentsForRecordtable(string $recordtable): array
    {
        $queryBuilder = $this->createPreparedQueryBuilder();
        $queryBuilder->where(
            $queryBuilder->expr()->eq('recordtable', $queryBuilder->createNamedParameter($recordtable))
        );
        return $this->fetchComments($queryBuilder);
    }

    public function countByRecordUid(int $uid, string $recordtable = ''): int
    {
        $queryBuilder = GeneralUtility::makeInstance(ConnectionPool::class)
            ->getQueryBuilderForTable('sys_comment')
            ->count('*')
            ->from('sys_comment');
        $queryBuilder->where(
            $queryBuilder->expr()->eq('recorduid', $queryBuilder->createNamedParameter($uid, ParameterType::INTEGER)),
            $queryBuilder->expr()->eq('recordtable', $queryBuilder->createNamedParameter($recordtable))
        );
        return (int)($queryBuilder->executeQuery()->fetchOne());
    }

    public function findByUid(int $uid): ?Comment
    {
        $queryBuilder = $this->createPreparedQueryBuilder();
        $row = $queryBuilder
            ->where(
                $queryBuilder->expr()->eq('uid', $queryBuilder->createNamedParameter($uid, ParameterType::INTEGER))
            )
            ->executeQuery()
            ->fetchAssociative();

        if (empty($row)) {
            return null;
        }
        $parentComment = null;
        if ((int)$row['parentcomment']) {
            $parentComment = $this->findByUid((int)$row['parentcomment']);
        }
        return $this->commentFactory->createFromDatabaseRow($row, $parentComment);
    }

    /** @return Comment[] */
    public function findByRecordUid(int $uid, string $recordtable = ''): array
    {
        $queryBuilder = $this->createPreparedQueryBuilder();
        $queryBuilder->where(
            $queryBuilder->expr()->eq('recorduid', $queryBuilder->createNamedParameter($uid, ParameterType::INTEGER)),
            $queryBuilder->expr()->eq('recordtable', $queryBuilder->createNamedParameter($recordtable))
        );
        return $this->fetchComments($queryBuilder);
    }

    public function addComment(Comment $comment): void
    {
        $this->getConnection()->insert('sys_comment', $comment->forDatabase());
    }

    public function updateComment(Comment $comment): void
    {
        $this->getConnection()->update(
            'sys_comment',
            [
                'explanation' => $comment->getExplanation(),
                'last_edit' => time(),
            ],
            [
                'uid' => $comment->getUid(),
            ]
        );
    }

    /**
     * Mark a comment as resolved by setting the flag in the database.
     */
    public function resolveComment(Comment $comment): void
    {
        $this->getConnection()->update('sys_comment', ['isresolved' => 1], ['uid' => $comment->getUid()]);
        $this->getConnection()->update('sys_comment', ['isresolved' => 1], ['parentcomment' => $comment->getUid()]);
    }

    protected function createPreparedQueryBuilder(): QueryBuilder
    {
        return GeneralUtility::makeInstance(ConnectionPool::class)
            ->getQueryBuilderForTable('sys_comment')
            ->select('*')
            ->from('sys_comment')
            ->orderBy('pid')
            ->addOrderBy('parentcomment');
    }

    protected function getConnection(): Connection
    {
        return GeneralUtility::makeInstance(ConnectionPool::class)->getConnectionForTable('sys_comment');
    }

    /** @return Comment[] */
    protected function fetchComments(QueryBuilder $queryBuilder): array
    {
        $stmt = $queryBuilder->executeQuery();
        $comments = [];
        while ($row = $stmt->fetchAssociative()) {
            $parentComment = (int)$row['parentcomment'];
            if (!$parentComment) {
                $comment = $this->commentFactory->createFromDatabaseRow($row);
                $comments[$comment->getUid()] = $comment;
            } else {
                $parentComment = $comments[$parentComment];
                $this->commentFactory->createFromDatabaseRow($row, $parentComment);
            }
        }
        return $comments;
    }
}
