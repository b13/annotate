import {html, render} from 'lit-html';

class Sidebar {
		s = {
			$elem: document.createElement('div'),
			$sidebar: document.createElement('div'),
			$overlay: document.createElement('div')
		};

	constructor() {
		this.appendSidebarSetup();
		this.events();
	}

	/**
	 * append sidebar setup
	 */
	appendSidebarSetup() {
		this.s.$elem.classList.add('b_sidebar__container', 'b_sidebar__container--hidden');
		document.body.appendChild(this.s.$elem);
		this.s.$sidebar.classList.add('b_sidebar__content');
		this.s.$overlay.classList.add('b_sidebar__overlay');
		this.s.$elem.appendChild(this.s.$sidebar);
		this.s.$elem.appendChild(this.s.$overlay);
	}

	/**
	 *
	 */
	events() {
		this.s.$overlay.addEventListener('click', () => {
			this.hide();
		});
	}

	/**
	 * show sidebar
	 * @param $content
	 */
	show($content = null) {
		if (!$content) {
			return;
		}

		// render($content.innerHtml, this.s.$sidebar);
		this.s.$sidebar.appendChild($content);
		this.s.$elem.classList.remove('b_sidebar__container--hidden');
		window.setTimeout(() => {
			this.s.$sidebar.classList.add('b_sidebar__content--active');
			this.s.$overlay.classList.add('b_sidebar__overlay--active');
		},100);
	};

	/**
	 * hide sidebar
	 */
	hide() {
		while (this.s.$sidebar.firstChild) {
			this.s.$sidebar.firstChild.remove();
		}
		this.s.$sidebar.classList.remove('b_sidebar__content--active');
		this.s.$overlay.classList.remove('b_sidebar__overlay--active');
		window.setTimeout(() => {
			this.s.$elem.classList.add('b_sidebar__container--hidden');
		}, 250);
	};
}

export default Sidebar;
