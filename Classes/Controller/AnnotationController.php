<?php

declare(strict_types=1);

namespace B13\Annotate\Controller;

/*
 * This file is part of TYPO3 CMS-based extension "annotate" by b13.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 */

use B13\Annotate\Domain\Factory\CommentFactory;
use B13\Annotate\Domain\Model\Comment;
use B13\Annotate\Domain\Model\MissingDataException;
use B13\Annotate\Domain\Repository\CommentRepository;
use B13\Annotate\Event\CommentHasBeenCreatedEvent;
use B13\Annotate\Event\CommentHasBeenResolvedEvent;
use Psr\EventDispatcher\EventDispatcherInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Core\Http\JsonResponse;

class AnnotationController
{
    public function __construct(
        protected readonly CommentRepository $commentRepository,
        protected readonly CommentFactory $commentFactory,
        private readonly EventDispatcherInterface $eventDispatcher
    ) {
    }

    public function getCommentsForPageAction(ServerRequestInterface $request): ResponseInterface
    {
        $pageId = (int)($request->getQueryParams()['pid'] ?? null);
        $recordtable = (string)($request->getQueryParams()['recordtable'] ?? null);
        $recorduid = (int)($request->getQueryParams()['recorduid'] ?? null);
        if ($recorduid === 0 && $pageId === 0) {
            return new JsonResponse(['error' => 'Bad request'], 400);
        }
        $comments = $recorduid ?
            $this->commentRepository->findByRecordUid($recorduid, $recordtable) :
            $this->commentRepository->findAllCommentsForPage($pageId, $recordtable);
        return new JsonResponse(['pageId' => $pageId, 'comments' => $comments]);
    }

    public function getCommentsForRecordsAction(ServerRequestInterface $request): ResponseInterface
    {
        $recordtable = (string)($request->getQueryParams()['recordtable'] ?? null);

        if (empty($recordtable)) {
            return new JsonResponse(['error' => 'no recordtable given'], 400);
        }

        $comments = $this->commentRepository->findAllCommentsForRecordtable($recordtable);
        return new JsonResponse(['comments' => $comments]);
    }

    public function addCommentAction(ServerRequestInterface $request): ResponseInterface
    {
        try {
            $comment = $this->commentFactory->createFromRequest($request);
        } catch (MissingDataException $e) {
            return new JsonResponse(
                [
                    'error' => $e->getMessage(),
                ],
                400
            );
        }
        $this->commentRepository->addComment($comment);
        $this->eventDispatcher->dispatch(new CommentHasBeenCreatedEvent($comment, $request));
        return new JsonResponse(['success' => true]);
    }

    public function updateCommentAction(ServerRequestInterface $request): ResponseInterface
    {
        $commentId = (int)($request->getParsedBody()['comment'] ?? 0);
        $comment = $this->commentRepository->findByUid($commentId);
        if ($comment instanceof Comment) {
            $commentText = $request->getParsedBody()['commentText'] ?? '';
            $comment->setExplanation($commentText);
            $this->commentRepository->updateComment($comment);
            return new JsonResponse(['success' => true]);
        }
        return new JsonResponse(['error' => 'comment not found'], 400);
    }

    public function resolveCommentAction(ServerRequestInterface $request): ResponseInterface
    {
        $commentId = (int)($request->getQueryParams()['comment'] ?? 0);
        $comment = $this->commentRepository->findByUid($commentId);
        if ($comment instanceof Comment) {
            $this->commentRepository->resolveComment($comment);
            $this->eventDispatcher->dispatch(new CommentHasBeenResolvedEvent($comment, $request));
            return new JsonResponse(['success' => true]);
        }
        return new JsonResponse(['error' => 'comment not found'], 400);
    }
}
