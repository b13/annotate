<?php

declare(strict_types=1);

namespace B13\Annotate\Domain\Repository;

use B13\Annotate\Domain\Model\BackendUser;
use Doctrine\DBAL\ParameterType;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Information\Typo3Version;
use TYPO3\CMS\Core\Utility\GeneralUtility;

class BackendUserRepository
{
    public function __construct(
        private readonly ConnectionPool $connectionPool
    ) {
    }

    public function findByUid(int $uid): ?BackendUser
    {
        $queryBuilder = $this->connectionPool->getQueryBuilderForTable('be_users');
        $beUserRow = $queryBuilder
            ->select('username', 'realname')
            ->from('be_users')
            ->where(
                $queryBuilder->expr()->eq(
                    'uid',
                    $queryBuilder->createNamedParameter($uid, ParameterType::INTEGER)
                )
            )
            ->setMaxResults(1)
            ->executeQuery()
            ->fetchAssociative();

        if (empty($beUserRow)) {
            return null;
        }
        return BackendUser::fromDatabaseRow($beUserRow);
    }
}
