<?php

declare(strict_types=1);

namespace B13\Annotate\Domain\Model;

class BackendUser
{
    protected string $userName;
    protected string $realName;

    public function __construct(string $userName = '', string $realName = '')
    {
        $this->userName = $userName;
        $this->realName = $realName;
    }

    public static function fromDatabaseRow(array $databaseRow): self
    {
        return new self(
            $databaseRow['username'] ?? '',
            $databaseRow['realname'] ?? ''
        );
    }

    public function getUserName(): string
    {
        return $this->userName;
    }

    public function getRealName(): string
    {
        return $this->realName;
    }

    public function getReadableAuthorLine(): string
    {
        return $this->userName . (!empty($this->realName) ? (' (' . $this->realName . ')') : '');
    }
}
