<?php

declare(strict_types=1);

namespace B13\Annotate\Hooks;

/*
 * This file is part of TYPO3 CMS-based extension "annotate" by b13.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 */


use B13\Annotate\Domain\Repository\CommentRepository;
use Symfony\Component\DependencyInjection\Attribute\Autoconfigure;
use TYPO3\CMS\Core\DataHandling\DataHandler;

#[Autoconfigure(public: true)]
class DatahandlerDeleteHook
{

    public function __construct(
        protected readonly CommentRepository $commentRepository
    ) {
    }

    public function processCmdmap_deleteAction(string $table, int $id, array $recordToDelete, bool $recordWasDeleted, DataHandler $dataHandler): void
    {
        $this->deleteAttachedComments($id, $table);
    }

    public function processCmdmap_discardAction(string $table, int $id, array $recordToDelete, bool $recordWasDeleted): void
    {
        $this->deleteAttachedComments($id, $table);
    }

    protected function deleteAttachedComments(int $recordId, string $table): void
    {
        $comments = $this->commentRepository->findByRecordUid($recordId, $table);
        foreach ($comments as $comment) {
            $this->commentRepository->resolveComment($comment);
            if ($table === 'pages') {
                $contentComments = $this->commentRepository->findAllCommentsForPage($recordId, 'tt_content');
                foreach ($contentComments as $contentComment) {
                    $this->commentRepository->resolveComment($contentComment);
                }
            }
        }
    }
}
