$(function(){
	
	function gen_bar_div()
	{
		var bar = '<div id="axcid_bar"></div>';
		return bar;
	}
	
	function show_bar()
	{
		if ($('#axcid_bar').length < 1) $('body').append(gen_bar_div());
		$('#body-container').addClass('yt-pulldown');
	}
	
	function hide_bar()
	{
		$("#axcid_bar").remove();
		$('#body-container').removeClass('yt-pulldown');
	}

    function try_detect_music()
    {
        var original_title = $('.watch-title').text().trim();
        original_title = original_title.replace('"', '');
        axcid.debug_log("orig title: "+original_title);

        var is_music = false;

        var category = $("#eow-category").text();
        if (category.toLowerCase().indexOf("music") != -1)
        {
            is_music = true;
        }

        var description = $("#eow-description").text();
        if (description.indexOf("soundcloud.com") != -1 || description.indexOf("bandcamp.com") != -1 || description.indexOf("music") != -1)
        {
            is_music = true;
        }

        var song_object = song_lex(original_title);
        console.log(song_object);

        if (is_music && song_object)
        {
            show_bar();
            var text = song_object.artists[0] + " - " + song_object.title;
            if (song_object.additional_artists.length >= 1)
            {
                text += " featuring " + song_object.additional_artists.join(', ');
            }
            if (song_object.is_remix)
            {
                text += " remixed by " +  song_object.remix_artists.join(', ');
            }
            $("#axcid_bar").html('<span>' + text + '</span>');
        }
        else
        {
            hide_bar();
        }
    }

    var old_title = "";
    function interval_detect()
    {
        var location = window.location+"";
        if (location.indexOf("watch") == -1) return;

        if ($('.watch-title').text() == old_title) return;
        try_detect_music();
        old_title = $('.watch-title').text();
        var video = (location.split('?v=')[1]);
        axcid.debug_log('dbg: '+video);

    }
    setInterval(interval_detect, 1000);
    interval_detect();

    console.log('something');
	
});