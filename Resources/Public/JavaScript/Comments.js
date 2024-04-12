define([
	'TYPO3/CMS/Backend/Icons',
	'./Contrib/mustache.min'
], function(Icons, Mustache) {

	const
		me = this,
		s = {
			replyIcon : '',
			resolveIcon : '',
			commentIcon : ''
		};

	function initialize() {

		Icons.getIcon('actions-edit-replace', 'small').done(icon => s.replyIcon = icon);
		Icons.getIcon('actions-check', 'small').done(icon => s.resolveIcon = icon);
		Icons.getIcon('actions-comment', 'small').done(icon => s.commentIcon = icon);

		return me;
	}

	/**
	 * render add comment form
	 * @param pid
	 * @param recordUid
	 * @param recordTable
	 * @param commentUid
	 * @return {string}
	 */
	function renderAddCommentForm(pid, recordUid, recordTable, commentUid = '') {
		return `
			<div class="b_annotate__comment-form__container">
				<form class="b_annotate__comment-form__form bJS_add-comment-form">
					<textarea class="b_annotate__comment-form__textarea" name="comment" placeholder="Add your comment here"></textarea>
					<input type="hidden" name="pid" value="${pid}">
					<input type="hidden" name="recordtable" value="${recordTable}">
					<input type="hidden" name="recorduid" value="${recordUid}">
					<input type="hidden" name="parentcomment" value="${commentUid}">
					<input type="submit" name="sbmt" value="Comment" class="b_annotate__comment-form__btn b_annotate__comment-form__btn--primary">
					<input type="reset" name="cancel" value="Cancel" class="b_annotate__comment-form__btn bJS_add-comment-cancel">
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
	function renderEditCommentForm(comment, commentUid = '') {
		return `
			<div class="b_annotate__comment-form__container">
				<form class="b_annotate__comment-form__form bJS_edit-comment-form">
					<textarea class="b_annotate__comment-form__textarea" name="commentText">${comment}</textarea>
					<input type="hidden" name="comment" value="${commentUid}">
					<input type="submit" name="sbmt" value="Submit Changes" class="b_annotate__comment-form__btn b_annotate__comment-form__btn--primary">
					<input type="reset" name="cancel" value="Cancel" class="b_annotate__comment-form__btn bJS_edit-comment-cancel">
				</form>
			</div>
		`;
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
	function renderComment(comment, pid, recordUid, recordTable, commentUid = '', template = '', level = 0, replyIndex  = 0) {
		if (!comment) {
			return '';
		}

		template = Mustache.render(`
			<div class="b_annotate__comment b_annotate__comment--level-{{level}}">
				<div class="b_annotate__comment-meta">
					<div class="b_annotate__comment-meta-left">
						{{#hasAvatar}}
							{{{avatar}}}
						{{/hasAvatar}}
						{{^hasAvatar}}
							<img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgLTIwOC41IDIxIDEwMCAxMDAiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9Ii0yMDguNSAyMSAxMDAgMTAwIiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnNrZXRjaD0iaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PGc+PGNpcmNsZSBjeD0iLTE1OC41IiBjeT0iNzEiIGZpbGw9IiNGNUVFRTUiIGlkPSJNYXNrIiByPSI1MCIvPjxnPjxkZWZzPjxjaXJjbGUgY3g9Ii0xNTguNSIgY3k9IjcxIiBpZD0iTWFza18yXyIgcj0iNTAiLz48L2RlZnM+PGNsaXBQYXRoIGlkPSJNYXNrXzRfIj48dXNlIG92ZXJmbG93PSJ2aXNpYmxlIiB4bGluazpocmVmPSIjTWFza18yXyIvPjwvY2xpcFBhdGg+PHBhdGggY2xpcC1wYXRoPSJ1cmwoI01hc2tfNF8pIiBkPSJNLTEwOC41LDEyMXYtMTRjMCwwLTIxLjItNC45LTI4LTYuN2MtMi41LTAuNy03LTMuMy03LTEyICAgICBjMC0xLjcsMC02LjMsMC02LjNoLTE1aC0xNWMwLDAsMCw0LjYsMCw2LjNjMCw4LjctNC41LDExLjMtNywxMmMtNi44LDEuOS0yOC4xLDcuMy0yOC4xLDYuN3YxNGg1MC4xSC0xMDguNXoiIGZpbGw9IiNFNkMxOUMiIGlkPSJNYXNrXzNfIi8+PGcgY2xpcC1wYXRoPSJ1cmwoI01hc2tfNF8pIj48ZGVmcz48cGF0aCBkPSJNLTEwOC41LDEyMXYtMTRjMCwwLTIxLjItNC45LTI4LTYuN2MtMi41LTAuNy03LTMuMy03LTEyYzAtMS43LDAtNi4zLDAtNi4zaC0xNWgtMTVjMCwwLDAsNC42LDAsNi4zICAgICAgIGMwLDguNy00LjUsMTEuMy03LDEyYy02LjgsMS45LTI4LjEsNy4zLTI4LjEsNi43djE0aDUwLjFILTEwOC41eiIgaWQ9Ik1hc2tfMV8iLz48L2RlZnM+PGNsaXBQYXRoIGlkPSJNYXNrXzVfIj48dXNlIG92ZXJmbG93PSJ2aXNpYmxlIiB4bGluazpocmVmPSIjTWFza18xXyIvPjwvY2xpcFBhdGg+PHBhdGggY2xpcC1wYXRoPSJ1cmwoI01hc2tfNV8pIiBkPSJNLTE1OC41LDEwMC4xYzEyLjcsMCwyMy0xOC42LDIzLTM0LjQgICAgICBjMC0xNi4yLTEwLjMtMjQuNy0yMy0yNC43cy0yMyw4LjUtMjMsMjQuN0MtMTgxLjUsODEuNS0xNzEuMiwxMDAuMS0xNTguNSwxMDAuMXoiIGZpbGw9IiNENEIwOEMiIGlkPSJoZWFkLXNoYWRvdyIvPjwvZz48L2c+PHBhdGggZD0iTS0xNTguNSw5NmMxMi43LDAsMjMtMTYuMywyMy0zMWMwLTE1LjEtMTAuMy0yMy0yMy0yM3MtMjMsNy45LTIzLDIzICAgIEMtMTgxLjUsNzkuNy0xNzEuMiw5Ni0xNTguNSw5NnoiIGZpbGw9IiNGMkNFQTUiIGlkPSJoZWFkIi8+PC9nPjwvc3ZnPg==" class="b_annotate__comment-author-image" alt="">
						{{/hasAvatar}}
					</div>
					<div class="b_annotate__comment-meta-center">
						<p class="b_annotate__comment-createdon">{{createdOn}}</p>
						<p class="b_annotate__comment-author">{{author}}</p>
						{{#lastEdit}}
							<p class="b_annotate__comment-lastedit">Edited: {{lastEdit}}</p>
						{{/lastEdit}}
					</div>
					{{#editable}}
						<div class="b_annotate__comment-meta-right">
							<button class="bJS_init-edit btn btn-sm btn-default" data-comment="{{uid}}"><i class="fa fa-edit"></i></button>
						</div>
						<div class="bJS_edit-comment-container b_annotate__comment-edit-form-wrap">
							${renderEditCommentForm(comment.explanation, comment.uid)}
						</div>
					{{/editable}}
				</div>
				<div class="b_annotate__comment-text">
					{{#text}}
						{{.}}<br/>
					{{/text}}
				</div>
				<div class="b_annotate__comment-reply bJS_annotate__comment-reply">
					{{^showReply}}
						Reply #{{replyIndex}}
					{{/showReply}}
					{{#showReply}}
					<div class="b_annotate__comment-reply-button-wrap">
						<button class="b_annotate__comment-button bJS_resolve-comment" data-comment-uid="{{uid}}">${s.resolveIcon} Resolve</button>
						<button class="b_annotate__comment-button bJS_init-reply">${s.replyIcon} Reply</button>
					</div>
					<div class="b_annotate__comment-reply-form-wrap bJS_reply-to-comment-container">
						<h3 class="b_annotate__add-comment-reply__headline">Reply to Comment</h3>
						${renderAddCommentForm(pid, recordUid, recordTable, commentUid)}
					</div>
					{{/showReply}}
				</div>
			</div>
		`, {
			uid    : comment.uid,
			level  : level,
			author : comment.author,
			text   : comment.explanation.split("\n"),
			createdOn   : new Date(comment.createdon).toLocaleString(),
			replyIndex  : replyIndex,
			showReply  : level === 0,
			avatar : comment.avatar,
			hasAvatar : comment.avatar.length > 0,
			editable: comment.editable,
			lastEdit: comment.lastEdit ? new Date(comment.lastEdit).toLocaleString() : ''
		});

		// render replies
		if (comment.replies && Object.keys(comment.replies).length > 0) {
			level++;
			Object.values(comment.replies).forEach((repliesComment, replyIndex) => {
				replyIndex++;
				template += renderComment(repliesComment, pid, recordUid, recordTable, commentUid, template, level, replyIndex);
			});
		}

		return template;
	}

	/**
	 * render
	 * @param pid
	 * @param recordUid
	 * @param recordTable
	 * @param comments
	 * @return {string}
	 */
	me.render = function(pid, recordUid, recordTable, comments) {

		// render comments
		let renderedComments = '';
		comments.forEach(comment => {
			renderedComments += renderComment(comment, pid, recordUid, recordTable, comment.uid);
		});

		let template = '';

		// check if comment section is needed
		if (comments.length > 0) {
			template += `
				<h3>Comments (${comments.length})</h3>
				<div>
					${renderedComments}
				</div>`
		}

		// add comment form
		template += `
			<h3 class="b_annotate__add-comment__headline">Add new comment</h3>
			<div class="b_annotate__add-comment__container bJS_add-comment-container">
				${renderAddCommentForm(pid, recordUid, recordTable, 0)}
			</div>
		`;

		return template;
	};

	/**
	 * render 'open comments' button
	 * used for page module
	 *
	 * @param recordUid
	 * @param recordTable
	 * @param commentCount
	 * @return {string}
	 */
	me.renderOpenCommentsButton = function(recordUid, recordTable, commentCount = 0) {
		return Mustache.render(`
			<a 
				class="btn btn-default bJS_annotate-open-comments"
				href="#"
				data-recordtable="${recordTable}"
				data-recorduid="${recordUid}"
			>
				{{#hasComments}}
					${s.commentIcon} Comments <span class="b_annotate__badge">${commentCount}</span>
				{{/hasComments}}
				{{^hasComments}}
					{{#isPageComment}}
						${s.commentIcon} Add Comment to Page
					{{/isPageComment}}
					{{^isPageComment}}
						${s.commentIcon} Add Comment
					{{/isPageComment}}
				{{/hasComments}}
			</a>
		`, {
			hasComments: commentCount > 0,
			isPageComment: recordTable === 'pages'
		});
	};

	/**
	 * render 'open comments' list button
	 * used for list module
	 *
	 * @param recordUid
	 * @param recordTable
	 * @param commentCount
	 * @return {string}
	 */
	me.renderOpenCommentsListButton = function(recordUid, recordTable, commentCount = 0) {
		return Mustache.render(`
			<a 
				class="btn btn-default bJS_annotate-open-comments"
				href="#"
				data-recordtable="${recordTable}"
				data-recorduid="${recordUid}"
			>
				{{#hasComments}}
					${s.commentIcon} <span class="b_annotate__badge b_annotate__badge--inline">${commentCount}</span>
				{{/hasComments}}
				{{^hasComments}}
					${s.commentIcon}
				{{/hasComments}}
			</a>
		`, {
			hasComments: commentCount > 0
		});
	};

	return initialize();
});
