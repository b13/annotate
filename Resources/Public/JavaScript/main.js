import Icons from '@typo3/backend/icons.js';
import Modal from '@typo3/backend/modal.js';
import Severity from '@typo3/backend/severity.js';
import CommentsModal from "./comments.js";
import Sidebar from "./sidebar.js";
import {html, render} from 'lit-html';

class AnnotationContainer {

	fetchCommentsUrl = window.TYPO3.settings.ajaxUrls['annotate_get_comments_records'];
	fetchCommentsUrlWithPid = window.TYPO3.settings.ajaxUrls['annotate_get_comments'];
	context = '';
	buttonStyle = '';
	pid = 0;
	commentsModal = new CommentsModal();
	sidebar = new Sidebar();

	setContext(context) {
		this.context = context;
	}

	setButtonStyle(buttonStyle) {
		this.buttonStyle = buttonStyle;
	}

	setCustomModuleCallback(callback) {
		this.customModuleCallback = callback;
	}

	constructor() {
		this.initialize();
	}

	me = this;

	initialize() {

		const
			mainPageBtnContainer = document.getElementById('bJS_annotate-comments'),
			moduleType = mainPageBtnContainer.dataset.moduleType;

		this.pid = mainPageBtnContainer.dataset.pid;
		/**
		 * page module
		 */
		if (moduleType === 'page') {
			this.fetchCommentsOnPageByRecordTable('pages').then(comments => this.initPageComments(comments));
			this.fetchCommentsOnPageByRecordTable('tt_content').then((comments) => {
				// add comment buttons to all tt_content items
				document.querySelectorAll('.t3-page-ce-header .t3-page-ce-header-right .btn-group').forEach(buttonGroup => {
					const button = document.createElement('button');
					button.classList.add('btn', 'btn-borderless', 'bJS_annotate_btn-container');
					buttonGroup.prepend(button);
				});
				this.initInlineComments(comments, document.querySelectorAll('.t3-page-ce-header .t3-page-ce-header-right .btn-group .bJS_annotate_btn-container'), 'page');

				const itemsWithCommentsCount = new Set();
				comments.forEach(comment => itemsWithCommentsCount.add(comment.recorduid));

				// add ce comment count info to page
				document.getElementById('bJS_annotate-comments-page__info').innerHTML =
					`This page contains <strong>${itemsWithCommentsCount.size}</strong> Content Element(s) with comments`;
			});
		}

		/**
		 * list module
		 */
		if (moduleType === 'list') {

			this.fetchCommentsOnPageByRecordTable('pages').then((comments) => {
				this.initPageComments(comments);
				// add comment buttons to all pages list items
				this.initInlineComments(comments, document.querySelectorAll('.bJS_annotate-list-module__btn-container-pages'), 'list');
			});

			// add comment buttons to all tt_content list items
			this.fetchCommentsOnPageByRecordTable('tt_content').then((comments) => {
				this.initInlineComments(comments, document.querySelectorAll('.bJS_annotate-list-module__btn-container-tt_content'), 'list');
			});
		}

		/**
		 * custom module
		 */
		if (moduleType === 'custom') {
			AnnotationContainer.customModuleCallback(CommentsModal);
		}

		return self;
	}

	/**
	 * init page comments
	 * this is used for page and list module
	 * @param comments
	 */
	initPageComments(comments) {
		const
			pageButton = document.createElement('a'),
			uid = this.pid,
			table = 'pages';


		document.getElementById('bJS_annotate-comments').prepend(pageButton);
		render(this.commentsModal.renderOpenCommentsButton(uid, table, comments.length), pageButton);
		pageButton.dataset.moduleType = 'page';
		this.bindOpenCommentLayer(pageButton, uid, table, comments);
	}

	/**
	 * init inline comments
	 * @param allComments
	 * @param $groupSelector
	 * @param moduleType
	 */
	initInlineComments(allComments, $buttonGroups, moduleType) {
		$buttonGroups.forEach(buttonGroup => {
			let $infoTarget, table, uid;

			if (moduleType === 'page') {
				$infoTarget = buttonGroup.closest('.t3-page-ce');
			} else {
				$infoTarget = buttonGroup;
			}

			table = $infoTarget.dataset.table;
			uid = parseInt($infoTarget.dataset.uid);

			if (!table || !uid) {
				return;
			}

			let comments = allComments.filter(comment => parseInt(comment.recorduid) === uid);

			if (moduleType === 'list') {
				render(this.commentsModal.renderOpenCommentsListButton(uid, table, comments.length), buttonGroup);
			} else {
				const targetButton = document.createElement('span');
				buttonGroup.prepend(targetButton);
				render(this.commentsModal.renderOpenCommentsButton(uid, table, comments.length, true), targetButton);
				// replace lit container element with lit template to avoid misplacement
				targetButton.outerHTML = targetButton.innerHTML;
			}
			buttonGroup.dataset.moduleType = moduleType;


			this.bindOpenCommentLayer(buttonGroup, uid, table, comments);
		});
	}


	/**
	 * bind open comment layer
	 * @param {Object} $elem
	 * @param {number} uid
	 * @param {string} table
	 * @param {Array} comments
	 */
	bindOpenCommentLayer($elem, uid, table, comments) {
		if (!$elem) {
			return;
		}
		let
			pid = $elem.dataset.pid ? $elem.dataset.pid : this.pid,
			$contentEl = document.createElement('div');

		render(this.commentsModal.render(pid, uid, table, comments), $contentEl);

		// bind open layer event
		$elem.addEventListener('click', (evt) => {
			evt.preventDefault();
			this.sidebar.show($contentEl);
		});

		$contentEl.addEventListener("commentsChanged", evt => {
			this.updateSidebarContent($elem, table, uid, $contentEl);
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
	updateSidebarContent($elem, table, uid, $content) {
		return new Promise((resolve, reject) => {
			if (!table || !uid || !$content) {
				reject();
				return;
			}
			this.fetchCommentsByRecordTableAndRecordId(table, uid)
				.then(comments => {
					$content.innerHtml = '';
					if ($elem.dataset.moduleType === 'list') {
						render(this.commentsModal.renderOpenCommentsListButton(uid, table, comments.length), $elem);
					} else {
						render(this.commentsModal.renderOpenCommentsButton(uid, table, comments.length), $elem);
					}
					render(this.commentsModal.render(this.pid, uid, table, comments), $content);
					resolve($content);
				});
		});
	}

	/**
	 * fetchComments
	 * @param recordtable
	 * @return {Promise}
	 */
	fetchCommentsOnPageByRecordTable(recordtable = '') {
		let fetchUrl = `${this.fetchCommentsUrlWithPid}&recordtable=${recordtable}&pid=${this.pid}`;
		return this.fetchComments(fetchUrl);
	}

	/**
	 * fetchComments
	 * @param recordtable
	 * @return {Promise}
	 */
	fetchCommentsByRecordTable(recordtable = '') {
		let fetchUrl = `${this.fetchCommentsUrl}&recordtable=${recordtable}`;
		return this.fetchComments(fetchUrl);
	}

	/**
	 * fetchComments
	 * @param recordtable
	 * @param recordUid
	 * @return {Promise}
	 */
	fetchCommentsByRecordTableAndRecordId(recordtable = '', recordUid = '') {
		let fetchUrl = `${this.fetchCommentsUrlWithPid}&recordtable=${recordtable}&recorduid=${recordUid}`;
		return this.fetchComments(fetchUrl);
	}

	/**
	 * fetchComments
	 * @param fetchUrl
	 * @return {Promise}
	 */
	fetchComments(fetchUrl) {

		return new Promise((resolve, reject) => {
			fetch(fetchUrl)
				.then(resp => resp.json())
				.then(data => {
					resolve(Object.values(data.comments));
				})
				.catch(err => {
					reject(err);
				});
		});
	}
}

export default new AnnotationContainer();
