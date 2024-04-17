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

use B13\Annotate\Domain\Repository\BackendUserRepository;
use TYPO3\CMS\Backend\Backend\Avatar\Avatar;
use TYPO3\CMS\Backend\Utility\BackendUtility;
use TYPO3\CMS\Core\Context\Context;
use TYPO3\CMS\Core\Utility\GeneralUtility;

class Comment implements \JsonSerializable
{
    /**
     * @var int
     */
    protected $uid;

    /**
     * @var int
     */
    protected $pid;

    /**
     * @var \DateTimeInterface
     */
    protected $createdon;

    /**
     * @var int
     */
    protected $author;

    /**
     * @var bool
     */
    protected $isresolved = false;

    /**
     * @var string
     */
    protected $explanation;

    /**
     * @var string
     */
    protected $recordtable = '';

    /**
     * @var int
     */
    protected $recorduid = 0;

    /**
     * @var int|Comment|null
     */
    protected $parentcomment;

    /**
     * @var int
     */
    protected $assignedto = 0;

    /**
     * @var Comment[]
     */
    protected $replies = [];

    /**
     * @var \DateTime|null
     */
    protected $lastEdit;

    public function __construct(
        int $pid,
        string $comment,
        string $recordtable,
        int $recorduid,
        \DateTimeImmutable $createdOn,
        int $author,
        int $parentComment = 0,
        int $uid = 0,
        bool $isResolved = false,
        int $assignedTo = 0,
        ?int $lastEdit = null
    ) {
        $this->pid = $pid;
        $this->explanation = $comment;
        $this->recordtable = $recordtable;
        $this->recorduid = $recorduid;
        $this->createdon = $createdOn;
        $this->author = $author;
        $this->parentcomment = $parentComment;
        $this->isresolved = $isResolved;

        if ($uid !== 0) {
            $this->uid = $uid;
        }

        if ($assignedTo !== 0) {
            $this->assignedto = $assignedTo;
        }

        if ($lastEdit !== null && $lastEdit > 0) {
            $this->lastEdit = new \DateTime();
            $this->lastEdit->setTimestamp($lastEdit);
        }
    }

    public function getUid(): int
    {
        return $this->uid;
    }

    public function getPid(): int
    {
        return $this->pid;
    }

    public function getCreatedon(): \DateTimeInterface
    {
        return $this->createdon;
    }

    protected function getBeUser(): ?BackendUser
    {
        $repository = GeneralUtility::makeInstance(BackendUserRepository::class);
        return $repository->findByUid($this->author);
    }

    public function getAuthor(): int
    {
        return $this->author;
    }

    public function isIsresolved(): bool
    {
        return $this->isresolved;
    }

    public function getExplanation(): string
    {
        return $this->explanation;
    }

    public function getRecordtable(): string
    {
        return $this->recordtable;
    }

    public function getRecorduid(): int
    {
        return $this->recorduid;
    }

    /**
     * @return Comment|int|null
     */
    public function getParentcomment()
    {
        return $this->parentcomment;
    }

    public function getAssignedto(): ?int
    {
        return $this->assignedto;
    }

    public function addReply(Comment $reply): void
    {
        $this->replies[$reply->getUid()] = $reply;
    }

    public function getReplies(): array
    {
        return $this->replies;
    }

    public function jsonSerialize(): array
    {
        return [
            'uid' => $this->uid,
            'pid' => $this->pid,
            'createdon' => $this->createdon->format('c'),
            'explanation' => $this->explanation,
            'parentcomment' => $this->parentcomment,
            'replies' => $this->replies,
            'author' => $this->getReadableAuthorLine(),
            'avatar' => $this->getAuthorAvatar(),
            'assignedto' => $this->assignedto,
            'recordtable' => $this->recordtable,
            'recorduid' => $this->recorduid,
            'isresolved' => $this->isresolved,
            'editable' => GeneralUtility::makeInstance(Context::class)->getPropertyFromAspect('backend.user', 'id') === $this->author,
            'lastEdit' => $this->lastEdit instanceof \DateTime ? $this->lastEdit->format('c') : '',
        ];
    }

    public function forDatabase(): array
    {
        return [
            'pid' => $this->pid,
            'createdon' => $this->createdon->format('U'),
            'explanation' => $this->explanation,
            'parentcomment' => $this->parentcomment,
            'author' => $this->author,
            'assignedto' => $this->assignedto,
            'recordtable' => $this->recordtable,
            'recorduid' => $this->recorduid,
            'isresolved' => (int)$this->isresolved,
        ];
    }

    protected function getReadableAuthorLine(): string
    {
        $beUser = $this->getBeUser();
        if (!$beUser instanceof BackendUser) {
            return '';
        }
        return $beUser->getReadableAuthorLine();
    }

    protected function getAuthorAvatar(): string
    {
        if ($this->author) {
            $userRecord = BackendUtility::getRecord('be_users', $this->author, '*', '', false);
            return GeneralUtility::makeInstance(Avatar::class)->render($userRecord, 60);
        }
        return '';
    }

    public function setExplanation(string $explanation): void
    {
        $this->explanation = $explanation;
    }
}
