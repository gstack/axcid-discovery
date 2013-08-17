var axcid_log = "";
var axcid = {};
window.axcid = axcid;
function debug_log(t)
{
    axcid_log += t + "\n";
    console.log(t);
}
function print_debug_log(){ console.log(axcid_log); }
axcid.debug_log = debug_log;
axcid.log = axcid.debug_log;

var WORDS_FEATURE = ['&', 'ft.', 'feat.', 'feat ', 'feat', ' x ', 'by'];
var WORDS_REMIX = ['remix', 'bootleg', 'prod.', 'prod', 'edit'];
var WORDS_REMOVE = ["explicit", "(explicit)"];

function string_in_between(src, left, right)
{
    var s = src.substring(src.indexOf(left) + left.length);
    s = s.substring(0, s.indexOf(right));
    return s;
}

function strings_in_between(src, left, right)
{
    var values = [];
    var look_index = 0;

    while (true)
    {
        if (src.indexOf(left) == -1 || src.indexOf(right) == -1) break;

        var s = src.substring(src.indexOf(left) + left.length);
        s = s.substring(0, s.indexOf(right));

        var new_left = src.indexOf(s) + s.length;
        if (new_left >= src.length) break;

        src = src.substring(new_left);
        values.push(s);
    }

    return values;
}

function contains_list(text, list)
{
    text = text.toLowerCase();
    for (var i=0;i<list.length;i++) {
        if( text.indexOf(list[i].toLowerCase()) != -1 ) return true;
    }
    return false;
}

function remove_list(text, list)
{
    for (var i=0; i < list.length; i++)
    {
        var regex = new RegExp(list[i], 'gi');
        text = text.replace(regex, "");
    }
    return text;
}

function in_list(word, list)
{
    for (var i=0;i<list.length;i++) {
        if( list[i] == word ) return true;
    }
    return false;
}

var is_remix = false;
var remix_artists = [];

function lex_artists(part, in_title)
{
    axcid.log('Lex artists: '+part);
    var tokens = part.split(' ');
    var in_artist = true; // are we currently processing a single artist name?
    var artist_bit = "";
    var artists = [];
    var is_this_remix = false;

    if (contains_list(part, WORDS_REMIX))
    {
        is_this_remix = true;
        is_remix = true;
    }

    function add_return_artist(bit)
    {
        bit = bit.trim();
        bit = remove_list(bit, WORDS_REMIX).trim();
        if (bit != "")
        {
            if (!is_this_remix)
            {
                artists.push(bit);
            }
            else
            {
                remix_artists.push(bit);
            }
        }
    }

    for (var i=0;i<tokens.length;i++)
    {
        if (in_list(tokens[i].toLowerCase(), WORDS_FEATURE))
        {
            add_return_artist(artist_bit);
            artist_bit = "";
        }
        else
        {
            artist_bit += tokens[i] + " ";
        }
    }
    add_return_artist(artist_bit);

    //console.log("CHARCODE:"+artists[0].charCodeAt(artists[0].length-1));
    return artists;
    debugger;
}

function song_lex(text)
{
    var bup_words = WORDS_FEATURE;
    var artists = [];
    var additional_artists = [];
    var title = "";
    is_remix = false;
    remix_artists = [];

    text = text.replace(":", "-");
    text = remove_list(text, WORDS_REMOVE);

    var other_blocks = strings_in_between(text, "[", "]");
    other_blocks = other_blocks.concat(strings_in_between(text, "(", ")"));

    if (other_blocks.length >= 1)
    {
        for (var i=0; i<other_blocks.length;i++)
        {
            console.log('other block ' + other_blocks[i]);
            var artists_x = lex_artists(other_blocks[i]);
            additional_artists = additional_artists.concat(artists_x);
            text = text.replace("("+other_blocks[i]+")", "");
            text = text.replace("["+other_blocks[i]+"]", "");
        }
    }

    if (text.indexOf("-") != -1)
    {
        var artist_part = text.split('-')[0];
        artists = lex_artists(artist_part);

        title = text.split('-')[1].trim();

     //   WORDS_FEATURE = WORDS_FEATURE.slice(1, 1);
        if (contains_list(title, WORDS_FEATURE))
        {
            for (var i=0;i<WORDS_FEATURE.length;i++)
            {
                if (WORDS_FEATURE[i] == "&") continue;
                if (title.indexOf(WORDS_FEATURE[i]) != -1)
                {
                    var feature_artists = lex_artists(title.substr(title.indexOf(WORDS_FEATURE[i])));
                    additional_artists = additional_artists.concat(feature_artists);

                    title = title.substring(0, title.indexOf(WORDS_FEATURE[i]));
                    break;
                }
            }
        }
    }
    else
    {
        return null;
    }

    axcid.log("artists:");
    axcid.log(artists);
    axcid.log("additional artists:");
    axcid.log(additional_artists);

    WORDS_FEATURE = bup_words;

    return {
        is_remix: is_remix,
        artists: artists,
        title: title,
        additional_artists: additional_artists,
        remix_artists: remix_artists
    };
}
