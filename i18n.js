/* PEMESA language switcher: French, English and Arabic (RTL). */
(function(){
  'use strict';
  const entries={
  "Accueil": {
    "en": "Home",
    "ar": "الرئيسية"
  },
  "Fonctionnalités": {
    "en": "Features",
    "ar": "المميزات"
  },
  "Comment ça marche": {
    "en": "How it works",
    "ar": "كيف يعمل"
  },
  "Confidentialité": {
    "en": "Privacy",
    "ar": "الخصوصية"
  },
  "Connexion": {
    "en": "Sign in",
    "ar": "تسجيل الدخول"
  },
  "Créer un compte": {
    "en": "Create an account",
    "ar": "إنشاء حساب"
  },
  "PROJET DE RECHERCHE · SANTÉ & PÉNIBILITÉ AU TRAVAIL": {
    "en": "RESEARCH PROJECT · HEALTH & WORKPLACE STRAIN",
    "ar": "مشروع بحثي · الصحة ومشقة العمل"
  },
  "Comprendre la pénibilité au travail.": {
    "en": "Understand workplace strain.",
    "ar": "فهم مشقة العمل."
  },
  "Éclairer les conditions de travail.": {
    "en": "Make working conditions clearer.",
    "ar": "توضيح ظروف العمل."
  },
  "PEMESA explore les liens entre environnement de travail, activités professionnelles et ressenti des soignants. Découvrez un premier prototype de suivi et de visualisation des données.": {
    "en": "PEMESA explores connections between the working environment, professional activities, and healthcare workers' experiences. Discover an early prototype for tracking and visualizing observations.",
    "ar": "يستكشف بيميسا العلاقة بين بيئة العمل والأنشطة المهنية وتجارب العاملين في الرعاية الصحية. اكتشف نموذجًا أوليًا لتسجيل الملاحظات وعرض البيانات."
  },
  "Créer mon espace": {
    "en": "Create my account",
    "ar": "إنشاء حسابي"
  },
  "Explorer la démo": {
    "en": "Explore the demo",
    "ar": "استكشاف النسخة التجريبية"
  },
  "Prototype de démonstration · Saisie manuelle · Aucun capteur connecté": {
    "en": "Demonstration prototype · Manual entry · No connected sensors",
    "ar": "نموذج تجريبي · إدخال يدوي · دون مستشعرات متصلة"
  },
  "Aperçu illustratif du tableau de bord PEMESA": {
    "en": "Illustrative preview of the PEMESA dashboard",
    "ar": "معاينة توضيحية للوحة تحكم بيميسا"
  },
  "PROTOTYPE DE SUIVI": {
    "en": "TRACKING PROTOTYPE",
    "ar": "نموذج أولي للمتابعة"
  },
  "ESPACE DE DÉMONSTRATION": {
    "en": "DEMO WORKSPACE",
    "ar": "مساحة تجريبية"
  },
  "Vue d’ensemble": {
    "en": "Overview",
    "ar": "نظرة عامة"
  },
  "Vue d'ensemble": {
    "en": "Overview",
    "ar": "نظرة عامة"
  },
  "Planning des postes": {
    "en": "Shift schedule",
    "ar": "جدول المناوبات"
  },
  "Saisie des mesures": {
    "en": "Enter observations",
    "ar": "إدخال القياسات"
  },
  "Analyses": {
    "en": "Analysis",
    "ar": "التحليلات"
  },
  "Mon espace": {
    "en": "My space",
    "ar": "مساحتي"
  },
  "VUE D'ENSEMBLE": {
    "en": "OVERVIEW",
    "ar": "نظرة عامة"
  },
  "Tableau de bord PEMESA": {
    "en": "PEMESA dashboard",
    "ar": "لوحة تحكم بيميسا"
  },
  "Une lecture multidimensionnelle de la pénibilité au travail.": {
    "en": "A multidimensional view of workplace strain.",
    "ar": "نظرة متعددة الأبعاد على مشقة العمل."
  },
  "Cette semaine": {
    "en": "This week",
    "ar": "هذا الأسبوع"
  },
  "Niveau sonore ambiant (dB)": {
    "en": "Ambient noise level (dB)",
    "ar": "مستوى الضوضاء المحيطة (ديسيبل)"
  },
  "Niveau sonore": {
    "en": "Noise level",
    "ar": "مستوى الضوضاء"
  },
  "Pénibilité perçue (0 à 10)": {
    "en": "Perceived strain (0 to 10)",
    "ar": "المشقة المُدركة (من 0 إلى 10)"
  },
  "Pénibilité perçue": {
    "en": "Perceived strain",
    "ar": "المشقة المُدركة"
  },
  "Fréquence cardiaque au repos (bpm)": {
    "en": "Resting heart rate (bpm)",
    "ar": "معدل ضربات القلب أثناء الراحة (نبضة/دقيقة)"
  },
  "Fréquence cardiaque": {
    "en": "Heart rate",
    "ar": "معدل ضربات القلب"
  },
  "Exemple illustratif": {
    "en": "Illustrative example",
    "ar": "مثال توضيحي"
  },
  "Questionnaire (exemple)": {
    "en": "Sample questionnaire",
    "ar": "مثال على استبيان"
  },
  "Mesure fictive": {
    "en": "Sample measurement",
    "ar": "قياس افتراضي"
  },
  "Conditions de travail": {
    "en": "Working conditions",
    "ar": "ظروف العمل"
  },
  "Évolution illustrative sur 7 jours": {
    "en": "Illustrative 7-day trend",
    "ar": "تطور توضيحي خلال 7 أيام"
  },
  "Bruit": {
    "en": "Noise",
    "ar": "الضوضاء"
  },
  "Courbe illustrative de niveau sonore sur une semaine": {
    "en": "Illustrative weekly noise-level chart",
    "ar": "رسم توضيحي لمستوى الضوضاء خلال أسبوع"
  },
  "Lun": {
    "en": "Mon",
    "ar": "الاثنين"
  },
  "Mar": {
    "en": "Tue",
    "ar": "الثلاثاء"
  },
  "Mer": {
    "en": "Wed",
    "ar": "الأربعاء"
  },
  "Jeu": {
    "en": "Thu",
    "ar": "الخميس"
  },
  "Ven": {
    "en": "Fri",
    "ar": "الجمعة"
  },
  "Sam": {
    "en": "Sat",
    "ar": "السبت"
  },
  "Dim": {
    "en": "Sun",
    "ar": "الأحد"
  },
  "LUN": {
    "en": "MON",
    "ar": "الاثنين"
  },
  "MAR": {
    "en": "TUE",
    "ar": "الثلاثاء"
  },
  "MER": {
    "en": "WED",
    "ar": "الأربعاء"
  },
  "JEU": {
    "en": "THU",
    "ar": "الخميس"
  },
  "Nuit": {
    "en": "Night",
    "ar": "ليلية"
  },
  "Repos": {
    "en": "Rest",
    "ar": "راحة"
  },
  "Jour": {
    "en": "Day",
    "ar": "نهارية"
  },
  "Contextes de travail": {
    "en": "Work contexts",
    "ar": "سياقات العمل"
  },
  "Exemple de suivi des postes": {
    "en": "Example of shift tracking",
    "ar": "مثال لتتبع المناوبات"
  },
  "Aperçu illustratif • Valeurs fictives • Aucune donnée IoT en temps réel": {
    "en": "Illustrative preview • Sample values • No live IoT data",
    "ar": "عرض توضيحي • قيم افتراضية • لا توجد بيانات إنترنت أشياء آنية"
  },
  "TROIS DIMENSIONS COMPLÉMENTAIRES": {
    "en": "THREE COMPLEMENTARY DIMENSIONS",
    "ar": "ثلاثة أبعاد متكاملة"
  },
  "Comprendre la pénibilité sous plusieurs angles": {
    "en": "Understand workplace strain from different angles",
    "ar": "فهم مشقة العمل من زوايا متعددة"
  },
  "La démarche PEMESA s’appuie sur les données de l’environnement, de l’activité et du ressenti des professionnels de santé.": {
    "en": "PEMESA brings together environmental, activity, and healthcare workers’ experience data.",
    "ar": "يجمع بيميسا بيانات البيئة والنشاط والتجارب الذاتية للعاملين في الرعاية الصحية."
  },
  "Pénibilité ambiante": {
    "en": "Environmental strain",
    "ar": "المشقة البيئية"
  },
  "Température, humidité, bruit, qualité de l’air : des facteurs à observer dans les situations de travail.": {
    "en": "Temperature, humidity, noise and air quality: factors to observe in workplace settings.",
    "ar": "الحرارة والرطوبة والضوضاء وجودة الهواء: عوامل يجب رصدها في بيئات العمل."
  },
  "Capteurs IoT · axe de recherche": {
    "en": "IoT sensors · research area",
    "ar": "مستشعرات إنترنت الأشياء · محور بحثي"
  },
  "Pénibilité de la tâche": {
    "en": "Task-related strain",
    "ar": "مشقة المهام"
  },
  "Activité physique, fréquence cardiaque, posture et mouvements répétitifs : croiser les indicateurs pour mieux comprendre les tâches.": {
    "en": "Physical activity, heart rate, posture and repetitive movements: combine indicators to better understand tasks.",
    "ar": "النشاط البدني ومعدل ضربات القلب ووضعيات الجسم والحركات المتكررة: مؤشرات مترابطة لفهم المهام بصورة أفضل."
  },
  "Dispositifs connectés · axe de recherche": {
    "en": "Connected devices · research area",
    "ar": "أجهزة متصلة · محور بحثي"
  },
  "Pénibilité subjective": {
    "en": "Subjective strain",
    "ar": "المشقة الذاتية"
  },
  "La perception des personnes concernées complète les mesures. Le prototype permet déjà une saisie manuelle du ressenti.": {
    "en": "Self-reported experiences complement measurements. The prototype already supports manual entry of perceived strain.",
    "ar": "تكمل تجارب المشاركين الذاتية القياسات. يتيح النموذج الأولي إدخال المشقة المُدركة يدويًا."
  },
  "Questionnaires · axe de recherche": {
    "en": "Questionnaires · research area",
    "ar": "استبيانات · محور بحثي"
  },
  "LE PROTOTYPE PEMESA": {
    "en": "THE PEMESA PROTOTYPE",
    "ar": "النموذج الأولي لبيميسا"
  },
  "Observer. Renseigner.": {
    "en": "Observe. Record.",
    "ar": "راقب. سجّل."
  },
  "Explorer les tendances.": {
    "en": "Explore trends.",
    "ar": "استكشف الاتجاهات."
  },
  "Cette première version permet de décrire les postes et de saisir des mesures manuellement. Les connexions aux capteurs IoT, la reconnaissance automatique des gestes et les modèles d’IA font partie des objectifs de recherche, pas des fonctionnalités déjà opérationnelles.": {
    "en": "This first version lets you describe shifts and manually enter measurements. IoT sensor connections, automatic gesture recognition and AI models are research goals, not operational features yet.",
    "ar": "تتيح النسخة الأولى وصف المناوبات وإدخال القياسات يدويًا. أما ربط مستشعرات إنترنت الأشياء والتعرف الآلي على الحركات ونماذج الذكاء الاصطناعي فهي أهداف بحثية وليست ميزات متاحة حاليًا."
  },
  "Ouvrir la démonstration": {
    "en": "Open the demo",
    "ar": "فتح النسخة التجريبية"
  },
  "Décrire les postes": {
    "en": "Describe shifts",
    "ar": "وصف المناوبات"
  },
  "Repérez les journées, nuits et repos pour contextualiser les mesures.": {
    "en": "Record day shifts, night shifts and rest days to put measurements in context.",
    "ar": "حدد المناوبات النهارية والليلية وأيام الراحة لفهم سياق القياسات."
  },
  "Saisir les observations": {
    "en": "Enter observations",
    "ar": "إدخال الملاحظات"
  },
  "Renseignez manuellement les données d’activité, d’ambiance et de ressenti disponibles.": {
    "en": "Manually enter available activity, environmental and self-reported data.",
    "ar": "أدخل يدويًا بيانات النشاط والبيئة والتجارب الذاتية المتاحة."
  },
  "Comparer les résultats": {
    "en": "Compare results",
    "ar": "مقارنة النتائج"
  },
  "Consultez les moyennes par type de poste et les évolutions renseignées.": {
    "en": "Review averages by shift type and recorded trends.",
    "ar": "اطلع على المتوسطات حسب نوع المناوبة والاتجاهات المسجلة."
  },
  "CONFIDENTIALITÉ & RECHERCHE": {
    "en": "PRIVACY & RESEARCH",
    "ar": "الخصوصية والبحث"
  },
  "Protéger les données des personnes concernées.": {
    "en": "Protect participants' data.",
    "ar": "حماية بيانات المشاركين."
  },
  "Cette démonstration n’est ni un dispositif médical ni un service de diagnostic. Sans compte configuré, vos saisies restent dans le navigateur : n’y entrez pas de données sensibles ou identifiantes. Une collecte réelle de données de santé requiert des mesures de sécurité et de conformité adaptées.": {
    "en": "This demo is neither a medical device nor a diagnostic service. Without an account, entries stay in your browser: do not enter sensitive or identifying data. Collecting real health data requires appropriate security and compliance measures.",
    "ar": "هذه النسخة التجريبية ليست جهازًا طبيًا ولا خدمة تشخيص. دون حساب، تبقى المدخلات في المتصفح؛ فلا تُدخل بيانات حساسة أو معلومات تعريفية. يتطلب جمع بيانات صحية حقيقية إجراءات مناسبة للأمن والامتثال."
  },
  "Tester sans compte": {
    "en": "Try without an account",
    "ar": "التجربة دون حساب"
  },
  "Développement de l’interface :": {
    "en": "Interface development:",
    "ar": "تطوير الواجهة:"
  },
  "PEMESA, accueil": {
    "en": "PEMESA, home",
    "ar": "بيميسا، الرئيسية"
  },
  "PEMESA, retourner à la page d’accueil": {
    "en": "PEMESA, back to home",
    "ar": "بيميسا، العودة إلى الرئيسية"
  },
  "Logo officiel PEMESA": {
    "en": "PEMESA official logo",
    "ar": "الشعار الرسمي لبيميسا"
  },
  "Logo PEMESA": {
    "en": "PEMESA logo",
    "ar": "شعار بيميسا"
  },
  "Navigation principale": {
    "en": "Main navigation",
    "ar": "التنقل الرئيسي"
  },
  "Navigation de mon espace": {
    "en": "Workspace navigation",
    "ar": "التنقل في مساحتي"
  },
  "Langue": {
    "en": "Language",
    "ar": "اللغة"
  },
  "Fermer": {
    "en": "Close",
    "ar": "إغلاق"
  },
  "Mode démo": {
    "en": "Demo mode",
    "ar": "الوضع التجريبي"
  },
  "Données de démonstration": {
    "en": "Demo data",
    "ar": "بيانات تجريبية"
  },
  "Stockage sur cet appareil": {
    "en": "Stored on this device",
    "ar": "مخزّنة على هذا الجهاز"
  },
  "Compte personnel": {
    "en": "Personal account",
    "ar": "حساب شخصي"
  },
  "Compte connecté": {
    "en": "Signed-in account",
    "ar": "حساب متصل"
  },
  "Les données renseignées sont enregistrées dans votre espace personnel configuré sur Supabase.": {
    "en": "Your entries are saved to your personal space configured with Supabase.",
    "ar": "تُحفظ مدخلاتك في مساحتك الشخصية المتصلة بسوبابيس."
  },
  "Mode démo : les saisies restent sur cet appareil. N’y enregistrez pas de données personnelles sensibles.": {
    "en": "Demo mode: entries stay on this device. Do not enter sensitive personal data.",
    "ar": "الوضع التجريبي: تبقى المدخلات على هذا الجهاز. لا تُدخل بيانات شخصية حساسة."
  },
  "Quitter la démo": {
    "en": "Exit demo",
    "ar": "الخروج من التجربة"
  },
  "Se déconnecter": {
    "en": "Sign out",
    "ar": "تسجيل الخروج"
  },
  "Heureux de vous revoir": {
    "en": "Welcome back",
    "ar": "مرحبًا بعودتك"
  },
  "Créez votre espace personnel": {
    "en": "Create your personal space",
    "ar": "أنشئ مساحتك الشخصية"
  },
  "Réinitialiser le mot de passe": {
    "en": "Reset your password",
    "ar": "إعادة تعيين كلمة المرور"
  },
  "Connectez-vous pour retrouver votre espace personnel.": {
    "en": "Sign in to access your personal space.",
    "ar": "سجّل الدخول للوصول إلى مساحتك الشخصية."
  },
  "Connectez-vous pour retrouver vos données.": {
    "en": "Sign in to access your data.",
    "ar": "سجّل الدخول للوصول إلى بياناتك."
  },
  "Commencez à suivre votre rythme à votre façon.": {
    "en": "Start tracking your routine your way.",
    "ar": "ابدأ بتتبع نمط حياتك بطريقتك."
  },
  "Recevez un lien pour choisir un nouveau mot de passe.": {
    "en": "Get a link to set a new password.",
    "ar": "احصل على رابط لتعيين كلمة مرور جديدة."
  },
  "BIENVENUE SUR PEMESA": {
    "en": "WELCOME TO PEMESA",
    "ar": "مرحبًا بك في بيميسا"
  },
  "Votre nom": {
    "en": "Your name",
    "ar": "اسمك"
  },
  "Adresse e-mail": {
    "en": "Email address",
    "ar": "البريد الإلكتروني"
  },
  "Mot de passe": {
    "en": "Password",
    "ar": "كلمة المرور"
  },
  "Mot de passe oublié ?": {
    "en": "Forgot password?",
    "ar": "هل نسيت كلمة المرور؟"
  },
  "8 caractères minimum": {
    "en": "At least 8 characters",
    "ar": "٨ أحرف على الأقل"
  },
  "vous@exemple.fr": {
    "en": "you@example.com",
    "ar": "you@example.com"
  },
  "Se connecter": {
    "en": "Sign in",
    "ar": "تسجيل الدخول"
  },
  "Créer mon compte": {
    "en": "Create my account",
    "ar": "إنشاء حسابي"
  },
  "Envoyer le lien": {
    "en": "Send reset link",
    "ar": "إرسال رابط الاستعادة"
  },
  "Explorer sans compte (démo)": {
    "en": "Explore without an account (demo)",
    "ar": "استكشف دون حساب (تجريبي)"
  },
  "Pour activer les comptes, connectez un projet Supabase (voir README).": {
    "en": "To enable accounts, connect a Supabase project (see README).",
    "ar": "لتفعيل الحسابات، اربط مشروع سوبابيس (راجع README)."
  },
  "Vos identifiants sont gérés par Supabase Auth.": {
    "en": "Your sign-in credentials are managed by Supabase Auth.",
    "ar": "تتم إدارة بيانات الدخول بواسطة مصادقة سوبابيس."
  },
  "Les comptes ne sont pas encore activés. Vous pouvez tester le mode démo.": {
    "en": "Accounts are not enabled yet. You can try the demo.",
    "ar": "الحسابات غير مفعّلة بعد. يمكنك تجربة النسخة التجريبية."
  },
  "ou": {
    "en": "or",
    "ar": "أو"
  },
  "Aperçu des données que vous avez renseignées manuellement.": {
    "en": "Overview of data you entered manually.",
    "ar": "نظرة عامة على البيانات التي أدخلتها يدويًا."
  },
  "Contextualisez vos observations par type de poste.": {
    "en": "Put observations in context by shift type.",
    "ar": "ضع ملاحظاتك في سياق نوع المناوبة."
  },
  "Renseignez vos observations d’ambiance, d’activité et votre ressenti.": {
    "en": "Record environmental, activity and self-reported observations.",
    "ar": "سجّل ملاحظات البيئة والنشاط والتجارب الذاتية."
  },
  "Comparez vos mesures renseignées selon le type de poste.": {
    "en": "Compare recorded measurements by shift type.",
    "ar": "قارن القياسات المسجلة حسب نوع المناوبة."
  },
  "Sommeil principal (h)": {
    "en": "Main sleep (hours)",
    "ar": "النوم الأساسي (ساعات)"
  },
  "Sieste (min)": {
    "en": "Nap (min)",
    "ar": "قيلولة (دقيقة)"
  },
  "Fatigue au réveil (0 à 10)": {
    "en": "Fatigue on waking (0 to 10)",
    "ar": "التعب عند الاستيقاظ (من 0 إلى 10)"
  },
  "Nombre de pas": {
    "en": "Step count",
    "ar": "عدد الخطوات"
  },
  "Activité (min)": {
    "en": "Activity (min)",
    "ar": "النشاط (دقيقة)"
  },
  "Température ambiante (°C)": {
    "en": "Ambient temperature (°C)",
    "ar": "درجة الحرارة المحيطة (°م)"
  },
  "Humidité relative (%)": {
    "en": "Relative humidity (%)",
    "ar": "الرطوبة النسبية (%)"
  },
  "Les 30 derniers jours": {
    "en": "Last 30 days",
    "ar": "آخر 30 يومًا"
  },
  "Moyennes par poste. Nombre de journées mesurées entre parenthèses.": {
    "en": "Averages by shift type. Number of measured days in parentheses.",
    "ar": "المتوسطات حسب المناوبة. عدد الأيام المقاسة بين قوسين."
  },
  "Mesure": {
    "en": "Measurement",
    "ar": "القياس"
  },
  "Votre bilan commence avec une journée.": {
    "en": "Your summary starts with one day.",
    "ar": "يبدأ ملخصك بيوم واحد."
  },
  "Choisissez votre type de poste et ajoutez une première mesure dans votre journal.": {
    "en": "Choose a shift type and add your first measurement to your journal.",
    "ar": "اختر نوع المناوبة وأضف أول قياس في سجلك."
  },
  "Renseigner ma journée": {
    "en": "Enter my day",
    "ar": "تسجيل يومي"
  },
  "Moyenne des mesures renseignées (30 jours)": {
    "en": "Average of recorded measurements (30 days)",
    "ar": "متوسط القياسات المسجلة (30 يومًا)"
  },
  "Observations manuelles (30 jours)": {
    "en": "Manual observations (30 days)",
    "ar": "ملاحظات يدوية (30 يومًا)"
  },
  "Observations renseignées (30 jours)": {
    "en": "Recorded observations (30 days)",
    "ar": "الملاحظات المسجلة (30 يومًا)"
  },
  "Vos 7 derniers jours": {
    "en": "Your last 7 days",
    "ar": "آخر 7 أيام"
  },
  "Voir le bilan": {
    "en": "View summary",
    "ar": "عرض الملخص"
  },
  "Évolution de la pénibilité perçue (7 derniers jours)": {
    "en": "Perceived strain trend (last 7 days)",
    "ar": "تطور المشقة المُدركة (آخر 7 أيام)"
  },
  "Ajoutez vos observations de pénibilité": {
    "en": "Add your strain observations",
    "ar": "أضف ملاحظات المشقة"
  },
  "Vos derniers postes": {
    "en": "Your recent shifts",
    "ar": "مناوباتك الأخيرة"
  },
  "Un aperçu de vos journées enregistrées": {
    "en": "A look at your recorded days",
    "ar": "لمحة عن الأيام المسجلة"
  },
  "Planning": {
    "en": "Schedule",
    "ar": "الجدول"
  },
  "Non défini": {
    "en": "Not defined",
    "ar": "غير محدد"
  },
  "Aucun poste renseigné pour le moment. Commencez par créer votre planning.": {
    "en": "No shifts recorded yet. Start by creating your schedule.",
    "ar": "لم تُسجّل مناوبات بعد. ابدأ بإنشاء جدولك."
  },
  "Renseigner les mesures": {
    "en": "Enter measurements",
    "ar": "إدخال القياسات"
  },
  "Semaine du": {
    "en": "Week of",
    "ar": "أسبوع"
  },
  "Semaine précédente": {
    "en": "Previous week",
    "ar": "الأسبوع السابق"
  },
  "Semaine suivante": {
    "en": "Next week",
    "ar": "الأسبوع التالي"
  },
  "Aujourd’hui": {
    "en": "Today",
    "ar": "اليوم"
  },
  "Contextualiser les mesures": {
    "en": "Set measurement context",
    "ar": "تحديد سياق القياسات"
  },
  "Journée du poste": {
    "en": "Shift date",
    "ar": "تاريخ المناوبة"
  },
  "Type de poste": {
    "en": "Shift type",
    "ar": "نوع المناوبة"
  },
  "À définir": {
    "en": "Not set",
    "ar": "غير محدد"
  },
  "Le poste sert de contexte pour comparer vos observations.": {
    "en": "The shift provides context for comparing your observations.",
    "ar": "تساعد المناوبة في وضع الملاحظات في سياق المقارنة."
  },
  "Enregistrer le poste": {
    "en": "Save shift",
    "ar": "حفظ المناوبة"
  },
  "Pénibilité ambiante · observations manuelles": {
    "en": "Environmental strain · manual observations",
    "ar": "المشقة البيئية · ملاحظات يدوية"
  },
  "Activité & indicateurs physiologiques": {
    "en": "Activity & physiological indicators",
    "ar": "النشاط والمؤشرات الفسيولوجية"
  },
  "Saisissez uniquement des valeurs que vous avez relevées. Ces champs ne sont pas reliés à des capteurs et ne remplacent pas un avis médical. En mode démo, évitez les données sensibles.": {
    "en": "Only enter values you have measured. These fields are not connected to sensors and do not replace medical advice. Avoid sensitive data in demo mode.",
    "ar": "أدخل فقط القيم التي قستها فعليًا. هذه الحقول غير متصلة بمستشعرات ولا تغني عن الاستشارة الطبية. تجنب البيانات الحساسة في الوضع التجريبي."
  },
  "Enregistrer les observations": {
    "en": "Save observations",
    "ar": "حفظ الملاحظات"
  },
  "au": {
    "en": "to",
    "ar": "إلى"
  },
  "journée(s) avec un poste et une mesure.": {
    "en": "day(s) with a shift and measurement.",
    "ar": "يومًا بمناوبة وقياس."
  },
  "journée(s) avec un poste sur 30 jours.": {
    "en": "day(s) with a shift over 30 days.",
    "ar": "يومًا بمناوبة خلال 30 يومًا."
  },
  "Journée enregistrée dans ce navigateur.": {
    "en": "Day saved in this browser.",
    "ar": "تم حفظ اليوم في هذا المتصفح."
  },
  "Stockage local indisponible.": {
    "en": "Local storage unavailable.",
    "ar": "التخزين المحلي غير متاح."
  },
  "Veuillez vous reconnecter.": {
    "en": "Please sign in again.",
    "ar": "يرجى تسجيل الدخول مجددًا."
  },
  "Enregistrement impossible :": {
    "en": "Unable to save:",
    "ar": "تعذر الحفظ:"
  },
  "Journée enregistrée.": {
    "en": "Day saved.",
    "ar": "تم حفظ اليوم."
  },
  "Lecture de vos données impossible :": {
    "en": "Unable to load your data:",
    "ar": "تعذر تحميل بياناتك:"
  },
  "La connexion n’est pas encore configurée. Essayez le mode démo.": {
    "en": "Sign-in is not configured yet. Try demo mode.",
    "ar": "تسجيل الدخول غير مُهيأ بعد. جرّب الوضع التجريبي."
  },
  "Si un compte correspond à cette adresse, vous recevrez un e-mail.": {
    "en": "If an account exists for this email, you'll receive a message.",
    "ar": "إذا كان هناك حساب بهذا البريد فستصلك رسالة."
  },
  "Compte créé. Vérifiez votre e-mail pour confirmer votre inscription.": {
    "en": "Account created. Check your inbox to confirm your email.",
    "ar": "تم إنشاء الحساب. تحقق من بريدك لتأكيد التسجيل."
  },
  "Session indisponible.": {
    "en": "Session unavailable.",
    "ar": "الجلسة غير متاحة."
  },
  "Connexion impossible.": {
    "en": "Unable to sign in.",
    "ar": "تعذر تسجيل الدخول."
  },
  "Invalid login credentials": {
    "en": "Invalid email or password.",
    "ar": "البريد الإلكتروني أو كلمة المرور غير صحيحة."
  },
  "Error sending confirmation email": {
    "en": "Unable to send the confirmation email. Check SMTP settings.",
    "ar": "تعذر إرسال رسالة التأكيد. تحقق من إعدادات SMTP."
  },
  "Email rate limit exceeded": {
    "en": "Too many emails. Please try later.",
    "ar": "تم تجاوز حد رسائل البريد. حاول لاحقًا."
  },
  "User already registered": {
    "en": "This email is already registered.",
    "ar": "هذا البريد الإلكتروني مسجّل مسبقًا."
  },
  "DÉVELOPPEMENT DU PROTOTYPE WEB PEMESA": {
    "en": "PEMESA WEB PROTOTYPE DEVELOPMENT",
    "ar": "تطوير النموذج الأولي لموقع بيميسا"
  },
  "Accueil PEMESA": {
    "en": "PEMESA home",
    "ar": "الرئيسية - بيميسا"
  },
  "Code GitHub": {
    "en": "GitHub source code",
    "ar": "شيفرة GitHub"
  },
  "Présentation de mon travail sur le site web": {
    "en": "A look at my work on",
    "ar": "لمحة عن عملي على"
  },
  "un prototype de suivi et d'exploration de la pénibilité au travail dans les métiers de la santé.": {
    "en": "a prototype for tracking and exploring workplace strain in healthcare occupations.",
    "ar": "نموذج أولي لتتبع واستكشاف مشقة العمل في مهن الرعاية الصحية."
  },
  "Découvrir PEMESA": {
    "en": "Discover PEMESA",
    "ar": "اكتشف بيميسا"
  },
  "Mon profil GitHub": {
    "en": "My GitHub profile",
    "ar": "ملفي على GitHub"
  },
  "MON TRAVAIL SUR LE SITE": {
    "en": "MY WORK ON THE WEBSITE",
    "ar": "عملي على الموقع"
  },
  "Une interface pour explorer les observations": {
    "en": "An interface for exploring observations",
    "ar": "واجهة لاستكشاف الملاحظات"
  },
  "Interface web": {
    "en": "Web interface",
    "ar": "واجهة الويب"
  },
  "Conception d'une page de présentation, d'une navigation claire et d'un espace de démonstration responsive.": {
    "en": "Design of a landing page, clear navigation and responsive demo workspace.",
    "ar": "تصميم صفحة تعريفية وتنقل واضح ومساحة تجريبية متجاوبة."
  },
  "Tableau de bord": {
    "en": "Dashboard",
    "ar": "لوحة التحكم"
  },
  "Présentation de mesures renseignées manuellement et d'indicateurs pour mieux lire les observations.": {
    "en": "Display of manually entered measurements and indicators to understand observations.",
    "ar": "عرض القياسات المدخلة يدويًا والمؤشرات لتسهيل قراءة الملاحظات."
  },
  "Planning et analyses": {
    "en": "Schedule and analysis",
    "ar": "الجدول والتحليلات"
  },
  "Saisie de journées et comparaison de données selon les types de postes, dans le cadre du prototype.": {
    "en": "Recording days and comparing data by shift type within the prototype.",
    "ar": "تسجيل الأيام ومقارنة البيانات حسب نوع المناوبة في النموذج الأولي."
  },
  "Cette page présente la contribution au développement web. Elle ne revendique ni la direction scientifique du projet ni des résultats de recherche validés. Les connexions aux capteurs et l'analyse par IA ne sont pas opérationnelles dans cette démonstration.": {
    "en": "This page describes the web development contribution. It does not claim scientific leadership or validated research findings. Sensor connections and AI analysis are not operational in this demo.",
    "ar": "تعرض هذه الصفحة مساهمتي في تطوير الويب، ولا تدعي قيادة علمية للمشروع أو نتائج بحثية مثبتة. اتصال المستشعرات وتحليل الذكاء الاصطناعي غير متاحين في هذه النسخة."
  },
  "Développement du prototype web :": {
    "en": "Web prototype development:",
    "ar": "تطوير نموذج الويب الأولي:"
  }
};
  Object.assign(entries, {
  "Paramètres du compte": { "en": "Account settings", "ar": "إعدادات الحساب" },
  "MON ESPACE": { "en": "MY ACCOUNT", "ar": "حسابي" },
  "Personnalisez vos informations et sécurisez votre compte.": { "en": "Personalize your information and secure your account.", "ar": "خصّص معلوماتك وأمّن حسابك." },
  "Photo de profil": { "en": "Profile picture", "ar": "الصورة الشخصية" },
  "JPG, PNG ou WebP — 2 Mo maximum.": { "en": "JPG, PNG or WebP — maximum 2 MB.", "ar": "JPG أو PNG أو WebP — بحد أقصى 2 ميغابايت." },
  "Voir ou changer la photo": { "en": "View or change photo", "ar": "عرض الصورة أو تغييرها" },
  "Informations personnelles": { "en": "Personal information", "ar": "المعلومات الشخصية" },
  "Nom complet": { "en": "Full name", "ar": "الاسم الكامل" },
  "Date de naissance": { "en": "Date of birth", "ar": "تاريخ الميلاد" },
  "Téléphone": { "en": "Phone number", "ar": "رقم الهاتف" },
  "Profession": { "en": "Profession", "ar": "المهنة" },
  "Enregistrer les modifications": { "en": "Save changes", "ar": "حفظ التغييرات" },
  "Nouvelle adresse e-mail": { "en": "New email address", "ar": "البريد الإلكتروني الجديد" },
  "Un e-mail de confirmation peut être nécessaire.": { "en": "Email confirmation may be required.", "ar": "قد يلزم تأكيد البريد الإلكتروني." },
  "Modifier mon e-mail": { "en": "Change my email", "ar": "تغيير بريدي الإلكتروني" },
  "Mot de passe et sécurité": { "en": "Password and security", "ar": "كلمة المرور والأمان" },
  "Mot de passe actuel": { "en": "Current password", "ar": "كلمة المرور الحالية" },
  "Nouveau mot de passe": { "en": "New password", "ar": "كلمة المرور الجديدة" },
  "Confirmer le nouveau mot de passe": { "en": "Confirm new password", "ar": "تأكيد كلمة المرور الجديدة" },
  "Changer le mot de passe": { "en": "Change password", "ar": "تغيير كلمة المرور" },
  "Ma photo de profil": { "en": "My profile picture", "ar": "صورتي الشخصية" },
  "Visualiser la photo": { "en": "View photo", "ar": "عرض الصورة" },
  "Changer la photo": { "en": "Change photo", "ar": "تغيير الصورة" },
  "Supprimer la photo": { "en": "Remove photo", "ar": "حذف الصورة" },
  "Photo de profil enregistrée.": { "en": "Profile photo saved.", "ar": "تم حفظ الصورة الشخصية." },
  "Photo de profil supprimée.": { "en": "Profile photo removed.", "ar": "تم حذف الصورة الشخصية." },
  "Informations personnelles enregistrées.": { "en": "Personal information saved.", "ar": "تم حفظ المعلومات الشخصية." },
  "Mot de passe modifié avec succès.": { "en": "Password changed successfully.", "ar": "تم تغيير كلمة المرور بنجاح." },
  });
  Object.assign(entries, {
    "Langue de l’application": { en: "Application language", ar: "لغة التطبيق" },
    "Cette langue sera enregistrée sur votre compte et appliquée à vos prochaines connexions, même sur un autre appareil.": { en: "This language will be saved to your account and used the next time you sign in, even on another device.", ar: "ستُحفظ هذه اللغة في حسابك وتُستخدم عند تسجيل الدخول لاحقًا، حتى على جهاز آخر." },
    "Choisissez une langue valide.": { en: "Choose a valid language.", ar: "اختر لغة صالحة." },
    "La langue a été modifiée sur cet appareil, mais sa sauvegarde sur le compte a échoué.": { en: "The language changed on this device, but could not be saved to your account.", ar: "تم تغيير اللغة على هذا الجهاز، لكن تعذّر حفظها في حسابك." },
  });
  Object.assign(entries, {
  "Montres connectées": {
    "en": "Connected watches",
    "ar": "الساعات المتصلة"
  },
  "Associez votre Galaxy Watch et pilotez la collecte de données.": {
    "en": "Pair your Galaxy Watch and manage data collection.",
    "ar": "اربط ساعة Galaxy Watch وتحكّم في جمع البيانات."
  },
  "Votre montre, sous votre contrôle.": {
    "en": "Your watch, under your control.",
    "ar": "ساعتك تحت سيطرتك."
  },
  "Associez une Galaxy Watch compatible Wear OS, définissez vos mesures autorisées et pilotez la collecte depuis PEMESA.": {
    "en": "Pair a compatible Wear OS Galaxy Watch, choose which measurements to allow, and control collection from PEMESA.",
    "ar": "اربط ساعة Galaxy Watch متوافقة مع Wear OS، وحدد القياسات المسموح بها وتحكّم في جمع البيانات من PEMESA."
  },
  "Accès sécurisé": {
    "en": "Secure access",
    "ar": "وصول آمن"
  },
  "État en direct": {
    "en": "Live status",
    "ar": "الحالة المباشرة"
  },
  "Consentement maîtrisé": {
    "en": "Consent control",
    "ar": "التحكم في الموافقة"
  },
  "Connectez-vous pour associer votre montre.": {
    "en": "Sign in to pair your watch.",
    "ar": "سجّل الدخول لربط ساعتك."
  },
  "Cette fonctionnalité est réservée aux comptes personnels. Le mode démo ne collecte aucune donnée de montre.": {
    "en": "This feature requires a personal account. Demo mode collects no watch data.",
    "ar": "هذه الميزة مخصصة للحسابات الشخصية. الوضع التجريبي لا يجمع أي بيانات من الساعة."
  },
  "Se connecter à PEMESA": {
    "en": "Sign in to PEMESA",
    "ar": "تسجيل الدخول إلى PEMESA"
  },
  "Montres associées": {
    "en": "Paired watches",
    "ar": "الساعات المرتبطة"
  },
  "Sur votre compte personnel": {
    "en": "On your personal account",
    "ar": "في حسابك الشخصي"
  },
  "Montres en ligne": {
    "en": "Online watches",
    "ar": "الساعات المتصلة"
  },
  "Contact il y a moins de 2 min": {
    "en": "Contact within the past 2 min",
    "ar": "آخر اتصال منذ أقل من دقيقتين"
  },
  "Collecte confirmée": {
    "en": "Confirmed collection",
    "ar": "الجمع المؤكد"
  },
  "Signal renvoyé par l'application mobile": {
    "en": "Status reported by the mobile app",
    "ar": "الحالة المرسلة من تطبيق الهاتف"
  },
  "Collecte arrêtée": {
    "en": "Collection stopped",
    "ar": "تم إيقاف الجمع"
  },
  "Collecte active": {
    "en": "Collection active",
    "ar": "الجمع نشط"
  },
  "Collecte en pause": {
    "en": "Collection paused",
    "ar": "الجمع متوقف مؤقتًا"
  },
  "Non configurée": {
    "en": "Not configured",
    "ar": "غير مهيأ"
  },
  "Inconnu": {
    "en": "Unknown",
    "ar": "غير معروف"
  },
  "Mes appareils": {
    "en": "My devices",
    "ar": "أجهزتي"
  },
  "Associez une montre à votre téléphone Android et à l'application PEMESA.": {
    "en": "Pair a watch with your Android phone and the PEMESA app.",
    "ar": "اربط الساعة بهاتف أندرويد وتطبيق PEMESA."
  },
  "Actualiser": {
    "en": "Refresh",
    "ar": "تحديث"
  },
  "En ligne": {
    "en": "Online",
    "ar": "متصل"
  },
  "Hors ligne": {
    "en": "Offline",
    "ar": "غير متصل"
  },
  "Aucune montre associée": {
    "en": "No watch paired",
    "ar": "لا توجد ساعة مرتبطة"
  },
  "Créez un code puis saisissez-le dans l'application Android PEMESA.": {
    "en": "Create a code and enter it in the PEMESA Android app.",
    "ar": "أنشئ رمزًا وأدخله في تطبيق PEMESA على أندرويد."
  },
  "Code d’association temporaire": {
    "en": "Temporary pairing code",
    "ar": "رمز الربط المؤقت"
  },
  "Valable jusqu’au": {
    "en": "Valid until",
    "ar": "صالح حتى"
  },
  "Copier": {
    "en": "Copy",
    "ar": "نسخ"
  },
  "Annuler": {
    "en": "Cancel",
    "ar": "إلغاء"
  },
  "Associer une Galaxy Watch": {
    "en": "Pair a Galaxy Watch",
    "ar": "ربط ساعة Galaxy Watch"
  },
  "L'association n'est confirmée que lorsque l'application Android PEMESA a accepté le code et déclaré la montre.": {
    "en": "Pairing is confirmed only after the PEMESA Android app accepts the code and registers the watch.",
    "ar": "لا يكتمل الربط إلا بعد قبول الرمز وتسجيل الساعة في تطبيق PEMESA على أندرويد."
  },
  "Contrôle de la collecte": {
    "en": "Collection controls",
    "ar": "التحكم في الجمع"
  },
  "commandes transmises au téléphone": {
    "en": "commands sent to the phone",
    "ar": "الأوامر المرسلة إلى الهاتف"
  },
  "Batterie": {
    "en": "Battery",
    "ar": "البطارية"
  },
  "Dernier contact": {
    "en": "Last contact",
    "ar": "آخر اتصال"
  },
  "Dernier transfert": {
    "en": "Last transfer",
    "ar": "آخر نقل"
  },
  "Mesures déclarées": {
    "en": "Reported measurements",
    "ar": "القياسات المبلّغ عنها"
  },
  "Démarrer": {
    "en": "Start",
    "ar": "بدء"
  },
  "Arrêter": {
    "en": "Stop",
    "ar": "إيقاف"
  },
  "Pause": {
    "en": "Pause",
    "ar": "إيقاف مؤقت"
  },
  "Les commandes sont des demandes. L'état change seulement lorsque la montre confirme leur exécution via l'application mobile.": {
    "en": "Commands are requests. The status changes only once the watch confirms execution through the mobile app.",
    "ar": "الأوامر طلبات فقط. تتغير الحالة بعد تأكيد التنفيذ عبر تطبيق الهاتف."
  },
  "Dernière commande": {
    "en": "Latest command",
    "ar": "آخر أمر"
  },
  "Démarrage": {
    "en": "Start",
    "ar": "بدء"
  },
  "Arrêt": {
    "en": "Stop",
    "ar": "إيقاف"
  },
  "En attente de la montre": {
    "en": "Awaiting watch",
    "ar": "في انتظار الساعة"
  },
  "Confirmée par la montre": {
    "en": "Confirmed by watch",
    "ar": "تم التأكيد من الساعة"
  },
  "Échec signalé par la montre": {
    "en": "Watch reported failure",
    "ar": "أبلغت الساعة عن فشل"
  },
  "Capteurs et autorisations": {
    "en": "Sensors and permissions",
    "ar": "المستشعرات والأذونات"
  },
  "Choisissez les données demandées à l'application. Leur disponibilité dépend du modèle et des permissions Android.": {
    "en": "Choose the data requested by the app. Availability depends on your model and Android permissions.",
    "ar": "اختر البيانات المطلوبة. يعتمد توفرها على طراز الساعة وأذونات أندرويد."
  },
  "Fréquence cardiaque": {
    "en": "Heart rate",
    "ar": "معدل ضربات القلب"
  },
  "Nombre de pas": {
    "en": "Step count",
    "ar": "عدد الخطوات"
  },
  "Activité physique": {
    "en": "Physical activity",
    "ar": "النشاط البدني"
  },
  "Sommeil": {
    "en": "Sleep",
    "ar": "النوم"
  },
  "J’autorise la collecte des catégories sélectionnées pour mon compte PEMESA. Je peux retirer cette autorisation à tout moment.": {
    "en": "I allow collection of the selected categories for my PEMESA account. I can withdraw this permission at any time.",
    "ar": "أوافق على جمع الفئات المحددة لحسابي في PEMESA. يمكنني سحب هذه الموافقة في أي وقت."
  },
  "Enregistrer les autorisations": {
    "en": "Save permissions",
    "ar": "حفظ الأذونات"
  },
  "Dissocier la montre": {
    "en": "Unpair watch",
    "ar": "إلغاء ربط الساعة"
  },
  "Ce module ne conserve pas les mesures physiologiques brutes. Toute collecte de santé destinée à la recherche nécessite un cadre de sécurité et de conformité adapté.": {
    "en": "This module does not store raw physiological measurements. Health research data requires appropriate security and compliance.",
    "ar": "لا تخزّن هذه الوحدة القياسات الفسيولوجية الخام. يتطلب جمع بيانات الصحة للبحث إطارًا مناسبًا للأمان والامتثال."
  },
  "GUIDE D’ASSOCIATION": {
    "en": "PAIRING GUIDE",
    "ar": "دليل الربط"
  },
  "Connecter votre Galaxy Watch": {
    "en": "Connect your Galaxy Watch",
    "ar": "اتصال ساعة Galaxy Watch"
  },
  "Associer la montre au téléphone": {
    "en": "Pair the watch with your phone",
    "ar": "ربط الساعة بالهاتف"
  },
  "Vérifiez sa connexion dans l'application Samsung Galaxy Wearable.": {
    "en": "Check its connection in the Samsung Galaxy Wearable app.",
    "ar": "تحقق من اتصالها في تطبيق Samsung Galaxy Wearable."
  },
  "Ouvrir PEMESA sur Android": {
    "en": "Open PEMESA on Android",
    "ar": "افتح PEMESA على أندرويد"
  },
  "Connectez-vous au même compte et accordez les permissions nécessaires.": {
    "en": "Sign in to the same account and grant the required permissions.",
    "ar": "سجّل الدخول بالحساب نفسه وامنح الأذونات المطلوبة."
  },
  "Valider le code à 6 chiffres": {
    "en": "Enter the 6-digit code",
    "ar": "أدخل الرمز المكوّن من 6 أرقام"
  },
  "Dans l'application, entrez le code temporaire créé ici.": {
    "en": "In the app, enter the temporary code created here.",
    "ar": "أدخل في التطبيق الرمز المؤقت الذي تم إنشاؤه هنا."
  },
  "Vérifier le retour de la montre": {
    "en": "Check watch status",
    "ar": "تحقق من حالة الساعة"
  },
  "Son état s'affiche ici après synchronisation.": {
    "en": "Its status will appear here after synchronization.",
    "ar": "ستظهر حالتها هنا بعد المزامنة."
  },
  "APPLICATION NÉCESSAIRE": {
    "en": "APP REQUIRED",
    "ar": "التطبيق مطلوب"
  },
  "Connecteur mobile requis": {
    "en": "Mobile connector required",
    "ar": "يلزم موصل للهاتف"
  },
  "Les écrans, la base sécurisée et les commandes sont prêts. Le connecteur de l'application Android/Wear OS doit encore être relié à cette API pour lire les capteurs et exécuter les commandes.": {
    "en": "The dashboard, secure database, and commands are ready. The Android/Wear OS app connector must still be integrated with this API to read sensors and execute commands.",
    "ar": "لوحة التحكم وقاعدة البيانات الآمنة والأوامر جاهزة. لا يزال يتعين ربط تطبيق أندرويد وWear OS بواجهة البرمجة لقراءة المستشعرات وتنفيذ الأوامر."
  },
  "Code copié.": {
    "en": "Code copied.",
    "ar": "تم نسخ الرمز."
  },
  "Association annulée.": {
    "en": "Pairing cancelled.",
    "ar": "تم إلغاء الربط."
  },
  "Montre dissociée du compte.": {
    "en": "Watch removed from account.",
    "ar": "تم إلغاء ربط الساعة بالحساب."
  },
  "État actualisé.": {
    "en": "Status refreshed.",
    "ar": "تم تحديث الحالة."
  },
  "Autorisations de collecte enregistrées.": {
    "en": "Collection permissions saved.",
    "ar": "تم حفظ أذونات الجمع."
  },
  "Autorisation retirée. Demande d’arrêt transmise, en attente de confirmation.": {
    "en": "Permission withdrawn. Stop request sent; awaiting confirmation.",
    "ar": "تم سحب الإذن وإرسال طلب الإيقاف، بانتظار التأكيد."
  },
  "Commande enregistrée. Attente de confirmation par l’application mobile.": {
    "en": "Command queued. Awaiting confirmation from the mobile app.",
    "ar": "تم تسجيل الأمر. بانتظار تأكيد تطبيق الهاتف."
  },
  "Code créé. Saisissez-le dans l’application Android PEMESA connectée au même compte.": {
    "en": "Code created. Enter it in the Android PEMESA app signed into the same account.",
    "ar": "تم إنشاء الرمز. أدخله في تطبيق PEMESA على أندرويد المتصل بالحساب نفسه."
  },
  "Sélectionnez au moins une catégorie de données.": {
    "en": "Select at least one data category.",
    "ar": "حدد فئة بيانات واحدة على الأقل."
  },
  "Autorisez la collecte et vérifiez que la montre est en ligne.": {
    "en": "Allow collection and make sure the watch is online.",
    "ar": "اسمح بجمع البيانات وتأكد من اتصال الساعة."
  },
  "La collecte doit être active et la montre en ligne.": {
    "en": "Collection must be active and the watch online.",
    "ar": "يجب أن يكون جمع البيانات نشطًا والساعة متصلة."
  }
});
  Object.assign(entries, {
  "RECHERCHE SUR LES CONDITIONS DE TRAVAIL": {
    "en": "WORKING CONDITIONS RESEARCH",
    "ar": "بحث ظروف العمل"
  },
  "SCROLL TO EXPLORE ↓": {
    "en": "SCROLL TO EXPLORE ↓",
    "ar": "مرّر للاستكشاف ↓"
  },
  "PEMESA / EXPLORATION": {
    "en": "PEMESA / EXPLORATION",
    "ar": "PEMESA / استكشاف"
  }
});
  Object.assign(entries, {
  "EXPLORER / PEMESA": {
    "en": "EXPLORE / PEMESA",
    "ar": "استكشاف / بيميسا"
  },
  "OBSERVATION & RECHERCHE": {
    "en": "OBSERVATION & RESEARCH",
    "ar": "الملاحظة والبحث"
  },
  "DONNÉES & ACTIVITÉS": {
    "en": "DATA & ACTIVITIES",
    "ar": "البيانات والأنشطة"
  },
  "VISUALISATION & COMPRÉHENSION": {
    "en": "VISUALIZATION & INSIGHT",
    "ar": "التصور والفهم"
  },
  "Comprendre la pénibilité au travail.": {
    "en": "Understanding workplace strain.",
    "ar": "فهم مشقة العمل."
  },
  "Éclairer les conditions de travail.": {
    "en": "Making working conditions clearer.",
    "ar": "توضيح ظروف العمل."
  },
  "PEMESA étudie les liens entre l’environnement, les activités professionnelles et le ressenti des soignants. Découvrez un espace de suivi et de visualisation.": {
    "en": "PEMESA studies links between the environment, professional activities and care workers’ experiences. Discover a space for monitoring and visualization.",
    "ar": "يدرس بيميسا العلاقة بين بيئة العمل والأنشطة المهنية وتجارب العاملين في الرعاية الصحية. اكتشف مساحة للمتابعة والتصور."
  },
  "Créer mon espace": {
    "en": "Create my account",
    "ar": "إنشاء حسابي"
  },
  "Explorer la démo": {
    "en": "Explore the demo",
    "ar": "استكشاف العرض التجريبي"
  },
  "Prototype de recherche · Mesures de démonstration": {
    "en": "Research prototype · Demonstration measurements",
    "ar": "نموذج بحثي أولي · قياسات توضيحية"
  },
  "Observer les activités.": {
    "en": "Observe activities.",
    "ar": "مراقبة الأنشطة."
  },
  "Comprendre les mouvements.": {
    "en": "Understand movement.",
    "ar": "فهم الحركات."
  },
  "Croiser les observations issues du terrain avec les activités physiques et les données recueillies, dans le cadre du projet de recherche.": {
    "en": "Connect field observations with physical activity and recorded data as part of the research project.",
    "ar": "الربط بين الملاحظات الميدانية والنشاط البدني والبيانات المسجلة في إطار المشروع البحثي."
  },
  "Découvrir les fonctionnalités": {
    "en": "Explore features",
    "ar": "اكتشف الميزات"
  },
  "Transformer les données en perspectives.": {
    "en": "Turn data into insights.",
    "ar": "تحويل البيانات إلى رؤى."
  },
  "Visualiser les tendances, contextualiser les postes et mieux comprendre les conditions de travail grâce à une interface claire.": {
    "en": "Visualize trends, put shifts into context and understand working conditions through a clear interface.",
    "ar": "تصور الاتجاهات وفهم سياق المناوبات وظروف العمل عبر واجهة واضحة."
  },
  "Voir la démonstration": {
    "en": "See the demo",
    "ar": "عرض النسخة التجريبية"
  },
  "OUVRIR LA DÉMONSTRATION": {
    "en": "OPEN THE DEMO",
    "ar": "افتح العرض التجريبي"
  },
  "DÉFILER POUR EXPLORER": {
    "en": "SCROLL TO EXPLORE",
    "ar": "مرّر للاستكشاف"
  },
  "DÉFILEMENT": {
    "en": "SCROLL",
    "ar": "التمرير"
  },
  "IMAGES DE LA SÉQUENCE": {
    "en": "SEQUENCE IMAGES",
    "ar": "صور التسلسل"
  },
  "Chargement de la séquence": {
    "en": "Loading sequence",
    "ar": "جارٍ تحميل التسلسل"
  },
  "Continuer sans attendre": {
    "en": "Continue without waiting",
    "ar": "المتابعة دون انتظار"
  },
  "Aperçu conceptuel · Aucune mesure en temps réel": {
    "en": "Concept preview · No real-time measurements",
    "ar": "عرض تصوري · لا توجد قياسات فورية"
  }
});
  Object.assign(entries, {
  "Transformer les données": {
    "en": "Turn data",
    "ar": "تحويل البيانات"
  },
  "en perspectives.": {
    "en": "into insights.",
    "ar": "إلى رؤى."
  },
  "en perspectives": {
    "en": "into insights",
    "ar": "إلى رؤى"
  },
  "Introduction à PEMESA": {
    "en": "Introducing PEMESA",
    "ar": "مقدمة عن بيميسا"
  },
  "Activités et mouvements": {
    "en": "Activities and movement",
    "ar": "الأنشطة والحركات"
  },
  "Visualisation des observations": {
    "en": "Visualizing observations",
    "ar": "تصور الملاحظات"
  },
  "Découvrir PEMESA au défilement": {
    "en": "Explore PEMESA as you scroll",
    "ar": "استكشف بيميسا أثناء التمرير"
  }
});
  const localeTags={fr:'fr-FR',en:'en-GB',ar:'ar'};
  const supported=['fr','en','ar'];
  const storageKey='pemesa.language';
  let current='fr';
  try { const stored=localStorage.getItem(storageKey); if(supported.includes(stored)) current=stored; } catch (_) {}
  const originals=new WeakMap();
  const attributeOriginals=new WeakMap();
  const ordered=Object.keys(entries).sort((a,b)=>b.length-a.length);
  const ignored=['SCRIPT','STYLE','TEXTAREA','CODE','PRE','OPTION'];
  function translation(source){
    if(current==='fr'||!source||!source.trim()) return source;
    const exact=entries[source.trim()];
    if(exact) return source.replace(source.trim(),exact[current]);
    let result=source;
    for(const from of ordered) {
      if(from.length<=3) continue;
      if(result.includes(from)) result=result.split(from).join(entries[from][current]);
    }
    if(current!=='fr') result=result.replace(/\bau\b/g,current==='en'?'to':'إلى');
    return result;
  }
  function localizeText(node){
    if(!node.parentElement||ignored.includes(node.parentElement.tagName)||node.parentElement.closest('[data-i18n-ignore]'))return;
    if(!originals.has(node))originals.set(node,node.nodeValue);
    const origin=originals.get(node);
    const next=translation(origin);
    if(node.nodeValue!==next)node.nodeValue=next;
  }
  function localizeAttrs(el){
    if(el.closest('[data-i18n-ignore]'))return;
    const attrs=['aria-label','title','placeholder','alt'];
    let cache=attributeOriginals.get(el);
    if(!cache){cache={};attributeOriginals.set(el,cache);}
    for(const name of attrs) {
      if(!el.hasAttribute(name))continue;
      if(!(name in cache))cache[name]=el.getAttribute(name);
      const next=translation(cache[name]);
      if(el.getAttribute(name)!==next)el.setAttribute(name,next);
    }
  }
  function apply(){
    document.documentElement.lang=current;
    document.documentElement.dir=current==='ar'?'rtl':'ltr';
    document.body?.classList.toggle('is-rtl',current==='ar');
    document.querySelectorAll('[data-language-select]').forEach(el=>{el.value=current;});
    document.querySelectorAll('body *').forEach(el=>{
      localizeAttrs(el);
      for(const node of el.childNodes) if(node.nodeType===Node.TEXT_NODE)localizeText(node);
    });
    if(document.body?.dataset.page==='profile') {
      document.title=current==='fr'?'Djalal Bouchekif — Développement du site PEMESA':
        current==='en'?'Djalal Bouchekif — PEMESA website development':
        'جلال بوشكيف — تطوير موقع بيميسا';
    } else {
      document.title=current==='fr'?'PEMESA — Étudier la pénibilité au travail':
        current==='en'?'PEMESA — Understanding workplace strain':
        'بيميسا — فهم مشقة العمل';
    }
  }
  function setLanguage(language){
    if(!supported.includes(language))return;
    current=language;
    try { localStorage.setItem(storageKey,language); } catch (_) {}
    if(typeof api.onChange==='function')api.onChange();
    apply();
  }
  const api={apply,setLanguage,dateLocale:()=>localeTags[current],get language(){return current;},onChange:null};
  window.PEMESA_I18N=api;
  document.addEventListener('change',e=>{
    if(e.target.matches('[data-language-select]'))setLanguage(e.target.value);
  });
  apply();
})();
