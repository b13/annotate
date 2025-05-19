<?php

declare(strict_types=1);

namespace B13\Annotate\Service;

/*
 * This file is part of TYPO3 CMS-based extension "annotate" by b13.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 */

use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;

class PermissionService
{
    public function isAllowed(): bool
    {
        return $this->getBackendUser()?->check('custom_options', 'tx_annotate:allow') ?? false;
    }

    protected function getBackendUser(): ?BackendUserAuthentication
    {
        return $GLOBALS['BE_USER'] ?? null;
    }
}
