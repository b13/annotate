<?php

declare(strict_types=1);

namespace B13\Annotate\Event;

/*
 * This file is part of TYPO3 CMS-based extension "annotate" by b13.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 */

use B13\Annotate\Domain\Model\Comment;
use Psr\Http\Message\ServerRequestInterface;

class CommentHasBeenCreatedEvent
{
    private Comment $comment;
    private ServerRequestInterface $request;

    public function __construct(Comment $comment, ServerRequestInterface $request)
    {
        $this->comment = $comment;
        $this->request = $request;
    }

    public function getComment(): Comment
    {
        return $this->comment;
    }

    public function getRequest(): ServerRequestInterface
    {
        return $this->request;
    }
}
