# CSV Digester

Permet de crypter et décrypter des colonnes spécifiques d'un fichier CSV ou TXT.

Lors du traitement, la conformité de la valeur des champs est vérifiée selon une spécification de format simple.
Il n'y a pas de vérification fonctionnelle de la validité des champs (ex : pas de vérification de validité comptable).

Le séparateur est détecté automatiquement parmi les caractères <TAB> (tabulation), "|" ou ";".
Les retours à la ligne acceptés sont <CR> ou <LF> ou une combinaison des deux.
L'encodage des caractères est UTF-8.

Cette application s'exécute dans un navigateur, sans traitement serveur.
L'application est hébergée sur un espace statique (serveur de fichiers sans traitement de données serveur).
Une fois chargée, elle peut fonctionner hors ligne.
Le seul accès à l'hébergement statique au démarrage permet de vérifier une éventuelle mise à jour de l'application.

Toutes les données intégrées par l'application restent sur le poste de l'utilisateur.
Aucune donnée n'est envoyée sur Internet ni sur aucun autre réseau.

Le code source est auditable.

Cette application est mise à disposition gratuitement.
L'auteur ne peut être tenu responsable d'une mauvaise utilisation par un utilisateur ni des conséquences.
L'utilisateur reconnait qu'il est de sa responsabilité de vérifier le contenu des fichiers traités avant tout utilisation.
