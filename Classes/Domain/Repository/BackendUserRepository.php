<?php

declare(strict_types=1);

namespace B13\Annotate\Domain\Repository;

use B13\Annotate\Domain\Model\BackendUser;
use TYPO3\CMS\Core\Database\ConnectionPool;

class BackendUserRepository
{
    private ConnectionPool $connectionPool;

    public function __construct(ConnectionPool $connectionPool)
    {
        $this->connectionPool = $connectionPool;
    }

    public function findByUid(int $uid): ?BackendUser
    {
        $queryBuilder = $this->connectionPool->getQueryBuilderForTable('be_users');
        $beUserRow = $queryBuilder->select('username', 'realname')
            ->from('be_users')
            ->where(
                $queryBuilder->expr()->eq(
                    'uid',
                    $queryBuilder->createNamedParameter($uid, \PDO::PARAM_INT)
                )
            )
            ->setMaxResults(1)
            ->execute()
            ->fetchAssociative();

        if (empty($beUserRow)) {
            return null;
        }
        return BackendUser::fromDatabaseRow($beUserRow);
    }
}
