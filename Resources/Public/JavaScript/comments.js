import Icons from '@typo3/backend/icons.js';
import Modal from '@typo3/backend/modal.js';
import Severity from '@typo3/backend/severity.js';
import Notification from "@typo3/backend/notification.js";
import {html, render} from 'lit-html';
import {unsafeHTML} from 'lit-html/directives/unsafe-html.js';

class CommentsModal {

	me = self;
	icons = {
		reply : '',
		resolve : '',
		comment : '',
		open: ''
	};

	constructor() {
		Icons.getIcon('actions-edit-replace', 'small').then(icon => this.icons.reply = icon);
		Icons.getIcon('actions-check', 'small').then(icon => this.icons.resolve = icon);
		Icons.getIcon('actions-comment', 'small').then(icon => this.icons.comment = icon);
		Icons.getIcon('actions-open', 'small').then(icon => this.icons.open = icon);
	}

	/**
	 * render add comment form
	 * @param pid
	 * @param recordUid
	 * @param recordTable
	 * @param commentUid
	 * @return {string}
	 */
	renderAddCommentForm(pid, recordUid, recordTable, commentUid = '') {
		return html`
			<div class="b_annotate__comment-form__container">
				<form class="b_annotate__comment-form__form bJS_add-comment-form" @submit="${ev => this.createComment(ev)}">
					<textarea class="b_annotate__comment-form__textarea" name="comment" placeholder="Add your comment here"></textarea>
					<input type="hidden" name="pid" value="${pid}">
					<input type="hidden" name="recordtable" value="${recordTable}">
					<input type="hidden" name="recorduid" value="${recordUid}">
					<input type="hidden" name="parentcomment" value="${commentUid}">
					<input type="submit" name="sbmt" value="Comment" class="b_annotate__comment-form__btn b_annotate__comment-form__btn--primary">
					<input type="reset" name="cancel" value="Cancel" class="b_annotate__comment-form__btn" @click="${evt => this.cancelCreation(evt, commentUid)}">
				</form>
			</div>
		`;
	}

	/**
	 * render edit comment form
	 * @param comment
	 * @param commentUid
	 * @return {string}
	 */
	renderEditCommentForm(comment, commentUid = '') {
		return html`
			<div class="bJS_edit-comment-container b_annotate__comment-edit-form-wrap">
				<div class="b_annotate__comment-form__container">
					<form class="b_annotate__comment-form__form bJS_edit-comment-form" @submit="${ev => this.updateComment(ev)}">
						<textarea class="b_annotate__comment-form__textarea" name="commentText">${comment}</textarea>
						<input type="hidden" name="comment" value="${commentUid}">
						<input type="submit" name="sbmt" value="Submit Changes"
							   class="b_annotate__comment-form__btn b_annotate__comment-form__btn--primary"
						>
						<input type="reset" name="cancel" value="Cancel"
							   @click="${evt => this.hideEditForm(evt.target.closest('.b_annotate__comment'))}"
							   class="b_annotate__comment-form__btn">
					</form>
				</div>
			</div>`;
	}

	/**
	 * render comment and replies
	 * @param comment
	 * @param pid
	 * @param recordUid
	 * @param recordTable
	 * @param commentUid
	 * @param template
	 * @param level
	 * @param replyIndex
	 * @return {string}
	 */
	renderComment(comment, pid, recordUid, recordTable, commentUid = '', template = '', level = 0, replyIndex  = 0) {
		if (!comment) {
			return html``;
		}
		return html`
			<div class="b_annotate__comment b_annotate__comment--level-${level}">
				<div class="b_annotate__comment-meta">
					<div class="b_annotate__comment-meta-left">
						${comment.avatar.length > 0
							? html`${unsafeHTML(comment.avatar)}`
							: html`<img
								src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgLTIwOC41IDIxIDEwMCAxMDAiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9Ii0yMDguNSAyMSAxMDAgMTAwIiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnNrZXRjaD0iaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PGc+PGNpcmNsZSBjeD0iLTE1OC41IiBjeT0iNzEiIGZpbGw9IiNGNUVFRTUiIGlkPSJNYXNrIiByPSI1MCIvPjxnPjxkZWZzPjxjaXJjbGUgY3g9Ii0xNTguNSIgY3k9IjcxIiBpZD0iTWFza18yXyIgcj0iNTAiLz48L2RlZnM+PGNsaXBQYXRoIGlkPSJNYXNrXzRfIj48dXNlIG92ZXJmbG93PSJ2aXNpYmxlIiB4bGluazpocmVmPSIjTWFza18yXyIvPjwvY2xpcFBhdGg+PHBhdGggY2xpcC1wYXRoPSJ1cmwoI01hc2tfNF8pIiBkPSJNLTEwOC41LDEyMXYtMTRjMCwwLTIxLjItNC45LTI4LTYuN2MtMi41LTAuNy03LTMuMy03LTEyICAgICBjMC0xLjcsMC02LjMsMC02LjNoLTE1aC0xNWMwLDAsMCw0LjYsMCw2LjNjMCw4LjctNC41LDExLjMtNywxMmMtNi44LDEuOS0yOC4xLDcuMy0yOC4xLDYuN3YxNGg1MC4xSC0xMDguNXoiIGZpbGw9IiNFNkMxOUMiIGlkPSJNYXNrXzNfIi8+PGcgY2xpcC1wYXRoPSJ1cmwoI01hc2tfNF8pIj48ZGVmcz48cGF0aCBkPSJNLTEwOC41LDEyMXYtMTRjMCwwLTIxLjItNC45LTI4LTYuN2MtMi41LTAuNy03LTMuMy03LTEyYzAtMS43LDAtNi4zLDAtNi4zaC0xNWgtMTVjMCwwLDAsNC42LDAsNi4zICAgICAgIGMwLDguNy00LjUsMTEuMy03LDEyYy02LjgsMS45LTI4LjEsNy4zLTI4LjEsNi43djE0aDUwLjFILTEwOC41eiIgaWQ9Ik1hc2tfMV8iLz48L2RlZnM+PGNsaXBQYXRoIGlkPSJNYXNrXzVfIj48dXNlIG92ZXJmbG93PSJ2aXNpYmxlIiB4bGluazpocmVmPSIjTWFza18xXyIvPjwvY2xpcFBhdGg+PHBhdGggY2xpcC1wYXRoPSJ1cmwoI01hc2tfNV8pIiBkPSJNLTE1OC41LDEwMC4xYzEyLjcsMCwyMy0xOC42LDIzLTM0LjQgICAgICBjMC0xNi4yLTEwLjMtMjQuNy0yMy0yNC43cy0yMyw4LjUtMjMsMjQuN0MtMTgxLjUsODEuNS0xNzEuMiwxMDAuMS0xNTguNSwxMDAuMXoiIGZpbGw9IiNENEIwOEMiIGlkPSJoZWFkLXNoYWRvdyIvPjwvZz48L2c+PHBhdGggZD0iTS0xNTguNSw5NmMxMi43LDAsMjMtMTYuMywyMy0zMWMwLTE1LjEtMTAuMy0yMy0yMy0yM3MtMjMsNy45LTIzLDIzICAgIEMtMTgxLjUsNzkuNy0xNzEuMiw5Ni0xNTguNSw5NnoiIGZpbGw9IiNGMkNFQTUiIGlkPSJoZWFkIi8+PC9nPjwvc3ZnPg=="
								class="b_annotate__comment-author-image" alt="">`
						}
					</div>
					<div class="b_annotate__comment-meta-center">
						<p class="b_annotate__comment-createdon">${new Date(comment.createdon).toLocaleString()}</p>
						<p class="b_annotate__comment-author">${comment.author}</p>
						${comment.lastEdit
							? html`
								<p class="b_annotate__comment-lastedit">
									Edited: ${new Date(comment.lastEdit).toLocaleString()}
								</p>
							` : html``
						}
					</div>
					${comment.editable
						? html`
							<div class="b_annotate__comment-meta-right"
								 @click="${evt => this.showEditForm(evt.target.closest('.b_annotate__comment'))}">
								<button class="bJS_init-edit btn btn-sm btn-default">
									${unsafeHTML(this.icons.open)}
								</button>
							</div>
						` : html``
					}
				</div>
				<div class="b_annotate__comment-text">
					${comment.explanation.split("\n").map(c => html`${c}<br/>`)}
				</div>
				${comment.editable ? this.renderEditCommentForm(comment.explanation, comment.uid) : html``}
				<div class="b_annotate__comment-reply bJS_annotate__comment-reply">
					${level === 0 ? html`
						<div class="b_annotate__comment-reply-button-wrap">
							<button class="b_annotate__comment-button bJS_resolve-comment"
									@click="${evt => this.resolve(evt.target, comment)}"
							>
								${unsafeHTML(this.icons.resolve)} Resolve
							</button>
							<button class="b_annotate__comment-button bJS_init-reply"
									@click="${evt => this.showReplyForm(evt.target.closest('.b_annotate__comment'))}"
							>
								${unsafeHTML(this.icons.reply)} Reply
							</button>
						</div>
						<div class="b_annotate__comment-reply-form-wrap bJS_reply-to-comment-container">
							<h3 class="b_annotate__add-comment-reply__headline">Reply to Comment</h3>
							${this.renderAddCommentForm(pid, recordUid, recordTable, commentUid)}
						</div>
					` : html`Reply #${replyIndex}`}
				</div>
			</div>
			${(comment.replies && Object.keys(comment.replies).length > 0) ?
				Object.values(comment.replies).map(r => {
					return this.renderComment(r, pid, recordUid, recordTable, commentUid, template, 1, ++replyIndex)
				})
				: html``
			}`;
	}

	/**
	 * render
	 * @param pid
	 * @param recordUid
	 * @param recordTable
	 * @param comments
	 * @return {string}
	 */
	render(pid, recordUid, recordTable, comments) {
		// add comment form
		return html`
			<div class="bJS_add-comment-layer">
				${
					comments.length > 0
						? html`
							<h3>Comments (${comments.length})</h3>
							<div>${comments.map(c => this.renderComment(c, pid, recordUid, recordTable, c.uid))}</div>
						`
						: html``
				}
				<h3 class="b_annotate__add-comment__headline">Add new comment</h3>
				<div class="b_annotate__add-comment__container bJS_add-comment-container">
					${this.renderAddCommentForm(pid, recordUid, recordTable, 0)}
				</div>
			</div>
		`;
	}

	/**
	 * render 'open comments' button
	 * used for page module
	 *
	 * @param recordUid
	 * @param recordTable
	 * @param commentCount
	 * @return {string}
	 */
	renderOpenCommentsButton(recordUid, recordTable, commentCount = 0, inline = false) {
		return html`
			<a
				class="btn btn-default ${inline ? 'btn-borderless' : ''} bJS_annotate-open-comments"
				href="#"
				data-recordtable="${recordTable}"
				data-recorduid="${recordUid}"
			>
				${commentCount > 0
					? html`${unsafeHTML(this.icons.comment)} Comments <span class="b_annotate__badge">${commentCount}</span>`
					: html`${unsafeHTML(this.icons.comment)} Add Comment`
				}
			</a>
		`;
	}

	/**
	 * render 'open comments' list button
	 * used for list module
	 *
	 * @param recordUid
	 * @param recordTable
	 * @param commentCount
	 * @return {string}
	 */
	renderOpenCommentsListButton(recordUid, recordTable, commentCount = 0) {
		return html`${unsafeHTML(this.icons.comment)}
		${commentCount > 0 ?
			html`<span class="b_annotate__badge b_annotate__badge--inline">${commentCount}</span>`
			: ''
		}`;
	}


	resolve(commentElement, comment) {
		const modal = Modal.confirm('Resolve this comment?', 'Do you like to close this comment?', Severity.warning);
		modal.addEventListener('confirm.button.cancel', () => modal.hideModal());
		modal.addEventListener('confirm.button.ok', () => {
			modal.hideModal();
			fetch(window.TYPO3.settings.ajaxUrls['annotate_resolve_comment'] + '&comment=' + comment.uid)
				.then(res => res.json())
				.then(response => {
					if (response.success) {
						commentElement.dispatchEvent(new CustomEvent('commentsChanged', {bubbles: true}));
					} else {
						console.log(response);
					}
				});
		});
	}

	showEditForm(commentElement) {
		commentElement.querySelector('.b_annotate__comment-text').style.display = 'none';
		commentElement.querySelector('.bJS_edit-comment-container').style.display = 'block';
	}

	hideEditForm(commentElement) {
		commentElement.querySelector('.b_annotate__comment-text').style.display = 'block';
		commentElement.querySelector('.bJS_edit-comment-container').style.display = 'none';
	}

	showReplyForm(commentElement) {
		commentElement.querySelector('.bJS_init-reply').style.display = 'none';
		commentElement.querySelector('.bJS_reply-to-comment-container').style.display = 'block';
	}

	hideReplyForm(commentElement) {
		commentElement.querySelector('.bJS_init-reply').style.display = 'block';
		commentElement.querySelector('.bJS_reply-to-comment-container').style.display = 'none';
	}

	cancelCreation(evt, parentComment) {
		if (parentComment > 0) {
			this.hideReplyForm(evt.target.closest('.b_annotate__comment'));
		}
	}

	createComment(evt) {
		evt.preventDefault();
		const formData = new URLSearchParams();
		for (const pair of new FormData(evt.target)) {
			formData.append(pair[0], pair[1]);
		}

		this.sendRequest(window.TYPO3.settings.ajaxUrls['annotate_add_comment'], formData)
			.then(() => {
				Notification.success('Success', 'Comment was successfully created');
				evt.target.querySelector('textarea').value = '';
				evt.target.dispatchEvent(new CustomEvent('commentsChanged', {bubbles: true}));
			});
	}

	updateComment(evt) {
		evt.preventDefault();

		const formData = new URLSearchParams();
		for (const pair of new FormData(evt.target)) {
			formData.append(pair[0], pair[1]);
		}

		this.sendRequest(window.TYPO3.settings.ajaxUrls['annotate_update_comment'], formData)
			.then(() => {
				Notification.success('Success', 'Comment was successfully updated');
				evt.target.dispatchEvent(new CustomEvent('commentsChanged', {bubbles: true}));
				this.hideEditForm(evt.target.closest('.b_annotate__comment'));
			});
	}

	sendRequest(url, formData) {
		return new Promise((resolve, reject) => {
			fetch(url,
				{
					method: 'POST',
					body: formData,
					headers: {
						'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
					}
				}
			)
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
}

export default CommentsModal;
