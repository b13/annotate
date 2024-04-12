define([
	'jquery',
	'TYPO3/CMS/Backend/Icons',
	'TYPO3/CMS/Backend/Modal',
	'TYPO3/CMS/Backend/Severity',
	'./Comments',
	'./Sidebar'
], function ($, Icons, Modal, Severity, CommentsModal, Sidebar) {

	let AnnotationContainer = {
		fetchCommentsUrl: window.TYPO3.settings.ajaxUrls['annotate_get_comments_records'],
		fetchCommentsUrlWithPid: window.TYPO3.settings.ajaxUrls['annotate_get_comments'],
		context: '',
		buttonStyle: '',
		setPid: function (pid) {
			this.pid = pid;
		},
		setContext: function (context) {
			this.context = context;
		},
		setButtonStyle: function (buttonStyle) {
			this.buttonStyle = buttonStyle;
		},
		setCustomModuleCallback: function (callback) {
			this.customModuleCallback = callback;
		},
		start: function () {
			initialize();
		},
		fetchCommentsOnPageByRecordTable: fetchCommentsOnPageByRecordTable,
		fetchCommentsByRecordTable: fetchCommentsByRecordTable,
		bindOpenCommentLayer: bindOpenCommentLayer
	};
	let me = this;

	function initialize() {

		const
			mainPageBtnContainer = $('#bJS_annotate-comments'),
			moduleType = mainPageBtnContainer.length > 0 ? mainPageBtnContainer.data('module-type') : '';

		/**
		 * page module
		 */
		if (moduleType === 'page') {
			fetchCommentsOnPageByRecordTable('pages').then(comments => initPageComments(comments));
			fetchCommentsOnPageByRecordTable('tt_content').then((comments) => {
				// add comment buttons to all tt_content items
				initInlineComments(comments, $('.t3-page-ce .t3-page-ce-header-icons-right .btn-group'), 'page');

				const itemsWithCommentsCount = new Set();
				comments.forEach(comment => itemsWithCommentsCount.add(comment.recorduid));

				// add ce comment count info to page
				$('#bJS_annotate-comments-page__info').append(`
					This page contains <strong>${itemsWithCommentsCount.size}</strong> Content Element(s) with comments
				`);
			});
		}

		/**
		 * list module
		 */
		if (moduleType === 'list') {

			fetchCommentsOnPageByRecordTable('pages').then((comments) => {
				initPageComments(comments);
				// add comment buttons to all pages list items
				initInlineComments(comments, $('.bJS_annotate-list-module__btn-container-pages'), 'list');
			});

			// add comment buttons to all tt_content list items
			fetchCommentsOnPageByRecordTable('tt_content').then((comments) => {
				initInlineComments(comments, $('.bJS_annotate-list-module__btn-container-tt_content'), 'list');
			});
		}

		/**
		 * custom module
		 */
		if (moduleType === 'custom') {
			AnnotationContainer.customModuleCallback(CommentsModal);
		}

		return me;
	}


	/**
	 * init page comments
	 * this is used for page and list module
	 * @param comments
	 */
	function initPageComments(comments) {
		const
			$pageButton = $('#bJS_annotate-comments'),
			uid = AnnotationContainer.pid,
			table = 'pages';

		$pageButton.prepend(CommentsModal.renderOpenCommentsButton(uid, table, comments.length));
		$pageButton.data('module-type', 'page');
		bindOpenCommentLayer($pageButton, uid, table, comments);
	}


	/**
	 * init inline comments
	 * @param allComments
	 * @param $groupSelector
	 * @param moduleType
	 */
	function initInlineComments(allComments, $groupSelector, moduleType) {
		$groupSelector.each(function () {
			let $me = $(this);
			let $infoTarget, table, uid;

			if (moduleType === 'page') {
				$infoTarget = $me.closest('.t3-page-ce');
			} else {
				$infoTarget = $me.find('.bJS_annotate-open-comments');
			}

			table = $infoTarget.attr('data-table');
			uid = parseInt($infoTarget.attr('data-uid'));

			if (!table || !uid) {
				return;
			}

			let comments = allComments.filter(comment => parseInt(comment.recorduid) === uid);
			if (moduleType === 'list') {
				$me.children().remove();
				$me.prepend(CommentsModal.renderOpenCommentsListButton(uid, table, comments.length));
			} else {
				$me.prepend(CommentsModal.renderOpenCommentsButton(uid, table, comments.length));
			}
			$me.data('module-type', moduleType);

			bindOpenCommentLayer($me, uid, table, comments);
		});
	}


	/**
	 * bind open comment layer
	 * @param {Object} $elem
	 * @param {number} uid
	 * @param {string} table
	 * @param {Array} comments
	 */
	function bindOpenCommentLayer($elem, uid, table, comments) {
		if (!$elem) {
			return;
		}

		let pid = $elem.data('pid') ? $elem.data('pid') : AnnotationContainer.pid,
			$content = $(`<div class="bJS_add-comment-layer">${CommentsModal.render(pid, uid, table, comments)}<div>`);

		// bind open layer event
		$elem.on('click', '.bJS_annotate-open-comments', (evt) => {
			evt.preventDefault();
			AnnotationContainer.pid = pid;
			Sidebar.show($content[0]);
		});

		// bind new comment submit
		$content.on('submit', '.bJS_add-comment-form', function(evt) {
			evt.preventDefault();
			submitComment($(this)[0], window.TYPO3.settings.ajaxUrls['annotate_add_comment']).then(() => {
				$(this).after('<p> New comment added!</p>');
				$(this).remove();

				// update layer content
				updateSidebarContent($elem, table, uid, $content).then($newContent => $content = $newContent);
			});
		});

		// bind new comment submit
		$content.on('submit', '.bJS_edit-comment-form', function(evt) {
			evt.preventDefault();
			submitComment($(this)[0], window.TYPO3.settings.ajaxUrls['annotate_update_comment']).then(() => {
				// update layer content
				updateSidebarContent($elem, table, uid, $content).then($newContent => $content = $newContent);
			});
		});

		// show reply to comment
		$content.on('click', '.bJS_init-reply', function(evt) {
			evt.preventDefault();
			$(this).hide();
			$(this).closest('.b_annotate__comment-reply').find('.bJS_reply-to-comment-container').fadeIn();
		});

		// show edit comment
		$content.on('click', '.bJS_init-edit', function(evt) {
			evt.preventDefault();
			$(this).closest('.b_annotate__comment').find('.b_annotate__comment-text').html(
				$(this).closest('.b_annotate__comment').find('.bJS_edit-comment-container').html()
			);
		});

		// on cancel: hide textarea and show comment again
		$content.on('click', '.bJS_edit-comment-cancel', function(evt) {
			evt.preventDefault();
			let $textContainer = $(this).closest('.b_annotate__comment-text');
			$textContainer.html($(this).parent().find('textarea').val());
		});

		// on cancel: hide reply to comment form
		$content.on('click', '.bJS_add-comment-cancel', function(evt) {
			evt.preventDefault();
			let $replyToComment = $(this).closest('.bJS_reply-to-comment-container');
			if ($replyToComment.length > 0) {
				$replyToComment.hide();
				$replyToComment.closest('.b_annotate__comment-reply').find('.bJS_init-reply').show();
			} else {
				// close sidebar
				Sidebar.hide();
			}
		});

		// on resolve comment
		$content.on('click', '.bJS_resolve-comment', function(evt) {
			evt.preventDefault();

			let modal = Modal.confirm('Resolve this comment?', 'Do you like to close this comment?', Severity.warning);

			modal.on('confirm.button.cancel', () => {
				modal.trigger('modal-dismiss');
			});

			modal.on('confirm.button.ok', () => {
				modal.trigger('modal-dismiss');

				const commentUid = $(this).data('comment-uid');
				fetch(window.TYPO3.settings.ajaxUrls['annotate_resolve_comment'] + '&comment=' + commentUid)
					.then(res => res.json())
					.then(response => {
						if (response.success) {
							// update layer content
							updateSidebarContent($elem, table, uid, $content).then($newContent => $content = $newContent);
						} else {
							console.log(response);
						}
				});
			});
		});
	}

	/**
	 * update sidebar content
	 * @param $elem
	 * @param table
	 * @param uid
	 * @param $content
	 * @return {Promise}
	 */
	function updateSidebarContent($elem, table, uid, $content) {
		return new Promise((resolve, reject) => {

			if (!table || !uid || !$content) {
				reject();
				return;
			}

			fetchCommentsByRecordTableAndRecordId(table, uid)
				.then(comments => {
					// update layer content
					$content.children().remove();
					$content.append($(CommentsModal.render(AnnotationContainer.pid, uid, table, comments)));
					// update button count
					$elem.children('.bJS_annotate-open-comments').remove();
					if ($elem.data('module-type') === 'list') {
						$elem.prepend(CommentsModal.renderOpenCommentsListButton(uid, table, comments.length));
					} else {
						$elem.prepend(CommentsModal.renderOpenCommentsButton(uid, table, comments.length));
					}
					resolve($content);
			});
		});
	}

	/**
	 * submit comment
	 * @param form
	 * @return {Promise}
	 */
	function submitComment(form, url) {

		return new Promise((resolve, reject) => {

			if (!form) {
				reject();
			}

			// get form data
			const formData = new URLSearchParams();
			for (const pair of new FormData(form)) {
				formData.append(pair[0], pair[1]);
			}

			if (AnnotationContainer.context.length > 0) {
				formData.append('context', AnnotationContainer.context);
			}

			fetch(url, {
				method: 'POST',
				body: formData,
				headers: {
					'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
				}
			})
				.then(res => res.json())
				.then(response => {
					if (response.success) {
						resolve();
					} else {
						reject();
					}
				});
		});
	}

	/**
	 * fetchComments
	 * @param recordtable
	 * @return {Promise}
	 */
	function fetchCommentsOnPageByRecordTable(recordtable = '') {
		let fetchUrl = `${AnnotationContainer.fetchCommentsUrlWithPid}&recordtable=${recordtable}&pid=${AnnotationContainer.pid}`;
		return fetchComments(fetchUrl);
	}

	/**
	 * fetchComments
	 * @param recordtable
	 * @return {Promise}
	 */
	function fetchCommentsByRecordTable(recordtable = '') {
		let fetchUrl = `${AnnotationContainer.fetchCommentsUrl}&recordtable=${recordtable}`;
		return fetchComments(fetchUrl);
	}

	/**
	 * fetchComments
	 * @param recordtable
	 * @param recordUid
	 * @return {Promise}
	 */
	function fetchCommentsByRecordTableAndRecordId(recordtable = '', recordUid = '') {
		let fetchUrl = `${AnnotationContainer.fetchCommentsUrlWithPid}&recordtable=${recordtable}&recorduid=${recordUid}`;
		return fetchComments(fetchUrl);
	}

	/**
	 * fetchComments
	 * @param fetchUrl
	 * @return {Promise}
	 */
	function fetchComments(fetchUrl) {

		return new Promise((resolve, reject) => {
			fetch(fetchUrl)
				.then(resp => resp.json())
				.then(data => {
					resolve(Object.values(data.comments));
				}).catch(err => {
					reject(err);
				});
		});
	}

	return AnnotationContainer;
});
