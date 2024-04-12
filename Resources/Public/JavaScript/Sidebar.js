define([

], function() {

	const
		me = this,
		s = {

		};

	function initialize() {

		appendSidebarSetup();
		events();

		return me;
	}

	/**
	 * append sidebar setup
	 */
	function appendSidebarSetup() {
		s.$elem = document.createElement('div');
		s.$sidebar = document.createElement('div');
		s.$overlay = document.createElement('div');
		document.body.appendChild(s.$elem);

		s.$elem.classList.add('b_sidebar__container', 'b_sidebar__container--hidden');
		s.$sidebar.classList.add('b_sidebar__content');
		s.$overlay.classList.add('b_sidebar__overlay');
		s.$elem.appendChild(s.$sidebar);
		s.$elem.appendChild(s.$overlay);
	}

	/**
	 *
	 */
	function events() {
		s.$overlay.addEventListener('click', function() {
			me.hide();
		});
	}

	/**
	 * show sidebar
	 * @param $content
	 */
	me.show = function($content = null) {
		if (!$content) {
			return;
		}
		s.$sidebar.appendChild($content);
		s.$elem.classList.remove('b_sidebar__container--hidden');
		window.setTimeout(() => {
			s.$sidebar.classList.add('b_sidebar__content--active');
			s.$overlay.classList.add('b_sidebar__overlay--active');
		},100);
	};

	/**
	 * hide sidebar
	 */
	me.hide = function() {
		while (s.$sidebar.firstChild) {
			s.$sidebar.firstChild.remove();
		}
		s.$sidebar.classList.remove('b_sidebar__content--active');
		s.$overlay.classList.remove('b_sidebar__overlay--active');
		window.setTimeout(() => {
			s.$elem.classList.add('b_sidebar__container--hidden');
		}, 250);
	};

	return initialize();
});
