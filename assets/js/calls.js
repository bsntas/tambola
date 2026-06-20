'use strict';

/* Humorous / traditional number-calling phrases for Tambola.
   Each entry: { en, hi, ne }
   en = English (mix of classic Housie calls + wordplay)
   hi = Hindi (Bollywood / desi cultural references)
   ne = Nepali (local culture & humour)
*/
const NUMBER_CALLS = {
  1:  {
    en: "Kelly's Eye! The lone ranger rides again! 🤠",
    hi: "एक अकेला चना, भाड़ फोड़े! आत्मनिर्भर भारत! 🇮🇳",
    ne: "एकै जना, सबैभन्दा साहसी! एकलो योद्धा! ⚔️"
  },
  2:  {
    en: "One little duck, quack quack! Me and you! 🦆",
    hi: "दो यार दिल के, दो बत्तखें तैर रही हैं! 🦆🦆",
    ne: "दुई मित्र, जोडी मिल्यो! क्वाक क्वाक! 🦆"
  },
  3:  {
    en: "Cup of tea! You, me, and that awkward third person! ☕",
    hi: "तीन तिगड़ा काम बिगाड़ा! तीन की चाय! ☕",
    ne: "तीन जना, तेस्रो व्यक्ति अप्ठ्यारो! ☕"
  },
  4:  {
    en: "Knock at the door! Ding dong! Who's there? 🚪",
    hi: "चार दिन की चाँदनी! दस्तक दो दस्तक! 🚪",
    ne: "चार कुनाको ढोका, ट्याक ट्याक! 🚪"
  },
  5:  {
    en: "Man alive! Give me a high five! ✋",
    hi: "पाँच उँगलियाँ एक मुट्ठी! हाई फाइव दोस्त! ✋",
    ne: "पाँच औंला, हात पूरा भयो! हाई फाइभ! ✋"
  },
  6:  {
    en: "Half a dozen! Tom Mix! Stir it up! 🎬",
    hi: "छह छह होकर जाओ! आधा दर्जन तैयार! 🥚",
    ne: "आधा दर्जन! तरकारी पकाउन पुग्छ! 🥚"
  },
  7:  {
    en: "Lucky seven! God's in heaven! 🍀",
    hi: "सात समुंदर पार! लकी सेवन आया! 🌊",
    ne: "भाग्यशाली सात! स्वर्गमा भगवान! 🍀"
  },
  8:  {
    en: "One fat lady wiggle wobble! Garden gate! 🧍‍♀️",
    hi: "अष्टभुजा माँ दुर्गा! आठ हाथ! जय माँ! 🙏",
    ne: "एउटी मोटी हजुरआमा, फुर्ती लाइ! 💪"
  },
  9:  {
    en: "Doctor's orders! Take the pill and chill! 💊",
    hi: "नौ दो ग्यारह! डॉक्टर साहब आ गए! 💊",
    ne: "डाक्टरको आदेश! दवाइ खाओ! 💊"
  },
  10: {
    en: "Uncle Ben's den! Number Ten Downing Street! 🏛️",
    hi: "दस का दम! दस नंबर दरवाज़ा खुला! 🚪",
    ne: "दश नम्बरको ढोका! प्रधानमन्त्री आउनुभयो! 🏛️"
  },
  11: {
    en: "Legs eleven! Looking gorgeous! 🦵🦵",
    hi: "लेग्स इलेवन! क्रिकेट टीम पूरी हुई! 🏏",
    ne: "खुट्टा एघार! टिम पूरा भयो! 🏏"
  },
  12: {
    en: "One dozen! Monkey's cousin swings in! 🐒",
    hi: "बारह बजे भूत निकले! एक दर्जन तैयार! 👻",
    ne: "बाह्र बजे, भूत निस्कन्छ! एक दर्जन! 👻"
  },
  13: {
    en: "Unlucky for some — brave hearts only! 🃏",
    hi: "तेरह – अशुभ नहीं, अनोखा है! तेरह की हिम्मत! 💪",
    ne: "अभाग्यशाली तेह्र? डराउनुस् नहोस्! 💪"
  },
  14: {
    en: "Valentine's eve! Love is in the air! 💘",
    hi: "चौदह फेरे! वेलेंटाइन की पूर्व संध्या! 💘",
    ne: "प्रेमीहरूको दिन! चौध फेरे! 💘"
  },
  15: {
    en: "Young and keen! The rugby fifteen! 🏉",
    hi: "पंद्रह अगस्त! आज़ादी का जश्न मनाओ! 🇮🇳",
    ne: "पन्ध्र अगस्ट, स्वतन्त्रता दिवस! जय नेपाल! 🇳🇵"
  },
  16: {
    en: "Sweet sixteen — never been kissed! 😘",
    hi: "सोलह शृंगार! सोलह की उम्र में इश्क़! 💋",
    ne: "मीठो सोह्र! पहिलो प्यार भयो! 💋"
  },
  17: {
    en: "Dancing queen! ABBA would approve! 💃",
    hi: "सत्रह की धुन! सात समुंदर पार से आई! 🎵",
    ne: "नाच्दै सत्र! डान्सिङ क्विन! 💃"
  },
  18: {
    en: "Now you can vote! Welcome to adulthood! 🗳️",
    hi: "अठारह साल, वोट का हाल! बालिग हो गए! 🗳️",
    ne: "अठार वर्षमा भोट! जिम्मेवार नागरिक! 🗳️"
  },
  19: {
    en: "Goodbye teens! You'll never be young again! 👋",
    hi: "उन्नीस-बीस का फ़र्क! किशोरावस्था अलविदा! 👋",
    ne: "किशोरावस्था अलविदा! उन्नाइस! 👋"
  },
  20: {
    en: "One score! Blind twenty — eyes forward! 🎯",
    hi: "बीस साल बाद मिले! एक स्कोर! 🎯",
    ne: "बीस! एक स्कोर पुग्यो! 🎯"
  },
  21: {
    en: "Key of the door! Royal twenty-one salute! 🔑",
    hi: "इक्कीस तोपों की सलामी! चाबी मिली दोस्त! 🔑",
    ne: "एक्काइस तोपको सलामी! ढोका खुल्यो! 🔑"
  },
  22: {
    en: "Two little ducks! Quack quack quack! 🦆🦆",
    hi: "बाइस – दो बत्तखें! क्वाक क्वाक! 🦆🦆",
    ne: "दुई हाँस नाच्दै! क्वाक क्वाक! 🦆🦆"
  },
  23: {
    en: "Michael Jordan's number! Dunk it! 🏀",
    hi: "तेइस – माइकल जॉर्डन का जादुई नंबर! 🏀",
    ne: "जोर्डनको नम्बर! बास्केट हाल! 🏀"
  },
  24: {
    en: "Two dozen! Round the clock — 24/7! 🕐",
    hi: "चौबीस घंटे, सातों दिन! दो दर्जन! ⏰",
    ne: "चौबीस घण्टा सेवा! कहिल्यै नसुत्ने! ⏰"
  },
  25: {
    en: "Silver jubilee! Quarter century, old-timer! 🥈",
    hi: "पच्चीस साल की सेवा! रजत जयंती मुबारक! 🥈",
    ne: "रजत जयन्ती! पच्चीस वर्षको यात्रा! 🥈"
  },
  26: {
    en: "Republic Day! Pick and mix! Half a crown! 🎪",
    hi: "छब्बीस जनवरी! गणतंत्र दिवस की बधाई! 🇮🇳",
    ne: "छब्बीस! गणतन्त्र दिवसको शुभकामना! 🇳🇵"
  },
  27: {
    en: "Little duck with a crutch! Gateway to heaven! 😇",
    hi: "सत्ताईस नक्षत्र! स्वर्ग का दरवाज़ा! 🌟",
    ne: "सत्ताइस नक्षत्र! आकाश भरिएको! ⭐"
  },
  28: {
    en: "In a state! Maybe lay off the sweets! 😅",
    hi: "अट्ठाईस – थोड़ा वज़न कम करो यार! 😅",
    ne: "अठ्ठाइस, थोरै मिठाइ घटाउ! 😅"
  },
  29: {
    en: "Rise and shine! One step from the big three-oh! ✨",
    hi: "उनतीस – एक कम तीस! उठो और चमको! ✨",
    ne: "उनन्तीस! तीसको एक कदम अघि! ✨"
  },
  30: {
    en: "Burlington Bertie! Dirty thirty — life begins! 🎂",
    hi: "तीस – ज़िंदगी अब शुरू होती है, जवान! 🎂",
    ne: "तीस! जीवन अब सुरु हुन्छ भन्छन्! 🎂"
  },
  31: {
    en: "Get up and run! Don't walk, sprint! 🏃",
    hi: "इकतीस – भागो मत, दौड़ो यार! 🏃",
    ne: "एकत्तीस! दगुर, नहिँड! 🏃"
  },
  32: {
    en: "Buckle my shoe! Thirty two! 👟",
    hi: "बत्तीस दाँत! मुस्कुराओ, सब दिखाओ! 😁",
    ne: "बत्तीस दाँत! हाँस, सबैलाई देखाउ! 😁"
  },
  33: {
    en: "All the threes! Fish, chips and peas! 🐟",
    hi: "तैंतीस कोटि देवी-देवता का आशीर्वाद! 🙏",
    ne: "तेत्तीस कोटि देवता! आशीर्वाद पाउ! 🙏"
  },
  34: {
    en: "Ask for more! Knock on that door! 🙋",
    hi: "चौंतीस – और माँगो! हक से माँगो! 🙋",
    ne: "चौँतीस, झन् माग! हक तिम्रो हो! 🙋"
  },
  35: {
    en: "Jump and jive, stay alive! Thirty five! 🕺",
    hi: "पैंतीस – उम्र का पड़ाव! जिंदगी में नाचते रहो! 🕺",
    ne: "पैँतीस! नाच्नुस् र रमाइलो गर्नुस्! 🕺"
  },
  36: {
    en: "Three dozen! The perfect number? Almost! ⚾",
    hi: "छत्तीस का आँकड़ा! तीन दर्जन तैयार! ⚾",
    ne: "तीन दर्जन! छत्तीसको आँकडो! ⚾"
  },
  37: {
    en: "More than before, and less than after! 🎵",
    hi: "सैंतीस – Sahgal की धुन याद आई! 🎵",
    ne: "सैँतीस! गीत गाइदेऊ! 🎵"
  },
  38: {
    en: "Christmas cake! Eat it before it goes stale! 🎂",
    hi: "अड़तीस – क्रिसमस केक खाओ! अरे मिठास! 🎂",
    ne: "अठतीस! क्रिसमस केक खाउ! 🎂"
  },
  39: {
    en: "39 steps! Hitchcock's finest thriller! 🎬",
    hi: "उनतालीस – हिचकॉक की थ्रिलर! एक कम चालीस! 🎬",
    ne: "उनन्चालीस! हिचकक फिल्म! 🎬"
  },
  40: {
    en: "Life begins at forty! Party time! 🎉",
    hi: "चालीस – ज़िंदगी अब शुरू होती है असल में! 🎉",
    ne: "चालीस! जीवन अब साँच्चिकै सुरु! 🎉"
  },
  41: {
    en: "Time for fun! Forget being sensible! 🎊",
    hi: "इकतालीस – अब मज़ा शुरू! जोड़-तोड़ भूलो! 🎊",
    ne: "एकचालीस! अब रमाइलो शुरू! 🎊"
  },
  42: {
    en: "The answer to life, the universe and everything! 🌌",
    hi: "बयालीस – जीवन, ब्रह्मांड और सब का जवाब! 🌌",
    ne: "बयालीस! जीवनको उत्तर! ब्रह्माण्डको रहस्य! 🌌"
  },
  43: {
    en: "Down on your knees and beg! Forty three! 🙇",
    hi: "तैंतालीस – घुटने टेको! विनती करो! 🙇",
    ne: "त्रिचालीस! ढोग गर! विनती गर! 🙇"
  },
  44: {
    en: "Droopy drawers! Pull 'em up, forty four! 👖",
    hi: "चौवालीस – चार से चार! सुरुवाल ऊपर करो! 👖",
    ne: "चौवालीस! सुरुवाल माथि गर! 👖"
  },
  45: {
    en: "Halfway there — don't stop now! 🏁",
    hi: "पैंतालीस – आधा सफर पूरा! रुको मत! 🏁",
    ne: "आधा पुगियो! पैँतालीस! नरोकिनुस्! 🏁"
  },
  46: {
    en: "Up to tricks! What are you plotting? 🎩",
    hi: "छयालीस – चालाकी का नंबर! क्या चल रहा है? 🎩",
    ne: "छयालीस! के षड्यन्त्र गर्दैछौ? 🎩"
  },
  47: {
    en: "Four and seven! AK-47 — bang bang! 💥",
    hi: "सैंतालीस – AK-47! धाँय धाँय! 💥",
    ne: "सत्चालीस! AK-47! धाइ धाइ! 💥"
  },
  48: {
    en: "Four dozen! Time flies at forty eight! ⏰",
    hi: "अड़तालीस – चार दर्जन! भागती जा रही है ज़िंदगी! ⏰",
    ne: "अठचालीस! चार दर्जन! समय उड्दैछ! ⏰"
  },
  49: {
    en: "PC! Forty niner! Call the copper! 🚔",
    hi: "उनचास – एक कम पचास! पुलिस आ गई! 🚔",
    ne: "उनन्पचास! पुलिस आइपुग्यो! 🚔"
  },
  50: {
    en: "Half a century! Golden and gorgeous! 🏆",
    hi: "पचास – अर्ध शतक! सुनहरा पचास! 🏆",
    ne: "आधा सय! सुनौलो पचास! 🏆"
  },
  51: {
    en: "Tweak of the thumb! Give it a go! 👍",
    hi: "इक्यावन – शुभ शुरुआत! रुपए इक्यावन! 👍",
    ne: "एकाउन्न! रुपैयाँ एकाउन्न! शुभ! 👍"
  },
  52: {
    en: "Full deck of cards! Shuffle and deal! 🃏",
    hi: "बावन – ताश की पूरी गड्डी! बाँटो सबको! 🃏",
    ne: "बाउन्न! ताससको गड्डी, फेर्नुस्! 🃏"
  },
  53: {
    en: "Stuck in a tree! Somebody call the fire brigade! 🌳",
    hi: "तिरपन – पेड़ पर फँस गए! फायर ब्रिगेड बुलाओ! 🌳",
    ne: "त्रिपन्न! रुखमा अड्किइयो! फायरब्रिगेड! 🌳"
  },
  54: {
    en: "Clean the floor! Mop it up, fifty four! 🧹",
    hi: "चौवन – झाड़ू लगाओ! घर साफ करो! 🧹",
    ne: "चौवन्न! झाडु लगाउ! घर सफा गर! 🧹"
  },
  55: {
    en: "Snakes alive! All the fives! Hiss! 🐍",
    hi: "पचपन – साँप ज़िंदा है! सावधान! 🐍",
    ne: "पचपन्न! साँप जिउँदो छ! सतर्क रहनुस्! 🐍"
  },
  56: {
    en: "Was she worth it? Chopsticks! 🥢",
    hi: "छप्पन – छप्पन छुरी! माँ की रसोई की याद! 🥢",
    ne: "छपन्न! छुरी झैँ तिखो! 🥢"
  },
  57: {
    en: "Heinz varieties! 57 different flavors! 🍅",
    hi: "सत्तावन – हेन्ज़ की 57 किस्म! मेरी favourite है! 🍅",
    ne: "सत्तावन्न! हेन्जको ५७ स्वाद! 🍅"
  },
  58: {
    en: "Make them wait! Keep 'em on their toes! ⏳",
    hi: "अट्ठावन – थोड़ा और इंतज़ार! सब्र रखो! ⏳",
    ne: "अठ्ठावन्न! अझ पर्खाउ! धैर्य गर! ⏳"
  },
  59: {
    en: "The Brighton line! All aboard! 🚂",
    hi: "उनसठ – एक कम साठ! ट्रेन आ गई! 🚂",
    ne: "उनन्साठी! रेलगाडी छुट्दैछ! 🚂"
  },
  60: {
    en: "Three score! Diamond jubilee! Sixty and fabulous! 💎",
    hi: "साठ – सठिया गए क्या? हीरा जयंती! 💎",
    ne: "साठी! हजुरबुबा हुनुभयो! हीरक जयन्ती! 💎"
  },
  61: {
    en: "Baker's bun! Hot cross one! 🥐",
    hi: "इकसठ – एक आगे साठ से! बेकरी की रोटी! 🥐",
    ne: "एकसट्ठी! बेकरको तातो रोटी! 🥐"
  },
  62: {
    en: "Tickety boo! All is well! 🎵",
    hi: "बासठ – सब ठीक-ठाक! मस्त हो जाओ! 🎵",
    ne: "बासट्ठी! सब ठिकठाक छ! 🎵"
  },
  63: {
    en: "Tickle me please! Sixty three! 😄",
    hi: "तिरसठ – गुदगुदी करो! हँसाओ ज़रा! 😄",
    ne: "त्रिसट्ठी! गुजुली गर! हँसाउ! 😄"
  },
  64: {
    en: "Will you still need me at 64? Beatles forever! 🎸",
    hi: "चौंसठ – Beatles का गाना याद आया! 🎸",
    ne: "चौँसट्ठी! Beatles को गित गाउ! 🎸"
  },
  65: {
    en: "Old age pension! Clock out and relax! 🏖️",
    hi: "पैंसठ – पेंशन का वक्त! अब आराम करो! 🏖️",
    ne: "पैँसट्ठी! पेन्सन खाने बेला भयो! 🏖️"
  },
  66: {
    en: "Clickety click! Route 66 baby! 🛣️",
    hi: "छियासठ – खटाखट! Route 66 पर दौड़ो! 🛣️",
    ne: "छयसट्ठी! खटखटाहट! छयसट्ठी! 🛣️"
  },
  67: {
    en: "Made in heaven! Sixty seven! 😇",
    hi: "सड़सठ – स्वर्ग में बना! भगवान का तोहफ़ा! 😇",
    ne: "सत्सट्ठी! स्वर्गमा बनेको उपहार! 😇"
  },
  68: {
    en: "Pick a date and a mate! Sixty eight! 💑",
    hi: "अड़सठ – जोड़ी बनाओ! तारीख पक्की करो! 💑",
    ne: "अठसट्ठी! जोडी मिलाउ! 💑"
  },
  69: {
    en: "The same both ways — mirror mirror! 🙃",
    hi: "उनहत्तर – उल्टा-सीधा एक जैसा! आइना देखो! 🙃",
    ne: "उनन्सत्तरी! उल्टो सोझो उस्तै! ऐना हेर! 🙃"
  },
  70: {
    en: "Three score and ten! Long may you run! 🎊",
    hi: "सत्तर – लंबी उम्र हो! तीन स्कोर पूरे! 🎊",
    ne: "सत्तरी! दीर्घ जीवन! तीन स्कोर! 🎊"
  },
  71: {
    en: "Bang on the drum! DJ seventy one! 🥁",
    hi: "इकहत्तर – ढोल बजाओ! DJ साहब! 🥁",
    ne: "एकहत्तर! ढोल बजाउ! DJ आयो! 🥁"
  },
  72: {
    en: "Six dozen! Eggs galore! 72! 🥚",
    hi: "बहत्तर – छह दर्जन! अण्डे गिनो! 🥚",
    ne: "बहत्तर! छ दर्जन अण्डा! 🥚"
  },
  73: {
    en: "Queen bee! Buzz buzz, seventy three! 🐝",
    hi: "तिहत्तर – रानी मधुमक्खी! भिनभिनाओ! 🐝",
    ne: "त्रिहत्तर! रानी मौरी! भन्भनाउ! 🐝"
  },
  74: {
    en: "Hit the dance floor! Seventy four! 💃",
    hi: "चौहत्तर – फ़र्श पर नाचो! डिस्को शुरू! 💃",
    ne: "चौहत्तर! भुइँमा नाच! डिस्को! 💃"
  },
  75: {
    en: "Strive and survive! Diamond jubilee! 💎",
    hi: "पचहत्तर – आज़ादी का अमृत महोत्सव! 🇮🇳",
    ne: "पचहत्तर! हीरक जयन्ती! 💎"
  },
  76: {
    en: "Seventy six trombones in the parade! 🎺",
    hi: "छिहत्तर – बैंड बजाओ! शहनाई छेड़ो! 🎺",
    ne: "छयहत्तर! बाजा बजाउ! परेड! 🎺"
  },
  77: {
    en: "Sunset strip! Double seven — James Bond! 🕵️",
    hi: "सतहत्तर – Bond, James Bond! 007! 🕵️",
    ne: "सतहत्तर! जेम्स बन्ड! ७७! 🕵️"
  },
  78: {
    en: "Heaven's gate! Knock and enter! 🌈",
    hi: "अठहत्तर – स्वर्ग का दरवाज़ा! खटखटाओ! 🌈",
    ne: "अठहत्तर! स्वर्गको ढोका! ढकढकाउ! 🌈"
  },
  79: {
    en: "One more time! Almost eighty! 🔁",
    hi: "उनासी – एक कम अस्सी! एक और बार गाओ! 🔁",
    ne: "उनासी! एक पटक फेरि! अस्सीको ढोकामा! 🔁"
  },
  80: {
    en: "Gandhi's breakfast — eight and a zero! 🕊️",
    hi: "अस्सी – गांधी जी का नाश्ता! सत्य अहिंसा! 🕊️",
    ne: "अस्सी! गान्धीजी याद गर! अहिंसा! 🕊️"
  },
  81: {
    en: "Stop and run at eighty one! ¡Olé! 🏃",
    hi: "इक्यासी – रुको नहीं, दौड़ो! हिम्मत रखो! 🏃",
    ne: "एकासी! नरोकिनुस्, दौडनुस्! 🏃"
  },
  82: {
    en: "Straight on through! Nearly home! 🎯",
    hi: "बयासी – सीधे आगे! मंज़िल दिख रही है! 🎯",
    ne: "बयासी! सिधै अगाडि! लक्ष्य देखियो! 🎯"
  },
  83: {
    en: "Time for tea and biscuits! Eighty three! ☕",
    hi: "तिरासी – चाय का वक्त! बिस्कुट भी लाओ! ☕",
    ne: "तिरासी! चिया र बिस्कुट! ☕"
  },
  84: {
    en: "Seven dozen! Chaurasi ka chakkar! 🎲",
    hi: "चौरासी – सात दर्जन! चौरासी का चक्कर! 🎲",
    ne: "चौरासी! सात दर्जन! चक्कर! 🎲"
  },
  85: {
    en: "Staying alive! Eighty five and thriving! 💪",
    hi: "पचासी – ज़िंदा रहो! जोश रखो! 💪",
    ne: "पचासी! जिउँदो र फूर्तिलो! 💪"
  },
  86: {
    en: "Between the sticks! Penalty save! 🥅",
    hi: "छियासी – गोलकीपर! बचाओ बचाओ! 🥅",
    ne: "छयासी! गोलकिपर! बचाउ! 🥅"
  },
  87: {
    en: "Torquay in Devon! Seaside holiday! 🏖️",
    hi: "सतासी – छुट्टी पर चलो! समुद्र किनारे! 🏖️",
    ne: "सतासी! छुट्टी मनाउन जाउ! 🏖️"
  },
  88: {
    en: "Two fat ladies! Wibble wobble wibble wobble! 💃💃",
    hi: "अट्ठासी – दो मोटी चाचियाँ! डोलती जा रही हैं! 💃💃",
    ne: "अठासी! दुई मोटी हजुरआमा! डुल्दै हिँड्दै! 💃💃"
  },
  89: {
    en: "Nearly there! Almost home, don't stop! 🏁",
    hi: "नवासी – लगभग पहुँच गए! बस थोड़ा सा! 🏁",
    ne: "नवासी! लगभग पुगियो! रोकिनुस् नहोस्! 🏁"
  },
  90: {
    en: "Top of the shop! As far as we go! GAME OVER! 🎉🏆",
    hi: "नब्बे – सबसे ऊपर! खेल खत्म! नब्बे का दम! 🎉🏆",
    ne: "नब्बे! सबैभन्दा माथि! खेल सकियो! बधाई छ! 🎉🏆"
  }
};
