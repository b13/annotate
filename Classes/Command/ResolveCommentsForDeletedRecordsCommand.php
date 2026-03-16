<?php

declare(strict_types=1);

namespace B13\Annotate\Command;

/*
 * This file is part of TYPO3 CMS-based extension "annotate" by b13.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 */

use B13\Annotate\Domain\Repository\CommentRepository;
use Doctrine\DBAL\ParameterType;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use TYPO3\CMS\Core\Database\ConnectionPool;


#[AsCommand(
    name: 'tx-annotate:resolve-comments-for-deleted-records'
)]
class ResolveCommentsForDeletedRecordsCommand extends Command
{
    public function __construct(protected readonly CommentRepository $commentRepository, protected readonly ConnectionPool $connectionPool, ?string $name = null)
    {
        parent::__construct($name);
    }

    public function execute(InputInterface $input, OutputInterface $output): int
    {
        $comments = $this->commentRepository->findAllUnresolved();
        $cnt = 0;
        foreach ($comments as $comment) {
            if (!in_array($comment->getRecordtable(), ['pages', 'tt_content'], true)) {
                continue;
            }
            if ($this->isRecordDeleted($comment->getRecorduid(), $comment->getRecordtable())) {
                $this->commentRepository->resolveComment($comment);
                $cnt++;
            }
            // check page exists
            if ($this->isRecordDeleted($comment->getPid(), 'pages')) {
                $this->commentRepository->resolveComment($comment);
                $cnt++;
            }
        }
        $output->writeln('resolved ' . $cnt . ' comments of deleted records');
        return Command::SUCCESS;
    }

    protected function isRecordDeleted(int $id, string $table): bool
    {
        $queryBuilder = $this->connectionPool->getQueryBuilderForTable($table);
        $queryBuilder->getRestrictions()->removeAll();
        $row = $queryBuilder->select('uid', 'deleted')
            ->from($table)
            ->where($queryBuilder->expr()->eq(
                'uid',
                $queryBuilder->createNamedParameter($id, ParameterType::INTEGER)
            ))
            ->executeQuery()
            ->fetchAssociative();
        if ($row === false) {
            return true;
        }
        return (bool)($row['deleted'] ?? 1);
    }
}
