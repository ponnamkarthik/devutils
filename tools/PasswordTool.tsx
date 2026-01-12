"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, Card } from "../components/UI";
import {
  KeyRound,
  RefreshCw,
  Copy,
  Check,
  Lock,
  ShieldCheck,
  Settings2,
  Info,
} from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const WORDLIST =
  "acid|acorn|acre|acts|afar|affix|aged|agent|agile|aging|agony|ahead|aide|aids|aim|ajar|alarm|alias|alibi|alien|alike|alive|aloe|aloft|aloha|alone|aloof|alpha|altar|alter|amaze|amber|amble|amend|amiss|ample|angel|anger|angle|angry|angst|anime|ankle|annex|anode|antic|anvil|apart|apex|aphid|apple|apply|apron|apt|aqua|arbor|ardor|area|arena|argue|arise|armed|armor|army|aroma|array|arrow|arson|arts|ascot|ashen|aside|ask|asleep|aspic|assay|asset|atlas|atom|atone|attic|audio|audit|aura|auto|aver|avert|avid|avow|awake|award|aware|awoke|axis|bacon|badge|bagel|baggy|baked|baker|balmy|banjo|barge|barn|bash|basil|bask|batch|bath|baton|bats|batt|bayou|bead|beak|beam|bean|bear|beard|beast|beat|beauty|beep|beer|beet|begun|bell|belt|bench|beret|berry|best|beta|bevel|bib|bid|big|bike|bill|bind|bingo|biota|bird|bite|bits|blabs|black|blade|blah|blame|blank|blast|blaze|bleak|blend|bless|blimp|blink|blip|bliss|blitz|bloat|blob|block|blog|blond|blood|bloom|blot|blown|blue|bluff|blunt|blur|blurt|blush|boar|board|boat|body|boil|bok|bolt|bomb|bond|bone|bong|bonk|bonus|book|boom|boot|booth|boozy|bop|border|bore|botch|both|bottle|bottom|bought|bounce|bound|bow|bowl|box|boy|braid|brain|brake|brand|brass|brave|bravo|brawl|brawn|bread|break|breath|bribe|brick|bride|brief|brine|bring|brink|brisk|broad|broil|broke|broken|bronze|brook|broom|brown|bruise|brush|brute|buck|buddy|budge|bug|build|bulb|bulge|bulk|bull|bully|bump|bun|bunch|bunk|bunny|bunt|buoy|burn|burp|burst|bus|bush|bust|busy|but|butane|butter|button|buy|buyer|buzz|cab|cabin|cable|cache|cactus|caddy|cage|cake|calf|call|calm|cam|camel|camp|canal|candy|cane|canine|cap|cape|card|care|caret|cargo|caring|carp|cart|case|cash|cask|cast|cat|catch|cater|cause|cave|cease|cedar|cell|cement|cent|cess|chafe|chain|chair|chant|chaos|chap|chard|charm|chart|chase|chat|cheap|cheat|check|cheek|cheer|chef|chess|chest|chew|chic|chicken|chief|child|chili|chill|chime|imp|chin|chip|chirp|chive|choir|choke|chomp|chop|chow|chuck|chump|chunk|churn|chute|cider|cigar|cinch|circa|cite|city|civic|civil|clad|claim|clam|clamp|clan|clank|clap|clash|clasp|class|claw|clay|clean|clear|cleat|cleft|clerk|click|cliff|climb|cling|clink|clip|cloak|clock|clone|cloth|cloud|clump|coach|coast|coat|cobra|cocoa|code|coil|coin|coke|cola|cold|colt|coma|comb|come|comic|comma|cone|cope|copy|coral|cork|corn|cost|cot|couch|cough|count|coup|cover|cow|crab|crack|craft|cramp|crane|crank|crate|crave|crawl|craze|crazy|creak|cream|credo|creed|creek|creep|crepe|crept|cress|crest|crew|crib|cried|crier|crisp|croak|crop|cross|crowd|crown|crud|cruel|crumb|crush|crust|crux|cry|crypt|cube|cubit|cuff|cull|cult|cup|curb|cure|curl|curry|curse|curve|curvy|cut|cute|cycle|cynic|dad|daily|dairy|daisy|dale|damp|dance|dandy|dare|dark|darn|dart|dash|data|date|dawn|day|daze|deal|dealt|dean|debit|debt|debug|debut|decal|decay|deck|decor|decoy|deed|deep|deer|defeat|defect|defer|deft|defy|degree|deity|delay|delete|delta|demand|demo|demon|demure|denim|dent|deny|depot|depth|derby|desk|deter|detox|deuce|devil|diary|dice|dictum|diet|digit|dime|dimly|diner|dingo|dingy|dinky|diode|dirge|dirt|dirty|disc|dish|ditch|ditto|ditty|diva|divan|dive|divot|dizzy|dock|dodge|doer|dog|dogma|doing|doll|dollar|dolly|donor|door|dope|dot|double|doubt|dough|down|doze|drab|draft|drain|drama|drape|draw|dread|dream|dress|dried|drift|drill|drink|drip|drive|drone|droop|drop|drove|drown|drum|dry|dual|duck|duct|due|duel|duet|duke|dull|duly|dump|dune|dung|dunk|dupe|dusk|dust|duty|dwarf|dwell|dying|eagle|early|earth|ease|east|easy|eat|ebony|echo|eclipse|edge|edit|eel|effigy|egg|ego|eight|eject|eke|elate|elbow|elder|elect|eleven|elf|elite|elk|elm|elope|else|elude|email|ember|emerge|emit|emote|empty|enact|end|endow|enemy|energy|enforce|engage|engine|enjoy|enlist|enough|enrich|enroll|ensure|enter|entire|entry|envy|epic|epoch|equal|equip|erase|erect|erode|error|erupt|essay|etch|ether|ethic|evade|even|event|ever|every|evict|evil|evoke|exact|exalt|exam|excel|excess|exert|exile|exist|exit|expand|expect|expel|expire|export|expose|extend|extra|exult|eye|fable|face|fact|fade|fail|faint|fair|faith|fake|fall|fame|fan|fancy|fang|far|farm|fast|fat|fatal|fate|father|fatty|fault|favor|fawn|fear|feast|feat|fecal|feel|feline|felt|femur|fence|fend|ferry|fetal|fetch|fever|few|fiat|fiber|fiction|fiddle|field|fiend|fiery|fifth|fifty|fig|fight|figure|file|fill|film|filter|filth|final|finance|find|fine|finger|finish|fire|firm|first|fish|fit|five|fix|fizz|flag|flail|flair|flake|flame|flank|flare|flash|flask|flat|flavor|flaw|fled|flee|fleece|fleet|flesh|flex|flick|flier|flight|flint|flip|flirt|float|flock|flog|flop|flora|floss|flour|flow|flower|fluent|fluff|fluid|fluke|flume|flush|flute|fly|foam|focal|focus|fog|foil|fold|folk|follow|folly|food|fool|foot|for|forbid|force|ford|forest|forge|fork|form|fort|forth|forty|forum|foss|foul|found|four|fox|foyer|frail|frame|frank|fraud|fray|free|freeze|frenzy|fresh|fret|fric|fried|frill|frisk|frock|frog|from|front|frost|froth|frown|froze|fruit|fry|fudge|fuel|full|fume|fun|fund|funny|fur|fury|fuse|fuss|fuzz|gag|gain|gala|galaxy|gale|gall|game|gang|gap|garage|garb|garden|garlic|gas|gasp|gate|gather|gauge|gaunt|gave|gawk|gaze|gear|gecko|geek|gel|gem|gene|genie|genre|gentle|geology|germ|get|geyser|ghetto|ghost|giant|gift|giggle|gill|gilt|ginger|girl|gist|give|given|glad|glare|glass|glaze|gleam|glean|glide|glimpse|gloat|globe|gloom|glory|gloss|glove|glow|glue|glum|glut|glyph|gnat|gnaw|goad|goat|gob|god|going|gold|golf|gone|gong|good|goof|gore|gorge|gosh|gospel|got|gouge|gourd|govern|gown|grab|grace|grade|graft|grain|gram|grand|grant|grape|graph|grasp|grass|grate|grave|gravy|gray|graze|great|greed|green|greet|grid|grief|grill|grim|grin|grind|grip|grit|groan|groin|groom|grope|gross|group|grove|grow|growl|grown|grub|gruel|grump|grunt|guard|guess|guest|guide|guild|guilt|guise|guitar|gulf|gull|gulp|gum|gun|guru|gush|gust|gut|guy|gym|gypsy|habit|hack|hail|hair|hairy|half|hall|halo|halt|ham|hammer|hand|handle|hang|happen|happy|harbor|hard|hare|harm|harp|harsh|has|hat|hatch|hate|haul|haunt|have|haven|havoc|hawk|hay|haze|hazel|head|heal|health|heap|hear|heart|heat|heavy|hedge|heel|hefty|height|heir|helix|hello|helm|help|hemp|hence|herb|herd|here|hero|hex|hey|hiatus|hide|high|hike|hill|hilt|him|hind|hinge|hint|hip|hire|hiss|hit|hive|hoard|hobby|hockey|hog|hold|hole|hollow|holly|home|honest|honey|hood|hoof|hook|hoop|hoot|hop|hope|horde|horn|horse|hose|host|hot|hotel|hound|hour|house|hover|how|howl|hub|hue|hug|huge|hull|hum|human|humid|hump|humus|hunch|hundred|hung|hunt|hurdle|hurl|hurry|hurt|hush|husk|hut|hybrid|hydra|hydro|hyena|hymn|hype|ice|icing|icon|idea|idle|idol|igloo|ignite|ignore|ill|image|imbed|imbue|impel|imply|import|impose|impugn|impure|inborn|inch|income|indent|index|indoor|induce|inept|inert|infant|infect|infer|influx|inform|ingot|inhale|inject|injure|ink|inlay|inlet|inner|input|insect|insert|inset|inside|insist|insult|intact|intake|intend|inter|into|invade|invent|invest|invite|invoke|inward|iron|irony|islet|issue|itch|item|itself|ivory|jab|jack|jaded|jail|jam|jar|jaw|jazz|jeep|jelly|jerky|jest|jet|jewel|jib|jiffy|jig|jingle|jive|job|jock|jog|join|joke|jolt|joust|joy|judge|jug|juice|jump|junk|jury|just|jute|kabob|kam|karma|kayak|kazoo|keep|keg|kelp|kennel|kept|kernel|kettle|key|khaki|kick|kid|kiln|kilo|kilt|kind|king|kiosk|kiss|kite|kitten|kiwi|knee|kneel|knew|knit|knob|knock|knot|know|known|koala|krill|label|lace|lack|ladder|ladle|lady|lag|lake|lamb|lamp|land|lane|lap|lapel|lapse|large|larva|lasso|last|latch|late|later|lathe|laud|laugh|launch|lava|law|lawn|lawsuit|lay|layer|lazy|lead|leaf|leak|lean|leap|learn|lease|leash|least|leave|ledge|leech|left|leg|legal|legend|lemon|lemur|lend|length|lens|lent|leper|less|let|letter|level|lever|levy|liar|libel|lick|lid|lie|life|lift|light|like|lilac|lily|limb|lime|limit|limp|line|link|lion|lip|liquid|lisp|list|lit|live|liver|load|loaf|loan|lobby|lobe|local|lock|locus|lodge|loft|log|logic|logo|lone|long|look|loom|loop|loose|loot|loss|lost|lot|lotus|loud|lounge|louse|love|low|loyal|luck|lucky|lug|lull|lumber|lump|lunar|lunch|lung|lurch|lure|lurid|lush|lust|lute|luxury|lying|lyric|mace|mach|mad|made|magic|magnet|magpie|maid|mail|main|make|maker|male|mall|malt|mama|mammal|man|manage|mane|manga|mange|mango|mania|manor|mantle|manual|map|maple|mar|marble|march|mare|margin|marina|mark|market|marrow|marry|marsh|mart|mascot|mask|mass|mast|match|mate|math|matrix|matter|mature|maul|max|may|maybe|mayor|maze|mead|meadow|meal|mean|meant|meat|medal|media|medic|medium|meet|melt|member|memo|memory|men|mend|menu|meow|mercy|merge|merit|merry|mesh|mess|met|metal|meter|method|metro|micro|mid|midst|might|mild|mile|milk|mill|mime|mimic|mind|mine|mini|mink|minor|mint|minus|minute|mirror|mirth|miss|mist|mite|mitt|mix|moan|moat|mob|mobile|mock|mode|model|modem|modern|modest|modify|module|moist|mold|mole|molt|mom|moment|money|monk|month|mood|moon|moose|mop|moral|more|morn|mort|moss|most|moth|motion|motive|motor|mount|mourn|mouse|mouth|move|movie|mower|much|muck|mud|muffin|mug|mulch|mule|mull|multi|mumble|mummy|munch|mural|murk|muse|mush|music|musk|must|mute|mutter|mutton|myriad|myself|myth|nab|nag|nail|name|nap|napkin|narrow|nasal|nasty|nation|native|nature|nausea|naval|nave|navy|near|neat|neck|need|needle|negate|neigh|neon|nerve|nest|net|neuron|never|new|next|nice|niche|nick|niece|night|nine|ninja|nip|noble|node|noise|noisy|nomad|none|nook|noon|nope|norm|north|nose|nosy|note|notice|notify|noun|novel|novice|now|nozzle|null|numb|nurse|nut|nylon|oaf|oak|oar|oasis|oat|obey|object|oboe|obtain|ocean|ochre|octave|odor|off|offer|office|often|ogre|oil|oink|okay|okra|old|olive|omen|omit|once|one|onion|only|onset|onto|onus|onyx|ooze|opal|open|opera|oppose|optic|option|oracle|orange|orbit|orchard|order|oreo|organ|orient|origin|ornate|orphan|other|otter|ouch|ought|ounce|our|out|outer|output|outset|oval|oven|over|owe|owl|own|owner|oxide|oxygen|oyster|ozone|pace|pack|packet|pact|paddle|page|paid|pail|pain|paint|pair|palace|pale|palm|pan|panel|panic|pansy|pant|pantry|papa|paper|parcel|pardon|parent|park|parole|parrot|parse|part|party|pass|past|paste|pastry|pat|patch|path|patio|patrol|patron|pause|pave|paw|pawn|pay|payee|payer|peace|peach|peak|pear|pearl|pecan|pedal|peel|peer|peg|pelt|pen|penalty|pencil|pend|penny|people|pepper|perch|peril|period|perk|permit|person|pest|pet|petal|phase|phone|photo|phrase|piano|pick|picket|pickle|picnic|picture|pie|piece|pier|pig|pike|pile|pill|pilot|pimple|pin|pine|ping|pink|pint|pipe|piping|pirate|pit|pitch|pity|pivot|pixel|pizza|place|plague|plain|plan|plane|plank|plant|plasma|plate|play|player|plea|plead|please|pledge|plenty|plier|plight|plod|plot|plow|ploy|pluck|plug|plum|plumb|plume|plunge|plus|ply|pocket|pod|poem|poet|point|poison|poke|pole|police|policy|polish|polite|poll|pollen|polo|pond|pony|pool|poor|pop|poppy|porch|pore|pork|port|portal|pose|posh|post|potato|potter|pouch|pound|pour|pout|powder|power|prank|pray|preach|prefer|prefix|press|pretty|price|pride|priest|primal|prime|primp|prince|print|prior|prism|prison|privy|prize|probe|profit|prompt|prong|proof|prop|proper|prose|prove|prune|pry|public|puck|puddle|puff|pug|pull|pulp|pulse|puma|pump|punch|punk|pupil|puppet|puppy|purchase|pure|purge|purple|purr|purse|push|put|putty|puzzle|quack|quail|quake|qualm|quart|quartz|queen|query|quest|queue|quick|quiet|quill|quilt|quirk|quit|quite|quota|quote|rabbit|race|rack|radar|radio|raft|rage|raid|rail|rain|raise|rake|rally|ram|ramble|ramp|ranch|range|rank|ransom|rapid|rare|rash|rasp|rat|rate|rather|ratio|rattle|rave|raven|raw|ray|razor|reach|react|read|ready|real|realm|ream|reap|rear|reason|rebel|receipt|record|red|reduce|reed|reef|reel|refer|reform|refuge|refuse|regal|regard|region|regret|reign|reject|relax|relay|relic|relief|rely|remain|remark|remedy|remind|remote|remove|rent|repair|repeat|repel|reply|report|rescue|resent|reside|resign|resin|resist|resort|rest|result|resume|retail|retain|retina|retire|return|reveal|revert|review|revise|revive|revolt|reward|rhino|rhyme|rhythm|rib|ribbon|rice|rich|rick|rid|ride|ridge|rifle|rift|rig|right|rigid|rile|rim|ring|rinse|riot|rip|ripe|ripple|rise|risk|ritual|rival|river|road|roar|roast|rob|robe|robin|robot|robust|rock|rocket|rod|rode|role|roll|romp|roof|room|root|rope|rose|rosy|rotate|rotor|rotten|rouge|rough|round|route|rover|row|royal|rub|rubber|rubble|ruby|rudder|rude|rug|ruin|rule|ruler|rumble|run|rune|rung|runt|rupture|rural|rush|rust|rut|sack|sad|saddle|safe|safety|sage|said|sail|salad|salary|sale|salmon|salon|saloon|salt|salute|same|sample|sand|sane|sash|satin|satire|sauce|sauna|save|saw|say|scale|scalp|scan|scant|scar|scare|scarf|scene|scent|school|science|scoff|scold|scoop|scope|score|scorn|scout|scowl|scrap|screen|script|scroll|scrub|sea|seal|seam|search|season|seat|second|secret|sect|sector|secure|sedan|see|seed|seek|seem|seen|seep|segment|seize|seldom|select|self|sell|send|senior|sense|sensor|sent|sentry|septum|sequel|series|sermon|servant|serve|server|set|settle|seven|severe|sew|sewer|sex|shack|shade|shadow|shaft|shaggy|shake|shaky|shale|shall|sham|shampoo|shape|share|shark|sharp|shave|she|shear|shed|sheep|sheer|sheet|shelf|shell|sherry|shield|shift|shine|shiny|ship|shirt|shiver|shock|shoe|shook|shop|shore|short|shot|should|shout|shove|show|shower|shrank|shred|shrew|shrub|shrug|shut|shy|sick|side|siege|sift|sigh|sight|sign|signal|silent|silk|silly|silo|silver|simple|since|sing|single|sink|sip|siren|sister|sit|site|six|size|sketch|ski|skid|skill|skin|skirt|skit|skulk|skull|skunk|sky|slab|slack|slain|slam|slang|slap|slate|slats|slave|sled|sleep|sleet|sleeve|sleigh|slept|slice|slick|slide|slime|slim|sling|slink|slip|slit|slob|slot|slow|slug|slum|slump|slur|slush|small|smart|smash|smell|smile|smirk|smith|smock|smog|smoke|smooth|smug|snack|snag|snail|snake|snap|snare|snarl|sneak|sneer|sniff|snipe|snob|snoop|snore|snort|snout|snow|snub|snuff|snug|soak|soap|soar|sob|soccer|social|sock|soda|sofa|soft|soggy|soil|solar|sold|sole|solemn|solid|solo|solve|some|son|sonar|song|sonic|soon|soot|sore|sorry|sort|soul|sound|soup|sour|source|south|sow|soy|space|spade|span|spare|spark|spat|spawn|speak|spear|spec|speck|speed|spell|spend|sphere|spice|spider|spike|spill|spin|spine|spiral|spirit|spit|spite|splash|split|spoil|spoke|sponge|spoon|sport|spot|spouse|spout|spray|spread|spree|spring|sprint|sprout|spruce|spud|spur|spurn|spy|square|squash|squat|squid|stack|staff|stage|stain|stair|stake|stale|stalk|stall|stamp|stand|star|starch|stare|stark|start|stash|state|static|statue|stay|steak|steal|steam|steel|steep|steer|stem|step|stereo|stew|stick|sticky|stiff|stifle|still|sting|stink|stint|stir|stitch|stock|stoic|stoke|stole|stomp|stone|stony|stool|stop|store|storm|story|stout|stove|stow|strap|straw|stray|street|stress|stride|strike|string|strip|strive|stroke|stroll|strong|stud|studio|study|stuff|stumble|stump|stung|stunt|style|suave|sub|subject|submit|subway|such|sudden|suffer|sugar|suggest|suit|sulky|sullen|sum|summer|submit|sun|sunny|sunset|super|supper|supply|sure|surf|surge|surl|surly|survey|sushi|swab|swag|swamp|swan|swap|swarm|sway|swear|sweat|sweep|sweet|swell|swept|swift|swim|swine|swing|swirl|switch|swoop|sword|swore|swung|symbol|sync|syrup|system|table|tablet|tack|tactic|tad|tag|tail|tailor|take|tale|talk|tall|tallow|tally|tame|tan|tango|tank|tap|tape|tar|target|tariff|tart|task|taste|tattoo|taught|taxi|tea|teach|team|tear|tease|tech|teeth|tell|temper|temple|tempo|tend|tennis|tent|term|terms|test|text|than|thank|that|thaw|the|theft|their|them|theme|then|theory|there|these|they|thick|thief|thigh|thin|thing|think|third|thirst|this|thorn|those|though|thread|threat|three|threw|thrill|thrive|throat|throb|throne|throw|thud|thug|thumb|thump|thus|tiara|tick|ticket|tidal|tide|tidy|tie|tiger|tight|tile|till|tilt|time|tin|tinder|tint|tiny|tip|tiptoe|tire|tissue|title|toad|toast|today|toe|toga|toil|toilet|token|told|toll|tomato|tomb|ton|tone|tongue|tonic|tool|tooth|top|topic|topple|torch|torso|tort|toss|total|totem|touch|tough|tour|tow|towel|tower|town|toxic|toxin|toy|trace|track|tract|trade|trail|train|trait|tram|trance|trap|trash|travel|tray|tread|treat|tree|trek|trend|trial|tribe|trick|tried|trio|trip|trite|troll|troop|trophy|trot|trough|trout|truck|true|truly|trunk|trust|truth|try|tub|tube|tuck|tuft|tug|tulip|tumble|tuna|tune|tunic|tunnel|turban|turf|turkey|turn|turtle|tutor|tweed|twelve|twenty|twice|twig|twilight|twin|twist|two|tycoon|type|tyrant|ugly|ulcer|ultra|umpire|unable|uncle|under|uneven|unfold|unify|unique|unit|unite|unity|unkempt|unknown|unlock|unsafe|unseen|unsung|unveil|update|uphill|uphold|upon|uproar|upset|urban|urge|usage|use|usher|using|usual|usurp|utility|utter|vacant|vacuum|vague|vain|valet|valid|valley|value|valve|van|vanish|vanity|vapor|vary|vase|vast|vat|vault|vector|veer|vegan|veil|vein|velvet|vendor|veneer|venom|vent|venue|verb|verbal|verge|verify|verity|verse|versus|very|vessel|vest|vet|veto|vex|via|vial|vibe|vice|victim|victor|video|view|vigil|vile|village|vine|violin|viper|viral|virtue|virus|visit|visor|visual|vital|vivid|vocal|vodka|vogue|voice|void|volcano|volley|volt|volume|vote|vowel|voyage|wade|waffle|wage|wagon|waist|wait|waive|wake|walk|wall|walnut|waltz|wand|wane|want|war|ward|warm|warn|warp|wary|wash|wasp|waste|watch|water|wave|waver|wax|way|weak|wealth|weapon|wear|weary|weather|weave|web|wedge|wee|weed|week|weigh|weird|welcome|well|went|wept|were|west|wet|whale|what|wheat|wheel|when|where|whet|which|whiff|while|whim|whip|whirl|whisks|white|whole|whoop|wick|wide|widow|width|wife|wig|wild|will|wilt|win|wind|wine|wing|wink|winner|winter|wipe|wire|wisdom|wise|wish|wisp|wit|witch|with|witty|wizard|woke|wolf|woman|womb|won|wonder|wood|wool|word|work|world|worm|worry|worse|worst|worth|would|wound|wrap|wrath|wreath|wreck|wren|wrench|wrest|wring|wrist|write|wrong|xerox|yacht|yak|yam|yank|yard|yarn|yawn|year|yeast|yell|yellow|yelp|yield|yoke|yolk|young|youth|yoyo|yuck|yucca|yule|zany|zap|zeal|zebra|zero|zest|zinc|zing|zip|zone|zoom";

const WORD_ARRAY = WORDLIST.split("|");

const getRandomInt = (max: number) => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
};

const calculateEntropy = (password: string, poolSize: number): number => {
  if (!password) return 0;
  // H = L * log2(R)
  return Math.floor(password.length * Math.log2(poolSize));
};

// Dynamic estimation for manual input
const estimateStrength = (text: string) => {
  if (!text) return 0;
  let pool = 0;
  if (/[a-z]/.test(text)) pool += 26;
  if (/[A-Z]/.test(text)) pool += 26;
  if (/\d/.test(text)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(text)) pool += 33; // Common symbols

  if (pool === 0) return 0;
  return Math.floor(text.length * Math.log2(pool));
};

// Estimates brute force time (rough heuristics)
const estimateCrackTime = (entropy: number): string => {
  if (entropy < 20) return "Instantly";
  if (entropy < 40) return "Seconds";
  if (entropy < 60) return "Minutes to Hours";
  if (entropy < 80) return "Days to Months";
  if (entropy < 100) return "Years";
  return "Centuries";
};

const getStrengthColor = (entropy: number) => {
  if (entropy < 40) return "text-destructive";
  if (entropy < 60) return "text-orange-500";
  if (entropy < 80) return "text-yellow-500";
  if (entropy < 100) return "text-lime-500";
  return "text-emerald-500";
};

const getStrengthLabel = (entropy: number) => {
  if (entropy < 40) return "Very Weak";
  if (entropy < 60) return "Weak";
  if (entropy < 80) return "Moderate";
  if (entropy < 100) return "Strong";
  return "Very Strong";
};

export const PasswordTool: React.FC = () => {
  const [mode, setMode] = useState<"password" | "passphrase">("password");

  // Password State
  const [length, setLength] = useLocalStorage("pwd-length", 16);
  const [useUpper, setUseUpper] = useLocalStorage("pwd-upper", true);
  const [useLower, setUseLower] = useLocalStorage("pwd-lower", true);
  const [useNumbers, setUseNumbers] = useLocalStorage("pwd-numbers", true);
  const [useSymbols, setUseSymbols] = useLocalStorage("pwd-symbols", true);
  const [excludeSimilar, setExcludeSimilar] = useLocalStorage(
    "pwd-exclude",
    false
  );

  // Passphrase State
  const [phraseCount, setPhraseCount] = useLocalStorage("pwd-phrase-count", 4);
  const [separator, setSeparator] = useLocalStorage("pwd-separator", "-");
  const [capitalize, setCapitalize] = useLocalStorage("pwd-capitalize", false);
  const [includeNumber, setIncludeNumber] = useLocalStorage(
    "pwd-phrase-num",
    false
  );

  // Output
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [entropy, setEntropy] = useState(0);
  const [isManual, setIsManual] = useState(false);

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generate = useCallback(() => {
    let result = "";
    let poolSize = 0;

    if (mode === "password") {
      const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const lower = "abcdefghijklmnopqrstuvwxyz";
      const nums = "0123456789";
      const syms = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
      const similar = /[il1Lo0O]/g;

      let chars = "";
      if (useUpper) chars += upper;
      if (useLower) chars += lower;
      if (useNumbers) chars += nums;
      if (useSymbols) chars += syms;

      if (excludeSimilar) {
        chars = chars.replace(similar, "");
      }

      if (!chars) return;

      poolSize = chars.length;

      for (let i = 0; i < length; i++) {
        result += chars.charAt(getRandomInt(chars.length));
      }
    } else {
      // Passphrase
      poolSize = WORD_ARRAY.length;
      const words: string[] = [];
      for (let i = 0; i < phraseCount; i++) {
        let word = WORD_ARRAY[getRandomInt(poolSize)];
        if (capitalize) word = word.charAt(0).toUpperCase() + word.slice(1);
        words.push(word);
      }

      if (includeNumber) {
        words[words.length - 1] += getRandomInt(10);
        poolSize += 10;
      }

      result = words.join(separator);

      const baseEntropy = phraseCount * Math.log2(WORD_ARRAY.length);
      const numEntropy = includeNumber ? Math.log2(10) : 0;
      setEntropy(Math.floor(baseEntropy + numEntropy));
      setPassword(result);
      setIsManual(false);
      return;
    }

    setEntropy(calculateEntropy(result, poolSize));
    setPassword(result);
    setIsManual(false);
  }, [
    mode,
    length,
    useUpper,
    useLower,
    useNumbers,
    useSymbols,
    excludeSimilar,
    phraseCount,
    separator,
    capitalize,
    includeNumber,
  ]);

  // Regenerate when settings change (debounced slightly by nature of React updates, but explicit effect)
  // Only auto-regenerate if the user hasn't manually edited the password
  useEffect(() => {
    if (!isManual) {
      generate();
    }
  }, [generate, isManual]);

  const handleManualInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const val = e.target.value;
    setPassword(val);
    setIsManual(true);
    setEntropy(estimateStrength(val));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const strengthPercentage = Math.min(100, (entropy / 128) * 100);

  return (
    <div className="flex flex-col gap-6 w-full h-full min-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40 flex-none">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Password Generator
            </h1>
            <p className="text-xs text-muted-foreground">
              Generate secure passwords or check password strength.
            </p>
          </div>
        </div>
      </div>

      {/* Output Card */}
      <Card className="p-6 md:p-8 flex flex-col gap-6 border-border shadow-md bg-card/50 backdrop-blur-sm relative overflow-hidden">
        {/* Entropy Badge */}
        <div className="absolute top-0 right-0 p-3">
          <div
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-background border border-border shadow-sm flex items-center gap-1.5 ${getStrengthColor(entropy)}`}
          >
            <ShieldCheck className="h-3 w-3" />
            {entropy} bits {isManual ? "(est)" : ""}
          </div>
        </div>

        <div className="space-y-4 text-center">
          <div className="relative">
            <textarea
              value={password}
              onChange={handleManualInput}
              spellCheck={false}
              className="w-full bg-transparent text-center font-mono text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground focus:outline-none resize-none overflow-hidden"
              style={{ minHeight: "80px", height: "auto" }}
              rows={1}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = target.scrollHeight + "px";
              }}
            />
            {isManual && (
              <div className="absolute -bottom-4 left-0 right-0 text-[10px] text-muted-foreground uppercase tracking-widest opacity-50">
                Manual Input Mode
              </div>
            )}
          </div>
          <p
            className={`text-xs font-medium uppercase tracking-widest ${getStrengthLabel(entropy) === "Very Strong" ? "text-emerald-500" : "text-muted-foreground"}`}
          >
            {getStrengthLabel(entropy)}
          </p>
        </div>

        {/* Strength Meter */}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-2">
          <div
            className={`h-full transition-all duration-500 ${entropy < 40 ? "bg-destructive" : entropy < 60 ? "bg-orange-500" : entropy < 80 ? "bg-yellow-500" : "bg-emerald-500"}`}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>

        <div className="flex justify-center gap-3 mt-2">
          <Button
            size="lg"
            onClick={() => {
              setIsManual(false);
              generate();
            }}
            className="min-w-[140px]"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Generate
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={copyToClipboard}
            className="min-w-[140px]"
          >
            {copied ? (
              <Check className="mr-2 h-4 w-4 text-emerald-500" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </Card>

      {/* Settings Panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Mode Switcher Sidebar */}
        <div className="md:col-span-4 flex flex-col gap-2">
          <button
            onClick={() => setMode("password")}
            className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${mode === "password" ? "bg-primary/5 border-primary ring-1 ring-primary/20" : "bg-card border-border hover:border-primary/50"}`}
          >
            <div
              className={`p-2 rounded-full ${mode === "password" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-sm">Random Password</div>
              <div className="text-xs text-muted-foreground">
                High entropy characters
              </div>
            </div>
          </button>

          <button
            onClick={() => setMode("passphrase")}
            className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${mode === "passphrase" ? "bg-primary/5 border-primary ring-1 ring-primary/20" : "bg-card border-border hover:border-primary/50"}`}
          >
            <div
              className={`p-2 rounded-full ${mode === "passphrase" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              <Settings2 className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-sm">Diceware Passphrase</div>
              <div className="text-xs text-muted-foreground">
                Easy to remember words
              </div>
            </div>
          </button>

          <div className="mt-4 p-4 bg-muted/20 rounded-xl border border-border/50 text-xs text-muted-foreground space-y-2">
            <div className="font-semibold text-foreground flex items-center gap-2">
              <Info className="h-3.5 w-3.5" /> Crack Time Estimate
            </div>
            <p>Based on entropy:</p>
            <p className="font-mono text-foreground font-bold text-lg">
              {estimateCrackTime(entropy)}
            </p>
            <p className="opacity-70 text-[10px]">
              Assuming sophisticated brute-force attack.
            </p>
          </div>
        </div>

        {/* Configuration Area */}
        <div className="md:col-span-8">
          <Card className="p-6 h-full border-border/60 shadow-sm">
            {mode === "password" ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium">Length</label>
                    <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                      {length}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="64"
                    value={length}
                    onChange={(e) => setLength(parseInt(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center justify-between p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/30">
                    <span className="text-sm">Uppercase (A-Z)</span>
                    <input
                      type="checkbox"
                      checked={useUpper}
                      onChange={(e) => setUseUpper(e.target.checked)}
                      className="rounded border-input text-primary focus:ring-primary w-4 h-4"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/30">
                    <span className="text-sm">Lowercase (a-z)</span>
                    <input
                      type="checkbox"
                      checked={useLower}
                      onChange={(e) => setUseLower(e.target.checked)}
                      className="rounded border-input text-primary focus:ring-primary w-4 h-4"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/30">
                    <span className="text-sm">Numbers (0-9)</span>
                    <input
                      type="checkbox"
                      checked={useNumbers}
                      onChange={(e) => setUseNumbers(e.target.checked)}
                      className="rounded border-input text-primary focus:ring-primary w-4 h-4"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/30">
                    <span className="text-sm">Symbols (!@#)</span>
                    <input
                      type="checkbox"
                      checked={useSymbols}
                      onChange={(e) => setUseSymbols(e.target.checked)}
                      className="rounded border-input text-primary focus:ring-primary w-4 h-4"
                    />
                  </label>
                </div>

                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={excludeSimilar}
                    onChange={(e) => setExcludeSimilar(e.target.checked)}
                    className="rounded border-input text-primary focus:ring-primary"
                  />
                  Exclude similar characters (i, l, 1, L, o, 0, O)
                </label>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium">Word Count</label>
                    <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                      {phraseCount}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="12"
                    value={phraseCount}
                    onChange={(e) => setPhraseCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Separator
                    </label>
                    <div className="flex gap-2">
                      {["-", "_", ".", " "].map((sep) => (
                        <button
                          key={sep === " " ? "space" : sep}
                          onClick={() => setSeparator(sep)}
                          className={`w-8 h-8 rounded border flex items-center justify-center font-mono text-sm transition-all ${separator === sep ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"}`}
                        >
                          {sep === " " ? "␣" : sep}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 justify-center">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={capitalize}
                        onChange={(e) => setCapitalize(e.target.checked)}
                        className="rounded border-input text-primary focus:ring-primary"
                      />
                      Capitalize Words
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeNumber}
                        onChange={(e) => setIncludeNumber(e.target.checked)}
                        className="rounded border-input text-primary focus:ring-primary"
                      />
                      Include Number
                    </label>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
