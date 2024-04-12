<?php

declare(strict_types=1);
namespace B13\Annotate\Domain\Factory;

/*
 * This file is part of TYPO3 CMS-based extension "annotate" by b13.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 */

use B13\Annotate\Domain\Model\Comment;
use B13\Annotate\Domain\Model\MissingDataException;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Core\Context\Context;
use TYPO3\CMS\Core\Utility\GeneralUtility;

class CommentFactory
{
    public function createFromRequest(ServerRequestInterface $request): Comment
    {
        $pageId = (int)($request->getParsedBody()['pid'] ?? 0);
        if (empty($pageId)) {
            throw new MissingDataException('PageId must not be empty', 1571153820);
        }

        $comment = $request->getParsedBody()['comment'] ?? '';
        if (empty($comment)) {
            throw new MissingDataException('Comment must not be empty', 1571153821);
        }

        $recordtable = $request->getParsedBody()['recordtable'] ?? '';
        if (empty($recordtable)) {
            throw new MissingDataException('Recordtable must not be empty', 1571153822);
        }

        $recorduid = (int)($request->getParsedBody()['recorduid'] ?? 0);
        if (empty($recorduid)) {
            throw new MissingDataException('Recorduid must not be empty', 1571153823);
        }

        $context = GeneralUtility::makeInstance(Context::class);
        $parentComment = (int)($request->getParsedBody()['parentcomment'] ?? 0);
        return new Comment(
            $pageId,
            $comment,
            $recordtable,
            $recorduid,
            $context->getPropertyFromAspect('date', 'full'),
            $context->getAspect('backend.user')->get('id'),
            $parentComment
        );
    }

    public function createFromDatabaseRow(array $record, ?Comment $parentComment = null): Comment
    {
        $comment = new Comment(
            (int)$record['pid'],
            (string)$record['explanation'],
            $record['recordtable'],
            (int)$record['recorduid'],
            new \DateTimeImmutable('@' . $record['createdon']),
            (int)$record['author'],
            (int)$record['parentcomment'],
            (int)$record['uid'],
            (bool)$record['isresolved'],
            (int)$record['assignedto'],
            $record['last_edit']
        );

        if ($parentComment) {
            $parentComment->addReply($comment);
        }

        return $comment;
    }

    public function createCommentForRecord(int $pageId, string $comment, int $recordId, string $recordTable): Comment
    {
        $context = GeneralUtility::makeInstance(Context::class);
        return new Comment(
            $pageId,
            $comment,
            $recordTable,
            $recordId,
            $context->getPropertyFromAspect('date', 'full'),
            $context->getAspect('backend.user')->get('id')
        );
    }
}
