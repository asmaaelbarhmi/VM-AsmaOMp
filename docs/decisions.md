# Journal des décisions

Ce fichier garde la trace des choix importants faits sur le projet, pour s'en souvenir plus tard et ne pas les remettre en question sans raison.

## Comment ajouter une décision

Copiez le modèle ci-dessous pour chaque nouvelle décision, en commençant par la plus récente en haut.

## Modèle

### AAAA-MM-JJ · Titre court de la décision

- **Contexte** : la situation ou le problème qui a amené à décider.
- **Décision** : ce qui a été choisi, en une phrase claire.
- **Alternatives écartées** : les autres options envisagées et pourquoi elles n'ont pas été retenues.
- **Conséquences** : ce que cela change concrètement dans le site ou l'organisation.

## Décisions

Ajoutez ici les décisions, de la plus récente à la plus ancienne (par exemple : site statique sans outil de build, nom de marque neutre « Atelier », prix indicatifs à valider par l'atelier).

### 2026-10-12 · Direction visuelle « la table du patronnier »

- **Contexte** : le premier habillage (fond crème, titres en serif Cormorant, accent bronze, libellés en majuscules, flèches sur les liens) correspondait trait pour trait aux réflexes de sites générés par IA listés par la skill frontend-design. Il ne disait rien de spécifique sur l'atelier.
- **Décision** : ancrer le design dans l'objet du métier, la fiche technique. Fond papier à patron (`#F1F2EE`) avec feuilles blanches, encre `#1A1C22`, indigo de teinture `#1E2F7A` pour la marque et les actions, fil rouge `#C8372D` réservé aux lignes de cotes, craie pour les traits. Une seule famille de caractères, Archivo, étroite et grasse pour les titres, normale pour le texte. Un seul élément fort : le croquis du t-shirt coté avec les mesures réelles du catalogue, qui se dessine une fois au chargement.
- **Alternatives écartées** : garder le style boutique (serif + crème) jugé interchangeable ; une page sombre avec un seul accent vif, autre réflexe générique ; une mise en page « journal » à filets fins, trop proche d'un troisième réflexe listé.
- **Conséquences** : `assets/site.css` est réécrit, la page studio hérite des nouvelles couleurs et polices via les mêmes variables mais n'a pas été redessinée. Les variables `--bronze`, `--serif`, `--sans` sont conservées comme alias pour ne rien casser.
