// Common English words (lowercase). Purpose: short-circuit fuzzy medication
// matching on ordinary words like "coring", "cozy", "start", "morning". Not
// exhaustive; targets frequent words that phonetically collide with drug
// names in dictation. Approx 3,000 entries.

const WORDS = `
a about above absolute absolutely accept accepted accepting accepts access
according account accounts across act action actions active activity actual
actually add added adding addition additional address administer admin
adult adults advance advice advise affair affect after afternoon again
against age aged agency agent ago agree agreed agreement air alert alive
all allow allowed almost alone along already also although always am among
amount amounts an analysis and animal announce annual another answer any
anyone anything anyway apart appear appears application apply appointment
approach appropriate approve april are area arm arms army around arrange
arrive art article as ask asked asking asks aspect assist assistance
associate association at attack attempt attend attention audio august
authority available average avoid awake aware away back background bad
bag balance ball ban band bank bar base based basic basically basis be
bear beat beautiful became because become becomes becoming bed been before
began begin beginning begins behind being belief believe below beside
best better between beyond big bill birthday bit black blame blank blanket
blend blessed blind block blocked blood blue board boat body book books
born both bother bottle bottom bought bound box boy boys brain branch
brave bread break breakfast breast breath breathe brief bring bringing
brings british broad broke broken brother brought brown build building
built bulk burn burst bus business busy but buy buyer buying by call
called calling calls calm came camera camp campaign can canal cancel
cannot cap capacity capital captain car card care career careful carefully
carry carrying case cases cash cast cat catch caught cause caused causes
causing cave center central century certain certainly chain chair
challenge chance change changed changes changing channel character charge
charged charges chart cheap check checked checking chief child children
choice choose chose chosen church circle citizen city civil claim claimed
claiming class classroom clean clear cleared clearly click client climate
climb clock close closed closely closer closing club clue cluster
coach coast coat code coffee cold collect collected collection college
color come comes coming command comment commercial commission commit
common community company compare compared complete completed completely
complex computer concept concern concerned condition conditions conduct
conference confidence confidence confirm confirmed conflict connect
consider considered consideration constant construct construction consumer
contact contain contained container contains content contents contest
context continue continued continues continuing contract control controlled
convention convert cool copy core corner corporation correct cost cost
costs cotton could council country couple course court cover covered
covering coverage cow craft crash crazy create created creating creation
credit crime crisis critical criticism cross crowd cry culture cup current
currently cut cutting daily damage damaged dance danger dangerous dark
data date daughter day days dead deal dealer dealing dealt dear death
debate debt decade decide decided deciding decision declare deep default
defense define defined defining definitely definition degree degrees
delay deliver delivery demand democracy demonstrate deny department depend
depending depends deposit describe described description design designed
designer detail detailed details detect determine determined develop
developed developing development device devices did die died dies difference
different differently difficult digital dinner direct directed direction
director dirt disagree discover discovered discovery discuss discussed
discussion disease dish display distance distinct distribute district
divide division do doctor document does doing dollar domestic dominant
done door double doubt down draft draw drawing dream dress drink drive
driver driving drop dropped drug dry due during dust duty each earlier
early earn earned east easy easily eat eating economic economy edge
edit edition editor educated education educational effect effective
efficient effort eight either elect election electric electronic element
else email embrace emergency emotional employ employed employee employer
employment empty end ended ending ends enemy energy engage engaged engine
engineer english enjoy enjoyed enormous enough enter entered entering
enters entire entirely entry environment environmental equal equally
equipment error errors especially essential establish established estate
estimate ethnic evaluate evaluation even evening event events eventually
ever every everybody everyone everything evidence evolution exact exactly
example excellent except exception exchange exclude excuse execute exhibit
exist existed existence existing exists expand expansion expect expected
expects expense expensive experience experienced experiment expert explain
explained explanation explore express expression extend extended extension
extensive extent external extra extreme extremely eye eyes fabric face
faced faces facility fact factor factors facts factory fail failed failing
failure fair fairly faith fall fallen falling falls false familiar family
famous fan far farm farmer fashion fast fat father fault favor favorite
fear feature features federal fee feed feel feeling feels feet fell fellow
felt few field figure figured file files fill filled film final finally
financial find finding finds fine finger fire firm first fish fit five
fix fixed fixing flag flat flavor flew flight floor flow flower flu fluid
fly focus focused follow followed following follows food foot football
for force forced foreign forest forever forget forgive form former forms
forth fortune forward foster found foundation four fourth free freedom
fresh friend friendly friends from front fruit fuel full fun function
fund funding funds funny future gain game games garage garden gas gate
gather gave gender general generally generation generic get gets getting
gift girl girls give given gives giving glass global go goal goals god
goes going gold golden gone good goods government governor grab grace
grade graduate grand grant grass gray great greater greatest green ground
group groups grow growing grown growth guard guess guest guide gun guy
guys habit had hair half hall hand handle hands hang happen happened
happening happens happy hard hardly harm has hate have having head heading
heads health healthy hear heard hearing heart heat heavy held help helped
helpful helping helps her here heritage hero herself hey hi high higher
highest highly hill him himself hire his history hit hit hold held holding
holds hole holiday home homes honest honor hope hoped hoping horrible
horse hospital host hot hotel hour hours house household houses housing
how however huge human hundred hung hunt hurt husband ice idea identify
identity if ignore ill illegal image imagine impact important importantly
improve improved improvement in inability include included includes
including income incorporate increase increased increases increasing
increasingly indeed independent index indicate individual industrial
industry infant influence inform information initial injury inside instead
institution institutions instructions instrument insurance intelligence
intend intention interest interested interesting international internet
interview into introduce introduction invest investment investor involve
involved involves involving iron issue issues it item items itself
january jerk jet job jobs join joined joining joint journey joy judge
juice july jump june just justice keep keeping keeps kept key kid kids
kill killed killing kind king kitchen knee knew know knowing knowledge
known knows lab labor lack ladies lady lake land landing language large
largely larger largest last late later latest laugh laughing laughter
launch law laws lawyer lay lead leader leaders leading leads league lean
learn learned learning least leave leaves leaving led left leg legacy
legal length less lesson let lets letting level library license lie life
lifestyle lift light like liked likely limit limited line lines link
liquid list listen listed lists literally little live lived lives living
load loan local located location lock long longer look looked looking
looks loose loot lose losing loss lost lot lots loud love loved lovely
low lower luck lucky lunch machine machines made magazine mail main
mainly maintain maintenance major majority make maker makes making male
mall man manage management manager many map march margin mark market
marked market marriage married marry mass master match matter matters
may maybe me meal mean meaning means meant measure meat mechanism media
medical medicine meet meeting member members memory men mention mentioned
message met method middle might mile miles military milk million mind
mine minor minute minutes mirror miss missing mission mistake mixed
mixture model modern moment moments money monitor month monthly months
mood moon moral more morning most mostly mother mothers motion motor
mouth move moved movement moves movie movies moving much multiple murder
music must my myself name named names narrow nation national natural
nature near nearly necessary neck need needed needs negative neighborhood
neither network never nevertheless new newer news newspaper next nice
night nights nine no nobody noise none nonetheless normal north nose
not note noted notes nothing notice noticed novel now nowhere nuclear
number numbers nurse object objectives obligation observation observe
obtain obvious obviously occasion occur occurred ocean of off offer
offered office officer official offset often oh oil ok okay old older
oldest on once one ones online only onto open opened opening opens
operate operation operations opinion opportunity opposite option options
or orange order ordered ordinary organic organization organize other
others our ours ourselves out outcome outdoor outer outside over overall
overcome own owned owner owning owns page pain paint pair pale pan panel
paper papers parent parents park part particular particularly parties
partner parts party pass passed passenger past path patience patient
patrol pattern pause pay payment peace peak peer pen penalty people
per percent perfect perform performance perhaps period permit person
personal personally personnel persons perspective pet petition phase
phone photo phrase physical pick picked picture piece pieces pill pillar
place placed places placing plain plan plane planet plant plants plastic
plate platform play played player players playing plenty plot plus point
pointed points police policy political politics poor pop popular population
portion position positive possess possibility possible possibly post
postal potential potentially pound pour power powerful practical practice
prayer preach precaution precise predict prefer prepare prepared presence
present presented president press pressure pretty prevent previous
previously price prices primary prime principal principle print prior
priority prison private prize probably problem problems process procedure
produce produced product production professional professor profile
profit program programs progress project projects promise proof proper
property proposal propose proposed protect protection protein protest
proud prove provide provided providing province psychology public publish
pull pulled pulling purchase pure purple purpose pursue push pushed put
putting quality quantity quarter question questions quickly quiet quietly
quit quite quote race radio rain raise raised raising ran range rank
rare rarely rate rated rates rather ratio raw reach reached read reader
reading ready real reality realize really reason reasonable reasons
receive received recent recently recognize recognized recognition
recommend record records recover red reduce reduced reference reflect
reform refuse regard regarding regardless region regional register
regular regularly regulate reject relate related relation relations
relationship relationships relative release released releasing rely
remain remained remaining remains remark remember remind remote remove
removed remove render rent repeat replace replaced replacement reply
report reports represent representation representative republican
require required requires research reserve resident residents resource
resources respect respond response responsible rest restaurant result
resulted results resume retain retire retired return returned returns
reveal review revealed revenue reverse review revolution rich rid ride
right rightly rights rise risk river road rock role roll room root rose
round route routine row royal rub rule ruled rules ruling run running
runs rush safe safely safety said sail sale sales same sand save saved
saw say saying says scale scan scene schedule school schools science
scientific scientist scope score scored screen screening screw sea
search searched season seat second seconds secret secretary section
sector secure security see seeing seek seem seemed seeming seems seen
sees select selected selection self sell sending sends senior sense
sensitive sent sentence separate separately serve served serves service
services serving session sessions set setting settings settle settled
seven several severe shake shape share shared sharing she sheet shelf
shift ship shipping shirt shock shoe shoes shoot shooting shop shopping
short shorter shot should shoulder show showed showing shown shows shut
sick side sides sight sign signal signed significant significantly signs
silent silver similar similarly simple simply since single sir sister
sit site sits sitting situation six size ski skill skills skin skip
sleep slight slightly slip slow slowly small smaller smart smell smile
smiled smoke smooth snap sneeze snow so social society soft software
sold soldier solid solution solve some somebody somehow someone something
sometimes somewhat somewhere son song soon sorry sort sought soul sound
sounded sounds source sources south southern space speak speaker speaking
speaks special specialty specific specifically speech speed spend spending
spent spirit spiritual split spoke spoken sports spot spread spring
square staff stage stages stand standard standing stands star start
started starting starts state stated statement states station statistic
status stay staying stayed steel step steps stick still stock stomach
stone stood stop stopped stopping stops store stores story straight
strange stranger strategy street stretch strike string strong stronger
strongly structure struggle student students studied studies study
stuff stupid style subject success successful successfully such suddenly
suffer suffered suggest suggested suit summer sun supply support supported
sure surely surface surprise surprised survey survive survived survivor
suspect swim switch symbol system table tables take taken takes taking
talk talked talking talks tall tank tap tape target task taste tax
teach teacher teachers team teams technical technology telephone tell
telling tells temperature ten tend tenderness tension term terms terrible
test tested testing tests text than thank thanks that the their theirs
them themselves then theory there therefore these they thick thin thing
things think thinking third this those though thought thousand thread
threat three throat through throughout throw thrown thus ticket tide
tie tight time times tiny tip tired title today together told tomorrow
tonight too took tool tools top topic total totally touch tough tour
toward towards town track trade tradition traditional traffic tragedy
trail train training transfer transfer transition transportation travel
treat treated treatment tree trial tried tries trip trouble truck true
truly trust truth try trying tube turn turned turning turns tv twelve
twenty twice two type types typical typically ugly under understand
understanding understood undertake unfortunately union unit united
university unless until up upon upper upset urge us use used useful
uses using usual usually value values variable various vary vast very
via victim victory video view viewing virginia visible vision visit
visitor voice volume vote voted voters wait waited waiting wake wakes
walk walked walking wall walls want wanted wants war warm warning was
wash waste watch watched watching water wave way ways we weak weakness
weapon wear weather web website wedding week weekend weekly weeks weigh
weight welcome well went were west western wet what whatever wheel when
whenever where wherever whether which while white who whole whom whose
why wide widely wife wild will willing win wind window wine winner winter
wire wise wish with within without witness woman women won wonder wonderful
wood word words wore work worked worker workers working works world
worn worried worry worse worst worth would wound wow write writer writing
written wrong wrote yard yeah year years yellow yes yesterday yet you
young younger youngest your yours yourself youth zone precaution
precautions coring core cored cozy relax relaxed asleep awake barely
grip gripped grabbed picked handed passed noted stated jotted flagged
noticed observed reported recorded documented listed named recited
sample samples specimen specimens tissue swab swabs pending routine
morning nightly afternoon overnight midnight noon sunrise sunset dusk
dawn breakfast lunch dinner snack meals fasting fasted rested resting
active inactive alert oriented conscious unconscious drowsy sleepy
warm cool cold hot dry moist tender bruised swollen normal abnormal
mild moderate severe intact stable improving worsening unchanged same
similar clear cloudy sharp dull steady constant intermittent recurring
frequent occasional rare persistent transient acute chronic recent old
new younger older elderly infant child adolescent teenager senior
`;

export const COMMON_WORDS: Set<string> = new Set(
  WORDS.split(/\s+/)
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length > 0),
);
