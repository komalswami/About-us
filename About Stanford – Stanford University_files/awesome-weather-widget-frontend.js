

// GLOBAL FUNCTIONS
function awesome_weather_show_form( awe_widget_id ) 
{
	awe_stop_loading( awe_widget_id );
	
	jQuery('#' + awe_widget_id + ' .awesome-weather-form').show();
	jQuery('#' + awe_widget_id + ' .awesome-weather-form input').focus();
	jQuery('#' + awe_widget_id + ' .awesome-weather-blankout').show();
	
	jQuery(document).delegate('#' + awe_widget_id + ' .awesome-weather-blankout', 'click', function(e) 
	{
		jQuery('#' + awe_widget_id + ' .awesome-weather-form').hide();
		jQuery('#' + awe_widget_id + ' .awesome-weather-blankout').hide();
	});
}
	
function awe_stop_loading( awe_widget_id )
{
	
	jQuery('#' + awe_widget_id + ' .awesome-weather-blankout .awe-loading').hide();
}	

// 2.0 - AJAX LOADING
function awe_ajax_load( weather )
{
	var widget_obj = weather;
	widget_obj.action ='awesome_weather_refresh';
	jQuery.post(widget_obj.ajaxurl, widget_obj, function( response ) 
	{
		jQuery('.awe-ajax-' + widget_obj.id).html( response );
	});
}


// DOCUMENT LOAD
jQuery(document).ready(function()
{
	
	// CHANGE LOCATION FORM
	jQuery(document).on('submit', '.awesome-weather-form', function(e)
	{
		e.preventDefault();
		
		var this_form 		= jQuery(this);
		
		var awe_widget_id 	= this_form.data('widget-id');
		var current_widget 	= jQuery('#' + awe_widget_id);

		var user_location 	= this_form.children('input').val();
 
		current_widget.find('.awesome-weather-blankout .awesome-weather-blankout-error').hide();
 
		if( user_location )
		{
			// SHOW LOADING
			current_widget.find('.awesome-weather-blankout .awe-loading').show();
			current_widget.find('.awesome-weather-form').hide();
			
			var widget_obj = awe['awe_weather_widget_json_' + awe_widget_id];
			widget_obj.longlat_location = "0";
			widget_obj.user_location = user_location;

			// PASS WEATHER OBJECT BACK THROUGH THE SYSTEM
			jQuery.post(awe['ajaxurl'], widget_obj, function( response ) 
			{
				if( response == "false" || response == false || response == "" || (response.indexOf('awesome-weather-error') >= 0) )
				{
					awesome_weather_show_form( awe_widget_id );
					current_widget.find('.awesome-weather-blankout .awesome-weather-blankout-error').show();
				}
				else
				{
					// SPIT BACK THE RESULTS IN THE CONTAINER
					current_widget.replaceWith( response );
					current_widget.find('.awesome-weather-blankout .awesome-weather-blankout-error').hide();
				}
				
				// SET COOKIE OF CITY ID
				var new_city_id = jQuery(response).find('.awesome-weather-form').data('city-id');
				if( new_city_id )
				{
					Cookies.set('awe_' + widget_obj.provider + '_city_id', new_city_id, { expires: 14 } );
				}
				
				// STOP LOADING
				awe_stop_loading( awe_widget_id );
			});
		}

		e.preventDefault();
	});
	

	// WEATHER TRIGGER FROM CLICK
	jQuery(document).on('click', '.awe-weather-trigger a', function(e) 
	{
		e.preventDefault();
		
		var this_btn = jQuery(this);
		this_btn.addClass('loading');
		
		var awe_widget_id 	= this_btn.data('widget-id');
		var current_widget = jQuery('#' + awe_widget_id);
		
		// HIDE WEATHER BUBBLE
		current_widget.find('.awe-weather-bubble').hide();

		// GET OBJECT OF WEATHER
		var widget_obj = awe['awe_weather_widget_json_' + awe_widget_id];
		
		// JUST SHOW FORM
		var show_form_first = false;
		
		// WIDGET ATTRIBUTE: skip_geolocate
		if( widget_obj.skip_geolocate !== 'undefined' )
		{
			if( widget_obj.skip_geolocate ) { show_form_first = true; }
		}


		if( show_form_first )
		{
			awesome_weather_show_form( awe_widget_id );
			e.preventDefault();
			return false;
		}
		
		// SHOW LOADING
		current_widget.find('.awesome-weather-blankout').show();
		
		
		// CHECK IF HTML5 GEOLOCATION IS AVAILABLE
		if( navigator.geolocation ) 
		{
			var geo_options = { enableHighAccuracy: true, timeout: 5000 };
			
			// GET POSITION
        	navigator.geolocation.getCurrentPosition(awesome_weather_set_location, awesome_weather_show_form_to_user, geo_options );
    	} 
    	else 
    	{
	    	// NO GEO LOCATION, SHOW FORM
			awesome_weather_show_form( awe_widget_id );
		}
		
		
		function awesome_weather_show_form_to_user()
		{
			awesome_weather_show_form( awe_widget_id );
		}
		
		function awesome_weather_set_location( position ) 
		{
		
			// SAVE LOCATION AND REFRESH
			var widget_obj = awe['awe_weather_widget_json_' + awe_widget_id];
			
		
			// ADD IP LOCATION TO NEW WEATHER OBJECT
			widget_obj.longlat_location = position.coords.latitude + "," + position.coords.longitude;
			widget_obj.longlat_triggered = "1";
		
			// PASS WEATHER OBJECT BACK THROUGH THE SYSTEM
			jQuery.post(awe['ajaxurl'], widget_obj, function(response) 
			{
				// SPIT BACK THE RESULTS IN THE CONTAINER
				current_widget.replaceWith( response );
				
				// SET COOKIE OF CITY ID
				var new_city_id = jQuery(response).find('.awesome-weather-form').data('city-id');
				if( new_city_id )
				{
					Cookies.set('awe_' + widget_obj.provider + '_city_id', new_city_id, { expires: 7 });
				}
				
				// STOP LOADING
				awe_stop_loading( awe_widget_id );
			});
		}

		return false;
	});

});