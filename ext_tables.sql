#
# Add fields for table 'sys_comment'
#
CREATE TABLE sys_comment (
    explanation tinytext,
    recordtable tinytext,
    recorduid int(11) DEFAULT 0 NOT NULL,
    parentcomment int(11) DEFAULT 0 NOT NULL,
    assignedto int(11) DEFAULT 0 NOT NULL,
    last_edit int(11) DEFAULT 0 NOT NULL
);
