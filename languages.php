<?php
// languages.php
session_start(); // Inicia la sesión

$languages = [
    ['code' => 'aa', 'name' => 'Afar', 'flag' => '🇪🇷', 'text_direction' => 'ltr'],
    ['code' => 'ab', 'name' => 'Аҧсуа', 'flag' => '🇬🇪', 'text_direction' => 'ltr'],
    ['code' => 'ace', 'name' => 'Acehnese', 'flag' => '🇮🇩', 'text_direction' => 'ltr'],
    ['code' => 'ady', 'name' => 'Adyghe', 'flag' => '🇷🇺', 'text_direction' => 'ltr'],
    ['code' => 'af', 'name' => 'Afrikaans', 'flag' => '🇿🇦', 'text_direction' => 'ltr'],
    ['code' => 'ak', 'name' => 'Akan', 'flag' => '🇬🇭', 'text_direction' => 'ltr'],
    ['code' => 'als', 'name' => 'Alemannic', 'flag' => '🇨🇭', 'text_direction' => 'ltr'],
    ['code' => 'alt', 'name' => 'Southern Altai', 'flag' => '🇷🇺', 'text_direction' => 'ltr'],
    ['code' => 'ami', 'name' => 'Ami', 'flag' => '🇹🇼', 'text_direction' => 'ltr'],
    ['code' => 'am', 'name' => 'Amharic', 'flag' => '🇪🇹', 'text_direction' => 'ltr'],
    ['code' => 'ang', 'name' => 'Old English', 'flag' => '🇬🇧', 'text_direction' => 'ltr'],
    ['code' => 'ann', 'name' => 'Anuak', 'flag' => '🇸🇸', 'text_direction' => 'ltr'],
    ['code' => 'anp', 'name' => 'Angika', 'flag' => '🇮🇳', 'text_direction' => 'ltr'],
    ['code' => 'an', 'name' => 'Aragonese', 'flag' => '🇪🇸', 'text_direction' => 'ltr'],
    ['code' => 'arc', 'name' => 'Aramaic', 'flag' => '🇮🇱', 'text_direction' => 'rtl'],
    ['code' => 'ar', 'name' => 'Arabic', 'flag' => '🇸🇦', 'text_direction' => 'rtl'],
    ['code' => 'ary', 'name' => 'Moroccan Arabic', 'flag' => '🇲🇦', 'text_direction' => 'rtl'],
    ['code' => 'arz', 'name' => 'Egyptian Arabic', 'flag' => '🇪🇬', 'text_direction' => 'rtl'],
    ['code' => 'ast', 'name' => 'Asturian', 'flag' => '🇪🇸', 'text_direction' => 'ltr'],
    ['code' => 'as', 'name' => 'Assamese', 'flag' => '🇮🇳', 'text_direction' => 'ltr'],
    ['code' => 'atj', 'name' => 'Atikamekw', 'flag' => '🇨🇦', 'text_direction' => 'ltr'],
    ['code' => 'avk', 'name' => 'Avaric', 'flag' => '🇷🇺', 'text_direction' => 'ltr'],
    ['code' => 'av', 'name' => 'Avar', 'flag' => '🇷🇺', 'text_direction' => 'ltr'],
    ['code' => 'awa', 'name' => 'Awadhi', 'flag' => '🇮🇳', 'text_direction' => 'ltr'],
    ['code' => 'ay', 'name' => 'Aymara', 'flag' => '🇧🇴', 'text_direction' => 'ltr'],
    ['code' => 'azb', 'name' => 'South Azerbaijani', 'flag' => '🇮🇷', 'text_direction' => 'rtl'],
    ['code' => 'az', 'name' => 'Azerbaijani', 'flag' => '🇦🇿', 'text_direction' => 'ltr'],
    ['code' => 'ban', 'name' => 'Balinese', 'flag' => '🇮🇩', 'text_direction' => 'ltr'],
    ['code' => 'bar', 'name' => 'Bavarian', 'flag' => '🇩🇪', 'text_direction' => 'ltr'],
    ['code' => 'ba', 'name' => 'Bashkir', 'flag' => '🇷🇺', 'text_direction' => 'ltr'],
    ['code' => 'bbc', 'name' => 'Batak Toba', 'flag' => '🇮🇩', 'text_direction' => 'ltr'],
    ['code' => 'bcl', 'name' => 'Bikol Central', 'flag' => '🇵🇭', 'text_direction' => 'ltr'],
    ['code' => 'bdr', 'name' => 'Banda', 'flag' => '🇿🇦', 'text_direction' => 'ltr'],
    ['code' => 'bew', 'name' => 'Bemba', 'flag' => '🇿🇲', 'text_direction' => 'ltr'],
    ['code' => 'bg', 'name' => 'Bulgarian', 'flag' => '🇧🇬', 'text_direction' => 'ltr'],
    ['code' => 'bh', 'name' => 'Bihari', 'flag' => '🇮🇳', 'text_direction' => 'ltr'],
    ['code' => 'bi', 'name' => 'Bislama', 'flag' => '🇻🇺', 'text_direction' => 'ltr'],
    ['code' => 'bjn', 'name' => 'Banjarese', 'flag' => '🇮🇩', 'text_direction' => 'ltr'],
    ['code' => 'blk', 'name' => 'Blackfoot', 'flag' => '🇺🇸', 'text_direction' => 'ltr'],
    ['code' => 'bm', 'name' => 'Bambara', 'flag' => '🇧🇱', 'text_direction' => 'ltr'],
    ['code' => 'bn', 'name' => 'Bengali', 'flag' => '🇧🇩', 'text_direction' => 'ltr'],
    ['code' => 'bo', 'name' => 'Tibetan', 'flag' => '🇮🇹', 'text_direction' => 'ltr'],
    ['code' => 'bpy', 'name' => 'Bishnupriya', 'flag' => '🇮🇳', 'text_direction' => 'ltr'],
    ['code' => 'br', 'name' => 'Breton', 'flag' => '🇫🇷', 'text_direction' => 'ltr'],
    ['code' => 'bs', 'name' => 'Bosnian', 'flag' => '🇧🇦', 'text_direction' => 'ltr'],
    ['code' => 'btm', 'name' => 'Bhatri', 'flag' => '🇮🇳', 'text_direction' => 'ltr'],
    ['code' => 'bug', 'name' => 'Buginese', 'flag' => '🇮🇩', 'text_direction' => 'ltr'],
    ['code' => 'bxr', 'name' => 'Buryat', 'flag' => '🇷🇺', 'text_direction' => 'ltr'],
    ['code' => 'ca', 'name' => 'Catalan', 'flag' => '🇪🇸', 'text_direction' => 'ltr'],
    ['code' => 'cd', 'name' => 'Chadian Arabic', 'flag' => '🇹🇩', 'text_direction' => 'rtl'],
    ['code' => 'ceb', 'name' => 'Cebuano', 'flag' => '🇵🇭', 'text_direction' => 'ltr'],
    ['code' => 'ce', 'name' => 'Chechen', 'flag' => '🇷🇺', 'text_direction' => 'ltr'],
    ['code' => 'cho', 'name' => 'Choctaw', 'flag' => '🇺🇸', 'text_direction' => 'ltr'],
    ['code' => 'chr', 'name' => 'Cherokee', 'flag' => '🇺🇸', 'text_direction' => 'ltr'],
    ['code' => 'ch', 'name' => 'Chamorro', 'flag' => '🇬🇺', 'text_direction' => 'ltr'],
    ['code' => 'chy', 'name' => 'Cheyenne', 'flag' => '🇺🇸', 'text_direction' => 'ltr'],
    ['code' => 'ckb', 'name' => 'Central Kurdish', 'flag' => '🇮🇶', 'text_direction' => 'rtl'],
    ['code' => 'co', 'name' => 'Corsican', 'flag' => '🇫🇷', 'text_direction' => 'ltr'],
    ['code' => 'crh', 'name' => 'Crimean Tatar', 'flag' => '🇺🇦', 'text_direction' => 'ltr'],
    ['code' => 'cr', 'name' => 'Cree', 'flag' => '🇨🇦', 'text_direction' => 'ltr'],
    ['code' => 'csb', 'name' => 'Kashubian', 'flag' => '🇵🇱', 'text_direction' => 'ltr'],
    ['code' => 'cs', 'name' => 'Czech', 'flag' => '🇨🇿', 'text_direction' => 'ltr'],
    ['code' => 'cu', 'name' => 'Church Slavic', 'flag' => '🇷🇺', 'text_direction' => 'ltr'],
    ['code' => 'cv', 'name' => 'Chuvash', 'flag' => '🇷🇺', 'text_direction' => 'ltr'],
    ['code' => 'cy', 'name' => 'Welsh', 'flag' => '🇬🇧', 'text_direction' => 'ltr'],
    ['code' => 'dag', 'name' => 'Dagaare', 'flag' => '🇬🇭', 'text_direction' => 'ltr'],
    ['code' => 'da', 'name' => 'Danish', 'flag' => '🇩🇰', 'text_direction' => 'ltr'],
    ['code' => 'de', 'name' => 'German', 'flag' => '🇩🇪', 'text_direction' => 'ltr'],
    ['code' => 'dga', 'name' => 'Dagami', 'flag' => '🇵🇭', 'text_direction' => 'ltr'],
    ['code' => 'din', 'name' => 'Dinka', 'flag' => '🇸🇸', 'text_direction' => 'ltr'],
    ['code' => 'diq', 'name' => 'Dimli', 'flag' => '🇹🇷', 'text_direction' => 'ltr'],
    ['code' => 'dsb', 'name' => 'Lower Sorbian', 'flag' => '🇩🇪', 'text_direction' => 'ltr'],
    ['code' => 'dtp', 'name' => 'Central Dusun', 'flag' => '🇲🇾', 'text_direction' => 'ltr'],
    ['code' => 'dty', 'name' => 'Dogri', 'flag' => '🇮🇳', 'text_direction' => 'ltr'],
    ['code' => 'dv', 'name' => 'Dhivehi', 'flag' => '🇲🇻', 'text_direction' => 'rtl'],
    ['code' => 'dz', 'name' => 'Dzongkha', 'flag' => '🇧🇹', 'text_direction' => 'ltr'],
    ['code' => 'ee', 'name' => 'Ewe', 'flag' => '🇬🇭', 'text_direction' => 'ltr'],
    ['code' => 'el', 'name' => 'Greek', 'flag' => '🇬🇷', 'text_direction' => 'ltr'],
    ['code' => 'eml', 'name' => 'Emilian-Romagnol', 'flag' => '🇮🇹', 'text_direction' => 'ltr'],
    ['code' => 'en', 'name' => 'English', 'flag' => '🇬🇧', 'text_direction' => 'ltr'],
    ['code' => 'eo', 'name' => 'Esperanto', 'flag' => '🇪🇸', 'text_direction' => 'ltr'],
    ['code' => 'es', 'name' => 'Spanish', 'flag' => '🇪🇸', 'text_direction' => 'ltr'],
    ['code' => 'et', 'name' => 'Estonian', 'flag' => '🇪🇪', 'text_direction' => 'ltr'],
    ['code' => 'eu', 'name' => 'Basque', 'flag' => '🇪🇸', 'text_direction' => 'ltr'],
    ['code' => 'ext', 'name' => 'Extremaduran', 'flag' => '🇪🇸', 'text_direction' => 'ltr'],
    ['code' => 'fat', 'name' => 'Fanti', 'flag' => '🇬🇭', 'text_direction' => 'ltr'],
    ['code' => 'fa', 'name' => 'Persian', 'flag' => '🇮🇷', 'text_direction' => 'rtl'],
    ['code' => 'ff', 'name' => 'Fulah', 'flag' => '🇸🇳', 'text_direction' => 'ltr'],
    ['code' => 'fi', 'name' => 'Finnish', 'flag' => '🇫🇮', 'text_direction' => 'ltr'],
    ['code' => 'fj', 'name' => 'Fijian', 'flag' => '🇫🇯', 'text_direction' => 'ltr'],
    ['code' => 'fon', 'name' => 'Fon', 'flag' => '🇧🇯', 'text_direction' => 'ltr'],
    ['code' => 'fo', 'name' => 'Faroese', 'flag' => '🇫🇴', 'text_direction' => 'ltr'],
    ['code' => 'frp', 'name' => 'Francoprovençal', 'flag' => '🇫🇷', 'text_direction' => 'ltr'],
    ['code' => 'frr', 'name' => 'Northern Frisian', 'flag' => '🇩🇰', 'text_direction' => 'ltr'],
    ['code' => 'fr', 'name' => 'French', 'flag' => '🇫🇷', 'text_direction' => 'ltr'],
    ['code' => 'fur', 'name' => 'Friulian', 'flag' => '🇮🇹', 'text_direction' => 'ltr'],
    ['code' => 'fy', 'name' => 'Frisian', 'flag' => '🇳🇱', 'text_direction' => 'ltr'],
    ['code' => 'gag', 'name' => 'Gagauz', 'flag' => '🇲🇩', 'text_direction' => 'ltr'],
    ['code' => 'gan', 'name' => 'Gan Chinese', 'flag' => '🇨🇳', 'text_direction' => 'ltr'],
    ['code' => 'ga', 'name' => 'Irish', 'flag' => '🇮🇪', 'text_direction' => 'ltr'],
    ['code' => 'gcr', 'name' => 'Guianese Creole', 'flag' => '🇬🇾', 'text_direction' => 'ltr'],
    ['code' => 'gd', 'name' => 'Scottish Gaelic', 'flag' => '🇬🇧', 'text_direction' => 'ltr'],
    ['code' => 'glk', 'name' => 'Gilaki', 'flag' => '🇮🇷', 'text_direction' => 'ltr'],
    ['code' => 'gl', 'name' => 'Galician', 'flag' => '🇪🇸', 'text_direction' => 'ltr'],
    ['code' => 'gn', 'name' => 'Guarani', 'flag' => '🇧🇷', 'text_direction' => 'ltr'],
    ['code' => 'gom', 'name' => 'Goan Konkani', 'flag' => '🇮🇳', 'text_direction' => 'ltr'],
    ['code' => 'gor', 'name' => 'Gorib', 'flag' => '🇮🇩', 'text_direction' => 'ltr'],
    ['code' => 'got', 'name' => 'Gothic', 'flag' => '🇩🇪', 'text_direction' => 'ltr'],
    ['code' => 'gpe', 'name' => 'Guinea-Bissau Portuguese Creole', 'flag' => '🇬🇼', 'text_direction' => 'ltr'],
    ['code' => 'guc', 'name' => 'Wayuu', 'flag' => '🇻🇪', 'text_direction' => 'ltr'],
    ['code' => 'gur', 'name' => 'Frafra', 'flag' => '🇬🇭', 'text_direction' => 'ltr'],
    ['code' => 'gu', 'name' => 'Gujarati', 'flag' => '🇮🇳', 'text_direction' => 'ltr'],
    ['code' => 'guw', 'name' => 'Wolof', 'flag' => '🇸🇳', 'text_direction' => 'ltr'],
    ['code' => 'gv', 'name' => 'Manx', 'flag' => '🇬🇧', 'text_direction' => 'ltr'],
    ['code' => 'ha', 'name' => 'Hausa', 'flag' => '🇳🇬', 'text_direction' => 'ltr'],
    ['code' => 'haw', 'name' => 'Hawaiian', 'flag' => '🇺🇸', 'text_direction' => 'ltr'],
    ['code' => 'hew', 'name' => 'Hebrew', 'flag' => '🇮🇱', 'text_direction' => 'rtl'],
    ['code' => 'hif', 'name' => 'Fiji Hindi', 'flag' => '🇫🇯', 'text_direction' => 'ltr'],
    ['code' => 'hi', 'name' => 'Hindi', 'flag' => '🇮🇳', 'text_direction' => 'ltr'],
    ['code' => 'ho', 'name' => 'Hiri Motu', 'flag' => '🇵🇬', 'text_direction' => 'ltr'],
    ['code' => 'hr', 'name' => 'Croatian', 'flag' => '🇭🇷', 'text_direction' => 'ltr'],
    ['code' => 'hsb', 'name' => 'Upper Sorbian', 'flag' => '🇩🇪', 'text_direction' => 'ltr'],
    ['code' => 'ht', 'name' => 'Haitian Creole', 'flag' => '🇭🇹', 'text_direction' => 'ltr'],
    ['code' => 'hu', 'name' => 'Hungarian', 'flag' => '🇭🇺', 'text_direction' => 'ltr'],
    ['code' => 'hy', 'name' => 'Armenian', 'flag' => '🇦🇲', 'text_direction' => 'ltr'],
    ['code' => 'hyw', 'name' => 'Western Armenian', 'flag' => '🇦🇲', 'text_direction' => 'ltr'],
    ['code' => 'hz', 'name' => 'Herero', 'flag' => '🇿🇦', 'text_direction' => 'ltr'],
    ['code' => 'ia', 'name' => 'Interlingua', 'flag' => '🇮🇹', 'text_direction' => 'ltr'],
    ['code' => 'iba', 'name' => 'Iban', 'flag' => '🇲🇾', 'text_direction' => 'ltr'],
    ['code' => 'id', 'name' => 'Indonesian', 'flag' => '🇮🇩', 'text_direction' => 'ltr'],
    ['code' => 'ie', 'name' => 'Interlingue', 'flag' => '🇮🇹', 'text_direction' => 'ltr'],
    ['code' => 'igl', 'name' => 'Igala', 'flag' => '🇳🇬', 'text_direction' => 'ltr'],
    ['code' => 'ig', 'name' => 'Igbo', 'flag' => '🇳🇬', 'text_direction' => 'ltr'],
    ['code' => 'ii', 'name' => 'Sichuan Yi', 'flag' => '🇨🇳', 'text_direction' => 'ltr'],
    ['code' => 'ik', 'name' => 'Inupiat', 'flag' => '🇺🇸', 'text_direction' => 'ltr'],
    ['code' => 'ilo', 'name' => 'Ilocano', 'flag' => '🇵🇭', 'text_direction' => 'ltr'],
    ['code' => 'inh', 'name' => 'Ingush', 'flag' => '🇷🇺', 'text_direction' => 'ltr'],
    ['code' => 'io', 'name' => 'Ido', 'flag' => '🇮🇹', 'text_direction' => 'ltr'],
    ['code' => 'is', 'name' => 'Icelandic', 'flag' => '🇮🇸', 'text_direction' => 'ltr'],
    ['code' => 'it', 'name' => 'Italian', 'flag' => '🇮🇹', 'text_direction' => 'ltr'],
    ['code' => 'iu', 'name' => 'Inuktitut', 'flag' => '🇨🇦', 'text_direction' => 'ltr'],
    ['code' => 'jam', 'name' => 'Jamaican Patois', 'flag' => '🇯🇲', 'text_direction' => 'ltr'],
    ['code' => 'ja', 'name' => 'Japanese', 'flag' => '🇯🇵', 'text_direction' => 'ltr'],
    ['code' => 'jbo', 'name' => 'Lojban', 'flag' => '🇬🇧', 'text_direction' => 'ltr'],
    ['code' => 'jv', 'name' => 'Javanese', 'flag' => '🇮🇩', 'text_direction' => 'ltr'],
    ['code' => 'kaa', 'name' => 'Kara-Kalpak', 'flag' => '🇺🇿', 'text_direction' => 'ltr'],
    ['code' => 'kab', 'name' => 'Kabyle', 'flag' => '🇩🇿', 'text_direction' => 'ltr'],
    ['code' => 'ka', 'name' => 'Georgian', 'flag' => '🇬🇪', 'text_direction' => 'ltr'],
    ['code' => 'kbd', 'name' => 'Kabardian', 'flag' => '🇷🇺', 'text_direction' => 'ltr'],
    ['code' => 'kbp', 'name' => 'Kwasio', 'flag' => '🇨🇲', 'text_direction' => 'ltr'],
    ['code' => 'kcg', 'name' => 'Kok-Nari', 'flag' => '🇷🇺', 'text_direction' => 'ltr'],
    ['code' => 'kg', 'name' => 'Kongo', 'flag' => '🇨🇩', 'text_direction' => 'ltr'],
    ['code' => 'kgw', 'name' => 'Kangyur', 'flag' => '🇨🇳', 'text_direction' => 'ltr'],
    ['code' => 'ki', 'name' => 'Kikuyu', 'flag' => '🇰🇪', 'text_direction' => 'ltr'],
    ['code' => 'kj', 'name' => 'Kwanyama', 'flag' => '🇦🇴', 'text_direction' => 'ltr'],
    ['code' => 'kk', 'name' => 'Kazakh', 'flag' => '🇰🇿', 'text_direction' => 'ltr'],
    ['code' => 'kl', 'name' => 'Greenlandic', 'flag' => '🇬🇱', 'text_direction' => 'ltr'],
    ['code' => 'km', 'name' => 'Khmer', 'flag' => '🇰🇭', 'text_direction' => 'ltr'],
    ['code' => 'kn', 'name' => 'Kannada', 'flag' => '🇮🇳', 'text_direction' => 'ltr'],
    ['code' => 'koi', 'name' => 'Komi-Permyak', 'flag' => '🇷🇺', 'text_direction' => 'ltr'],
    ['code' => 'ko', 'name' => 'Korean', 'flag' => '🇰🇷', 'text_direction' => 'ltr'],
    ['code' => 'krc', 'name' => 'Karachay-Balkar', 'flag' => '🇷🇺', 'text_direction' => 'ltr'],
    ['code' => 'kr', 'name' => 'Kanuri', 'flag' => '🇳🇬', 'text_direction' => 'ltr'],
    ['code' => 'ksh', 'name' => 'Colognian', 'flag' => '🇩🇪', 'text_direction' => 'ltr'],
    ['code' => 'ks', 'name' => 'Kashmiri', 'flag' => '🇮🇳', 'text_direction' => 'rtl'],
    ['code' => 'ku', 'name' => 'Kurdish', 'flag' => '🇹🇷', 'text_direction' => 'rtl'],
    ['code' => 'kv', 'name' => 'Komi', 'flag' => '🇷🇺', 'text_direction' => 'ltr'],
    ['code' => 'kw', 'name' => 'Cornish', 'flag' => '🇬🇧', 'text_direction' => 'ltr'],
    ['code' => 'ky', 'name' => 'Kirghiz', 'flag' => '🇰🇬', 'text_direction' => 'ltr'],
    ['code' => 'lad', 'name' => 'Ladino', 'flag' => '🇮🇱', 'text_direction' => 'rtl'],
    ['code' => 'la', 'name' => 'Latin', 'flag' => '🇮🇹', 'text_direction' => 'ltr'],
    ['code' => 'lb', 'name' => 'Luxembourgish', 'flag' => '🇱🇺', 'text_direction' => 'ltr'],
    ['code' => 'lez', 'name' => 'Lezghian', 'flag' => '🇷🇺', 'text_direction' => 'ltr'],
    ['code' => 'lfn', 'name' => 'Lingua Franca Nova', 'flag' => '🌍', 'text_direction' => 'ltr'],
    ['code' => 'lg', 'name' => 'Ganda', 'flag' => '🇺🇬', 'text_direction' => 'ltr'],
    ['code' => 'lij', 'name' => 'Ligurian', 'flag' => '🇮🇹', 'text_direction' => 'ltr'],
    ['code' => 'li', 'name' => 'Limburgish', 'flag' => '🇧🇪', 'text_direction' => 'ltr'],
    ['code' => 'lld', 'name' => 'Ladin', 'flag' => '🇮🇹', 'text_direction' => 'ltr'],
    ['code' => 'lmo', 'name' => 'Lombard', 'flag' => '🇮🇹', 'text_direction' => 'ltr'],
    ['code' => 'ln', 'name' => 'Lingala', 'flag' => '🇨🇩', 'text_direction' => 'ltr'],
    ['code' => 'lo', 'name' => 'Lao', 'flag' => '🇱🇦', 'text_direction' => 'ltr'],
    ['code' => 'lrc', 'name' => 'Southern Luri', 'flag' => '🇮🇷', 'text_direction' => 'rtl'],
    ['code' => 'ltg', 'name' => 'Latgalian', 'flag' => '🇱🇻', 'text_direction' => 'ltr'],
    ['code' => 'lt', 'name' => 'Lithuanian', 'flag' => '🇱🇹', 'text_direction' => 'ltr'],
    ['code' => 'lv', 'name' => 'Latvian', 'flag' => '🇱🇻', 'text_direction' => 'ltr'],
    ['code' => 'mad', 'name' => 'Madurese', 'flag' => '🇮🇩', 'text_direction' => 'ltr'],
    ['code' => 'mai', 'name' => 'Maithili', 'flag' => '🇮🇳', 'text_direction' => 'ltr'],
    ['code' => 'mdf', 'name' => 'Moksha', 'flag' => '🇷🇺', 'text_direction' => 'ltr'],
    ['code' => 'mg', 'name' => 'Malagasy', 'flag' => '🇲🇬', 'text_direction' => 'ltr'],
    ['code' => 'mhr', 'name' => 'Mari', 'flag' => '🇷🇺', 'text_direction' => 'ltr'],
    ['code' => 'mh', 'name' => 'Marshallese', 'flag' => '🇲🇭', 'text_direction' => 'ltr'],
    ['code' => 'min', 'name' => 'Minangkabau', 'flag' => '🇮🇩', 'text_direction' => 'ltr'],
    ['code' => 'mi', 'name' => 'Māori', 'flag' => '🇳🇿', 'text_direction' => 'ltr'],
    ['code' => 'mk', 'name' => 'Macedonian', 'flag' => '🇲🇰', 'text_direction' => 'ltr'],
    ['code' => 'ml', 'name' => 'Malayalam', 'flag' => '🇮🇳', 'text_direction' => 'ltr'],
    ['code' => 'mni', 'name' => 'Manipuri', 'flag' => '🇮🇳', 'text_direction' => 'ltr'],
    ['code' => 'mn', 'name' => 'Mongolian', 'flag' => '🇲🇳', 'text_direction' => 'ltr'],
    ['code' => 'mnw', 'name' => 'Minnan', 'flag' => '🇹🇼', 'text_direction' => 'ltr'],
    ['code' => 'mos', 'name' => 'Mossi', 'flag' => '🇧🇫', 'text_direction' => 'ltr'],
    ['code' => 'mrj', 'name' => 'Hill Mari', 'flag' => '🇷🇺', 'text_direction' => 'ltr'],
    ['code' => 'mr', 'name' => 'Marathi', 'flag' => '🇮🇳', 'text_direction' => 'ltr'],
    ['code' => 'ms', 'name' => 'Malay', 'flag' => '🇲🇾', 'text_direction' => 'ltr'],
    ['code' => 'mt', 'name' => 'Maltese', 'flag' => '🇲🇹', 'text_direction' => 'ltr'],
    ['code' => 'mus', 'name' => 'Muscogee', 'flag' => '🇺🇸', 'text_direction' => 'ltr'],
    ['code' => 'mwl', 'name' => 'Mirandese', 'flag' => '🇵🇹', 'text_direction' => 'ltr'],
    ['code' => 'myv', 'name' => 'Erzya', 'flag' => '🇷🇺', 'text_direction' => 'ltr'],
    ['code' => 'my', 'name' => 'Burmese', 'flag' => '🇲🇲', 'text_direction' => 'ltr'],
    ['code' => 'mzn', 'name' => 'Mazandarani', 'flag' => '🇮🇷', 'text_direction' => 'rtl'],
    ['code' => 'nah', 'name' => 'Nahuatl', 'flag' => '🇲🇽', 'text_direction' => 'ltr'],
    ['code' => 'nap', 'name' => 'Neapolitan', 'flag' => '🇮🇹', 'text_direction' => 'ltr'],
    ['code' => 'na', 'name' => 'Nauruan', 'flag' => '🇳🇷', 'text_direction' => 'ltr'],
    ['code' => 'nds', 'name' => 'Low German', 'flag' => '🇩🇪', 'text_direction' => 'ltr'],
    ['code' => 'ne', 'name' => 'Nepali', 'flag' => '🇳🇵', 'text_direction' => 'ltr'],
    ['code' => 'new', 'name' => 'Newar', 'flag' => '🇳🇵', 'text_direction' => 'ltr'],
    ['code' => 'ng', 'name' => 'Nigerian Pidgin', 'flag' => '🇳🇬', 'text_direction' => 'ltr'],
    ['code' => 'nia', 'name' => 'Nias', 'flag' => '🇮🇩', 'text_direction' => 'ltr'],
    ['code' => 'nl', 'name' => 'Dutch', 'flag' => '🇳🇱', 'text_direction' => 'ltr'],
    ['code' => 'nn', 'name' => 'Norwegian Nynorsk', 'flag' => '🇳🇴', 'text_direction' => 'ltr'],
    ['code' => 'nov', 'name' => 'Novial', 'flag' => '🌍', 'text_direction' => 'ltr'],
    ['code' => 'no', 'name' => 'Norwegian', 'flag' => '🇳🇴', 'text_direction' => 'ltr'],
    ['code' => 'nqo', 'name' => 'N’Ko', 'flag' => '🇨🇮', 'text_direction' => 'rtl'],
    ['code' => 'nrm', 'name' => 'Norman', 'flag' => '🇫🇷', 'text_direction' => 'ltr'],
    ['code' => 'nr', 'name' => 'Northern Ndebele', 'flag' => '🇿🇼', 'text_direction' => 'ltr'],
    ['code' => 'nso', 'name' => 'Northern Sotho', 'flag' => '🇿🇦', 'text_direction' => 'ltr'],
    ['code' => 'nv', 'name' => 'Navajo', 'flag' => '🇺🇸', 'text_direction' => 'ltr'],
    ['code' => 'ny', 'name' => 'Nyanja', 'flag' => '🇿🇲', 'text_direction' => 'ltr'],
    ['code' => 'oc', 'name' => 'Occitan', 'flag' => '🇫🇷', 'text_direction' => 'ltr'],
    ['code' => 'olo', 'name' => 'Olonian', 'flag' => '🇫🇮', 'text_direction' => 'ltr'],
    ['code' => 'om', 'name' => 'Oromo', 'flag' => '🇪🇹', 'text_direction' => 'ltr'],
    ['code' => 'or', 'name' => 'Odia', 'flag' => '🇮🇳', 'text_direction' => 'ltr'],
    ['code' => 'os', 'name' => 'Ossetian', 'flag' => '🇷🇺', 'text_direction' => 'ltr'],
    ['code' => 'pag', 'name' => 'Pangasinan', 'flag' => '🇵🇭', 'text_direction' => 'ltr'],
    ['code' => 'pam', 'name' => 'Pampanga', 'flag' => '🇵🇭', 'text_direction' => 'ltr'],
    ['code' => 'pap', 'name' => 'Papiamento', 'flag' => '🇼🇸', 'text_direction' => 'ltr'],
    ['code' => 'pa', 'name' => 'Punjabi', 'flag' => '🇮🇳', 'text_direction' => 'ltr'],
    ['code' => 'pcd', 'name' => 'Picard', 'flag' => '🇫🇷', 'text_direction' => 'ltr'],
    ['code' => 'pcm', 'name' => 'Nigerian Pidgin', 'flag' => '🇳🇬', 'text_direction' => 'ltr'],
    ['code' => 'pdc', 'name' => 'Pennsylvania German', 'flag' => '🇩🇪', 'text_direction' => 'ltr'],
    ['code' => 'pfl', 'name' => 'Palatine German', 'flag' => '🇩🇪', 'text_direction' => 'ltr'],
    ['code' => 'pih', 'name' => 'Pitcairn Islands', 'flag' => '🇵🇬', 'text_direction' => 'ltr'],
    ['code' => 'pi', 'name' => 'Pali', 'flag' => '🇮🇳', 'text_direction' => 'ltr'],
    ['code' => 'pl', 'name' => 'Polish', 'flag' => '🇵🇱', 'text_direction' => 'ltr'],
    ['code' => 'pms', 'name' => 'Piedmontese', 'flag' => '🇮🇹', 'text_direction' => 'ltr'],
    ['code' => 'pnb', 'name' => 'Western Punjabi', 'flag' => '🇵🇰', 'text_direction' => 'rtl'],
    ['code' => 'pnt', 'name' => 'Pontic Greek', 'flag' => '🇬🇷', 'text_direction' => 'ltr'],
    ['code' => 'ps', 'name' => 'Pashto', 'flag' => '🇦🇫', 'text_direction' => 'rtl'],
    ['code' => 'pt', 'name' => 'Portuguese', 'flag' => '🇧🇷', 'text_direction' => 'ltr'],
    ['code' => 'pwn', 'name' => 'Palauan', 'flag' => '🇵🇼', 'text_direction' => 'ltr'],
    ['code' => 'qu', 'name' => 'Quechua', 'flag' => '🇵🇪', 'text_direction' => 'ltr'],
    ['code' => 'rm', 'name' => 'Romansh', 'flag' => '🇨🇭', 'text_direction' => 'ltr'],
    ['code' => 'rmy', 'name' => 'Romani', 'flag' => '🇷🇺', 'text_direction' => 'ltr'],
    ['code' => 'rn', 'name' => 'Rundi', 'flag' => '🇧🇮', 'text_direction' => 'ltr'],
    ['code' => 'ro', 'name' => 'Romanian', 'flag' => '🇷🇴', 'text_direction' => 'ltr'],
    ['code' => 'rsk', 'name' => 'Resian', 'flag' => '🇮🇹', 'text_direction' => 'ltr'],
    ['code' => 'ru', 'name' => 'Russian', 'flag' => '🇷🇺', 'text_direction' => 'ltr'],
    ['code' => 'rw', 'name' => 'Kinyarwanda', 'flag' => '🇷🇼', 'text_direction' => 'ltr'],
    ['code' => 'sah', 'name' => 'Sakha', 'flag' => '🇷🇺', 'text_direction' => 'ltr'],
    ['code' => 'sat', 'name' => 'Santali', 'flag' => '🇮🇳', 'text_direction' => 'ltr'],
    ['code' => 'sa', 'name' => 'Sanskrit', 'flag' => '🇮🇳', 'text_direction' => 'ltr'],
    ['code' => 'scn', 'name' => 'Sicilian', 'flag' => '🇮🇹', 'text_direction' => 'ltr'],
    ['code' => 'sc', 'name' => 'Scots', 'flag' => '🇬🇧', 'text_direction' => 'ltr'],
    ['code' => 'sd', 'name' => 'Sindhi', 'flag' => '🇵🇰', 'text_direction' => 'rtl'],
    ['code' => 'se', 'name' => 'Northern Sami', 'flag' => '🇸🇪', 'text_direction' => 'ltr'],
    ['code' => 'sg', 'name' => 'Sango', 'flag' => '🇸🇬', 'text_direction' => 'ltr'],
    ['code' => 'shi', 'name' => 'Tachelhit', 'flag' => '🇲🇦', 'text_direction' => 'rtl'],
    ['code' => 'shn', 'name' => 'Shan', 'flag' => '🇲🇲', 'text_direction' => 'ltr'],
    ['code' => 'sh', 'name' => 'Serbo-Croatian', 'flag' => '🇭🇷', 'text_direction' => 'ltr'],
    ['code' => 'si', 'name' => 'Sinhalese', 'flag' => '🇱🇰', 'text_direction' => 'ltr'],
    ['code' => 'skr', 'name' => 'Siraiki', 'flag' => '🇵🇰', 'text_direction' => 'rtl'],
    ['code' => 'sk', 'name' => 'Slovak', 'flag' => '🇸🇰', 'text_direction' => 'ltr'],
    ['code' => 'sl', 'name' => 'Slovenian', 'flag' => '🇸🇮', 'text_direction' => 'ltr'],
    ['code' => 'smn', 'name' => 'Inari Sami', 'flag' => '🇫🇮', 'text_direction' => 'ltr'],
    ['code' => 'sm', 'name' => 'Samoan', 'flag' => '🇼🇸', 'text_direction' => 'ltr'],
    ['code' => 'sn', 'name' => 'Shona', 'flag' => '🇿🇼', 'text_direction' => 'ltr'],
    ['code' => 'so', 'name' => 'Somali', 'flag' => '🇸🇴', 'text_direction' => 'ltr'],
    ['code' => 'sq', 'name' => 'Albanian', 'flag' => '🇦🇱', 'text_direction' => 'ltr'],
    ['code' => 'srn', 'name' => 'Sranan Tongo', 'flag' => '🇸🇷', 'text_direction' => 'ltr'],
    ['code' => 'sr', 'name' => 'Serbian', 'flag' => '🇷🇸', 'text_direction' => 'ltr'],
    ['code' => 'ss', 'name' => 'Swati', 'flag' => '🇿🇦', 'text_direction' => 'ltr'],
    ['code' => 'stq', 'name' => 'Saterland Frisian', 'flag' => '🇩🇪', 'text_direction' => 'ltr'],
    ['code' => 'st', 'name' => 'Southern Sotho', 'flag' => '🇿🇦', 'text_direction' => 'ltr'],
    ['code' => 'su', 'name' => 'Sundanese', 'flag' => '🇮🇩', 'text_direction' => 'ltr'],
    ['code' => 'sv', 'name' => 'Swedish', 'flag' => '🇸🇪', 'text_direction' => 'ltr'],
    ['code' => 'sw', 'name' => 'Swahili', 'flag' => '🇰🇪', 'text_direction' => 'ltr'],
    ['code' => 'szl', 'name' => 'Silesian', 'flag' => '🇵🇱', 'text_direction' => 'ltr'],
    ['code' => 'szy', 'name' => 'Sami (Southern)', 'flag' => '🇸🇪', 'text_direction' => 'ltr'],
    ['code' => 'ta', 'name' => 'Tamil', 'flag' => '🇮🇳', 'text_direction' => 'ltr'],
    ['code' => 'tay', 'name' => 'Tayal', 'flag' => '🇹🇼', 'text_direction' => 'ltr'],
    ['code' => 'tcy', 'name' => 'Tulu', 'flag' => '🇮🇳', 'text_direction' => 'ltr'],
    ['code' => 'tdd', 'name' => 'Tigray', 'flag' => '🇪🇹', 'text_direction' => 'ltr'],
    ['code' => 'te', 'name' => 'Telugu', 'flag' => '🇮🇳', 'text_direction' => 'ltr'],
    ['code' => 'tg', 'name' => 'Tajik', 'flag' => '🇹🇯', 'text_direction' => 'ltr'],
    ['code' => 'th', 'name' => 'Thai', 'flag' => '🇹🇭', 'text_direction' => 'ltr'],
    ['code' => 'ti', 'name' => 'Tigrinya', 'flag' => '🇪🇷', 'text_direction' => 'ltr'],
    ['code' => 'tk', 'name' => 'Turkmen', 'flag' => '🇹🇲', 'text_direction' => 'ltr'],
    ['code' => 'tl', 'name' => 'Tagalog', 'flag' => '🇵🇭', 'text_direction' => 'ltr'],
    ['code' => 'tly', 'name' => 'Talysh', 'flag' => '🇮🇷', 'text_direction' => 'ltr'],
    ['code' => 'tn', 'name' => 'Tswana', 'flag' => '🇿🇦', 'text_direction' => 'ltr'],
    ['code' => 'to', 'name' => 'Tonga', 'flag' => '🇹🇴', 'text_direction' => 'ltr'],
    ['code' => 'tpi', 'name' => 'Tok Pisin', 'flag' => '🇵🇬', 'text_direction' => 'ltr'],
    ['code' => 'trv', 'name' => 'Taroko', 'flag' => '🇹🇼', 'text_direction' => 'ltr'],
    ['code' => 'tr', 'name' => 'Turkish', 'flag' => '🇹🇷', 'text_direction' => 'ltr'],
    ['code' => 'ts', 'name' => 'Tswana', 'flag' => '🇿🇦', 'text_direction' => 'ltr'],
    ['code' => 'tt', 'name' => 'Tatar', 'flag' => '🇷🇺', 'text_direction' => 'ltr'],
    ['code' => 'tm', 'name' => 'Tumbuka', 'flag' => '🇿🇦', 'text_direction' => 'ltr'],
    ['code' => 'tw', 'name' => 'Twi', 'flag' => '🇬🇭', 'text_direction' => 'ltr'],
    ['code' => 'tyv', 'name' => 'Tuvinian', 'flag' => '🇷🇺', 'text_direction' => 'ltr'],
    ['code' => 'ty', 'name' => 'Twi', 'flag' => '🇬🇭', 'text_direction' => 'ltr'],
    ['code' => 'udm', 'name' => 'Udmurt', 'flag' => '🇷🇺', 'text_direction' => 'ltr'],
    ['code' => 'ug', 'name' => 'Uighur', 'flag' => '🇨🇳', 'text_direction' => 'rtl'],
    ['code' => 'uk', 'name' => 'Ukrainian', 'flag' => '🇺🇦', 'text_direction' => 'ltr'],
    ['code' => 'ur', 'name' => 'Urdu', 'flag' => '🇵🇰', 'text_direction' => 'rtl'],
    ['code' => 'uz', 'name' => 'Uzbek', 'flag' => '🇺🇿', 'text_direction' => 'ltr'],
    ['code' => 'vec', 'name' => 'Venetian', 'flag' => '🇮🇹', 'text_direction' => 'ltr'],
    ['code' => 'vep', 'name' => 'Veps', 'flag' => '🇷🇺', 'text_direction' => 'ltr'],
    ['code' => 've', 'name' => 'Venda', 'flag' => '🇿🇦', 'text_direction' => 'ltr'],
    ['code' => 'vi', 'name' => 'Vietnamese', 'flag' => '🇻🇳', 'text_direction' => 'ltr'],
    ['code' => 'vls', 'name' => 'West Flemish', 'flag' => '🇧🇪', 'text_direction' => 'ltr'],
    ['code' => 'vo', 'name' => 'Volapük', 'flag' => '🇨🇭', 'text_direction' => 'ltr'],
    ['code' => 'war', 'name' => 'Waray', 'flag' => '🇵🇭', 'text_direction' => 'ltr'],
    ['code' => 'wa', 'name' => 'Walloon', 'flag' => '🇧🇪', 'text_direction' => 'ltr'],
    ['code' => 'wo', 'name' => 'Wolof', 'flag' => '🇸🇳', 'text_direction' => 'ltr'],
    ['code' => 'wuu', 'name' => 'Wu Chinese', 'flag' => '🇨🇳', 'text_direction' => 'ltr'],
    ['code' => 'xal', 'name' => 'Kalmyk', 'flag' => '🇷🇺', 'text_direction' => 'ltr'],
    ['code' => 'xh', 'name' => 'Xhosa', 'flag' => '🇿🇦', 'text_direction' => 'ltr'],
    ['code' => 'xmf', 'name' => 'Mingrelian', 'flag' => '🇬🇪', 'text_direction' => 'ltr'],
    ['code' => 'yi', 'name' => 'Yiddish', 'flag' => '🇮🇱', 'text_direction' => 'rtl'],
    ['code' => 'yo', 'name' => 'Yoruba', 'flag' => '🇳🇬', 'text_direction' => 'ltr'],
    ['code' => 'za', 'name' => 'Zhuang', 'flag' => '🇨🇳', 'text_direction' => 'ltr'],
    ['code' => 'zea', 'name' => 'Zeelandic', 'flag' => '🇧🇪', 'text_direction' => 'ltr'],
    ['code' => 'zh', 'name' => 'Chinese', 'flag' => '🇨🇳', 'text_direction' => 'ltr'],
    ['code' => 'zu', 'name' => 'Zulu', 'flag' => '🇿🇦', 'text_direction' => 'ltr'],
];

$wikis = [
    ['code' => 'aa', 'wiki' => 'aawiki', 'creation_date' => '2001-10-16'],
    ['code' => 'ab', 'wiki' => 'abwiki', 'creation_date' => '2001-12-20'],
    ['code' => 'ace', 'wiki' => 'acewiki', 'creation_date' => '2004-03-29'],
    ['code' => 'ady', 'wiki' => 'adywiki', 'creation_date' => '2004-05-28'],
    ['code' => 'af', 'wiki' => 'afwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'ak', 'wiki' => 'akwiki', 'creation_date' => '2004-03-29'],
    ['code' => 'als', 'wiki' => 'alswiki', 'creation_date' => '2004-03-29'],
    ['code' => 'alt', 'wiki' => 'altwiki', 'creation_date' => '2004-07-16'],
    ['code' => 'ami', 'wiki' => 'amiwiki', 'creation_date' => '2006-07-15'],
    ['code' => 'am', 'wiki' => 'amwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'ang', 'wiki' => 'angwiki', 'creation_date' => '2002-03-17'],
    ['code' => 'ann', 'wiki' => 'annwiki', 'creation_date' => '2005-03-28'],
    ['code' => 'anp', 'wiki' => 'anpwiki', 'creation_date' => '2006-06-11'],
    ['code' => 'an', 'wiki' => 'anwiki', 'creation_date' => '2005-05-03'],
    ['code' => 'arc', 'wiki' => 'arcwiki', 'creation_date' => '2005-01-15'],
    ['code' => 'ar', 'wiki' => 'arwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'ary', 'wiki' => 'arywiki', 'creation_date' => '2006-06-03'],
    ['code' => 'arz', 'wiki' => 'arzwiki', 'creation_date' => '2004-05-25'],
    ['code' => 'ast', 'wiki' => 'astwiki', 'creation_date' => '2004-03-29'],
    ['code' => 'as', 'wiki' => 'aswiki', 'creation_date' => '2004-03-29'],
    ['code' => 'atj', 'wiki' => 'atjwiki', 'creation_date' => '2007-04-05'],
    ['code' => 'avk', 'wiki' => 'avkwiki', 'creation_date' => '2005-03-17'],
    ['code' => 'av', 'wiki' => 'avwiki', 'creation_date' => '2005-01-29'],
    ['code' => 'awa', 'wiki' => 'awawiki', 'creation_date' => '2005-07-19'],
    ['code' => 'ay', 'wiki' => 'aywiki', 'creation_date' => '2005-10-11'],
    ['code' => 'azb', 'wiki' => 'azbwiki', 'creation_date' => '2004-03-29'],
    ['code' => 'az', 'wiki' => 'azwiki', 'creation_date' => '2002-11-23'],
    ['code' => 'ban', 'wiki' => 'banwiki', 'creation_date' => '2005-06-12'],
    ['code' => 'bar', 'wiki' => 'barwiki', 'creation_date' => '2004-08-05'],
    ['code' => 'ba', 'wiki' => 'bawiki', 'creation_date' => '2001-12-20'],
    ['code' => 'bbc', 'wiki' => 'bbcwiki', 'creation_date' => '2005-08-14'],
    ['code' => 'bcl', 'wiki' => 'bclwiki', 'creation_date' => '2005-03-28'],
    ['code' => 'bdr', 'wiki' => 'bdrwiki', 'creation_date' => '2006-09-21'],
    ['code' => 'bew', 'wiki' => 'bewwiki', 'creation_date' => '2006-09-21'],
    ['code' => 'bg', 'wiki' => 'bgwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'bh', 'wiki' => 'bhwiki', 'creation_date' => '2005-03-28'],
    ['code' => 'bi', 'wiki' => 'biwiki', 'creation_date' => '2004-06-17'],
    ['code' => 'bjn', 'wiki' => 'bjnwiki', 'creation_date' => '2006-06-12'],
    ['code' => 'blk', 'wiki' => 'blkwiki', 'creation_date' => '2005-04-18'],
    ['code' => 'bm', 'wiki' => 'bmwiki', 'creation_date' => '2006-07-19'],
    ['code' => 'bn', 'wiki' => 'bnwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'bo', 'wiki' => 'bowiki', 'creation_date' => '2005-10-17'],
    ['code' => 'bpy', 'wiki' => 'bpywiki', 'creation_date' => '2005-06-21'],
    ['code' => 'br', 'wiki' => 'brwiki', 'creation_date' => '2004-06-12'],
    ['code' => 'bs', 'wiki' => 'bswiki', 'creation_date' => '2002-03-23'],
    ['code' => 'btm', 'wiki' => 'btmwiki', 'creation_date' => '2006-09-11'],
    ['code' => 'bug', 'wiki' => 'bugwiki', 'creation_date' => '2005-06-18'],
    ['code' => 'bxr', 'wiki' => 'bxrwiki', 'creation_date' => '2005-08-07'],
    ['code' => 'ca', 'wiki' => 'cawiki', 'creation_date' => '2001-10-16'],
    ['code' => 'cd', 'wiki' => 'cdowiki', 'creation_date' => '2007-04-04'],
    ['code' => 'ceb', 'wiki' => 'cebwiki', 'creation_date' => '2004-04-01'],
    ['code' => 'ce', 'wiki' => 'cewiki', 'creation_date' => '2005-01-29'],
    ['code' => 'cho', 'wiki' => 'chowiki', 'creation_date' => '2005-10-23'],
    ['code' => 'chr', 'wiki' => 'chrwiki', 'creation_date' => '2005-10-12'],
    ['code' => 'ch', 'wiki' => 'chwiki', 'creation_date' => '2004-10-20'],
    ['code' => 'chy', 'wiki' => 'chywiki', 'creation_date' => '2006-03-14'],
    ['code' => 'ckb', 'wiki' => 'ckbwiki', 'creation_date' => '2005-02-09'],
    ['code' => 'co', 'wiki' => 'cowiki', 'creation_date' => '2004-12-08'],
    ['code' => 'crh', 'wiki' => 'crhwiki', 'creation_date' => '2005-03-28'],
    ['code' => 'cr', 'wiki' => 'crwiki', 'creation_date' => '2005-08-12'],
    ['code' => 'csb', 'wiki' => 'csbwiki', 'creation_date' => '2006-01-13'],
    ['code' => 'cs', 'wiki' => 'cswiki', 'creation_date' => '2001-10-16'],
    ['code' => 'cu', 'wiki' => 'cuwiki', 'creation_date' => '2005-02-09'],
    ['code' => 'cv', 'wiki' => 'cvwiki', 'creation_date' => '2005-10-12'],
    ['code' => 'cy', 'wiki' => 'cywiki', 'creation_date' => '2001-10-16'],
    ['code' => 'dag', 'wiki' => 'dagwiki', 'creation_date' => '2006-10-16'],
    ['code' => 'da', 'wiki' => 'dawiki', 'creation_date' => '2001-10-16'],
    ['code' => 'de', 'wiki' => 'dewiki', 'creation_date' => '2001-10-16'],
    ['code' => 'dga', 'wiki' => 'dgawiki', 'creation_date' => '2007-04-14'],
    ['code' => 'din', 'wiki' => 'dinwiki', 'creation_date' => '2006-11-07'],
    ['code' => 'diq', 'wiki' => 'diqwiki', 'creation_date' => '2005-11-02'],
    ['code' => 'dsb', 'wiki' => 'dsbwiki', 'creation_date' => '2005-11-09'],
    ['code' => 'dtp', 'wiki' => 'dtpwiki', 'creation_date' => '2007-06-01'],
    ['code' => 'dty', 'wiki' => 'dtywiki', 'creation_date' => '2005-05-05'],
    ['code' => 'dv', 'wiki' => 'dvwiki', 'creation_date' => '2005-10-04'],
    ['code' => 'dz', 'wiki' => 'dzwiki', 'creation_date' => '2005-09-20'],
    ['code' => 'ee', 'wiki' => 'eewiki', 'creation_date' => '2006-11-03'],
    ['code' => 'el', 'wiki' => 'elwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'eml', 'wiki' => 'emlwiki', 'creation_date' => '2006-06-23'],
    ['code' => 'en', 'wiki' => 'enwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'eo', 'wiki' => 'eowiki', 'creation_date' => '2001-10-16'],
    ['code' => 'es', 'wiki' => 'eswiki', 'creation_date' => '2001-10-16'],
    ['code' => 'es', 'wiki' => 'eswikiquote', 'creation_date' => '2004-07-17'],
    ['code' => 'et', 'wiki' => 'etwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'eu', 'wiki' => 'euwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'ext', 'wiki' => 'extwiki', 'creation_date' => '2005-02-21'],
    ['code' => 'fat', 'wiki' => 'fatwiki', 'creation_date' => '2005-06-15'],
    ['code' => 'fa', 'wiki' => 'fawiki', 'creation_date' => '2001-10-16'],
    ['code' => 'ff', 'wiki' => 'ffwiki', 'creation_date' => '2006-04-05'],
    ['code' => 'fi', 'wiki' => 'fiwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'fj', 'wiki' => 'fjwiki', 'creation_date' => '2007-03-29'],
    ['code' => 'fon', 'wiki' => 'fonwiki', 'creation_date' => '2005-06-22'],
    ['code' => 'fo', 'wiki' => 'fowiki', 'creation_date' => '2004-09-30'],
    ['code' => 'frp', 'wiki' => 'frpwiki', 'creation_date' => '2005-01-31'],
    ['code' => 'frr', 'wiki' => 'frrwiki', 'creation_date' => '2005-11-15'],
    ['code' => 'fr', 'wiki' => 'frwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'fur', 'wiki' => 'furwiki', 'creation_date' => '2005-05-20'],
    ['code' => 'fy', 'wiki' => 'fywiki', 'creation_date' => '2004-06-17'],
    ['code' => 'gag', 'wiki' => 'gagwiki', 'creation_date' => '2005-07-25'],
    ['code' => 'gan', 'wiki' => 'ganwiki', 'creation_date' => '2005-11-01'],
    ['code' => 'ga', 'wiki' => 'gawiki', 'creation_date' => '2001-10-16'],
    ['code' => 'gcr', 'wiki' => 'gcrwiki', 'creation_date' => '2005-12-06'],
    ['code' => 'gd', 'wiki' => 'gdwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'glk', 'wiki' => 'glkwiki', 'creation_date' => '2005-12-06'],
    ['code' => 'gl', 'wiki' => 'glwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'gn', 'wiki' => 'gnwiki', 'creation_date' => '2005-11-15'],
    ['code' => 'gom', 'wiki' => 'gomwiki', 'creation_date' => '2005-11-01'],
    ['code' => 'gor', 'wiki' => 'gorwiki', 'creation_date' => '2006-11-07'],
    ['code' => 'got', 'wiki' => 'gotwiki', 'creation_date' => '2003-05-06'],
    ['code' => 'gpe', 'wiki' => 'gpewiki', 'creation_date' => '2007-05-01'],
    ['code' => 'guc', 'wiki' => 'gucwiki', 'creation_date' => '2006-12-15'],
    ['code' => 'gur', 'wiki' => 'gurwiki', 'creation_date' => '2007-04-15'],
    ['code' => 'gu', 'wiki' => 'guwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'guw', 'wiki' => 'guwwiki', 'creation_date' => '2006-08-11'],
    ['code' => 'gv', 'wiki' => 'gvwiki', 'creation_date' => '2005-09-22'],
    ['code' => 'ha', 'wiki' => 'hakwiki', 'creation_date' => '2007-05-16'],
    ['code' => 'haw', 'wiki' => 'hawiki', 'creation_date' => '2003-11-03'],
    ['code' => 'hew', 'wiki' => 'hewiki', 'creation_date' => '2001-10-16'],
    ['code' => 'hif', 'wiki' => 'hifwiki', 'creation_date' => '2005-12-15'],
    ['code' => 'hi', 'wiki' => 'hiwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'ho', 'wiki' => 'howiki', 'creation_date' => '2006-08-20'],
    ['code' => 'hr', 'wiki' => 'hrwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'hsb', 'wiki' => 'hsbwiki', 'creation_date' => '2005-11-09'],
    ['code' => 'ht', 'wiki' => 'htwiki', 'creation_date' => '2004-12-09'],
    ['code' => 'hu', 'wiki' => 'huwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'hy', 'wiki' => 'hywiki', 'creation_date' => '2001-10-16'],
    ['code' => 'hyw', 'wiki' => 'hywwiki', 'creation_date' => '2006-03-29'],
    ['code' => 'hz', 'wiki' => 'hzwiki', 'creation_date' => '2007-06-01'],
    ['code' => 'ia', 'wiki' => 'iawiki', 'creation_date' => '2001-10-16'],
    ['code' => 'iba', 'wiki' => 'ibawiki', 'creation_date' => '2006-08-01'],
    ['code' => 'id', 'wiki' => 'idwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'ie', 'wiki' => 'iewiki', 'creation_date' => '2006-10-12'],
    ['code' => 'igl', 'wiki' => 'iglwiki', 'creation_date' => '2006-05-15'],
    ['code' => 'ig', 'wiki' => 'igwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'ii', 'wiki' => 'iiwiki', 'creation_date' => '2006-04-01'],
    ['code' => 'ik', 'wiki' => 'ikwiki', 'creation_date' => '2006-10-15'],
    ['code' => 'ilo', 'wiki' => 'ilowiki', 'creation_date' => '2007-06-01'],
    ['code' => 'inh', 'wiki' => 'inhwiki', 'creation_date' => '2007-01-01'],
    ['code' => 'io', 'wiki' => 'iowiki', 'creation_date' => '2006-10-12'],
    ['code' => 'is', 'wiki' => 'iswiki', 'creation_date' => '2001-10-16'],
    ['code' => 'it', 'wiki' => 'itwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'iu', 'wiki' => 'iuwiki', 'creation_date' => '2006-05-01'],
    ['code' => 'jam', 'wiki' => 'jamwiki', 'creation_date' => '2006-10-15'],
    ['code' => 'ja', 'wiki' => 'jawiki', 'creation_date' => '2001-10-16'],
    ['code' => 'jbo', 'wiki' => 'jbowiki', 'creation_date' => '2005-12-16'],
    ['code' => 'jv', 'wiki' => 'jvwiki', 'creation_date' => '2003-12-15'],
    ['code' => 'kaa', 'wiki' => 'kaawiki', 'creation_date' => '2007-05-10'],
    ['code' => 'kab', 'wiki' => 'kabwiki', 'creation_date' => '2006-09-14'],
    ['code' => 'ka', 'wiki' => 'kawiki', 'creation_date' => '2001-10-16'],
    ['code' => 'kbd', 'wiki' => 'kbdwiki', 'creation_date' => '2006-12-07'],
    ['code' => 'kbp', 'wiki' => 'kbpwiki', 'creation_date' => '2006-08-15'],
    ['code' => 'kcg', 'wiki' => 'kcgwiki', 'creation_date' => '2005-11-05'],
    ['code' => 'kg', 'wiki' => 'kgewiki', 'creation_date' => '2005-12-12'],
    ['code' => 'kgw', 'wiki' => 'kgwiki', 'creation_date' => '2006-01-10'],
    ['code' => 'ki', 'wiki' => 'kiwiki', 'creation_date' => '2006-03-29'],
    ['code' => 'kj', 'wiki' => 'kjwiki', 'creation_date' => '2007-02-10'],
    ['code' => 'kk', 'wiki' => 'kkwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'kl', 'wiki' => 'klwiki', 'creation_date' => '2007-06-14'],
    ['code' => 'km', 'wiki' => 'kmwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'kn', 'wiki' => 'knwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'koi', 'wiki' => 'koiwiki', 'creation_date' => '2006-07-01'],
    ['code' => 'ko', 'wiki' => 'kowiki', 'creation_date' => '2001-10-16'],
    ['code' => 'krc', 'wiki' => 'krcwiki', 'creation_date' => '2006-05-22'],
    ['code' => 'kr', 'wiki' => 'krwiki', 'creation_date' => '2007-04-15'],
    ['code' => 'ksh', 'wiki' => 'kshwiki', 'creation_date' => '2006-09-29'],
    ['code' => 'ks', 'wiki' => 'kswiki', 'creation_date' => '2006-11-10'],
    ['code' => 'ku', 'wiki' => 'kuswiki', 'creation_date' => '2001-10-16'],
    ['code' => 'kv', 'wiki' => 'kvwiki', 'creation_date' => '2006-12-05'],
    ['code' => 'kw', 'wiki' => 'kwwiki', 'creation_date' => '2007-04-01'],
    ['code' => 'ky', 'wiki' => 'kywiki', 'creation_date' => '2001-10-16'],
    ['code' => 'lad', 'wiki' => 'ladwiki', 'creation_date' => '2006-10-01'],
    ['code' => 'la', 'wiki' => 'lawiki', 'creation_date' => '2001-10-16'],
    ['code' => 'lb', 'wiki' => 'lbwiki', 'creation_date' => '2006-09-18'],
    ['code' => 'lez', 'wiki' => 'lezwiki', 'creation_date' => '2006-06-25'],
    ['code' => 'lfn', 'wiki' => 'lfnwiki', 'creation_date' => '2006-02-15'],
    ['code' => 'lg', 'wiki' => 'lgwiki', 'creation_date' => '2006-09-01'],
    ['code' => 'lij', 'wiki' => 'lijwiki', 'creation_date' => '2006-11-10'],
    ['code' => 'li', 'wiki' => 'liwiki', 'creation_date' => '2006-10-01'],
    ['code' => 'lld', 'wiki' => 'lldwiki', 'creation_date' => '2006-11-01'],
    ['code' => 'lmo', 'wiki' => 'lmowiki', 'creation_date' => '2006-06-10'],
    ['code' => 'ln', 'wiki' => 'lnwiki', 'creation_date' => '2006-05-12'],
    ['code' => 'lo', 'wiki' => 'lowiki', 'creation_date' => '2006-05-05'],
    ['code' => 'lrc', 'wiki' => 'lrcwiki', 'creation_date' => '2007-06-01'],
    ['code' => 'ltg', 'wiki' => 'ltgwiki', 'creation_date' => '2006-12-15'],
    ['code' => 'lt', 'wiki' => 'ltwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'lv', 'wiki' => 'lvwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'mad', 'wiki' => 'madwiki', 'creation_date' => '2007-02-01'],
    ['code' => 'mai', 'wiki' => 'maiwiki', 'creation_date' => '2007-03-15'],
    ['code' => 'mdf', 'wiki' => 'mdfwiki', 'creation_date' => '2006-01-20'],
    ['code' => 'mg', 'wiki' => 'mgwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'mhr', 'wiki' => 'mhrwiki', 'creation_date' => '2006-11-10'],
    ['code' => 'mh', 'wiki' => 'mhwiki', 'creation_date' => '2007-01-23'],
    ['code' => 'min', 'wiki' => 'minwiki', 'creation_date' => '2006-02-19'],
    ['code' => 'mi', 'wiki' => 'miwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'mk', 'wiki' => 'mkwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'ml', 'wiki' => 'mlwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'mni', 'wiki' => 'mniwiki', 'creation_date' => '2006-04-15'],
    ['code' => 'mn', 'wiki' => 'mnwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'mnw', 'wiki' => 'mnwwiki', 'creation_date' => '2007-01-12'],
    ['code' => 'mos', 'wiki' => 'moswiki', 'creation_date' => '2006-05-15'],
    ['code' => 'mrj', 'wiki' => 'mrjwiki', 'creation_date' => '2006-07-01'],
    ['code' => 'mr', 'wiki' => 'mrwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'ms', 'wiki' => 'mswiki', 'creation_date' => '2001-10-16'],
    ['code' => 'mt', 'wiki' => 'mtwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'mus', 'wiki' => 'muswiki', 'creation_date' => '2006-06-05'],
    ['code' => 'mwl', 'wiki' => 'mwlwiki', 'creation_date' => '2006-08-11'],
    ['code' => 'myv', 'wiki' => 'myvwiki', 'creation_date' => '2006-09-23'],
    ['code' => 'my', 'wiki' => 'mywiki', 'creation_date' => '2001-10-16'],
    ['code' => 'mzn', 'wiki' => 'mznwiki', 'creation_date' => '2006-05-01'],
    ['code' => 'nah', 'wiki' => 'nahwiki', 'creation_date' => '2006-05-23'],
    ['code' => 'nap', 'wiki' => 'napwiki', 'creation_date' => '2006-11-15'],
    ['code' => 'na', 'wiki' => 'nawiki', 'creation_date' => '2007-07-22'],
    ['code' => 'nds', 'wiki' => 'ndswiki', 'creation_date' => '2003-12-01'],
    ['code' => 'ne', 'wiki' => 'newiki', 'creation_date' => '2001-10-16'],
    ['code' => 'new', 'wiki' => 'newwiki', 'creation_date' => '2007-05-17'],
    ['code' => 'ng', 'wiki' => 'ngwiki', 'creation_date' => '2006-05-18'],
    ['code' => 'nia', 'wiki' => 'niawiki', 'creation_date' => '2007-01-30'],
    ['code' => 'nl', 'wiki' => 'nlwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'nn', 'wiki' => 'nnwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'nov', 'wiki' => 'novwiki', 'creation_date' => '2006-02-25'],
    ['code' => 'no', 'wiki' => 'nowiki', 'creation_date' => '2001-10-16'],
    ['code' => 'nqo', 'wiki' => 'nqowiki', 'creation_date' => '2006-09-21'],
    ['code' => 'nrm', 'wiki' => 'nrmwiki', 'creation_date' => '2007-01-01'],
    ['code' => 'nr', 'wiki' => 'nrwiki', 'creation_date' => '2006-11-09'],
    ['code' => 'nso', 'wiki' => 'nsowiki', 'creation_date' => '2006-10-01'],
    ['code' => 'nv', 'wiki' => 'nvwiki', 'creation_date' => '2006-08-21'],
    ['code' => 'ny', 'wiki' => 'nywiki', 'creation_date' => '2006-05-05'],
    ['code' => 'oc', 'wiki' => 'ocwiki', 'creation_date' => '2006-03-01'],
    ['code' => 'olo', 'wiki' => 'olowiki', 'creation_date' => '2007-01-10'],
    ['code' => 'om', 'wiki' => 'omwiki', 'creation_date' => '2006-04-01'],
    ['code' => 'or', 'wiki' => 'orwiki', 'creation_date' => '2006-05-01'],
    ['code' => 'os', 'wiki' => 'oswiki', 'creation_date' => '2006-06-10'],
    ['code' => 'pag', 'wiki' => 'pagwiki', 'creation_date' => '2007-02-05'],
    ['code' => 'pam', 'wiki' => 'pamwiki', 'creation_date' => '2007-05-11'],
    ['code' => 'pap', 'wiki' => 'papwiki', 'creation_date' => '2006-02-23'],
    ['code' => 'pa', 'wiki' => 'pawiki', 'creation_date' => '2001-10-16'],
    ['code' => 'pcd', 'wiki' => 'pcdwiki', 'creation_date' => '2006-02-10'],
    ['code' => 'pcm', 'wiki' => 'pcmwiki', 'creation_date' => '2006-08-15'],
    ['code' => 'pdc', 'wiki' => 'pdcwiki', 'creation_date' => '2007-01-25'],
    ['code' => 'pfl', 'wiki' => 'pflwiki', 'creation_date' => '2007-04-18'],
    ['code' => 'pih', 'wiki' => 'pihwiki', 'creation_date' => '2007-01-15'],
    ['code' => 'pi', 'wiki' => 'piwiki', 'creation_date' => '2006-02-20'],
    ['code' => 'pl', 'wiki' => 'plwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'pms', 'wiki' => 'pmswiki', 'creation_date' => '2006-11-18'],
    ['code' => 'pnb', 'wiki' => 'pnbwiki', 'creation_date' => '2007-01-15'],
    ['code' => 'pnt', 'wiki' => 'pntwiki', 'creation_date' => '2007-02-01'],
    ['code' => 'ps', 'wiki' => 'pswiki', 'creation_date' => '2001-10-16'],
    ['code' => 'pt', 'wiki' => 'ptwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'pwn', 'wiki' => 'pwnwiki', 'creation_date' => '2007-02-21'],
    ['code' => 'qu', 'wiki' => 'quwiki', 'creation_date' => '2006-04-10'],
    ['code' => 'rm', 'wiki' => 'rmwiki', 'creation_date' => '2006-07-04'],
    ['code' => 'rmy', 'wiki' => 'rmywiki', 'creation_date' => '2006-08-14'],
    ['code' => 'rn', 'wiki' => 'rnwiki', 'creation_date' => '2007-06-01'],
    ['code' => 'ro', 'wiki' => 'rowiki', 'creation_date' => '2001-10-16'],
    ['code' => 'rsk', 'wiki' => 'rskwiki', 'creation_date' => '2007-04-30'],
    ['code' => 'ru', 'wiki' => 'ruwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'rw', 'wiki' => 'rwwiki', 'creation_date' => '2007-03-09'],
    ['code' => 'sah', 'wiki' => 'sahwiki', 'creation_date' => '2006-11-19'],
    ['code' => 'sat', 'wiki' => 'satwiki', 'creation_date' => '2006-05-01'],
    ['code' => 'sa', 'wiki' => 'sawiki', 'creation_date' => '2006-02-01'],
    ['code' => 'scn', 'wiki' => 'scnwiki', 'creation_date' => '2005-06-06'],
    ['code' => 'sc', 'wiki' => 'scowiki', 'creation_date' => '2005-04-01'],
    ['code' => 'sd', 'wiki' => 'sdwiki', 'creation_date' => '2006-01-01'],
    ['code' => 'se', 'wiki' => 'sewiki', 'creation_date' => '2005-11-01'],
    ['code' => 'sg', 'wiki' => 'sgwiki', 'creation_date' => '2007-01-01'],
    ['code' => 'shi', 'wiki' => 'shiwiki', 'creation_date' => '2007-04-01'],
    ['code' => 'shn', 'wiki' => 'shnwiki', 'creation_date' => '2007-02-01'],
    ['code' => 'sh', 'wiki' => 'shwiki', 'creation_date' => '2006-01-11'],
    ['code' => 'si', 'wiki' => 'siwiki', 'creation_date' => '2003-02-21'],
    ['code' => 'skr', 'wiki' => 'skrwiki', 'creation_date' => '2007-02-14'],
    ['code' => 'sk', 'wiki' => 'skwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'sl', 'wiki' => 'slwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'smn', 'wiki' => 'smnwiki', 'creation_date' => '2007-03-01'],
    ['code' => 'sm', 'wiki' => 'smwiki', 'creation_date' => '2006-03-11'],
    ['code' => 'sn', 'wiki' => 'snwiki', 'creation_date' => '2007-01-28'],
    ['code' => 'so', 'wiki' => 'sowiki', 'creation_date' => '2001-10-16'],
    ['code' => 'sq', 'wiki' => 'sqwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'srn', 'wiki' => 'srnwiki', 'creation_date' => '2007-01-01'],
    ['code' => 'sr', 'wiki' => 'srwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'ss', 'wiki' => 'sswiki', 'creation_date' => '2007-04-05'],
    ['code' => 'stq', 'wiki' => 'stqwiki', 'creation_date' => '2007-02-01'],
    ['code' => 'st', 'wiki' => 'stwiki', 'creation_date' => '2006-10-01'],
    ['code' => 'su', 'wiki' => 'suwiki', 'creation_date' => '2007-01-20'],
    ['code' => 'sv', 'wiki' => 'svwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'sw', 'wiki' => 'swwiki', 'creation_date' => '2006-10-09'],
    ['code' => 'szl', 'wiki' => 'szlwiki', 'creation_date' => '2007-03-01'],
    ['code' => 'szy', 'wiki' => 'szywiki', 'creation_date' => '2007-01-01'],
    ['code' => 'ta', 'wiki' => 'tawiki', 'creation_date' => '2001-10-16'],
    ['code' => 'tay', 'wiki' => 'taywiki', 'creation_date' => '2007-06-01'],
    ['code' => 'tcy', 'wiki' => 'tcywiki', 'creation_date' => '2007-07-01'],
    ['code' => 'tdd', 'wiki' => 'tddwiki', 'creation_date' => '2007-05-01'],
    ['code' => 'te', 'wiki' => 'tewiki', 'creation_date' => '2001-10-16'],
    ['code' => 'tg', 'wiki' => 'tgwiki', 'creation_date' => '2007-01-01'],
    ['code' => 'th', 'wiki' => 'thwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'ti', 'wiki' => 'tiwiki', 'creation_date' => '2007-01-01'],
    ['code' => 'tk', 'wiki' => 'tkwiki', 'creation_date' => '2007-03-15'],
    ['code' => 'tl', 'wiki' => 'tlwiki', 'creation_date' => '2002-03-22'],
    ['code' => 'tly', 'wiki' => 'tlywiki', 'creation_date' => '2007-05-01'],
    ['code' => 'tn', 'wiki' => 'tnwiki', 'creation_date' => '2007-02-22'],
    ['code' => 'to', 'wiki' => 'towiki', 'creation_date' => '2006-06-01'],
    ['code' => 'tpi', 'wiki' => 'tpiwiki', 'creation_date' => '2007-05-01'],
    ['code' => 'trv', 'wiki' => 'trvwiki', 'creation_date' => '2007-05-01'],
    ['code' => 'tr', 'wiki' => 'trwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'ts', 'wiki' => 'tswiki', 'creation_date' => '2007-03-01'],
    ['code' => 'tt', 'wiki' => 'ttwiki', 'creation_date' => '2007-03-01'],
    ['code' => 'tm', 'wiki' => 'tumwiki', 'creation_date' => '2007-06-01'],
    ['code' => 'tw', 'wiki' => 'twwiki', 'creation_date' => '2007-07-01'],
    ['code' => 'tyv', 'wiki' => 'tyvwiki', 'creation_date' => '2007-02-01'],
    ['code' => 'ty', 'wiki' => 'tywiki', 'creation_date' => '2007-07-01'],
    ['code' => 'udm', 'wiki' => 'udmwiki', 'creation_date' => '2007-01-01'],
    ['code' => 'ug', 'wiki' => 'ugwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'uk', 'wiki' => 'ukwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'ur', 'wiki' => 'urwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'uz', 'wiki' => 'uzwiki', 'creation_date' => '2006-04-01'],
    ['code' => 'vec', 'wiki' => 'vecwiki', 'creation_date' => '2006-01-01'],
    ['code' => 'vep', 'wiki' => 'vepwiki', 'creation_date' => '2007-01-01'],
    ['code' => 've', 'wiki' => 'vewiki', 'creation_date' => '2007-01-01'],
    ['code' => 'vi', 'wiki' => 'viwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'vls', 'wiki' => 'vlswiki', 'creation_date' => '2006-01-01'],
    ['code' => 'vo', 'wiki' => 'vowiki', 'creation_date' => '2006-06-01'],
    ['code' => 'war', 'wiki' => 'warwiki', 'creation_date' => '2007-01-01'],
    ['code' => 'wa', 'wiki' => 'wawiki', 'creation_date' => '2006-03-01'],
    ['code' => 'wo', 'wiki' => 'wowiki', 'creation_date' => '2007-05-01'],
    ['code' => 'wuu', 'wiki' => 'wuuwiki', 'creation_date' => '2006-01-01'],
    ['code' => 'www', 'wiki' => 'wikidatawiki', 'creation_date' => '2012-10-29'],
    ['code' => 'xal', 'wiki' => 'xalwiki', 'creation_date' => '2007-01-01'],
    ['code' => 'xh', 'wiki' => 'xhwiki', 'creation_date' => '2007-01-01'],
    ['code' => 'xmf', 'wiki' => 'xmfwiki', 'creation_date' => '2007-03-01'],
    ['code' => 'yi', 'wiki' => 'yiwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'yo', 'wiki' => 'yowiki', 'creation_date' => '2007-01-01'],
    ['code' => 'za', 'wiki' => 'zawiki', 'creation_date' => '2007-01-01'],
    ['code' => 'zea', 'wiki' => 'zeawiki', 'creation_date' => '2007-01-01'],
    ['code' => 'zh', 'wiki' => 'zhwiki', 'creation_date' => '2001-10-16'],
    ['code' => 'zu', 'wiki' => 'zuwiki', 'creation_date' => '2007-01-01'],
];

// Idioma predeterminado
$defaultLang = 'en';

// Función para obtener un idioma por su código
function getLanguageByCode($code) {
    global $languages;
    foreach ($languages as $language) {
        if ($language['code'] === $code) {
            return $language;
        }
    }
    return null; // Si no se encuentra el idioma
}


// Función para obtener el proyecto según el dominio
function getProject($currentDomain) {
    $parts = explode('.', $currentDomain);
    
    if (count($parts) < 3) {
        return "unknown"; // Si no tiene subdominio, no es válido
    }

    $lang = $parts[0]; // Asumimos que el primer segmento del dominio es el idioma
    $projectType = $parts[1]; // El segundo segmento sería el tipo de proyecto (por ejemplo, wikipedia, wikiquote, etc.)

    // Verificar si el dominio es www.wikipeoplestats.org
    if ($currentDomain === 'www.wikipeoplestats.org') {
        return 'all'; // Si es 'wikipeoplestats', retornamos el proyecto 'all'
    }

    // Verificar si el idioma es válido
    global $languages;
    foreach ($languages as $language) {
        if ($language['code'] === $lang) {
            // Si el dominio es de tipo "wikipeoplestats", asignamos al proyecto de Wikipedia
            if ($projectType === 'wikipeoplestats') {
                return $lang . 'wiki';
            }

            // Si es un proyecto de "quote"
            if ($projectType === 'quote') {
                return $lang . 'wikiquote';
            }

            // Si es un proyecto de "source"
            if ($projectType === 'source') {
                return $lang . 'wikisource';
            }

            // Para otros proyectos, regresamos el proyecto predeterminado
            return "wikidata"; // De lo contrario, asignamos un proyecto genérico
        }
    }

    return "wikidata"; // Si no se encuentra el idioma, asumimos que es "wikidata"
}

// Función para obtener el dominio original (esencial si necesitas redirigir)
function getOriginalDomain($currentDomain) {
    $parts = explode('.', $currentDomain);
    $lang = $parts[0]; // El idioma es el primer segmento del dominio
    $projectType = $parts[1]; // El proyecto es el segundo segmento

    // Retornar el dominio original dependiendo del tipo de proyecto
    if ($projectType === 'wikipeoplestats') {
        return $lang . '.wikipedia.org'; // Para Wikipedia
    } elseif ($projectType === 'quote') {
        return $lang . '.wikiquote.org'; // Para Wikiquote
    } elseif ($projectType === 'source') {
        return $lang . '.wikisource.org'; // Para Wikisource
    }

    // Si no es un proyecto conocido, retornamos el dominio de Wikidata
    return 'wikidata.org';
}

// Detectar el dominio actual y el subdominio
$currentDomain = $_SERVER['HTTP_HOST'];
$subdomain = explode('.', $currentDomain)[0]; // Suponemos que el subdominio es el código del idioma

// Idioma predeterminado si no se puede determinar el idioma
$currentLang = getLanguageByCode($defaultLang);

// Verificar si existe una excepción local para este subdominio
$exceptionLang = isset($_COOKIE["local_exception_$subdomain"]) ? $_COOKIE["local_exception_$subdomain"] : null;

// Si existe una excepción local, usamos ese idioma
if ($exceptionLang && in_array($exceptionLang, array_column($languages, 'code'))) {
    $currentLang = getLanguageByCode($exceptionLang);
} else {
    // Si no hay excepción local, manejamos el idioma global
    if (isset($_COOKIE['global_usage']) && $_COOKIE['global_usage'] == 'true') {
        $requestedLang = isset($_COOKIE['language']) ? $_COOKIE['language'] : $subdomain; // Usa subdominio o idioma global
        $currentLang = getLanguageByCode($requestedLang);
    } else {
        // Si no hay preferencia global, usamos el idioma por defecto
        $currentLang = getLanguageByCode($subdomain);
    }
}

// Manejo del idioma - Si se está cambiando el idioma
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['lang'])) {
    $requestedLang = $_POST['lang'];
    $globalUsage = isset($_POST['global_usage']) ? $_POST['global_usage'] : 'false';
    $localException = isset($_POST['local_exception']) ? $_POST['local_exception'] : 'false';

    // Validar que el idioma sea válido
    foreach ($languages as $lang) {
        if ($lang['code'] === $requestedLang) {
            // Guardar el idioma en la sesión (o cookie si se desea mantener la preferencia)
            $_SESSION['lang'] = $requestedLang;
            setcookie('language', $requestedLang, time() + (60 * 60 * 24 * 365), '/'); // Guardar en cookie por 1 año

            // Configurar las preferencias globales
            if ($globalUsage === 'true') {
                setcookie('global_usage', 'true', time() + (60 * 60 * 24 * 365), '/');
            } else {
                setcookie('global_usage', 'false', time() + (60 * 60 * 24 * 365), '/');
            }

            // Establecer la excepción local
            if ($localException === 'true') {
                setcookie("local_exception_$subdomain", $requestedLang, time() + (60 * 60 * 24 * 365), '/'); // Guardar en cookie del subdominio
            } else {
                setcookie("local_exception_$subdomain", '', time() - 3600, '/'); // Eliminar la cookie si no hay excepción
            }

            echo json_encode(['success' => true, 'lang' => $requestedLang]);
            exit;
        }
    }

    // Si el idioma no es válido, retornar un error
    echo json_encode(['success' => false, 'message' => 'Idioma no válido']);
    exit;
}

// Cargar traducciones del idioma actual
$translations = [];
$jsonFile = __DIR__ . '/languages/' . $currentLang['code'] . '.json';
if (file_exists($jsonFile)) {
    $translations = json_decode(file_get_contents($jsonFile), true);
}

// Cargar traducciones en inglés como fallback
$translations_en = [];
$defaultJsonFile = __DIR__ . '/languages/en.json';
if (file_exists($defaultJsonFile)) {
    $translations_en = json_decode(file_get_contents($defaultJsonFile), true);
}

// Función de traducción
function __($key) {
    global $translations, $translations_en;

    // Buscar en las traducciones del idioma actual
    if (isset($translations[$key])) {
        return $translations[$key];
    }

    // Si no existe, buscar en el idioma predeterminado (inglés)
    if (isset($translations_en[$key])) {
        return $translations_en[$key];
    }

    // Si no existe en ninguno, devolver la clave original
    return $key;
}

// Configurar el locale para el formato de fechas
setlocale(LC_TIME, $currentLang['code'] . '_' . strtoupper($currentLang['code']) . '.UTF-8');
?>