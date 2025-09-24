define(['vendor/jquery'], function($) {

	$('body').on('click', '.blind', function(event) {

		var target = $(event.target),
			_this = target.hasClass('blind') ? target : target.closest('.blind'),
			element = $(_this).siblings('.blindBox');

		if (element) {
			$(_this).toggleClass('be_on');
			element.toggleClass('be_on');
		}
	});
});