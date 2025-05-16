<?php

declare(strict_types=1);

namespace B13\Annotate\Domain\Model;

/*
 * This file is part of TYPO3 CMS-based extension "annotate" by b13.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 */

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
